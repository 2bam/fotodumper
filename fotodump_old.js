var request = require("request");
var fs = require("node-fs-extra");
var jf = require('jsonfile')
var util = require('util')

const PATH_IMAGENES = "img/";

var output_data = [];
var fotolog = process.argv[2];
var id_foto = process.argv[3];

function find_last_photo() {
    "Last ›"
    var index = body.indexOf("<div id=\"wall_column_left\">");
}


dump_foto(fotolog,id_foto);

function dump_foto(fotolog,foto_id)
{
  var url = "http://www.fotolog.com/" + fotolog + "/" + foto_id;


  if(!fs.existsSync(fotolog)){
    fs.mkdirSync(fotolog, 0766, function(err){
      if(err){ 
      }
    });
    fs.mkdirSync(fotolog+"/"+PATH_IMAGENES,0766,null);
  }

  var full_path_imagenes = fotolog+"/"+PATH_IMAGENES;

  console.log("Obtengo = ",url)

  request(url, function(error, response, body) {

        var foto_data = new Object();

        //  MURO
        wall_data 
        
        $
    var wall_data_index = body.indexOf("<div id=\"wall_column_left\">");
    var wall_data_len = body.indexOf("<div id=\"share-plugin-holder\"");
    var wall_formated = body.substring(wall_data_index,wall_data_len);  //  la data que importa de cada foto
    //  PROXIMA

    var proxima_a_bajar = wall_formated.substring(wall_formated.indexOf("<a class=\"arrow_change_photo\" href=\""),wall_formated.indexOf("flog_img_holder"));
    proxima_a_bajar = proxima_a_bajar.substring(proxima_a_bajar.indexOf("href")+6,proxima_a_bajar.indexOf("#"));
    proxima_a_bajar = proxima_a_bajar.split("/")[proxima_a_bajar.split("/").length-2];
    foto_data["proxima"] = proxima_a_bajar;
   
    //  IMAGEN
    var img_path_index = wall_formated.indexOf("flog_img_holder");
    var img_path_len = wall_formated.indexOf("class=\"flog_flash_button button_visible\">");
    var img_path_raw = wall_formated.substring(img_path_index,img_path_len);
    img_path_raw = img_path_raw.replace(/(\r\n|\n|\r)/gm,"");
    var img_path_raw2 = img_path_raw.substring(img_path_raw.indexOf("<img alt="),6+img_path_raw.indexOf("_f.jpg"));
    var img_path_formated =  img_path_raw2.substring(5+img_path_raw2.indexOf("src=\"http://sp"),img_path_raw2.length); //image path
    foto_data["imagen_path"] = img_path_formated;

    //  DESCRIPCION
    var img_desc_index = wall_formated.indexOf("<div id=\"description_photo\"")+("<div id=\"description_photo\"").length;
    var img_desc_len = wall_formated.indexOf("wall_img_container_current");
    var img_desc_raw = wall_formated.substring(img_desc_index-3,img_desc_len);
    var img_title = img_desc_raw.substring(img_desc_raw.indexOf("<h1>")+4,img_desc_raw.indexOf("</h1>")); // titulo
    foto_data["titulo"] = img_title;
   
    var img_desc = img_desc_raw.substring(img_desc_raw.indexOf("</h1>")+8,img_desc_raw.indexOf("flog_block_views float_right"));
    var img_desc_bak = img_desc;
    img_desc = img_desc.substring(0,img_desc.indexOf("<br class=\"clear\">"));
    img_desc = borrar_todo(img_desc,"<br>","\n");
    img_desc = borrar_todo(img_desc,"<span style=\"font-style: italic;\">","");
    img_desc = borrar_todo(img_desc,"<span style=\"font-style: bold;\">","");
    img_desc = borrar_todo(img_desc,"</span>","");  //  descripcion
    foto_data["descripcion"] = img_desc;


    var img_desc_fecha = img_desc_bak.substring(img_desc_bak.indexOf("<br class=\"clear\">")+("<br class=\"clear\"><br class=\"clear\"><br class=\"clear\">").length+1,img_desc_bak.length-14);
    foto_data["fecha"] = img_desc_fecha;
    var img_vistas_raw = img_desc_raw.substring(img_desc_raw.indexOf("flog_block_views float_right"),img_desc_raw.indexOf("flog_block_views float_right")+40);
    var img_vistas = img_vistas_raw.substring(img_vistas_raw.indexOf("<b>")+3,img_vistas_raw.indexOf("</b>"));  // vistas
    foto_data["vistas"] = img_vistas;

    //  comentarios
    var comentarios_raw = wall_formated.substring(wall_formated.indexOf("class=\"flog_img_comments\""),wall_formated.length);
    var comentarios_raw_array = comentarios_raw.split("class=\"flog_img_comments\"");
    var comentarios = [];
    for(var i = 2;i<comentarios_raw_array.length;i++)
    {
      var comentario_data = new Object();
      var current_comentario = comentarios_raw_array[i];

      var fotolog_user_raw = current_comentario.substring(current_comentario.indexOf("<b>")+6,current_comentario.indexOf("</b>"));
      var fotolog_url = fotolog_user_raw.substring(6,fotolog_user_raw.indexOf("/\">"));
      var fotolog_user = fotolog_user_raw.substring(fotolog_user_raw.indexOf("/\">")+3,fotolog_user_raw.length-4);

      comentario_data["url"] = fotolog_url;
      comentario_data["usuario"] = fotolog_user;
      var comentario_fecha_length = current_comentario.indexOf("</b>")+18;
      comentario_data["fecha"] = current_comentario.substring(current_comentario.indexOf("</b>")+8,comentario_fecha_length);
      comentario_data["mensaje"] = current_comentario.substring(comentario_fecha_length+9,current_comentario.indexOf("</p>"));
      comentario_data["mensaje"] = borrar_todo(comentario_data["mensaje"],"<br>","\r");
      comentarios.push(comentario_data);
    }

    foto_data["comentarios"] = comentarios;


    console.log("Bajando imagen ... ",foto_data["imagen_path"]);
    var imagen_nombre = foto_data["imagen_path"].split("/")[foto_data["imagen_path"].split("/").length-1];
    foto_data["imagen_nombre"] = imagen_nombre;

    download_image(foto_data["imagen_path"], full_path_imagenes+imagen_nombre, function(){
      //  listo


      output_data.push(foto_data);

      if(foto_data["proxima"] != undefined/*&& output_data.length < 2*/)
      {
        var salida_total = new Object();
        salida_total["fotolog"] = fotolog;
        salida_total["fotos"] = output_data;
        
        var outputFilename = fotolog + "/data.json";

        jf.writeFile(outputFilename, salida_total, function(err) {
          if(err == null)
          {
            fs.copy("template/",fotolog +"/", function (err) {
              if (err) {
                console.log("error moving files");
              } else {
                jf.readFile(fotolog+"/data.json",function(err,obj){
                  var json = obj;
                  var total_fotos = obj["fotos"].length;
                  var fotos = obj["fotos"];

                  var j_s = JSON.stringify(json);
                  var variable_json = "var data_fotolog = " + j_s + ";";

                  fs.writeFile(fotolog + '/web/js/fotolog_data.js', variable_json, function (err) {
                  if (err) return console.log(err);
                    console.log("ALL DONE MAI SIR");
                  });
                });
              }
            });
          }
        });
        dump_foto(fotolog,foto_data["proxima"]);
      }else{
        
        var salida_total = new Object();
        salida_total["fotolog"] = fotolog;
        salida_total["fotos"] = output_data;
        
        var outputFilename = fotolog + "/data.json";

        jf.writeFile(outputFilename, salida_total, function(err) {
          if(err == null)
          {
            fs.copy("template/",fotolog +"/", function (err) {
              if (err) {
                console.log("error moving files");
              } else {
                jf.readFile(fotolog+"/data.json",function(err,obj){
                  var json = obj;
                  var total_fotos = obj["fotos"].length;
                  var fotos = obj["fotos"];

                  var j_s = JSON.stringify(json);
                  var variable_json = "var data_fotolog = " + j_s + ";";

                  fs.writeFile(fotolog + '/web/js/fotolog_data.js', variable_json, function (err) {
                  if (err) return console.log(err);
                    console.log("DONE (L) !");
                  });
                });
              }
            });
          }
        });
      }
    });
  });
}

function borrar_todo(de,que,por)
{
  while(de.indexOf(que) != -1)
  {
    de = de.replace(que,por);
  }
  return de;
}

var download_image = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
  
     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback,"lolo");
  
  });
};

