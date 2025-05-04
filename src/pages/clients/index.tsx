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

const Clientes: React.FC = () => {
  const { clients, syncClients, setClients: setCacheClients } = useCache();
  const [filtered, setFiltered] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [toEdit, setToEdit] = useState<Cliente | null>(null);

  // 1) Mantener filtrado al cambiar cache
  useEffect(() => {
    setFiltered(clients);
  }, [clients]);

  useEffect(() => {
    syncClients().catch(console.error);
  }, []);

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
        // Al retornar 200, actualizo el caché local
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    setSearchTerm(term);
    setFiltered(
      clients.filter((c) =>
        `${c.nombre} ${c.apellido}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(term)
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
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

      <ClienteTable
        clientes={filtered}
        onEdit={handleEdit}
        onDelete={confirmDelete}
      />

      <ConfirmDialog
        open={openConfirm}
        title="Confirmar Eliminación"
        description="¿Estás seguro que deseas eliminar este cliente?"
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirm(false)}
      />

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

export default Clientes;
