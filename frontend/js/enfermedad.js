const API = "http://127.0.0.1:8000";
const parametros = new URLSearchParams(window.location.search);
const nombre = parametros.get("nombre");

async function cargarInformacion() {
    try {
        /*Pide la información detallada de la enfermedad*/
        const respuesta = await fetch(`${API}/informacion/${encodeURIComponent(nombre)}`);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la información.");
        }
        const datos = await respuesta.json();
        const contenedor = document.getElementById("contenido-enfermedad");
        const listaSintomas = datos.sintomas
            ? datos.sintomas.map(s => `<li>${s}</li>`).join("")
            : "";
        /*Inserta el html de todos los detalles*/
        contenedor.innerHTML = `
        <div class="container-fluid px-3 px-md-4 px-lg-5">
            <div class="row mb-4 mb-lg-5 align-items-center">
                <div class="col-12 col-lg-5 mb-4 mb-lg-0">
                    <img src="${datos.imagen}" class="img-fluid rounded shadow w-100" alt="${datos.titulo}">
                </div>
                <div class="col-12 col-lg-7">
                    <h1 class="fw-bold mb-3 titulo-enfermedad">${datos.titulo}</h1>
                    <p class="lead mb-0">${datos.descripcion_larga}</p>
                </div>
            </div>
            <div class="card shadow-sm mb-3 mb-md-4">
                <div class="card-body">
                    <h3 class="h4">Síntomas</h3>
                    <ul class="mb-0">
                        ${listaSintomas}
                    </ul>
                </div>
            </div>
            <div class="card shadow-sm mb-3 mb-md-4">
                <div class="card-body">
                    <h3 class="h4">Transmisión</h3>
                    <p class="mb-0">${datos.transmision ?? ""}</p>
                </div>
            </div>
            <div class="card shadow-sm mb-3 mb-md-4">
                <div class="card-body">
                    <h3 class="h4">Prevención</h3>
                    <p class="mb-0">${datos.prevencion ?? ""}</p>
                </div>
            </div>
            <div class="card shadow-sm mb-3 mb-md-4">
                <div class="card-body">
                    <h3 class="h4">Tratamiento</h3>
                    <p class="mb-0">${datos.tratamiento ?? ""}</p>
                </div>
            </div>
            <div class="card shadow-sm">
                <div class="card-body">
                    <h3 class="h4">Fuente</h3>
                    <p class="mb-0">${datos.fuente ?? ""}</p>
                </div>
            </div>
        </div>
        `;
        const titulo = contenedor.querySelector(".titulo-enfermedad");
        if (titulo && datos.color) {
            titulo.style.color = datos.color;
        }
    } catch (error) {
        console.error(error);
    }
}
cargarInformacion();