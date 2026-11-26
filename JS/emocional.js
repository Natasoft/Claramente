import { enviarPeticion, ir } from "./herramientas.js";

let selectedEmotionId = null;

export async function cargarEmociones() {
    // Lógica para cargar las emociones
    let info = "", $div_emociones = document.getElementById("emotion-grid");
    $div_emociones.innerHTML = `<div role="status">
        <svg aria-hidden="true" class="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Cargando emociones...</span>
        </div>`; // Mensaje de carga

    await enviarPeticion({
        url: "../backend/vista_emociones/index.php",
        method: "GET",
        params: {},
        fSucces: (resp) => {
            //console.log("Respuesta del servidor:", resp);
            if (resp.code == 200) {
                //alert("Inicio de sesión exitoso");
                info = "";
                resp.datos.forEach(emocion => {
                    //console.log("Datos de la emoción:", emocion);
                    info += `<button value="${emocion.ID_EMOCION}"
                        class="emotion-card group flex flex-col items-center justify-center p-6 bg-surface border-2 border-transparent rounded-[24px] hover:border-primary-container hover:bg-surface-container-high transition-all duration-300"
                        onclick="selectEmotion(this)">
                        <span
                            class="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">${emocion.ICONO}</span>
                        <span class="font-label-md text-label-md text-on-surface-variant">${emocion.NOMBRE}</span>
                    </button>`;
                });
            }
            else { alert(resp.msg || "Error en la petición"); }
        }
    });
    $div_emociones.innerHTML = info; // Limpiar el contenido previo
}

// --- Selección de emoción ---
// Se llama desde el atributo onclick="selectEmotion(this)" de cada botón generado en cargarEmociones()
export function selectEmotion(boton) {
    document.querySelectorAll("#emotion-grid .emotion-card").forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    selectedEmotionId = boton.value;
}

// --- Guardar registro ---
// Se llama desde el botón "Guardar Registro" (onclick="saveRegistry()")
export async function saveRegistry() {
    if (!selectedEmotionId) {
        alert("Por favor selecciona cómo te sientes antes de guardar.");
        return;
    }

    const intensidad = document.getElementById("intensity-slider").value;
    const comentario = document.getElementById("notes").value;

    await enviarPeticion({
        url: "../backend/vista_emociones/index.php",
        method: "POST",
        params: {
            id_emocion: selectedEmotionId,
            intensidad: intensidad,
            comentario: comentario // la persona se identifica por la sesión del servidor
        },
        fSucces: (resp) => {
            if (resp.code == 200) {
                document.getElementById("success-modal").classList.remove("hidden", "opacity-0");
            } else if (resp.code == 401) {
                alert("Tu sesión venció. Inicia sesión de nuevo para guardar tu registro.");
                localStorage.clear();
                ir("inicio.html");
            } else {
                alert(resp.msg || "No se pudo guardar el registro.");
            }
        }
    });
}

export function closeModal() {
    document.getElementById("success-modal").classList.add("opacity-0");
    setTimeout(() => { document.getElementById("success-modal").classList.add("hidden"); window.location.reload(); }, 300);
}

// Exponer al scope global porque el HTML las llama vía atributos onclick
window.selectEmotion = selectEmotion;
window.saveRegistry = saveRegistry;
window.closeModal = closeModal;

// --- Actualizar el número visible junto al slider de intensidad ---
// El input existe de forma estática en Registro_emocional.html; el optional chaining (?.)
// evita errores en otras páginas donde este elemento no exista.
document.getElementById("intensity-slider")?.addEventListener("input", (e) => {
    document.getElementById("intensity-value").textContent = e.target.value;
});

// --- Dato de bienestar aleatorio ---
// Requiere agregar id="wellness-tip" al <p> del "Dato de bienestar" en el HTML.
const datosBienestar = [
    "Escribir tus emociones ayuda a reducir la actividad de la amígdala, disminuyendo los niveles de estrés de forma natural.",
    "Nombrar lo que sientes activa la corteza prefrontal, lo que ayuda a regular emociones intensas.",
    "Llevar un registro emocional constante puede ayudarte a identificar patrones y disparadores con el tiempo.",
    "No existen emociones 'buenas' o 'malas': todas cumplen una función y merecen ser escuchadas.",
    "Tomarte un momento para reflexionar sobre tu día fortalece tu autoconocimiento.",
    "La respiración profunda durante unos minutos puede bajar tu nivel de intensidad emocional.",
    "Permitirte sentir sin juzgarte es el primer paso para procesar cualquier emoción.",
    "Reconocer tus emociones a tiempo puede ayudarte a responder mejor ante situaciones difíciles.",
    "Un pequeño hábito diario, como este registro, puede tener un gran impacto en tu bienestar a largo plazo.",
    "Hablar o escribir sobre lo que sientes puede aliviar la carga emocional, aunque nadie más lo lea.",
    "Las emociones son temporales: identificar cómo te sientes hoy no define cómo te sentirás mañana.",
    "Notar cambios en tu estado de ánimo es una forma de cuidado personal, no de debilidad.",
    "Celebrar tus emociones positivas con la misma atención que las difíciles ayuda a equilibrar tu bienestar.",
    "Comparar tus registros con el tiempo puede ayudarte a ver tu propio progreso emocional.",
    "Cuidar tu salud emocional es tan importante como cuidar tu salud física."
];

const $tip = document.getElementById("wellness-tip");
if ($tip) {
    $tip.textContent = datosBienestar[Math.floor(Math.random() * datosBienestar.length)];
}

// =====================================================================
// Evolución emocional (Evolucionemocional.html)
// =====================================================================

const LIMITE_TABLA = 10;     // la tabla muestra los 10 registros más recientes; "Ver todas" muestra el resto
let registros = [];          // todos los registros de la persona (los usa el filtro)
let listaActual = [];        // lo que se está mostrando ahora (todos, o los de la emoción filtrada)
let verTodas = false;
let filtroEnlazado = false;
let botonEnlazado = false;

// Los textos escritos por la persona (comentarios) se escapan: nunca se insertan como HTML
function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// "13 nov 2026, 9:11 p. m."  (para la tabla)
function formatearFecha(fecha) {
    const d = new Date(String(fecha).replace(" ", "T"));
    return isNaN(d) ? String(fecha) : d.toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

// "13 nov, 9:11 p. m."  (para la cajita pequeña; el año solo si no es el actual)
function formatearFechaCorta(fecha) {
    const d = new Date(String(fecha).replace(" ", "T"));
    if (isNaN(d)) return String(fecha);
    const opciones = { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" };
    if (d.getFullYear() !== new Date().getFullYear()) opciones.year = "numeric";
    return d.toLocaleString("es", opciones);
}

export async function cargarEstadisticas() {
    await enviarPeticion({
        url: "../backend/vista_emociones/index.php",
        method: "GET",
        params: { id: "*" }, // la persona se identifica por la sesión del servidor
        fSucces: (resp) => {
            if (resp.code == 200 && Array.isArray(resp.datos)) {
                estadistica(resp.datos);
            } else if (resp.code == 401) {
                localStorage.clear(); // la sesión venció: se vuelve al inicio de sesión
                ir("inicio.html");
            } else {
                alert("No pudimos cargar tu historial. Intenta de nuevo en unos minutos.");
            }
        }
    });
}

// Último registro = el de fecha más reciente (no depende del orden en que llegue la lista)
function ultimoRegistro(datos) {
    return datos.reduce((a, b) => {
        if (b.FECHA_REG !== a.FECHA_REG) return b.FECHA_REG > a.FECHA_REG ? b : a;
        return Number(b.ID_ESTADO_EMOCIONAL) > Number(a.ID_ESTADO_EMOCIONAL) ? b : a;
    });
}

// Emoción predominante = la que más veces se registró (si empatan, la registrada más recientemente)
function emocionPredominante(datos) {
    const cuentas = {};
    datos.forEach((e) => {
        const c = cuentas[e.NOMBRE] || (cuentas[e.NOMBRE] = { nombre: e.NOMBRE, veces: 0, suma: 0, ultima: "" });
        c.veces += 1;
        c.suma += Number(e.INTENSIDAD) || 0;
        if (e.FECHA_REG > c.ultima) c.ultima = e.FECHA_REG;
    });
    const mejor = Object.values(cuentas).sort((a, b) => b.veces - a.veces || (b.ultima > a.ultima ? 1 : b.ultima < a.ultima ? -1 : 0))[0];
    return { nombre: mejor.nombre, promedio: Math.round((mejor.suma / mejor.veces) * 10) / 10 };
}

function estadistica(datos) {
    registros = datos;
    verTodas = false;
    const $predominante = document.getElementById("emocion-predominante");
    const $intensidad = document.getElementById("intensidad-predominante");
    const $actual = document.getElementById("emocion-actual");
    const $fecha = document.getElementById("fecha-emocion");
    const $total = document.getElementById("total-registros");

    poblarFiltro();

    const $ver = document.getElementById("btn-ver-todas");
    if ($ver && !botonEnlazado) {
        botonEnlazado = true;
        $ver.addEventListener("click", () => { verTodas = !verTodas; pintarDetalle(listaActual); });
    }

    // Sin registros: se limpian las cajas y los datos de ejemplo
    if (datos.length === 0) {
        $predominante.textContent = "—";
        $intensidad.textContent = "Sin registros";
        $actual.textContent = "—";
        $fecha.textContent = "—";
        $total.textContent = "0";
        pintarDetalle([]);
        return;
    }

    const ultimo = ultimoRegistro(datos);
    const predominante = emocionPredominante(datos);

    $total.textContent = datos.length;
    $actual.textContent = ultimo.NOMBRE;
    $fecha.textContent = formatearFechaCorta(ultimo.FECHA_REG);
    $predominante.textContent = predominante.nombre;
    // Texto corto a propósito (la cajita es pequeña); la explicación va en el título emergente
    $intensidad.textContent = `Promedio ${predominante.promedio.toLocaleString("es")}/10`;
    $intensidad.title = "Intensidad promedio de tu emoción predominante";

    pintarDetalle(datos);
}

// Llena el filtro con las emociones que la persona realmente registró (con cuántas veces)
function poblarFiltro() {
    const $filtro = document.getElementById("emotion-filter");
    if (!$filtro) return;

    const emociones = {};
    registros.forEach((e) => {
        const id = String(e.ID_EMOCION);
        emociones[id] = emociones[id] || { nombre: e.NOMBRE, veces: 0 };
        emociones[id].veces += 1;
    });
    $filtro.innerHTML = `<option value="">Todas las emociones</option>` + Object.entries(emociones)
        .sort((a, b) => b[1].veces - a[1].veces)
        .map(([id, e]) => `<option value="${escapar(id)}">${escapar(e.nombre)} (${e.veces})</option>`)
        .join("");

    if (!filtroEnlazado) {
        filtroEnlazado = true;
        $filtro.addEventListener("change", () => {
            const elegida = $filtro.value;
            verTodas = false;
            pintarDetalle(elegida ? registros.filter((e) => String(e.ID_EMOCION) === elegida) : registros);
        });
    }
}

// Tabla de histórico y gráfico (el filtro actúa sobre estos dos; las cajas de arriba siempre muestran todo).
// La tabla muestra los 10 registros más recientes; "Ver todas" muestra el resto. El gráfico muestra todos.
function pintarDetalle(lista) {
    listaActual = lista;
    const $tabla = document.querySelector("#historico-emocional tbody");
    const $grafico = document.getElementById("grafico-frecuencia");
    const $ver = document.getElementById("btn-ver-todas");

    if (lista.length === 0) {
        const mensaje = registros.length === 0
            ? "Aún no hay registros. Registra cómo te sientes y aquí verás tu evolución."
            : "No hay registros de esta emoción.";
        $tabla.innerHTML = `<tr><td class="px-8 py-5" colspan="5">${mensaje}</td></tr>`;
        $grafico.innerHTML = "";
        if ($ver) $ver.classList.add("hidden");
        return;
    }

    // Más recientes primero, sin depender del orden en que llegue la lista
    const recientes = [...lista].sort((a, b) =>
        b.FECHA_REG > a.FECHA_REG ? 1 : b.FECHA_REG < a.FECHA_REG ? -1 : Number(b.ID_ESTADO_EMOCIONAL) - Number(a.ID_ESTADO_EMOCIONAL));
    const visibles = verTodas ? recientes : recientes.slice(0, LIMITE_TABLA);

    if ($ver) {
        $ver.classList.toggle("hidden", lista.length <= LIMITE_TABLA);
        $ver.textContent = verTodas ? "Ver menos" : `Ver todas (${lista.length})`;
    }

    let historial = "", barras = "";
    lista.forEach((emocion) => {
        barras += `
            <div class="w-full flex flex-col items-center gap-2 h-full justify-end">
                <div class="w-full bg-primary-container rounded-t-lg transition-all hover:brightness-110 flex items-center justify-center text-xs font-bold" style="height: ${emocion.INTENSIDAD * 10}%;">${emocion.INTENSIDAD}</div>
                <span class="font-label-sm text-label-sm rotate-45 mt-4 whitespace-nowrap">${escapar(emocion.NOMBRE)}</span>
            </div>`;
    });
    visibles.forEach((emocion) => {
        historial += `
            <tr>
                <td class="px-8 py-5">${formatearFecha(emocion.FECHA_REG)}</td>
                <td class="px-8 py-5">
                    <span class="flex items-center gap-2">
                        <span class="text-4xl group-hover:scale-125 transition-transform duration-300">${emocion.ICONO}</span>
                        ${escapar(emocion.NOMBRE)}
                    </span>
                </td>
                <td class="px-8 py-5 text-on-surface-variant truncate max-w-xs">${escapar(emocion.COMENTARIO)}</td>
                <td class="px-8 py-5">
                    <div class="flex gap-0.5" title="Intensidad de la emoción: ${emocion.INTENSIDAD}/10">
                        ${intensidadenEstrella(emocion.INTENSIDAD / 2)}
                    </div>
                </td>
                <td class="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined cursor-pointer text-on-surface-variant hover:text-primary" data-icon="chevron_right">chevron_right</span>
                </td>
            </tr>`;
    });
    $tabla.innerHTML = historial;
    $grafico.innerHTML = barras;
}

function intensidadenEstrella(valor) {
    const llenas = Math.max(0, Math.min(5, Math.round(valor)));
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += i <= llenas
            ? `<span class="material-symbols-outlined text-primary text-sm" data-icon="star" data-weight="fill">star</span>`
            : `<span class="material-symbols-outlined text-outline-variant text-sm" data-icon="star">star</span>`;
    }
    return html;
}
