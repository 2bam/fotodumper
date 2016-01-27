var cheerio = require("cheerio")
var request = require("request");

function log() {
    return  //funcking visual studio integration
    for (var i = 0; i < arguments.length; i++)
        console.log(arguments[i]);
}

function findFirstPhotoID(url, onSuccess) {
    var ret;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);

            var lastTag;
            $('a.wall_img_container').each(function (i, elem) {
                log($(this))
                lastTag = $(this)
            })
            
			picUrl = String(lastTag.attr("href"));
            picID = picUrl.substring(picUrl.lastIndexOf('/', picUrl.length-2)+1, picUrl.length-1);
            console.log("last=", picUrl);
            console.log("pic ID=", picID);


            //$('#list_photos_mosaic').children().each(function (i, elem) {
            //    a = $(this).find("a");
            //    console.log(a.text());
            //})
        }
        else {
            log("Error:", url, error, response);
        }
    })
}

function findLastPage(url, onSuccess) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            
            var lastTag;
            $('div #pagination').children().filter("a").each(function (i, elem) {
                lastTag = $(this);
            })
            var lastUrl = lastTag.attr("href");
            log("Opening last url: " + lastUrl)
            onSuccess(lastUrl)
        }
        else {
            log("Error:", url, error, response);
        }
    })
}


findLastPage(baseUrl + "/mosaic", function(url){ findFirstPhotoID(url) })