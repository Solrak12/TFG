async function cargarComponente(id, archivo){
    const respuesta = await fetch(archivo);
    const html = await respuesta.text();
    document.getElementById(id).innerHTML = html;
}

window.addEventListener("DOMContentLoaded", async () => {
    await cargarComponente("header","componentes/header.html");
    await cargarComponente("menu","componentes/menu.html");
    await cargarComponente("footer","componentes/footer.html");
    document.dispatchEvent(new Event("componentesCargados"));
});