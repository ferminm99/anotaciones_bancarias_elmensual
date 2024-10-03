const express = require('express');
const router = express.Router();
const connection = require('../db');

// Ruta para obtener todos los bancos
router.get('/', (req, res) => {
    const query = 'SELECT * FROM cheques';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para agregar un nuevo banco (opcional)
router.post('/', (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO cheques (numero) VALUES (?)';
    connection.query(query, [nombre], (err, results) => {
        if (err) throw err;
        res.json({ message: 'Cheque agregado con éxito', id: results.insertId });
    });
});

module.exports = router;
