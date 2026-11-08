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