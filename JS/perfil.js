// =====================================================================
// perfil.js - Pantalla de Perfil (Perfil.html)
// Se llama desde main.js solo en Perfil.html
//
// Muestra los datos que la cuenta ya tiene (nombres, apellidos y correo) y
// permite cambiar nombres y apellidos. No se pide ni se guarda ningún dato nuevo.
// Quién eres lo decide el servidor por la sesión; aquí solo se muestra y se envía.
// Todo el texto se inserta con textContent (nunca como HTML).
// =====================================================================

import { enviarPeticion, ir } from "./herramientas.js";

const API = "../backend/vista_perfil/index.php";

// Mismas reglas que el registro
const REGEX_NOMBRE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

const ROLES = { ADMINISTRADOR: "Administrador", MODERADOR: "Moderador", CLIENTE: "Miembro" };
const TEXTO_ROL = {
    ADMINISTRADOR: "Administra la plataforma",
    MODERADOR: "Modera los foros de la comunidad",
    CLIENTE: "Parte de la comunidad Claramente"
};

const estado = { perfil: null, pendiente: null, sesionVencida: false };
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

// Muestra u oculta un elemento. Se usa la clase "hidden" y también el estilo directo,
// porque algunos elementos traen otra clase de "display" (flex) que podría ganarle.
function mostrar($e, si) {
    $e.classList.toggle("hidden", !si);
    $e.style.display = si ? "" : "none";
}

function mostrarMsg(texto, esError) {
    $.msg.textContent = texto;
    mostrar($.msg, !!texto);
    $.msg.classList.toggle("text-error", !!esError);
    $.msg.classList.toggle("text-secondary", !esError);
}

function formatearMes(fecha) {
    const d = new Date(String(fecha).replace(" ", "T"));
    return isNaN(d) ? "" : d.toLocaleDateString("es", { month: "long", year: "numeric" });
}

function limpiarNombre(texto) {
    return texto.trim().replace(/ {2,}/g, " ");
}

function nombreValido(texto) {
    return texto.length >= 2 && texto.length <= 30 && REGEX_NOMBRE.test(texto);
}

// Igual que en los foros: primer nombre e inicial del apellido ("Elena V.")
function nombreVisible(p) {
    const primero = String(p.NOMBRES || "").trim().split(" ")[0];
    const inicial = String(p.APELLIDOS || "").trim().charAt(0).toUpperCase();
    return inicial ? `${primero} ${inicial}.` : primero;
}

// El servidor ya no reconoce la sesión (venció o se cerró): se vuelve al inicio de sesión
function sesionVencida() {
    if (estado.sesionVencida) return;
    estado.sesionVencida = true;
    mostrarMsg("Tu sesión venció. Te llevaremos al inicio de sesión...", true);
    setTimeout(() => {
        localStorage.clear();
        ir("inicio.html");
    }, 2500);
}

// ---------------------------------------------------------------------
// Pintar los datos
// ---------------------------------------------------------------------
function pintar() {
    const p = estado.perfil;
    const inicial = String(p.NOMBRES || "").trim().charAt(0).toUpperCase();

    $.rol.textContent = ROLES[p.ROL] || "Miembro";
    $.inicial.textContent = inicial || "?";
    $.nombre.textContent = `${p.NOMBRES} ${p.APELLIDOS}`.trim();
    $.tipo.textContent = TEXTO_ROL[p.ROL] || TEXTO_ROL.CLIENTE;

    $.valNombres.textContent = p.NOMBRES;
    $.valApellidos.textContent = p.APELLIDOS;
    $.valCorreo.textContent = p.EMAIL;
    $.valDesde.textContent = p.PRIMER_REGISTRO ? formatearMes(p.PRIMER_REGISTRO) : "Aún no has registrado emociones";
    $.visible.textContent = nombreVisible(p);

    const dias = Number(p.DIAS_30) || 0;
    $.progDias.textContent = `${dias}/30`;
    $.progBarra.style.width = `${Math.min(100, Math.round((dias / 30) * 100))}%`;
    $.progTotal.textContent = String(Number(p.TOTAL_REGISTROS) || 0);
}

// ---------------------------------------------------------------------
// Edición de nombres y apellidos
// ---------------------------------------------------------------------
function modoEdicion(activo) {
    [["valNombres", "inpNombres"], ["valApellidos", "inpApellidos"]].forEach(([valor, campo]) => {
        mostrar($[valor], !activo);
        mostrar($[campo], activo);
    });
    mostrar($.btnEditar, !activo);
    mostrar($.btnCancelar, activo);
    mostrar($.btnGuardar, activo);
    mostrarMsg("", false);

    if (activo) {
        $.inpNombres.value = estado.perfil.NOMBRES;
        $.inpApellidos.value = estado.perfil.APELLIDOS;
        $.inpNombres.focus();
    }
}

// Devuelve los datos limpios, o null si algo está mal (y ya mostró el aviso)
function leerFormulario() {
    const nombres = limpiarNombre($.inpNombres.value);
    const apellidos = limpiarNombre($.inpApellidos.value);

    if (!nombreValido(nombres)) {
        mostrarMsg("Escribe tus nombres (de 2 a 30 letras).", true);
        $.inpNombres.focus();
        return null;
    }
    if (!nombreValido(apellidos)) {
        mostrarMsg("Escribe tus apellidos (de 2 a 30 letras).", true);
        $.inpApellidos.focus();
        return null;
    }
    mostrarMsg("", false);
    return { nombres, apellidos };
}

function guardar() {
    const datos = leerFormulario();
    if (!datos) return;
    estado.pendiente = datos;
    abrirModal();
}

// ---------------------------------------------------------------------
// Ventana de confirmación y aviso de éxito (mismos elementos del diseño)
// ---------------------------------------------------------------------
function abrirModal() {
    $.modal.classList.remove("hidden");
    $.modal.style.display = "";
    // En el siguiente ciclo, para que la transición se vea
    setTimeout(() => {
        $.modal.classList.remove("opacity-0");
        $.modalCaja.classList.remove("scale-95");
        $.modalCaja.classList.add("scale-100");
    }, 10);
}

function cerrarModal() {
    $.modal.classList.add("opacity-0");
    $.modalCaja.classList.remove("scale-100");
    $.modalCaja.classList.add("scale-95");
    setTimeout(() => $.modal.classList.add("hidden"), 300);
}

function mostrarToast(texto) {
    $.toastTexto.textContent = texto;
    $.toast.classList.remove("translate-y-20", "opacity-0");
    setTimeout(() => $.toast.classList.add("translate-y-20", "opacity-0"), 3000);
}

async function confirmarGuardado() {
    const datos = estado.pendiente;
    if (!datos) return;

    $.btnConfirmar.disabled = true;
    try {
        const resp = await enviar({ accion: "actualizar", nombres: datos.nombres, apellidos: datos.apellidos });
        cerrarModal();

        if (resp.code == 200 && resp.datos && resp.datos[0]) {
            estado.perfil = { ...estado.perfil, ...resp.datos[0] };
            estado.pendiente = null;
            pintar();
            modoEdicion(false);

            // El saludo de la barra usa el nombre guardado al iniciar sesión
            localStorage.setItem("user", estado.perfil.NOMBRES);
            const $saludo = document.getElementById("lbUsuario");
            if ($saludo) $saludo.textContent = `, ${estado.perfil.NOMBRES}!`;

            mostrarToast("¡Cambios guardados correctamente!");
        } else if (resp.code == 401) {
            sesionVencida();
        } else if (resp.code == 400) {
            mostrarMsg("Revisa los datos e inténtalo de nuevo.", true);
        } else {
            mostrarMsg("No pudimos guardar tus cambios. Intenta de nuevo en unos minutos.", true);
        }
    } finally {
        $.btnConfirmar.disabled = false;
    }
}

// ---------------------------------------------------------------------
// Eventos e inicio
// ---------------------------------------------------------------------
function enlazarEventos() {
    $.btnEditar.addEventListener("click", () => modoEdicion(true));
    $.btnCancelar.addEventListener("click", () => { pintar(); modoEdicion(false); });
    $.btnGuardar.addEventListener("click", guardar);
    $.btnVolver.addEventListener("click", cerrarModal);
    $.btnConfirmar.addEventListener("click", confirmarGuardado);
    // Clic fuera de la ventana = Volver
    $.modal.addEventListener("click", (e) => { if (e.target === $.modal) cerrarModal(); });
}

function referenciar() {
    const ids = {
        msg: "perfil-msg", rol: "perfil-rol", inicial: "perfil-inicial", nombre: "perfil-nombre", tipo: "perfil-tipo",
        valNombres: "val-nombres", inpNombres: "inp-nombres", valApellidos: "val-apellidos", inpApellidos: "inp-apellidos",
        valCorreo: "val-correo", valDesde: "val-desde", visible: "perfil-visible",
        btnEditar: "btn-editar-perfil", btnCancelar: "btn-cancelar-edicion", btnGuardar: "btn-guardar-perfil",
        progDias: "prog-dias", progBarra: "prog-dias-barra", progTotal: "prog-total",
        toast: "toast-success", toastTexto: "toast-texto",
        modal: "modal-backdrop", modalCaja: "modal-caja", btnVolver: "btn-modal-volver", btnConfirmar: "btn-modal-confirmar"
    };
    Object.entries(ids).forEach(([clave, id]) => { $[clave] = document.getElementById(id); });
}

// Se llama desde main.js solo en Perfil.html
export async function cargarPerfil() {
    if (!document.getElementById("content-perfil")) return;
    referenciar();
    enlazarEventos();

    const resp = await pedir({ id: "perfil" });
    if (resp.code == 401) return sesionVencida();

    if (resp.code != 200 || !resp.datos || !resp.datos[0]) {
        mostrarMsg("No pudimos cargar tu perfil. Intenta de nuevo en unos minutos.", true);
        $.btnEditar.disabled = true; // sin datos no hay nada que editar
        return;
    }

    estado.perfil = resp.datos[0];
    pintar();
}
