// =====================================================================
// biblioteca.js - Pantalla de Recomendaciones y Biblioteca (Recomendaciones.html)
// Se llama desde main.js solo en Recomendaciones.html
//
// Las tarjetas no se escriben aquí: se copian de los moldes <template> del HTML
// y se rellenan los elementos marcados con data-campo.
// Todo el texto que viene de la base de datos se inserta con textContent
// (nunca como HTML), y los enlaces solo se aceptan si empiezan con http:// o https://.
//
// La biblioteca tiene dos vistas:
//  - "Todos" y sin búsqueda: un bloque por foro (su nombre arriba y sus recursos debajo).
//  - Un tema elegido, o una búsqueda: una lista con "Ver más recursos".
// =====================================================================

import { enviarPeticion, ir } from "./herramientas.js";

const API = "../backend/vista_biblioteca/index.php";

// "Recomendadas para ti" muestra 4 y el resto aparece con "Ver todo"
const VISIBLES_RECOMENDADAS = 4;

// Colores de las tarjetas (se reparten en orden)
const PALETAS = [
    { media: "bg-primary-container/20", icono: "text-primary", etiqueta: "bg-primary-container/80 text-on-primary-container" },
    { media: "bg-verde-menta/20", icono: "text-secondary", etiqueta: "bg-verde-menta/80 text-on-secondary-fixed" },
    { media: "bg-calm-peach/30", icono: "text-tertiary", etiqueta: "bg-calm-peach/80 text-on-tertiary-fixed-variant" }
];
const CLASES_MEDIA = PALETAS.map(p => p.media);
const CLASES_ICONO = PALETAS.map(p => p.icono);
const CLASES_ETIQUETA = PALETAS.flatMap(p => p.etiqueta.split(" "));

// Tipo de recurso -> ícono y texto. Sirve para las dos tablas:
// bibliografia (LIBRO, GUIA, ARTICULO, VIDEO, PODCAST, OTRO) y recomendaciones (ARTICULO, PDF, VIDEO).
const TIPOS = {
    LIBRO: { icono: "auto_stories", etiqueta: "Libro" },
    GUIA: { icono: "assignment", etiqueta: "Guía" },
    ARTICULO: { icono: "article", etiqueta: "Artículo" },
    VIDEO: { icono: "play_circle", etiqueta: "Video" },
    PODCAST: { icono: "headphones", etiqueta: "Podcast" },
    PDF: { icono: "picture_as_pdf", etiqueta: "PDF" }
};
const TIPO_GENERICO = { icono: "menu_book", etiqueta: "Recurso" };

// Modalidad de acceso (bibliografia.MODALIDAD_ACCESO): texto del botón y etiqueta.
// La lectura en línea es lo habitual, por eso no lleva etiqueta; las otras dos sí,
// para que la persona sepa antes de hacer clic si va a descargar o a pagar.
const MODALIDADES = {
    LECTURA_ONLINE: { cta: "Leer en línea", texto: "", clases: "" },
    DESCARGA_GRATUITA: { cta: "Descargar gratis", texto: "Descarga gratuita", clases: "bg-verde-menta/40 text-on-secondary-fixed" },
    COMPRA: { cta: "Ver dónde comprar", texto: "De pago", clases: "bg-calm-peach/50 text-on-tertiary-fixed-variant" }
};

const CHIP_ACTIVO = ["bg-primary", "text-on-primary", "hover:brightness-110"];
const CHIP_INACTIVO = ["bg-surface-container-high", "text-on-surface-variant", "hover:bg-primary-container"];

const estado = {
    idForo: "",        // tema elegido ("" = todos)
    q: "",             // texto de búsqueda
    pagina: 1,
    token: 0,          // evita que una respuesta lenta pise a una más nueva
    temas: {},         // id del foro -> nombre (para los títulos)
    $lista: null,      // cuadrícula donde se agregan los recursos al pulsar "Ver más recursos"
    recomendadas: [],  // todas las recomendaciones de la emoción actual
    verTodas: false,
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

function mensaje(texto, clasesExtra = "") {
    return el("p", `font-body-md text-body-md text-on-surface-variant ${clasesExtra}`.trim(), texto);
}

function esUrlSegura(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}

// enviarPeticion (herramientas.js) trabaja con una función de respuesta (fSucces).
// Aquí se envuelve en una promesa para poder usar await. Nunca falla:
// ante cualquier error entrega { code, msg }, así que siempre se resuelve.
function pedir(params) {
    return new Promise((resolve) => {
        enviarPeticion({ url: API, method: "GET", params, fSucces: resolve });
    });
}

// El servidor ya no reconoce la sesión (venció o se cerró): se vuelve al inicio de sesión
function sesionVencida() {
    if (estado.sesionVencida) return;
    estado.sesionVencida = true;
    const texto = "Tu sesión venció. Te llevaremos al inicio de sesión...";
    [$.recGrid, $.bibGrid, $.sugeridos].forEach($c => $c.replaceChildren(mensaje(texto)));
    setTimeout(() => {
        localStorage.clear();
        ir("inicio.html");
    }, 2500);
}

// ---------------------------------------------------------------------
// Moldes de tarjetas
// ---------------------------------------------------------------------
function clonar(idMolde) {
    return document.getElementById(idMolde).content.firstElementChild.cloneNode(true);
}

// Busca un [data-campo] dentro de la tarjeta (o la tarjeta misma, como en la lateral)
function campo($raiz, nombre) {
    if ($raiz.dataset && $raiz.dataset.campo === nombre) return $raiz;
    return $raiz.querySelector(`[data-campo="${nombre}"]`);
}

function ponerTexto($raiz, nombre, texto) {
    const $c = campo($raiz, nombre);
    if ($c && texto !== undefined && texto !== null) $c.textContent = texto;
}

// Muestra un elemento que viene oculto en el molde (autor, etiqueta de modalidad) solo si hay algo que mostrar
function mostrarSiHay($raiz, nombre, texto, clasesExtra = "") {
    const $c = campo($raiz, nombre);
    if (!$c || !texto) return;
    $c.textContent = texto;
    if (clasesExtra) $c.classList.add(...clasesExtra.split(" "));
    $c.classList.remove("hidden");
}

function ponerEnlace($raiz, url, ocultarSinUrl) {
    const $a = campo($raiz, "enlace");
    if (!$a) return;
    if (esUrlSegura(url)) {
        $a.href = url.trim();
        $a.classList.remove("hidden");
    } else {
        $a.removeAttribute("href");
        if (ocultarSinUrl) $a.classList.add("hidden");
    }
}

function aplicarPaleta($raiz, indice) {
    const p = PALETAS[indice % PALETAS.length];
    const $media = campo($raiz, "media");
    const $icono = campo($raiz, "icono");
    const $etiqueta = campo($raiz, "etiqueta");

    if ($media) {
        $media.classList.remove(...CLASES_MEDIA, ...CLASES_ICONO);
        $media.classList.add(p.media);
    }
    if ($icono) {
        $icono.classList.remove(...CLASES_ICONO);
        $icono.classList.add(p.icono);
    }
    if ($etiqueta) {
        $etiqueta.classList.remove(...CLASES_ETIQUETA);
        $etiqueta.classList.add(...p.etiqueta.split(" "));
    }
}

// d: { titulo, descripcion, autor, meta, etiqueta, icono, url, paleta, badge, textoEnlace, ocultarEnlaceSinUrl }
function rellenar($tarjeta, d) {
    ponerTexto($tarjeta, "titulo", d.titulo);
    ponerTexto($tarjeta, "descripcion", d.descripcion);
    ponerTexto($tarjeta, "meta", d.meta);
    ponerTexto($tarjeta, "etiqueta", d.etiqueta);
    ponerTexto($tarjeta, "icono", d.icono);
    ponerTexto($tarjeta, "texto-enlace", d.textoEnlace);
    mostrarSiHay($tarjeta, "autor", d.autor);
    if (d.badge) mostrarSiHay($tarjeta, "modalidad", d.badge.texto, d.badge.clases);
    ponerEnlace($tarjeta, d.url, d.ocultarEnlaceSinUrl !== false);
    aplicarPaleta($tarjeta, d.paleta);
    return $tarjeta;
}

// ---------------------------------------------------------------------
// Recomendadas para ti (tabla recomendaciones, según la emoción más reciente)
// ---------------------------------------------------------------------
function datosRecomendada(r, i) {
    const tipo = TIPOS[r.TIPO] || TIPO_GENERICO;
    return { titulo: r.TITULO, descripcion: r.DESCRIPCION, etiqueta: tipo.etiqueta, icono: tipo.icono, url: r.URL, paleta: i };
}

function pintarRecomendadas() {
    const lista = estado.verTodas ? estado.recomendadas : estado.recomendadas.slice(0, VISIBLES_RECOMENDADAS);
    $.recGrid.replaceChildren();
    lista.forEach((r, i) => $.recGrid.appendChild(rellenar(clonar("tpl-recomendada"), datosRecomendada(r, i))));

    $.verTodo.classList.toggle("hidden", estado.recomendadas.length <= VISIBLES_RECOMENDADAS);
    $.verTodo.textContent = estado.verTodas ? "Ver menos" : "Ver todo";
}

async function cargarParaTi() {
    const resp = await pedir({ id: "para-ti" });
    if (resp.code == 401) return sesionVencida();
    if (resp.code != 200) {
        $.motivo.textContent = "";
        $.recGrid.replaceChildren(mensaje("No pudimos cargar tus recomendaciones. Intenta de nuevo en unos minutos.", "md:col-span-2"));
        return;
    }

    // Aún no ha registrado ninguna emoción
    if (!resp.emocion) {
        $.motivo.textContent = "";
        const $p = mensaje("", "md:col-span-2");
        const $enlace = el("a", "text-primary font-bold hover:underline", "registra cómo te sientes");
        $enlace.href = "Registro_emocional.html";
        $p.append("Aún no has registrado una emoción: ", $enlace, " y te sugeriremos recursos pensados para ti.");
        $.recGrid.replaceChildren($p);
        return;
    }

    estado.recomendadas = resp.datos || [];

    // Tiene emoción, pero esa emoción aún no tiene recursos cargados
    if (estado.recomendadas.length === 0) {
        $.motivo.textContent = `Tu última emoción registrada fue: ${resp.emocion.NOMBRE}.`;
        $.recGrid.replaceChildren(mensaje(
            "Todavía no tenemos recursos para esta emoción. Mientras tanto, explora la biblioteca.", "md:col-span-2"));
        $.verTodo.classList.add("hidden");
        return;
    }

    $.motivo.textContent = `Basadas en tu última emoción registrada: ${resp.emocion.NOMBRE}.`;
    pintarRecomendadas();
}

// ---------------------------------------------------------------------
// Explora la Biblioteca (tabla bibliografia)
// ---------------------------------------------------------------------
// mostrarForo: en una lista que mezcla temas (búsqueda) conviene decir de qué foro es cada recurso
function datosRecurso(b, mostrarForo) {
    const tipo = TIPOS[b.TIPO] || TIPO_GENERICO;
    const modalidad = MODALIDADES[b.MODALIDAD_ACCESO] || null;
    return {
        titulo: b.TITULO,
        descripcion: b.DESCRIPCION,
        autor: b.AUTOR ? `Por ${b.AUTOR}` : "",
        meta: mostrarForo && b.FORO ? `${tipo.etiqueta} · ${b.FORO}` : tipo.etiqueta,
        icono: tipo.icono,
        url: b.URL,
        paleta: Number(b.ID_FORO), // cada tema conserva siempre su color
        badge: modalidad && modalidad.texto ? modalidad : null,
        textoEnlace: modalidad ? modalidad.cta : "Ver recurso"
    };
}

// Vista "Todos": un bloque por foro, con su nombre arriba y sus recursos más recientes debajo
async function cargarPorTemas() {
    const token = ++estado.token;
    $.bibGrid.replaceChildren(mensaje("Cargando biblioteca..."));
    $.masRecursos.classList.add("hidden");

    const resp = await pedir({ id: "por-temas" });
    if (token !== estado.token) return;
    if (resp.code == 401) return sesionVencida();
    if (resp.code != 200) {
        $.bibGrid.replaceChildren(mensaje("No pudimos cargar la biblioteca. Intenta de nuevo en unos minutos."));
        return;
    }

    const temas = resp.datos || [];
    if (temas.length === 0) {
        $.bibGrid.replaceChildren(mensaje("Aún no hay recursos en la biblioteca."));
        return;
    }

    $.bibGrid.replaceChildren();
    temas.forEach(t => {
        estado.temas[t.ID_FORO] = t.TITULO;

        const $tema = clonar("tpl-tema");
        ponerTexto($tema, "titulo", t.TITULO);

        const recursos = t.recursos || [];
        if (Number(t.TOTAL) > recursos.length) {
            const $verTodos = campo($tema, "ver-todos");
            $verTodos.textContent = `Ver todos (${t.TOTAL})`;
            $verTodos.classList.remove("hidden");
            $verTodos.addEventListener("click", () => elegirTema(String(t.ID_FORO)));
        }

        const $tarjetas = campo($tema, "tarjetas");
        recursos.forEach((b, i) => {
            // La primera tarjeta de cada bloque es la ancha, como en el diseño
            $tarjetas.appendChild(rellenar(clonar(i === 0 ? "tpl-destacado" : "tpl-recurso"), datosRecurso(b, false)));
        });
        $.bibGrid.appendChild($tema);
    });
}

function tituloLista() {
    const foro = estado.idForo ? (estado.temas[estado.idForo] || "") : "";
    if (estado.q) return foro ? `Resultados de la búsqueda en ${foro}` : "Resultados de la búsqueda";
    return foro || "Recursos";
}

function textoVacio() {
    if (estado.q) return "No encontramos recursos con esa búsqueda.";
    if (estado.idForo) return "Aún no hay recursos en este tema.";
    return "Aún no hay recursos en la biblioteca.";
}

// Lista de un tema elegido o de una búsqueda
async function cargarRecursos(reiniciar = true) {
    const token = ++estado.token;

    if (reiniciar) {
        estado.pagina = 1;
        $.bibGrid.replaceChildren(mensaje("Cargando biblioteca..."));
        $.masRecursos.classList.add("hidden");
    } else {
        estado.pagina += 1;
    }

    const params = { id: "recursos", pagina: estado.pagina };
    if (estado.idForo) params.id_foro = estado.idForo;
    if (estado.q) params.q = estado.q;

    const resp = await pedir(params);
    if (token !== estado.token) return; // llegó una petición más nueva
    if (resp.code == 401) return sesionVencida();

    if (resp.code != 200) {
        if (reiniciar) {
            $.bibGrid.replaceChildren(mensaje("No pudimos cargar la biblioteca. Intenta de nuevo en unos minutos."));
        } else {
            estado.pagina -= 1;
            alert("No pudimos cargar más recursos. Intenta de nuevo.");
        }
        return;
    }

    const recursos = resp.datos || [];

    if (reiniciar) {
        $.bibGrid.replaceChildren();
        if (recursos.length === 0) {
            $.bibGrid.appendChild(mensaje(textoVacio()));
            return;
        }
        $.bibGrid.appendChild(el("h4", "font-title-lg text-title-lg text-primary", tituloLista()));
        estado.$lista = el("div", "grid grid-cols-1 sm:grid-cols-2 gap-6");
        $.bibGrid.appendChild(estado.$lista);
    }

    recursos.forEach((b, i) => {
        // La primera tarjeta de la lista es la ancha; las que se agregan después, normales
        const molde = (reiniciar && i === 0) ? "tpl-destacado" : "tpl-recurso";
        estado.$lista.appendChild(rellenar(clonar(molde), datosRecurso(b, true)));
    });
    $.masRecursos.classList.toggle("hidden", !resp.hay_mas);
}

// Según haya tema elegido o búsqueda, se muestra la lista; si no, los bloques por tema
function cargarVista() {
    return (estado.q || estado.idForo) ? cargarRecursos(true) : cargarPorTemas();
}

// ---------------------------------------------------------------------
// Filtros por tema (los foros que tienen recursos)
// ---------------------------------------------------------------------
function marcarChips() {
    $.filtros.querySelectorAll("[data-foro]").forEach($b => {
        const activo = String($b.dataset.foro) === String(estado.idForo);
        $b.classList.remove(...(activo ? CHIP_INACTIVO : CHIP_ACTIVO));
        $b.classList.add(...(activo ? CHIP_ACTIVO : CHIP_INACTIVO));
    });
}

function elegirTema(id) {
    estado.idForo = id;
    marcarChips();
    cargarVista();
}

async function cargarTemas() {
    const resp = await pedir({ id: "temas" });
    if (resp.code == 401) return sesionVencida();
    if (resp.code != 200) return; // si falla, queda solo "Todos"

    (resp.datos || []).forEach(t => {
        estado.temas[t.ID_FORO] = t.TITULO;
        const $chip = el("button",
            "px-6 py-2 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md hover:bg-primary-container transition-all",
            t.TITULO);
        $chip.type = "button";
        $chip.dataset.foro = t.ID_FORO;
        $chip.addEventListener("click", () => elegirTema(String(t.ID_FORO)));
        $.filtros.appendChild($chip);
    });
    marcarChips();
}

// ---------------------------------------------------------------------
// Tarjeta lateral "Te puede interesar" (recursos al azar)
// ---------------------------------------------------------------------
async function cargarSugeridos() {
    const resp = await pedir({ id: "sugeridos" });
    if (resp.code == 401) return sesionVencida();

    if (resp.code != 200) {
        $.sugeridos.replaceChildren(mensaje("No pudimos cargar las sugerencias."));
        return;
    }

    const recursos = resp.datos || [];
    if (recursos.length === 0) {
        $.sugeridos.replaceChildren(mensaje("Aún no hay recursos para sugerir."));
        return;
    }

    $.sugeridos.replaceChildren();
    recursos.forEach((b, i) => {
        const tipo = TIPOS[b.TIPO] || TIPO_GENERICO;
        $.sugeridos.appendChild(rellenar(clonar("tpl-sugerido"), {
            titulo: b.TITULO, descripcion: b.DESCRIPCION, icono: tipo.icono,
            url: b.URL, paleta: i, ocultarEnlaceSinUrl: false
        }));
    });
}

// ---------------------------------------------------------------------
// Eventos e inicio
// ---------------------------------------------------------------------
function enlazarEventos() {
    // El chip "Todos" ya viene en el HTML; los demás se crean al cargar los temas
    $.filtros.querySelectorAll("[data-foro]").forEach($b => {
        $b.addEventListener("click", () => elegirTema(String($b.dataset.foro)));
    });

    // Búsqueda: espera 350 ms después de dejar de escribir
    let temporizador;
    $.buscador.addEventListener("input", () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => {
            estado.q = $.buscador.value.trim();
            cargarVista();
        }, 350);
    });

    $.masRecursos.addEventListener("click", () => cargarRecursos(false));

    $.verTodo.addEventListener("click", () => {
        estado.verTodas = !estado.verTodas;
        pintarRecomendadas();
    });
}

function referenciar() {
    const ids = {
        buscador: "buscador-biblioteca", filtros: "filtros-temas",
        recGrid: "recomendadas-grid", motivo: "recomendadas-motivo", verTodo: "ver-todo-recomendadas",
        bibGrid: "biblioteca-grid", masRecursos: "btn-mas-recursos", sugeridos: "sugeridos-lista"
    };
    Object.entries(ids).forEach(([clave, id]) => { $[clave] = document.getElementById(id); });
}

// Se llama desde main.js solo en Recomendaciones.html
export async function cargarBiblioteca() {
    if (!document.getElementById("biblioteca-grid")) return;
    referenciar();
    enlazarEventos();
    await Promise.all([cargarParaTi(), cargarTemas(), cargarVista(), cargarSugeridos()]);
}
