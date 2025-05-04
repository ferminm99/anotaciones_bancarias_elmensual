// src/app/banks/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCache } from "@/lib/CacheContext";
import { addBank, updateBank, deleteBank } from "../../app/services/api";
import BankTable from "../../app/components/Banks/BankTable";
import AddBankButton from "../../app/components/Banks/AddBankButton";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import EditBankButton from "../../app/components/Banks/EditBankButton";
import type { Bank } from "../../app/types";
import { Pagination, CircularProgress, Snackbar, Alert } from "@mui/material";

const ROWS_PER_PAGE = 8;

const BanksPage: React.FC = () => {
  // ── Cache global ──
  const { banks, syncBanks, setBanks: setCacheBanks, hydrated } = useCache();

  // ── UI state ──
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [toEdit, setToEdit] = useState<Bank | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ── 1) Primera sincronización ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!hydrated) return;
    syncBanks()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hydrated]);

  // ── 2) Pipeline: filtro + búsqueda + orden ──
  const processedBanks = useMemo(() => {
    const term = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return banks
      .filter((b) =>
        b.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(term)
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [banks, searchTerm]);

  // ── 3) Paginación sobre el array procesado ──
  const pageCount = Math.ceil(processedBanks.length / ROWS_PER_PAGE);
  const first = (page - 1) * ROWS_PER_PAGE;
  const pageItems = processedBanks.slice(first, first + ROWS_PER_PAGE);

  // ── Handlers CRUD ──
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleAdd = (data: { nombre: string; saldo_total: number }) => {
    setLoading(true);
    if (
      banks.some((b) => b.nombre.toLowerCase() === data.nombre.toLowerCase())
    ) {
      alert("Ya existe un banco con este nombre.");
      return;
    }
    addBank(data)
      .then((res) => {
        setCacheBanks((prev) => [...prev, res.data]);
        showSnackbar("Transacción agregada con éxito");
        setLoading(false);
      })
      .catch((err) => console.error("Error al agregar banco:", err));
  };

  const confirmDelete = (id: number) => {
    setToDelete(id);
    setOpenConfirm(true);
  };
  const handleDelete = () => {
    setLoading(true);
    if (toDelete == null) return;
    deleteBank(toDelete)
      .then(() => {
        setCacheBanks((prev) => prev.filter((b) => b.banco_id !== toDelete));
        setOpenConfirm(false);
        showSnackbar("Transacción eliminada con éxito");
        setLoading(false);
      })
      .catch((err) => console.error("Error al eliminar banco:", err));
  };

  const handleEdit = (bank: Bank) => {
    setToEdit(bank);
  };
  const handleUpdate = (data: Bank) => {
    setLoading(true);
    if (
      banks.some(
        (b) =>
          b.banco_id !== data.banco_id &&
          b.nombre.toLowerCase() === data.nombre.toLowerCase()
      )
    ) {
      alert("Ya existe otro banco con este nombre.");
      return;
    }
    // Actualizamos caché inmediatamente (y marcamos updated_at)
    setCacheBanks((prev) =>
      prev.map((b) =>
        b.banco_id === data.banco_id
          ? { ...data, updated_at: new Date().toISOString() }
          : b
      )
    );
    updateBank(data.banco_id, data)
      .then(() => {
        showSnackbar("Transacción actualizada con éxito");
        setLoading(false);
        setToEdit(null);
      })
      .catch((err) => {
        console.error("Error al actualizar banco:", err);
        alert("No se pudo actualizar el banco.");
      });
  };

  // ── Render ──
  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(2px)",
          }}
        >
          <CircularProgress size={60} />
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4">
        {/* Barra superior */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Bancos</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Buscar por nombre del banco..."
              value={searchTerm}
              onChange={handleSearch}
              className="border p-2 rounded h-10 w-64"
            />
            <AddBankButton onSubmit={handleAdd} />
          </div>
        </div>

        {/* Tabla paginada */}
        <BankTable
          banks={pageItems}
          onEdit={handleEdit}
          onDelete={confirmDelete}
        />

        {/* Paginación */}
        <div className="flex justify-center mt-4">
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
          />
        </div>

        {/* Confirmación de borrado */}
        <ConfirmDialog
          open={openConfirm}
          title="Confirmar Eliminación"
          description="¿Estás seguro que deseas eliminar este banco?"
          onConfirm={handleDelete}
          onCancel={() => setOpenConfirm(false)}
        />

        {/* Modal de edición */}
        {toEdit && (
          <EditBankButton
            bankToEdit={toEdit}
            onSubmit={handleUpdate}
            onClose={() => setToEdit(null)}
          />
        )}
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
    </>
  );
};

export default BanksPage;
