const express = require("express");
const router = express.Router();
const connection = require("../db");

// Ruta para obtener todos los bancos
router.get("/", (req, res) => {
  const query = "SELECT * FROM bancos";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener bancos:", err);
      res.status(500).send("Error al obtener bancos");
      return;
    }
    res.json(results.rows); // PostgreSQL usa 'rows'
  });
});

// Ruta para agregar un nuevo banco
router.post("/", (req, res) => {
  const { nombre } = req.body;
  const query = "INSERT INTO bancos (nombre) VALUES ($1) RETURNING banco_id";
  connection.query(query, [nombre], (err, result) => {
    if (err) {
      console.error("Error al agregar banco:", err);
      res.status(500).send("Error al agregar banco");
      return;
    }
    res.json({
      message: "Banco agregado con éxito",
      id: result.rows[0].banco_id,
    });
  });
});

module.exports = router;
