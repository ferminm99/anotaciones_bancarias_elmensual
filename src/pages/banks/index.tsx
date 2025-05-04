// src/app/banks/page.tsx  (o la ruta donde esté tu página de Bancos)

import React, { useEffect, useState } from "react";
import { useCache } from "@/lib/CacheContext";
import { addBank, updateBank, deleteBank } from "../../app/services/api";
import BankTable from "../../app/components/Banks/BankTable";
import AddBankButton from "../../app/components/Banks/AddBankButton";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import EditBankButton from "../../app/components/Banks/EditBankButton";
import type { Bank } from "../../app/types";

const Banks: React.FC = () => {
  // 1) Sacamos los bancos y el setter del cache global
  const { banks, syncBanks, setBanks: setCacheBanks } = useCache();

  // 2) Estado local para filtrado, búsqueda y diálogos
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<number | null>(null);
  const [bankToEdit, setBankToEdit] = useState<Bank | null>(null);

  // 3) Cada vez que cambian `banks` (cache), reordenamos y actualizamos `filteredBanks`
  useEffect(() => {
    const sorted = [...banks].sort((a, b) => a.nombre.localeCompare(b.nombre));
    setFilteredBanks(sorted);
  }, [banks]);

  useEffect(() => {
    syncBanks().catch(console.error);
  }, []);
  // 4) Handlers de CRUD

  const handleAddBank = (data: { nombre: string; saldo_total: number }) => {
    // Previene duplicados por nombre
    if (
      banks.some((b) => b.nombre.toLowerCase() === data.nombre.toLowerCase())
    ) {
      alert("Ya existe un banco con este nombre.");
      return;
    }
    addBank(data)
      .then((res) => {
        // Actualizamos el cache; el useEffect arriba actualizará filteredBanks
        setCacheBanks((prev) => [...prev, res.data]);
      })
      .catch((err) => console.error("Error al agregar banco:", err));
  };

  const confirmDeleteBank = (id: number) => {
    setBankToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteBank = () => {
    if (bankToDelete == null) return;
    deleteBank(bankToDelete)
      .then(() => {
        setCacheBanks((prev) =>
          prev.filter((b) => b.banco_id !== bankToDelete)
        );
        setOpenConfirmDialog(false);
      })
      .catch((err) => console.error("Error al eliminar banco:", err));
  };

  const handleEditBank = (bank: Bank) => {
    setBankToEdit(bank);
  };

  const handleUpdateBank = (data: Bank) => {
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
    // Actualizamos cache inmediatamente
    setCacheBanks((prev) =>
      prev.map((b) => (b.banco_id === data.banco_id ? data : b))
    );
    updateBank(data.banco_id, data)
      .then(() => setBankToEdit(null))
      .catch((err) => console.error("Error al actualizar banco:", err));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    setSearchTerm(term);
    setFilteredBanks(
      banks.filter((b) =>
        b.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(term)
      )
    );
  };

  // 5) Renderizado
  return (
    <div className="max-w-5xl mx-auto px-4">
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
          <AddBankButton onSubmit={handleAddBank} />
        </div>
      </div>

      <BankTable
        banks={filteredBanks}
        onEdit={handleEditBank}
        onDelete={confirmDeleteBank}
      />

      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar Eliminación"
        description="¿Estás seguro que deseas eliminar este banco?"
        onConfirm={handleDeleteBank}
        onCancel={() => setOpenConfirmDialog(false)}
      />

      {bankToEdit && (
        <EditBankButton
          bankToEdit={bankToEdit}
          onSubmit={handleUpdateBank}
          onClose={() => setBankToEdit(null)}
        />
      )}
    </div>
  );
};

export default Banks;
