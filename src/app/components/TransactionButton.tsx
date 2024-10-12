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
import { getClientes, getBanks } from "../services/api";
import { Bank, Cliente, Transaction, CreateTransaction } from "../types";

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

  const [transaction, setTransaction] = useState<CreateTransaction>({
    cliente_id: null,
    banco_id: initialSelectedBank ? initialSelectedBank.banco_id : 0, // Inicializa con el ID del banco seleccionado
    fecha: "",
    monto: 0,
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

  const isFormValid = () => {
    const isMontoValid = transaction.monto > 0;
    const isFechaValid = transaction.fecha.trim() !== "";
    const isClienteValid =
      clienteOption === "nuevo"
        ? nuevoCliente.trim() !== ""
        : selectedCliente !== null;
    const isBancoValid = selectedBank !== null;

    return isMontoValid && isFechaValid && isClienteValid && isBancoValid;
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

    // Definir dataToSubmit para que coincida con la interfaz Transaction
    const dataToSubmit: Transaction = {
      transaccion_id: 0, // El ID se generará en el backend
      fecha: transaction.fecha,
      cliente_id:
        clienteOption === "nuevo"
          ? null // Si es un cliente nuevo, lo dejamos como null (hasta que se cree en backend)
          : selectedCliente?.cliente_id || null, // Si es un cliente existente, asignamos el cliente_id
      nombre_cliente:
        clienteOption === "nuevo"
          ? nuevoCliente // Si es un cliente nuevo, usamos el nombre ingresado
          : selectedCliente?.nombre || "", // Si es un cliente existente, usamos el nombre
      tipo: transaction.tipo,
      monto: transaction.monto,
      banco_id: selectedBank?.banco_id || transaction.banco_id, // Usamos el banco seleccionado
      nombre_banco: selectedBank?.nombre || "", // Usamos el nombre del banco seleccionado
    };

    if (dataToSubmit.cliente_id === null && clienteOption === "existente") {
      alert("Por favor, selecciona un cliente válido.");
      return;
    }

    onSubmit(dataToSubmit); // Ahora el formato debería coincidir con la interfaz Transaction
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
              onChange={(e) => handleChange(e as React.ChangeEvent<any>)}
              label="Tipo de Transacción"
            >
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="deposito_efectivo">
                Depósito en Efectivo
              </MenuItem>
              <MenuItem value="interdeposito">Interdepósito</MenuItem>
              <MenuItem value="retiro_efectivo">Retiro en Efectivo</MenuItem>
              <MenuItem value="gastos_mantenimiento">
                Gastos de Mantenimiento
              </MenuItem>
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
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>

          {/* Cliente existente o nuevo */}
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
                  getOptionLabel={(option) => option.nombre}
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
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </FormControl>

          {/* Monto */}
          <FormControl fullWidth margin="normal">
            <TextField
              label="Monto"
              type="number"
              name="monto"
              value={transaction.monto ?? ""}
              onChange={handleChange}
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
