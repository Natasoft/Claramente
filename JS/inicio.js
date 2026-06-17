export function login() {
console.log("estamos en la funcion login");
    const email = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    console.log("correo:", email);
    console.log("Contraseña:", password);
    alert(`email: ${email}\npassword: ${password}`);
}