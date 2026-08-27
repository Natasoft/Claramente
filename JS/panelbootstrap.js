import { enviarPeticion, ir } from "./herramientas.js";

export function validarUsuario() {
    let token = localStorage.getItem("token")
    let iduser = localStorage.getItem("iduser")
    let user = localStorage.getItem("user")

    if (token == null || iduser == null || user == null) {
        localStorage.clear()
        ir("inicio.html")
    } else {
        document.querySelector("#lbUsuario").innerHTML = user
        //document.querySelector("#iduser").value = iduser
        //document.querySelector("#idtk").value = token
        //consultarRegistros("",10)
    }
}