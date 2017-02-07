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

function onFileInitialize() {

}

var documento
var listaGrupos


function onFileLoaded(doc) {
    documento = doc
    
    listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')
    stringExamenActivado = cargarObjetoColaborativo(documento, 'stringExamenActivado')
    stringExamenActivado.setText("0")

    permisos()
    //formularioView()
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
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
                        window.gapi.client.drive.permissions.getIdForEmail({
                            'email': correo,
                        }).execute(function(response) {
                            window.gapi.client.drive.permissions.delete({
                                'fileId': idDocumento,
                                'permissionId': response.id
                            }).execute()
                        })
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
    form.setAttribute("action","desactivar_examen.php")
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

    var inputSubmit = document.createElement("input")
    inputSubmit.setAttribute("type", "submit")
    inputSubmit.setAttribute("value", "Desactivar examen")

    form.appendChild(inputId)
    form.appendChild(inputExamenActivado)
    form.appendChild(inputSubmit)

    divFormulario.innerHTML = ''
    divFormulario.appendChild(form)

    form.submit()
}