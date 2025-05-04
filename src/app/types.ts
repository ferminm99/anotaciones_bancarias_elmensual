// src/app/types.ts

export interface Transaction {
  transaccion_id: number;
  fecha: string;
  cliente_id: number | null;
  nombre_cliente: string | null;
  tipo: string;
  monto: number | null;
  banco_id: number;
  cheque_id: number | null;
  nombre_banco: string;
  numero_cheque?: string | null;
  updated_at: string;
}

export interface CreateTransaction {
  fecha: string;
  cliente_id: number | null;
  nombre_cliente?: string;
  tipo: string;
  monto: number | null;
  banco_id: number;
  numero_cheque: string | null;
  updated_at?: string;
}

export interface Bank {
  banco_id: number;
  nombre: string;
  saldo_total: number;
  updated_at: string;
}

export interface Cliente {
  cliente_id: number;
  nombre: string;
  apellido: string | null;
  updated_at: string;
}

export interface Cheque {
  cheque_id: number;
  numero: number;
  updated_at: string;
}
