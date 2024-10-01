import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',  // Cambia la URL según tu backend
});
// Función para obtener transacciones desde el backend
export const getTransactions = () => {
  return axios.get('http://localhost:3001/transacciones');
};

// Función para agregar una nueva transacción
export const addTransaction = (data: any) => {
  return axios.post('http://localhost:3001/transacciones', data);
};

// Función para obtener todos los bancos
export const getBanks = () => {
  return axios.get('http://localhost:3001/bancos');
};