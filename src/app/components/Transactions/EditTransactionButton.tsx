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
import { Bank, Cliente, Transaction, Cheque } from "../../types";
import { getClientes, updateTransaction, getCheques } from "../../services/api"; // Importamos la nueva función
import { formatNumber } from "../../../utils/formatNumber";

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
  const [numeroCheque, setNumeroCheque] = useState<number | undefined>(); // Estado para el número de cheque
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);

  useEffect(() => {
    // Cargamos los cheques primero
    getCheques()
      .then((response) => {
        setCheques(response.data); // Guardamos los cheques en el estado
        console.log(cheques);
        if (transactionToEdit) {
          // Inicializamos la transacción a editar
          setTransaction({
            ...transactionToEdit,
            fecha: new Date(transactionToEdit.fecha).toISOString().slice(0, 10),
          });

          const bank = banks.find(
            (bank) => bank.banco_id === transactionToEdit.banco_id
          );
          setSelectedBank(bank || null);

          const client = response.data.find(
            (client: Cliente) =>
              client.cliente_id === transactionToEdit.cliente_id
          );
          setSelectedClient(client || null);

          // Verificamos si la transacción es de tipo 'pago_cheque' y si tiene un cheque asociado
          if (
            transactionToEdit.tipo === "pago_cheque" &&
            transactionToEdit.cheque_id
          ) {
            // Buscamos el cheque basado en cheque_id
            const cheque = response.data.find(
              (cheque: Cheque) =>
                cheque.cheque_id === transactionToEdit.cheque_id
            );
            setNumeroCheque(cheque?.numero || ""); // Establecemos el número del cheque si se encuentra
          }
        }
      })
      .catch((error) => {
        console.error("Error al obtener los cheques:", error);
      });

    // Cargamos los clientes
    getClientes()
      .then((response) => {
        setClientes(response.data);

        if (transactionToEdit) {
          const client = response.data.find(
            (client: Cliente) =>
              client.cliente_id === transactionToEdit.cliente_id
          );
          setSelectedClient(client || null);
        }
      })
      .catch((error) => {
        console.error("Error al cargar los clientes:", error);
      });
  }, [transactionToEdit, banks]);

  // Aquí se usa el `useEffect` solo para inicializar los valores cuando `transactionToEdit` cambie.
  // No volverá a sobrescribir los datos cada vez que el usuario interactúe con el formulario.

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setTransaction((prev) =>
      prev ? { ...prev, [name as string]: value } : prev
    );

    // Si el campo que cambió es "tipo", limpiamos el cliente y cheque si no es interdeposito, transferencia o pago_cheque
    if (name === "tipo") {
      if (
        !["interdeposito", "transferencia", "pago_cheque"].includes(
          value as string
        )
      ) {
        setSelectedClient(null);
        setNuevoCliente("");
        setNumeroCheque(undefined); // Limpiamos el número de cheque si no es "pago_cheque"
      }
    }
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, ""); // Eliminar los puntos antes de procesar
    const formattedValue = formatNumber(value).toString(); // Asegurarte de que sea string
    setTransaction(
      (prev) => (prev ? { ...prev, monto: Number(value) } : prev) // Mantener el valor numérico sin formato
    );
    e.target.value = formattedValue; // Actualizar el input con el valor formateado
  };

  const isFormValid = () => {
    // Verifica si transaction y monto están definidos
    const isMontoValid =
      transaction?.monto !== undefined &&
      transaction?.monto !== null &&
      transaction?.monto > 0;

    // Verifica si la fecha no está vacía
    const isFechaValid = transaction?.fecha?.trim() !== "";

    // El cliente solo es obligatorio para ciertos tipos de transacción
    const isClienteValid = [
      "transferencia",
      "interdeposito",
      "pago_cheque",
    ].includes(transaction?.tipo || "")
      ? clienteOption === "nuevo"
        ? nuevoCliente.trim() !== ""
        : selectedClient !== null
      : true; // Para otros tipos de transacción, no es obligatorio

    const isBancoValid = selectedBank !== null;

    // El número de cheque es obligatorio si el tipo es pago_cheque
    const isChequeValid =
      transaction?.tipo === "pago_cheque"
        ? String(numeroCheque).trim() !== ""
        : true;

    // Retorna true si todas las condiciones son válidas
    return (
      isMontoValid &&
      isFechaValid &&
      isClienteValid &&
      isBancoValid &&
      isChequeValid
    );
  };

  const handleSubmit = () => {
    // Validar el formulario antes de enviar
    if (!isFormValid()) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (transaction) {
      const cliente = clienteOption === "nuevo" ? nuevoCliente : selectedClient;
      const updatedTransaction = {
        ...transaction,
        nombre_cliente: cliente
          ? clienteOption === "nuevo"
            ? nuevoCliente
            : `${selectedClient?.nombre} ${selectedClient?.apellido}`
          : "",
        banco_id: selectedBank?.banco_id || 0,
        cheque_id:
          transaction.tipo === "pago_cheque" ? transaction.cheque_id : null,
        numero_cheque:
          transaction.tipo === "pago_cheque" ? String(numeroCheque) : null, // Convertir a string si es pago_cheque
      };

      // Log para verificar los datos que se enviarán al backend
      console.log(
        "Datos a enviar al backend en handleSubmit:",
        updatedTransaction
      );

      if (!updatedTransaction.banco_id) {
        console.error("Banco no seleccionado");
        return;
      }

      // Asegúrate de que solo la transacción específica sea actualizada
      updateTransaction(updatedTransaction.transaccion_id, updatedTransaction)
        .then(() => {
          // Usa una función de actualización que NO sobrescriba todas las transacciones
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
                disabled // Esto hace que el campo sea solo visible pero no editable
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
                }
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
                <MenuItem value="pago_cheque">Pago con Cheque</MenuItem>
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
                type="text"
                name="monto"
                value={transaction.monto ? formatNumber(transaction.monto) : ""}
                onChange={handleMontoChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            {/* Mostrar los campos de cliente solo si es transferencia, interdeposito o pago_cheque */}
            {["interdeposito", "transferencia", "pago_cheque"].includes(
              transaction.tipo
            ) && (
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

            {/* Campo para el número de cheque si el tipo es pago_cheque */}
            {transaction.tipo === "pago_cheque" && (
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Número de Cheque"
                  type="number" // Tipo número
                  value={numeroCheque || ""}
                  onChange={(e) => setNumeroCheque(Number(e.target.value))}
                />
              </FormControl>
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
