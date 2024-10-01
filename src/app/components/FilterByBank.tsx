import React from 'react';

interface Props {
  banks: { nombre: string, saldo_total: number }[];  // Lista de bancos con saldo
  onFilter: (banco: string) => void;  // Función que se llamará cuando se seleccione un banco
  totalSaldo: number;  // Saldo total de todos los bancos
}

const FilterByBank: React.FC<Props> = ({ banks, onFilter, totalSaldo }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilter(e.target.value);  // Pasamos el valor seleccionado al manejador
  };

  return (
    <div>
      <label>Saldo total: {totalSaldo}</label> {/* Mostrar el saldo total */}
      <select onChange={handleChange}>
        <option value="">Todos los bancos (Saldo total: {totalSaldo})</option> {/* Opción para ver todas las transacciones */}
        {banks.map((banco, index) => (
          <option key={index} value={banco.nombre}>{banco.nombre} (Saldo: {banco.saldo_total})</option>
        ))}
      </select>
    </div>
  );
};

export default FilterByBank;
