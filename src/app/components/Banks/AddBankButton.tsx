import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { formatNumber } from "../../../utils/formatNumber";

interface AddBankButtonProps {
  onSubmit: (data: { nombre: string; saldo_total: number }) => void;
}

const AddBankButton: React.FC<AddBankButtonProps> = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState<string>("");
  const [saldoTotal, setSaldoTotal] = useState<number>(0); // Mantiene el valor numérico directamente

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setNombre("");
    setSaldoTotal(0);
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Eliminamos cualquier carácter que no sea un número
    const value = e.target.value.replace(/\D/g, "");

    // Convertimos el valor a número, y si está vacío, lo mantenemos como 0
    setSaldoTotal(value ? Number(value) : 0);
  };

  const handleSubmit = () => {
    if (!nombre || saldoTotal <= 0) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Enviamos el valor numérico directamente
    onSubmit({ nombre, saldo_total: saldoTotal });
    handleClose();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Agregar Banco
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nuevo Banco</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Banco"
            type="text"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Saldo Inicial"
            type="text" // Cambiado a texto para formatear la visualización
            fullWidth
            value={formatNumber(saldoTotal.toString())} // Formateamos solo al mostrar
            onChange={handleMontoChange}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} // Solo acepta números
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddBankButton;
