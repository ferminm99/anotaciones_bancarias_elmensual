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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { getClientes } from "../../services/api";
import { Bank, Cliente, Transaction, CreateTransaction } from "../../types";
import { formatNumber } from "../../../utils/formatNumber";

interface TransactionButtonProps {
  onSubmit: (data: Transaction) => void;
  banks: Bank[]; // Asegúrate de recibir un arreglo completo de Bank
  selectedBank?: Bank; // Esta es la prop para el banco preseleccionado
}

const TransactionButton: React.FC<TransactionButtonProps> = ({
  onSubmit,
  banks,
  selectedBank: initialSelectedBank, // Recibe el banco seleccionado desde las props
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(
    initialSelectedBank || null
  );
  const [nuevoCliente, setNuevoCliente] = useState<string>("");
  const [clienteOption, setClienteOption] = useState<string>("existente");
  const today = new Date().toISOString().split("T")[0]; // Obtén la fecha actual en formato 'YYYY-MM-DD'
  const [transaction, setTransaction] = useState<CreateTransaction>({
    cliente_id: null,
    banco_id: initialSelectedBank ? initialSelectedBank.banco_id : 0, // Inicializa con el ID del banco seleccionado
    fecha: today,
    monto: null,
    tipo: "",
  });

  useEffect(() => {
    getClientes()
      .then((response) => {
        setClientes(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar los clientes:", error);
      });
  }, []);

  useEffect(() => {
    setSelectedBank(initialSelectedBank || null);
    setTransaction((prev) => ({
      ...prev,
      banco_id: initialSelectedBank ? initialSelectedBank.banco_id : 0,
    }));
  }, [initialSelectedBank]);

  const isFormValid = () => {
    const isMontoValid = transaction.monto > 0;
    const isFechaValid = transaction.fecha.trim() !== "";

    // El cliente solo es obligatorio para transferencia o interdeposito
    const isClienteValid = ["transferencia", "interdeposito"].includes(
      transaction.tipo
    )
      ? clienteOption === "nuevo"
        ? nuevoCliente.trim() !== ""
        : selectedCliente !== null
      : true; // Para otros tipos de transacción, no es obligatorio

    const isBancoValid = selectedBank !== null;

    return isMontoValid && isFechaValid && isClienteValid && isBancoValid;
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, ""); // Eliminar los puntos antes de procesar
    const formattedValue = formatNumber(value).toString(); // Asegurarse de que sea string
    setTransaction(
      (prev) => (prev ? { ...prev, monto: Number(value) } : prev) // Mantener el valor numérico sin formato
    );
    e.target.value = formattedValue; // Actualizar el input con el valor formateado
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setTransaction({ ...transaction, [name as string]: value });
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    const dataToSubmit: Transaction = {
      transaccion_id: 0,
      fecha: transaction.fecha,
      cliente_id:
        clienteOption === "nuevo"
          ? null // Si es cliente nuevo, dejamos el cliente_id como null
          : selectedCliente?.cliente_id || null, // Si es cliente existente, mandamos el cliente_id
      nombre_cliente:
        clienteOption === "nuevo"
          ? nuevoCliente // Nombre del cliente nuevo
          : selectedCliente?.nombre || "", // Nombre del cliente existente
      tipo: transaction.tipo,
      monto: transaction.monto,
      banco_id: selectedBank?.banco_id || transaction.banco_id,
      nombre_banco: selectedBank?.nombre || "",
    };

    if (["transferencia", "interdeposito"].includes(transaction.tipo)) {
      if (dataToSubmit.cliente_id === null && clienteOption === "existente") {
        alert("Por favor, selecciona un cliente válido.");
        return;
      }
    }

    onSubmit(dataToSubmit);
    handleClose();
  };

  const handleClienteOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setClienteOption(e.target.value);
    setSelectedCliente(null);
    setNuevoCliente("");
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        AGREGAR TRANSACCIÓN
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nueva Transacción</DialogTitle>
        <DialogContent>
          {/* Autocomplete de Banco */}
          <FormControl fullWidth margin="normal">
            <Autocomplete
              options={banks}
              getOptionLabel={(option) => option.nombre || ""}
              value={selectedBank}
              onChange={(event, newValue) => setSelectedBank(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Banco"
                  placeholder="Seleccionar banco"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              )}
            />
          </FormControl>

          {/* Tipo de Transacción */}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="tipo-transaccion-label" shrink>
              Tipo de Transacción
            </InputLabel>
            <Select
              labelId="tipo-transaccion-label"
              id="tipo-transaccion"
              name="tipo" // Asegúrate de que el atributo `name` está aquí
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
            </Select>
          </FormControl>

          {/* Fecha */}
          <FormControl fullWidth margin="normal">
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              value={transaction.fecha}
              onChange={handleChange}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </FormControl>

          {/* Cliente existente o nuevo */}
          {/* Solo muestra el campo de cliente si no es retiro o depósito en efectivo o gastos de mantenimiento */}
          {![
            "retiro_efectivo",
            "deposito_efectivo",
            "gastos_mantenimiento",
          ].includes(transaction.tipo) && (
            <>
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">Cliente</FormLabel>
                <RadioGroup
                  row
                  value={clienteOption}
                  onChange={handleClienteOptionChange}
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
                    } // Combina nombre y apellido
                    value={selectedCliente}
                    onChange={(event, newValue) => setSelectedCliente(newValue)}
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
                    label="Nombre y apellido del nuevo cliente"
                    value={nuevoCliente}
                    onChange={(e) => setNuevoCliente(e.target.value)}
                  />
                </FormControl>
              )}
            </>
          )}

          {/* Monto */}
          <FormControl fullWidth margin="normal">
            <TextField
              label="Monto"
              type="text" // Cambiar a `text` para poder mostrar los puntos
              name="monto"
              value={transaction.monto ? formatNumber(transaction.monto) : ""} // Formatear el valor
              onChange={handleMontoChange} // Usar el nuevo handler
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            CANCELAR
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            AGREGAR TRANSACCIÓN
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TransactionButton;
