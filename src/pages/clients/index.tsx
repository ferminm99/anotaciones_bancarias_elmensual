// src/app/clientes/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  addCliente,
  updateCliente,
  deleteCliente,
} from "../../app/services/api";
import { useCache } from "@/lib/CacheContext";
import ClienteTable from "../../app/components/Clients/ClientsTable";
import AddClienteButton from "../../app/components/Clients/ClientsButtonAdd";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import EditClientButton from "../../app/components/Clients/ClientEditButton";
import type { Cliente } from "../../app/types";
import {
  Pagination,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const ROWS_PER_PAGE = 8;

const ClientesPage: React.FC = () => {
  // ── Cache global ──
  const { clients, syncClients, setClients: setCacheClients } = useCache();

  // ── UI state ──
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [toEdit, setToEdit] = useState<Cliente | null>(null);
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
    syncClients()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── 2) Pipeline: filtro + búsqueda + orden ──
  const processedClients = useMemo(() => {
    const term = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return clients
      .filter((c) =>
        `${c.nombre} ${c.apellido ?? ""}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(term)
      )
      .sort((a, b) => {
        const cmpNombre = a.nombre.localeCompare(b.nombre);
        if (cmpNombre !== 0) return cmpNombre;
        return (a.apellido ?? "").localeCompare(b.apellido ?? "");
      });
  }, [clients, searchTerm]);

  // ── 3) Paginación sobre el array procesado ──
  const pageCount = Math.ceil(processedClients.length / ROWS_PER_PAGE);
  const first = (page - 1) * ROWS_PER_PAGE;
  const pageItems = processedClients.slice(first, first + ROWS_PER_PAGE);

  // ── Handlers CRUD ──
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleAdd = (data: { nombre: string; apellido: string }) => {
    addCliente(data)
      .then((res) => {
        setCacheClients((prev) => [...prev, res.data]);
        showSnackbar("Transacción agregada con éxito");
      })
      .catch((err) => console.error("Error al agregar cliente:", err));
  };

  const confirmDelete = (id: number) => {
    setToDelete(id);
    setOpenConfirm(true);
  };
  const handleDelete = () => {
    if (toDelete == null) return;
    deleteCliente(toDelete)
      .then(() => {
        setCacheClients((prev) =>
          prev.filter((c) => c.cliente_id !== toDelete)
        );
        showSnackbar("Transacción eliminada con éxito");
        setOpenConfirm(false);
      })
      .catch((err) => console.error("Error al eliminar cliente:", err));
  };

  const handleEdit = (c: Cliente) => setToEdit(c);
  const handleUpdate = (data: Cliente) => {
    updateCliente(data.cliente_id, {
      nombre: data.nombre,
      apellido: data.apellido ?? "",
    })
      .then(() => {
        setCacheClients((prev) =>
          prev.map((c) =>
            c.cliente_id === data.cliente_id
              ? {
                  ...c,
                  nombre: data.nombre,
                  apellido: data.apellido ?? "",
                  updated_at: new Date().toISOString(),
                }
              : c
          )
        );
        showSnackbar("Transacción actualizada con éxito");
        setToEdit(null);
      })
      .catch((err) => {
        console.error("Error al actualizar cliente:", err);
        alert("No se pudo actualizar el cliente.");
      });
  };

  // ── Loading ──
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

  // ── Render ──
  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded h-10 w-64"
          />
          <AddClienteButton onSubmit={handleAdd} />
        </div>
      </div>

      {/* Tabla paginada */}
      <ClienteTable
        clientes={pageItems}
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
        description="¿Estás seguro que deseas eliminar este cliente?"
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirm(false)}
      />

      {/* Modal de edición */}
      {toEdit && (
        <EditClientButton
          clientToEdit={toEdit}
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
  );
};

export default ClientesPage;
