
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Transaction } from '../types';

interface Props {  // Definimos qué tipo de datos espera recibir el componente como propiedades
  transactions: Transaction[];
}

const TransactionTable: React.FC<{ transactions: Transaction[], onEdit: (transaction: Transaction) => void, onDelete: (id: number) => void }> = ({ transactions, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Monto</TableCell>
            <TableCell>Banco</TableCell>
            <TableCell>Acciones</TableCell> {/* Nueva columna para las acciones */}
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.transaccion_id}>
              <TableCell>{transaction.fecha}</TableCell>
              <TableCell>{transaction.nombre_cliente || 'Sin cliente'}</TableCell>
              <TableCell>{transaction.tipo === 'impuesto' ? `impuesto - ${transaction.tipo_impuesto}` : transaction.tipo === 'cheque' ? `cheque - Número: ${transaction.numero_cheque}` : transaction.tipo}</TableCell>
              <TableCell>{transaction.monto}</TableCell>
              <TableCell>{transaction.nombre_banco}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(transaction)} aria-label="edit">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(transaction.transaccion_id)} aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionTable;