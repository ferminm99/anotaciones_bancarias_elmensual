import axios from "axios";

// Configura Axios con la baseURL
const api = axios.create({
  baseURL: "http://localhost:5000", // Solo la baseURL, sin especificar la ruta completa
});

// Función para obtener transacciones desde el backend
export const getTransactions = () => {
  return api.get("/transacciones"); // Usa la baseURL y agrega la ruta relativa
};

// Función para agregar una nueva transacción
export const addTransaction = (data: any) => {
  return api.post("/transacciones", data); // Usa la baseURL y agrega la ruta relativa
};

// Función para eliminar una transacción
export const deleteTransaction = (id: number) => {
  return api.delete(`/transacciones/${id}`);
};

// Función para obtener todos los bancos
export const getBanks = () => {
  return api.get("/bancos"); // Usa la baseURL y agrega la ruta relativa
};

export const getClientes = () => {
  return api.get("/clientes"); // Usa la baseURL y agrega la ruta relativa
};
