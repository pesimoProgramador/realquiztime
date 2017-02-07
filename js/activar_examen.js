function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciarSesion()     
        } else {
            realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
        }
    }, false);
}

function iniciarSesion() {
    realtimeUtils.authorize(function(response){
        realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)        
    }, true);
}

function onFileInitialize(modelo) {
	
}
var stringExamenActivado
var stringExamenActivadoUnaVez
var listaGrupos
var listaPreguntas

function onFileLoaded(documento) {
	console.log("inicio onFileLoaded")
    var modelo = documento.getModel()
    console.log("bytes onFileLoaded")
    console.log(modelo.bytesUsed)
    stringExamenActivado = cargarObjetoColaborativo(documento, 'stringExamenActivado')
    stringExamenActivado.setText("1")
    stringExamenActivadoUnaVez = cargarObjetoColaborativo(documento, 'stringExamenActivadoUnaVez')
    listaPreguntas = cargarObjetoColaborativo(documento, 'listaPreguntas')
	listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')
    console.log(stringExamenActivadoUnaVez.getText())
    
    if (stringExamenActivadoUnaVez.getText() == "0") {
        crearListasColaborativasRespuestasGrupos(documento, documento.getModel())
        console.log("bytes crearListasColaborativasRespuestasGrupos")
        console.log(modelo.bytesUsed)
        crearRespuestasGrupos(documento)
        console.log("bytes crearRespuestasGrupos")
        console.log(modelo.bytesUsed)
        crearListaColaborativaDeStringColaborativosNumeroCaracteresPorAlumno(documento, documento.getModel())
        //crearStringColaborativosMediaTiempoEntrePulsaciones(documento, documento.getModel())
        //crearStringColaborativosTiempoEntrePrimeraPulsacionUltima()
        stringExamenActivadoUnaVez.setText("1")
    }
	permisos()  
	console.log("final onFileLoaded")
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
}

function crearListaColaborativa(modelo, nombre) {
	var listaColaborativa = modelo.createList()
    modelo.getRoot().set(nombre, listaColaborativa)
}

function crearListasColaborativasRespuestasGrupos(documento, modelo) {
    for (var i = 0; i < listaGrupos.length; i++) {
        var nombreGrupo = listaGrupos.get(i).nombreGrupo
        var listaRespuestasGrupo = crearListaColaborativa(modelo, nombreGrupo)
    }
}

function crearRespuestasGrupos(documento) {
    for (var j = 0; j < listaGrupos.length; j++) {
        for (var i = 0; i < listaPreguntas.length; i++) {
            console.log(listaGrupos.get(j).nombreGrupo)
            var listaRespuestasGrupo = cargarObjetoColaborativo(documento, listaGrupos.get(j).nombreGrupo)
            var stringRespuesta = documento.getModel().createString()
            listaRespuestasGrupo.push(stringRespuesta)
        }
    }
}

function crearListaColaborativaDeStringColaborativosNumeroCaracteresPorAlumno(documento, modelo) {
    for (var i = 0; i < listaGrupos.length; i++) {
        var miembros = listaGrupos.get(i).miembros

        for (var j = 0; j < miembros.length; j++) {
            var correo = miembros[j].correo
            console.log("bytes crearListaColaborativaDeStringColaborativosNumeroCaracteresPorAlumno")
            console.log(modelo.bytesUsed)
            crearListaColaborativa(modelo, 'listaNumCaracteresEscritosPorAlumno' + correo)
            crearListaColaborativa(modelo, 'listaNumCaracteresBorradosPorAlumno' + correo)
            listaNumCaracteresEscritosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresEscritosPorAlumno' + correo)
            listaNumCaracteresBorradosPorAlumno = cargarObjetoColaborativo(documento, 'listaNumCaracteresBorradosPorAlumno' + correo)
            
            for (var k = 0; k < listaPreguntas.length; k++) {
                var stringNumCaracteresEscritos = modelo.createString()
                stringNumCaracteresEscritos.setText("0")
                listaNumCaracteresEscritosPorAlumno.push(stringNumCaracteresEscritos)

                var stringNumCaracteresBorrados = modelo.createString()
                stringNumCaracteresBorrados.setText("0")
                listaNumCaracteresBorradosPorAlumno.push(stringNumCaracteresBorrados)
            }
        }
    }
}

function crearStringColaborativo(modelo, nombre) {
    var stringColaborativo = modelo.createString()
    modelo.getRoot().set(nombre, stringColaborativo)
}

function inicializarStringColaborativo(documento, nombre, valor) {
    var stringColaborativo = documento.getModel().getRoot().get(nombre);
    stringColaborativo.setText(valor)
    console.log(stringColaborativo.getText())
}

function crearStringColaborativosMediaTiempoEntrePulsaciones(documento, modelo) {
    for (var i = 0; i < listaGrupos.length; i++) {
        var miembros = listaGrupos.get(i).miembros

        for (var j = 0; j < miembros.length; j++) {
            crearStringColaborativo(modelo, miembros.correo)
            var fecha = new Date()
            //Supongo que el examen se activa justo antes de empezar el examen.
            inicializarStringColaborativo(documento, miembros.correo, fecha.getTime().toString())
        }
    }
}

function permisos() {
    //Con un for no funciona.
    var idIntervalo = 0
    var i = 0
    var j = 0
	var correo = ''
    var numGrupos = listaGrupos.length
    idIntervalo = setInterval ( function() {
        console.log(i + " " + j)
        if (i >= numGrupos) {
            clearInterval(idIntervalo)
            formulario()
        } else {
            var tamListaMiembros = listaGrupos.get(i).miembros.length
            console.log(tamListaMiembros)
            if (tamListaMiembros > 0) {
                if (j < tamListaMiembros) {
                    correo = listaGrupos.get(i).miembros[j].correo
                    console.log(correo)
                    window.gapi.client.load('drive', 'v2', function() {
                        var body = {
                            'value': correo,
                            'type': 'user',
                            'role': 'writer'
                        }

                        window.gapi.client.drive.permissions.insert({
                            'fileId': idDocumento,
                            'resource': body
                        }).execute()
                    })
                    j += 1
                    if (j >= tamListaMiembros) {
                        j = 0
                        i += 1
                    }
                }
            } else {
                i += 1
            }
        }
    }, 1000);
}

function formulario() {
    var divFormulario = document.getElementById("divFormulario")
	
    var form = document.createElement("form")
    form.setAttribute("method","get")
    form.setAttribute("action","activar_examen.php")
    form.setAttribute("style", "display:none")

    //El id de la vista
    var inputId = document.createElement("input")
    inputId.setAttribute("name", "id")
    inputId.setAttribute("type", "hidden")
    inputId.setAttribute("value",  id)

    var inputExamenActivado = document.createElement("input")
    inputExamenActivado.setAttribute("name", "examenActivado")
    inputExamenActivado.setAttribute("type", "hidden")
    inputExamenActivado.setAttribute("value", parseInt(stringExamenActivado.getText()))

    var inputExamenActivadoUnaVez = document.createElement("input")
    inputExamenActivadoUnaVez.setAttribute("name", "examenActivadoUnaVez")
    inputExamenActivadoUnaVez.setAttribute("type", "hidden")
    inputExamenActivadoUnaVez.setAttribute("value", parseInt(stringExamenActivadoUnaVez.getText()))

    var inputSubmit = document.createElement("input")
    inputSubmit.setAttribute("type", "submit")
    inputSubmit.setAttribute("value", "Activar examen")

    form.appendChild(inputId)
    form.appendChild(inputExamenActivado)
    form.appendChild(inputExamenActivadoUnaVez)
    form.appendChild(inputSubmit)

    divFormulario.innerHTML = ''
    divFormulario.appendChild(form)

    form.submit()
}