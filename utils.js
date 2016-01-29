
request = require('request');
fs = require('node-fs-extra');

GLOBAL.log = log
module.exports.downloadImage = downloadImage;
module.exports.convertToLolos = convertToLolos;

function log() {
    return;  //fucking visual studio integration that gets an access violation...
    for (var i = 0; i < arguments.length; i++)
        console.log(arguments[i]);
}

function downloadImage(url, filename, onSuccess, onError) {
    ACTIVE++;
    req = request.head(url, function (error, response, body) {
        ACTIVE--;
        if (!error && response.statusCode == 200) {
            ACTIVE++;
            try {
                request(url).pipe(fs.createWriteStream(filename)).on('close', function () { ACTIVE--; onSuccess() });
            }
            catch (e) {
                ACTIVE--; 
                onError(["Downloading image (pipe to stream write)", url, error, response]);
            }
        }
        else
            onError(["Downloading image", url, error, response]);

    });
};

function convertToLolos(data) {
    var lolo_data = {};
    lolo_data.imagen_path = data.image;
    lolo_data.proxima = data.nextID;
    lolo_data.titulo = data.title;
    lolo_data.descripcion = data.description;
    lolo_data.fecha = data.date;
    lolo_data.vistas = data.views;
    lolo_data.imagen_nombre = data.id + ".jpg";
    lolo_data.comentarios = [];
    lolo_data.index = data.index;
    for (var i = 0; i < data.comments.length; i++) {
        var lc = {};
        var c = data.comments[i];
        lc.url = c.authorUrl;
        lc.usuario = c.author;
        lc.fecha = c.date;
        lc.mensaje = c.text;
        lolo_data.comentarios.push(lc);
    }
    return lolo_data;
}