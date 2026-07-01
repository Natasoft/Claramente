import { enviarPeticion, ir } from "./herramientas.js";
export async function login() {
console.log("estamos en la funcion login");
const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const email = document.getElementById("correo").value;
    const password = document.getElementById("password").value;
    const hashedPassword = md5(password);

    console.log("correo:", email);
    console.log("Contraseña:", hashedPassword);
    if (!regex.test(email)) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
    }
    if (password.length < 4) {
        alert("La contraseña debe tener al menos 4 caracteres.");
        return;
    }
        const datos = {params: {correo: email, password: hashedPassword}, "url": "http://localhost:8080/login", "method": "POST"};
        console.log("datos a enviar", datos);
        //console.log("Voy a ejecutar fetch");
        await enviarPeticion({
            url: "controller login.php",
            method: "POST",
            params: {correo: email, password: hashedPassword},
            fSucces: (resp) =>{
                if (resp.code !== 200) {
                    alert("Inicio de sesión exitoso");
                    ir("panelbootstrap.html");
                }
                else {alert(resp.msg)}
        }
        });
        
        }