//===================================
//Obstención del tablero
//===================================
const tablero = document.getElementById("tablero");
console.log("APP.JS FUNCIONA, por fiiin!!");

//===================================
//Obstener post-its en firebase
//===================================
db.collection("postits").onSnapshot((resultado) => {
    tablero.querySelectorAll(".postit").forEach(postit => postit.remove());

    resultado.forEach((documento) => {
        const datos = documento.data();

        if (datos.ID === "crearPostit") {
            let boton = document.getElementById("crearPostit");
            boton.style.left = datos.coordenadaX + "px";
            boton.style.top = datos.coordenadaY + "px";
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
}, (error) => console.log(error));

//===================================
//Mostrar y ocultar formulario
//===================================
let click = 0;

function click_button() {
    const contenedor = document.querySelector('.formulario');
    click++;
    if (click > 1) click = 0;

    if (click === 1) contenedor.classList.add('modo-flex');
    else contenedor.classList.remove('modo-flex');
}

//====================================
//Variables para mover los post-its
//====================================
let postitSeleccionado = null;
let posicionInicialX = 0;
let posicionInicialY = 0;
let offsetX = 0;
let offsetY = 0;
let tiempoInicio = 0;

//====================================
//Obtener elemento mediante pointerdown
//====================================
tablero.addEventListener("pointerdown", function(event) {
    let elemento = event.target.closest(".postit, #crearPostit");

    if (elemento) {
        postitSeleccionado = elemento;
        posicionInicialX = elemento.offsetLeft;
        posicionInicialY = elemento.offsetTop;
        offsetX = event.clientX - elemento.offsetLeft;
        offsetY = event.clientY - elemento.offsetTop;
        tiempoInicio = Date.now();
        tablero.setPointerCapture(event.pointerId);
    }
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

    let movimientoX = postitSeleccionado.offsetLeft - posicionInicialX;
    let movimientoY = postitSeleccionado.offsetTop - posicionInicialY;
    let tiempo = Date.now() - tiempoInicio;

    if (postitSeleccionado.classList.contains("postit") && Math.abs(movimientoX) > 80 && Math.abs(movimientoX) > Math.abs(movimientoY) && tiempo < 500) {
        let confirmar = confirm("¿Quieres eliminar este post-it?");

        if (confirmar) {
            db.collection("postits").doc(postitSeleccionado.dataset.id).delete();
        } else {
            postitSeleccionado.style.transition = "left 0.3s, top 0.3s";
            postitSeleccionado.style.left = posicionInicialX + "px";
            postitSeleccionado.style.top = posicionInicialY + "px";
            setTimeout(() => postitSeleccionado.style.transition = "", 300);
        }

        postitSeleccionado = null;
        return;
    }

    let x = postitSeleccionado.offsetLeft;
    let y = postitSeleccionado.offsetTop;

    if (postitSeleccionado.id === "crearPostit") {
        db.collection("postits").where("ID", "==", "crearPostit").get().then(resultado => {
            resultado.forEach(documento => {
                documento.ref.update({coordenadaX: x, coordenadaY: y});
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

//===============================================================================================================================================================================
// Función al aplicar doble click en el postit y editar el texto // preguntado a la IA: ¿Cómo puedo editar el texto de un post-it al hacer doble clic en él?
//===============================================================================================================================================================================
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
        let texto = prompt("Nuevo texto:", postitTocado.textContent);

        if (texto !== null && texto.trim() !== "") {
            let colorActual = Array.from(postitTocado.classList).find(clase => clase !== "postit");
            let color = prompt("Nuevo color: amarillo, rosa, azul o verde", colorActual);
            let colores = ["amarillo", "rosa", "azul", "verde"];

            if (color === null || !colores.includes(color)) color = colorActual;

            db.collection("postits").doc(postitTocado.dataset.id).update({
                texto: texto,
                color: color
            });
        }
        ultimoToque = 0;
    } else {
        ultimoToque = tiempo;
    }

    ultimoPostit = postitTocado;
    postitTocado = null;
});

//====================================================
// Función: agregar postits
//====================================================
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    let texto = document.getElementById("texto").value.trim();
    let color = document.getElementById("opciones").value;

    if (texto === "") return;

    let x = tablero.clientWidth / 2 - 75;
    let y = tablero.clientHeight / 2 - 75;
    let nuevoPostit = db.collection("postits").doc();

    nuevoPostit.set({
        id: nuevoPostit.id,
        texto: texto,
        color: color,
        coordenadaX: x,
        coordenadaY: y,
        fechaCreacion: new Date()
    }).then(() => {
        formulario.reset();
        formulario.classList.remove("modo-flex");
        click = 0;
    }).catch(error => console.log(error));
});