function habilitarDeshabilitarBotones(valor) {
    if (valor == true) {
        document.getElementById("buttonCrearPregunta").disabled = true
        document.getElementById("buttonBorrarPregunta").disabled = true
    } else {
        document.getElementById("buttonCrearPregunta").disabled = false
        document.getElementById("buttonBorrarPregunta").disabled = false
    }
    
}

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



function onFileInitialize(model) {

}

var documento
var modelo
var listaPreguntas
var listaGrupos
var listaColores
var listaColaboradores
var stringExamenActivadoUnaVez


function onFileLoaded(doc) {
    documento = doc
    modelo = documento.getModel()
    
    listaColores = cargarObjetoColaborativo(documento, 'listaColores')
    listaPreguntas = cargarObjetoColaborativo(documento, 'listaPreguntas')
    listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')
    listaColaboradores = cargarObjetoColaborativo(documento, 'listaColaboradores')
    listaCaracteres = cargarObjetoColaborativo(documento, 'listaCaracteres')
    stringExamenActivadoUnaVez = cargarObjetoColaborativo(documento, 'stringExamenActivadoUnaVez')
    
    agregarColaborador()
    // console.log(usuario)
    // colaboradores()
    lateralColaboradores()
    cargarListaProfesoresLateralColaboradores()
    cargarProfesorLateralColaboradores(usuario)
    cargarInterfazPreguntas(documento, listaPreguntas)
    eventos()
    habilitarDeshabilitarBotones(false)
}


// function colaboradores() {
//     for (var i = 0; i < listaColaboradores.length; i++) {
//         console.log(listaColaboradores.get(i))
//     }
// }

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

function lateralColaboradores() {
    var aside = document.getElementById("block-region-side-pre")

    var divNavigation = document.createElement("div")
    divNavigation.setAttribute("class", "block_navigation block")

    var divHeader = document.createElement("div")
    divHeader.setAttribute("class", "header")

    var h2Titulo = document.createElement("h2")
    h2Titulo.innerHTML = "Profesores"

    var divContent = document.createElement("div")
    divContent.id = "divColaboradores"
    divContent.setAttribute("class", "content")

    divHeader.appendChild(h2Titulo)
    divNavigation.appendChild(divHeader)
    divNavigation.appendChild(divContent)

    aside.insertBefore(divNavigation,aside.childNodes[0])
}

function cargarListaProfesoresLateralColaboradores() {
    var divColaboradores = document.getElementById("divColaboradores")

    for (var i = 0; i < profesores.length; i++) {
        var p = document.createElement("p")
        p.innerHTML = profesores[i].correo
        divColaboradores.appendChild(p)
    }
}
    
function cargarProfesorLateralColaboradores(colaborador) {
    var divColaboradores = document.getElementById("divColaboradores")

    for (var i = 0; i < divColaboradores.childNodes.length; i++) {
        var p = divColaboradores.childNodes[i]
        //console.log(p)
        if (p.innerHTML == colaborador.correo) {
            console.log(colaborador.correo)
            console.log(colaborador.color)
            p.style.color = colaborador.color
        }
    }
}

// function getProfesores() {//Por el momento sin uso
//     var profesores = documento.getCollaborators()
//     var divColaboradores = document.getElementById("divColaboradores")

//     for (var i = 0; i < profesores.length; i++) {
//         console.log(profesores[i])
//         //Si el colaborador es el usuario actual, no se pone
//         var p = document.createElement("p")
//         p.innerHTML = profesores[i].displayName
//         p.style.color = profesores[i].color
//         divColaboradores.appendChild(p)
//     }
// }

function profesor(evt) {
    console.log(evt)
    var divColaboradores = document.getElementById("divColaboradores")
    var colaborador
    
    for (var i = 0; i < listaColaboradores.length; i++) {
        colaborador = listaColaboradores.get(i)

        if (evt.collaborator.permissionId == colaborador.permissionId) {
            break
        }
    }
    
    // console.log("colaborador")
    // console.log(colaborador)
    if (evt.type == "collaborator_joined") {
        console.log(colaborador.color)
        cargarProfesorLateralColaboradores(colaborador)
        // var p = document.createElement("p")
        // p.innerHTML = colaborador.correo
        // p.style.color = colaborador.color
        // divColaboradores.appendChild(p)
    
    } else { //"collaborator_left"
        for (var i = 0; i < divColaboradores.childNodes.length; i++) {
            if (divColaboradores.childNodes[i].innerHTML == colaborador.correo) {
                divColaboradores.childNodes[i].style.color = "black"
                break
            }
        }
    }
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
}

function cargarInterfazPreguntas(documento, listaPreguntas) {
    var divExamen = document.getElementById("divExamen") 

    for (var i = 1; i <= listaPreguntas.length; i++) {
        var div = document.createElement("div")
        var h2 = document.createElement("h2")
        h2.innerHTML = "Pregunta " + i
        var textarea = document.createElement("textarea")

        var stringPregunta = listaPreguntas.get(i-1)
        gapi.drive.realtime.databinding.bindString(stringPregunta, textarea)

        div.appendChild(h2)
        div.appendChild(textarea)
        divExamen.appendChild(div)
    }
}

function eventos() {
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, profesor)
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, profesor)
    listaPreguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, listaCambiadaPreguntas);
    listaPreguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, listaCambiadaPreguntas);
}

function listaCambiadaPreguntas(evt) {
    var divExamen = document.getElementById("divExamen")
    console.log("evt.index " + evt.index)
    
    if (evt.type == "values_added") {
        var div = document.createElement("div")
        var h2 = document.createElement("h2")
        h2.innerHTML = "Pregunta " + (evt.index + 1)
        
        var textarea = document.createElement("textarea")

        div.appendChild(h2)
        div.appendChild(textarea)
        divExamen.appendChild(div)
        gapi.drive.realtime.databinding.bindString(listaPreguntas.get(evt.index), textarea)
    } else {
        divExamen.removeChild(divExamen.lastChild)
    }
}

function crearListaColaborativa(modelo, nombre) {
	var listaColaborativa = modelo.createList()
    modelo.getRoot().set(nombre, listaColaborativa)
}

function buttonCrearPregunta() {
    console.log(listaPreguntas.length)
   
    if ((stringExamenActivadoUnaVez == '1') && (listaGrupos.length > 0)) {
        for (var i = 0; i < listaGrupos.length; i++) {
            var miembros = listaGrupos.get(i).miembros
            var listaRespuestasGrupo = cargarObjetoColaborativo(documento, listaGrupos.get(i).nombreGrupo)
            var stringRespuesta = modelo.createString()
            listaRespuestasGrupo.push(stringRespuesta)
            
            for (var j = 0; j < miembros.length; j++) {
                var correo = miembros[j].correo
                listaNumCaracteresEscritosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresEscritosPorAlumno' + correo)
                var stringNumCaracteresEscritos = modelo.createString()
                stringNumCaracteresEscritos.setText("0")
                listaNumCaracteresEscritosPorAlumno.push(stringNumCaracteresEscritos)

                listaNumCaracteresBorradosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresBorradosPorAlumno' + correo)
                var stringNumCaracteresBorrados = modelo.createString()
                stringNumCaracteresBorrados.setText("0")
                listaNumCaracteresBorradosPorAlumno.push(stringNumCaracteresBorrados)
            }
        }
        
    }

    var stringPregunta = modelo.createString()
    listaPreguntas.push(stringPregunta) //Llama a un evento al guardar el string
    console.log("bytes")
    console.log(modelo.bytesUsed)
}

function buttonBorrarPregunta() {
    console.log(listaPreguntas.length)

    if (listaPreguntas.length > 0) {
        if ((stringExamenActivadoUnaVez == '1') && (listaGrupos.length > 0)) {
            for (var i = 0; i < listaGrupos.length; i++) {
                var miembros = listaGrupos.get(i).miembros

                for (var j = 0; j < miembros.length; j++) {
                    var correo = miembros[j].correo

                    listaNumCaracteresEscritosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresEscritosPorAlumno' + correo)
                    listaNumCaracteresBorradosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresBorradosPorAlumno' + correo)

                    listaNumCaracteresEscritosPorAlumno.remove(listaNumCaracteresEscritosPorAlumno.length - 1)
                    listaNumCaracteresBorradosPorAlumno.remove(listaNumCaracteresBorradosPorAlumno.length - 1)
                }
            }
        }
        
        listaPreguntas.remove(listaPreguntas.length - 1)
    }

    console.log("bytes")
    console.log(modelo.bytesUsed)
}