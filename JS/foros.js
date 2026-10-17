// =====================================================================
// foros.js - Pantalla "Comunidad" (Participacion_foros.html)
// Se llama desde main.js solo en Participacion_foros.html
//
// Todo el texto escrito por los usuarios se inserta con textContent
// (nunca como HTML), para que nadie pueda inyectar código en la página.
// =====================================================================

import { enviarPeticion } from "./herramientas.js";

const API = "../backend/vista_foros/index.php";

// Colores de las tarjetas (se reparten en orden entre los foros)
const PALETAS = [
    { card: "bg-primary-container/20 border-primary-container/30", titulo: "text-primary", detalle: "text-on-primary-container", etiqueta: "bg-primary-container/20 text-on-primary-container" },
    { card: "bg-calm-peach/20 border-calm-peach/30", titulo: "text-tertiary", detalle: "text-on-tertiary-container", etiqueta: "bg-calm-peach/20 text-on-tertiary-container" },
    { card: "bg-verde-menta/20 border-verde-menta/30", titulo: "text-secondary", detalle: "text-on-secondary-container", etiqueta: "bg-verde-menta/20 text-on-secondary-container" }
];

const CLASES_FILTRO_ACTIVO = ["bg-primary-container", "text-on-primary-container"];
const CLASES_FILTRO_INACTIVO = ["bg-surface-container-high", "text-on-surface-variant"];

const estado = {
    foros: [],
    idForo: null,          // foro seleccionado (null = todos)
    filtro: "recientes",   // "recientes" | "sin-respuesta"
    q: "",                 // texto de búsqueda
    pagina: 1,
    token: 0,              // evita que una respuesta lenta pise a una más nueva
    hiloAbierto: null,
    listaDesactualizada: false
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

function icono(nombre, clases = "") {
    return el("span", "material-symbols-outlined " + clases, nombre);
}

function recortar(texto, max) {
    const t = String(texto || "").trim();
    return t.length > max ? t.slice(0, max).trimEnd() + "…" : t;
}

function tituloDe(h) {
    // Las publicaciones antiguas no tienen título: se usa el inicio del mensaje
    return h.TITULO || recortar(h.RESUMEN || "Publicación", 60);
}

function plural(n, singular, pluralTexto) {
    return `${n} ${Number(n) === 1 ? singular : pluralTexto}`;
}

function tiempoRelativo(fecha) {
    const d = new Date(String(fecha).replace(" ", "T"));
    if (isNaN(d)) return "";
    const seg = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seg < 60) return "Hace un momento";
    const min = Math.floor(seg / 60);
    if (min < 60) return "Hace " + plural(min, "minuto", "minutos");
    const horas = Math.floor(min / 60);
    if (horas < 24) return "Hace " + plural(horas, "hora", "horas");
    const dias = Math.floor(horas / 24);
    if (dias === 1) return "Ayer";
    if (dias < 30) return `Hace ${dias} días`;
    return d.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
}

function paletaDe(idForo) {
    const i = estado.foros.findIndex(f => String(f.ID_FORO) === String(idForo));
    return PALETAS[(i < 0 ? 0 : i) % PALETAS.length];
}

function mostrarMsg($p, texto, esError) {
    $p.textContent = texto;
    $p.classList.toggle("hidden", !texto);
    $p.classList.toggle("text-error", !!esError);
    $p.classList.toggle("text-secondary", !esError);
}

let temporizadorAviso;
function mostrarAviso(texto) {
    $.aviso.textContent = texto;
    $.aviso.classList.remove("hidden");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => $.aviso.classList.add("hidden"), 6000);
}

// ---------------------------------------------------------------------
// Peticiones a vista_foros/index.php
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

// enviarPeticion descarta el cuerpo de las respuestas con error, así que el mensaje
// de validación del servidor no llega (solo "Bad Request"). Por eso se usan
// textos propios; los errores internos del servidor tampoco se exponen.
function mensajeParaUsuario(resp, porDefecto) {
    return resp && resp.code == 400 ? "Revisa los datos que escribiste e inténtalo de nuevo." : porDefecto;
}

// ---------------------------------------------------------------------
// Foros (tarjetas)
// ---------------------------------------------------------------------
async function cargarListaForos() {
    try {
        const resp = await pedir({ id: "foros" });
        if (resp.code != 200) throw new Error(resp.msg);
        estado.foros = resp.datos || [];
        renderForos();
        llenarSelectForos();
    } catch (e) {
        $.grid.replaceChildren(el("p", "font-body-md text-body-md text-on-surface-variant md:col-span-3",
            "No pudimos cargar los foros. Intenta de nuevo en unos minutos."));
    }
}

function renderForos() {
    $.grid.replaceChildren();
    estado.foros.forEach((f, i) => {
        const p = PALETAS[i % PALETAS.length];
        const $b = el("button", `bento-card relative text-left ${p.card} p-8 rounded-[24px] border flex flex-col justify-between h-44 cursor-pointer group`);
        $b.type = "button";
        $b.dataset.foro = f.ID_FORO;
        $b.setAttribute("aria-pressed", "false");

        const $arriba = el("div");
        $arriba.append(icono(f.ICONO || "forum", `${p.titulo} mb-2 block text-4xl`), el("h3", `font-title-lg text-title-lg ${p.titulo}`, f.TITULO));

        const $cantidad = el("span", `absolute top-5 right-6 font-label-sm text-label-sm ${p.detalle}`, plural(f.HILOS, "hilo", "hilos"));

        const $abajo = el("div", "flex justify-between items-center gap-2");
        $abajo.append(
            el("span", `font-label-sm text-label-sm ${p.detalle}`, f.DESCRIPCION),
            icono("arrow_forward", `${p.titulo} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`)
        );

        $b.append($arriba, $cantidad, $abajo);
        $b.addEventListener("click", () => seleccionarForo(f.ID_FORO));
        $.grid.appendChild($b);
    });
    marcarForoActivo();
}

function seleccionarForo(id) {
    estado.idForo = String(estado.idForo) === String(id) ? null : id; // segundo clic = quitar filtro
    marcarForoActivo();
    actualizarTituloHilos();
    cargarHilos();
}

function marcarForoActivo() {
    $.grid.querySelectorAll("[data-foro]").forEach($b => {
        const activo = String($b.dataset.foro) === String(estado.idForo);
        $b.classList.toggle("ring-2", activo);
        $b.classList.toggle("ring-primary", activo);
        $b.setAttribute("aria-pressed", activo ? "true" : "false");
    });
}

function llenarSelectForos() {
    $.pubForo.replaceChildren(new Option("Elige un foro", ""));
    estado.foros.forEach(f => $.pubForo.appendChild(new Option(f.TITULO, f.ID_FORO)));
}

function actualizarTituloHilos() {
    let titulo = estado.filtro === "sin-respuesta" ? "Hilos sin respuesta" : "Hilos recientes";
    const foro = estado.foros.find(f => String(f.ID_FORO) === String(estado.idForo));
    if (foro) titulo += " en " + foro.TITULO;
    $.hilosTitulo.textContent = titulo;
}

// ---------------------------------------------------------------------
// Hilos (lista)
// ---------------------------------------------------------------------
function tarjetaHilo(h) {
    const p = paletaDe(h.ID_FORO);
    const $a = el("article", "bg-surface-container-low p-6 rounded-[24px] border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer");
    $a.tabIndex = 0;
    $a.setAttribute("role", "button");

    const $fila = el("div", "flex gap-4 items-start");
    const $avatar = el("div", "w-12 h-12 shrink-0 rounded-full bg-primary-container/40 text-on-primary-container flex items-center justify-center font-title-lg text-title-lg", h.INICIAL || "?");
    $avatar.setAttribute("aria-hidden", "true");

    const $cuerpo = el("div", "flex-1 min-w-0");

    const $cabecera = el("div", "flex items-center gap-2 mb-1 flex-wrap");
    $cabecera.append(
        el("span", "font-label-md text-label-md text-on-surface font-bold", h.AUTOR),
        el("span", "font-label-sm text-label-sm text-outline", "• " + tiempoRelativo(h.FECHA_PUBLICACION)),
        el("span", `ml-auto ${p.etiqueta} px-2 py-0.5 rounded-md font-label-sm text-label-sm`, h.FORO)
    );

    const $respuestas = el("div", "flex items-center gap-1.5 text-outline hover:text-primary transition-colors w-fit");
    $respuestas.append(icono("chat_bubble", "text-[20px]"), el("span", "font-label-sm text-label-sm", plural(h.RESPUESTAS, "respuesta", "respuestas")));

    $cuerpo.append(
        $cabecera,
        el("h4", "font-title-lg text-title-lg text-on-surface mb-2 break-words", tituloDe(h)),
        el("p", "font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4 break-words", h.RESUMEN),
        $respuestas
    );

    $fila.append($avatar, $cuerpo);
    $a.appendChild($fila);

    $a.addEventListener("click", () => abrirHilo(h.ID_PARTICIPACION));
    $a.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirHilo(h.ID_PARTICIPACION);
        }
    });
    return $a;
}

function mensajeVacio() {
    let texto = "Aún no hay hilos aquí. Sé la primera persona en publicar.";
    if (estado.q) texto = "No encontramos hilos con esa búsqueda.";
    else if (estado.filtro === "sin-respuesta") texto = "No hay hilos sin respuesta por ahora.";
    return el("p", "font-body-md text-body-md text-on-surface-variant text-center py-10", texto);
}

async function cargarHilos(reiniciar = true) {
    const token = ++estado.token;

    if (reiniciar) {
        estado.pagina = 1;
        $.lista.replaceChildren(el("p", "font-body-md text-body-md text-on-surface-variant text-center py-10", "Cargando hilos..."));
        $.btnMas.classList.add("hidden");
    } else {
        estado.pagina += 1;
    }

    const params = { id: "hilos", filtro: estado.filtro, pagina: estado.pagina };
    if (estado.idForo) params.id_foro = estado.idForo;
    if (estado.q) params.q = estado.q;

    try {
        const resp = await pedir(params);
        if (token !== estado.token) return; // llegó una petición más nueva
        if (resp.code != 200) throw new Error(resp.msg);

        if (reiniciar) $.lista.replaceChildren();
        const hilos = resp.datos || [];

        if (reiniciar && hilos.length === 0) $.lista.appendChild(mensajeVacio());
        hilos.forEach(h => $.lista.appendChild(tarjetaHilo(h)));
        $.btnMas.classList.toggle("hidden", !resp.hay_mas);
    } catch (e) {
        if (token !== estado.token) return;
        if (reiniciar) {
            $.lista.replaceChildren(el("p", "font-body-md text-body-md text-on-surface-variant text-center py-10",
                "No pudimos cargar los hilos. Intenta de nuevo en unos minutos."));
        } else {
            estado.pagina -= 1;
            mostrarAviso("No pudimos cargar más hilos. Intenta de nuevo.");
        }
    }
}

// ---------------------------------------------------------------------
// Detalle de un hilo y respuestas
// ---------------------------------------------------------------------
function itemRespuesta(r) {
    const $item = el("div", "flex gap-3 items-start");
    const $avatar = el("div", "w-8 h-8 shrink-0 rounded-full bg-primary-container/30 text-on-primary-container flex items-center justify-center font-label-md text-label-md", r.INICIAL || "?");
    $avatar.setAttribute("aria-hidden", "true");

    const $texto = el("div", "flex-1 min-w-0");
    const $meta = el("div", "flex items-center gap-2 mb-0.5");
    $meta.append(
        el("span", "font-label-md text-label-md text-on-surface font-bold", r.AUTOR),
        el("span", "font-label-sm text-label-sm text-outline", "• " + tiempoRelativo(r.FECHA_PUBLICACION))
    );
    $texto.append($meta, el("p", "font-body-md text-body-md text-on-surface-variant whitespace-pre-line break-words", r.CONTENIDO));

    $item.append($avatar, $texto);
    return $item;
}

async function abrirHilo(id, abrir = true) {
    try {
        const resp = await pedir({ id: "hilo", id_hilo: id });
        if (resp.code != 200 || !resp.datos || resp.datos.length === 0) {
            mostrarAviso("Este hilo ya no está disponible.");
            return;
        }
        const h = resp.datos[0];
        const respuestas = h.LISTA_RESPUESTAS || [];
        estado.hiloAbierto = h.ID_PARTICIPACION;

        $.hiloForo.className = `px-2 py-0.5 rounded-md font-label-sm text-label-sm ${paletaDe(h.ID_FORO).etiqueta}`;
        $.hiloForo.textContent = h.FORO;
        $.hiloTitulo.textContent = tituloDe({ TITULO: h.TITULO, RESUMEN: h.CONTENIDO });
        $.hiloMeta.textContent = `${h.AUTOR} • ${tiempoRelativo(h.FECHA_PUBLICACION)}`;
        $.hiloContenido.textContent = h.CONTENIDO;
        $.respTitulo.textContent = "Respuestas (" + respuestas.length + ")";

        $.respLista.replaceChildren();
        if (respuestas.length === 0) {
            $.respLista.appendChild(el("p", "font-body-md text-body-md text-on-surface-variant", "Aún no hay respuestas. Puedes ser la primera persona en acompañar."));
        } else {
            respuestas.forEach(r => $.respLista.appendChild(itemRespuesta(r)));
        }

        if (abrir) {
            $.respTexto.value = "";
            mostrarMsg($.respMsg, "", false);
            $.dlgHilo.showModal();
            $.dlgHilo.scrollTop = 0;
        }
    } catch (e) {
        mostrarAviso("No pudimos abrir el hilo. Intenta de nuevo.");
    }
}

async function enviarRespuesta() {
    const idUsuario = localStorage.getItem("iduser");
    const contenido = $.respTexto.value.trim();

    if (!idUsuario) return mostrarMsg($.respMsg, "Inicia sesión para responder.", true);
    if (contenido.length < 2) return mostrarMsg($.respMsg, "Escribe tu respuesta antes de enviarla.", true);

    $.respEnviar.disabled = true;
    try {
        const resp = await enviar({ accion: "respuesta", id_hilo: estado.hiloAbierto, contenido, id_usuario: idUsuario });
        if (resp.code == 200) {
            $.respTexto.value = "";
            mostrarMsg($.respMsg, "", false);
            estado.listaDesactualizada = true; // al cerrar, se actualiza el contador de la lista
            await abrirHilo(estado.hiloAbierto, false);
        } else {
            mostrarMsg($.respMsg, mensajeParaUsuario(resp, "No pudimos enviar tu respuesta. Intenta de nuevo."), true);
        }
    } catch (e) {
        mostrarMsg($.respMsg, "No pudimos enviar tu respuesta. Intenta de nuevo.", true);
    } finally {
        $.respEnviar.disabled = false;
    }
}

// ---------------------------------------------------------------------
// Crear publicación
// ---------------------------------------------------------------------
function abrirPublicar() {
    mostrarMsg($.pubMsg, "", false);
    $.pubForo.value = estado.idForo ? String(estado.idForo) : "";
    $.dlgPublicar.showModal();
}

async function enviarPublicacion() {
    const idUsuario = localStorage.getItem("iduser");
    const idForo = $.pubForo.value;
    const titulo = $.pubTitulo.value.trim();
    const contenido = $.pubContenido.value.trim();

    if (!idUsuario) return mostrarMsg($.pubMsg, "Inicia sesión para publicar.", true);
    if (!idForo) return mostrarMsg($.pubMsg, "Elige el foro donde quieres publicar.", true);
    if (titulo.length < 5) return mostrarMsg($.pubMsg, "El título debe tener al menos 5 caracteres.", true);
    if (contenido.length < 10) return mostrarMsg($.pubMsg, "Cuéntanos un poco más: el mensaje debe tener al menos 10 caracteres.", true);

    $.pubEnviar.disabled = true;
    try {
        const resp = await enviar({ accion: "hilo", id_foro: idForo, titulo, contenido, id_usuario: idUsuario });
        if (resp.code == 200) {
            $.pubTitulo.value = "";
            $.pubContenido.value = "";
            mostrarMsg($.pubMsg, resp.msg, false);
        } else {
            mostrarMsg($.pubMsg, mensajeParaUsuario(resp, "No pudimos enviar tu publicación. Intenta de nuevo."), true);
        }
    } catch (e) {
        mostrarMsg($.pubMsg, "No pudimos enviar tu publicación. Intenta de nuevo.", true);
    } finally {
        $.pubEnviar.disabled = false;
    }
}

// ---------------------------------------------------------------------
// Filtros, búsqueda y eventos
// ---------------------------------------------------------------------
function marcarFiltro() {
    document.querySelectorAll("[data-filtro]").forEach($b => {
        const activo = $b.dataset.filtro === estado.filtro;
        CLASES_FILTRO_ACTIVO.forEach(c => $b.classList.toggle(c, activo));
        CLASES_FILTRO_INACTIVO.forEach(c => $b.classList.toggle(c, !activo));
    });
}

function enlazarEventos() {
    // Filtros "Más recientes" / "Sin respuesta" (pulsar de nuevo "Sin respuesta" lo quita)
    document.querySelectorAll("[data-filtro]").forEach($b => {
        $b.addEventListener("click", () => {
            const elegido = $b.dataset.filtro;
            estado.filtro = (elegido === estado.filtro && elegido !== "recientes") ? "recientes" : elegido;
            marcarFiltro();
            actualizarTituloHilos();
            cargarHilos();
        });
    });

    // Búsqueda (espera 350 ms después de dejar de escribir)
    let temporizador;
    $.buscador.addEventListener("input", () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => {
            estado.q = $.buscador.value.trim();
            cargarHilos();
        }, 350);
    });

    $.btnMas.addEventListener("click", () => cargarHilos(false));
    $.btnCrear.addEventListener("click", abrirPublicar);
    $.pubEnviar.addEventListener("click", enviarPublicacion);
    $.respEnviar.addEventListener("click", enviarRespuesta);

    // Cerrar ventanas: botones "Cerrar" y clic fuera de la ventana
    [$.dlgPublicar, $.dlgHilo].forEach($dlg => {
        $dlg.querySelectorAll("[data-cerrar]").forEach($b => $b.addEventListener("click", () => $dlg.close()));
        $dlg.addEventListener("click", (e) => { if (e.target === $dlg) $dlg.close(); });
    });

    // Al cerrar el hilo, si hubo respuestas nuevas se refresca la lista
    $.dlgHilo.addEventListener("close", () => {
        if (estado.listaDesactualizada) {
            estado.listaDesactualizada = false;
            cargarHilos();
        }
    });
}

function referenciar() {
    const ids = {
        grid: "foros-grid", lista: "hilos-lista", hilosTitulo: "hilos-titulo", btnMas: "btn-mas-hilos",
        buscador: "buscador-foros", aviso: "foros-aviso", btnCrear: "btn-crear-publicacion",
        dlgPublicar: "dlg-publicar", pubForo: "pub-foro", pubTitulo: "pub-titulo",
        pubContenido: "pub-contenido", pubMsg: "pub-msg", pubEnviar: "pub-enviar",
        dlgHilo: "dlg-hilo", hiloForo: "hilo-foro", hiloTitulo: "hilo-titulo", hiloMeta: "hilo-meta",
        hiloContenido: "hilo-contenido", respTitulo: "resp-titulo", respLista: "resp-lista",
        respTexto: "resp-texto", respMsg: "resp-msg", respEnviar: "resp-enviar"
    };
    Object.entries(ids).forEach(([clave, id]) => { $[clave] = document.getElementById(id); });
}

// Se llama desde main.js solo en Participacion_foros.html
export async function cargarForos() {
    if (!document.getElementById("foros-grid")) return;
    referenciar();
    enlazarEventos();
    marcarFiltro();
    await cargarListaForos(); // primero los foros: los hilos usan sus colores
    actualizarTituloHilos();
    await cargarHilos();
}
