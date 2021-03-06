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
function extractData(id, url, succeedIfNoComments, onSuccess, onError) {
    ACTIVE++;
    req = request({ url: url, timeout: TIMEOUT }, function (error, response, body) {
        ACTIVE--;
        if (!error && response.statusCode == 200) {
            try {
                var $ = cheerio.load(body);
                
                //Assert the pic is actually the pic!
                metaUrl = $("meta[property='og:url']").attr("content");
                picID = metaUrl.substring(metaUrl.lastIndexOf('/', metaUrl.length - 2) + 1, metaUrl.length - 1);
                
                if (0) {
                    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXX");
                    nextPageBis = $('li').has('a.wall_img_container.wall_img_container_current[href*=' + id + ']');
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);
                    
                    nextPageBis = nextPageBis.next().children(":first-child");
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);
                    nextPageBis = nextPageBis.attr("href");
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);
                    nextPageBis = nextPageBis.split("/")[nextPageBis.split("/").length - 2];
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);
                    
                    console.log("YYYYYYYYYYYYYYYYYYYYYYY");
                    
                    nextPageBis = $('li').has('a.wall_img_container.wall_img_container_current');
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);
                    
                    nextPageBis = nextPageBis.next().children(":first-child");
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);
                    nextPageBis = nextPageBis.attr("href");
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);
                    nextPageBis = nextPageBis.split("/")[nextPageBis.split("/").length - 2];
                    if (VERBOSE) console.log("nextPageBis=" + nextPageBis);

                }

                if (picID != id) {
                    console.log("Picture id isn't what it's supposed to be intended:" + id + "vs downloaded: "+picID);
                    onError(["Bad pic id", url, error, response]);
                    
                    return;
                }
                
                var data = {}
                
                data.image = $('a.wall_img_container_big').find("img").attr("src");
                
                var nextPage = 0; nextPageBis = 0;
                try {
                    centerImage = $("div #flog_img_holder").children("a.wall_img_container_big").first();
			        nextPage = centerImage.attr("href");

                    /*var nextPage = $('a.arrow_change_photo.arrow_change_photo_right');
                    nextPage = nextPage.attr("href");*/
                    nextPage = nextPage.split("/")[nextPage.split("/").length - 2];
                    if(VERBOSE) console.log("nextPage   =" + nextPage);
                }
                catch (e) {
                }

                try {
                    nextPageBis = $('li').has('a.wall_img_container.wall_img_container_current[href*='+id+']');
                    nextPageBis = nextPageBis.next().children(":first-child");
                    nextPageBis = nextPageBis.attr("href");
                    nextPageBis = nextPageBis.split("/")[nextPageBis.split("/").length - 2];
                    if(VERBOSE) console.log("nextPageBis=" + nextPageBis);
                } catch (e) {
                }
                
                //if (nextPageBis && nextPageBis != nextPage) {
                //if (nextPageBis && nextPageBis < nextPage) {
                if (nextPageBis && nextPageBis != "archive") {      //nextPageBis has priority, sometimes is higher or lower, but if it exists, it's a better shot.
                     //HACK: Sometimes the arrow will throw you to the first photo (maybe a photo was erased between?)
                     //     But if there is a thumbnail below the pic, it might give us the correct solution (sometimes it fails thou)
                     //FIXME: maybe here's the key...
                     //Need to solve: http://www.fotolog.com/_c_bunny_/10468463/

                    if(nextPageBis != nextPage) {
                        if(VERBOSE) console.log("\nMismatched", "nextPage   =",nextPage, "nextPageBis=", nextPageBis);
                        else process.stdout.write("M("+nextPageBis+"/"+nextPage+")");
                    }
                    data.prevID = nextPageBis;
                }
                else if (nextPage) {
                    //console.log(nextPage)
                    //nextPage = nextPage.attr("href");
                    data.prevID = nextPage;
                }
                else
                    data.prevID = undefined;
                
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
                $('div.flog_img_comments').not('#comment_form').each(function (i, elem) {
                    //if (i == 0) return; //Skip first ("log in to comment...")
                    
                    commentDetect++;
                    
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

            }
            catch (e) {
                //Sometimes fotolog says THE USER DOESN'T EXIST (!"#$!#%)
                onError(["Error in exctraction, probably server's fault", url, error, response, e]);
                return;
            }
            if (commentDetect <= 0 && !succeedIfNoComments)       //TODO: Mark as bogus, reload!
                onError(["Bogus comments section, no comments", url, error, response]);
            else {
                if (VERBOSE) console.log("Data and " + commentDetect + " comments saved");
                onSuccess(data);
            }

            //onSuccess(lastUrl)
        }
        else {
            onError(["Extract info", url, error, response]);
        }
    })
}

function findFirstPhotoID(url, onSuccess, onError) {
    ACTIVE++;
    req = request({ url: url, timeout: TIMEOUT }, function (error, response, body) {
        ACTIVE--;
        if (!error && response.statusCode == 200) {
            try {
                
                var $ = cheerio.load(body);
                
                //<meta property="og:url" content="http://www.fotolog.com/fragilejunkie/33704135/">
                picUrl = $("meta[property='og:url']").attr("content");
                
                //centerImage = $("div #flog_img_holder");
                //centerImage=centerImage.children("a.wall_img_container_big").first();
			    //picUrl = centerImage.attr("href");


                picID = picUrl.substring(picUrl.lastIndexOf('/', picUrl.length-2)+1, picUrl.length-1);
                //console.log("last=", picUrl);
                //console.log("pic ID=", picID);
            }
            catch (e) {
                console.log("");
                console.log("Problem processing first page. It's probably blank.");
                console.log("Please use 'node fotodump.js USERNAME -f FIRST_PHOTO_NUMBER'");
                console.log("(If your first image EVER's link is: http://www.fotolog.com/USERNAME/12345, use 'node fotodump.js USERNAME -f 12345 '");
                onError(["Problem processing last page", url, error, response, e]);
                return;
            }
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
    ACTIVE++;
    req = request({ url: url, timeout: TIMEOUT }, function (error, response, body) {
        ACTIVE--;
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            
            try {
                var lastTag;
                $('div #pagination').children().filter("a").each(function (i, elem) {
                    lastTag = $(this);
                })
                var lastUrl = lastTag.attr("href");
                console.log("Opening last url: " + lastUrl);
            }
            catch (e) {     //Probably ONLY page
                onSuccess(url);
                return;
            }
            onSuccess(lastUrl);

        }
        else {
            onError(["Find last page", url, error, response]);
        }
    })
}

