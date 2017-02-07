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
var listaGrupos

function onFileLoaded(doc) {
    documento = doc
    modelo = documento.getModel()
    listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')
    listaColores = cargarObjetoColaborativo(documento, 'listaColores')
    listaColaboradores = cargarObjetoColaborativo(documento, 'listaColaboradores')
    agregarColaborador()
    // console.log(usuario)
    // colaboradores()
    lateralColaboradores()
    cargarListaProfesoresLateralColaboradores()
    cargarUsuarioLateralColaboradores(usuario)
    cargarCheckboxListaGrupos()
    console.log("bytes")
    console.log(modelo.bytesUsed)
    eventos()
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
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

    // for (var i = 0; i < listaColores.length; i++) {
    //     console.log(listaColores.get(i))
    // }

    // for (var i = 0; i < listaColaboradores.length; i++) {
    //     console.log("Colaborador " + i)
    //     console.log(listaColaboradores.get(i))
    // }
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
    
function cargarUsuarioLateralColaboradores(colaborador) {
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

function checkboxOnChange(value, checked) {
    //listaGrupos.clear()

    if (checked) {
        listaGrupos.push(grupos[value])
    } else {
        for (var i = 0; i < listaGrupos.length; i++) {
            if (listaGrupos.get(i).nombreGrupo == grupos[value].nombreGrupo) {
                listaGrupos.remove(i)
                break
            }
        }

    }
}

function cargarCheckboxListaGrupos() {
    var checkboxGrupos = document.getElementsByName("checkboxGrupos")
    
    for (var i = 0; i < listaGrupos.length; i++) {
        for (var j = 0; j < grupos.length; j++) {
            if (listaGrupos.get(i).nombreGrupo == grupos[j].nombreGrupo) {
                checkboxGrupos[j].checked = true
            }
        }
    }
}

function eventos() {
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, profesor)
    documento.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, profesor)
    listaGrupos.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, onListChange);
    listaGrupos.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, onListChange);
}

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
        cargarUsuarioLateralColaboradores(colaborador)
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

function onListChange(evt) {
    console.log(evt)

    if (!evt.isLocal) {
        var checkboxGrupos = document.getElementsByName("checkboxGrupos")

        if (evt.type == "values_added"){
            checkingCheckboxGrupos(true, checkboxGrupos, evt)
        } else if (evt.type == "values_removed") {
            checkingCheckboxGrupos(false, checkboxGrupos, evt)
        }
    } else {
        console.log("local")
    }
}

function checkingCheckboxGrupos(check, checkboxGrupos, evt) {
    for (var i = 0; i < grupos.length; i++) {
        //Se supone que en listaGrupos solo guarda o borra un valor al hacer clic en el checkbox.
        if (grupos[i].nombreGrupo == evt.values[0].nombreGrupo) {
            checkboxGrupos[i].checked = check
            break
        }
    }
}

var nodes
var edges
var network

function buttonCargarGrafo() {

    var divGrafo = document.getElementById("divGrafo")
    nodes = new vis.DataSet([])
    edges = new vis.DataSet([])
    var data = {
        "nodes" : nodes,
        "edges" : edges
    }

    var options = {
        autoResize: true,
    }
    //console.log("nada")
    network = new vis.Network(divGrafo, data, options);

    /*nodes.add({id: 1, label: 'Node 1'})
    nodes.add({id: 2, label: 'Node 2'})

    edges.add({from: 1, to: 2})

    network.redraw()*/
    dibujarGrupos(network)
    //console.log(grupos)
    //crearGrafo(grupos)
    //console.log(grupos)
}

function dibujarGrupos() {
    var idIntervalo = 0
    var i = 0
    idIntervalo = setInterval ( function() {
        if (idDocumento != idGrafos[i]) {
            realtimeUtils.load(idGrafos[i], function() {
                var listaGruposGrafos = cargarObjetoColaborativo(doc, 'listaGrupos')
                redibujarGrafo(listaGruposGrafos)
                network.redraw()
            }, onFileInitialize)
            i++
        }

        if (i >= idGrafos.length) {
            clearInterval(idIntervalo)
        }
    }, 1000);
}

function redibujarGrafo(grupos) {
    cargarNodes(grupos)
    cargarEdges(grupos)
}

/*function crearGrafo(grupos) {
    var nodes = cargarNodes(grupos)
	var edges = cargarEdges(grupos, nodes)

    dibujar(nodes, edges)
}*/

function cargarNodes(grupos) {
    var k = nodes.length
    for (var i = 0; i < grupos.length; i++) {
        for (var j = 0; j < grupos.get(i).miembros.length; j++) {
            var correo = grupos.get(i).miembros[j].correo
            if (!existeAlumnoNodo(correo)) { //En teoria no puede haber alumnos repetidos,
                //así que esta función no debería existir.
                k++
                var nodo = {
                    "id" : k,
                    "label" : correo
                }

                nodes.add(nodo)
            }
        }
    }
}

function existeAlumnoNodo(correo) {
    console.log(correo)
    console.log(nodes.length)
    for (var i = 1; i <= nodes.length; i++) {
        console.log(nodes.get(i))
        if (correo == nodes.get(i).label) {
            return true
        }
    }

    return false
}

function cargarEdges(grupos) {
    var x = edges.length
    for (var i = 0; i < grupos.length; i++) {
        for (var j = 0; j < grupos.get(i).miembros.length; j++) {
            for (var k = j+1; k < grupos.get(i).miembros.length; k++) {
                var correo1 = grupos.get(i).miembros[j].correo
                var id1 = dameID(correo1)
                var correo2 = grupos.get(i).miembros[k].correo
                var id2 = dameID(correo2)


                console.log("correo1: " + correo1 + " correo2: " + correo2)
                if (correo1 != correo2) {
                    //var existeEdge = actualizarEdges(correo1, correo2) 
                    //if (!existeEdge) {
                        x++
                        var edge = {
                            "id": x,
                            "from" : id1,
                            "to" : id2
                        }
                        //edge.label = 1
                        edges.add(edge)
                    //} else {

                    //}
                }
            }
        }
    }
}

function dameID (correo) {
    console.log("dameID")
    console.log(nodes.length)
    console.log(nodes)
    for (var i = 1; i <= nodes.length; i++) {
        console.log(nodes.get(i))
        console.log(nodes.get(i).label)
        if (correo == nodes.get(i).label) {
            return nodes.get(i).id
        }
    }

    return -1
}

function actualizarEdges(correo1, correo2) {
    console.log(edges.get(1))
    for (var i = 1; i <= edges.length; i++) {
        // no son correos, son ids
        var edge = edges.get(i)
        if (((edge.from == correo1) && (edge.to == correo2)) || ((edge.from == correo2) && (edge.to == correo1))) {
            edges.update({"from" : edge.from, "to" : edge.to, "label" : edge.label + 1})
            return true
        }
    }

    return false
}