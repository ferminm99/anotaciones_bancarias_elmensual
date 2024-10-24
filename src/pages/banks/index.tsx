import { useEffect, useState } from "react";
import { getBanks, deleteBank, addBank } from "../../app/services/api";
import BankTable from "../../app/components/Banks/BankTable";
import AddBankButton from "../../app/components/Banks/AddBankButton";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import { Bank } from "../../app/types";
import EditBankButton from "../../app/components/Banks/EditBankButton";

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [bankToDelete, setBankToDelete] = useState<number | null>(null);
  const [bankToEdit, setBankToEdit] = useState<Bank | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Para el término de búsqueda

  useEffect(() => {
    getBanks()
      .then((response) => {
        setBanks(response.data);
        setFilteredBanks(response.data); // Inicialmente muestra todos los bancos
      })
      .catch((error) => console.error("Error al obtener los bancos:", error));
  }, []);

  const handleAddBank = (data: Omit<Bank, "banco_id">) => {
    const bancoExistente = banks.find(
      (bank) => bank.nombre.toLowerCase() === data.nombre.toLowerCase()
    );

    if (bancoExistente) {
      alert("Ya existe un banco con este nombre.");
      return;
    }

    addBank(data)
      .then((response) => {
        setBanks((prev) => [...prev, response.data]);
        setFilteredBanks((prev) => [...prev, response.data]);
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
          setFilteredBanks(updatedBanks);
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
    const bancoExistente = banks.find(
      (bank) =>
        bank.nombre.toLowerCase() === data.nombre.toLowerCase() &&
        bank.banco_id !== data.banco_id
    );

    if (bancoExistente) {
      alert("Ya existe otro banco con este nombre.");
      return;
    }

    setBanks((prevBanks) => {
      const updatedBanks = prevBanks.map((bnk) =>
        bnk.banco_id === data.banco_id ? data : bnk
      );
      return updatedBanks;
    });
    setFilteredBanks((prevBanks) => {
      const updatedFilteredBanks = prevBanks.map((bnk) =>
        bnk.banco_id === data.banco_id ? data : bnk
      );
      return updatedFilteredBanks;
    });
    setBankToEdit(null);
    setOpenEditDialog(false);
  };

  // Función para manejar la búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y normaliza el texto
    setSearchTerm(term);

    const filtered = banks.filter((bank) =>
      bank.nombre.toLowerCase().includes(term)
    );
    setFilteredBanks(filtered);
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {" "}
      {/* Ajustamos el ancho y centramos */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Bancos</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nombre del banco..."
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded h-10 mt-3 w-64" // Ajustamos el tamaño del campo de búsqueda
          />
          <AddBankButton onSubmit={handleAddBank} />
        </div>
      </div>
      <BankTable
        banks={filteredBanks.length ? filteredBanks : banks}
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
