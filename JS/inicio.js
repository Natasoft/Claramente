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
            url: "http://localhost:8080/login",
            method: "POST",
            params: {correo: email, password: hashedPassword},
            Fsuccess: function (response) => {
                if (response.code === 200) {
                    alert("Inicio de sesión exitoso");
                    ir (index.html);
                }
                else {alert(response.message);}
        }

        );
        await enviarPeticionGET({params: {correo: email, password: hashedPassword}, "url": "http://localhost:8080/login", "method": "GET"});
        //console.log("md5 existe?", typeof md5);
    }

    async function enviarPeticion(info) {
        let {url, method, params, fSucces } = info, headers = {contentType: "application/json"};
        if (method === "PATCH") headers = {contentType: "multipart/form-data"};
        if (params !== undefined && method === "GET") url += "?" + new URLSearchParams(params);
        if (method === "GET") method ={ method, headers, params};
        if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH" ) method = { method, headers, body: JSON.stringify(params)};
        
        TRY {
            console.log(url, method);
            let resp = await fetch(url, method);
            if (resp.ok) throw { status: resp.status, statusText: resp.statusText };
            let respJson = await resp.json();
            Fsuccess(respJson);
        } catch (err) {
                Fsuccess({code: err.status, message: err.message});
        }

}