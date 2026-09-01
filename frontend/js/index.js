const API = "http://127.0.0.1:8000";
const contenedor = document.getElementById("contenedor-tarjetas");

async function cargarTarjetas() {
    try {
        contenedor.innerHTML = "";
        /*Petición al backend para obtener la lista de enfermedades*/
        const respuesta = await fetch(`${API}/enfermedades_lista`);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la lista de enfermedades.");
        }
        /*Obtiene la información del JSON*/
        const enfermedades = await respuesta.json();
        for (const nombre of enfermedades) {
            const respuestaInfo = await fetch(
                `${API}/informacion/${encodeURIComponent(nombre)}`
            );
            if (!respuestaInfo.ok) {
                continue;
            }
            const datos = await respuestaInfo.json();
            if (datos.error) {
                continue;
            }
            /*Construye las tarjetas*/
            const columna = document.createElement("div");
            columna.className = "col-12 col-sm-8 col-md-6 col-lg-4 d-flex justify-content-center";
            columna.innerHTML = `
                <div class="card enfermedad h-100 shadow-sm w-100">
                    <img
                        src="${datos.imagen}"
                        class="card-img-top imagen-enfermedad"
                        alt="${datos.titulo}"
                        onerror="this.src='img/imagen-no-disponible.jpg'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">
                            ${datos.titulo}
                        </h5>
                        <p class="card-text">
                            ${datos.descripcion_corta}
                        </p>
                        <a
                            href="enfermedad.html?nombre=${encodeURIComponent(datos.nombre)}"
                            class="btn mt-auto boton-enfermedad"
                            style="--bs-btn-bg:${datos.color};--bs-btn-border-color:${datos.color};--bs-btn-hover-bg:${datos.color};--bs-btn-hover-border-color:${datos.color};--bs-btn-color:#fff;--bs-btn-hover-color:#fff">
                            Saber más
                        </a>
                    </div>
                </div>
            `;
            contenedor.appendChild(columna);
        }
    } catch (error) {
        console.error("Error cargando las tarjetas:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar las enfermedades.
            </div>
        `;
    }
}
cargarTarjetas();