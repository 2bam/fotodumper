var utils = require('./utils.js');
var info = require('./info.js');
var js = require('jsonfile');
var fs = require('node-fs-extra')

opt = require('node-getopt').create([
    //['S' , 'short-with-arg=ARG'  , 'option with argument'],
    //['L' , 'long-with-arg=ARG'   , 'long option with argument'],
    //[''  , 'color[=COLOR]'       , 'COLOR is optional'],
    //['m' , 'multi-with-arg=ARG+' , 'multiple option with argument'],

    ['r' , 'retry=ARG'             , 'retry download times (default 10)']
    , ['f' , 'from=ARG'             , 'starts from a different pic id']
    , ['t' , 'timeout=ARG'             , 'seconds to timeout request (default 5)']
    //, ['a' , 'assemble'            , 'call assemble when finished],
    , ['h' , 'help'                , 'display this help']
    , ['v' , 'verbose'             , 'verbose output']
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
var RETRIES = 'retry' in opt.options ? parseInt(opt.options.retry) : 10;

var baseUrl = "http://fotolog.com/" + opt.argv[0];
var localUri = opt.argv[0];
var failed = [];

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
    console.log("Error:\n\t" + err.join("\n\t"));
}

var successCount = 0;

function processId(id, retry) {
    if (!retry) retry = 0;
    //TODO: check if url is already done or OVERRIDE
    var url = baseUrl + "/" + id;
    
    if(VERBOSE) console.log("\n******* Processing",url,retry ? " retry #" + retry : "")

    info.extractData(
          url
        , retry>=RETRIES        //last retry be more relaxed about no-comments
        , function (data) {
            if (!VERBOSE) process.stdout.write(".");
            successCount++;
            
            if (VERBOSE) console.log("Next ID:", data.nextID);

            if(data.nextID)
                processId(data.nextID);
            else
                console.log("FINISHED! Success=", successCount, " Fail=", failed.length)
            //console.log("DEBUG", data)
            //utils.downloadImage(data.image, "dump there...)
            
            //Add id
            data.id = id;
            //Remove non-useful temp data
            delete data.nextID;
            delete data.image;
           
            js.writeFile(PATH_SINGLE_DATA + id + ".json", data, function (err) {
                if (err) return console.error("Error writing file!", err);
            });


        }
        , function (err) {
            if (VERBOSE) printError(err);
            if (retry <= RETRIES) {
                processId(id, retry+1);     //Try once more...
            }
            else {
                console.warn("After #", RETRIES, "couldn't process ", id, "correctly @", url);
                failed.push(id)
            }
        });
}


//processId(32896085);
//processId(8008729);
console.log("\nSTARTING...")

if('from' in opt.options)
    processId(opt.options.from)
else {
    if (VERBOSE) console.log("Finding first ID...");
    info.findLastPage(baseUrl + "/mosaic", function (url) {
        info.findFirstPhotoID(url, function (id) {
            if (VERBOSE) console.log("Found first id: " + id + ".");
            processId(id);
        })
    })
}

//info.extractInfo("http://www.fotolog.com/nitram_cero2/8008729/");
//info.extractInfo("http://www.fotolog.com/nitram_cero2/32676842/");


