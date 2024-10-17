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

// Configuración de CORS
const corsOptions = {
  origin: "https://anotaciones-bancarias-elmensual.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Rutas
app.use("/transacciones", transactionsRoutes);
app.use("/bancos", banksRoutes);
app.use("/clientes", clientsRouter);

// Aquí puedes agregar un log para confirmar que las rutas se han registrado
console.log("Rutas registradas: /transacciones, /bancos, /clientes");

// Ruta de prueba para asegurar que el servidor funciona
app.get("/test", (req, res) => {
  res.send("¡Test exitoso!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
