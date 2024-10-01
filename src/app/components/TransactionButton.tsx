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
