const express = require('express');
const router = express.Router();
const connection = require('../db');

// Ruta para obtener todos los bancos
router.get('/', (req, res) => {
    const query = 'SELECT * FROM bancos';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para agregar un nuevo banco (opcional)
router.post('/', (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO bancos (nombre) VALUES (?)';
    connection.query(query, [nombre], (err, results) => {
        if (err) throw err;
        res.json({ message: 'Banco agregado con éxito', id: results.insertId });
    });
});

module.exports = router;
