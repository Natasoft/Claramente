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
        console.log("Voy a ejecutar fetch");
        enviarPeticion(datos);
        //enviarPeticionGET({params: {correo: email, password: hashedPassword}, "url": "http://localhost:8080/login", "method": "GET"});
        console.log("md5 existe?", typeof md5);
    }
    function enviarPeticion(datos) {

    const { params, url, method } = datos;

    fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Respuesta:", data);
    })
    .catch(error => {
        console.error("Error:", error);
    });

}