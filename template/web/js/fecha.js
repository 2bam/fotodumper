/*
protolog v.1.0
"recuerdos inmortales"
lolo, mayo, 2015
http://armdz.com
*/

var div_mes_header = "<div class=\"fotos_holder\">";
var header_div_foto = "<div class=\"foto_div\">";


function loadData()
{

	json_data = data_fotolog;

	$("#titulo_header").html(json_data["fotolog"]);
	get_meses(0);

}

function	get_meses(index)
{
    //      "fecha": "el 24 mayo 2005",
    var SUBCOUNT = 100;
    var INTERVAL = 10;

	var fotos = json_data["fotos"];
	var current_mes = "";

	var current_anio = "";

	var current_content = "";
	var $datames = "";
	var temp_content = "";
	var coment_counter = 0;
	var vistas_counter = 0;

	for(var i=index, j=0; i<fotos.length && j<SUBCOUNT; i++, j++)
	{

        var foto_fecha = fotos[i]["fecha"];
        
        var foto_mes = foto_fecha.trim().split(" ")[2];
        if (parseInt(foto_mes)) foto_mes = foto_fecha.trim().split(" ")[1];        //En ingles: "On May 22 2010"
        current_anio = foto_fecha.trim().split(" ")[3];

		if(current_mes == "")
		{
			current_mes = foto_mes;
		}

		if(foto_mes != current_mes)
		{
			if(temp_content != ""){

				temp_content+="</div></div>";
				current_content+= div_mes_header;
				current_content+="<div id=\"mes\" class=\"mes_titulo\">" + current_mes + "/" +  current_anio + "</div>";
				current_content+="<div id=\"data_mes\" class=\"mes_titulo\">comentarios:"  + coment_counter +"</div>";
				current_content+="<div class=\"las_del_mes\">";
				current_content+=temp_content;
				temp_content="";
				coment_counter = 0;
				vistas_counter = 0;
				current_mes = foto_mes;
				
			}
		}
		
		var current_foto_div = header_div_foto;
		current_foto_div+="<a target=\"blank\" href=\"../index.html?id=" + i +"\"><img class=\"img_fecha\" src=\"../img/" + fotos[i]["imagen_nombre"] + "\"></a>";
		current_foto_div+="</div>";
		coment_counter+=Number(fotos[i]["comentarios"].length);
		vistas_counter+=Number(fotos[i]["vistas"]);
		temp_content+=current_foto_div;

		if(i == fotos.length-1)
		{
			//	ahhahahahahahahahhaha
			//	mostr shitty code ever
			temp_content+="</div></div>";
			current_content+= div_mes_header;
			current_content+="<div id=\"mes\" class=\"mes_titulo\">" + current_mes + "/" +  current_anio + "</div>";
			current_content+="<div id=\"data_mes\" class=\"mes_titulo\">comentarios:"  + coment_counter +"</div>";
			current_content+="<div class=\"las_del_mes\">";
			current_content+=temp_content;
			temp_content="";
			coment_counter = 0;
			vistas_counter = 0;
			current_mes = foto_mes;
			current_anio = foto_fecha.split(" ")[3];
		}

		
	}
	$("#fecha_contenido").append(current_content);

	if (i < fotos.length - 1) {
	    var str = "";
	    var pc = (index / SUBCOUNT / 2) % 3;
	    for (var j = 0; j <= pc; j++)
	        str += ".";
	    $("#puntos").html(str);
	    setTimeout(function () { get_meses(i); }, INTERVAL);
    }
	else {
	    $("#cargando").remove();
	}
}

/*
"<img src=\"" + fotos[i]["imagen_path"] + "\">";*/