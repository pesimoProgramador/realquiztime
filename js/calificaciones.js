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

var documento
var listaGrupos
var listaPreguntas
var listaCaracteres
var listaColaboradores

function onFileInitialize(model) {}

function onFileLoaded(doc) {
    documento = doc

    listaGrupos = cargarObjetoColaborativo(documento, 'listaGrupos')
    listaPreguntas = cargarObjetoColaborativo(documento, 'listaPreguntas')
    listaCaracteres = cargarObjetoColaborativo(documento, 'listaCaracteres')
    listaColaboradores = cargarObjetoColaborativo(documento, 'listaColaboradores')
    listaColores = cargarObjetoColaborativo(documento, 'listaColores')

    cargarNotasColaborativasForm()
    // lateralGrupos()
    // //eventos()
    // cargarLateralGrupos()
    agregarColaborador()
    lateralColaboradores()
    cargarListaProfesoresLateralColaboradores()
    cargarProfesorLateralColaboradores(usuario)
    cargarRespuestasCaracteresColores()
}

function cargarObjetoColaborativo(documento, nombre) {
    return documento.getModel().getRoot().get(nombre)
}

function cargarNotasColaborativasForm() {
    for (var i = 0; i < alumnos.length; i++) {
        for (var j = 0; j < listaGrupos.length; j++) {
            var miembros = listaGrupos.get(j).miembros
            for (var k = 0; k < miembros.length; k++) {
                if(miembros[k].correo == alumnos[i].email) {
                    var stringColaborativo = cargarObjetoColaborativo(documento, 'stringNota' + alumnos[i].email)

                    var textarea = document.getElementById("textarea" + alumnos[i].email)
                    gapi.drive.realtime.databinding.bindString(stringColaborativo, textarea)

                }
            }
        }
    }
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

        var miembros = listaGrupos.get(i).miembros
        for (var j = 0; j < miembros.length; j++) {
            var p = document.createElement("p")
            p.innerHTML = miembros[j].correo

            for (var k = 0; k < listaColaboradores.length; k++) {
                if (miembros[j].correo == listaColaboradores.get(k).correo) {
                    p.style.color = listaColaboradores.get(k).color
                }
            }

            divGrupo.appendChild(p)
        }
    }
}

function cargarListaProfesoresLateralColaboradores() {
    var divProfesores = document.getElementById("divProfesores")

    for (var i = 0; i < profesores.length; i++) {
        var p = document.createElement("p")
        p.innerHTML = profesores[i].correo
        divProfesores.appendChild(p)
    }
}
    
function cargarProfesorLateralColaboradores(colaborador) {
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
}

function dameColor(correo) {
    for (var i = 0; i < listaColaboradores.length; i++) {
        var usuario = listaColaboradores.get(i)
        if (usuario.correo == correo) {
            return usuario.color
        }
    }
}

function cargarLateralGrupos() {
    //console.log("cargarLateral")
    var divContent = document.getElementById("divColaboradores")
    //console.log(listaGrupos.length)

    for (var i = 0; i < listaGrupos.length; i++) {
        var grupo = listaGrupos.get(i)

        var h3NombreGrupo = document.createElement("h3")
        h3NombreGrupo.innerHTML = grupo.nombreGrupo

        divContent.appendChild(h3NombreGrupo)
        
        for (var j = 0; j < grupo.miembros.length; j++) {
            var p = document.createElement("p")
            var color = dameColor(grupo.miembros[j].correo)
            p.innerHTML = grupo.miembros[j].correo
            p.style.marginLeft = "20px"
            p.style.color = color

            divContent.appendChild(p)
        }
    }
}

function cargarRespuestasCaracteresColores() {
    var divEstadisticas = document.getElementById("divEstadisticas") 
    var numAlumnos = buscarNumAlumnos()
    for (var i = 0; i < listaPreguntas.length; i++) {
        cargarPregunta(i, divEstadisticas)
        for (var j = 0; j < listaGrupos.length; j++) {
            //cargarRespuestaGrupo(i, j, divEstadisticas)
            cargarCaracteresRespuestaGrupo(i, j, divEstadisticas)
            //cargarGraficaGrupo(i, j, divEstadisticas, numAlumnos)
        }
    }
}

function buscarNumAlumnos() {
    var numAlumnos = 0
    for (var i = 0; i < listaGrupos.length; i++) {
        var miembros = listaGrupos.get(i).miembros

        numAlumnos += miembros.length
    }

    return numAlumnos
}

function cargarPregunta(i, div) {
    var h4 = document.createElement("h4")
    h4.innerHTML = "Pregunta " + (i + 1)

    var p = document.createElement("p")
    p.style = "border-style:solid; height:100px; overflow-y:auto;"
    p.innerText = listaPreguntas.get(i).getText()

    div.appendChild(h4)
    div.appendChild(p)
}

// function cargarRespuestaGrupo(i, j, div) {
//     var grupo = listaGrupos.get(j)
//     var listaRespuestasGrupo = cargarObjetoColaborativo(documento, grupo.nombreGrupo)

//     var h4 = document.createElement("h4")
//     h4.innerHTML = "Respuesta " + (i + 1) + " - " + grupo.nombreGrupo

//     var p = document.createElement("p")
//     p.style = "border-style:solid; height:100px; overflow-y:auto;"
//     p.innerHTML = listaRespuestasGrupo.get(i).getText()

//     div.appendChild(h4)
//     div.appendChild(p)
// }

function cargarCaracteresRespuestaGrupo(i, j, div) {
    var grupo = listaGrupos.get(j)
    var listaRespuestasGrupo = cargarObjetoColaborativo(documento, grupo.nombreGrupo)
    var h4 = document.createElement("h4")
    h4.innerHTML = "Respuesta " + (i + 1) + " - " + grupo.nombreGrupo
    div.appendChild(h4)
    var stringRespuestaId = listaRespuestasGrupo.get(i).id
    //console.log(stringRespuestaId)

    var divCaracteres = document.createElement("div")
    divCaracteres.style = "border-style:solid; height:100px; overflow-y:auto;"
    div.appendChild(divCaracteres)
    console.log(listaCaracteres.length)
    // for (var k = 0; k < listaCaracteres.length; k++) {
    //     var caracter = listaCaracteres.get(k)
        
    //     console.log(caracter)
    // }

    for (var k = 0; k < listaCaracteres.length; k++) {
        var caracter = listaCaracteres.get(k)
        
        console.log(caracter)

        if ((caracter != null) && (caracter.targetId == stringRespuestaId)) {
            //console.log("id1: " + caracter.targetId)
            //console.log("id2: " + stringRespuestaId)

            for (var x = 0; x < caracter.texto.length; x++) {
                var nodes = divCaracteres.childNodes
                var index = caracter.index + x
                var index2 = caracter.index - x
                for (var y = 0; y <= nodes.length; y++) {
                    if (caracter.type == "text_inserted") {
                        var salir = false
                        var span = document.createElement("span")
                        span.innerHTML = caracter.texto[x]
                        if (span.innerHTML == " ") {
                            span.style = "background-color : " + caracter.color + ";"
                        } else {
                            //console.log(caracter.color)
                            span.style = "color : " + caracter.color + ";"
                        }
                        // console.log("c: " + span.innerHTML)
                        // console.log("length " + nodes.length)
                        if ((index == y) && (index == nodes.length)) {
                            console.log("c1: " + span.innerHTML)
                            console.log("length " + nodes.length)
                            divCaracteres.appendChild(span)
                            salir = true
                            break
                        } else if ((index == 0) && (y == 0)) {
                            console.log("c2: " + span.innerHTML)
                            console.log("length " + nodes.length)
                            divCaracteres.insertBefore(span, nodes[index])
                            salir = true
                            break
                        } else if (index == y) {
                            console.log("c3: " + span.innerHTML)
                            console.log("length " + nodes.length)
                            divCaracteres.insertBefore(span, nodes[index])
                            salir = true
                            break
                        }

                        if (salir) {
                            break
                        }
                    } else {
                        //console.log("length " + nodes.length)
                        //Probar si funciona
                        //console.log(y)
                        //console.log(nodes[y].innerHTML)
                        var salir = false
                        if (caracter.texto[x] == nodes[y].innerHTML) {
                            console.log("cb: " + caracter.texto[x])
                            console.log("length " + nodes.length)
                            divCaracteres.removeChild(nodes[y])
                            salir = true
                            break
                        }

                        if (salir) {
                            break
                        }
                    }
                }
            }
            // for (var x = 0; x < caracter.texto.length; x++) {
            //     var span = document.createElement("span")
            //     span.innerHTML = caracter.texto[x]
            //     var index = caracter.index + x
            //     // console.log(index)
            //     span.setAttribute("index", index)
            //     span.style.color = caracter.color
            //     if (caracter.type == "text_deleted") {
            //         span.style.textDecoration = "line-through"
            //     } 
            //     var nodes = divCaracteres.childNodes

            //     for (var y = 0; y < nodes.length; y++) {
            //         // console.log(parseInt(nodes[y].getAttribute("index")))
            //         if (parseInt(nodes[y].getAttribute("index")) == index) {
            //             divCaracteres.insertBefore(span, nodes[y])
            //             break
            //         }else{
            //             divCaracteres.appendChild(span)
            //         }
            //     }

            //     if (nodes.length == 0) {
            //         divCaracteres.appendChild(span)
            //     }
            // }
        }
    }
}

function buscarPosAlumnosGrupos(correo) {
    var pos = 0
    for (var i = 0; i < listaGrupos.length; i++) {
        var miembros = listaGrupos.get(i).miembros

        for (var j = 0; j < miembros.length; j++) {
            if (miembros[j].correo == correo) {
                return pos
            } else {
                pos += 1
            }
        }
    }
}

// function cargarGraficaGrupo (i, j, divEstadisticas, numAlumnos) {
//     var grupo = listaGrupos.get(j)
//     var divGrafica = document.createElement("div")
//     var nombreGrupo = grupo.nombreGrupo.replace(" ", "")

//     divGrafica.id = "divGrafica" + (i + 1) + nombreGrupo
//     divEstadisticas.appendChild(divGrafica)
//     var datosGrafica = {
//         type: "hbar",
//         tooltip: {
//             padding: 10,
//             fontSize: 14,
//             text: "%v caracteres %t",
//             backgroundColor: "#fff",
//             fontColor: "#444",
//             borderRadius: "5px",
//             borderColor: "#333",
//             borderWidth: 1
//         },
//         legend: {
//             offsetY: 80,
//             offsetX: 0,
//             padding: 0,
//             backgroundColor: "transparent",
//             borderWidth: "0px",
//             highlightPlot: true,
//             item: {
//                 fontSize: 18,
//                 fontColor: "#666"
//         },
//         marker: {
//             borderRadius: 10,
//             borderWidth: "0px"
//         },
//         cursor: "hand"
//         },
//         plotarea: {
//             margin: "100 130 70 100"
//         },
//         plot: {
//             borderRadius: "0 5 5 0",
//             barSpace: "2",
//             hightlightMarker: {
//                 backgroundColor: "red"
//             },
//             highlightState: {
//                 backgroundColor: "red"
//             },
//             animation: {
//                 effect: 4,
//                 method: 0,
//                 sequence: 1
//             }
//         },
//         scaleX: {
//             labels: [],
//             item: {
//                 fontSize: 14
//             },
//             lineColor: "#DDD",
//             tick: {
//                 visible: false
//             }
//         },
//         scaleY: {
//             item: {
//                 fontSize: 14
//             },
//             lineWidth: 0,
//             tick: {
//                 visible: false
//             },
//             values: "0:10:10"
//         },
//         series: [{
//             text: "escritos",
//             values: [],
//             backgroundColor: "#fbd972",
//             rules: [{
//                 rule: '%i==0',
//                 backgroundColor: '#fbd972'
//                 }, {
//                 rule: '%i==1',
//                 backgroundColor: '#fbd972'
//             }]
//         },
//         {
//             text: "borrados",
//             values: [],
//             backgroundColor: "#F55443",
//             rules: [{
//                 rule: '%i==0',
//                 backgroundColor: '#F55443'
//                 }, {
//                 rule: '%i==1',
//                 backgroundColor: '#F55443'
//             }]
//         }]
//     };
//     //console.log(datosGrafica.series[0].values)
//     for (var k = 0; k < grupo.miembros.length; k++) {
//         var posAlumnoGrupos = buscarPosAlumnosGrupos(grupo.miembros[k].correo)
//         var pos = i * numAlumnos + posAlumnoGrupos
//         console.log("pos " + pos)

//         datosGrafica.scaleX.labels.push(grupo.miembros[k].correo)
//         //a datosGrafica.series[0].values[k] = parseInt(listaCaracteresEscritos.get(pos).getText())
//         //a datosGrafica.series[1].values[k] = parseInt(listaCaracteresBorrados.get(pos).getText())
//     }
//     //console.log(datosGrafica)
//     zingchart.render({
//         id: "divGrafica" + (i + 1) + nombreGrupo,
//         data: datosGrafica
//     });
// }

// div {
//   overflow-x: scroll;
//   max-width : 400px;
// }

// table {
//   width: 600px;
//   table-layout:fixed;
// }

// th {
//   width : 100px;
// }