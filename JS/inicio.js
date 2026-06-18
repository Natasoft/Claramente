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
    if (password.length < 4) {
        alert("La contraseña debe tener al menos 4 caracteres.");
        const datos = {params: {correo: email, password: password}, "url": "http://localhost:8080/login", "method": "POST"};
        console.log("datos a enviar", datos);
        enviarpeticion(datos);
    
    }
    function enviarpeticion(datos) {
       let {params, url, method} = datos;
        console.log("params:", params);
        console.log("url:", url);
        console.log("method:", method);
        try {
        fetch(url, {
            method: method,
            headers: {  
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta del servidor:", data);   
        })
        .catch(error => {
        console.error("Error al enviar la peticion:", error);
        });
    } catch(error){
        console.error("Error en la funcion enviarpeticion:", error);
         }
    }
 }