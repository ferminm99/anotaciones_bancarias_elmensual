// backend/routes/clients.js

const express = require("express");
const router = express.Router();
const connection = require("../db");

// Ruta para obtener todos los clientes
router.get("/", (req, res) => {
  const query = "SELECT * FROM clientes";
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;
