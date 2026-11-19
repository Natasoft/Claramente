// =====================================================================
// preferencias.js - Preferencias de este dispositivo
// Lo usa main.js en todas las pantallas y la página de Configuración.
//
// Las preferencias se guardan SOLO en este navegador (localStorage):
// no se envía ni se guarda nada en la base de datos.
//  - Reducir animaciones: si la persona no eligió nada, se respeta lo que
//    tenga activado su sistema ("reducir movimiento").
//  - Recordatorio diario: un aviso dentro de la aplicación si hoy aún no
//    registró cómo se siente. No envía correos ni notificaciones externas.
// =====================================================================

import { enviarPeticion } from "./herramientas.js";

const API = "../backend/vista_configuracion/index.php";

const CLAVE_MOVIMIENTO = "pref_movimiento";          // "1" = reducir · "0" = no reducir · vacío = según el sistema
const CLAVE_RECORDATORIO = "pref_recordatorio";      // "1" = activado
const CLAVE_DESCARTADO = "recordatorio_descartado";  // fecha del día en que dijo "Hoy no"

// Estilos propios (no dependen de Tailwind ni de Bootstrap, para verse igual en cualquier pantalla)
const ESTILOS = `
.reducir-movimiento *, .reducir-movimiento *::before, .reducir-movimiento *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
}
.cl-recordatorio {
    position: fixed; top: 84px; left: 50%; transform: translateX(-50%); z-index: 9999;
    max-width: min(92vw, 520px); display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center;
    padding: 12px 18px; background: #ffffff; color: #1d1b20; border: 1px solid #cac4d0; border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
}
.cl-recordatorio a { background: #68548d; color: #ffffff; padding: 6px 16px; border-radius: 999px; text-decoration: none; font-weight: 600; }
.cl-recordatorio button { background: transparent; border: 0; color: #49454f; cursor: pointer; padding: 6px 10px; font: inherit; }
.cl-recordatorio a:focus-visible, .cl-recordatorio button:focus-visible { outline: 2px solid #68548d; outline-offset: 2px; }
`;

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
function leer(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
}

function guardar(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* navegador sin almacenamiento: la preferencia no se conserva */ }
}

// Fecha de hoy en la hora de la persona: "2026-11-12"
export function fechaLocal() {
    const d = new Date();
    const dos = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

function inyectarEstilos() {
    if (document.getElementById("cl-estilos")) return;
    const $estilo = document.createElement("style");
    $estilo.id = "cl-estilos";
    $estilo.textContent = ESTILOS;
    document.head.appendChild($estilo);
}

// ---------------------------------------------------------------------
// Reducir animaciones
// ---------------------------------------------------------------------
export function movimientoActivo() {
    const valor = leer(CLAVE_MOVIMIENTO);
    if (valor === "1") return true;
    if (valor === "0") return false;
    // Sin elección propia: se respeta la configuración del sistema operativo
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function aplicarMovimiento() {
    const activo = movimientoActivo();
    if (activo) inyectarEstilos();
    document.documentElement.classList.toggle("reducir-movimiento", activo);
}

export function guardarMovimiento(si) {
    guardar(CLAVE_MOVIMIENTO, si ? "1" : "0");
    aplicarMovimiento(); // se ve al instante, sin recargar
}

// Se llama al cargar cada pantalla (también la de inicio de sesión)
export function aplicarPreferencias() {
    aplicarMovimiento();
}

// ---------------------------------------------------------------------
// Recordatorio diario
// ---------------------------------------------------------------------
export function recordatorioActivo() {
    return leer(CLAVE_RECORDATORIO) === "1";
}

export function guardarRecordatorio(si) {
    guardar(CLAVE_RECORDATORIO, si ? "1" : "0");
}

function pintarRecordatorio() {
    inyectarEstilos();

    const $caja = document.createElement("div");
    $caja.className = "cl-recordatorio";
    $caja.setAttribute("role", "status");

    const $texto = document.createElement("span");
    $texto.textContent = "¿Cómo te sientes hoy? Registrarlo toma un minuto.";

    const $registrar = document.createElement("a");
    $registrar.href = "Registro_emocional.html";
    $registrar.textContent = "Registrar ahora";

    const $hoyNo = document.createElement("button");
    $hoyNo.type = "button";
    $hoyNo.textContent = "Hoy no";
    $hoyNo.addEventListener("click", () => {
        guardar(CLAVE_DESCARTADO, fechaLocal()); // no vuelve a aparecer hoy
        $caja.remove();
    });

    $caja.append($texto, $registrar, $hoyNo);
    document.body.appendChild($caja);
}

// Se llama desde main.js en las pantallas internas. Solo muestra el aviso si:
// está activado, hoy no dijo "Hoy no", no está ya en la pantalla de registro y el servidor confirma
// (por la sesión) que hoy aún no registró una emoción.
export async function mostrarRecordatorio() {
    if (!recordatorioActivo()) return;
    if (location.pathname.includes("Registro_emocional")) return;
    if (leer(CLAVE_DESCARTADO) === fechaLocal()) return;
    if (document.querySelector(".cl-recordatorio")) return;

    const resp = await new Promise((resolve) => {
        enviarPeticion({ url: API, method: "GET", params: { id: "registro-hoy" }, fSucces: resolve });
    });
    // Si algo falla (sesión vencida, servidor caído), simplemente no se muestra nada
    if (resp.code != 200 || resp.registrado_hoy !== false) return;
    if (document.querySelector(".cl-recordatorio")) return;

    pintarRecordatorio();
}
