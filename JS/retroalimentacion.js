import { enviarPeticion } from "./herramientas.js";

function resaltarNivel(nivel) {
    document.querySelectorAll('.nivel-card').forEach(card => {
        const activo = card.dataset.nivel === nivel;
        card.classList.toggle('opacity-40', !activo);
        card.classList.toggle('ring-2', activo);
        card.classList.toggle('ring-primary/30', activo);

        const dot = card.querySelector('.nivel-dot');
        if (dot) dot.classList.toggle('animate-pulse', activo && nivel === 'alto');
    });
}

async function cargarTendencia() {
    const res = await fetch('../PHP/tendencia.php');
    const data = await res.json();
    // data = { nivel: 'observacion' | 'alto' | 'medio' | 'bajo', dias: 7 }

    if (data.nivel === 'observacion') {
        const pct = Math.min((data.dias / 15) * 100, 100);
        document.getElementById('progreso-texto').textContent =
            `Llevas ${data.dias} de 15 días de observación`;
        document.getElementById('progreso-barra').style.width = pct + '%';
        // en observación, solo se ve normal la tarjeta neutra
        document.querySelectorAll('.nivel-card').forEach(c =>
            c.classList.toggle('opacity-40', c.dataset.nivel !== 'observacion'));
    } else {
        document.querySelector('[data-nivel="observacion"]').classList.add('hidden');
        resaltarNivel(data.nivel);
    }
}

cargarTendencia();