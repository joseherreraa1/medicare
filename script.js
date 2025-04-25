// Mobile Navigation
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

burger.addEventListener('click', () => {
    // Toggle Nav
    nav.classList.toggle('nav-active');
    
    // Animate Links
    navLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });
    
    // Burger Animation
    burger.classList.toggle('toggle');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Mostrar mensaje de carga
        const submitButton = this.querySelector('.submit-button');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const formData = {
                nombre: this.querySelector('input[type="text"]').value,
                email: this.querySelector('input[type="email"]').value,
                telefono: this.querySelector('input[type="tel"]').value,
                mensaje: this.querySelector('textarea').value
            };
            
            const response = await fetch('/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                this.reset();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al enviar el mensaje. Por favor, intente nuevamente.');
        } finally {
            // Restaurar el botón
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// Add animation to service cards on scroll
const serviceCards = document.querySelectorAll('.service-card');
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Add smooth scroll behavior for the entire page
document.documentElement.style.scrollBehavior = 'smooth';

// Digital Clock
function updateClock() {
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');
    
    if (timeElement && dateElement) {
        const now = new Date();
        
        // Formatear hora
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        
        // Formatear fecha
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = now.toLocaleDateString('es-ES', options);
        dateElement.textContent = dateString;
    }
}

// Actualizar el reloj cada segundo
setInterval(updateClock, 1000);
// Actualizar inmediatamente al cargar
updateClock();

// Funcionalidad para el formulario de citas
document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointmentForm');
    const especialidadSelect = document.getElementById('especialidad');
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    
    if (appointmentForm) {
        // Configurar fecha mínima (hoy)
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        fechaInput.min = minDate;
        
        // Cargar horas disponibles según especialidad
        especialidadSelect.addEventListener('change', cargarHorasDisponibles);
        fechaInput.addEventListener('change', cargarHorasDisponibles);
        
        // Validación en tiempo real
        setupFormValidation();
        
        // Manejar envío del formulario
        appointmentForm.addEventListener('submit', handleFormSubmit);
    }
    
    function cargarHorasDisponibles() {
        const especialidad = especialidadSelect.value;
        const fecha = fechaInput.value;
        
        if (!especialidad || !fecha) return;
        
        // Simular carga de horas disponibles
        const horas = generarHorasDisponibles(especialidad, fecha);
        actualizarSelectHoras(horas);
    }
    
    function generarHorasDisponibles(especialidad, fecha) {
        // Simulación de horas disponibles
        const horasBase = [
            '08:00', '09:00', '10:00', '11:00', '12:00',
            '14:00', '15:00', '16:00', '17:00', '18:00'
        ];
        
        // Simular algunas horas ocupadas
        const horasOcupadas = Math.floor(Math.random() * 3);
        const horasDisponibles = [...horasBase];
        
        for (let i = 0; i < horasOcupadas; i++) {
            const index = Math.floor(Math.random() * horasDisponibles.length);
            horasDisponibles.splice(index, 1);
        }
        
        return horasDisponibles;
    }
    
    function actualizarSelectHoras(horas) {
        horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
        
        horas.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            horaSelect.appendChild(option);
        });
    }
    
    function setupFormValidation() {
        const inputs = appointmentForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateField(this);
                updateProgressBar();
            });
            
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const errorElement = field.nextElementSibling;
        
        if (field.hasAttribute('required') && !value) {
            showError(field, 'Este campo es requerido');
            return false;
        }
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError(field, 'Por favor ingresa un email válido');
                return false;
            }
        }
        
        if (field.id === 'telefono' && value) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                showError(field, 'Por favor ingresa un número de teléfono válido');
                return false;
            }
        }
        
        clearError(field);
        return true;
    }
    
    function showError(field, message) {
        const errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            const newErrorElement = document.createElement('div');
            newErrorElement.className = 'error-message';
            newErrorElement.textContent = message;
            field.parentNode.insertBefore(newErrorElement, field.nextSibling);
        } else {
            errorElement.textContent = message;
        }
        field.classList.add('error');
    }
    
    function clearError(field) {
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        field.classList.remove('error');
    }
    
    function updateProgressBar() {
        const totalFields = appointmentForm.querySelectorAll('input[required], select[required]').length;
        const filledFields = Array.from(appointmentForm.querySelectorAll('input[required], select[required]'))
            .filter(field => field.value.trim() !== '').length;
        
        const progress = (filledFields / totalFields) * 100;
        updateProgressBarUI(progress);
    }
    
    function updateProgressBarUI(progress) {
        let progressBar = document.querySelector('.form-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'form-progress';
            appointmentForm.insertBefore(progressBar, appointmentForm.firstChild);
        }
        
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">${Math.round(progress)}% completado</div>
        `;
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validar todos los campos
        const fields = appointmentForm.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showNotification('Por favor completa todos los campos requeridos correctamente', 'warning');
            return;
        }
        
        // Mostrar resumen de la cita
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            especialidad: document.getElementById('especialidad').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            mensaje: document.getElementById('mensaje').value
        };
        
        showAppointmentSummary(formData);
    }
    
    function showAppointmentSummary(formData) {
        const summaryHTML = `
            <div class="appointment-summary">
                <h3>Resumen de tu Cita</h3>
                <div class="summary-content">
                    <p><strong>Nombre:</strong> ${formData.nombre}</p>
                    <p><strong>Especialidad:</strong> ${formData.especialidad}</p>
                    <p><strong>Fecha:</strong> ${formData.fecha}</p>
                    <p><strong>Hora:</strong> ${formData.hora}</p>
                    <p><strong>Email:</strong> ${formData.email}</p>
                    <p><strong>Teléfono:</strong> ${formData.telefono}</p>
                    ${formData.mensaje ? `<p><strong>Mensaje:</strong> ${formData.mensaje}</p>` : ''}
                </div>
                <div class="summary-actions">
                    <button class="confirm-button">Confirmar Cita</button>
                    <button class="cancel-button">Cancelar</button>
                </div>
            </div>
        `;
        
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'summary-modal';
        summaryContainer.innerHTML = summaryHTML;
        document.body.appendChild(summaryContainer);
        
        // Manejar acciones del resumen
        const confirmButton = summaryContainer.querySelector('.confirm-button');
        const cancelButton = summaryContainer.querySelector('.cancel-button');
        
        confirmButton.addEventListener('click', () => {
            // Simular envío de datos al servidor
            setTimeout(() => {
                summaryContainer.remove();
                showNotification('Tu cita ha sido agendada exitosamente', 'success');
                appointmentForm.reset();
                updateProgressBar();
            }, 1000);
        });
        
        cancelButton.addEventListener('click', () => {
            summaryContainer.remove();
        });
    }
});



// Botón Volver Arriba
function setupBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Tooltips
function setupTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-text';
        tooltip.textContent = tooltipText;
        element.appendChild(tooltip);
    });
}

// Modo Oscuro
function setupDarkMode() {
    console.log('Inicializando modo oscuro...');
    
    // Crear el botón de modo oscuro
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.title = 'Cambiar modo oscuro/claro';
    document.body.appendChild(darkModeToggle);
    
    console.log('Botón de modo oscuro creado:', darkModeToggle);

    // Función para cambiar el modo
    function toggleDarkMode() {
        console.log('Cambiando modo...');
        const isDarkMode = document.body.classList.toggle('dark-mode');
        console.log('Modo oscuro activado:', isDarkMode);
        
        // Actualizar icono
        darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        // Guardar preferencia
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        console.log('Preferencia guardada:', localStorage.getItem('theme'));
        
        // Forzar actualización de estilos
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        // Mostrar notificación
        showNotification(
            'Modo ' + (isDarkMode ? 'Oscuro' : 'Claro'),
            'El tema ha sido cambiado exitosamente',
            'info',
            2000
        );
    }

    // Verificar preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    console.log('Tema guardado:', savedTheme);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        console.log('Modo oscuro aplicado inicialmente');
    }

    // Evento click para cambiar el modo
    darkModeToggle.addEventListener('click', toggleDarkMode);
    console.log('Evento click registrado en el botón');
}

// Inicializar todas las funcionalidades
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando modo oscuro...');
    setupBackToTopButton();
    setupTooltips();
    setupDarkMode();
    
    // Ejemplo de uso de notificaciones
    showNotification('Bienvenido', 'Has iniciado sesión correctamente', 'success');
});

// Función para cambiar el tema
function toggleTheme() {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        html.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Event listener para el botón de cambio de tema
document.getElementById('themeToggle').addEventListener('click', toggleTheme);