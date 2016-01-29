request = require('request')
fs = require('node-fs-extra')
var working = false;

fs.mkdirs("oc");
var i = 0;

function check() {
    req = request({ url: "http://fotolog.com/baulera", timeout: 5000 }, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            if (body.indexOf("Sorry, Fotolog is over capacity") >= 0) {
                process.stdout.write("x");
                if (working)
                    console.log("\n", (new Date()).toLocaleString(), "NOT WORKING");

                working = false;

            }
            else {
                if (!working) {
                    console.log("\n", (new Date()).toLocaleString(), "WORKING");
                    fs.writeFileSync("oc/" + (i++) + ".html", body);
                }
                working = true;
            }
        }
        else {
            process.stdout.write("?");
            if (working)
                console.log("\n", (new Date()).toLocaleString(), "NOT WORKING");
           working = false;
        }
    });
}

console.log("\n", (new Date()).toLocaleString(), "Starting checks");

check();
            
var _flagCheck = setInterval(function () {
    check();
}, 60000);

