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

// Ruta para agregar un cliente
router.post("/", (req, res) => {
  const { nombre, apellido } = req.body;
  const query = "INSERT INTO clientes (nombre, apellido) VALUES (?, ?)";
  connection.query(query, [nombre, apellido], (err, result) => {
    if (err) {
      res.status(500).send("Error al agregar cliente");
      return;
    }
    res.json({
      cliente_id: result.insertId,
      nombre,
      apellido,
    });
  });
});

// Ruta para actualizar un cliente
router.put("/:id", (req, res) => {
  console.log(req.body);
  console.log(req.params);
  const { id } = req.params;
  const { nombre, apellido } = req.body;
  const query =
    "UPDATE clientes SET nombre = ?, apellido = ? WHERE cliente_id = ?";
  connection.query(query, [nombre, apellido, id], (err, result) => {
    if (err) {
      res.status(500).send("Error al actualizar cliente");
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send("Cliente no encontrado");
    } else {
      res.sendStatus(200);
    }
  });
});

// Ruta para eliminar un cliente
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM clientes WHERE cliente_id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send("Error al eliminar cliente");
      return;
    }
    res.sendStatus(200);
  });
});

module.exports = router;
