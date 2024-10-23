const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false, // SSL solo en producción
});

pool.connect((err) => {
  if (err) {
    console.error("Error conectándose a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos PostgreSQL");
});

module.exports = pool;
