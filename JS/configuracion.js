// =====================================================================
// configuracion.js - Pantalla de Configuración (Configuracion.html)
// Se llama desde main.js solo en Configuracion.html
//
// Tiene tres cosas, todas reales:
//  - Preferencias de este dispositivo (se guardan solo en el navegador).
//  - Descargar mis datos (el servidor entrega SOLO los datos de la persona de la sesión).
//  - Cambiar la contraseña (el servidor comprueba la actual y guarda la nueva con hash robusto).
// Quién eres lo decide el servidor por la sesión. Todo el texto se inserta con textContent.
// =====================================================================

import { enviarPeticion, ir } from "./herramientas.js";
import {
    fechaLocal, movimientoActivo, guardarMovimiento,
    recordatorioActivo, guardarRecordatorio, mostrarRecordatorio
} from "./preferencias.js";

const API = "../backend/vista_configuracion/index.php";

const MINIMO_CLAVE = 8;
const BYTES_MAXIMOS = 72; // el servidor guarda la contraseña con bcrypt, que solo usa los primeros 72 bytes

const estado = { sesionVencida: false };
const $ = {}; // referencias a elementos del HTML

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
// enviarPeticion (herramientas.js) trabaja con una función de respuesta (fSucces).
// Aquí se envuelve en una promesa para poder usar await. Nunca falla:
// ante cualquier error entrega { code, msg }, así que siempre se resuelve.
function pedir(params) {
    return new Promise((resolve) => {
        enviarPeticion({ url: API, method: "GET", params, fSucces: resolve });
    });
}

function enviar(cuerpo) {
    return new Promise((resolve) => {
        enviarPeticion({ url: API, method: "POST", params: cuerpo, fSucces: resolve });
    });
}

function mostrarMsg($p, texto, esError) {
    $p.textContent = texto;
    $p.classList.toggle("hidden", !texto);
    $p.classList.toggle("text-error", !!esError);
    $p.classList.toggle("text-secondary", !esError);
}

function mostrarToast(texto) {
    $.toastTexto.textContent = texto;
    $.toast.classList.remove("translate-y-20", "opacity-0");
    setTimeout(() => $.toast.classList.add("translate-y-20", "opacity-0"), 3000);
}

// El servidor ya no reconoce la sesión (venció o se cerró): se vuelve al inicio de sesión
function sesionVencida() {
    if (estado.sesionVencida) return;
    estado.sesionVencida = true;
    mostrarMsg($.pwdMsg, "Tu sesión venció. Te llevaremos al inicio de sesión...", true);
    setTimeout(() => {
        localStorage.clear();
        ir("inicio.html");
    }, 2500);
}

// ---------------------------------------------------------------------
// Preferencias de este dispositivo
// ---------------------------------------------------------------------
function iniciarPreferencias() {
    $.prefRecordatorio.checked = recordatorioActivo();
    $.prefMovimiento.checked = movimientoActivo();

    $.prefRecordatorio.addEventListener("change", () => {
        guardarRecordatorio($.prefRecordatorio.checked);
        if ($.prefRecordatorio.checked) {
            mostrarToast("Recordatorio activado en este dispositivo.");
            mostrarRecordatorio(); // si hoy aún no registraste nada, se ve el aviso de inmediato
        } else {
            mostrarToast("Recordatorio desactivado.");
        }
    });

    $.prefMovimiento.addEventListener("change", () => {
        guardarMovimiento($.prefMovimiento.checked); // se aplica al instante
        mostrarToast($.prefMovimiento.checked ? "Animaciones reducidas." : "Animaciones restauradas.");
    });
}

// ---------------------------------------------------------------------
// Descargar mis datos
// ---------------------------------------------------------------------
// ---- Archivo de texto legible (se abre con el Bloc de notas) ----
const NOMBRES_ROL = { ADMINISTRADOR: "Administrador", MODERADOR: "Moderador", CLIENTE: "Miembro" };
const ESTADOS_HILO = { aprobada: "publicada", pendiente: "pendiente de revisión", rechazada: "no publicada" };

function fechaLarga(fecha) {
    const d = new Date(String(fecha).replace(" ", "T"));
    return isNaN(d) ? String(fecha ?? "") : d.toLocaleString("es", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
}

// Las líneas siguientes de un texto largo se sangran, para que se lea como un solo bloque
function sangrar(texto) {
    return String(texto ?? "").trim().replace(/\r?\n/g, "\r\n    ");
}

export function construirTexto(datos) {
    const raya = "=".repeat(60);
    const seccion = (titulo) => ["", raya, titulo, raya];
    const cuenta = datos.cuenta || {};
    const emociones = datos.emociones || [];
    const publicaciones = datos.publicaciones || [];
    const respuestas = datos.respuestas || [];

    const l = [
        "MIS DATOS EN CLARAMENTE",
        `Generado el ${fechaLarga(datos.GENERADO)}`,
        "",
        "Este archivo es una copia de la información que Claramente guarda sobre ti.",
        "Contiene datos personales y emocionales: guárdalo en un lugar seguro.",
        ...seccion("CUENTA"),
        `Nombre: ${[cuenta.NOMBRES, cuenta.APELLIDOS].filter(Boolean).join(" ")}`,
        `Correo: ${cuenta.EMAIL ?? ""}`,
        `Tipo de cuenta: ${NOMBRES_ROL[cuenta.ROL] || "Miembro"}`,
        ...seccion(`REGISTROS EMOCIONALES (${emociones.length})`)
    ];
    if (!emociones.length) l.push("Aún no tienes registros emocionales.");
    emociones.forEach((e) => {
        l.push("", `${fechaLarga(e.FECHA)} — ${e.EMOCION} — intensidad ${e.INTENSIDAD}/10`);
        if (e.COMENTARIO && String(e.COMENTARIO).trim()) l.push(`    Comentario: ${sangrar(e.COMENTARIO)}`);
    });

    l.push(...seccion(`PUBLICACIONES EN LOS FOROS (${publicaciones.length})`));
    if (!publicaciones.length) l.push("Aún no has publicado en los foros.");
    publicaciones.forEach((p) => {
        l.push("", `${fechaLarga(p.FECHA)} — Foro: ${p.FORO} — ${ESTADOS_HILO[p.ESTADO] || p.ESTADO}`);
        if (p.TITULO) l.push(`    Título: ${sangrar(p.TITULO)}`);
        l.push(`    Mensaje: ${sangrar(p.CONTENIDO)}`);
    });

    l.push(...seccion(`RESPUESTAS EN LOS FOROS (${respuestas.length})`));
    if (!respuestas.length) l.push("Aún no has respondido en los foros.");
    respuestas.forEach((r) => {
        l.push("", `${fechaLarga(r.FECHA)} — en el hilo: ${r.HILO || "(sin título)"}`, `    ${sangrar(r.CONTENIDO)}`);
    });

    return l.join("\r\n") + "\r\n"; // saltos de línea de Windows, para el Bloc de notas
}

function guardarArchivo(datos) {
    // "\uFEFF" al inicio: así el Bloc de notas reconoce las tildes y la ñ
    const blob = new Blob(["\uFEFF" + construirTexto(datos)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const $a = document.createElement("a");
    $a.href = url;
    $a.download = `claramente_mis_datos_${fechaLocal()}.txt`;
    document.body.appendChild($a);
    $a.click();
    $a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function descargarDatos() {
    $.btnDescargar.disabled = true;
    mostrarMsg($.datosMsg, "Preparando tu archivo...", false);
    try {
        const resp = await pedir({ id: "exportar" });
        if (resp.code == 401) {
            mostrarMsg($.datosMsg, "", false);
            return sesionVencida();
        }
        if (resp.code != 200 || !resp.datos) {
            mostrarMsg($.datosMsg, "No pudimos preparar tu archivo. Intenta de nuevo en unos minutos.", true);
            return;
        }
        guardarArchivo(resp.datos);
        mostrarMsg($.datosMsg, "Listo: se descargó tu archivo. Guárdalo en un lugar seguro, porque contiene información personal.", false);
    } finally {
        $.btnDescargar.disabled = false;
    }
}

// ---------------------------------------------------------------------
// Cambiar la contraseña
// ---------------------------------------------------------------------
function limpiarFormulario() {
    $.pwdActual.value = "";
    $.pwdNueva.value = "";
    $.pwdConfirmar.value = "";
}

// Muestra el error y pone el foco en el campo que lo causó. Devuelve false para poder usar "return error(...)"
function error(texto, $campo) {
    mostrarMsg($.pwdMsg, texto, true);
    if ($campo) $campo.focus();
    return false;
}

async function cambiarClave(evento) {
    evento.preventDefault();

    const actual = $.pwdActual.value;
    const nueva = $.pwdNueva.value;
    const confirmar = $.pwdConfirmar.value;

    if (!actual) return error("Escribe tu contraseña actual.", $.pwdActual);
    if (nueva.length < MINIMO_CLAVE) return error(`La nueva contraseña debe tener al menos ${MINIMO_CLAVE} caracteres.`, $.pwdNueva);
    if (new TextEncoder().encode(nueva).length > BYTES_MAXIMOS) {
        return error(`La nueva contraseña es demasiado larga (máximo ${BYTES_MAXIMOS} caracteres).`, $.pwdNueva);
    }
    if (nueva === actual) return error("La nueva contraseña debe ser distinta de la actual.", $.pwdNueva);
    if (nueva !== confirmar) return error("Las contraseñas nuevas no coinciden.", $.pwdConfirmar);

    mostrarMsg($.pwdMsg, "", false);
    $.btnCambiar.disabled = true; // evita enviar dos veces con un doble clic
    try {
        const resp = await enviar({ accion: "cambiar_clave", actual, nueva });

        if (resp.code == 200) {
            limpiarFormulario();
            mostrarMsg($.pwdMsg, "Tu contraseña se actualizó.", false);
            mostrarToast("¡Contraseña actualizada!");
        } else if (resp.code == 403) {
            error("La contraseña actual no es correcta.", $.pwdActual);
        } else if (resp.code == 401) {
            sesionVencida();
        } else if (resp.code == 400) {
            mostrarMsg($.pwdMsg, `Revisa los datos: la nueva contraseña debe tener entre ${MINIMO_CLAVE} y ${BYTES_MAXIMOS} caracteres y ser distinta de la actual.`, true);
        } else {
            mostrarMsg($.pwdMsg, "No pudimos cambiar tu contraseña. Intenta de nuevo en unos minutos.", true);
        }
    } finally {
        $.btnCambiar.disabled = false;
    }
}

// ---------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------
function referenciar() {
    const ids = {
        prefRecordatorio: "pref-recordatorio", prefMovimiento: "pref-movimiento",
        btnDescargar: "btn-descargar-datos", datosMsg: "datos-msg",
        formClave: "password-form", pwdActual: "pwd-actual", pwdNueva: "pwd-nueva", pwdConfirmar: "pwd-confirmar", pwdMsg: "pwd-msg",
        btnCancelar: "btn-cancelar-clave", btnCambiar: "btn-cambiar-clave",
        toast: "toast-success", toastTexto: "toast-texto"
    };
    Object.entries(ids).forEach(([clave, id]) => { $[clave] = document.getElementById(id); });
}

// Se llama desde main.js solo en Configuracion.html
export function cargarConfiguracion() {
    if (!document.getElementById("content-config")) return;
    referenciar();
    iniciarPreferencias();

    $.btnDescargar.addEventListener("click", descargarDatos);
    $.formClave.addEventListener("submit", cambiarClave);
    $.btnCancelar.addEventListener("click", () => {
        limpiarFormulario();
        mostrarMsg($.pwdMsg, "", false);
    });
}
