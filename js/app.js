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

let click = 0;

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

tablero.addEventListener("pointerdown", function(event) {

    
    let elemento = event.target;

    if (elemento.classList.contains("postit" || "crearPostit")) {
        postitSeleccionado = elemento;
        offsetX = event.clientX - elemento.offsetLeft;
        offsetY = event.clientY - elemento.offsetTop;
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

tablero.addEventListener("pointerup", function(event) {
    if (postitSeleccionado !== null) {
        let x = postitSeleccionado.offsetLeft;
        let y = postitSeleccionado.offsetTop;

        db.collection("postits").doc(postitSeleccionado.dataset.id).update({
            coordenadaX: x,
            coordenadaY: y
            
        }).then(() => {
                
            console.log("Post-it actualizado correctamente");
            postitSeleccionado = null;
            
        }).catch((error) => {
            console.error("Error al actualizar el post-it:", error);
        });
        
        postitSeleccionado = null;
    }
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