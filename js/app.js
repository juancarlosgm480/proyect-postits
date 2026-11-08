
//===================================
// Obtención del tablero
//===================================
const tablero = document.getElementById("tablero");

console.log("APP.JS FUNCIONA, por fiiin!!");

//===================================
// Obtener post-its en Firebase
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
// Cargar posición del botón
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

//===================================
// Mostrar formulario
//===================================
let click = 0;

function click_button() {

    const contenedor = document.querySelector('.formulario');

    click++;

    if (click > 1) {
        click = 0;
    }

    if (click === 1) {
        contenedor.classList.add('modo-flex');
    } else {
        contenedor.classList.remove('modo-flex');
    }
}

//===================================
// Mover post-its
//===================================
let postitSeleccionado = null;

let offsetX = 0;
let offsetY = 0;

// Tocar post-it
tablero.addEventListener("pointerdown", function(event) {

    let elemento = event.target.closest(".postit, #crearPostit");

    if (!elemento) return;

    postitSeleccionado = elemento;

    offsetX = event.clientX - elemento.offsetLeft;
    offsetY = event.clientY - elemento.offsetTop;

    tablero.setPointerCapture(event.pointerId);

});

// Mover post-it
tablero.addEventListener("pointermove", function(event) {

    if (postitSeleccionado === null) return;

    postitSeleccionado.style.left = (event.clientX - offsetX) + "px";
    postitSeleccionado.style.top = (event.clientY - offsetY) + "px";

});

// Soltar post-it y guardar posición
tablero.addEventListener("pointerup", function() {

    if (postitSeleccionado === null) return;

    let x = postitSeleccionado.offsetLeft;
    let y = postitSeleccionado.offsetTop;

    if (postitSeleccionado.id === "crearPostit") {

        db.collection("postits").where("ID", "==", "crearPostit").get().then(resultado => {

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

// Si se interrumpe el movimiento
tablero.addEventListener("pointercancel", function() {
    postitSeleccionado = null;
});

//===================================
// Editar post-it con doble toque
//===================================
let ultimoToque = 0;
let ultimoPostit = null;
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

    let movimiento = Math.abs(event.clientX - inicioX) + Math.abs(event.clientY - inicioY);

    if (movimiento > 10) {
        ultimoToque = 0;
        postitTocado = null;
        return;
    }

    let tiempo = Date.now();

    if (tiempo - ultimoToque < 400 && ultimoPostit === postitTocado) {

        let texto = prompt("Nuevo texto:");

        if (texto !== null && texto.trim() !== "") {

            postitTocado.textContent = texto;

            db.collection("postits").doc(postitTocado.dataset.id).update({
                texto: texto
            });

        }

        ultimoToque = 0;

    } else {

        ultimoToque = tiempo;

    }

    ultimoPostit = postitTocado;
    postitTocado = null;

});

//===================================
// Agregar post-its
//===================================
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    let texto = document.getElementById("texto").value;
    let color = document.getElementById("opciones").value;

    db.collection("postits").add({

        texto: texto,
        color: color,
        coordenadaX: 100,
        coordenadaY: 100

    }).then(() => {

        location.reload();

    });

});
