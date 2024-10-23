import { useEffect, useState } from "react";
import { getBanks, deleteBank, addBank } from "../../app/services/api";
import BankTable from "../../app/components/Banks/BankTable";
import AddBankButton from "../../app/components/Banks/AddBankButton";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import { Bank } from "../../app/types";
import EditBankButton from "../../app/components/Banks/EditBankButton";

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [bankToDelete, setBankToDelete] = useState<number | null>(null);
  const [bankToEdit, setBankToEdit] = useState<Bank | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);

  useEffect(() => {
    getBanks()
      .then((response) => {
        setBanks(response.data);
      })
      .catch((error) => console.error("Error al obtener los bancos:", error));
  }, []);

  const handleAddBank = (data: Omit<Bank, "banco_id">) => {
    // Verifica si ya existe un banco con el mismo nombre
    const bancoExistente = banks.find(
      (bank) => bank.nombre.toLowerCase() === data.nombre.toLowerCase()
    );

    if (bancoExistente) {
      alert("Ya existe un banco con este nombre.");
      return; // No continuamos si ya existe el banco
    }

    addBank(data)
      .then((response) => {
        setBanks((prev) => [...prev, response.data]);
      })
      .catch((error) => console.error("Error al agregar banco:", error));
  };

  const confirmDeleteBank = (id: number) => {
    setBankToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteBank = () => {
    if (bankToDelete !== null) {
      deleteBank(bankToDelete)
        .then(() => {
          const updatedBanks = banks.filter(
            (bank) => bank.banco_id !== bankToDelete
          );
          setBanks(updatedBanks);
          setOpenConfirmDialog(false);
        })
        .catch((error) => console.error("Error al eliminar el banco:", error));
    }
  };

  const handleEditBank = (bank: Bank) => {
    setBankToEdit(bank);
    setOpenEditDialog(true);
  };

  const handleUpdateBank = (data: Bank) => {
    // Verifica si ya existe un banco con el mismo nombre y que no sea el mismo banco que estamos editando
    const bancoExistente = banks.find(
      (bank) =>
        bank.nombre.toLowerCase() === data.nombre.toLowerCase() &&
        bank.banco_id !== data.banco_id
    );

    if (bancoExistente) {
      alert("Ya existe otro banco con este nombre.");
      return; // No continuamos si ya existe el banco con ese nombre
    }

    setBanks((prevBanks) => {
      const updatedBanks = prevBanks.map((bnk) =>
        bnk.banco_id === data.banco_id ? data : bnk
      );
      return updatedBanks;
    });
    setBankToEdit(null);
    setOpenEditDialog(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Bancos</h1>
        <AddBankButton onSubmit={handleAddBank} />
      </div>
      {/* Muestra el error */}
      <BankTable
        banks={banks}
        onEdit={handleEditBank}
        onDelete={confirmDeleteBank}
      />
      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar Eliminación"
        description={`¿Estás seguro que deseas eliminar este banco?`}
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
