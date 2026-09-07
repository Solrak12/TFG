document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formSugerencias') || document.getElementById('form-contacto');
    if (form) {
        form.addEventListener('submit', enviarSugerenciaAPI);
    }
});
//Función que recibe la sugerencia y se la manda a la API para guardar en la base de datos.
async function enviarSugerenciaAPI(event) {
    event.preventDefault();
    const btnEnviar = document.getElementById('btnEnviar');
    const alertaExito = document.getElementById('mensajeExito');
    const alertaError = document.getElementById('mensajeError');

    if (alertaExito) alertaExito.classList.add('d-none');
    if (alertaError) alertaError.classList.add('d-none');

    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
    }
    const datosFormulario = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        asunto: document.getElementById('asunto').value,
        mensaje: document.getElementById('mensaje').value
    };
    try {
        //Apuntando FastAPI local
        const respuesta = await fetch('http://localhost:8000/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosFormulario)
        });

        if (respuesta.ok) { //Si todo ha funcionado bien manda un mensaje de éxito
            event.target.reset();
            if (alertaExito) alertaExito.classList.remove('d-none');
        } else { 
            const errorData = await respuesta.json();
            console.error('Detalle del error:', errorData);
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) { //Si ha habido un error general 
        console.error('Error al enviar el mensaje:', error);
        if (alertaError) alertaError.classList.remove('d-none');
    } finally {
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar sugerencia';
        }
    }
}