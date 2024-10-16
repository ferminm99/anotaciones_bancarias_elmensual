"use client";

import { useEffect, useState } from "react";
import {
  getTransactions,
  deleteTransaction,
  addTransaction,
  getBanks,
} from "../app/services/api";
import TransactionTable from "../app/components/Transactions/TransactionTable";
import FilterByBank from "../app/components/Transactions/FilterByBank";
import AddTransactionButton from "../app/components/Transactions/TransactionButton";
import ConfirmDialog from "../app/components/ConfirmDialog";
import EditTransactionButton from "../app/components/Transactions/EditTransactionButton"; // Importamos el nuevo botón
import { Transaction, Bank, CreateTransaction } from "../app/types";
import { Pagination } from "@mui/material";
import Clientes from "./clients";

const Home: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null); // Cambiado de [] a null
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false); // Controlamos la apertura del diálogo de edición
  const [currentPage, setCurrentPage] = useState<number>(1);
  const transactionsPerPage = 10;

  const fetchBanks = () => {
    getBanks()
      .then((response) => {
        setBanks(response.data);
        const saldoTotal = response.data.reduce(
          (acc: number, bank: Bank) => acc + parseFloat(bank.saldo_total),
          0
        );
        setTotalSaldo(saldoTotal);
      })
      .catch((error) => console.error("Error al obtener los bancos:", error));
  };

  useEffect(() => {
    getTransactions()
      .then((response) => {
        const orderedTransactions = response.data.sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setTransactions(orderedTransactions);
        setFilteredTransactions(orderedTransactions);
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

  const handleAddTransaction = (data: CreateTransaction) => {
    addTransaction(data)
      .then((response) => {
        const bancoEncontrado = banks.find(
          (banco) => banco.banco_id === response.data.banco_id
        );
        const newTransaction = {
          ...response.data,
          nombre_cliente: response.data.nombre_cliente || " - ",
          nombre_banco: bancoEncontrado ? bancoEncontrado.nombre : "SIN BANCO",
        };

        setTransactions((prev) => [...prev, newTransaction]);
        setFilteredTransactions((prev) => [...prev, newTransaction]);
        // Llama a fetchBanks para actualizar los bancos
        fetchBanks();
      })
      .catch((error) =>
        console.error("Error al agregar la transacción:", error)
      );
  };

  const handleEditTransaction = (transaction: Transaction) => {
    console.log(transaction);
    setTransactionToEdit(transaction); // Establecemos la transacción a editar
    setOpenEditDialog(true); // Abrimos el diálogo
    console.log(openEditDialog);
  };

  const handleUpdateTransaction = (data: Transaction) => {
    setTransactions((prevTransactions) => {
      const updatedTransactions = prevTransactions.map((trans) =>
        trans.transaccion_id === data.transaccion_id ? data : trans
      );

      return updatedTransactions;
    });

    setFilteredTransactions((prevFiltered) => {
      const updatedFiltered = prevFiltered.map((trans) =>
        trans.transaccion_id === data.transaccion_id ? data : trans
      );

      return updatedFiltered;
    });

    setTransactionToEdit(null); // Limpiamos la transacción seleccionada
    setOpenEditDialog(false); // Cerramos el diálogo
    // Llama a fetchBanks para actualizar los bancos
    fetchBanks();
  };

  const filterByBank = (banco: Bank | null) => {
    setSelectedBank(banco);
    const filtered = banco
      ? transactions.filter(
          (transaction) => transaction.nombre_banco === banco.nombre
        )
      : transactions; // Si no hay banco seleccionado, mostramos todas las transacciones
    setFilteredTransactions(filtered);
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
          // Llama a fetchBanks para actualizar los bancos
          fetchBanks();
        })
        .catch((error) =>
          console.error("Error al eliminar la transacción:", error)
        );
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Normaliza y elimina los acentos

    setSearchTerm(term);

    const filtered = transactions.filter((transaction) => {
      const nombreCliente = transaction.nombre_cliente
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Normaliza y elimina los acentos

      const tipo = transaction.tipo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const nombreBanco = transaction.nombre_banco
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const monto = transaction.monto.toString();

      return (
        nombreCliente?.includes(term) ||
        tipo.includes(term) ||
        nombreBanco.includes(term) ||
        monto.includes(term)
      );
    });

    setFilteredTransactions(filtered);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Transacciones</h1>
        <AddTransactionButton
          onSubmit={handleAddTransaction}
          banks={banks}
          selectedBank={selectedBank ?? undefined}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <FilterByBank
          banks={banks.map(({ nombre, saldo_total, banco_id }) => ({
            nombre,
            saldo_total: parseFloat(saldo_total), // Convertir a número si es necesario
            banco_id: banco_id ?? 0,
          }))}
          onFilter={(banco) =>
            filterByBank(
              banco ?? { nombre: "Desconocido", saldo_total: 0, banco_id: 0 }
            )
          }
          totalSaldo={totalSaldo}
        />

        <input
          type="text"
          placeholder="Buscar..."
          className="border p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <TransactionTable
        transactions={currentTransactions}
        onEdit={handleEditTransaction}
        onDelete={confirmDeleteTransaction}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          count={Math.ceil(filteredTransactions.length / transactionsPerPage)}
          page={currentPage}
          onChange={(e, value) => setCurrentPage(value)}
          color="primary"
        />
      </div>

      {/* Manejamos el diálogo de edición */}
      {transactionToEdit && (
        <EditTransactionButton
          transactionToEdit={transactionToEdit}
          banks={banks}
          onSubmit={handleUpdateTransaction}
          onClose={() => setTransactionToEdit(null)} // Cerramos el diálogo aquí
        />
      )}

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
