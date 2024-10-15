import axios from "axios";

// Configura Axios con la baseURL
const api = axios.create({
  baseURL: "http://localhost:3001", // Solo la baseURL, sin especificar la ruta completa
});

// Función para obtener transacciones desde el backend
export const getTransactions = () => {
  return api.get("/transacciones"); // Usa la baseURL y agrega la ruta relativa
};

// Función para agregar una nueva transacción
export const addTransaction = (data: any) => {
  return api.post("/transacciones", data); // Usa la baseURL y agrega la ruta relativa
};

// Función para actualizar una transacción existente
export const updateTransaction = (id: number, data: any) => {
  return api.put(`/transacciones/${id}`, data); // Usa la baseURL y agrega la ruta relativa con el ID
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

export const addCliente = (data: { nombre: string; apellido: string }) => {
  return api.post("/clientes", data); // Usa la baseURL y agrega la ruta relativa
};

export const deleteCliente = (id: number) => {
  return api.delete(`/clientes/${id}`); // Usa la baseURL y agrega la ruta relativa
};
