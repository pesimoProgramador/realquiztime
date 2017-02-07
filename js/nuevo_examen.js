var idDocumento = ''

function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciarSesion()     
        } else {
            crearExamen()
        }
    }, false);
}

function iniciarSesion() {
    realtimeUtils.authorize(function(response){
        crearExamen()
    }, true);
}

function crearExamen() {
    realtimeUtils.createRealtimeFile(nombreExamen, function(createResponse) {
        //createResponse.error
        idDocumento = createResponse.id
        realtimeUtils.load(idDocumento, onFileLoaded, onFileInitialize)
    })
}

function onFileInitialize(modelo) {
    crearStringColaborativo(modelo, 'stringExamenActivado')
    crearStringColaborativo(modelo, 'stringExamenActivadoUnaVez')
    crearStringColaborativo(modelo, 'stringInicioExamenTiempo')
    crearListaColaborativa(modelo, 'listaPreguntas')
    crearListaColaborativa(modelo, 'listaGrupos')
    crearListaColaborativa(modelo, 'listaCaracteres')
    crearListaColaborativa(modelo, 'listaColaboradores')
    crearListaColaborativa(modelo, 'listaColores')
    //crearListaColaborativa(modelo, 'listaCaracteresEscritos')
    //crearListaColaborativa(modelo, 'listaCaracteresBorrados')
    for (var i = 0; i < alumnos.length; i++) {
        crearStringColaborativo(modelo, 'stringNota' + alumnos[i].email)
    }

    console.log(modelo.bytesUsed)
}

function onFileLoaded(documento) {
    inicializarStringColaborativo(documento, 'stringExamenActivado', '0')
    inicializarStringColaborativo(documento, 'stringExamenActivadoUnaVez', '0')
    inicializarListaColores(documento, 'listaColores')
    permisosProfesores()
    //formulario()
}

function crearStringColaborativo(modelo, nombre) {
    var stringColaborativo = modelo.createString()
    modelo.getRoot().set(nombre, stringColaborativo)
}

function crearListaColaborativa(modelo, nombre) {
	var listaColaborativa = modelo.createList()
    modelo.getRoot().set(nombre, listaColaborativa)
}

function inicializarStringColaborativo(documento, nombre, valor) {
    var stringColaborativo = documento.getModel().getRoot().get(nombre);
    stringColaborativo.setText(valor)
    console.log(stringColaborativo.getText())
}

function inicializarListaColores(documento, nombre) {
    var listaColores = documento.getModel().getRoot().get(nombre);

    colorear(listaColores, "#1FA15D")
    colorear(listaColores, "#00BFFF")
    colorear(listaColores, "#4D0A11")
    colorear(listaColores, "#AF3EBD")
}

function colorear(lista, valor) {
    var color = {
        "color" : valor,
        "libre" : true
    }

    lista.push(color)
}

function permisosProfesores() {
//Con un for no funciona.
    var idIntervalo = 0
    var i = 0
	var correo = ''
    //Tengo que comprobar que no se invite al profesor que ha creado el examen
    idIntervalo = setInterval ( function() {
        console.log(i)
        if (i >= profesores.length) {
            clearInterval(idIntervalo)
            formulario()
        } else {
            correo = profesores[i].email
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
        }
        i += 1
    }, 1000);
}

function formulario() {
    var divFormulario = document.getElementById("divFormulario")
	
    var form = document.createElement("form")
    form.setAttribute("method","get")
    form.setAttribute("action","nuevo_examen.php")
    form.setAttribute("style", "display:none")

    //El id de la vista
    var inputId = document.createElement("input")
    inputId.setAttribute("name", "id")
    inputId.setAttribute("type", "hidden")
    inputId.setAttribute("value",  id)

    //El id del documento
    var inputIdDocumento = document.createElement("input")
    inputIdDocumento.setAttribute("name", "idDocumento")
    inputIdDocumento.setAttribute("type", "hidden")
    inputIdDocumento.setAttribute("value", idDocumento)

    var inputSubmit = document.createElement("input")
    inputSubmit.setAttribute("type", "submit")
    inputSubmit.setAttribute("value", "Crear examen")

    form.appendChild(inputId)
    form.appendChild(inputIdDocumento)
    form.appendChild(inputSubmit)

    divFormulario.innerHTML = ''
    divFormulario.appendChild(form)

    form.submit()
}