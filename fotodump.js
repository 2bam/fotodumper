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
    , ['' , 'forget'                 , "don't start from where we left"]
    , ['f' , 'from=ARG'              , 'starts from a different pic id']
    , ['s' , 'skip-downloaded'       , 'skips photos already in data/ or img/']
    , ['t' , 'timeout=ARG'           , 'seconds to timeout request (default 5)']
    , ['d' , 'dont-assemble'         , 'do not assemble protolog when finished processing']
    , ['h' , 'help'                  , 'display this help']
    , ['v' , 'verbose'               , 'verbose output']
    ])// create Getopt instance
    .bindHelp()// bind option 'help' to default action
    .setHelp(   
    "Usage: node fotodump.js [OPTION] <fotolog-username>\n" +
      "Fotolog account dumper v2\n" +
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
const SKIP = opt.options["skip-downloaded"];
//if (VERBOSE) console.log({ timeout: GLOBAL.TIMEOUT, retry: RETRIES });

var baseUrl = "http://fotolog.com/" + opt.argv[0];
var localUri = opt.argv[0];
var failed = {
    extracts: [],
    images: [],
    lastId: 0,
    lastIndex: 0
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
        process.stdout.write('E');
}

GLOBAL.ACTIVE = 0;

function writeFailedFile() {
    js.writeFile(PATH_SINGLE_DATA + "failed.json", failed, function (err) {
        if (err) return console.error("Error writing failed data json file!", err);
    });
}

function onFinished() {
    console.log("");
    writeFailedFile();

    console.log("+++++++FINISHED. Success = ", success.length, " Fail process =", failed.extracts.length, "+ Fail images =", failed.images.length);

    if (!opt.options['dont-assemble']) {
        fotoassemble.assembleProtolog(opt.argv[0]);
    }
}

function downloadImageOrRetry(id, url, local, retry) {
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

function processId(id, index, retry) {
    if (!retry) retry = 0;
    if (!index) index = 0;
    
    var idx = 0;
    while (SKIP && retry == 0 && fs.existsSync(PATH_IMG + id + ".jpg") && fs.existsSync(PATH_SINGLE_DATA + id + ".json")) {
        skip = js.readFileSync(PATH_SINGLE_DATA + id + ".json");
        
        skip.index = idx++;
        skip = js.writeFileSync(PATH_SINGLE_DATA + id + ".json");
        
        success.push(id);

        if (VERBOSE) console.log("Skipping " + id + " to next " + skip.nextID);
        else process.stdout.write("_");
        
        id = skip.nextID;
       
        if (!id) {
            if (VERBOSE) console.log("No more to skip to...");
            return;
        }
    }
    

    
    failed.lastId = id;     //just in case
    failed.lastIndex = index;

    //TODO: check if url is already done or OVERRIDE
    var url = baseUrl + "/" + id;
    
    if (VERBOSE) console.log("\n******* Processing", url, retry ? " retry #" + retry : "");
    else if (retry) process.stdout.write("" + retry);

    info.extractData(
          url
        , retry>=RETRIES        //last retry be more relaxed about no-comments
        , function (data) {
            if (!VERBOSE) process.stdout.write(".");
            success.push(id);
            
            if (VERBOSE) console.log("Next ID:", data.nextID);
            
            if (data.nextID)
                processId(data.nextID, index+1);
            else {
                //onFinished(false);
                if(VERBOSE) console.log("Finished processing normally");
                failed.lastId = 0;
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


        }
        , function (err) {
            printError(err);
            if (retry <= RETRIES) {
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

try {
    temp = js.readFileSync(PATH_SINGLE_DATA + "failed.json");
    if (temp) failed = temp
} catch (e) { }

    
if('from' in opt.options) {
    processId(opt.options.from);
}
else if (failed.lastId && !opt.options.forget) {
    console.log("Resuming from "+failed.lastId)
    processId(failed.lastId, failed.lastIndex);
}
else {
    if (VERBOSE) console.log("Finding first ID...");
    info.findLastPage(baseUrl + "/mosaic", function (url) {
        info.findFirstPhotoID(url, function (id) {
            if (VERBOSE) console.log("Found first id: " + id + ".");
            processId(id);
        }, printError)
    }, printError)
}

//info.extractInfo("http://www.fotolog.com/nitram_cero2/8008729/");
//info.extractInfo("http://www.fotolog.com/nitram_cero2/32676842/");


var _flagCheck = setInterval(function () {
    if (ACTIVE == 0) {
        clearInterval(_flagCheck);
        onFinished();
    }
}, 100); // interval set at 100 milliseconds

