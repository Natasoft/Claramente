import { login, validarToken } from './inicio.js';
import { validarUsuario, menu, salir } from './panelbootstrap.js';
import { cargarEmociones, cargarEstadisticas } from './emocional.js';
import { cargarSugerencia, mostrarInspiracionDelDia, cargarEstadoAlerta } from './recomendaciones.js';
import { cargarForos } from './foros.js';

document.addEventListener("DOMContentLoaded", (Event) => {
    //console.log(location.pathname);
    //if (location.pathname.includes("panelbootstrap.html")) 
    if (location.pathname.includes("inicio.html")) {
        validarToken();
    } else {
        validarUsuario();
        menu();
        if (location.pathname.includes("Registro_emocional.html")) cargarEmociones();
        if (location.pathname.includes("Evolucionemocional.html")) cargarEstadisticas();
        if (location.pathname.includes("Retroalimentacion.html")) {
            cargarSugerencia();
            mostrarInspiracionDelDia();
            cargarEstadoAlerta();
        }
        if (location.pathname.includes("Participacion_foros.html")) cargarForos();
    }
});

document.addEventListener("submit", (event) => {
    if (event.target && event.target.id === "formlogin") {
        event.preventDefault();
        login();
    }
});

document.addEventListener("click", (e) => {
    //console.log(e.target);
    if (e.target && e.target.id === "salir") {
        salir();
    }
});
