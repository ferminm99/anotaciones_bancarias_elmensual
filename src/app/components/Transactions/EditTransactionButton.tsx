import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Bank, Cliente, Transaction } from "../../types";
import { getClientes, updateTransaction } from "../../services/api"; // Importamos la nueva función
import { formatNumber } from "../../../utils/formatNumber";
import { SelectChangeEvent } from "@mui/material"; // Importar SelectChangeEvent

interface EditTransactionButtonProps {
  onSubmit: (data: Transaction) => void;
  banks: Bank[];
  transactionToEdit: Transaction | null;
  onClose: () => void;
}

const EditTransactionButton: React.FC<EditTransactionButtonProps> = ({
  onSubmit,
  banks,
  transactionToEdit,
  onClose,
}) => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [clienteOption, setClienteOption] = useState<string>("existente");
  const [nuevoCliente, setNuevoCliente] = useState<string>("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    getClientes()
      .then((response) => {
        setClientes(response.data);

        if (transactionToEdit) {
          setTransaction({
            ...transactionToEdit,
            fecha: new Date(transactionToEdit.fecha).toISOString().slice(0, 10),
          });
          const bank = banks.find(
            (bank) => bank.nombre === transactionToEdit.nombre_banco
          );
          const client = response.data.find(
            (client: Cliente) =>
              client.nombre + " " + client.apellido ===
              transactionToEdit.nombre_cliente
          );
          setSelectedBank(bank || null);
          setSelectedClient(client || null);
        }
      })
      .catch((error) => {
        console.error("Error al cargar los clientes:", error);
      });
  }, [transactionToEdit, banks]);

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setTransaction((prev) =>
      prev ? { ...prev, [name as string]: value } : prev
    );
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, ""); // Eliminar los puntos antes de procesar
    const formattedValue = formatNumber(value).toString(); // Asegurarte de que sea string
    setTransaction(
      (prev) => (prev ? { ...prev, monto: Number(value) } : prev) // Mantener el valor numérico sin formato
    );
    e.target.value = formattedValue; // Actualizar el input con el valor formateado
  };

  const handleSubmit = () => {
    if (transaction) {
      const cliente = clienteOption === "nuevo" ? nuevoCliente : selectedClient;
      const updatedTransaction = {
        ...transaction,
        nombre_cliente: cliente
          ? clienteOption === "nuevo"
            ? nuevoCliente
            : `${selectedClient?.nombre} ${selectedClient?.apellido}`
          : "",
        banco_id: selectedBank?.banco_id || 0, // Si selectedBank es null o undefined, asigna 0 o maneja el caso apropiado
      };

      if (!updatedTransaction.banco_id) {
        console.error("Banco no seleccionado");
        return;
      }

      // Usamos la nueva función `updateTransaction` pasando el ID y los datos
      updateTransaction(updatedTransaction.transaccion_id, updatedTransaction)
        .then(() => {
          onSubmit(updatedTransaction);
        })
        .catch((error) => {
          console.error("Error al actualizar la transacción:", error);
        });
    }
  };

  return (
    <Dialog open={Boolean(transactionToEdit)} onClose={onClose}>
      <DialogTitle>Editar Transacción</DialogTitle>
      <DialogContent>
        {transaction && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="banco-label" shrink>
                Banco
              </InputLabel>
              <Select
                labelId="banco-label"
                id="banco"
                name="banco_id"
                value={selectedBank?.banco_id || ""}
                onChange={(e) => {
                  const selected = banks.find(
                    (bank) => bank.banco_id === Number(e.target.value)
                  );
                  setSelectedBank(selected || null);
                  setTransaction((prev) =>
                    prev ? { ...prev, banco_id: Number(e.target.value) } : prev
                  );
                }}
              >
                {banks.map((bank) => (
                  <MenuItem key={bank.banco_id} value={bank.banco_id}>
                    {bank.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="tipo-transaccion-label" shrink>
                Tipo de Transacción
              </InputLabel>
              <Select
                labelId="tipo-transaccion-label"
                id="tipo-transaccion"
                name="tipo"
                value={transaction.tipo}
                onChange={(e) =>
                  handleChange(
                    e as React.ChangeEvent<{ name?: string; value: unknown }>
                  )
                } // Usar SelectChangeEvent en lugar de HTMLSelectElement
                label="Tipo de Transacción"
              >
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="interdeposito">Interdepósito</MenuItem>
                <MenuItem value="gastos_mantenimiento">
                  Gastos de Mantenimiento
                </MenuItem>
                <MenuItem value="impuesto">Impuesto</MenuItem>
                <MenuItem value="cheque_deposito">Deposito de Cheque</MenuItem>
                <MenuItem value="retiro_cheque">Retiro de Cheque</MenuItem>
                <MenuItem value="deposito_efectivo">
                  Depósito en Efectivo
                </MenuItem>
                <MenuItem value="retiro_efectivo">Retiro en Efectivo</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                value={transaction.fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField
                label="Monto"
                type="text" // Cambié a text para mostrar los puntos
                name="monto"
                value={transaction.monto ? formatNumber(transaction.monto) : ""}
                onChange={handleMontoChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            {/* Mostrar los campos de cliente solo si es transferencia o interdeposito */}
            {["interdeposito", "transferencia"].includes(transaction.tipo) && (
              <>
                <FormControl component="fieldset" margin="normal">
                  <RadioGroup
                    row
                    value={clienteOption}
                    onChange={(e) => setClienteOption(e.target.value)}
                  >
                    <FormControlLabel
                      value="existente"
                      control={<Radio />}
                      label="Cliente existente"
                    />
                    <FormControlLabel
                      value="nuevo"
                      control={<Radio />}
                      label="Cliente nuevo"
                    />
                  </RadioGroup>
                </FormControl>

                {clienteOption === "existente" && (
                  <FormControl fullWidth margin="normal">
                    <Autocomplete
                      options={clientes}
                      getOptionLabel={(option) =>
                        `${option.nombre} ${option.apellido}`
                      }
                      value={selectedClient}
                      onChange={(event, newValue) =>
                        setSelectedClient(newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Nombre y apellido"
                          placeholder="Seleccionar cliente existente"
                        />
                      )}
                    />
                  </FormControl>
                )}

                {clienteOption === "nuevo" && (
                  <FormControl fullWidth margin="normal">
                    <TextField
                      label="Nombre del nuevo cliente"
                      value={nuevoCliente}
                      onChange={(e) => setNuevoCliente(e.target.value)}
                    />
                  </FormControl>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          CANCELAR
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          ACTUALIZAR TRANSACCIÓN
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTransactionButton;
