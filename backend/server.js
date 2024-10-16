// const express = require("express");
// const cors = require("cors");
// const transactionsRoutes = require("./routes/transactions");
// const banksRoutes = require("./routes/banks");
// const clientsRouter = require("./routes/clients");

// const app = express();
// app.use(express.json()); // Para poder manejar JSON en las peticiones
// app.use(cors()); // Habilitar CORS para permitir solicitudes desde el frontend

// // Rutas
// app.use("/transacciones", transactionsRoutes); // Rutas para transacciones
// app.use("/bancos", banksRoutes); // Rutas para bancos
// app.use("/clientes", clientsRouter);
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Algo salió mal");
// });

// // Iniciar el servidor
// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en el puerto ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const transactionsRoutes = require("./routes/transactions");
const banksRoutes = require("./routes/banks");
const clientsRouter = require("./routes/clients");

const app = express();
app.use(express.json()); // Para manejar JSON en las peticiones

// Configuración de CORS para permitir solicitudes desde tu frontend en Vercel
const corsOptions = {
  origin: "https://anotaciones-bancarias-elmensual.vercel.app", // Reemplaza con tu dominio de Vercel
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Métodos HTTP permitidos
  credentials: true, // Para permitir el uso de cookies, si es necesario
  allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions)); // Habilitar CORS con las opciones especificadas

// Rutas
app.use("/transacciones", transactionsRoutes); // Rutas para transacciones
app.use("/bancos", banksRoutes); // Rutas para bancos
app.use("/clientes", clientsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal");
});

// Iniciar el servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
