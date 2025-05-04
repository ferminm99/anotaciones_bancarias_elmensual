// backend/routes/clients.js
const express = require("express");
const router = express.Router();
const connection = require("../db");
const authenticateToken = require("../middleware/auth");

// Ruta para obtener todos los clientes
router.get("/", authenticateToken, (req, res) => {
  const query = "SELECT * FROM clientes";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).send("Error al obtener clientes");
      return;
    }
    res.json(results.rows); // PostgreSQL usa 'rows'
  });
});

router.get("/changes", authenticateToken, (req, res) => {
  const since = req.query.since;
  const q = `
    SELECT cliente_id, nombre, apellido, updated_at
    FROM clientes
    WHERE updated_at > $1
  `;
  connection.query(q, [since], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows || []);
  });
});

// Ruta para agregar un cliente
router.post("/", authenticateToken, (req, res) => {
  const { nombre, apellido } = req.body;
  const query =
    "INSERT INTO clientes (nombre, apellido) VALUES ($1, $2) RETURNING cliente_id, nombre, apellido, updated_at";
  connection.query(query, [nombre, apellido], (err, result) => {
    if (err) {
      console.error("Error al agregar cliente:", err);
      res.status(500).send("Error al agregar cliente");
      return;
    }
    res.json({
      cliente_id: result.rows[0].cliente_id, // PostgreSQL devuelve el resultado en 'rows'
      nombre,
      apellido,
    });
  });
});

// Ruta para actualizar un cliente
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nombre, apellido } = req.body;
  const query =
    "UPDATE clientes SET nombre = $1, apellido = $2 WHERE cliente_id = $3 RETURNING cliente_id, nombre, apellido, updated_at";
  connection.query(query, [nombre, apellido, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar cliente:", err);
      res.status(500).send("Error al actualizar cliente");
      return;
    }
    if (result.rowCount === 0) {
      res.status(404).send("Cliente no encontrado");
    } else {
      res.sendStatus(200);
    }
  });
});

// Ruta para eliminar un cliente
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const query =
    "DELETE FROM clientes WHERE cliente_id = $1 RETURNING cliente_id, updated_at";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar cliente:", err);
      res.status(500).send("Error al eliminar cliente");
      return;
    }
    res.sendStatus(200);
  });
});

module.exports = router;
