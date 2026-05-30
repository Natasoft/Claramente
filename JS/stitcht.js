// Update live time/date
        function updateDateTime() {
            const now = new Date();
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            
            document.getElementById('current-date').textContent = now.toLocaleDateString('es-ES', dateOptions);
            document.getElementById('current-time').textContent = now.toLocaleTimeString('es-ES', timeOptions);
        }
        setInterval(updateDateTime, 1000);
        updateDateTime();

        // Slider functionality
        const slider = document.getElementById('intensity-slider');
        const intensityVal = document.getElementById('intensity-value');
        slider.addEventListener('input', (e) => {
            intensityVal.textContent = e.target.value;
            // Visual feedback - brightness
            intensityVal.style.filter = `brightness(${0.5 + (e.target.value / 10)})`;
        });

        // Emotion selection
        function selectEmotion(btn) {
            document.querySelectorAll('.emotion-card').forEach(card => {
                card.classList.remove('active');
            });
            btn.classList.add('active');
        }

        // Save registry logic
        function saveRegistry() {
            const modal = document.getElementById('success-modal');
            const content = document.getElementById('modal-content');
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                content.classList.remove('scale-90');
                content.classList.add('scale-100');
            }, 10);
        }

        function closeModal() {
            const modal = document.getElementById('success-modal');
            modal.classList.add('opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }