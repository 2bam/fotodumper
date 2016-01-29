utils = require('./utils.js');
info = require('./info.js');
js = require('jsonfile');
fs = require('node-fs-extra')
fotoassemble = require("./fotoassemble.js");

opt = require('node-getopt').create([
    //['S' , 'short-with-arg=ARG'  , 'option with argument']
    //['L' , 'long-with-arg=ARG'   , 'long option with argument']
    //[''  , 'color[=COLOR]'       , 'COLOR is optional']
    //['m' , 'multi-with-arg=ARG+' , 'multiple option with argument']

      ['r' , 'retry=ARG'             , 'retry download times (default 10)']
    , ['n' , 'no-comment-retry=ARG'  , "retry no-comments bug times before accepting there are none (default=3)"]
    , [''  , 'forget'                , "don't start from first found id"]
    , [''  , 'no-images'             , "don't download images"]
    , ['f' , 'from=ARG'              , 'starts from a different pic id']
    //, ['s' , 'skip-downloaded'       , 'skips photos already in data/ and img/']
    , ['x' , 'force-download'        , 'redownload even if pressent in data/ and img/']
    , ['t' , 'timeout=ARG'           , 'seconds to timeout request (default 5)']
    , ['d' , 'dont-assemble'         , 'do not assemble protolog when finished processing']
    , ['a' , 'adapt'                 , 'redownload first and last...']
    , ['h' , 'help'                  , 'display this help']
    , ['v' , 'verbose'               , 'verbose output']
    ])// create Getopt instance
    .bindHelp()// bind option 'help' to default action
    .setHelp(   
    "Usage: node fotodump.js [OPTION] <fotolog-username>\n" +
      "Fotolog account dumper v2.2\n" +
      "\n" +
      "[[OPTIONS]]\n" +
      "\n" +
      "Respository:  https://github.com/2bam/fotodumper"
    )
    .parseSystem(); // parse command line

if (opt.argv.length != 1) {
    console.error("Can only use one username per call. Use -h for more info.\nUsing: ", opt.argv);
    process.exit();
}

GLOBAL.VERBOSE = (opt.options.verbose?true:false);
GLOBAL.TIMEOUT = ('timeout' in opt.options ? parseInt(opt.options.timeout) : 5) * 1000;
const RETRIES = 'retry' in opt.options ? parseInt(opt.options.retry) : 10;
const NC_RETRIES = 'no-comment-retry' in opt.options ? parseInt(opt.options["no-comment-retry"]) : 3;
const SKIP = !opt.options["force-download"]; //opt.options["skip-downloaded"];
//if (VERBOSE) console.log({ timeout: GLOBAL.TIMEOUT, retry: RETRIES });

console.log(SKIP?"+Will skip correctly downloaded ones":"+Will download everything again")

var baseUrl = "http://fotolog.com/" + opt.argv[0];
var localUri = opt.argv[0];
var failed = {
    extracts: [],
    images: [],
    lastId: 0,          //unused
    lastIndex: 0,
    firstId: 0
};
var success = [];

const PATH_IMG = localUri + "/img/";
const PATH_SINGLE_DATA = localUri + "/data/";

//Create directories
fs.mkdirsSync(PATH_IMG, 0766);
fs.mkdirsSync(PATH_SINGLE_DATA, 0766);

if (VERBOSE) {
    console.info("Args:", opt);
    console.log("Base url:", baseUrl);
}


function printError(err) {
    if (VERBOSE)
        console.log("\nError (don't worry will retry):\n\t" + err.join("\n\t"));
    else
        process.stdout.write(err[0] == "Bogus comments section, no comments" ? 'n' : 'E');
}

GLOBAL.ACTIVE = 0;

function writeFailedFile() {
    js.writeFile(PATH_SINGLE_DATA + "failed.json", failed, function (err) {
        if (err) return console.error("Error writing failed data json file!", err);
    });
}

reindexed = null;
function reindexAll() {
    fileList = fs.readdirSync(PATH_SINGLE_DATA).filter(function (x) { return /[0-9]+\.json/.test(x); });
    
    if (fileList.length == 0) return;
    else console.log("Reindexing " + fileList.length + "...");
    
    var map = {}
    var list = []
    
    for (i = 0; i < fileList.length; i++) {
        var jpath = PATH_SINGLE_DATA + fileList[i];
        var json;
        try {
            json = js.readFileSync(jpath);
        } catch(e) {
            json = undefined;
        }
        if (json) {
            if (json.prevID == "archive") json.prevID = undefined;
            if (json.nextID == "archive") json.nextID = undefined;
            obj = { p: jpath, d: json, c: 0 };

            map[json.id] = obj;
            list.push(obj);
        }
    }
    for (j = 0; j < 2; j++) {
        for (i = 0; i < list.length; i++) {
            if (list[i].d.nextID && map[list[i].d.nextID]) {       //Backwards compatible
                map[list[i].d.nextID].d.prevID = list[i].d.id;
            }
            if (list[i].d.prevID && map[list[i].d.prevID]) {
                map[list[i].d.prevID].d.nextID = list[i].d.id;
            }
        }
    }
    //Sort by index
    //list.sort(function (a, b) { return a.d.index - b.d.index; })
    
    //
    //TODO: join orphan lists...
    //

    //find first and redo indexes
    var ni = 0;
    for (i = 0; i < list.length; i++) {
        it = list[i];
        if (!it.d.nextID) {
            while(it) {
                it.d.index = ni++;
                it.c++;

                it = map[it.d.prevID];
                if (it && it.c) {  //Already colored? Endless loop? fix it.
                    console.log("Reindex endless loop", it.d.nextID, "=>", it.d.prevID, it.c);
                    //map[it.d.nextID].d.prevID = undefined;
                    map[it.d.nextID].d = undefined;  //with errors, redownload
                    //it.d.prevID = undefined;
                    break;
                }
            }
            break;
        }
    }
    reindexed = list;
    
    //Save again
    for (i = 0; i < list.length; i++) {
        js.writeFileSync(list[i].p, list[i].d);
    }
}

function onFinished() {
    console.log("");
    writeFailedFile();

    console.log("+++++++FINISHED. Success = ", success.length, " Fail process =", failed.extracts.length, "+ Fail images =", failed.images.length);
    
    reindexAll();

    if (!opt.options['dont-assemble']) {
        fotoassemble.assembleProtolog(opt.argv[0]);
    }


}

function downloadImageOrRetry(id, url, local, retry) {
    if (opt.options["no-images"]) return;

    if (!retry) retry = 0;
    if (VERBOSE) console.log("\n******* Downloading image", id, url, retry ? " retry #" + retry : "");
    else if (retry) process.stdout.write(""+retry);

    utils.downloadImage(
        url
        , local
        , function () {
            if (VERBOSE) console.log("Downloaded image ", id, " from", url, " correctly");
            else process.stdout.write('i');
        }
        , function (err) {
            printError(err);
            //failed.lastIndex = index;

            if (retry <= RETRIES) {
                downloadImageOrRetry(id, url, local, retry + 1);     //Try once more...
            }
            else {
                console.warn("After #", RETRIES, "couldn't download image ", id, "correctly @", url);
                failed.images.push([id, url, local]);
                //onFinished(true, id, "Finished prematurely at ID=" + id);
            }
        });
}

function shouldAdapt(obj) {
    try {
        if (!obj.nextID || !obj.prevID) return true;
        //console.log("AAAA1", reindexed[reindexed.length - 1].d.id);
        //console.log("AAAA2", reindexed[reindexed.length - 2].d.id);
        //if (reindexed[reindexed.length - 1].d.id == obj.id) return true;
        //if (reindexed[reindexed.length - 2].d.id == obj.id) return true;
        //if (reindexed[1].d.id == obj.id) return true;
            
    }
    catch (e) {
        return true;
    }
}

function loopHelp(id) {
    console.log("ERROR: Endless loop found, please use 'node fotodump.js -x -f NUMBER' to force it to start from a different photo id number.");
    console.log("Offending id=", id);
    process.stdout.write("Came from ids= ");
    lastOk = success.slice(success.length - 5, success.length);

    for (i = 0; i < lastOk.length; i++) {
        process.stdout.write((i != 0?"->":"") + lastOk[i]);
    }
    process.stdout.write("\n");
}

function processId(id, index, retry) {
    if (!retry) retry = 0;
    if (!index) index = 0;
    
    if (success.indexOf(id) >= 0) {
        loopHelp(id);
        failed.extracts.push(id);
        return;
    }
     
    var idx = 0;
    while (SKIP && retry == 0 && fs.existsSync(PATH_IMG + id + ".jpg") && fs.statSync(PATH_IMG + id + ".jpg").size != 0 && fs.existsSync(PATH_SINGLE_DATA + id + ".json")) {
        try {
            skip = js.readFileSync(PATH_SINGLE_DATA + id + ".json");
        } catch (e) {
            skip = undefined;
        }
        
        if (!skip) break;   //on error in .json, redownload
        
        if (opt.options.adapt && shouldAdapt(skip)) break;     //redownlaod first and last
        
        if (skip.prevID == id || success.indexOf(id) >= 0) {
            loopHelp(id);
            failed.extracts.push(id);
            return;
        }
        
        //skip.index = idx++;
        //skip = js.writeFileSync(PATH_SINGLE_DATA + id + ".json");
        
        if (VERBOSE) console.log("Skipping " + id + " to next " + skip.prevID);
        else process.stdout.write("_");
        
        //console.log("X", id, skip.prevID, skip.nextID);
        
        success.push(id);

        if (!skip.prevID) {     //finished
            failed.lastId = 0;
            if (VERBOSE) console.log("No more to skip to...");
            return;
        }
        else {
            id = skip.prevID;
        }
    }
    
    failed.lastId = id;
    if (failed.lastIndex < index) {
        failed.lastIndex = index;
    }
    
        
    //TODO: check if url is already done or OVERRIDE
    var url = baseUrl + "/" + id;
    
    if (VERBOSE) console.log("\n******* Processing", url, retry ? " retry #" + retry : "");
    else if (retry) process.stdout.write("" + retry);

    info.extractData(
          id
        , url
        , retry>=NC_RETRIES        //last retry be more relaxed about no-comments
        , function (data) {
            if (!VERBOSE) process.stdout.write(".");
            success.push(id);
            
            if (VERBOSE) console.log("Next ID:", data.prevID);
            
            if (data.prevID)
                processId(data.prevID, index+1);
            else {
                //onFinished(false);
                if(VERBOSE) console.log("Finished processing normally");
            }
            //console.log("DEBUG", data)
            downloadImageOrRetry(id, data.image, PATH_IMG + id + ".jpg");
            
            //Add id
            data.id = id;
            data.index = index;
            //Remove non-useful temp data
            delete data.image;
           
            js.writeFile(PATH_SINGLE_DATA + id + ".json", data, function (err) {
                if (err) return console.error("Error writing json single-data file!", id, err);
            });
            

            writeFailedFile();

        }
        , function (err) {
            if (err[0] == "Bad pic id") {
                loopHelp(id);
                return;
            }

            printError(err);
            if (retry < RETRIES) {
                processId(id, index, retry+1);     //Try once more...
            }
            else {
                console.warn("After #", RETRIES, "couldn't process ", id, "correctly @", url);
                failed.extracts.push(id);
                onFinished(true, id, "Finished prematurely at ID="+id);
            }
            writeFailedFile();
        });
}


//processId(32896085);
//processId(8008729);
console.log("\nSTARTING...");

reindexAll();

try {
    temp = js.readFileSync(PATH_SINGLE_DATA + "failed.json");
    if (temp) {
        failed = temp
        failed.lastIndex++; //just in case add one forward to avoid redundancies when loading fail-handling data
    }
} catch (e) { }

    
if('from' in opt.options) {
    processId(opt.options.from, !opt.options.forget?failed.lastIndex:0);
}
else if (/*failed.lastId*/ failed.firstId && !opt.options.forget) {
    console.log("Resuming from first (recorded):"+failed.firstId)
    //processId(failed.lastId, failed.lastIndex);
    processId(failed.firstId, failed.lastIndex);
}
else {
    if (VERBOSE) console.log("Finding first ID...");
    info.findFirstPhotoID(baseUrl, function (id) {
        console.log("Found first id: " + id + ".");
        failed.firstId = id;
        writeFailedFile();
        processId(id);
    }, printError);
}

var _flagCheck = setInterval(function () {
    if (ACTIVE == 0) {
        clearInterval(_flagCheck);
        onFinished();
    }
}, 100); // interval set at 100 milliseconds

