//===================================
//Obstención del tablero
//===================================
const tablero = document.getElementById("tablero");
console.log("APP.JS FUNCIONA, por fiiin!!");

//===================================
//Obstener post-its en firebase
//===================================
db.collection("postits").get().then((resultado) => {
    resultado.forEach((documento) => {
        
        const datos = documento.data();
        if (datos.ID === "crearPostit") {
            return;
        }
        const postit = document.createElement("div");
        postit.dataset.id = documento.id;

        postit.className = "postit " + datos.color;
        postit.textContent = datos.texto;

        postit.style.left = datos.coordenadaX + "px";
        postit.style.top = datos.coordenadaY + "px";

        tablero.appendChild(postit);

    });

}).catch((error) => {
    console.log(error);
});

//===================================
//Cargar la posición del botón
//===================================

db.collection("postits").where("ID", "==", "crearPostit").get().then((resultado) => {

    resultado.forEach((documento) => {

        let datos = documento.data();

        let boton = document.getElementById("crearPostit");

        boton.style.left = datos.coordenadaX + "px";
        boton.style.top = datos.coordenadaY + "px";

    });

}).catch((error) => {
    console.log("Error al cargar el botón:", error);
});

let click = 0;

//===================================

function click_button() {
    const contenedor = document.querySelector('.formulario');
    click++;

    if (click > 1){
        click = 0;
    }

    console.log(click);

    if (click === 1) {
        contenedor.classList.add('modo-flex'); 
    } 
    else if (click === 0) {
        contenedor.classList.remove('modo-flex');
    }
}

//====================================
//Obtener elemento mediante pointerdown
//====================================
let postitSeleccionado = null;

let posicionInicialX = 0;
let posicionInicialY = 0;

let offsetX = 0;
let offsetY = 0;

let nivelZ = 1;

tablero.addEventListener("pointerdown", function(event) { 
    
    let elemento = event.target.closest(".formulario, .postit, #crearPostit");

    if (elemento) {

        postitSeleccionado = elemento;

        offsetX = event.clientX - elemento.offsetLeft;
        offsetY = event.clientY - elemento.offsetTop;

        nivelZ++;
        postitSeleccionado.style.zIndex = nivelZ;
        console.log(elemento.style.zIndex);
    }
    
    /*
    console.log("He tocado el tablero");
    let elemento = event.target;

    console.log(elemento);
    */
});

//====================================
//Mover postits con pointermove
//====================================
tablero.addEventListener("pointermove", function(event) {
    if (postitSeleccionado !== null) {
        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;
        
        postitSeleccionado.style.left = x + "px";
        postitSeleccionado.style.top = y + "px";
    }
});

// Preguntado a la IA:
// Por repasar...
tablero.addEventListener("pointerup", function() {

    if (postitSeleccionado === null) return;

    let x = postitSeleccionado.offsetLeft;
    let y = postitSeleccionado.offsetTop;

    if (postitSeleccionado.id === "crearPostit") {

        db.collection("postits")
            .where("ID", "==", "crearPostit").get().then(resultado => {
                resultado.forEach(documento => {
                    documento.ref.update({
                        coordenadaX: x,
                        coordenadaY: y
                    });
                });
            });

    } else {    
        db.collection("postits").doc(postitSeleccionado.dataset.id).update({
                coordenadaX: x,
                coordenadaY: y
            });

    }

    postitSeleccionado = null;
});
/*
db.collection("postits").get().then((resultado) => {

    console.log("Documentos encontrados:", resultado.size);

    resultado.forEach((documento) => {

        console.log("Documento:", documento.id);
        console.log("Datos:", documento.data());

    });

}).catch((error) => {

    console.log("ERROR:", error);

});
*/

//===============================================================================================================================================================================
// Función al aplicar doble click en el postit y editar el texto // preguntado a la IA: ¿Cómo puedo editar el texto de un post-it al hacer doble clic en él?
//===============================================================================================================================================================================
// Contenido por repasar...
let ultimoToque = 0;
let postitTocado = null;
let inicioX = 0;
let inicioY = 0;

tablero.addEventListener("pointerdown", function(event) {

    postitTocado = event.target.closest(".postit");

    inicioX = event.clientX;
    inicioY = event.clientY;

});

tablero.addEventListener("pointerup", function(event) {

    if (event.pointerType !== "touch" || postitTocado === null) return;

    let movimientoX = Math.abs(event.clientX - inicioX);
    let movimientoY = Math.abs(event.clientY - inicioY);

    if (movimientoX > 10 || movimientoY > 10) {
        ultimoToque = 0;
        postitTocado = null;
        return;
    }

    let tiempo = Date.now();

    if (tiempo - ultimoToque < 400 && event.target.closest(".postit") === postitTocado) {

        let nuevoTexto = prompt("Nuevo texto:");

        if (nuevoTexto !== null && nuevoTexto.trim() !== "") {

            postitTocado.textContent = nuevoTexto;

            db.collection("postits").doc(postitTocado.dataset.id).update({
                texto: nuevoTexto
            });
        }
        ultimoToque = 0;
    } 
    else {
        ultimoToque = tiempo;
    }

    postitTocado = null;

});