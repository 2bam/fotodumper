var utils = require('./utils.js');
var info = require('./info.js');


opt = require('node-getopt').create([
    //['S' , 'short-with-arg=ARG'  , 'option with argument'],
    //['L' , 'long-with-arg=ARG'   , 'long option with argument'],
    //[''  , 'color[=COLOR]'       , 'COLOR is optional'],
    //['m' , 'multi-with-arg=ARG+' , 'multiple option with argument'],

      ['r' , 'retry=5'             , 'retry download times (default 5)'
    //, ['a' , 'assemble'            , 'call assemble when finished],
    , ['h' , 'help'                , 'display this help'],
    , ['v' , 'verbose'             , 'verbose output']
])// create Getopt instance
.bindHelp()// bind option 'help' to default action
.parseSystem(); // parse command line

if (opt.argv.length != 1) {
    console.error("Can only use one username per call. Using: ", opt.argv);
    opt.showHelp();
    process.exit();
}

GLOBAL.VERBOSE = (opt.options.verbose?true:false);
var RETRIES = parseInt(opt.options.retry);

var baseUrl = "http://fotolog.com/" + opt.argv[0];

if (VERBOSE) {
    console.info("Args:", opt);
    console.log("Base url:", baseUrl);
}



function printError(err) {
    console.log("Error: " + arr);
}


function process(id) {
    //check if url is already done or OVERRIDE
    var url = baseUrl + "/" + id;
    
    var retry = 1;
    
    if(VERBOSE) console.log("Processing",url," try #", retry)

    info.extractInfo(
        url
        , function (info) {
            console.log("DEBUG", info)
            //utils.downloadImage(info.image, "dump there...)
        }
        , function (err) {
            if (VERBOSE) printError(arr);
            if (retry <= RETRIES)
                process(id);
            })
}


//process(32896085);
process(8008729);
        

//info.findLastPage(baseUrl + "/mosaic", function (url) {
//    info.findFirstPhotoID(url, function (id) {
//        if (VERBOSE) console.log("Found first ID: " + id + ".");
//        process(id);
//    })
//})

//info.extractInfo("http://www.fotolog.com/nitram_cero2/8008729/");
//info.extractInfo("http://www.fotolog.com/nitram_cero2/32676842/");


