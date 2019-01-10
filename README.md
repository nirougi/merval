# Merval

Merval es un proyecto que hice en un fin de semana como UI para poder definir de forma estructurada la información detallada de un producto.
También fue una excusa para aprender el framework [vue.js](https://vuejs.org) haciendo algo que me podía servir para el trabajo.

El proyecto es totalmente front end (prácticamente son dos archivos que hacen todo).

Como base de datos para guardar la información usé [Eve](http://docs.python-eve.org/en/latest/), que dispone un RESTful Web Service.
Merval va a pedir la configuración de la API para poder conectarse y lo guarda en local storage.

La parte más interesante del proyecto fue usar **vue.js** para tener tanto la vista de lectura como de edición en la misma pantalla. Esto hace que la edición sea muy rápida, y al permitir Markdown, bastante versátil al momento de redactar las definiciones del producto.
Para cambiar entre modos de lectura y edición se puede usar el alt derecho como shortcut.

![Video mostrando la interfaz](merval.gif)
