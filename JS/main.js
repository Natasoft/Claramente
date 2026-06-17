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