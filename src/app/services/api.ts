<<<<<<< HEAD
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Cambia la URL según tu backend
});
// Función para obtener transacciones desde el backend
export const getTransactions = () => {
  return axios.get("http://localhost:3001/transacciones");
=======
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',  // Cambia la URL según tu backend
});
// Función para obtener transacciones desde el backend
export const getTransactions = () => {
  return axios.get('http://localhost:3001/transacciones');
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
};

// Función para agregar una nueva transacción
export const addTransaction = (data: any) => {
<<<<<<< HEAD
  return axios.post("http://localhost:3001/transacciones", data);
=======
  return axios.post('http://localhost:3001/transacciones', data);
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
};

// Función para obtener todos los bancos
export const getBanks = () => {
<<<<<<< HEAD
  return axios.get("http://localhost:3001/bancos");
};

export const getClientes = () => {
  return axios.get("http://localhost:3001/clientes"); // Cambia la URL si es necesario
};
=======
  return axios.get('http://localhost:3001/bancos');
};
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
