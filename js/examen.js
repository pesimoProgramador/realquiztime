function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciarSesion()     
        } else {
            realtimeUtils.getUser(user)
            //realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
        }
    }, false);
}

function iniciarSesion() {
    realtimeUtils.authorize(function(response){
        realtimeUtils.getUser(user) 
        //realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
    }, true);
}

var usuario = {
    "correo" : "",
    "permissionId" : "",
    "color" : ""
}

function user(resp) {
    usuario.correo = resp.user.emailAddress
    usuario.permissionId = resp.user.permissionId
    
    realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
}

function agregarColaborador() {
    for (var i = 0; i < listaColores.length; i++) {
        var color =  listaColores.get(i)
        
        if (color.libre == true) {
            var existeUsuario = false
            
            for (var j = 0; j < listaColaboradores.length; j++) {
                var u = listaColaboradores.get(j)
                
                if (u.correo == usuario.correo) {
                    existeUsuario = true
                    usuario.color = u.color
                    break
                }
            }
            
            //usuario.color = color.color
            
            if (!existeUsuario) {
                usuario.color = color.color
                //NOTA: Al ser la lista de colores una lista colaborativa, no me deja cambiar 
                //los valores del json directamente (non-writable)
                var colorTemp = {
                    color : color.color,
                    libre : false
                }
                
                listaColores.set(i, colorTemp)
                
                listaColaboradores.push(usuario)
                console.log("user")
                console.log(usuario)
                break
            }
        }
    }
}

function onFileInitialize(model) {}

var listaPreguntas
var listaRespuestas
var listaGrupos
var listaColores
var listaColaboradores
var documento
var listaItemsTimeline = []
var listaTimeline = []

function onFileLoaded(doc) {
    documento = doc
    
    listaColores = cargarObjetoColaborativo(documento, 'listaColores')
    listaPreguntas = cargarObjetoColaborativo(documento, 'listaPreguntas')
    listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')
    listaColaboradores = cargarObjetoColaborativo(documento, 'listaColaboradores')
    listaCaracteres = cargarObjetoColaborativo(documento, 'listaCaracteres')
    stringExamenActivadoUnaVez = cargarObjetoColaborativo(documento, 'stringExamenActivadoUnaVez')
    agregarColaborador()
    lateralColaboradores()
    cargarColaboradoresLateralColaboradores()
    cargarProfesorLateralColaboradores(usuario)
    //console.log(listaPreguntas.length)
    var divExamen = document.getElementById("divExamen")
    var posNumCaracteres = 0
    for (var i = 1; i <= listaPreguntas.length; i++) {
        var div = document.createElement("div")
        divExamen.appendChild(div)
        cargarTextarea(listaPreguntas.get(i - 1), div, "Pregunta " + i)
        //if (stringExamenActivadoUnaVez == "1")
        for (var j = 0; j < listaGrupos.length; j++) {
            var miembros = listaGrupos.get(j).miembros
            var nombreGrupo = listaGrupos.get(j).nombreGrupo
            console.log(nombreGrupo)
            var listaRespuestasGrupo = cargarObjetoColaborativo(documento, nombreGrupo)
            //eventoRespuesta(listaRespuestasGrupo)
            cargarTextarea(listaRespuestasGrupo.get(i - 1), div, "Respuesta " + i + " - " + nombreGrupo)
            crearTimelines(nombreGrupo, i, div)
        }
    }

    eventos(documento)
}

function lateralColaboradores() {
    var aside = document.getElementById("block-region-side-pre")

    var divNavigation = document.createElement("div")
    divNavigation.setAttribute("class", "block_navigation block")

    var divHeader = document.createElement("div")
    divHeader.setAttribute("class", "header")

    var h2Titulo = document.createElement("h2")
    h2Titulo.innerHTML = "Colaboradores"

    var divContent = document.createElement("div")
    divContent.id = "divColaboradores"
    divContent.setAttribute("class", "content")

    divHeader.appendChild(h2Titulo)
    divNavigation.appendChild(divHeader)
    divNavigation.appendChild(divContent)

    aside.insertBefore(divNavigation,aside.childNodes[0])

    //profesores
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

function cargarColaboradoresLateralColaboradores() {
    var divProfesores = document.getElementById("divProfesores")
    console.log(profesores)
    for(var i = 0; i < profesores.length; i++) {
        var p = document.createElement("p")
        p.innerHTML = profesores[i].correo
        divProfesores.appendChild(p)
    }

    for (var i = 0; i < listaGrupos.length; i++) {
        var nombreGrupo = listaGrupos.get(i).nombreGrupo
        var miembros = listaGrupos.get(i).miembros
        var divGrupo = document.getElementById("div" + nombreGrupo)
        console.log("div" + nombreGrupo)
 
        for (var j = 0; j < miembros.length; j++) {
            var alumno = miembros[j]

            var p = document.createElement("p")
            p.innerHTML = alumno.correo
            divGrupo.appendChild(p)
        }
    }
}

function cargarProfesorLateralColaboradores(colaborador) {
    var divProfesores = document.getElementById("divProfesores")

    for (var i = 0; i < divProfesores.childNodes.length; i++) {
        var p = divProfesores.childNodes[i]
        //console.log(p)
        if (p.innerHTML == colaborador.correo) {
            console.log(colaborador.correo)
            console.log(colaborador.color)
            p.style.color = colaborador.color
        }
    }
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
}

function cargarTextarea (stringColaborativo, div, valor) {
    var h2 = document.createElement("h2")
    h2.innerHTML = valor
    var textarea = document.createElement("textarea")

    gapi.drive.realtime.databinding.bindString(stringColaborativo, textarea)

    div.appendChild(h2)
    div.appendChild(textarea)
}

//style="border-style:solid; height:100px; overflow-y:auto;"

function crearTimelines(nombreGrupo, i, div) {
    var divTimeline = document.createElement("div")
    divTimeline.id = "div" + nombreGrupo.replace(" ", "") + i
    div.appendChild (divTimeline)

    var items = new vis.DataSet()
    listaItemsTimeline.push(items)

    var options = {
        //rollingMode: true, //Da fallo, el timeline no se mueve automaticamente.
        start: new Date(),
        end: new Date(new Date().getTime() + 1000000)
    }

    // create a Timeline
    listaTimeline.push(new vis.Timeline(divTimeline, items, null, options))
}

// function getColaboradores() {
//     var colaboradores = documento.getCollaborators()

//     for (var i = 0; i < colaboradores.length; i++) {
//         crearParrafoColaborador(colaboradores[i])
//     }
// }

function crearParrafoColaborador(colaborador) {
    for (var i = 0; i < listaGrupos.length; i++) {
        var nombreGrupo = listaGrupos.get(i).nombreGrupo
        var miembros = listaGrupos.get(i).miembros

        for (var j = 0; j < listaGrupos.get(j).miembros.length; j++) {
            //if (colaborador.displayName == )
        }
    }
}

function eventos(documento) {
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, colaboradores)
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, colaboradores)
    listaPreguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, listaCambiadaPregunta)
    listaPreguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, listaCambiadaPregunta)

    //if (stringExamenActivadoUnaVez.getText() == "1") {
        for (var i = 0; i < listaGrupos.length; i++) {
            var nombreGrupo = listaGrupos.get(i).nombreGrupo
            var listaRespuestasGrupo = cargarObjetoColaborativo(documento, nombreGrupo)

            for (var j = 0; j < listaRespuestasGrupo.length; j++) {
                listaRespuestasGrupo.get(j).addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, respuestaCaracteres)
                listaRespuestasGrupo.get(j).addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, respuestaCaracteres)
            }
        }
    listaCaracteres.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, listaCambiadaCaracteres);
    //}
}

function colaboradores(evt) {
    console.log(evt)
    var esProfesor = false

    var colaborador
    
    for (var i = 0; i < listaColaboradores.length; i++) {
        colaborador = listaColaboradores.get(i)

        if (evt.collaborator.permissionId == colaborador.permissionId) {
            break
        }
    }
    console.log("colaborador")
    console.log(colaborador)
    for (var i = 0; i < profesores.length; i++) {
        if (profesores[i].correo == colaborador.correo) {
            esProfesor = true
            break
        }
    }

    if (evt.type == "collaborator_joined") {
        if (esProfesor) {
            var divProfesores = document.getElementById("divProfesores")

            for (var i = 0; i < divProfesores.childNodes.length; i++) {
                var p = divProfesores.childNodes[i]
                //console.log(p)
                if (p.innerHTML == colaborador.correo) {
                    // console.log(colaborador.correo)
                    // console.log(colaborador.color)
                    p.style.color = colaborador.color
                }
            }
        } else {
            var nombreGrupo
            var existeAlumno = false
            for (var i = 0; i < listaGrupos.length; i++) {
                nombreGrupo = listaGrupos.get(i).nombreGrupo
                var miembros = listaGrupos.get(i).miembros

                for (var j = 0; j < miembros.length; j++) {
                    var alumno = miembros[j]

                    if (alumno.correo == colaborador.correo) {
                        existeAlumno = true
                        break
                    }
                }

                if (existeAlumno) {
                    break
                }
            }

            console.log("nombreGrupo")
            console.log(nombreGrupo)

            var divGrupo = document.getElementById("div" + nombreGrupo)

            for (var i = 0; i < divGrupo.childNodes.length; i++) {
                var p = divGrupo.childNodes[i]
                //console.log(p)
                if (p.innerHTML == colaborador.correo) {
                    // console.log(colaborador.correo)
                    // console.log(colaborador.color)
                    p.style.color = colaborador.color
                }
            }
        }
    } else { //"collaborator_left"
        if (esProfesor) {
            var div = document.getElementById("divProfesores") 
        } else {
            var nombreGrupo
            var existeAlumno = false

            for (var i = 0; i < listaGrupos.length; i++) {
                nombreGrupo = listaGrupos.get(i).nombreGrupo
                var miembros = listaGrupos.get(i).miembros

                for (var j = 0; j < miembros.length; j++) {
                    var alumno = miembros[j]

                    if (alumno.correo == colaborador.correo) {
                        existeAlumno = true
                        break
                    }
                }

                if (existeAlumno) {
                    break
                }
            }

            var div = document.getElementById("div" + nombreGrupo)
        }

        for (var i = 0; i < div.childNodes.length; i++) {
            if (div.childNodes[i].innerHTML == colaborador.correo) {
                div.childNodes[i].style.color = "black"
                break
            }
        }
    }
}

function listaCambiadaCaracteres(evt) {
    console.log("listaCambiadaCaracteres")

    var caracter = evt.values[0]
    console.log(caracter)
    if (!evt.isLocal) {
        listaNumCaracteresEscritosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresEscritosPorAlumno' + caracter.correo)
        listaNumCaracteresBorradosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresBorradosPorAlumno' + caracter.correo)
        var numCaracteresEscritos = parseInt(listaNumCaracteresEscritosPorAlumno.get(caracter.posRespuesta).getText())
        var numCaracteresBorrados = parseInt(listaNumCaracteresBorradosPorAlumno.get(caracter.posRespuesta).getText())
        console.log("Escritos: " + numCaracteresEscritos)
        console.log("Borrados: " + numCaracteresBorrados)
        caracterTimeline(caracter, numCaracteresEscritos, numCaracteresBorrados)
    }
}

var idTimeline = 0

function caracterTimeline(caracter, numCaracteresEscritos, numCaracteresBorrados) {
    //Clase css para poner la letra mas pequeña y el color del alumno
    var cuadrado
    var p = document.createElement("p")
    p.innerHTML = caracter.texto
    p.style.color = caracter.color
    if (caracter.type == "text_inserted") {
        //cuadrado = "<p style='color'>" + caracter.texto + "<p>"
    } else {
        p.style.textDecoration = "line-through"
        //cuadrado = "<p>" + caracter.texto + "<p>"
    }

    listaItemsTimeline[caracter.posRespuesta].add({
        id: idTimeline,
        content: p,
        start: new Date().getTime()
    });

    idTimeline += 1
}

function respuestaCaracteres(evt) {
}

function listaCambiadaPregunta(evt) {
    var divExamen = document.getElementById("divExamen")
    console.log("evt.index " + evt.index)
    
    if (evt.type == "values_added") {
        var div = document.createElement("div")
        cargarTextarea(listaPreguntas.get(evt.index), div, "Pregunta " + (evt.index + 1))

        for (var i = 0; i < listaGrupos.length; i++) {
            var listaRespuestasGrupo = cargarObjetoColaborativo(documento, listaGrupos.get(i).nombreGrupo)
            cargarTextarea(listaRespuestasGrupo.get(evt.index), div, "Respuesta " + (evt.index + 1) + " - " + listaGrupos.get(i).nombreGrupo)
        }
        divExamen.appendChild(div)        
    } else {
        divExamen.removeChild(divExamen.lastChild)
    }
}