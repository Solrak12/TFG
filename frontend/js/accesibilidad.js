function aplicarTamanyo() {
    var tamanyo = localStorage.getItem("ui-tamanyo");
    if (!tamanyo) {
        tamanyo = "normal";
    }
    document.documentElement.classList.remove("ui-grande", "ui-muy-grande");
    if (tamanyo === "grande") {
        document.documentElement.classList.add("ui-grande");
    } else if (tamanyo === "muy-grande") {
        document.documentElement.classList.add("ui-muy-grande");
    }
}
function aplicarColor() {
    var color = localStorage.getItem("ui-color");
    if (!color) {
        color = "normal";
    }
    var elementosEstilo = document.querySelectorAll(".estilo-pagina, .estilo-mapa, .estilo-menu, .estilo-contacto");
    for (var i = 0; i < elementosEstilo.length; i++) {
        var estilo = elementosEstilo[i];
        if (color === "grises") {
            estilo.href = estilo.dataset.grises;
        } else {
            estilo.href = estilo.dataset.normal;
        }
    }
}
document.addEventListener("componentesCargados", function() {
    aplicarTamanyo();
    aplicarColor();
    var selectorTamanyo = document.getElementById("tamanyoTexto");
    var selectorColor = document.getElementById("modoColor");
    if (selectorTamanyo) {
        var guardadoTamanyo = localStorage.getItem("ui-tamanyo");
        selectorTamanyo.value = guardadoTamanyo ? guardadoTamanyo : "normal";
        selectorTamanyo.addEventListener("change", function() {
            localStorage.setItem("ui-tamanyo", selectorTamanyo.value);
            aplicarTamanyo();
        });
    }
    if (selectorColor) {
        var guardadoColor = localStorage.getItem("ui-color");
        selectorColor.value = guardadoColor ? guardadoColor : "normal";
        selectorColor.addEventListener("change", function() {
            localStorage.setItem("ui-color", selectorColor.value);
            aplicarColor();
        });
    }
});