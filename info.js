var cheerio = require("cheerio")
var request = require("request");


//TODO: guardar data en json por separado por imagen (para continuar luego)
//q si al 5to retry por falta de comments no hay, asumir no comments.


module.exports.findFirstPhotoID = findFirstPhotoID;
module.exports.findLastPage = findLastPage;
module.exports.extractData = extractData;

function replaceAll(what, from, to) {
    while (what.indexOf(from) != -1) {
        what = what.replace(from, to);
    }
    return what;
}

function textAfterTag(x) {
    return x.first().contents().filter(function () {
        return this.type === 'text';
    }).text();
}

function fixHTML(html) {
    var x = cheerio.load(html).root().text()
    return x;
}

//onSuccess(info object)
function extractData(url, lastTry, onSuccess, onError) {
    request({ url: url, timeout: TIMEOUT }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            
            var data = {}
            
            data.image = $('a.wall_img_container_big').find("img").attr("src");
            var nextPage = $('a.arrow_change_photo').not(".arrow_change_photo_right");
            if (nextPage.length) {
                nextPage = nextPage.attr("href");
                data.nextID = nextPage.split("/")[nextPage.split("/").length - 2];
            }
            else
                data.nextID = undefined;
            
            var has_title = $('div #description_photo').find("h1");
            if (has_title.length) data.title = has_title.first().text();
            else data.title = "";
            
            var descBody = $('div #description_photo').find("p");
            data.views = descBody.find("span.flog_block_views").find("b").text();
            
            var bodyHtml = descBody.html();
            data.description = fixHTML(bodyHtml.substring(0, bodyHtml.indexOf("<br class=\"clear\">")));
            
            
            var asd = '<br class="clear"><br class="clear"><br class="clear">\n';
            data.date = bodyHtml.substring(bodyHtml.indexOf(asd) + asd.length, bodyHtml.indexOf('<span class="flog_block_views float_right">'));
            
            //From lolo's code
            //var img_desc_raw = descBody.html();
            //var img_desc = img_desc_raw.substring(img_desc_raw.indexOf("</h1>") + 8, img_desc_raw.indexOf("flog_block_views float_right"));
            
            ////title ??
            //data.title = img_desc_raw.substring(img_desc_raw.indexOf("<h1>") + 4, img_desc_raw.indexOf("</h1>"));
            //data.date = img_desc.substring(img_desc.indexOf("<br class=\"clear\">") + ("<br class=\"clear\"><br class=\"clear\"><br class=\"clear\">").length + 1, img_desc.length - 14);
            
            //img_desc = img_desc.substring(0, img_desc.indexOf("<br class=\"clear\">"));
            //img_desc = replaceAll(img_desc, "<br>", "\n");
            //img_desc = replaceAll(img_desc, "<span style=\"font-style: italic;\">", "");
            //img_desc = replaceAll(img_desc, "<span style=\"font-style: bold;\">", "");
            //img_desc = replaceAll(img_desc, "</span>", "");  //  descripcion
            //data.description = img_desc;
            //
            
            
            data.comments = [];
            var commentDetect = 0;
            $('div.flog_img_comments').each(function (i, elem) {
                commentDetect++;
                if (i == 0) return; //Skip first ("log in to comment...")
                
                var tag = $(this).find("p");
                var author = tag.find("a");
                var comment = {}
                comment.author = author.text();
                comment.authorUrl = author.attr("href");
                
                var html = tag.html();
                var date_end = html.indexOf("<br>");
                comment.date = html.substring(html.indexOf("</b>") + 4, date_end);
                
                comment.text = fixHTML(html.substr(html.indexOf("<br><br>\n") + 9));
                
                data.comments.push(comment);
                //console.log(comment);
            })
            
            if (commentDetect <= 1 && !lastTry)       //TODO: Mark as bogus, reload!
                onError(["Bogus comments section, no comments", url, error, response]);
            else if (VERBOSE) {
                console.log(commentDetect + " comments saved");
                onSuccess(data)
            }

            //onSuccess(lastUrl)
        }
        else {
            onError(["Extract info", url, error, response]);
        }
    }) 
}

function findFirstPhotoID(url, onSuccess, onError) {
    var ret;
    request({ url: url, timeout: TIMEOUT }, function (error, response, body) {
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
            onSuccess(picID);

            //$('#list_photos_mosaic').children().each(function (i, elem) {
            //    a = $(this).find("a");
            //    console.log(a.text());
            //})
        }
        else {
            onError(["Find first photo ID", url, error, response]);
        }
    })
}

function findLastPage(url, onSuccess, onError) {
    request({ url: url, timeout: TIMEOUT }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            
            var lastTag;
            $('div #pagination').children().filter("a").each(function (i, elem) {
                lastTag = $(this);
            })
            var lastUrl = lastTag.attr("href");
            console.log("Opening last url: " + lastUrl)
            onSuccess(lastUrl)
        }
        else {
            onError(["Find last page", url, error, response]);
        }
    })
}

