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

    item.querySelector(".submenu-btn").addEventListener("click", () => {

        item.classList.toggle("abierto");

    });

});