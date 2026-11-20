// =====================================================================
// main.js - Punto de entrada de todas las pantallas
//
// Solo lo esencial se importa de forma fija: el inicio de sesión y el menú.
// El módulo de cada pantalla se carga únicamente cuando se abre esa pantalla.
// Así, si un archivo falta o tiene un error, solo falla esa pantalla:
// el menú, el cierre de sesión y las demás pantallas siguen funcionando,
// y el motivo queda escrito en la consola del navegador (F12).
// =====================================================================

import { login, validarToken } from './inicio.js';
import { validarUsuario, menu, salir } from './panelbootstrap.js';

// Carga un módulo y ejecuta lo que corresponda. Un fallo aquí no afecta al resto.
function usar(ruta, accion) {
    import(ruta)
        .then(accion)
        .catch((e) => console.error(`No se pudo cargar ${ruta}:`, e));
}

const pagina = (nombre) => location.pathname.includes(nombre);

document.addEventListener("DOMContentLoaded", () => {
    // Preferencias de este dispositivo (reducir animaciones). Se aplican en todas las pantallas.
    usar('./preferencias.js', (m) => m.aplicarPreferencias());

    if (pagina("inicio.html")) {
        validarToken();
    } else {
        validarUsuario();
        menu();

        // Recordatorio diario (solo si la persona lo activó en Configuración)
        usar('./preferencias.js', (m) => m.mostrarRecordatorio());

        if (pagina("Registro_emocional.html")) usar('./emocional.js', (m) => m.cargarEmociones());
        if (pagina("Evolucionemocional.html")) usar('./emocional.js', (m) => m.cargarEstadisticas());
        if (pagina("Retroalimentacion.html")) {
            usar('./recomendaciones.js', (m) => {
                m.cargarSugerencia();
                m.mostrarInspiracionDelDia();
                if (m.cargarEstadoAlerta) m.cargarEstadoAlerta();
            });
        }
        if (pagina("Participacion_foros.html")) usar('./foros.js', (m) => m.cargarForos());
        if (pagina("Moderacion_contenido_foros.html")) usar('./moderacion.js', (m) => m.cargarModeracion());
        if (pagina("Recomendaciones.html")) usar('./biblioteca.js', (m) => m.cargarBiblioteca());
        if (pagina("Perfil.html")) usar('./perfil.js', (m) => m.cargarPerfil());
        if (pagina("Configuracion.html")) usar('./configuracion.js', (m) => m.cargarConfiguracion());
    }
});

document.addEventListener("submit", (event) => {
    if (event.target && event.target.id === "formlogin") {
        event.preventDefault();
        login();
    }
});

document.addEventListener("click", (e) => {
    // closest: funciona aunque el clic caiga en el ícono o en el texto "Cerrar sesión",
    // que son elementos dentro del enlace (antes solo funcionaba en el borde del botón)
    const $salir = e.target && e.target.closest ? e.target.closest("#salir") : null;
    if ($salir) {
        e.preventDefault();
        salir();
    }
});
