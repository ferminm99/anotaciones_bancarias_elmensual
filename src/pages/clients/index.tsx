// src/pages/Clientes.tsx
"use client";

import { useEffect, useState } from "react";
import { getClientes, deleteCliente, addCliente } from "../../app/services/api"; // Asegúrate de tener estos servicios creados
import ClienteTable from "../../app/components/Clients/ClientsTable";
import AddClienteButton from "../../app/components/Clients/ClientsButtonAdd"; // Este componente para agregar clientes
import ConfirmDialog from "../../app/components/ConfirmDialog"; // Diálogo de confirmación para eliminar
import { Cliente } from "../../app/types";

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);

  useEffect(() => {
    getClientes()
      .then((response) => {
        setClientes(response.data);
        setFilteredClientes(response.data);
      })
      .catch((error) => console.error("Error al obtener los clientes:", error));
  }, []);

  const handleAddCliente = (data: Omit<Cliente, "cliente_id">) => {
    addCliente(data)
      .then((response) => {
        setClientes((prev) => [...prev, response.data]);
        setFilteredClientes((prev) => [...prev, response.data]);
      })
      .catch((error) => console.error("Error al agregar cliente:", error));
  };

  const confirmDeleteCliente = (id: number) => {
    setClienteToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteCliente = () => {
    if (clienteToDelete !== null) {
      deleteCliente(clienteToDelete)
        .then(() => {
          const updatedClientes = clientes.filter(
            (cliente) => cliente.cliente_id !== clienteToDelete
          );
          setClientes(updatedClientes);
          setFilteredClientes(updatedClientes);
          setOpenConfirmDialog(false);
        })
        .catch((error) =>
          console.error("Error al eliminar el cliente:", error)
        );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Clientes</h1>

      <ClienteTable
        clientes={filteredClientes.length ? filteredClientes : clientes}
        onDelete={confirmDeleteCliente}
      />

      <AddClienteButton onSubmit={handleAddCliente} />

      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar Eliminación"
        description={`¿Estás seguro que deseas eliminar este cliente?`}
        onConfirm={handleDeleteCliente}
        onCancel={() => setOpenConfirmDialog(false)}
      />
    </div>
  );
};

export default Clientes;
