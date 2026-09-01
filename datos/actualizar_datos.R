library(dplyr)
library(stringi)
library(stringr)
library(readr)

#Leer csv
datos <- read.csv2(
  "DatosEnfermedades.csv",
  check.names = FALSE,
  stringsAsFactors = FALSE,
  fileEncoding = "Latin1"
)
#Convierte año en un número
datos_original <- datos
datos$Año <- as.numeric(datos$Año)

#Normalizar para que coincidan los nombres de las comunidades con el ine
normalizar <- function(x){

  x <- as.character(x)
  x <- stringi::stri_trans_general(x, "Latin-ASCII")
  x <- tolower(x)
  x <- trimws(x)
  x <- gsub("\\s+", " ", x)

  x
}
datos$Comunidad_join <- normalizar(datos$Comunidad)

datos$Comunidad_join[datos$Comunidad_join=="baleares"] <- "illes balears"
datos$Comunidad_join[datos$Comunidad_join=="c. valenciana"] <- "comunitat valenciana"
datos$Comunidad_join[datos$Comunidad_join=="madrid"] <- "comunidad de madrid"
datos$Comunidad_join[datos$Comunidad_join=="murcia"] <- "region de murcia"
datos$Comunidad_join[datos$Comunidad_join=="navarra"] <- "comunidad foral de navarra"
datos$Comunidad_join[datos$Comunidad_join=="espana"] <- "total nacional"

#Descargar tabla de patron ine 67988
padron_raw <- read_delim("https://www.ine.es/jaxiT3/files/t/csv_bdsc/67988.csv",delim=";",show_col_types = FALSE)
padron <- padron_raw %>%
  filter(is.na(Provincias),Sexo=="Total") %>%
  mutate(
    Comunidad = ifelse(
      is.na(`Comunidades y Ciudades Autónomas`),
      `Total Nacional`,
      `Comunidades y Ciudades Autónomas`
    ),
    #Quitar código "01 ", "02 ", etc.
    Comunidad = sub("^[0-9]+\\s+", "", Comunidad),
    Comunidad_join = normalizar(Comunidad),
    Comunidad_join = recode(
      Comunidad_join,
      "asturias, principado de"="asturias",
      "balears, illes"="illes balears",
      "castilla - la mancha"="castilla-la mancha",
      "comunitat valenciana"="comunitat valenciana",
      "madrid, comunidad de"="comunidad de madrid",
      "murcia, region de"="region de murcia",
      "navarra, comunidad foral de"="comunidad foral de navarra",
      "rioja, la"="la rioja",
      "total nacional"="total nacional"
    ),
    Año = as.numeric(Periodo),
    #Quitar puntos de miles
    Poblacion = as.numeric(gsub("\\.", "", Total))
  ) %>%
  select(Comunidad_join,Año,Poblacion)
#Unión
resultado <- left_join(
  datos,
  padron,
  by=c("Comunidad_join","Año")
)
#Validar que todas las filas tengan población
if(any(is.na(resultado$Poblacion))){

  faltan <- resultado %>%
    filter(is.na(Poblacion)) %>%
    select(Comunidad, Año) %>%
    distinct()

  cat(
    "\nFilas sin población:",
    nrow(faltan),
    "\n"
  )

  if(nrow(faltan) > 0){
    print(faltan)
  }

}
#Comprobar duplicados
duplicados <- resultado %>%
  count(
    Enfermedad,
    Año,
    Comunidad,
    `Rango edad`
  ) %>%
  filter(n > 1)

if(nrow(duplicados) > 0){
  stop("ERROR: existen registros duplicados.")
}else{
  cat("Duplicados: ninguno\n")
}
#Comprobar si no tienen población
faltan <- resultado %>%
  filter(is.na(Poblacion)) %>%
  select(Comunidad, Año) %>%
  distinct()

cat("\nFilas sin población:", nrow(faltan), "\n")

if(nrow(faltan)>0){
  print(faltan)
}
#Cálculo tasa notificación
resultado$`Tasa notificacion` <- ifelse(
  is.na(resultado$Poblacion),
  resultado$`Tasa notificacion`,
  round(resultado$Casos /resultado$Poblacion * 100000,3)
)
#Limpiamos pasos intermedios
resultado$Poblacion <- NULL
resultado$Comunidad_join <- NULL
resultado$Comunidad <- datos_original$Comunidad
resultado[is.na(resultado)] <- ""

#Se crea un nuevo csv con los cambios
write.csv(
  resultado,
  "DatosEnfermedades_actualizado.csv",
  row.names = FALSE,
  fileEncoding = "UTF-8",
  na = ""
)
cat("\nArchivo actualizado correctamente.\n")