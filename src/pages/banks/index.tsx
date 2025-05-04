// src/app/banks/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useCache } from "@/lib/CacheContext";
import { addBank, updateBank, deleteBank } from "../../app/services/api";
import BankTable from "../../app/components/Banks/BankTable";
import AddBankButton from "../../app/components/Banks/AddBankButton";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import EditBankButton from "../../app/components/Banks/EditBankButton";
import type { Bank } from "../../app/types";
import { Pagination } from "@mui/material";

const ROWS_PER_PAGE = 8;

const BanksPage: React.FC = () => {
  // 0) Cache y setters
  const { banks, syncBanks, setBanks: setCacheBanks } = useCache();

  // 1) Estado local
  const [filtered, setFiltered] = useState<Bank[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // 2) Diálogos
  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [toEdit, setToEdit] = useState<Bank | null>(null);

  // 3) Al montar, sincronizo sólo bancos
  useEffect(() => {
    syncBanks().catch(console.error);
  }, []);

  // 4) Cada vez que cambian `banks` o `searchTerm`,
  //    reaplico filtro + ordeno + reset de página
  useEffect(() => {
    const term = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const f = banks
      .filter((b) =>
        b.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(term)
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    setFiltered(f);
    setPage(1);
  }, [banks, searchTerm]);

  // 5) Handlers CRUD
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAdd = (data: { nombre: string; saldo_total: number }) => {
    // Previene duplicados por nombre
    if (
      banks.some((b) => b.nombre.toLowerCase() === data.nombre.toLowerCase())
    ) {
      alert("Ya existe un banco con este nombre.");
      return;
    }
    addBank(data)
      .then((res) => {
        setCacheBanks((prev) => [...prev, res.data]);
      })
      .catch((err) => console.error("Error al agregar banco:", err));
  };

  const confirmDelete = (id: number) => {
    setToDelete(id);
    setOpenConfirm(true);
  };
  const handleDelete = () => {
    if (toDelete == null) return;
    deleteBank(toDelete)
      .then(() => {
        setCacheBanks((prev) => prev.filter((b) => b.banco_id !== toDelete));
        setOpenConfirm(false);
      })
      .catch((err) => console.error("Error al eliminar banco:", err));
  };

  const handleEdit = (bank: Bank) => {
    setToEdit(bank);
  };
  const handleUpdate = (data: Bank) => {
    // Previene duplicados por nombre en otro registro
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
    // Actualizo cache inmediatamente
    setCacheBanks((prev) =>
      prev.map((b) =>
        b.banco_id === data.banco_id
          ? { ...data, updated_at: new Date().toISOString() }
          : b
      )
    );
    updateBank(data.banco_id, data)
      .then(() => setToEdit(null))
      .catch((err) => {
        console.error("Error al actualizar banco:", err);
        alert("No se pudo actualizar el banco.");
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

      {/* Tabla recibe sólo la página actual */}
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

      {/* Diálogo confirmación eliminación */}
      <ConfirmDialog
        open={openConfirm}
        title="Confirmar Eliminación"
        description="¿Estás seguro que deseas eliminar este banco?"
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirm(false)}
      />

      {/* Diálogo edición */}
      {toEdit && (
        <EditBankButton
          bankToEdit={toEdit}
          onSubmit={handleUpdate}
          onClose={() => setToEdit(null)}
        />
      )}
    </div>
  );
};

export default BanksPage;
