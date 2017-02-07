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

function onFileInitialize(model) {

}

var listaPreguntas
var listaGrupos
var listaColores
var listaColaboradores
var grupo
var documento

function onFileLoaded(doc) {
    documento = doc
    listaColores = cargarObjetoColaborativo(documento, 'listaColores')
    listaPreguntas = cargarObjetoColaborativo(documento, 'listaPreguntas')
    listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')
    listaColaboradores = cargarObjetoColaborativo(documento, 'listaColaboradores')
    listaCaracteres = cargarObjetoColaborativo(documento, 'listaCaracteres')
    //getUsuarios()
    agregarColaborador()
    grupo = buscarAlumnoEnGrupo()
    //console.log(grupo)
    var divExamen = document.getElementById("divExamen")
    
    if (grupo != -1) { //Comprueba si el alumno esta en algun grupo.
        //console.log(grupo.nombreGrupo)
        listaRespuestas = cargarObjetoColaborativo(documento, grupo.nombreGrupo)
        //listaGraficas = cargarObjetoColaborativo(documento, "grafica" + grupo.nombreGrupo)

        for (var i = 1; i <= listaPreguntas.length; i++) {
            var div = document.createElement("div")
            cargarTextarea(listaPreguntas.get(i - 1), div, "Pregunta " + i, "p")
            cargarTextarea(listaRespuestas.get(i - 1), div, "Respuesta " + i, "r")
            divExamen.appendChild(div)
        }

        listeners()
    } else {
        document.getElementById("divInterfaz").innerHTML = "Error"
    }
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
}

function getUsuarios() {
    var usuarios = documento.getCollaborators()
    //console.log(usuarios)
    //console.log(usuario)
    /*var divColaboradores = document.getElementById("divColaboradores")

    for (var i = 0; i < usuarios.length; i++) {
        console.log(usuarios[i])
        //Si el colaborador es el usuario actual, no se pone
        var p = document.createElement("p")
        p.innerHTML = usuarios[i].displayName
        p.style.color = usuarios[i].color
        divColaboradores.appendChild(p)
    }*/
}

function buscarAlumnoEnGrupo () {
    for (var i = 0; i < listaGrupos.length; i++) {
		var grupo = listaGrupos.get(i)
		for (var j = 0; j < grupo.miembros.length; j++) {
			if (grupo.miembros[j].correo == correo) {
				return grupo
			}
		}
	}
 
    return -1
}

function cargarTextarea (stringColaborativo, div, valor, tipo) {
    var p = document.createElement("p")
    p.innerHTML = valor
    var textarea = document.createElement("textarea")
    if (tipo == "p") {
        textarea.disabled = true
    }

    gapi.drive.realtime.databinding.bindString(stringColaborativo, textarea)

    div.appendChild(p)
    div.appendChild(textarea)
}

function listeners() {
    listaPreguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, listaCambiadaPregunta);
    listaPreguntas.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, listaCambiadaPregunta);

    for (var i = 0; i < listaGrupos.length; i++) {
        var nombreGrupo = listaGrupos.get(i).nombreGrupo
        var listaRespuestasGrupo = cargarObjetoColaborativo(documento, nombreGrupo)

        for (var j = 0; j < listaRespuestasGrupo.length; j++) {
            listaRespuestasGrupo.get(j).addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, respuestaCaracteres)
            listaRespuestasGrupo.get(j).addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, respuestaCaracteres)
        }
    }
}

function damePosicionRespuesta (listaRespuestasGrupo, targetId, correo) {
    var posRespuesta = 0

    for (var i = 0; i < listaRespuestasGrupo.length; i++) {
        for (var j = 0; j < listaGrupos.length; j++) {
            var miembros = listaGrupos.get(j).miembros

            for (var k = 0; k < miembros.length; k++) {
                // console.log(listaRespuestasGrupo.get(i).id)
                if ((targetId == listaRespuestasGrupo.get(i).id) && miembros[k].correo == correo) {
                    posRespuesta = i
                    // console.log(posiciones)
                    return posRespuesta
                } 
            } 
        }
    }
}

function respuestaCaracteres(evt) {
    // console.log("usuario")
    // console.log(usuario)
    if (evt.isLocal == true) {
        var caracter = {
            "texto" : evt.text,
            "correo" : usuario.correo,
            "nombreGrupo" : grupo.nombreGrupo,
            "color" : usuario.color,
            "type" : evt.type,
            "targetId" : evt.target.id,
            "index" : evt.index,
            //"posAlumnoNumCaracteres" : 0,
            "posRespuesta" : 0//,
            // "tiempo" : new Date()
        }
    
        //console.log(caracter)
        var targetId = evt.target.id
        var listaRespuestasGrupo = cargarObjetoColaborativo(documento, grupo.nombreGrupo)
        var posRespuesta = damePosicionRespuesta(listaRespuestasGrupo, targetId, caracter.correo)
        //caracter.posAlumnoNumCaracteres = posiciones.posAlumnoNumCaracteres
        caracter.posRespuesta = posRespuesta
        // console.log("caracter.posRespuesta")
        // console.log(caracter.posRespuesta)
        // console.log("evt")
        // console.log(evt)
        var numCaracteres = evt.text.length
        if (evt.type == "text_inserted") {
            numCaracteresEscritosPorAlumno(caracter.correo, caracter.posRespuesta, numCaracteres)
            //sumaTiempoEntrePulsacionesDeTeclasPorAlumno(caracter.posAlumnoNumCaracteres, caracter.tiempo)
        } else if (evt.type == "text_deleted"){
            numCaracteresBorradosPorAlumno(caracter.correo, caracter.posRespuesta, numCaracteres)
            
        }
        console.log(caracter)
        listaCaracteres.push(caracter)
        console.log(listaCaracteres.length)
    }
}

function numCaracteresEscritosPorAlumno(correo, posRespuesta, numCaracteres) {
    listaNumCaracteresEscritosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresEscritosPorAlumno' + correo)
    console.log(listaNumCaracteresEscritosPorAlumno.length)
    var numCaracteresEscritos = parseInt(listaNumCaracteresEscritosPorAlumno.get(posRespuesta).getText())
    listaNumCaracteresEscritosPorAlumno.get(posRespuesta).setText((numCaracteresEscritos + numCaracteres).toString())
}

function numCaracteresBorradosPorAlumno(correo, posRespuesta, numCaracteres) {
    listaNumCaracteresBorradosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresBorradosPorAlumno' + correo)
    var numCaracteresBorrados = parseInt(listaNumCaracteresBorradosPorAlumno.get(posRespuesta).getText())
    listaNumCaracteresBorradosPorAlumno.get(posRespuesta).setText((numCaracteresBorrados + numCaracteres).toString())
}

function listaCambiadaPregunta(evt) {
    var divExamen = document.getElementById("divExamen")
    
    console.log("evt.index " + evt.index)
    if (evt.type == "values_added") {
        var div = document.createElement("div")
        cargarTextarea(listaPreguntas.get(evt.index), div, "Pregunta " + (evt.index + 1), "p")
        cargarTextarea(listaRespuestas.get(evt.index), div, "Respuesta " + (evt.index + 1), "r")
        //Eventos de las respuestas
        // console.log(eventos)
        listaRespuestas.get(evt.index).addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, respuestaCaracteres)
        listaRespuestas.get(evt.index).addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, respuestaCaracteres)
        divExamen.appendChild(div)        
    } else {
        divExamen.removeChild(divExamen.lastChild)
    }
}