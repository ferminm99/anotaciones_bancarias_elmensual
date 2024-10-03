// Definimos las interfaces de las entidades que usamos en la aplicación

export interface Transaction {
<<<<<<< HEAD
  transaccion_id: number;
  fecha: string;
  cliente_id: number | null;
  nombre_cliente: string | null;
  tipo: string;
  monto: number;
  banco_id: number;
  nombre_banco: string;
  tipo_impuesto: string | null; // Puede ser null si no es un impuesto
  numero_cheque: string | null; // Puede ser null si no es un cheque
}

export interface CreateTransaction {
  fecha: string;
  cliente_id: number | null;
  monto: number;
  tipo: string;
  banco_id: number;
  tipo_impuesto?: string | null;
}

export interface Bank {
  // Interfaz de un banco
  banco_id: number;
  nombre: string;
  saldo_total: string;
}

export interface Cheque {
  // Interfaz de un cheque
  cheque_id: number;
  numero: number;
  fecha: string;
  importe: number;
  proveedor: string;
  tipo_cheque: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
=======
    transaccion_id: number;
    fecha: Date;
    cliente_id: number | null;
    nombre_cliente: string | null;
    tipo: string;
    monto: number;
    banco_id: number;
    nombre_banco: string;
    tipo_impuesto: string | null;  // Puede ser null si no es un impuesto
    numero_cheque: string | null;  // Puede ser null si no es un cheque
}


export interface Bank {  // Interfaz de un banco
    banco_id: number;
    nombre: string;
    saldo_total: string;
}

export interface Cheque {  // Interfaz de un banco
    cheque_id: number;
    numero: number;
    fecha: Date;
    importe: number;
    proveedor: string;
    tipo_cheque: string;
>>>>>>> 3ddb46693015467a282fdfebc25ba762bc92e045
}
