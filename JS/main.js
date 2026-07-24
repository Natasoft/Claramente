import { login } from "./inicio.js";
document.addEventListener("DOMContentLoaded", (Event) => {
    // alert("Bienvenido a Claramente")
});
document.addEventListener("submit", (event) => {
    if (event.target && event.target.id === "formlogin") {
        event.preventDefault();
        login();
    }

});

document.addEventListener("click", (e) => {
    console.log("e.target");
});

const submenu = document.querySelectorAll(".submenu");

submenu.forEach(item => {

    const btn = item.querySelector(".submenu-btn");

    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Cerrar otros submenús
            submenu.forEach(other => {
                if (other !== item && other.classList.contains("abierto")) {
                    other.classList.remove("abierto");
                }
            });

            // Alternar el actual
            item.classList.toggle("abierto");
        });
    }
});

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

// ============================================
// 2. FUNCIÓN PARA INICIALIZAR EL MENÚ
// ============================================
function initMenu() {
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
// 2. MARCAR ENLACE ACTIVO POR PÁGINA
// ============================================

const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".menu a").forEach(link => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
        link.classList.add("active");

        // Abrir submenú padre
        const parentSubmenu = link.closest(".submenu");
        if (parentSubmenu) {
            parentSubmenu.classList.add("abierto");
        }
    }
});

// ============================================
// EVENTO DE FORMULARIOS
// ============================================
document.addEventListener("submit", (event) => {
    if (event.target && event.target.id === "formlogin") {
        event.preventDefault();
        login();
    }
});