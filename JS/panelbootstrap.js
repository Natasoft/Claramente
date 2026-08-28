import { enviarPeticion, ir } from "./herramientas.js";

export function validarUsuario() {
    let token = localStorage.getItem("token")
    let iduser = localStorage.getItem("iduser")
    let user = localStorage.getItem("user")

    if (token == null || iduser == null || user == null) {
        salir()
    } else {
        try{
            document.querySelector("#lbUsuario").innerHTML = ", "+user+"!"
        }catch(e){}
        //consultarRegistros("",10)
    }
}


export async function salir() {
    await enviarPeticion({
        url: "../backend/vista_inicio/index.php",
        method: "DELETE",
        params: { iduser: localStorage.getItem("iduser"), token: localStorage.getItem("token") },
        fSucces: (resp) => {
            //console.log("Respuesta del servidor:", resp);
            if (resp.code == 200) {
                localStorage.clear();
                ir("inicio.html");
            } else { alert(resp.msg || "Error al cerrar la sesión"); }
        }
    });
}

export function menu() {
    // 1. CARGAR EL MENÚ DESDE menu.html
// ============================================
fetch('menu.html')
    .then(response => response.text())
    .then(menuHTML => {
        // Insertar el menú en el sidebar
        document.querySelector('.sidebar').innerHTML = menuHTML;

        // Inicializar funcionalidades del menú
        initMenu();
    })
    .catch(error => {
        console.error('Error al cargar el menú:', error);
    });
}


// ============================================
// 2. FUNCIÓN PARA INICIALIZAR EL MENÚ
// ============================================
function initMenu() {

    const currentPath = window.location.pathname; // O la URL actual que desees comparar
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach((link) => {
        // Verificar si el enlace coincide con la ruta actual
        if (link.getAttribute("href") === currentPath || link.href === window.location.href) {

            // 1. Quitar la clase de hover y aplicar el estado activo al enlace
            link.classList.remove("hover:bg-primary-container", "hover:bg-surface-container-high");
            link.classList.add("bg-primary-container", "text-on-primary-container", "font-medium");

            // 2. Si el enlace pertenece a un submenú (<details>), abrirlo y marcar el menú padre
            const parentDetails = link.closest("details");
            if (parentDetails) {
                // Abrir el submenú contenedor
                parentDetails.setAttribute("open", "");

                // Estilizar el botón principal (<summary>) del submenú contenedor
                const summary = parentDetails.querySelector("summary");
                if (summary) {
                    //summary.classList.remove("hover:bg-primary-container", "hover:bg-surface-container-high");
                    //summary.classList.add("bg-primary-container", "text-primary", "font-semibold");
                }
            }
        }
    });
    /*
    // ABRIR/CERRAR SUBMENÚS
    const submenu = document.querySelectorAll(".submenu");

    submenu.forEach(item => {
        const btn = item.querySelector(".submenu-btn");

        if (btn) {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                submenu.forEach(other => {
                    if (other !== item && other.classList.contains("abierto")) {
                        other.classList.remove("abierto");
                    }
                });

                item.classList.toggle("abierto");
            });
        }
    });

    // ============================================
    // MARCAR ENLACE ACTIVO POR PÁGINA
    // ============================================

    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".menu a").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {
            // Activa el enlace
            link.classList.add("active");

            // Busca el submenú padre
            const parentSubmenu = link.closest(".submenu");

            if (parentSubmenu) {
                // Abre el submenú
                parentSubmenu.classList.add("abierto");

                // Activa el botón principal
                const submenuBtn = parentSubmenu.querySelector(".submenu-btn");
                if (submenuBtn) {
                    submenuBtn.classList.add("active");
                }
            }
        }
    });*/

}