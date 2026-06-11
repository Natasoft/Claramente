document.addEventListener("DOMContentLoaded", (Event) => {
// alert("Bienvenido a Claramente")
});
document.addEventListener("submit", (event) => {
 if (event.target && event.target.id === "formlogin") {
event.preventDefault();
login();
 }
    
});

function login() {
    console.log("estamos en la funcion login");
    const email = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    console.log("correo:", email);
    console.log("Contraseña:", password);
    alert(`email: ${email}\npassword: ${password}`);
}

formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
});