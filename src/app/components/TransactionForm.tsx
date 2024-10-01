import React, { useState } from 'react';

interface Props {
  onSubmit: (data: any) => void;
  banks: string[];  // Pasamos la lista de bancos como propiedad
}

const TransactionForm: React.FC<Props> = ({ onSubmit, banks }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    cliente: '',
    tipo: 'transferencia',
    monto: 0,
    banco: banks[0] || '',  // Iniciamos con el primer banco de la lista o vacío
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);  // Pasamos los datos al manejador onSubmit
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
      <input type="text" name="cliente" placeholder="Cliente" value={formData.cliente} onChange={handleChange} />
      <select name="tipo" value={formData.tipo} onChange={handleChange}>
        <option value="transferencia">Transferencia</option>
        <option value="interdeposito">Interdepósito</option>
        <option value="impuesto">Impuesto</option>
        <option value="gasto">Gasto</option>
        <option value="cheque">Cheque</option>
      </select>
      <input type="number" name="monto" placeholder="Monto" value={formData.monto} onChange={handleChange} />
      <select name="banco" value={formData.banco} onChange={handleChange}>  {/* Select para bancos */}
        {banks.map((banco, index) => (
          <option key={index} value={banco}>{banco}</option>
        ))}
      </select>
      <button type="submit">Agregar Transacción</button>
    </form>
  );
};

export default TransactionForm;
