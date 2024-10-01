const express = require('express');
const router = express.Router();
const connection = require('../db');

// Ruta para obtener todas las transacciones
router.get('/', (req, res) => {
    const query = `
      SELECT transacciones.transaccion_id AS transaccion_id, transacciones.fecha, transacciones.tipo, transacciones.monto, 
             transacciones.tipo_impuesto, cheques.numero AS numero_cheque, bancos.nombre AS nombre_banco, clientes.nombre AS nombre_cliente
      FROM transacciones
      JOIN bancos ON transacciones.banco_id = bancos.banco_id
      LEFT JOIN clientes ON transacciones.cliente_id = clientes.cliente_id
      LEFT JOIN cheques ON transacciones.cheque_id = cheques.cheque_id 
    `;

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
});

module.exports = router;
