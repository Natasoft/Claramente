import { enviarPeticion } from "./herramientas.js";

// --- Inspiración del Día ---
// Frases de ánimo propias de esta tarjeta (distintas a los "datos de bienestar"
// de Registro_emocional.html, que son informativos, no motivacionales).
const inspiraciones = [
    "Recuerda que cada pequeño paso que das hoy es una victoria sobre los desafíos de ayer. Eres más fuerte de lo que crees.",
    "Hoy es una nueva oportunidad para tratarte con más amabilidad.",
    "No tienes que tenerlo todo resuelto hoy, solo dar el siguiente paso.",
    "Tu bienestar importa tanto como cualquier otra prioridad en tu día.",
    "Permítete avanzar a tu propio ritmo, sin comparaciones.",
    "Eres capaz de cosas que todavía no imaginas.",
    "Cada emoción que sientes tiene algo que enseñarte.",
    "El progreso no siempre se ve, pero se siente.",
    "Mereces el mismo cuidado que le das a los demás.",
    "Hoy puedes elegir empezar de nuevo, las veces que necesites."
];

function indiceDelDia(longitud) {
    const hoy = new Date();
    const inicioAnio = new Date(hoy.getFullYear(), 0, 0);
    const diaDelAnio = Math.floor((hoy - inicioAnio) / 86400000);
    return diaDelAnio % longitud;
}

// Se llama desde main.js solo en Retroalimentacion.html
export function mostrarInspiracionDelDia() {
    const $texto = document.getElementById("inspiracion-texto");
    if (!$texto) return;
    $texto.textContent = `"${inspiraciones[indiceDelDia(inspiraciones.length)]}"`;
}

// Se llama desde main.js solo en Retroalimentacion.html
export async function cargarSugerencia() {
    const $texto = document.getElementById("recomendacion-texto");
    const $link = document.getElementById("recomendacion-link");
    const idUsuario = localStorage.getItem("iduser");

    if (!$texto || !idUsuario) return;

    await enviarPeticion({
        url: "../backend/vista_recomendaciones/index.php",
        method: "GET",
        params: { id_usuario: idUsuario },
        fSucces: (resp) => {
            if (resp.code == 200 && resp.datos && resp.datos.length > 0) {
                const sugerencia = resp.datos[0];
                $texto.textContent = sugerencia.DESCRIPCION;

                if (sugerencia.URL && $link) {
                    $link.href = sugerencia.URL;
                    $link.classList.remove("hidden");
                } else if ($link) {
                    $link.classList.add("hidden");
                }
            }
            // Si no hay code 200 (ej. el usuario aún no tiene registros emocionales),
            // se deja el texto de ejemplo que ya trae la tarjeta por defecto.
        }
    });
}

// --- Estado de Alerta ---
// Se llama desde main.js solo en Retroalimentacion.html
export async function cargarEstadoAlerta() {
    const idUsuario = localStorage.getItem("iduser");
    if (!idUsuario || !document.getElementById("alerta-alto")) return;

    await enviarPeticion({
        url: "../backend/vista_emociones/index.php",
        method: "GET",
        params: { id: "alerta", id_usuario: idUsuario },
        fSucces: (resp) => {
            // Si falla la petición, las 3 filas se quedan atenuadas (sin alerta falsa)
            if (resp.code != 200 || !resp.datos || resp.datos.length === 0) return;

            const { NIVEL, INTENSAS, EMOCION_PREDOMINANTE, CANTIDAD_PREDOMINANTE, DIAS } = resp.datos[0];
            const filas = { ALTO: "alerta-alto", MODERADO: "alerta-moderado", BAJO: "alerta-bajo" };

            // Resaltar solo la fila que corresponde al nivel actual
            Object.entries(filas).forEach(([nivel, id]) => {
                const fila = document.getElementById(id);
                const activa = nivel === NIVEL;
                fila.classList.toggle("opacity-60", !activa);
                fila.querySelector(".alerta-punto").classList.toggle("animate-pulse", activa && nivel === "ALTO");
            });

            // Detalle de la fila activa: emoción difícil más repetida
            const detalle = document.getElementById(filas[NIVEL] + "-detalle");
            if (detalle && EMOCION_PREDOMINANTE) {
                const intensas = INTENSAS > 0 ? ` (${INTENSAS} con intensidad alta)` : "";
                detalle.textContent = `${EMOCION_PREDOMINANTE}: ${CANTIDAD_PREDOMINANTE} veces en los últimos ${DIAS} días${intensas}`;
            }

            const mensajes = {
                ALTO: "Has registrado muchas emociones difíciles últimamente. Considera hablar con alguien de confianza o con un profesional.",
                MODERADO: "Algunas emociones difíciles se están repitiendo. Cuidarte hoy puede ayudar.",
                BAJO: "Tus registros recientes muestran un estado emocional estable."
            };
            document.getElementById("alerta-resumen").textContent = mensajes[NIVEL];
        }
    });
}
