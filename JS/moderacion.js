// =====================================================================
// moderacion.js - Panel de moderación (Moderacion_contenido_foros.html)
// Se llama desde main.js solo en Moderacion_contenido_foros.html
//
// Aquí solo se muestra y se envía. Quién puede ver o decidir qué lo comprueba
// el servidor en cada petición (backend/vista_moderacion), no esta página.
// Todo el texto de los usuarios se inserta con textContent (nunca como HTML).
// =====================================================================

import { enviarPeticion, ir } from "./herramientas.js";

const API = "../backend/vista_moderacion/index.php";

const CLASES_CHIP_ACTIVO = ["bg-primary-container", "text-on-primary-container"];
const CLASES_CHIP_INACTIVO = ["bg-surface-container-high", "text-on-surface-variant"];

const MENSAJES_VACIO = {
    pendientes: "No hay publicaciones pendientes. ¡Todo al día!",
    aprobadas: "Aún no hay publicaciones aprobadas.",
    rechazadas: "No hay publicaciones rechazadas."
};

const ETIQUETA_ESTADO = {
    pendiente: "Pendiente de revisión",
    aprobada: "Aprobada",
    rechazada: "Rechazada"
};

const estado = {
    filtro: "pendientes",  // "pendientes" | "aprobadas" | "rechazadas"
    idForo: "",            // "" = todos los foros que modera
    token: 0,              // evita que una respuesta lenta pise a una más nueva
    abierta: null,         // id de la publicación abierta en la ventana
    bloqueado: false,      // true si la persona no tiene acceso al panel
    sesionVencida: false
};

const $ = {}; // referencias a elementos del HTML

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
function el(tag, clases = "", texto = null) {
    const nodo = document.createElement(tag);
    if (clases) nodo.className = clases;
    if (texto !== null) nodo.textContent = texto;
    return nodo;
}

function formatearFecha(fecha) {
    const d = new Date(String(fecha).replace(" ", "T"));
    if (isNaN(d)) return "";
    return d.toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

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

function filaMensaje(texto) {
    const $tr = el("tr");
    const $td = el("td", "px-4 py-10 text-center text-on-surface-variant", texto);
    $td.colSpan = 5;
    $tr.appendChild($td);
    return $tr;
}

function mostrarMsg(texto, esError) {
    $.msg.textContent = texto;
    $.msg.classList.toggle("hidden", !texto);
    $.msg.classList.toggle("text-error", !!esError);
    $.msg.classList.toggle("text-secondary", !esError);
}

// El servidor ya no reconoce la sesión (venció o se cerró): se vuelve al inicio de sesión
function sesionVencida() {
    if (estado.sesionVencida) return;
    estado.sesionVencida = true;
    estado.bloqueado = true;
    $.tbody.replaceChildren(filaMensaje("Tu sesión venció. Te llevaremos al inicio de sesión..."));
    setTimeout(() => {
        localStorage.clear();
        ir("inicio.html");
    }, 2500);
}

// ---------------------------------------------------------------------
// Métricas y listado
// ---------------------------------------------------------------------
async function cargarResumen() {
    const params = { id: "resumen" };
    if (estado.idForo) params.id_foro = estado.idForo;

    const resp = await pedir(params);
    if (resp.code == 401) return sesionVencida();
    if (resp.code != 200 || !resp.datos || resp.datos.length === 0) return;

    const r = resp.datos[0];
    $.metPendientes.textContent = r.PENDIENTES;
    $.metAprobadas.textContent = r.APROBADAS;
    $.metRechazadas.textContent = r.RECHAZADAS;
}

function filaPublicacion(p) {
    const $tr = el("tr", "bg-surface hover:bg-surface-container-low transition-colors rounded-2xl");

    const $autor = el("td", "px-4 py-5 rounded-l-2xl");
    const $cajaAutor = el("div", "flex items-center gap-3");
    $cajaAutor.append(
        el("div", "w-8 h-8 shrink-0 rounded-full bg-lila-suave/30 flex items-center justify-center text-primary font-bold text-xs", p.INICIAL || "?"),
        el("span", "", p.AUTOR)
    );
    $autor.appendChild($cajaAutor);

    const $foro = el("td", "px-4 py-5");
    $foro.appendChild(el("span", "bg-calm-peach/30 text-ink-dark px-3 py-1 rounded-full text-xs whitespace-nowrap", p.FORO));

    const $publicacion = el("td", "px-4 py-5 max-w-xs");
    $publicacion.append(
        el("p", "font-bold text-on-surface truncate", p.TITULO || "(Sin título)"),
        el("p", "text-sm text-on-surface-variant truncate", p.RESUMEN)
    );

    const $fecha = el("td", "px-4 py-5 text-on-surface-variant text-sm whitespace-nowrap", formatearFecha(p.FECHA_PUBLICACION));

    const $acciones = el("td", "px-4 py-5 text-right rounded-r-2xl");
    const $boton = el("button", "px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm hover:brightness-110 transition-all active:scale-95",
        p.ESTADO === "pendiente" ? "Revisar" : "Ver");
    $boton.type = "button";
    $boton.addEventListener("click", () => abrirRevision(p.ID_PARTICIPACION));
    $acciones.appendChild($boton);

    $tr.append($autor, $foro, $publicacion, $fecha, $acciones);
    return $tr;
}

async function cargarLista() {
    const token = ++estado.token;
    $.tbody.replaceChildren(filaMensaje("Cargando publicaciones..."));

    const params = { id: "publicaciones", estado: estado.filtro };
    if (estado.idForo) params.id_foro = estado.idForo;

    const resp = await pedir(params);
    if (token !== estado.token) return; // llegó una petición más nueva
    if (resp.code == 401) return sesionVencida();
    if (resp.code != 200) {
        $.tbody.replaceChildren(filaMensaje("No pudimos cargar las publicaciones. Intenta de nuevo en unos minutos."));
        return;
    }

    const publicaciones = resp.datos || [];
    $.tbody.replaceChildren();

    if (publicaciones.length === 0) {
        $.tbody.appendChild(filaMensaje(MENSAJES_VACIO[estado.filtro]));
        return;
    }

    publicaciones.forEach(p => $.tbody.appendChild(filaPublicacion(p)));

    if (resp.hay_mas) {
        const cuales = estado.filtro === "pendientes" ? "más antiguas" : "más recientes";
        $.tbody.appendChild(filaMensaje(`Se muestran las 50 ${cuales}. Elige un foro para ver menos.`));
    }
}

async function recargar() {
    await Promise.all([cargarResumen(), cargarLista()]);
}

// ---------------------------------------------------------------------
// Ventana de revisión
// ---------------------------------------------------------------------
async function abrirRevision(id) {
    const resp = await pedir({ id: "publicacion", id_participacion: id });
    if (resp.code == 401) return sesionVencida();
    if (resp.code != 200 || !resp.datos || resp.datos.length === 0) {
        alert("No pudimos abrir la publicación. Intenta de nuevo.");
        return;
    }

    const p = resp.datos[0];
    estado.abierta = p.ID_PARTICIPACION;

    $.revForo.textContent = p.FORO;
    $.revTitulo.textContent = p.TITULO || "(Sin título)";
    $.revMeta.textContent = `${p.AUTOR} • ${formatearFecha(p.FECHA_PUBLICACION)} • ${ETIQUETA_ESTADO[p.ESTADO] || ""}`;
    $.revContenido.textContent = p.CONTENIDO;
    $.obs.value = p.OBS_MODERADOR || "";
    mostrarMsg("", false);

    // Una publicación aprobada solo se puede rechazar (ocultar); una rechazada, solo aprobar
    $.btnAprobar.classList.toggle("hidden", p.ESTADO === "aprobada");
    $.btnRechazar.classList.toggle("hidden", p.ESTADO === "rechazada");

    $.dlg.showModal();
    $.dlg.scrollTop = 0;
}

async function decidir(decision) {
    const observacion = $.obs.value.trim();

    if (decision === "rechazar" && observacion.length < 5) {
        mostrarMsg("Escribe el motivo del rechazo (mínimo 5 caracteres).", true);
        return;
    }

    $.btnAprobar.disabled = true;
    $.btnRechazar.disabled = true;
    try {
        const resp = await enviar({ accion: decision, id_participacion: estado.abierta, observacion });

        if (resp.code == 200) {
            $.dlg.close();
            await recargar();
        } else if (resp.code == 401) {
            $.dlg.close();
            sesionVencida();
        } else if (resp.code == 403) {
            mostrarMsg("No tienes permiso para moderar esta publicación.", true);
        } else if (resp.code == 400) {
            mostrarMsg("Revisa los datos e inténtalo de nuevo.", true);
        } else {
            mostrarMsg("No pudimos guardar tu decisión. Intenta de nuevo.", true);
        }
    } finally {
        $.btnAprobar.disabled = false;
        $.btnRechazar.disabled = false;
    }
}

// ---------------------------------------------------------------------
// Eventos e inicio
// ---------------------------------------------------------------------
function marcarChips() {
    document.querySelectorAll("[data-estado]").forEach($b => {
        const activo = $b.dataset.estado === estado.filtro;
        CLASES_CHIP_ACTIVO.forEach(c => $b.classList.toggle(c, activo));
        CLASES_CHIP_INACTIVO.forEach(c => $b.classList.toggle(c, !activo));
    });
}

function enlazarEventos() {
    document.querySelectorAll("[data-estado]").forEach($b => {
        $b.addEventListener("click", () => {
            if (estado.bloqueado) return;
            estado.filtro = $b.dataset.estado;
            marcarChips();
            cargarLista();
        });
    });

    $.selectForo.addEventListener("change", () => {
        if (estado.bloqueado) return;
        estado.idForo = $.selectForo.value;
        recargar();
    });

    $.btnAprobar.addEventListener("click", () => decidir("aprobar"));
    $.btnRechazar.addEventListener("click", () => decidir("rechazar"));

    // Cerrar la ventana: botones "Cerrar" y clic fuera de ella
    $.dlg.querySelectorAll("[data-cerrar]").forEach($b => $b.addEventListener("click", () => $.dlg.close()));
    $.dlg.addEventListener("click", (e) => { if (e.target === $.dlg) $.dlg.close(); });
}

function referenciar() {
    const ids = {
        tbody: "mod-tbody", selectForo: "mod-foro",
        metPendientes: "met-pendientes", metAprobadas: "met-aprobadas", metRechazadas: "met-rechazadas",
        dlg: "dlg-revision", revForo: "rev-foro", revTitulo: "rev-titulo", revMeta: "rev-meta",
        revContenido: "rev-contenido", obs: "mod-obs", msg: "mod-msg",
        btnAprobar: "btn-aprobar", btnRechazar: "btn-rechazar"
    };
    Object.entries(ids).forEach(([clave, id]) => { $[clave] = document.getElementById(id); });
}

// Se llama desde main.js solo en Moderacion_contenido_foros.html
export async function cargarModeracion() {
    if (!document.getElementById("mod-tbody")) return;
    referenciar();
    enlazarEventos();
    marcarChips();
    $.tbody.replaceChildren(filaMensaje("Cargando..."));

    // ¿Esta persona puede entrar al panel? (lo decide el servidor)
    const resp = await pedir({ id: "permisos" });
    if (resp.code == 401) return sesionVencida();

    if (resp.code != 200 || resp.es_moderador !== true) {
        estado.bloqueado = true;
        $.selectForo.disabled = true;
        $.tbody.replaceChildren(filaMensaje(
            resp.code == 200 ? "No tienes acceso a esta sección." : "No pudimos verificar tus permisos. Intenta de nuevo en unos minutos."
        ));
        return;
    }

    (resp.datos || []).forEach(f => $.selectForo.appendChild(new Option(f.TITULO, f.ID_FORO)));
    await recargar();
}
