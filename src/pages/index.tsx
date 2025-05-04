// src/app/index.tsx

import { useEffect, useState } from "react";
import {
  deleteTransaction,
  addTransaction,
  updateTransaction,
} from "../app/services/api";
import { useCache } from "@/lib/CacheContext";
import TransactionTable from "../app/components/Transactions/TransactionTable";
import FilterByBank from "../app/components/Transactions/FilterByBank";
import AddTransactionButton from "../app/components/Transactions/TransactionButton";
import ConfirmDialog from "../app/components/ConfirmDialog";
import EditTransactionButton from "../app/components/Transactions/EditTransactionButton";
import type {
  Transaction,
  Bank,
  Cliente,
  CreateTransaction,
} from "../app/types";
import { Pagination } from "@mui/material";

export default function Home() {
  // 2) filtrado local
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  // 3) cache global
  const {
    transactions,
    banks,
    clients: clientes,
    setTransactions,
    setClients,
    syncAll,
  } = useCache();

  // 4) variables UI
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // — sync al montar
  useEffect(() => {
    if (banks.length === 0) return;
    const saved = localStorage.getItem("selectedBank");
    setSelectedBank(saved ? JSON.parse(saved) : banks[0]);
  }, [banks]);

  useEffect(() => {
    syncAll().catch(console.error);
  }, []);

  // — recalcular saldo y filtrado cuando cambian cache o banco seleccionado
  useEffect(() => {
    console.log("[Home] recalc saldo y filtro → banco:", selectedBank);
    setTotalSaldo(banks.reduce((sum, b) => sum + b.saldo_total, 0));

    if (selectedBank) {
      setFilteredTransactions(
        transactions.filter((tx) => tx.banco_id === selectedBank.banco_id)
      );
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, banks, selectedBank]);

  // — agregar
  const handleAddTransaction = (data: CreateTransaction) => {
    return addTransaction({
      ...data,
      fecha: new Date(data.fecha).toISOString(),
    })
      .then((res) => {
        const newTx: Transaction = { ...res.data };
        setTransactions((prev) => [newTx, ...prev]);
        if (!selectedBank || newTx.banco_id === selectedBank.banco_id) {
          setFilteredTransactions((prev) => [newTx, ...prev]);
        }
        // si cliente nuevo
        if (data.cliente_id === null && res.data.cliente_id) {
          const newClient: Cliente = {
            cliente_id: res.data.cliente_id,
            nombre: res.data.nombre_cliente?.split(" ")[0] ?? "",
            apellido:
              res.data.nombre_cliente?.split(" ").slice(1).join(" ") ?? "",
            updated_at: new Date().toISOString(),
          };
          setClients((prev) =>
            prev.some((c) => c.cliente_id === newClient.cliente_id)
              ? prev
              : [...prev, newClient]
          );
        }
        return res.data;
      })
      .catch((e) => {
        console.error(e);
        throw e;
      });
  };

  // — editar
  const handleUpdateTransaction = (tx: Transaction) => {
    return updateTransaction(tx.transaccion_id, tx)
      .then((res) => {
        setTransactions((prev) =>
          prev.map((t) =>
            t.transaccion_id === tx.transaccion_id ? res.data : t
          )
        );
        setFilteredTransactions((prev) =>
          prev.map((t) =>
            t.transaccion_id === tx.transaccion_id ? res.data : t
          )
        );
        if (res.data.cliente_id) {
          const newClient: Cliente = {
            cliente_id: res.data.cliente_id,
            nombre: res.data.nombre_cliente?.split(" ")[0] ?? "",
            apellido:
              res.data.nombre_cliente?.split(" ").slice(1).join(" ") ?? "",
            updated_at: new Date().toISOString(),
          };
          setClients((prev) =>
            prev.some((c) => c.cliente_id === newClient.cliente_id)
              ? prev
              : [...prev, newClient]
          );
        }
        return res.data;
      })
      .catch((e) => {
        console.error(e);
        throw e;
      });
  };

  // — eliminar
  const handleDeleteTransaction = () => {
    if (transactionToDelete == null) return;
    deleteTransaction(transactionToDelete).then(() => {
      setTransactions((prev) =>
        prev.filter((t) => t.transaccion_id !== transactionToDelete)
      );
      setFilteredTransactions((prev) =>
        prev.filter((t) => t.transaccion_id !== transactionToDelete)
      );
      setOpenConfirmDialog(false);
    });
  };

  // — filtrar por banco
  const filterByBank = (b: Bank | null) => {
    setSelectedBank(b);
    if (b) localStorage.setItem("selectedBank", JSON.stringify(b));
    else localStorage.removeItem("selectedBank");
    setCurrentPage(1);
  };

  // — búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    setSearchTerm(term);
    setFilteredTransactions(
      transactions.filter((tx) => {
        if (selectedBank && tx.banco_id !== selectedBank.banco_id) return false;
        const name = tx.nombre_cliente ?? "";
        return (
          name.toLowerCase().includes(term) ||
          tx.tipo.toLowerCase().includes(term) ||
          tx.monto?.toString().includes(term)
        );
      })
    );
  };

  // — paginación
  const last = currentPage * transactionsPerPage;
  const first = last - transactionsPerPage;
  const pageTx = filteredTransactions.slice(first, last);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Transacciones</h1>
      <div className="flex justify-between items-center mb-4">
        <FilterByBank
          banks={banks}
          selectedBank={selectedBank}
          onFilter={filterByBank}
          totalSaldo={totalSaldo}
        />
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded"
          />
          <AddTransactionButton
            onSubmit={handleAddTransaction}
            banks={banks}
            clientes={clientes}
            setClients={setClients}
            selectedBank={selectedBank ?? undefined}
          />
        </div>
      </div>

      <TransactionTable
        transactions={pageTx}
        onEdit={(tx) => setTransactionToEdit(tx)}
        onDelete={(id) => {
          setTransactionToDelete(id);
          setOpenConfirmDialog(true);
        }}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          count={Math.ceil(filteredTransactions.length / transactionsPerPage)}
          page={currentPage}
          onChange={(_, v) => setCurrentPage(v)}
          color="primary"
        />
      </div>

      {transactionToEdit && (
        <EditTransactionButton
          transactionToEdit={transactionToEdit}
          banks={banks}
          clientes={clientes}
          setClientes={setClients}
          onSubmit={handleUpdateTransaction}
          onClose={() => setTransactionToEdit(null)}
        />
      )}

      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar eliminación"
        description="¿Estás seguro?"
        onConfirm={handleDeleteTransaction}
        onCancel={() => setOpenConfirmDialog(false)}
      />
    </div>
  );
}
