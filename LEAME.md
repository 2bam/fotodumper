
# FOTODUMPER v2.3

Basado en fotodumper por @armdz

Descarga una cuenta entera de http://fotolog.com. Fotos, comentarios y datos extra. Guardado como json, listo para usar y visualizar.
TAMBIEN INCLUYE "protolog", un visualizador html muy simple parecido a fotolog.

Esta version intenta ser mas robusta contra los errores y discrepancias del servidor de fotolog (no te imaginás cuantas hay)
Puede continuar desde donde dejaste o falló. Los archivos son descargados en una carpeta llamada como la cuenta de fotolog, con todos los archivosd entro.
Se accede al protolog abriendo `index.html`

This version intends to be more robust against errors and server discrepancies (you wouldn't believe how many there are).
It can continue from where you left or failed. The downloaded files are in a folder thats is named as the fotolog account, with all the files inside.

# USO
`node fotodump.js usuario-fotolog`

Ejecutar varias veces si falla.

## Como hacer detallado

* [Descargar e instalar node.js (https://nodejs.org/)](https://nodejs.org/).
* [Descargar el archivo ZIP](https://github.com/2bam/fotodumper/archive/master.zip) de este programa ("Download ZIP" arriba a la derecha en https://github.com/2bam/fotodumper) y descomprimilo.
* _(En Windows)_ Click derecho manteniendo la tecla SHIFT dentro de la carpeta descomprimida y clickear "Abrir ventana de comandos aquí"
* Tipear este comando: `node fotodump.js usuario-fotolog`
usuario-fotolog es el nombre de usuario que obtenes del link a tu fotolog (http://www.fotolog.com/usuario-fotolog)

**(Recorda que las carpetas template y node_modules, SON NECESARIAS)**


# Uso extendido
Leer [READMORE.md](READMORE.md) (en inglés)

# AUTORES

http://armdz.com (Autor original)

http://2bam.com (Esta version)

## In memoriam: \_c\_bunny\_
