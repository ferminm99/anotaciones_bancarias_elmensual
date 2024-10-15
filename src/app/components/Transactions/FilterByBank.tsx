import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Bank } from "@/app/types"; // Asegúrate de que la ruta es correcta
import { formatNumber } from "../../../utils/formatNumber";

interface Props {
  banks: Bank[]; // Lista de bancos
  onFilter: (banco: Bank | null) => void; // Permitir null
  totalSaldo: number;
}

const FilterByBank: React.FC<Props> = ({ banks, onFilter, totalSaldo }) => {
  const handleChange = (e: SelectChangeEvent<string>) => {
    const selectedBanco = banks.find(
      (banco) => banco.nombre === e.target.value
    );
    console.log(totalSaldo);
    onFilter(selectedBanco || null); // Pasamos el objeto Bank completo o null
  };

  return (
    <FormControl variant="outlined" sx={{ minWidth: 200 }} size="small">
      <InputLabel>Filtrar por banco</InputLabel>
      <Select label="Filtrar por banco" onChange={handleChange} defaultValue="">
        <MenuItem value="">
          <em>Todos los bancos</em>
        </MenuItem>
        {banks.map((banco, index) => (
          <MenuItem key={index} value={banco.nombre}>
            {banco.nombre} (Saldo: {formatNumber(parseFloat(banco.saldo_total))}
            )
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterByBank;
