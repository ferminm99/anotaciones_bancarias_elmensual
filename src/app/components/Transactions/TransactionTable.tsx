import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Transaction } from "../../types";
import { formatNumber } from "../../../utils/formatNumber";

const TransactionTable: React.FC<{
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}> = ({ transactions, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} className="shadow-lg rounded-lg">
      <Table className="table-auto min-w-full divide-y divide-gray-200">
        <TableHead className="bg-gray-100">
          <TableRow>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Banco
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <TableRow key={transaction.transaccion_id}>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {new Date(transaction.fecha).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {transaction.nombre_cliente || " - "}
              </TableCell>
              <TableCell
                className={`px-6 py-4 whitespace-nowrap ${
                  transaction.tipo === "cheque_deposito" ||
                  transaction.tipo === "deposito_efectivo" ||
                  transaction.tipo === "interdeposito"
                    ? "text-green-500"
                    : transaction.tipo === "transferencia"
                    ? "text-red-500"
                    : transaction.tipo === "retiro_cheque"
                    ? "text-blue-500"
                    : transaction.tipo === "impuesto" ||
                      transaction.tipo === "gastos_mantenimiento" ||
                      transaction.tipo === "retiro_efectivo"
                    ? "text-red-500" // Diferente tono de rojo
                    : ""
                }`}
              >
                {transaction.tipo}
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                {transaction.monto !== null
                  ? formatNumber(transaction.monto)
                  : "-"}
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                {transaction.nombre_banco}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <IconButton
                  onClick={() => onEdit(transaction)}
                  aria-label="edit"
                  className="text-gray-500 hover:text-blue-500"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(transaction.transaccion_id)}
                  aria-label="delete"
                  className="text-gray-500 hover:text-red-500"
                >
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
