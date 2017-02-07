function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciarSesion()     
        } else {
            estadisticas()
            //mostrarActividades()
            //realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
        }
    }, false);
}

function iniciarSesion() {
    realtimeUtils.authorize(function(response){
        estadisticas()
        
        //mostrarActividades()
        //realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
    }, true);
}

function estadisticas() {
    console.log("estadisticas")
    recuperarDatosExamenes()
}

var datosEstadisticas = []

// var listaTotalPreguntas = []
// var listaTotalGrupos = []
// var listaTotalRespuestas = []
// var listaTotalCaracteres = []
// var listaTotalNumCaracteres = []

function recuperarDatosExamenes() {
    var idIntervalo = 0
    var i = 0
    idIntervalo = setInterval ( function() {
        if (i >= actividades.length) {
            console.log("intervalo: " + i)
            clearInterval(idIntervalo)
        } else {
            var idDocumento = actividades[i].id_documento
            var nombreExamen = actividades[i].name
            console.log(idDocumento)
            realtimeUtils.load(idDocumento, function(documento) {
                // console.log(idDocumento)
                var examen = {
                    "idDocumento" : idDocumento,
                    "nombreExamen" : nombreExamen,
                    "listaPreguntas": [],
                    "listaGrupos": []
                }

                guardarPreguntas(examen.listaPreguntas, documento)
                guardarDatosGrupos(examen.listaGrupos, documento)
                datosEstadisticas.push(examen)
                //documento.close()
                //De esta manera se que han creado todas los datos antes de mostrar las estadisticas.
                //El orden de los examenes por el momento no los controlo.

                console.log(datosEstadisticas.length + " " +  actividades.length)
                console.log(i)
                if (datosEstadisticas.length == actividades.length) {
                    console.log(datosEstadisticas)
                    mostrarEstadisticas(datosEstadisticas)
                }
                //documento.close()
            }, onFileInitialize)
            i++
        }
    }, 1000)
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
}

function onFileInitialize(modelo) {

}

function mostrarEstadisticas(datosEstadisticas) {
    var divEstadisticas = document.getElementById("divEstadisticas")

    for (var i = 0; i < datosEstadisticas.length; i++) {
        var datosExamen = datosEstadisticas[i]
        console.log(datosExamen)
        tituloEstadisticasExamen(divEstadisticas, datosExamen.nombreExamen)
        var listaGrupos = datosExamen.listaGrupos
        tituloEstadisticasAlumnos(divEstadisticas)
        var divAlumnos = document.createElement("div")
        divAlumnos.className = "divTableEstadisticas"
        //divAlumnos.style.overflowX = "scroll"
        var tableAlumnos = document.createElement("table")
        tableAlumnos.className = "tableEstadisticas"
        divAlumnos.appendChild(tableAlumnos)
        divEstadisticas.appendChild(divAlumnos)
        encabezadosRespuestas(tableAlumnos, datosExamen.listaPreguntas.length, "2", "2") // 2 = colspan
        encabezadosAlumnos(tableAlumnos, datosExamen.listaPreguntas.length)
        
        for (var j = 0; j < listaGrupos.length; j++) {
            var miembros = listaGrupos[j].miembros
            var nombreGrupo = listaGrupos[j].nombreGrupo

            for (var k = 0; k < miembros.length; k++) {
                var tr = document.createElement("tr")
                tableAlumnos.appendChild(tr)
                celdaNombreAlumnos(tr, miembros[k].correo)
                celdaNombreGrupo(tr, nombreGrupo)
                celdasNumCaracteresAlumnos(tr, miembros[k])
            }
        }

        tituloEstadisticasGrupo(divEstadisticas, nombreGrupo)
        var divGrupos = document.createElement("div")
        divGrupos.className = "divTableEstadisticas"
        //divGrupos.style.overflowX = "scroll"
        var tableGrupos = document.createElement("table")
        tableGrupos.className = "tableEstadisticas"
        divGrupos.appendChild(tableGrupos)
        divEstadisticas.appendChild(divGrupos)

        encabezadosRespuestas(tableGrupos, datosExamen.listaPreguntas.length, "1", "3")
        encabezadosGrupos(tableGrupos, datosExamen.listaPreguntas.length)
        for (var j = 0; j < listaGrupos.length; j++) {
            var miembros = listaGrupos[j].miembros
            var nombreGrupo = listaGrupos[j].nombreGrupo
            
            var tr = document.createElement("tr")
            tableGrupos.appendChild(tr)
            celdaNombreGrupo(tr, nombreGrupo)
            celdaNumCaracteresPalabrasGrupos(tr, miembros, listaGrupos[j].listaRespuestas)
        }
    }
}

function celdaNumCaracteresPalabrasGrupos(tr, miembros, respuestas) {
    var totalEscritosGrupo = 0
    var totalBorradosGrupo = 0
    var primerEspacio = "/^ /"
    var ultimoEspacio = "/ $/"
    var variosEspacios = "/[ ]+/g"
    var totalNumPalabras = 0

    for (var i = 0; i < respuestas.length; i++) {
        var escritosGrupo = 0
        var borradosGrupo = 0

        for (var j = 0; j < miembros.length; j++) {
            escritosGrupo += miembros[j].numCaracteresEscritos[i]
            borradosGrupo += miembros[j].numCaracteresBorrados[i]

            totalEscritosGrupo += escritosGrupo
            totalBorradosGrupo += borradosGrupo
        }

        var tdEscritos = document.createElement("td")
        tdEscritos.innerHTML = escritosGrupo
        tr.appendChild(tdEscritos)

        var tdBorrados = document.createElement("td")
        tdBorrados.innerHTML = borradosGrupo
        tr.appendChild(tdBorrados)

        var respuesta = respuestas[i]
        var numPalabras = 0
        if (respuesta != "") {
            respuesta = respuesta.replace(variosEspacios, " ");
            respuesta = respuesta.replace(primerEspacio, "");
            respuesta = respuesta.replace(ultimoEspacio, "");
            if (respuesta != "") {
                var palabras = respuesta.split(" ");
                numPalabras = palabras.length
                //console.log(numPalabras)
            }
        }
        totalNumPalabras += numPalabras
        var tdNumPalabras = document.createElement("td")
        tdNumPalabras.innerHTML = numPalabras
        tr.appendChild(tdNumPalabras)
    }

    var tdEscritos = document.createElement("td")
    tdEscritos.innerHTML = totalEscritosGrupo
    tr.appendChild(tdEscritos)

    var tdBorrados = document.createElement("td")
    tdBorrados.innerHTML = totalBorradosGrupo
    tr.appendChild(tdBorrados)

    var tdNumPalabras = document.createElement("td")
    tdNumPalabras.innerHTML = totalNumPalabras
    tr.appendChild(tdNumPalabras)
}

function encabezadosGrupos(table, numRespuestas) {
    var tr = document.createElement("tr")
    table.appendChild(tr)
    var thGrupo = document.createElement("th")
    thGrupo.className = "thEstadisticas"
    thGrupo.innerHTML = "Grupo"
    tr.appendChild(thGrupo)

    for (var i = 0; i < numRespuestas + 1; i++) {
        var thNumCaracteresEscritos = document.createElement("th")
        thNumCaracteresEscritos.className = "thEstadisticas"
        thNumCaracteresEscritos.innerHTML = "Caracteres escritos"
        tr.appendChild(thNumCaracteresEscritos)
        var thNumCaracteresBorrados = document.createElement("th")
        thNumCaracteresBorrados.className = "thEstadisticas"
        thNumCaracteresBorrados.innerHTML = "Caracteres borrados"
        tr.appendChild(thNumCaracteresBorrados)
        var thNumPalabras = document.createElement("th")
        thNumPalabras.className = "thEstadisticas"
        thNumPalabras.innerHTML = "Número de palabras"
        tr.appendChild(thNumPalabras)
    }
}

function tituloEstadisticasGrupo(div, nombreGrupo) {
    var h3 = document.createElement("h3")
    h3.innerHTML = "Estadísticas de grupos"
    div.appendChild(h3)
}

function celdasNumCaracteresAlumnos(tr, alumno) {
    var totalEscritos = 0
    var totalBorrados = 0

    for (var i = 0; i < alumno.numCaracteresEscritos.length; i++) {
        var escritos = alumno.numCaracteresEscritos[i]
        var borrados = alumno.numCaracteresBorrados[i]

        totalEscritos += escritos
        totalBorrados += borrados

        var tdEscritos = document.createElement("td")
        tdEscritos.innerHTML = escritos
        tr.appendChild(tdEscritos)

        var tdBorrados = document.createElement("td")
        tdBorrados.innerHTML = borrados
        tr.appendChild(tdBorrados)
    }

    var tdTotalEscritos = document.createElement("td")
    tdTotalEscritos.innerHTML = totalEscritos
    tr.appendChild(tdTotalEscritos)

    var tdTotalBorrados = document.createElement("td")
    tdTotalBorrados.innerHTML = totalBorrados
    tr.appendChild(tdTotalBorrados)

}

function celdaNombreGrupo(tr, nombreGrupo) {
    var td = document.createElement("td")
    td.innerHTML = nombreGrupo
    tr.appendChild(td)
}

function celdaNombreAlumnos(tr, correo) {
    var td = document.createElement("td")
    td.innerHTML = correo
    tr.appendChild(td)
}

function encabezadosAlumnos(table, numRespuestas) {
    var tr = document.createElement("tr")
    table.appendChild(tr)
    var thAlumno = document.createElement("th")
    thAlumno.className = "thEstadisticas"
    thAlumno.innerHTML = "Alumno"
    tr.appendChild(thAlumno)
    var thGrupo = document.createElement("th")
    thGrupo.className = "thEstadisticas"
    thGrupo.innerHTML = "Grupo"
    tr.appendChild(thGrupo)

    for (var i = 0; i < numRespuestas + 1; i++) {
        var thNumCaracteresEscritos = document.createElement("th")
        thNumCaracteresEscritos.className = "thEstadisticas"
        thNumCaracteresEscritos.innerHTML = "Caracteres escritos"
        var thNumCaracteresBorrados = document.createElement("th")
        thNumCaracteresBorrados.className = "thEstadisticas"
        thNumCaracteresBorrados.innerHTML = "Caracteres borrados"
        tr.appendChild(thNumCaracteresEscritos)
        tr.appendChild(thNumCaracteresBorrados)
    }
}

function encabezadosRespuestas(table, numRespuestas, colSpanCeldaVacia, colSpanRespuesta) {
    var tr = document.createElement("tr")
    table.appendChild(tr)
    var thSinNada = document.createElement("th")
    thSinNada.className = "thEstadisticas"
    thSinNada.colSpan = colSpanCeldaVacia
    tr.appendChild(thSinNada)
    for (var i = 0; i < numRespuestas; i++) {
        var thRespuesta = document.createElement("th")
        thRespuesta.innerHTML = "Respuesta " + (i + 1)
        thRespuesta.className = "thEstadisticas"
        thRespuesta.colSpan = colSpanRespuesta
        tr.appendChild(thRespuesta)
    }

    var thTotal = document.createElement("th")
    thTotal.innerHTML = "Total"
    thTotal.className = "thEstadisticas"
    thTotal.colSpan = colSpanRespuesta
    tr.appendChild(thTotal)
    
}

function tituloEstadisticasAlumnos(div) {
    var h3 = document.createElement("h3")
    h3.innerHTML = "Estadísticas de alumnos"
    div.appendChild(h3)
}

function tituloEstadisticasExamen(div, nombreExamen) {
    var h2 = document.createElement("h2")
    h2.innerHTML = "Estadísticas del examen - " + nombreExamen
    div.appendChild(h2)
}


function guardarNumCaracteres(idDocumento, documento) {
    var listaPreguntas = cargarObjetoColaborativo(documento, 'listaPreguntas')
    var listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')

    var numCaracteres = {
        "idDocumento" : idDocumento,
        "listaNumCaracteresRespuestasGrupo" : []
    }

    for (var i = 0; i < listaGrupos.length; i++) {
        var miembros = listaGrupos.get(i).miembros

        for (var j = 0; j < miembros.length; j++) {
            var correo = miembros[j].correo

            listaNumCaracteresEscritosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresEscritosPorAlumno' + correo)
            listaNumCaracteresBorradosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresBorradosPorAlumno' + correo)
            var numCaracteresPorAlumno = {
                "correo" : correo,
                "numCaracteresEscritos" : [],
                "numCaracteresBorrados" : []
            }

            for (var k = 0; k < listaPreguntas.length; k++) {
                numCaracteresPorAlumno.numCaracteresEscritos.push(parseInt(listaNumCaracteresEscritosPorAlumno.get(k).getText()))
                numCaracteresPorAlumno.numCaracteresBorrados.push(parseInt(listaNumCaracteresBorradosPorAlumno.get(k).getText()))
            }

            numCaracteres.listaNumCaracteresRespuestasGrupo.push(numCaracteresPorAlumno)
        }
    }

    listaTotalNumCaracteres.push(numCaracteres)
}

function guardarCaracteres(idDocumento, documento) {
    var listaCaracteres = cargarObjetoColaborativo(documento, 'listaCaracteres')

    var caracteres = {
        "idDocumento" : idDocumento,
        "listaCaracteres" : []
    }

    for (var i = 0; i < listaCaracteres.length; i++) {
        caracteres.listaCaracteres.push(listaCaracteres.get(i))
    }

    listaTotalCaracteres.push(caracteres)
}

function guardarDatosGrupos(lista, documento) {
    var listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')

    for (var i = 0; i < listaGrupos.length; i++) {
        var grupo = {
            "nombreGrupo": listaGrupos.get(i).nombreGrupo,
            "miembros": [],
            "listaRespuestas": []
        }
        var miembros = listaGrupos.get(i).miembros

        for (var j = 0; j < miembros.length; j++) {
            var alumno = {
                "nombre" : miembros[j].nombre,
                "apellidos" : miembros[j].apellidos,
                "correo" : miembros[j].correo,
                "numCaracteresEscritos": [],
                "numCaracteresBorrados": []
            }
            
            grupo.miembros.push(alumno)
        }

        guardarRespuestas(grupo, documento)
        guardarNumCaracteres(grupo, documento)
        
        lista.push(grupo)
    }
}

function guardarNumCaracteres(grupo, documento) {
    for (var i = 0; i < grupo.miembros.length; i++) {
        var alumno = grupo.miembros[i]
        listaNumCaracteresEscritosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresEscritosPorAlumno' + alumno.correo)
        listaNumCaracteresBorradosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresBorradosPorAlumno' + alumno.correo)

        for (var j = 0; j < listaNumCaracteresEscritosPorAlumno.length; j++) {
            alumno.numCaracteresEscritos.push(parseInt(listaNumCaracteresEscritosPorAlumno.get(j).getText()))
            alumno.numCaracteresBorrados.push(parseInt(listaNumCaracteresBorradosPorAlumno.get(j).getText()))
        }
    }
}

function guardarRespuestas(grupo, documento) {
    var lista = grupo.listaRespuestas
    var listaRespuestasGrupo = cargarObjetoColaborativo(documento, grupo.nombreGrupo)

    for (var i = 0; i < listaRespuestasGrupo.length; i++) {
        lista.push(listaRespuestasGrupo.get(i).getText())
    }
}

function guardarPreguntas(lista, documento) {
    var listaPreguntas = cargarObjetoColaborativo(documento, 'listaPreguntas')
    
    for (var i = 0; i < listaPreguntas.length; i++) {
        var pregunta = listaPreguntas.get(i).getText()
        console.log(pregunta)
        lista.push(pregunta)
    }
}

function lateralColaboradores() {
    var h3Titulo = document.createElement("h3")
    h3Titulo.innerHTML = "Profesores"
    var divProfesores = document.createElement("div")
    divProfesores.id = "divProfesores"

    divContent.appendChild(h3Titulo)
    divContent.appendChild(divProfesores)

    //alumnos
    for (var i = 0; i < listaGrupos.length; i++){
        var divGrupo = document.createElement("div")
        divGrupo.id = "div" + listaGrupos.get(i).nombreGrupo
        var h3Titulo = document.createElement("h3")
        h3Titulo.innerHTML = listaGrupos.get(i).nombreGrupo

        divContent.appendChild(h3Titulo)
        divContent.appendChild(divGrupo)
    }
}

function crearPanelLateral(titulo) {
    var aside = document.getElementById("block-region-side-pre")

    var divNavigation = document.createElement("div")
    divNavigation.setAttribute("class", "block_navigation block")

    var h2Titulo = document.createElement("h2")
    h2Titulo.innerHTML = titulo

    var divHeader = document.createElement("div")
    divHeader.setAttribute("class", "header")

    var divContent = document.createElement("div")
    divContent.id = "divContent"

    divHeader.appendChild(h2Titulo)
    divNavigation.appendChild(divHeader)
    divNavigation.appendChild(divContent)

    aside.insertBefore(divNavigation,aside.childNodes[0])
}

function cargarTituloActividadesPanelLateral() {
    var divContent = document.getElementById("divContent")

    for (var i = 0; i < actividades.length; i++) {
        var nombreExamen = actividades[i].name
        var segundos = actividades[i].timecreated

        var fecha = new Date(1970, 0, 1) //Importante la epoca
        fecha.setSeconds(segundos)

        var div = document.createElement("div")
        div.innerHTML = nombreExamen + "<br>" + fecha

        divContent.appendChild(div)
    }
}

function mostrarActividades () {
    console.log(actividades)
    crearPanelLateral("Examenes")
    cargarTituloActividadesPanelLateral ()
}

// function onFileInitialize(model) {}

// function onFileLoaded(doc) {
//     documento = doc
// }