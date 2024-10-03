import React, { useState, useEffect } from "react";
import { Cliente, Transaction, CreateTransaction } from "../types"; // Asegúrate de que estas interfaces están bien definidas

interface Props {
  onSubmit: (data: Omit<Transaction, "id">) => void;
  banks: { banco_id: number; nombre: string }[]; // Cambiamos para usar banco_id y nombre
}

const TransactionForm: React.FC<Props> = ({ onSubmit, banks }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]); // Para almacenar los clientes del backend
  const [cliente, setCliente] = useState<Cliente | null>(null); // Cliente seleccionado
  const [fecha, setFecha] = useState<string>(""); // Fecha en string por simplicidad
  const [monto, setMonto] = useState<number>(0); // Monto de la transacción
  const [tipo, setTipo] = useState<string>("transferencia"); // Tipo de transacción
  const [bancoId, setBancoId] = useState<number | null>(null); // Banco seleccionado (usamos banco_id)
  const [tipoImpuesto, setTipoImpuesto] = useState<string | null>(null); // Si es un impuesto

  // Obtener los clientes del backend
  useEffect(() => {
    // Aquí harías la llamada a la API para obtener los clientes
    fetch("/api/clientes")
      .then((response) => response.json())
      .then((data: Cliente[]) => setClientes(data))
      .catch((error) => console.error("Error al cargar los clientes:", error));
  }, []);

  // Manejar el cambio de cliente
  const handleClientChange = (newValue: Cliente | null) => {
    if (typeof newValue === "string") {
      console.error("El valor seleccionado no es un cliente válido.");
      return;
    }
    setCliente(newValue);
  };

  // Manejar el cambio de monto y convertir a número
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedMonto = value ? parseFloat(value) : 0;
    setMonto(parsedMonto);
  };

  const handleSubmit = () => {
    if (bancoId === null) {
      alert("Por favor, selecciona un banco");
      return;
    }

    const data: CreateTransaction = {
      fecha,
      cliente_id: cliente ? cliente.id : null,
      monto,
      tipo,
      banco_id: bancoId,
      tipo_impuesto: tipo === "impuesto" ? tipoImpuesto : null,
    };

    onSubmit(data);
  };

  return (
    <div>
      <h3>Agregar Nueva Transacción</h3>
      <div>
        {/* Fecha */}
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          placeholder="dd/mm/aaaa"
        />
      </div>

      {/* Selección de cliente con búsqueda */}
      <div>
        <select
          value={cliente ? cliente.id : ""}
          onChange={(e) =>
            handleClientChange(
              clientes.find((c) => c.id === parseInt(e.target.value)) || null
            )
          }
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {`${c.nombre} ${c.apellido}`}
            </option>
          ))}
        </select>
      </div>

      {/* Monto */}
      <div>
        <input
          type="number"
          value={monto}
          onChange={handleMontoChange}
          placeholder="Monto"
        />
      </div>

      {/* Tipo de transacción */}
      <div>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="transferencia">Transferencia</option>
          <option value="interdeposito">Interdepósito</option>
          <option value="impuesto">Impuesto</option>
          <option value="cheque">Cheque</option>
        </select>
      </div>

      {/* Si el tipo es impuesto, mostrar tipoImpuesto */}
      {tipo === "impuesto" && (
        <div>
          <input
            type="text"
            value={tipoImpuesto || ""}
            onChange={(e) => setTipoImpuesto(e.target.value)}
            placeholder="Tipo de Impuesto"
          />
        </div>
      )}

      {/* Selección de banco */}
      <div>
        <select
          value={bancoId || ""}
          onChange={(e) => setBancoId(parseInt(e.target.value))}
        >
          <option value="">Seleccione un banco</option>
          {banks.map((banco) => (
            <option key={banco.banco_id} value={banco.banco_id}>
              {banco.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Botón de enviar */}
      <button onClick={handleSubmit}>Agregar Transacción</button>
    </div>
  );
};

export default TransactionForm;
