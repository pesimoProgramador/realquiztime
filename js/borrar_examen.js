function autorizar() {
    realtimeUtils.authorize(function(response){
        if (response.error) {
            iniciarSesion()     
        } else {
            realtimeUtils.deleteFile(idDocumento, ok)
        }
    }, false);
}

function iniciarSesion() {
    realtimeUtils.authorize(function(response){
        realtimeUtils.deleteFile(idDocumento, ok)
    }, true);
}

// function deleteFile(idDocumento) {
//     var request = gapi.client.drive.files.delete({
//         'fileId': idDocumento
//     });
    
//     request.execute(function(resp) { });
// }

function ok(resp) {
    console.log(resp)

    formulario()
}

function formulario() {
    var divFormulario = document.getElementById("divFormulario")
	
    var form = document.createElement("form")
    form.setAttribute("method","get")
    form.setAttribute("action","view.php")
    form.setAttribute("style", "display:none")

    //El id de la vista
    var inputId = document.createElement("input")
    inputId.setAttribute("name", "id")
    inputId.setAttribute("type", "hidden")
    inputId.setAttribute("value",  id)

    var inputSubmit = document.createElement("input")
    inputSubmit.setAttribute("type", "submit")
    inputSubmit.setAttribute("value", "Borrar")

    form.appendChild(inputId)
    form.appendChild(inputSubmit)

    // divFormulario.innerHTML = ''
    divFormulario.appendChild(form)

    form.submit()
}