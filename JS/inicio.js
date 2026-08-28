import { enviarPeticion, ir } from "./herramientas.js";
export async function login() {
    //console.log("estamos en la funcion login");
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const email = document.getElementById("correo").value;
    const password = document.getElementById("password").value;
    const hashedPassword = md5(password);

    //console.log("usuario:", email);
    //console.log("Contraseña:", hashedPassword);
    if (!regex.test(email)) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
    }
    if (password.length < 4) {
        alert("La contraseña debe tener al menos 4 caracteres.");
        return;
    }
    const datos = { params: { usuario: email, password: hashedPassword }, "url": "../backend/vista_inicio/index.php", "method": "POST" };
    //console.log("datos a enviar", datos);
    //console.log("Voy a ejecutar fetch");
    await enviarPeticion({
        url: "../backend/vista_inicio/index.php",
        method: "POST",
        params: { usuario: email, password: hashedPassword },
        fSucces: (resp) => {
            //console.log("Respuesta del servidor:", resp);
            if (resp.code == 200) {
                //alert("Inicio de sesión exitoso");
                localStorage.clear();
                localStorage.setItem('token', resp.token);
                localStorage.setItem('iduser', resp.iduser);
                localStorage.setItem('user', resp.user);
                ir("panelbootstrap.html?token=" + resp.token);
            }
            else { alert(resp.msg || "Error al iniciar sesión"); }
        }
    });

}

export function validarToken() {
    let token = localStorage.getItem("token")
    let iduser = localStorage.getItem("iduser")
    let user = localStorage.getItem("user")

    if (token == null || iduser == null || user == null) {
        localStorage.clear()
    } else {
        ir("panelbootstrap.html?token=" + token);
    }

}