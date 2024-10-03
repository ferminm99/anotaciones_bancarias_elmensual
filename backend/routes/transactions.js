<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const connection = require("../db");

// Ruta para obtener todas las transacciones
router.get("/", (req, res) => {
  const query = `
=======
const express = require('express');
const router = express.Router();
const connection = require('../db');

// Ruta para obtener todas las transacciones
router.get('/', (req, res) => {
    const query = `
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
      SELECT transacciones.transaccion_id AS transaccion_id, transacciones.fecha, transacciones.tipo, transacciones.monto, 
             transacciones.tipo_impuesto, cheques.numero AS numero_cheque, bancos.nombre AS nombre_banco, clientes.nombre AS nombre_cliente
      FROM transacciones
      JOIN bancos ON transacciones.banco_id = bancos.banco_id
      LEFT JOIN clientes ON transacciones.cliente_id = clientes.cliente_id
      LEFT JOIN cheques ON transacciones.cheque_id = cheques.cheque_id 
    `;

<<<<<<< HEAD
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results); // Enviar los datos al frontend
  });
});

// Ruta para agregar una nueva transacción
router.post("/", (req, res) => {
  const { fecha, cliente, tipo, monto, banco_id } = req.body;
  // Convertimos la fecha a un objeto Date
  const formattedFecha = new Date(fecha);
  // Verificar si el cliente existe
  const queryCliente = "SELECT cliente_id FROM clientes WHERE nombre = ?";

  connection.query(queryCliente, [cliente], (err, result) => {
    if (err) throw err;

    let cliente_id;

    if (result.length > 0) {
      // Si el cliente ya existe, usar su cliente_id
      cliente_id = result[0].cliente_id;
      insertarTransaccion(cliente_id);
    } else {
      // Si el cliente no existe, lo insertamos y luego obtenemos su cliente_id
      const insertCliente = "INSERT INTO clientes (nombre) VALUES (?)";
      connection.query(insertCliente, [cliente], (err, result) => {
        if (err) throw err;

        cliente_id = result.insertId;
        insertarTransaccion(cliente_id);
      });
    }

    // Función para insertar la transacción
    function insertarTransaccion(cliente_id) {
      const query =
        "INSERT INTO transacciones (formattedFecha, cliente_id, tipo, monto, banco_id) VALUES (?, ?, ?, ?, ?)";

      connection.query(
        query,
        [fecha, cliente_id, tipo, monto, banco_id],
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
=======
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);  // Enviar los datos al frontend
    });
});




// Ruta para agregar una nueva transacción
router.post('/', (req, res) => {
    const { fecha, cliente, tipo, monto, banco_id } = req.body;
    const query = 'INSERT INTO transacciones (fecha, cliente, tipo, monto, banco_id) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [fecha, cliente, tipo, monto, banco_id], (err, results) => {
        if (err) throw err;
        res.json({ message: 'Transacción agregada con éxito', id: results.insertId });
    });
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
});

module.exports = router;
