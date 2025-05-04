// src/lib/CacheContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import {
  getTransactions,
  getTransactionsChanges,
  getBanks,
  getBanksChanges,
  getClientes,
  getClientesChanges,
  getCheques,
  getChequesChanges,
} from "../app/services/api";
import type {
  Transaction as AppTransaction,
  Bank as AppBank,
  Cliente as AppCliente,
  Cheque as AppCheque,
} from "../app/types";

// 1) Define los tipos cache para cada recurso, con updated_at
export interface CacheTransaction extends AppTransaction {
  updated_at: string;
}
export interface CacheBank extends AppBank {
  updated_at: string;
}
export interface CacheCliente extends AppCliente {
  updated_at: string;
}
export interface CacheCheque extends AppCheque {
  updated_at: string;
}

// 2) Mapeo de nombre de recurso a su tipo
type ResourceMap = {
  transactions: CacheTransaction;
  banks: CacheBank;
  clients: CacheCliente;
  cheques: CacheCheque;
};
type ResourceKey = keyof ResourceMap;

// 3) Entrada de mapa: funciones y setter para cada tipo T
interface MapEntry<T> {
  setter: Dispatch<SetStateAction<T[]>>;
  listFn: () => Promise<{ data: T[] }>;
  changesFn: (since: string) => Promise<{ data: T[] }>;
  keyField: keyof T;
}

// 4) Estado que exponemos
interface CacheState {
  transactions: CacheTransaction[];
  banks: CacheBank[];
  clients: CacheCliente[];
  cheques: CacheCheque[];
  lastSync: string;
  syncAll: () => Promise<void>;
  syncBanks: () => Promise<void>;
  syncClients: () => Promise<void>;
  setTransactions: Dispatch<SetStateAction<CacheTransaction[]>>;
  setBanks: Dispatch<SetStateAction<CacheBank[]>>;
  setClients: Dispatch<SetStateAction<CacheCliente[]>>;
  setCheques: Dispatch<SetStateAction<CacheCheque[]>>;
}

const CacheContext = createContext<CacheState | null>(null);

export const CacheProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 5) Estados internos
  const [transactions, setTransactions] = useState<CacheTransaction[]>([]);
  const [banks, setBanks] = useState<CacheBank[]>([]);
  const [clients, setClients] = useState<CacheCliente[]>([]);
  const [cheques, setCheques] = useState<CacheCheque[]>([]);
  const [lastSync, setLastSync] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  // 6) Hydrate desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log("[Cache] Hydrating from localStorage…");

    const ls = localStorage.getItem("cache.lastSync");
    if (ls) {
      console.log("[Cache] loaded lastSync =", ls);
      setLastSync(ls);
    }

    const loadKey = <T,>(
      key: string,
      setter: Dispatch<SetStateAction<T[]>>
    ) => {
      const v = localStorage.getItem(key);
      if (v) {
        const arr = JSON.parse(v) as T[];
        console.log(`[Cache] restored ${key} (${arr.length} items)`);
        setter(arr);
      }
    };

    loadKey<CacheTransaction>("cache.transactions", setTransactions);
    loadKey<CacheBank>("cache.banks", setBanks);
    loadKey<CacheCliente>("cache.clients", setClients);
    loadKey<CacheCheque>("cache.cheques", setCheques);

    setHydrated(true);
    console.log("[Cache] hydration complete");
  }, []);

  // 7) Helper genérico para lista completa o cambios
  async function fetchItems<T>(
    listFn: () => Promise<{ data: T[] }>,
    changesFn: (since: string) => Promise<{ data: T[] }>,
    since: string
  ): Promise<T[]> {
    if (!since) {
      console.log("[Cache] doing full list");
      return (await listFn()).data;
    } else {
      console.log(`[Cache] doing delta list since=${since}`);
      return (await changesFn(since)).data;
    }
  }

  // 8) Mapeo explícito del ResourceMap
  const mapping: { [K in ResourceKey]: MapEntry<ResourceMap[K]> } = {
    transactions: {
      setter: setTransactions,
      listFn: getTransactions,
      changesFn: getTransactionsChanges,
      keyField: "transaccion_id",
    },
    banks: {
      setter: setBanks,
      listFn: getBanks,
      changesFn: getBanksChanges,
      keyField: "banco_id",
    },
    clients: {
      setter: setClients,
      listFn: getClientes,
      changesFn: getClientesChanges,
      keyField: "cliente_id",
    },
    cheques: {
      setter: setCheques,
      listFn: getCheques,
      changesFn: getChequesChanges,
      keyField: "cheque_id",
    },
  };

  // 9) Función central de sincronización
  async function doSync<K extends ResourceKey>(keys: K[]) {
    console.log(`[Cache] doSync start for [${keys.join(", ")}]`);
    const dates: string[] = [];

    for (const key of keys) {
      const { setter, listFn, changesFn, keyField } = mapping[key];
      console.log(`[Cache] syncing "${key}"…`);

      let newItems: ResourceMap[K][];
      try {
        newItems = await fetchItems<ResourceMap[K]>(
          listFn,
          changesFn,
          lastSync
        );
      } catch {
        console.warn(`[Cache] skip "${key}" due to fetch error`);
        continue;
      }

      console.log(`[Cache] fetched ${newItems.length} new items for "${key}"`);

      setter((old) => {
        // 9.1) filtramos los viejos que no están en newItems
        const filteredOld = old as ResourceMap[K][];
        const merged = [
          ...filteredOld.filter(
            (o) => !newItems.some((n) => n[keyField] === o[keyField])
          ),
          ...newItems,
        ];
        // 9.2) dedupe por keyField
        const deduped = Array.from(
          new Map(merged.map((item) => [item[keyField], item])).values()
        ) as ResourceMap[K][];
        return deduped;
      });

      newItems.forEach((i) => {
        if (i.updated_at) dates.push(i.updated_at);
      });
    }

    if (dates.length > 0) {
      const newest = dates.sort().pop()!;
      console.log("[Cache] updating lastSync →", newest);
      setLastSync(newest);
    } else {
      console.log("[Cache] no new items, lastSync stays", lastSync);
    }
  }

  // 10) Exponemos sólo lo que necesita cada página
  const syncAll = async () => {
    console.log("[Cache] syncAll called");
    await doSync(["transactions", "banks", "clients", "cheques"]);
  };
  const syncBanks = async () => {
    console.log("[Cache] syncBanks called");
    await doSync(["banks"]);
  };
  const syncClients = async () => {
    console.log("[Cache] syncClients called");
    await doSync(["clients"]);
  };

  // 11) Auto‐sync inicial + cada 24h
  useEffect(() => {
    if (!hydrated) return;
    console.log("[Cache] starting initial syncAll");
    syncAll().catch((e) => console.error("[Cache] syncAll error (initial)", e));
    const iv = setInterval(() => {
      console.log("[Cache] interval syncAll");
      syncAll().catch((e) =>
        console.error("[Cache] syncAll error (interval)", e)
      );
    }, 24 * 3600 * 1000);
    return () => clearInterval(iv);
  }, [hydrated, syncAll]);

  // 12) Persist en localStorage tras cualquier cambio
  useEffect(() => {
    if (!hydrated) return;
    console.log("[Cache] persisting to localStorage");
    localStorage.setItem("cache.lastSync", lastSync);
    localStorage.setItem("cache.transactions", JSON.stringify(transactions));
    localStorage.setItem("cache.banks", JSON.stringify(banks));
    localStorage.setItem("cache.clients", JSON.stringify(clients));
    localStorage.setItem("cache.cheques", JSON.stringify(cheques));
  }, [hydrated, lastSync, transactions, banks, clients, cheques]);

  return (
    <CacheContext.Provider
      value={{
        transactions,
        banks,
        clients,
        cheques,
        lastSync,
        syncAll,
        syncBanks,
        syncClients,
        setTransactions,
        setBanks,
        setClients,
        setCheques,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export function useCache(): CacheState {
  const ctx = useContext(CacheContext);
  if (!ctx) throw new Error("useCache debe usarse dentro de <CacheProvider>");
  return ctx;
}
