export function descargarCSV(datosMapa, filtroMostrar, filtroEnfermedad, filtroAnyo) {
    if (!datosMapa || (Array.isArray(datosMapa) && datosMapa.length === 0)) {
        alert("No hay datos para descargar.");
        return;
    }
    const mostrar = filtroMostrar.value;
    const enfermedad = filtroEnfermedad.value;
    const anyo = filtroAnyo.value;
    let csv = "";
    /*Mira que mostrar es y va fila por fila añadiendolo al csv*/
    if (mostrar === "casos" && Array.isArray(datosMapa)) {
        csv = "Enfermedad,Anyo,Comunidad,Casos,Tasa de notificacion\n";
        datosMapa.forEach(registro => {
            const enf = String(registro.enfermedad || "").replace(/"/g, '""');
            const com = String(registro.comunidad || "").replace(/"/g, '""');
            csv += `"${enf}",${registro.anyo || anyo},"${com}",${registro.casos || 0},${registro.tasa_notificacion || 0}\n`;
        });
    } else if (mostrar === "genero") {
        csv = "Enfermedad,Anyo,Hombres,Mujeres,Predominante\n";
        const hombres = Number(datosMapa.hombres) || 0;
        const mujeres = Number(datosMapa.mujeres) || 0;
        const predominante = hombres >= mujeres ? "Hombres" : "Mujeres";
        const enf = String(enfermedad).replace(/"/g, '""');
        csv += `"${enf}",${anyo},${hombres},${mujeres},"${predominante}"\n`;
    } else if (mostrar === "edad" && Array.isArray(datosMapa)) {
        csv = "Enfermedad,Anyo,Rango de edad,Casos\n";
        datosMapa.forEach(registro => {
            const enf = String(enfermedad).replace(/"/g, '""');
            const rango = String(registro.rango_edad || "").replace(/"/g, '""');
            csv += `"${enf}",${anyo},"${rango}",${registro.casos || 0}\n`;
        });
    }
    const contenidoCSV = "\uFEFF" + csv;
    const blob = new Blob([contenidoCSV], {
        type: "text/csv;charset=utf-8;"
    });
    /*Para descargar el csv en el navegador*/
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `${enfermedad}_${anyo}_${mostrar}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
}
export async function descargarCSVCompleto(API) {
    try {
        const respuesta = await fetch(`${API}/obtener_todo`);
        if (!respuesta.ok) throw new Error("Error al obtener datos.");
        const datos = await respuesta.json();
        if (!datos || datos.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
        let csv = "Enfermedad,Año,Comunidad,Casos,Tasa notificacion,Hombres,Mujeres,Rango edad,Casos edad\n";
        datos.forEach(item => {
            const enfermedad = item.enfermedad ?? "";
            const anyo = item.anyo ?? "";
            const comunidad = item.comunidad ?? "";
            const casos = item.casos ?? "";
            const tasa = item.tasa_notificacion ?? "";
            const hombres = item.hombres ?? "";
            const mujeres = item.mujeres ?? "";
            const rangoEdad = item.rango_edad ?? "";
            const casosEdad = item.casos_edad ?? "";
            csv += `${enfermedad},${anyo},${comunidad},${casos},${tasa},${hombres},${mujeres},${rangoEdad},${casosEdad}\n`;
        });
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "Datos_completos.csv";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al descargar el CSV:", error);
        alert("Ocurrió un error al descargar el archivo CSV.");
    }
}