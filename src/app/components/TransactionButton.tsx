<<<<<<< HEAD
import React, { useState } from "react";
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
} from "@mui/material";

interface TransactionButtonProps {
  onSubmit: (data: any) => void;
  banks: string[];
}

const TransactionButton: React.FC<TransactionButtonProps> = ({
  onSubmit,
  banks,
}) => {
  const [open, setOpen] = useState(false);
  const [openChequeDialog, setOpenChequeDialog] = useState(false); // Estado para abrir/cerrar el diálogo de cheque
  const [transaction, setTransaction] = useState({
    tipo: "transferencia", // Primero aparece el tipo
    fecha: new Date().toISOString().split("T")[0], // Fecha toma el valor de hoy
    cliente: "",
    monto: "",
    banco: banks[0] || "",
    tipoImpuesto: "", // Para el caso de "impuesto"
    numeroCheque: "", // Para el caso de "cheque"
    fechaCheque: "", // Para el caso de "cheque"
    importeCheque: "", // Para el caso de "cheque"
    tipoCheque: "fisico", // eCheq o físico
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChequeDialogOpen = () => {
    setOpenChequeDialog(true);
  };

  const handleChequeDialogClose = () => {
    setOpenChequeDialog(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    setTransaction({ ...transaction, [e.target.name!]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(transaction);
    handleClose(); // Cierra el modal al agregar la transacción
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        AGREGAR TRANSACCIÓN
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nueva Transacción</DialogTitle>
        <DialogContent>
          {/* Orden ajustado: Primero el tipo de transacción */}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="tipo-transaccion-label" shrink>
              Tipo de Transacción
            </InputLabel>
            <Select
              labelId="tipo-transaccion-label"
              id="tipo-transaccion"
              name="tipo"
              value={transaction.tipo}
              onChange={handleChange}
              label="Tipo de Transacción"
            >
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="impuesto">Impuesto</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="interdeposito">Interdepósito</MenuItem>
            </Select>
          </FormControl>

          {/* Luego la fecha */}
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

          {/* Mostrar cliente solo si el tipo no es "impuesto" */}
          {transaction.tipo !== "impuesto" && (
            <FormControl fullWidth margin="normal">
              <TextField
                label="Cliente"
                name="cliente"
                value={transaction.cliente}
                onChange={handleChange}
              />
            </FormControl>
          )}

          {/* Luego el banco */}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="banco-label" shrink>
              Banco
            </InputLabel>
            <Select
              labelId="banco-label"
              name="banco"
              value={transaction.banco}
              onChange={handleChange}
              label="Banco"
            >
              {banks.map((bank, index) => (
                <MenuItem key={index} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Mostrar campo adicional si el tipo es "impuesto" */}
          {transaction.tipo === "impuesto" && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="tipo-impuesto-label" shrink>
                Tipo de Impuesto
              </InputLabel>
              <Select
                labelId="tipo-impuesto-label"
                name="tipoImpuesto"
                value={transaction.tipoImpuesto}
                onChange={handleChange}
                label="Tipo de Impuesto"
              >
                <MenuItem value="credito">Crédito</MenuItem>
                <MenuItem value="debito">Débito</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Mostrar botón para agregar detalles del cheque si el tipo es "cheque" */}
          {transaction.tipo === "cheque" && (
            <FormControl fullWidth margin="normal">
              <Button variant="outlined" onClick={handleChequeDialogOpen}>
                Agregar Detalles del Cheque
              </Button>
            </FormControl>
          )}

          {/* Luego el monto */}
          <FormControl fullWidth margin="normal">
            <TextField
              label="Monto"
              type="number"
              name="monto"
              value={transaction.monto}
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

      {/* Dialogo del Cheque */}
      <Dialog open={openChequeDialog} onClose={handleChequeDialogClose}>
        <DialogTitle>Detalles del Cheque</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Número del Cheque"
              type="text"
              name="numeroCheque"
              value={transaction.numeroCheque}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Fecha del Cheque"
              type="date"
              name="fechaCheque"
              value={transaction.fechaCheque}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Importe del Cheque"
              type="number"
              name="importeCheque"
              value={transaction.importeCheque}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="tipo-cheque-label" shrink>
              Tipo de Cheque
            </InputLabel>
            <Select
              labelId="tipo-cheque-label"
              name="tipoCheque"
              value={transaction.tipoCheque}
              onChange={handleChange}
              label="Tipo de Cheque"
            >
              <MenuItem value="fisico">Físico</MenuItem>
              <MenuItem value="echeq">eCheq</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChequeDialogClose} color="secondary">
            CANCELAR
          </Button>
          <Button
            onClick={handleChequeDialogClose}
            variant="contained"
            color="primary"
          >
            AGREGAR DETALLES DEL CHEQUE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TransactionButton;
=======
import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import TransactionForm from '../components/TransactionForm';

const AddTransactionButton: React.FC<{ onSubmit: (data: any) => void, banks: string[] }> = ({ onSubmit, banks }) => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleClickOpen}>
                Agregar Transacción
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Agregar Nueva Transacción</DialogTitle>
                <DialogContent>
                    <TransactionForm onSubmit={onSubmit} banks={banks} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddTransactionButton;
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
