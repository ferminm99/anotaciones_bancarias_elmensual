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
  const [numeroCheque, setNumeroCheque] = useState<string>(""); // Nuevo estado para número de cheque
  const today = new Date().toISOString().split("T")[0]; // Obtén la fecha actual en formato 'YYYY-MM-DD'
  const [transaction, setTransaction] = useState<CreateTransaction>({
    cliente_id: null,
    banco_id: initialSelectedBank ? initialSelectedBank.banco_id : 0, // Inicializa con el ID del banco seleccionado
    fecha: today,
    monto: null,
    tipo: "",
    cheque_id: null, // Añadimos cheque_id inicializado en null
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
    const isMontoValid = transaction.monto !== null && transaction.monto > 0;
    const isFechaValid = transaction.fecha.trim() !== "";

    // El cliente solo es obligatorio para transferencia, interdeposito y pago_cheque
    const isClienteValid = [
      "transferencia",
      "interdeposito",
      "pago_cheque",
    ].includes(transaction.tipo)
      ? clienteOption === "nuevo"
        ? nuevoCliente.trim() !== ""
        : selectedCliente !== null
      : true; // Para otros tipos de transacción, no es obligatorio

    const isBancoValid = selectedBank !== null;

    // El número de cheque es obligatorio si el tipo es pago_cheque
    const isChequeValid =
      transaction.tipo === "pago_cheque" ? numeroCheque.trim() !== "" : true;

    return (
      isMontoValid &&
      isFechaValid &&
      isClienteValid &&
      isBancoValid &&
      isChequeValid
    );
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

    // Actualizar el tipo de transacción
    setTransaction((prev) => ({ ...prev, [name as string]: value }));

    // Si el campo que cambió es "tipo", limpiamos el cliente si no es "interdeposito", "transferencia" o "pago_cheque"
    if (name === "tipo") {
      if (
        !["interdeposito", "transferencia", "pago_cheque"].includes(
          value as string
        )
      ) {
        setSelectedCliente(null);
        setNuevoCliente("");
      }
    }
  };

  const resetForm = () => {
    setTransaction({
      cliente_id: null,
      banco_id: transaction.banco_id, // Mantener el banco seleccionado
      fecha: today,
      monto: null,
      tipo: "", // Reiniciar tipo de transacción
      cheque_id: null, // Reiniciamos cheque_id a null
    });
    setSelectedCliente(null); // Reiniciar cliente seleccionado
    setNuevoCliente(""); // Reiniciar nuevo cliente
    setNumeroCheque(""); // Reiniciar número de cheque
    setClienteOption("existente"); // Volver a la opción de cliente existente por defecto
    setSelectedBank(initialSelectedBank || null); // Reiniciar banco seleccionado
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    // Crear una transacción con las propiedades faltantes
    const dataToSubmit: Transaction = {
      transaccion_id: 0, // Agregamos un ID predeterminado (en el backend se generará el real)
      fecha: transaction.fecha,
      cliente_id:
        clienteOption === "nuevo" ? null : selectedCliente?.cliente_id || null,
      nombre_cliente:
        clienteOption === "nuevo"
          ? nuevoCliente
          : selectedCliente?.nombre || "", // Asegúrate de incluir nombre_cliente
      tipo: transaction.tipo,
      monto: transaction.monto,
      banco_id: selectedBank?.banco_id || transaction.banco_id,
      nombre_banco: selectedBank?.nombre || "", // Asegúrate de incluir nombre_banco
      cheque_id:
        transaction.tipo === "pago_cheque"
          ? Number(numeroCheque) || null
          : null,
    };

    // Verificación adicional para tipos de transacción específicos
    if (
      ["transferencia", "interdeposito", "pago_cheque"].includes(
        transaction.tipo
      )
    ) {
      if (dataToSubmit.cliente_id === null && clienteOption === "existente") {
        alert("Por favor, selecciona un cliente válido.");
        return;
      }
    }

    onSubmit(dataToSubmit); // Aquí envías un objeto completo de tipo `Transaction`
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
    resetForm(); // Reiniciar el formulario después del envío
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
              <MenuItem value="pago_cheque">Pago con Cheque</MenuItem>
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
          {/* Solo muestra el campo de cliente si es interdeposito, transferencia o pago_cheque */}
          {["interdeposito", "transferencia", "pago_cheque"].includes(
            transaction.tipo
          ) && (
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

          {/* Campo para el número de cheque si el tipo es pago_cheque */}
          {transaction.tipo === "pago_cheque" && (
            <FormControl fullWidth margin="normal">
              <TextField
                label="Número de Cheque"
                value={numeroCheque}
                onChange={(e) => setNumeroCheque(e.target.value)}
              />
            </FormControl>
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
