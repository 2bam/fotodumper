fs = require('node-fs-extra');
js = require('jsonfile');
utils = require('./utils.js');

module.exports.assembleProtolog = assembleProtolog;

if (require.main === module) {      //If called directly
    if (process.argv.length != 3) {
        console.log("USAGE: node fotoassemble.js fotolog_account_name");
        console.log("folder must already be downloaded via fotodump.js")
    }
    else
        assembleProtolog(process.argv[2]);
}

function assembleProtolog(username) {
    console.log("Assembling protolog at folder:", username, "...");

    const PATH_IMG = username + "/img/";
    const PATH_SINGLE_DATA = username + "/data/";
    fileList = fs.readdirSync(PATH_SINGLE_DATA).filter(function (x) { return /[0-9]+\.json/.test(x); });
    //fileList.sort();
    
    fs.copySync("template/", username + "/");

    ldata = {
        fotolog: username,
        fotos: []
    };
    
    for (i = 0; i < fileList.length; i++) {
        var json = js.readFileSync(PATH_SINGLE_DATA + fileList[i]);
        //console.log(json.date);
        ldata.fotos.push(utils.convertToLolos(json));
    }
    ldata.fotos.sort(function(a,b){ return a.index - b.index; })
    js.writeFileSync(username + "/web/js/fotolog_data.js", ldata);
    
    var json_var = "var data_fotolog = " + JSON.stringify(ldata) + ";";
    fs.writeFileSync(username + '/web/js/fotolog_data.js', json_var);

    console.log("Done (" + ldata.fotos.length + ")");
}


//if (foto_data["proxima"] != undefined/*&& output_data.length < 2*/) {
//    var salida_total = new Object();
//    salida_total["fotolog"] = fotolog;
//    salida_total["fotos"] = output_data;
    
//    var outputFilename = fotolog + "/data.json";
    
//    jf.writeFile(outputFilename, salida_total, function (err) {
//        if (err == null) {
//            fs.copy("template/", fotolog + "/", function (err) {
//                if (err) {
//                    console.log("error moving files");
//                } else {
//                    jf.readFile(fotolog + "/data.json", function (err, obj) {
//                        var json = obj;
//                        var total_fotos = obj["fotos"].length;
//                        var fotos = obj["fotos"];
                        
//                        var j_s = JSON.stringify(json);
//                        var variable_json = "var data_fotolog = " + j_s + ";";
                        
//                        fs.writeFile(fotolog + '/web/js/fotolog_data.js', variable_json, function (err) {
//                            if (err) return console.log(err);
//                            console.log("ALL DONE MAI SIR");
//                        });
//                    });
//                }
//            });
//        }
//    });
//    dump_foto(fotolog, foto_data["proxima"]);
//} else {
    
//    var salida_total = new Object();
//    salida_total["fotolog"] = fotolog;
//    salida_total["fotos"] = output_data;
    
//    var outputFilename = fotolog + "/data.json";
    
//    jf.writeFile(outputFilename, salida_total, function (err) {
//        if (err == null) {
//            fs.copy("template/", fotolog + "/", function (err) {
//                if (err) {
//                    console.log("error moving files");
//                } else {
//                    jf.readFile(fotolog + "/data.json", function (err, obj) {
//                        var json = obj;
//                        var total_fotos = obj["fotos"].length;
//                        var fotos = obj["fotos"];
                        
//                        var j_s = JSON.stringify(json);
//                        var variable_json = "var data_fotolog = " + j_s + ";";
                        
//                        fs.writeFile(fotolog + '/web/js/fotolog_data.js', variable_json, function (err) {
//                            if (err) return console.log(err);
//                            console.log("DONE (L) !");
//                        });
//                    });
//                }
//            });
//        }
//    });
//}
//});
//});