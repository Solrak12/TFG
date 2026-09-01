import { descargarCSV, descargarCSVCompleto } from "./descarga.js";
const API = "http://127.0.0.1:8000";

/*Constantes y variables globales*/
const filtroEnfermedad = document.getElementById("filtro-enfermedad");
const filtroAnyo = document.getElementById("filtro-anyo");
const filtroMostrar = document.getElementById("filtro-mostrar");
const botonActualizar = document.getElementById("btn-actualizar");
const botonCSV = document.getElementById("btn-csv");
const botonCSVCompleto = document.getElementById("btn-csv-completo");
let capaComunidades;
let capaCirculos;
let capaGenero;
let capaEdad;
let datosMapa = [];
/*Inicia el mapa y la leyenda con valores iniciales*/
const mapa = L.map("mapa", {
    zoomControl: true,
    zoomSnap: 0.1,
    zoomDelta: 0.1
});
let divLeyenda;
const leyenda = L.control({
    position: "bottomright"
});
leyenda.onAdd = function() {
    divLeyenda = L.DomUtil.create('div', 'leyenda-mapa bg-white p-2 p-md-3 rounded shadow-sm');
    actualizarLeyenda(); 
    L.DomEvent.disableClickPropagation(divLeyenda);
    return divLeyenda;
};
leyenda.addTo(mapa);
/*Actualiza y dibuja la leyenda según lo seleccionado en los filtros*/
function actualizarLeyenda() {
    if (!divLeyenda) return;
    const mostrar = filtroMostrar.value;
    if (mostrar === "casos") {
        divLeyenda.innerHTML = `
            <strong class="small d-block mb-2">Tasa de notificación</strong>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#fefbfb"></span> Sin casos</div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#FEB24C"></span> > 0 &lt;= 1</div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#FD8D3C"></span> 1 &lt;= 2</div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#FC4E2A"></span> 2 &lt;= 5</div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#E31A1C"></span> 5 &lt;= 10</div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#BD0026"></span> 10 &lt; 20</div>
            <div class="d-flex align-items-center gap-2 small"><span class="caja-color" style="background:#800026"></span> ≥ 20</div>
        `;
    }
    if (mostrar === "genero") {
        divLeyenda.innerHTML = `
            <strong class="small d-block mb-2">Género predominante</strong>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#91f3ec"></span> Hombres ♂</div>
            <div class="d-flex align-items-center gap-2 small"><span class="caja-color" style="background:#d7b8ed"></span> Mujeres ♀</div>
        `;
    }
    if (mostrar === "edad") {
        divLeyenda.innerHTML = `
            <strong class="small d-block mb-2">Rango de edad</strong>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#72eaff"></span> 0-15 <img src="img/bebe.png" class="img-fluid"></div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#66cbfe"></span> 15-25 <img src="img/niño.png" class="img-fluid"></div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#98ff96"></span> 25-35 <img src="img/joven.png" class="img-fluid"></div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#7fff58"></span> 35-45 <img src="img/barba.png" class="img-fluid"></div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#ffb2f1"></span> 45-55 <img src="img/adulta.png" class="img-fluid"></div>
            <div class="d-flex align-items-center gap-2 mb-1 small"><span class="caja-color" style="background:#ff5dc9"></span> 55-65 <img src="img/mayor.png" class="img-fluid"></div>
            <div class="d-flex align-items-center gap-2 small"><span class="caja-color" style="background:#b424e8"></span> ≥65 <img src="img/anciano.png" class="img-fluid"></div>
        `;
    }
}
/*Se crean las capas que pintan los elementos del mapa*/
capaCirculos = L.layerGroup().addTo(mapa);
capaGenero = L.layerGroup().addTo(mapa);
capaEdad = L.layerGroup().addTo(mapa);
/*Como se ve el mapa de tamaño y zoom por defecto*/
mapa.setView([39.3, -5.5], 5.7);
/*Carga la capa tiles sobre el mapa*/
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap"
    }
).addTo(mapa);
/*Descarga los datos del geojson para pintar las comunidades*/
fetch("geojson/mapa.geojson")
.then(r => r.json())
.then(datos => {
    datos.features = datos.features.filter(feature => feature.properties.acom_name !== "Territorio no asociado a ninguna autonomía"); /*Excluye un punto del geojson que no nos interesa*/
    datos.features.forEach(feature => {
        const nombre = feature.properties.acom_name;
        if (nombre === "Canarias") {
            feature.geometry.coordinates = moverCoordenadas(feature.geometry.coordinates,3,7); /*Mueve las coordenadas de canarias en el mapa visualmente*/
        }
    });
    let canariasLayer = null;
    /*Pinta las comunidades por defecto*/
    capaComunidades = L.geoJSON(datos, {
        style: {
            color: "#666",
            weight: 1,
            fillColor: "#fcf8f8",
            fillOpacity: 0.9
        },
        onEachFeature: function(feature, layer) {
            if (feature.properties.acom_name === "Canarias") {
                canariasLayer = layer;
            }
        }
    }).addTo(mapa);
    if (canariasLayer) {
        const b = canariasLayer.getBounds();
        /*Añade un rectangulo alrededor de las islas canarias para mejor visualización*/
        L.rectangle(
            [[b.getSouth() - 0.35, b.getWest() - 0.35],[b.getNorth() + 0.35, b.getEast() + 0.35]],
            {color: "#4d463e", weight: 2, fill: false}
        ).addTo(mapa);
    }
});
/*Obtiene del backend la lista de las enfermedades*/
async function cargarEnfermedades() {
    try {
        const respuesta = await fetch(`${API}/enfermedades_lista`);
        const enfermedades = await respuesta.json();
        filtroEnfermedad.innerHTML = "";
        for (const enfermedad of enfermedades) {
            const opcion = document.createElement("option");
            opcion.value = enfermedad;
            opcion.textContent = enfermedad;
            filtroEnfermedad.appendChild(opcion);
        }
    } catch (error) {
        console.error("Error cargando enfermedades:", error);
    }
}
/*Obtiene los años disponibles del backend*/
async function cargarAnyos() {
    try {
        const respuesta = await fetch(`${API}/anyos`);
        const anyos = await respuesta.json();
        filtroAnyo.innerHTML = "";
        for (const anyo of anyos) {
            const opcion = document.createElement("option");
            opcion.value = anyo;
            opcion.textContent = anyo;
            filtroAnyo.appendChild(opcion);
        }
    } catch (error) {
        console.error("Error cargando años:", error);
    }
}
/*Normaliza los nombres para que coincidan los de la base de datos y el geoJSON*/
function normalizarNombre(nombre) {
    const equivalencias = {
        "Ciudad Autónoma de Ceuta": "Ceuta",
        "Ciudad Autónoma de Melilla": "Melilla",
        "Comunidad de Madrid": "Madrid",
        "Comunitat Valenciana": "C. Valenciana",
        "Castilla y León": "Castilla y Leon",
        "Región de Murcia": "Murcia",
        "Principado de Asturias": "Asturias",
        "Comunidad Foral de Navarra": "Navarra",
        "Andalucía": "Andalucia",
        "Aragón": "Aragon",
        "Illes Balears": "Baleares"
    };
    return equivalencias[nombre] || nombre;
}
/*Colores que se usan para pintar las comunidades según su tasa de notificación*/
function obtenerColor(tasa) {
    if (tasa >= 20) return "#800026";
    if (tasa >= 10) return "#BD0026";
    if (tasa >= 5) return "#E31A1C";
    if (tasa >= 2) return "#FC4E2A";
    if (tasa >= 1) return "#FD8D3C";
    if (tasa > 0) return "#FEB24C";
    return "#fefbfb";
}
/*Resetea las capas que pintan el mapa*/
function limpiarCapas() {
    capaCirculos.clearLayers();
    capaGenero.clearLayers();
    capaEdad.clearLayers();
}
/*Resetea todo el mapa dejandolo antes de pulsar el botón buscar*/
function limpiarMapa() {
    if (!capaComunidades) return;
    capaComunidades.eachLayer(layer => {
        layer.setStyle({fillColor: "#fcf8f8", fillOpacity: 0.9, color: "#666", weight: 1});
        layer.unbindTooltip();
    });
}
/*Función que pinta el mapa según la tasa de notificación*/
async function actualizarCasos(enfermedad, anyo) {
    const respuesta = await fetch(
        `${API}/buscar?enfermedad=${encodeURIComponent(enfermedad)}&anyo=${encodeURIComponent(anyo)}`
    );
    if (!respuesta.ok) {
        throw new Error(`Error API /buscar: ${respuesta.status}`);
    }
    /*Guarda los datos obtenidos del endpoint buscar de la API*/
    const datos = await respuesta.json();
    datosMapa = datos;
    if (datos.length === 0) {
        limpiarMapa();
        alert("No existen datos para esos filtros.");
        return;
    }
    if (!capaComunidades) {
        console.error("El GeoJSON todavía no se ha cargado.");
        return;
    }
    capaComunidades.eachLayer(layer => {
        /*Normaliza los datos obtenidos de buscar con los del geoJSON*/
        const nombreMapa = normalizarNombre(layer.feature.properties.acom_name);
        const registro = datos.find(d => d.comunidad === nombreMapa);
        /*Si no se encuentra nada, se ponen por defecto*/
        if (!registro) {
            layer.setStyle({fillColor: "#eeeeee",fillOpacity: 0.6});
            layer.unbindTooltip();
            return;
        }
        /*Calcula según la tasa de notificación y los casos, que color y tamaño del circulo pintar en el mapa para representar su gravedad*/
        const tasa = Number(registro.tasa_notificacion);
        const casos = Number(registro.casos);
        const centro = layer.getBounds().getCenter();
        if (casos > 0) {
            const radio = Math.min(12,Math.max(3, tasa * 3));
            const circulo = L.circleMarker(centro, { /*Pinta el circulo en las comunidades basado en los cálculos anteriores*/
                radius: radio,
                color: "#d32f2f",
                fillColor: "#e53935",
                fillOpacity: 0.75
            }).addTo(capaCirculos);
            /*Herramienta que pinta una pantalla con los datos enteros en cada comunidad autonoma al pasar el ratón*/
            circulo.bindTooltip(`
                <strong>${registro.comunidad}</strong><br>
                Casos: ${registro.casos}<br>
                Tasa notificación: ${registro.tasa_notificacion}
            `, {
                sticky: true
            });
        }
        layer.bindTooltip(`
            <strong>${registro.comunidad}</strong><br>
            Casos: ${registro.casos}<br>
            Tasa notificación: ${registro.tasa_notificacion}
        `, {
            sticky: true
        });
        layer.setStyle({fillColor: obtenerColor(tasa), fillOpacity: 0.8, color: "#555", weight: 1});
    });
}
/*Función que pinta el mapa según el género más predominante*/
async function actualizarGenero(enfermedad, anyo) {
    const respuesta = await fetch(`${API}/genero/${encodeURIComponent(enfermedad)}/${encodeURIComponent(anyo)}`);
    if (!respuesta.ok) {
        throw new Error(`Error API /genero: ${respuesta.status}`);
    }
    /*Guarda los datos obtenidos del enpoint genero de la API*/
    const datos = await respuesta.json();
    datosMapa = datos;
    const hombres = Number(datos.hombres) || 0;
    const mujeres = Number(datos.mujeres) || 0;
    if (!capaComunidades) return;
    /*Colores y símbolos para pintar el mapa en el modo género según el género más afectado*/
    const predominante = hombres >= mujeres ? "Hombres" : "Mujeres";
    const color = hombres >= mujeres ? "#91f3ec" : "#d7b8ed";
    const icono = hombres >= mujeres ? "♂" : "♀";

    capaComunidades.eachLayer(layer => {
        const nombre = layer.feature.properties.acom_name;
        layer.setStyle({fillColor: color,fillOpacity: 0.7,color: "#555",weight: 1});
        /*Herramienta que pinta una pantalla con los datos enteros en cada comunidad autonoma al pasar el ratón*/
        layer.bindTooltip(`
            <strong>${nombre}</strong><br>
            Hombres: ${hombres}<br>
            Mujeres: ${mujeres}<br>
            Predominante: ${predominante}
        `, {
            sticky: true
        });
        const centro = layer.getBounds().getCenter();
        L.marker(centro, {
            /*Personaliza el tamaño del icono de género*/
            icon: L.divIcon({
                className: "icono-genero",
                html: `<span style="font-size: 24px; line-height: 28px;">${icono}</span>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            })
        }).addTo(capaGenero);
    });
}
/*Función que pinta el mapa según el rango de edad más predominante*/
async function actualizarEdad(enfermedad, anyo) {
    const respuesta = await fetch(`${API}/edad/${encodeURIComponent(enfermedad)}/${encodeURIComponent(anyo)}`);
    if (!respuesta.ok) {
        throw new Error(`Error API /edad: ${respuesta.status}`);
    }
    /*Guarda los datos obtenidos del enpoint edad de la API*/
    const datos = await respuesta.json();
    datosMapa = datos;
    if (!capaComunidades) return;
    /*Los distintos colores e iconos que se pintan en el mapa según el rango de edad más afectado*/
    const colores = {
        "0-15": "#72eaff",
        "15-25": "#66cbfe",
        "25-35": "#98ff96",
        "35-45": "#7fff58",
        "45-55": "#ffb2f1",
        "55-65": "#ff5dc9",
        ">=65": "#b424e8"
    };
    const iconos = {
        "0-15": "img/bebe.png",
        "15-25": "img/niño.png",
        "25-35": "img/joven.png",
        "35-45": "img/barba.png",
        "45-55": "img/adulta.png",
        "55-65": "img/mayor.png",
        ">=65": "img/anciano.png"
    };
    let grupoMayor = null;
    let casosMayor = -1;
    /*Cálcula el rango de edad que tiene que pintar según el número de casos mayor en todos los rangos de edad*/
    datos.forEach(dato => {
        const casos = Number(dato.casos) || 0;
        if (dato.rango_edad !== "Total" && casos > casosMayor) {
            casosMayor = casos;
            grupoMayor = dato.rango_edad;
        }
    });
    if (!grupoMayor) return;
    capaComunidades.eachLayer(layer => {
        const nombre = layer.feature.properties.acom_name;
        layer.setStyle({
            fillColor: colores[grupoMayor] || "#cccccc",
            fillOpacity: 0.7,
            color: "#555",
            weight: 1
        });
        /*Herramienta que pinta una pantalla con los datos enteros en cada comunidad autonoma al pasar el ratón*/
        let tooltip = `<strong>${nombre}</strong><br>`;
        datos.forEach(dato => {
            if (dato.rango_edad !== "Total") {
                tooltip += `${dato.rango_edad}: ${dato.casos}<br>`;
            }
        });
        tooltip += `<strong>Rango predominante: ${grupoMayor}</strong>`;
        layer.bindTooltip(tooltip, {
            sticky: true
        });
        const centro = layer.getBounds().getCenter();
        L.marker(centro, {
            icon: L.divIcon({
                className: "icono-edad",
                html: `<img src="${iconos[grupoMayor]}" alt="${grupoMayor}" style="width: 32px; height: 32px;" onerror="this.style.display='none'">`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })
        }).addTo(capaEdad);
    });
}
/*Función que se encarga de actualizar el botón cada vez que se cambian los filtros y se le da al botón buscar*/
async function actualizarMapa() {
    const enfermedad = filtroEnfermedad.value;
    const anyo = filtroAnyo.value;
    const mostrar = filtroMostrar.value;
    try {
        /*Primero limpia las capas y luego las pinta según lo seleccionado en mostrar*/
        limpiarCapas();
        if (mostrar === "casos") {
            await actualizarCasos(enfermedad, anyo);
        } else if (mostrar === "genero") {
            datosMapa = [];
            limpiarMapa();
            await actualizarGenero(enfermedad, anyo);
        } else if (mostrar === "edad") {
            datosMapa = [];
            limpiarMapa();
            await actualizarEdad(enfermedad, anyo);
        }
    } catch (error) {
        console.error("Error actualizando mapa:", error);
        alert("Ha ocurrido un error al cargar los datos.");
    }
}
/*Mueve visualmente las islas canarias del mapa más cerca de la península*/
function moverCoordenadas(coordenadas, dx, dy) {
    if (typeof coordenadas[0] === "number") {
        return [coordenadas[0] + dx, coordenadas[1] + dy];
    }
    return coordenadas.map(c =>moverCoordenadas(c, dx, dy));
}
/*Los eventListener que actualizan el mapa según sus condiciones*/
filtroMostrar.addEventListener("change", () => {
    actualizarLeyenda();
    actualizarMapa();
});
filtroAnyo.addEventListener("change", () => {
    actualizarMapa();
});
filtroEnfermedad.addEventListener("change", () => {
    actualizarMapa();
});
botonActualizar.addEventListener("click", actualizarMapa);
botonCSV.addEventListener("click", () => {
    descargarCSV(datosMapa, filtroMostrar, filtroEnfermedad, filtroAnyo);
});
if (botonCSVCompleto) {
    botonCSVCompleto.addEventListener("click", () => {
        descargarCSVCompleto(API);
    });
}
/*Inicia el mapa por defecto*/
async function iniciar() {
    await cargarEnfermedades();
    await cargarAnyos();
    actualizarLeyenda();
}
iniciar();