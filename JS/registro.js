// =====================================================================
// registro.js - Pantalla de registro (Registro.html)
//
// Es independiente de main.js a propósito: main.js trata cualquier página que
// no sea inicio.html como pantalla interna y mandaría al login a quien aún
// no tiene sesión (justo el caso de quien se está registrando).
//
// Las validaciones de aquí son para ayudar a la persona; el servidor
// (backend/vista_registro) vuelve a validar todo, porque no confía en el navegador.
// =====================================================================

import { enviarPeticion, ir } from "./herramientas.js";

const API = "../backend/vista_registro/index.php";

// Mismas reglas que el login (inicio.js): así nadie registra un correo que el login luego rechace
const REGEX_CORREO = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
// Nombres: letras (con tildes y ñ), espacios, punto, apostrofe y guion
const REGEX_NOMBRE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const MINIMO_CONTRASENA = 8;
const BYTES_MAXIMOS = 72; // el servidor guarda la contraseña con bcrypt, que solo usa los primeros 72 bytes

const $ = {}; // referencias a elementos del HTML

// ---------------------------------------------------------------------
// Avisos y campos marcados
// ---------------------------------------------------------------------
function mostrarMensaje(texto, tipo) {
    $.mensaje.textContent = texto;
    $.mensaje.classList.remove("d-none", "alert-danger", "alert-success");
    $.mensaje.classList.add(tipo === "exito" ? "alert-success" : "alert-danger");
}

function ocultarMensaje() {
    $.mensaje.textContent = "";
    $.mensaje.classList.add("d-none");
}

function limpiarInvalidos() {
    [$.nombres, $.apellidos, $.correo, $.password, $.confirmar, $.autorizacion].forEach($c => {
        if ($c) $c.classList.remove("is-invalid");
    });
}

// Muestra el error, marca el campo y le da el foco. Devuelve null para poder usar "return invalido(...)"
function invalido($campo, texto) {
    mostrarMensaje(texto, "error");
    if ($campo) {
        $campo.classList.add("is-invalid");
        $campo.focus();
    }
    return null;
}

// ---------------------------------------------------------------------
// Validación en el navegador
// ---------------------------------------------------------------------
function limpiarNombre(texto) {
    return texto.trim().replace(/ {2,}/g, " ");
}

function nombreValido(texto) {
    return texto.length >= 2 && texto.length <= 30 && REGEX_NOMBRE.test(texto);
}

// Devuelve los datos limpios, o null si algo está mal (y ya mostró el aviso)
function validar() {
    limpiarInvalidos();

    const nombres = limpiarNombre($.nombres.value);
    const apellidos = limpiarNombre($.apellidos.value);
    const correo = $.correo.value.trim().toLowerCase();
    const password = $.password.value;
    const confirmar = $.confirmar.value;

    if (!nombreValido(nombres)) return invalido($.nombres, "Escribe tus nombres (de 2 a 30 letras).");
    if (!nombreValido(apellidos)) return invalido($.apellidos, "Escribe tus apellidos (de 2 a 30 letras).");
    if (correo.length > 100 || !REGEX_CORREO.test(correo)) return invalido($.correo, "Ingresa un correo electrónico válido.");
    if (password.length < MINIMO_CONTRASENA) return invalido($.password, `La contraseña debe tener al menos ${MINIMO_CONTRASENA} caracteres.`);
    if (new TextEncoder().encode(password).length > BYTES_MAXIMOS) return invalido($.password, `La contraseña es demasiado larga (máximo ${BYTES_MAXIMOS} caracteres).`);
    if (password !== confirmar) return invalido($.confirmar, "Las contraseñas no coinciden.");
    if ($.autorizacion && !$.autorizacion.checked) {
        return invalido($.autorizacion, "Debes aceptar la autorización de tratamiento de datos para crear tu cuenta.");
    }

    ocultarMensaje();
    return { nombres, apellidos, correo, password };
}

// ---------------------------------------------------------------------
// Envío
// ---------------------------------------------------------------------
async function registrar(evento) {
    evento.preventDefault();

    const datos = validar();
    if (!datos) return;

    $.boton.disabled = true; // evita enviar dos veces con un doble clic

    await enviarPeticion({
        url: API,
        method: "POST",
        params: {
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            email: datos.correo,
            password: datos.password, // viaja tal cual; el servidor la guarda con un hash robusto (usar HTTPS al publicar)
            autorizacion: !!($.autorizacion && $.autorizacion.checked)
        },
        fSucces: (resp) => {
            // enviarPeticion descarta el mensaje del servidor cuando hay un error HTTP,
            // por eso aquí cada código tiene su propio texto.
            if (resp.code == 200) {
                mostrarMensaje("¡Cuenta creada! Te llevaremos al inicio de sesión...", "exito");
                setTimeout(() => ir("inicio.html"), 2500); // el botón queda deshabilitado
                return;
            }

            if (resp.code == 409) {
                invalido($.correo, "Este correo ya tiene una cuenta. Puedes iniciar sesión.");
            } else if (resp.code == 400) {
                invalido(null, "Revisa los datos e inténtalo de nuevo.");
            } else {
                mostrarMensaje("No pudimos crear tu cuenta. Intenta de nuevo en unos minutos.", "error");
            }
            $.boton.disabled = false;
        }
    });
}

// ---------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------
function iniciar() {
    const ids = {
        formulario: "formregistro", mensaje: "registro-mensaje", boton: "registro-btn",
        nombres: "nombres", apellidos: "apellidos", correo: "correo",
        password: "password", confirmar: "confirmar", autorizacion: "autorizacion"
    };
    Object.entries(ids).forEach(([clave, id]) => { $[clave] = document.getElementById(id); });
    if (!$.formulario) return;

    $.formulario.addEventListener("submit", registrar);

    // Al escribir de nuevo en un campo marcado en rojo, se quita la marca
    [$.nombres, $.apellidos, $.correo, $.password, $.confirmar, $.autorizacion].forEach($c => {
        if ($c) $c.addEventListener("input", () => $c.classList.remove("is-invalid"));
    });
}

iniciar();
