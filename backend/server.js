const express = require("express");
const cors = require("cors");
const transactionsRoutes = require("./routes/transactions");
const banksRoutes = require("./routes/banks");
const clientsRouter = require("./routes/clients");

const app = express();
app.use(express.json()); // Para poder manejar JSON en las peticiones
app.use(cors()); // Habilitar CORS para permitir solicitudes desde el frontend

// Rutas
app.use("/transacciones", transactionsRoutes); // Rutas para transacciones
app.use("/bancos", banksRoutes); // Rutas para bancos
app.use("/clientes", clientsRouter);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal");
});

// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
