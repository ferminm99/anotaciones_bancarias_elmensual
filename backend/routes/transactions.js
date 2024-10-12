const express = require("express");
const router = express.Router();
const connection = require("../db");

// Ruta para obtener todas las transacciones
router.get("/", (req, res) => {
  const query = `
      SELECT transacciones.transaccion_id AS transaccion_id, transacciones.fecha, transacciones.tipo, transacciones.monto, 
             bancos.nombre AS nombre_banco, clientes.nombre AS nombre_cliente, clientes.apellido AS apellido_cliente
      FROM transacciones
      JOIN bancos ON transacciones.banco_id = bancos.banco_id
      LEFT JOIN clientes ON transacciones.cliente_id = clientes.cliente_id
    `;

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results); // Enviar los datos al frontend
  });
});

// Ruta para agregar una nueva transacción
router.post("/", (req, res) => {
  const { fecha, cliente, tipo, monto, banco_id } = req.body;

  const formattedFecha = new Date(fecha);

  // Verificar si el cliente existe
  const queryCliente = "SELECT cliente_id FROM clientes WHERE nombre = ?";

  connection.query(queryCliente, [cliente], (err, result) => {
    if (err) throw err;

    let cliente_id;

    if (result.length > 0) {
      cliente_id = result[0].cliente_id;
      insertarTransaccion(cliente_id);
    } else {
      const insertCliente = "INSERT INTO clientes (nombre) VALUES (?)";
      connection.query(insertCliente, [cliente], (err, result) => {
        if (err) throw err;
        cliente_id = result.insertId;
        insertarTransaccion(cliente_id);
      });
    }

    function insertarTransaccion(cliente_id) {
      // Finalizamos la transacción sin cheques ni impuestos
      const query =
        "INSERT INTO transacciones (fecha, cliente_id, tipo, monto, banco_id) VALUES (?, ?, ?, ?, ?)";

      connection.query(
        query,
        [formattedFecha, cliente_id, tipo, monto, banco_id],
        (err, result) => {
          if (err) throw err;
          res.json({
            message: "Transacción agregada con éxito",
            id: result.insertId,
          });
        }
      );
    }
  });
});

// Ruta para eliminar una transacción
router.delete("/:id", (req, res) => {
  const { id } = req.params; // Extraer el ID correctamente

  // Consulta SQL para eliminar la transacción
  const query = "DELETE FROM transacciones WHERE transaccion_id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar la transacción:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar la transacción" });
    }

    if (result.affectedRows > 0) {
      console.log("Transacción eliminada con éxito:", id); // Log si se elimina correctamente
      res.json({ message: "Transacción eliminada con éxito" });
    } else {
      console.log("Transacción no encontrada:", id); // Log si no se encuentra
      res.status(404).json({ message: "Transacción no encontrada" });
    }
  });
});

module.exports = router;
