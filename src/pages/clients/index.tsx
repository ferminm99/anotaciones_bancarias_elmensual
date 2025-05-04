// src/app/clientes/page.tsx
"use client";

import React, { useEffect, useState } from "react";
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
import { Pagination } from "@mui/material";

const ROWS_PER_PAGE = 8;

const ClientesPage: React.FC = () => {
  // 0) Cache y setters
  const { clients, syncClients, setClients: setCacheClients } = useCache();

  // 1) Estado local
  const [filtered, setFiltered] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // 2) Diálogos
  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [toEdit, setToEdit] = useState<Cliente | null>(null);

  // 3) Al montar, sólo sincronizo cambios de clientes
  useEffect(() => {
    syncClients().catch(console.error);
  }, []);

  // 4) Cada vez que muda el cache o cambia el término de búsqueda:
  //    reaplico filtro y reset de página a 1
  useEffect(() => {
    const term = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const f = clients.filter((c) =>
      `${c.nombre} ${c.apellido ?? ""}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(term)
    );

    setFiltered(f);
    setPage(1);
  }, [clients, searchTerm]);

  // 5) Handlers CRUD
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAdd = (data: { nombre: string; apellido: string }) => {
    addCliente(data)
      .then((res) => {
        setCacheClients((prev) => [...prev, res.data]);
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
                  apellido: data.apellido,
                  updated_at: new Date().toISOString(),
                }
              : c
          )
        );
        setToEdit(null);
      })
      .catch((err) => {
        console.error("Error al actualizar cliente:", err);
        alert("No se pudo actualizar el cliente.");
      });
  };

  // 6) Paginación
  const pageCount = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const first = (page - 1) * ROWS_PER_PAGE;
  const last = first + ROWS_PER_PAGE;
  const pageItems = filtered.slice(first, last);

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

      {/* Tabla recibe sólo la página actual */}
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

      {/* Diálogo confirmación eliminación */}
      <ConfirmDialog
        open={openConfirm}
        title="Confirmar Eliminación"
        description="¿Estás seguro que deseas eliminar este cliente?"
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirm(false)}
      />

      {/* Diálogo edición */}
      {toEdit && (
        <EditClientButton
          clientToEdit={toEdit}
          onSubmit={handleUpdate}
          onClose={() => setToEdit(null)}
        />
      )}
    </div>
  );
};

export default ClientesPage;
