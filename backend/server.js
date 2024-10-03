<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const transactionsRoutes = require("./routes/transactions");
const banksRoutes = require("./routes/banks");
const chequesRoutes = require("./routes/banks");
const clientsRouter = require("./routes/clients");

const app = express();
app.use(express.json()); // Para poder manejar JSON en las peticiones
app.use(cors()); // Habilitar CORS para permitir solicitudes desde el frontend

// Rutas
app.use("/transacciones", transactionsRoutes); // Rutas para transacciones
app.use("/bancos", banksRoutes); // Rutas para bancos
app.use("/cheques", chequesRoutes); // Rutas para bancos
app.use("/clientes", clientsRouter);
=======
const express = require('express');
const cors = require('cors');
const transactionsRoutes = require('./routes/transactions');
const banksRoutes = require('./routes/banks');
const chequesRoutes = require('./routes/banks');

const app = express();
app.use(express.json());  // Para poder manejar JSON en las peticiones
app.use(cors());  // Habilitar CORS para permitir solicitudes desde el frontend

// Rutas
app.use('/transacciones', transactionsRoutes);  // Rutas para transacciones
app.use('/bancos', banksRoutes);  // Rutas para bancos
app.use('/cheques', chequesRoutes);  // Rutas para bancos
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045

// Iniciar el servidor
const PORT = 3001;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Servidor corriendo en el puerto ${PORT}`);
=======
    console.log(`Servidor corriendo en el puerto ${PORT}`);
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
});
