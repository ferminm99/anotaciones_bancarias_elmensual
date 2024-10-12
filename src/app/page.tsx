"use client"; // Asegura que este archivo sea un Client Component

import { useEffect, useState } from "react";
import {
  getTransactions,
  deleteTransaction,
  addTransaction,
  getBanks,
} from "./services/api";
import TransactionTable from "./components/TransactionTable";
import FilterByBank from "./components/FilterByBank";
import AddTransactionButton from "./components/TransactionButton";
import ConfirmDialog from "./components/ConfirmDialog"; // Importamos el nuevo diálogo
import { Transaction, Bank, CreateTransaction } from "./types";

const Home: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );

  useEffect(() => {
    getTransactions()
      .then((response) => {
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      })
      .catch((error) =>
        console.error("Error al obtener las transacciones:", error)
      );

    getBanks()
      .then((response) => {
        const bancos = response.data;
        setBanks(bancos);
        const saldoTotal = bancos.reduce(
          (acc: number, bank: Bank) => acc + parseFloat(bank.saldo_total),
          0
        );
        setTotalSaldo(saldoTotal);
      })
      .catch((error) => console.error("Error al obtener los bancos:", error));
  }, []);

  // Función para agregar una nueva transacción
  const handleAddTransaction = (data: CreateTransaction) => {
    addTransaction(data)
      .then((response) => {
        console.log("Transacción agregada:", response);
        // Actualiza las transacciones después de agregar
        setTransactions((prev) => [...prev, response.data]);
        setFilteredTransactions((prev) => [...prev, response.data]);
      })
      .catch((error) =>
        console.error("Error al agregar la transacción:", error)
      );
  };

  const filterByBank = (banco: string) => {
    setSelectedBank(banco);
    if (banco === "") {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(
        (transaction) => transaction.nombre_banco === banco
      );
      setFilteredTransactions(filtered);
    }
  };

  const confirmDeleteTransaction = (id: number) => {
    setTransactionToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteTransaction = () => {
    if (transactionToDelete !== null) {
      deleteTransaction(transactionToDelete)
        .then(() => {
          const updatedTransactions = transactions.filter(
            (transaction) => transaction.transaccion_id !== transactionToDelete
          );
          setTransactions(updatedTransactions);
          setFilteredTransactions(updatedTransactions);
          setOpenConfirmDialog(false);
        })
        .catch((error) =>
          console.error("Error al eliminar la transacción:", error)
        );
    }
  };

  return (
    <div>
      <h1>Transacciones</h1>
      <FilterByBank
        banks={banks.map(({ nombre, saldo_total }) => ({
          nombre,
          saldo_total: parseFloat(saldo_total), // Convertir a número si es necesario
        }))}
        onFilter={filterByBank}
        totalSaldo={totalSaldo}
      />

      <TransactionTable
        transactions={
          filteredTransactions.length ? filteredTransactions : transactions
        }
        onEdit={(transaction) => console.log("Edit transaction:", transaction)}
        onDelete={confirmDeleteTransaction}
      />
      <AddTransactionButton
        onSubmit={handleAddTransaction}
        banks={banks} // Pasa el arreglo completo de bancos
        selectedBank={banks[0]} // Ejemplo de cómo seleccionar el primer banco
      />

      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar Eliminación"
        description={`¿Estás seguro que deseas eliminar esta transacción?`}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setOpenConfirmDialog(false)}
      />
    </div>
  );
};

export default Home;
