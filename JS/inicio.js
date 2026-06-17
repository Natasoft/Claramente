export function login() {
console.log("estamos en la funcion login");
const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const email = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    console.log("correo:", email);
    console.log("Contraseña:", password);
    if (!regex.test(email)) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
    }
    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        const datos = {correo: email, password: password};
        console.log(datos);
        return;
    }
    alert(`email: ${email}\npassword: ${password}`);
}