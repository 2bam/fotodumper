
GLOBAL.log = log
module.exports.downloadImage = downloadImage;

function log() {
    return;  //fucking visual studio integration that gets an access violation...
    for (var i = 0; i < arguments.length; i++)
        console.log(arguments[i]);
}

function downloadImage(url, filename, callback) {
    request.head(url, function (err, res, body) {
        if(err )
        request(url).pipe(fs.createWriteStream(filename)).on('close', callback, "lolo");
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
    for (var i = 0; i < data.comments.length; i++) {
        var lc = {};
        var c = data.comments[i];
        lc.url = c.authorUrl;
        lc.usuario = c.author;
        lc.fecha = c.date;
        lc.mensaje = c.text;
    }
    return lolo_data;
}