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

type ResourceKey = "transactions" | "banks" | "clients" | "cheques";

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
  const [transactions, setTransactions] = useState<CacheTransaction[]>([]);
  const [banks, setBanks] = useState<CacheBank[]>([]);
  const [clients, setClients] = useState<CacheCliente[]>([]);
  const [cheques, setCheques] = useState<CacheCheque[]>([]);
  const [lastSync, setLastSync] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  // 1) Hydrate desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log("[Cache] Hydrating from localStorage…");
    const ls = localStorage.getItem("cache.lastSync");
    if (ls) {
      console.log("[Cache] loaded lastSync =", ls);
      setLastSync(ls);
    }

    const load = <T,>(key: string, setter: Dispatch<SetStateAction<T[]>>) => {
      const v = localStorage.getItem(key);
      if (v) {
        const arr = JSON.parse(v) as T[];
        console.log(`[Cache] restored ${key} (${arr.length} items)`);
        setter(arr);
      }
    };
    load<CacheTransaction>("cache.transactions", setTransactions);
    load<CacheBank>("cache.banks", setBanks);
    load<CacheCliente>("cache.clients", setClients);
    load<CacheCheque>("cache.cheques", setCheques);

    setHydrated(true);
    console.log("[Cache] hydration complete");
  }, []);

  // Helper genérico
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

  // Mapeo de recursos tipado
  interface MapEntry<T> {
    setter: Dispatch<SetStateAction<T[]>>;
    listFn: () => Promise<{ data: T[] }>;
    changesFn: (since: string) => Promise<{ data: T[] }>;
    keyField: keyof T;
  }
  const mapping: Record<ResourceKey, MapEntry<any>> = {
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

  // Core de sincronización
  async function doSync(keys: ResourceKey[]) {
    console.log(`[Cache] doSync start for [${keys.join(", ")}]`);
    const dates: string[] = [];

    for (const key of keys) {
      const { setter, listFn, changesFn, keyField } = mapping[key];
      console.log(`[Cache] syncing "${key}"…`);
      let newItems: unknown[];
      try {
        newItems = await fetchItems(listFn, changesFn, lastSync);
      } catch {
        console.warn(`[Cache] skip "${key}" due to fetch error`);
        continue;
      }
      console.log(`[Cache] fetched ${newItems.length} new items for "${key}"`);

      setter((old) => {
        // filtrar antiguos y luego mergear
        const merged = [
          ...(old as any[]).filter(
            (o) => !newItems.some((n) => (n as any)[keyField] === o[keyField])
          ),
          ...(newItems as any[]),
        ];
        // dedupe por keyField
        return Array.from(
          new Map(merged.map((item: any) => [item[keyField], item])).values()
        );
      });

      (newItems as any[]).forEach((i) => {
        if ((i as any).updated_at) dates.push((i as any).updated_at);
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

  // Métodos públicos
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

  // Auto‐sync inicial + cada 24h
  useEffect(() => {
    if (!hydrated) return;
    console.log("[Cache] starting initial syncAll");
    syncAll().catch((error) => console.error("[Cache] syncAll error", error));
    const iv = setInterval(() => {
      console.log("[Cache] interval syncAll");
      syncAll().catch((error) => console.error("[Cache] syncAll error", error));
    }, 24 * 3600 * 1000);
    return () => clearInterval(iv);
  }, [hydrated, syncAll]);

  // Persistencia en localStorage
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
