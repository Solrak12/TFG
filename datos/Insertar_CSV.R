library(DBI)
library(RMariaDB)

con <- dbConnect(
  RMariaDB::MariaDB(),
  dbname="enfermedades_emergentes",
  host="localhost",
  user="root",
  password=""
)

dbWriteTable(
  con,
  "enfermedades",
  resultado,
  overwrite=TRUE
)

dbDisconnect(con)