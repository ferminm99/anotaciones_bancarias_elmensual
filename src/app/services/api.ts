import axios from "axios";
import { Transaction, CreateTransaction, Bank } from "../types";

// Configura Axios con la baseURL
// const api = axios.create({
//   baseURL: "http://localhost:3001", // Solo la baseURL, sin especificar la ruta completa
// });

// Configura Axios con la baseURL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Solo la baseURL, sin especificar la ruta completa
});

console.log("Usando API URL:", process.env.NEXT_PUBLIC_API_URL);

// Función para obtener transacciones desde el backend
export const getTransactions = () => {
  return api.get("/transacciones"); // Usa la baseURL y agrega la ruta relativa
};

// Función para agregar una nueva transacción
export const addTransaction = (data: CreateTransaction) => {
  return api.post("/transacciones", data); // Usa la baseURL y agrega la ruta relativa
};

// Función para actualizar una transacción existente
export const updateTransaction = (id: number, data: Transaction) => {
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

// Función para agregar un nuevo banco
export const addBank = (data: { nombre: string; saldo_total: number }) => {
  return api.post("/bancos", data); // Usa la baseURL y agrega la ruta relativa
};

// Función para actualizar un banco existente
export const updateBank = (banco_id: number, data: Bank) => {
  return api.put(`/bancos/${banco_id}`, data); // Usa la baseURL y agrega la ruta relativa con el ID
};

// Función para eliminar un banco
export const deleteBank = (id: number) => {
  return api.delete(`/bancos/${id}`); // Usa la baseURL y agrega la ruta relativa
};

// Función para obtener todos los clientes
export const getClientes = () => {
  return api.get("/clientes"); // Usa la baseURL y agrega la ruta relativa
};

export const updateCliente = (
  cliente_id: number,
  data: { nombre: string; apellido: string }
) => {
  return api.put(`/clientes/${cliente_id}`, data); // Usa la baseURL y agrega la ruta relativa
};

export const addCliente = (data: { nombre: string; apellido: string }) => {
  return api.post("/clientes", data); // Usa la baseURL y agrega la ruta relativa
};

export const deleteCliente = (id: number) => {
  return api.delete(`/clientes/${id}`); // Usa la baseURL y agrega la ruta relativa
};

// Funciones para cheques
export const getCheques = () => {
  return api.get("/cheques"); // Usa la baseURL y agrega la ruta relativa
};
