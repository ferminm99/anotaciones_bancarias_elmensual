const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false, // SSL solo en producción
});

pool.connect((err) => {
  if (err) {
    console.error("Error al conectar a PostgreSQL:", err);
  } else {
    console.log("Conectado a PostgreSQL");
    // Aquí defines las rutas
    app.listen(process.env.APP_PORT, () => {
      console.log(`Servidor corriendo en el puerto ${process.env.APP_PORT}`);
    });
  }
});

module.exports = pool;
