document.addEventListener("componentesCargados", function() {
    var botonMenu = document.getElementById("botonMenu");
    var menuLateral = document.getElementById("menuLateral");
    var flechaMenu = document.getElementById("flechaMenu");
    if (!botonMenu || !menuLateral) {
        return;
    }
    var paginas = document.querySelectorAll("#menuNavegacion .nav-link");
    var partesRuta = window.location.pathname.split("/");
    var rutaActual = partesRuta[partesRuta.length - 1];
    if (rutaActual === "") {
        rutaActual = "index.html";
    }
    for (var i = 0; i < paginas.length; i++) {
        var enlace = paginas[i];
        var href = enlace.getAttribute("href");
        if (href === rutaActual) {
            enlace.classList.add("active");
        }
    }
    function abrirMenu() {
        menuLateral.classList.add("abierto");
        if (flechaMenu) {
            flechaMenu.textContent = "›";
        }
        botonMenu.setAttribute("aria-label", "Cerrar menú");
    }
    function cerrarMenu() {
        menuLateral.classList.remove("abierto");
        if (flechaMenu) {
            flechaMenu.textContent = "‹";
        }
        botonMenu.setAttribute("aria-label", "Abrir menú");
    }
    botonMenu.addEventListener("click", function(event) {
        event.stopPropagation();
        if (menuLateral.classList.contains("abierto")) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });
    menuLateral.addEventListener("click", function(event) {
        event.stopPropagation();
    });
    document.addEventListener("click", function() {
        if (menuLateral.classList.contains("abierto")) {
            cerrarMenu();
        }
    });
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            cerrarMenu();
        }
    });
});