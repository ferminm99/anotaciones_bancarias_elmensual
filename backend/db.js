// const mysql = require("mysql2");

// // Configuración de la conexión a la base de datos
// const connection = mysql.createConnection({
//   port: process.env.DB_PORT || 3306, // Aquí se debe usar el puerto 3306
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USERNAME || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_DATABASE || "elmensual_transacciones",
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error conectándose a la base de datos:", err);
//     return;
//   }
//   console.log("Conectado a la base de datos MySQL");
// });

// module.exports = connection;

const { Pool } = require("pg");

// Asegúrate de que estás utilizando process.env.DATABASE_URL
const connectionString = process.env.DATABASE_URL;
// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: connectionString, // Usa la URL que guardaste en el .env
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err) => {
  if (err) {
    console.error("Error conectándose a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos PostgreSQL");
});

module.exports = pool;
