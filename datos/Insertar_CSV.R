library(DBI)
library(RMariaDB)

con <- dbConnect(
  RMariaDB::MariaDB(),
  dbname="enfermedades_emergentes",
  host="localhost",
  user="root",
  password=""
)
dbExecute(con, "TRUNCATE TABLE enfermedades;")

# Insertamos los datos nuevos manteniendo la estructura existente
dbWriteTable(
  con,
  "enfermedades",
  resultado,
  append = TRUE,
  row.names = FALSE
)
dbDisconnect(con)