// src/pages/index.tsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import {
  Pagination,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

export default function Home() {
  // ── UI state ──
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const transactionsPerPage = 10;
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ── Cache global ──
  const {
    transactions,
    banks,
    clients: clientes,
    setTransactions,
    setClients,
    syncAll,
    syncBanks,
  } = useCache();

  // ── 1) Al montar, levantamos banco guardado ──
  useEffect(() => {
    if (!banks.length) return;
    const saved = localStorage.getItem("selectedBank");
    setSelectedBank(saved ? JSON.parse(saved) : banks[0]);
  }, [banks]);

  // ── 2) Primera sincronización ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    syncAll()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── 3) Total de saldos (para el dropdown) ──
  const totalSaldo = useMemo(
    () => banks.reduce((sum, b) => sum + b.saldo_total, 0),
    [banks]
  );

  // ── 4) Lista procesada: filtro de banco + búsqueda + orden ──
  const processedTransactions = useMemo(() => {
    let arr = selectedBank
      ? transactions.filter((tx) => tx.banco_id === selectedBank.banco_id)
      : [...transactions];

    // búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      arr = arr.filter((tx) => {
        const name = tx.nombre_cliente?.toLowerCase() ?? "";
        return (
          name.includes(term) ||
          tx.tipo.toLowerCase().includes(term) ||
          tx.monto?.toString().includes(term)
        );
      });
    }

    // orden: fecha ↓, cliente ↑, tipo ↑
    arr.sort((a, b) => {
      const d = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      if (d !== 0) return d;
      const na = (a.nombre_cliente || "").toLowerCase();
      const nb = (b.nombre_cliente || "").toLowerCase();
      const cmp = na.localeCompare(nb);
      if (cmp !== 0) return cmp;
      return a.tipo.localeCompare(b.tipo);
    });

    return arr;
  }, [transactions, selectedBank, searchTerm]);

  // ── 5) Slice para paginación ──
  const last = currentPage * transactionsPerPage;
  const first = last - transactionsPerPage;
  const pageTx = processedTransactions.slice(first, last);

  // ── Handlers CRUD ──
  const handleAddTransaction = async (data: CreateTransaction) => {
    setLoading(true);
    try {
      const res = await addTransaction({
        ...data,
        fecha: new Date(data.fecha).toISOString(),
      });

      setTransactions((prev) => [res.data, ...prev]);

      if (data.cliente_id === null && res.data.cliente_id) {
        const nc: Cliente = {
          cliente_id: res.data.cliente_id!,
          nombre: res.data.nombre_cliente!.split(" ")[0],
          apellido: res.data.nombre_cliente!.split(" ").slice(1).join(" "),
          updated_at: new Date().toISOString(),
        };
        setClients((prev) =>
          prev.some((c) => c.cliente_id === nc.cliente_id)
            ? prev
            : [...prev, nc]
        );
      }

      await syncBanks();
      showSnackbar("Transacción agregada con éxito");
      return res;
    } catch (err) {
      showSnackbar("Error al agregar transacción", "error");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async (tx: Transaction) => {
    setLoading(true);
    try {
      const res = await updateTransaction(tx.transaccion_id, tx);

      setTransactions((prev) =>
        prev.map((t) => (t.transaccion_id === tx.transaccion_id ? res.data : t))
      );

      await syncBanks();
      showSnackbar("Transacción actualizada con éxito");
      setTransactionToEdit(null);
      return res;
    } catch (err) {
      showSnackbar("Error al actualizar transacción", "error");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = () => {
    setLoading(true);
    if (transactionToDelete == null) return;
    deleteTransaction(transactionToDelete).then(() => {
      setTransactions((prev) =>
        prev.filter((t) => t.transaccion_id !== transactionToDelete)
      );
      syncBanks().catch(console.error);
      showSnackbar("Transacción eliminada con éxito");
      setLoading(false);
      setOpenConfirmDialog(false);
    });
  };

  // ── UI ──
  if (loading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Transacciones</h1>

      {/* filtros + búsqueda + botón nueva transacción */}
      <div className="flex justify-between items-center mb-4">
        <FilterByBank
          banks={banks}
          selectedBank={selectedBank}
          onFilter={(b) => {
            setSelectedBank(b);

            if (b) {
              localStorage.setItem("selectedBank", JSON.stringify(b));
            } else {
              localStorage.removeItem("selectedBank");
            }

            setCurrentPage(1);
          }}
          totalSaldo={totalSaldo}
        />
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* tabla y paginación */}
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
          count={Math.ceil(processedTransactions.length / transactionsPerPage)}
          page={currentPage}
          onChange={(_, v) => setCurrentPage(v)}
          color="primary"
        />
      </div>

      {/* modal editar */}
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

      {/* confirm delete */}
      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar eliminación"
        description="¿Estás seguro?"
        onConfirm={handleDeleteTransaction}
        onCancel={() => setOpenConfirmDialog(false)}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
