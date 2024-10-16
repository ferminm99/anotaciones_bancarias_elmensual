// Definimos las interfaces de las entidades que usamos en la aplicación

export interface Transaction {
  transaccion_id: number;
  fecha: string;
  cliente_id: number | null;
  nombre_cliente: string | null;
  tipo: string;
  monto: number | null;
  banco_id: number;
  nombre_banco: string;
}

export interface CreateTransaction {
  fecha: string;
  cliente_id: number | null;
  monto: number | null;
  tipo: string;
  banco_id: number;
}

export interface Bank {
  banco_id: number;
  nombre: string;
  saldo_total: string;
}

export interface Cliente {
  cliente_id: number;
  nombre: string;
  apellido: string;
}
