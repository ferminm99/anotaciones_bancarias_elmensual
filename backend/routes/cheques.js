const express = require("express");
const router = express.Router();
const connection = require("../db"); // Asumo que este archivo ya contiene la conexión a PostgreSQL
const authenticateToken = require("../middleware/auth");

// Ruta para obtener todos los cheques
router.get("/", authenticateToken, (req, res) => {
  const query = "SELECT * FROM cheques";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener cheques:", err);
      res.status(500).send("Error al obtener cheques");
      return;
    }
    res.json(result.rows); // PostgreSQL usa 'rows' para devolver los resultados
  });
});

router.get("/changes", authenticateToken, (req, res) => {
  const since = req.query.since;
  const q = `
    SELECT cheque_id, numero, updated_at
    FROM cheques
    WHERE updated_at > $1 
  `;
  connection.query(q, [since], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows || []);
  });
});

// Ruta para agregar un nuevo cheque
router.post("/", authenticateToken, (req, res) => {
  const { numero } = req.body;
  if (!numero) {
    res.status(400).send("Número de cheque es requerido");
    return;
  }

  const query =
    "INSERT INTO cheques (numero) VALUES ($1) RETURNING cheque_id, updated_at";
  connection.query(query, [numero], (err, result) => {
    if (err) {
      console.error("Error al agregar cheque:", err);
      res.status(500).send("Error al agregar cheque");
      return;
    }
    res.json({
      message: "Cheque agregado con éxito",
      cheque_id: result.rows[0].cheque_id, // Devolvemos cheque_id para referencia
    });
  });
});

module.exports = router;
