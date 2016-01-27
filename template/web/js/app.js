/*
protolog v.1.0
"recuerdos inmortales"
lolo, mayo, 2015
http://armdz.com
*/
var current_foto = -100;
var json_data = "";

var div_comentario_header = "<div class='comentario'>";
var div_comentario_end = "</div>";

var div_otra_foto_header = "<div class='otra_foto_div'>";

function loadData()
{

	//	keys
	//	http://stackoverflow.com/a/6504984

	 $("body").keypress(function(e){
	 	
        if(e.which == 113)
        {
			foto_prev();
        }else if(e.which == 119)
        {	
        	foto_next();
        }
    });
	//

	var _id = getUrlVars()["id"];
	json_data =data_fotolog;

	$("#titulo_header").html(json_data["fotolog"]);

	if(isNaN(_id))
	{
		_id = 0;
	}
	if(_id < 0)
	{
		_id = 0;
	}else if(_id > json_data["fotos"].length-1)
	{
		_id = json_data["fotos"].length-1;
	}

	current_foto = Number(_id);

	showFoto(current_foto);

}

//http://stackoverflow.com/a/17606289
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function showFoto(id)
{


	var fotos = json_data["fotos"];

	var foto_path = "img/"+fotos[id]["imagen_nombre"];
	var comentarios = fotos[id]["comentarios"];


	$("#foto").attr('src', foto_path);

    $("#las_otras_fotos").empty();
    for(var i=-2;i<3;i++)
    {
    	var newindex = id+i;

    	if(newindex < 0){
  			var otra_foto_html = div_otra_foto_header;
		   	otra_foto_html+="</div>";
		   	$("#las_otras_fotos").append(otra_foto_html);
    	}else if(newindex < fotos.length){
		    var otra_foto_data = fotos[newindex];
		    if(otra_foto_data != undefined){
			   	var otra_foto_html = div_otra_foto_header;
			   	otra_foto_html+="<a onclick='showFoto(" + (id+i) + ")'><img class='img_otra' src='img/" + otra_foto_data["imagen_nombre"] + "'></a>";
			   	otra_foto_html+="</div>";
			   	$("#las_otras_fotos").append(otra_foto_html);
		    }
	    }
    }

    $("#foto_desc").empty();
    $("#foto_desc").append(decodeURIComponent(unescape(fotos[id]["descripcion"].replaceAll("\n", "<br />"))));

    $("#foto_fecha").empty();
    $("#foto_fecha").append(decodeURIComponent(unescape(fotos[id]["fecha"])));


    $("#foto_vistas").empty();
    $("#foto_vistas").append(decodeURIComponent(unescape(fotos[id]["vistas"])) + " vistas");


	$("#holder_comentarios").empty();


	for(var i=0;i<comentarios.length;i++)
	{
		var comentario = comentarios[i];
		var comentario_html = div_comentario_header;
		comentario_html+="<div class=\"topbar\"></div>";
		comentario_html+="<div class=\"comentario_header\">";
		comentario_html+="<div class='comentario_titulo'><b><a href=\"" + comentario["url"] + "\">" + decodeURIComponent(unescape(comentario["usuario"])) + "</a></b></div>";
		comentario_html+="<div class='comentario_fecha'>" + decodeURIComponent(unescape(comentario["fecha"])) + "</div>";
		comentario_html+="</div>";
		comentario_html += "<div class='comentario_mensaje'>" + decodeURIComponent(unescape(comentario["mensaje"])).replaceAll("\n", "<br />") + "<br /><br /></div>";
		comentario_html+=div_comentario_end;
		$("#holder_comentarios").append(comentario_html);
	}
	
}



function foto_next()
{	
	current_foto++;
	if(current_foto > json_data["fotos"].length-1)
	{
		current_foto = son_data["fotos"].length-1;
	}
	showFoto(current_foto);
}

function foto_prev()
{
	current_foto--;
	if(current_foto < 0)
	{
		current_foto = 0;
	}
	showFoto(current_foto);
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
