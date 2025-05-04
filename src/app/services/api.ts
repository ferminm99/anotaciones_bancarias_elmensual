import axios from "axios";
import {
  Transaction,
  CreateTransaction,
  Bank,
  Cheque,
  Cliente,
} from "../types";

// //Configura Axios con la baseURL
// const api = axios.create({
//   baseURL: "http://localhost:3001", // Solo la baseURL, sin especificar la ruta completa
// });

//Configura Axios con la baseURL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", // Solo la baseURL, sin especificar la ruta completa
});

console.log("Usando API URL:", process.env.NEXT_PUBLIC_API_URL);

// Función para obtener transacciones desde el backend
export const getTransactions = () => api.get<Transaction[]>("/transacciones");
export const getTransactionsChanges = (since: string) =>
  api.get<Transaction[]>("/transacciones/changes", { params: { since } });

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
export const getBanks = () => api.get<Bank[]>("/bancos");
export const getBanksChanges = (since: string) =>
  api.get<Bank[]>("/bancos/changes", { params: { since } });

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
export const getClientes = () => api.get<Cliente[]>("/clientes");
export const getClientesChanges = (since: string) =>
  api.get<Cliente[]>("/clientes/changes", { params: { since } });

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
export const getCheques = () => api.get<Cheque[]>("/cheques");
export const getChequesChanges = (since: string) =>
  api.get<Cheque[]>("/cheques/changes", { params: { since } });

//autenticacion
export const login = async (
  username: string,
  password: string
): Promise<string> => {
  try {
    const response = await api.post("/auth/login", { username, password });
    console.log("Response from backend:", response.data); // Verifica la respuesta del backend
    return response.data.token; // Asegúrate de que `token` exista en la respuesta del backend
  } catch (error) {
    console.error("Error en la autenticación:", error);
    throw new Error("Error en la autenticación");
  }
};

// …
// Interceptor para proteger solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Único interceptor.response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Ignoramos cualquier 401/403 que venga de los endpoints de login/validate-token
    if (
      (status === 401 || status === 403) &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/validate-token")
    ) {
      console.warn("Token inválido o expirado, redirigiendo a login…");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Valida si el token sigue siendo válido
export const validateToken = async (): Promise<boolean> => {
  try {
    await api.get("/auth/validate-token"); // Endpoint que solo verifica el token
    return true; // El token es válido
  } catch {
    return false; // El token no es válido
  }
};

export default api;
