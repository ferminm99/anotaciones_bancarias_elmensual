import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Bank } from "../../types";
import { formatNumber } from "../../../utils/formatNumber";

interface EditBankButtonProps {
  onSubmit: (data: Bank) => void;
  bankToEdit: Bank | null;
  onClose: () => void;
}

const EditBankButton: React.FC<EditBankButtonProps> = ({
  onSubmit,
  bankToEdit,
  onClose,
}) => {
  const [bank, setBank] = useState<Bank | null>(null);
  const [newSaldoTotal, setNewSaldoTotal] = useState<number>(0);
  const [confirmChange, setConfirmChange] = useState<boolean>(false);

  useEffect(() => {
    if (bankToEdit) {
      setBank(bankToEdit);
      setNewSaldoTotal(bankToEdit.saldo_total || 0); // Guardamos el saldo numérico directamente
    }
  }, [bankToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBank((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Elimina todo lo que no sea número y convierte a número
    const value = e.target.value.replace(/\D/g, "");
    setNewSaldoTotal(Number(value)); // Guardamos el valor numérico sin formatear
  };

  const handleSubmit = () => {
    if (bank) {
      onSubmit({ ...bank, saldo_total: newSaldoTotal });
    }
  };

  const handleConfirmChange = () => {
    if (bank) {
      onSubmit({ ...bank, saldo_total: newSaldoTotal });
    }
    setConfirmChange(false);
  };

  return (
    <>
      <Dialog open={Boolean(bankToEdit)} onClose={onClose}>
        <DialogTitle>Editar Banco</DialogTitle>
        <DialogContent>
          {bank && (
            <>
              <TextField
                label="Nombre del Banco"
                type="text"
                name="nombre"
                value={bank.nombre}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Saldo Total"
                type="text" // Cambiamos a texto para permitir el formato
                value={formatNumber(newSaldoTotal.toString())} // Mostramos el saldo formateado
                onChange={handleSaldoChange} // Guardamos el valor numérico sin formatear
                fullWidth
                margin="normal"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} // Forzamos que solo acepte números
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Actualizar Banco
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para cambiar el saldo */}
      <Dialog open={confirmChange} onClose={() => setConfirmChange(false)}>
        <DialogTitle>Confirmar Cambio de Saldo</DialogTitle>
        <DialogContent>
          ¿Estás seguro que deseas cambiar el saldo total del banco?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmChange(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmChange}
            variant="contained"
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditBankButton;
