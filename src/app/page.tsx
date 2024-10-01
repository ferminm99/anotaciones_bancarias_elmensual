"use client";  // Esto indica que este componente es un Client Component

import { useEffect, useState } from 'react';
import { getTransactions, addTransaction, getBanks } from './services/api';  // Importamos solo una vez desde 'services/api'
import TransactionTable from './components/TransactionTable';
import FilterByBank from './components/FilterByBank';
import AddTransactionButton from './components/TransactionButton'; // Componente para el botón de agregar transacción
import { Transaction, Bank } from './types';  // Importamos las interfaces desde 'types.ts'

const Home: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);  // Array de transacciones tipado
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);  // Array para las transacciones filtradas
  const [banks, setBanks] = useState<Bank[]>([]);  // Array de bancos obtenidos del backend
  const [totalSaldo, setTotalSaldo] = useState<number>(0);  // Estado para el saldo total
  const [selectedBank, setSelectedBank] = useState<string>('');  // Estado para el banco seleccionado

  // Al cargar la página, hacemos una petición para obtener las transacciones y bancos
  useEffect(() => {
    // Obtener transacciones
    getTransactions().then(response => {
      setTransactions(response.data);  // Guardamos las transacciones en el estado
      setFilteredTransactions(response.data);  // Inicializamos las transacciones filtradas
    }).catch(error => console.error('Error al obtener las transacciones:', error));

    // Obtener bancos
    getBanks().then(response => {
      const bancos = response.data;
      setBanks(bancos);  // Guardamos los bancos

      // Convertimos los saldos a números y sumamos
      const saldoTotal = bancos.reduce((acc: number, bank: Bank) => acc + parseFloat(bank.saldo_total), 0);
      setTotalSaldo(saldoTotal);  // Guardamos el saldo total
    }).catch(error => console.error('Error al obtener los bancos:', error));
  }, []);



  // Función para agregar una nueva transacción
  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    addTransaction(data).then(response => {
      setTransactions([...transactions, { ...data, id: response.data.id }]);  // Añade la nueva transacción con el id retornado
    }).catch(error => console.error('Error al agregar la transacción:', error));
  };

  // Función para filtrar las transacciones por banco
  const filterByBank = (banco: string) => {
    setSelectedBank(banco);  // Actualizamos el banco seleccionado
    if (banco === '') {
      setFilteredTransactions(transactions);  // Mostrar todas las transacciones si no se selecciona un banco
    } else {
      const filtered = transactions.filter(transaction => transaction.nombre_banco === banco);  // Filtrar por el nombre del banco
      setFilteredTransactions(filtered);
    }
  };

  return (
    <div>
      <h1>Transacciones</h1>
      {/* Filtro por banco */}
      <FilterByBank banks={banks} onFilter={filterByBank} totalSaldo={totalSaldo} />  {/* Pasamos la lista de bancos con el saldo y el saldo total */}

      {/* Tabla de transacciones */}
      <TransactionTable transactions={filteredTransactions.length ? filteredTransactions : transactions} />

      {/* Botón para abrir el modal de agregar transacción */}
      <AddTransactionButton onSubmit={handleAddTransaction} banks={banks.map(bank => bank.nombre)} />
    </div>
  );
};

export default Home;
