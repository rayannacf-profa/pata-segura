import { useEffect, useState, useCallback } from "react";

export type Animal = {
  id: string;
  photo?: string;
  description: string;
  condition: string;
  lat?: number;
  lng?: number;
  address?: string;
  createdAt: number;
  triage?: { condition: string; notes: string; reportName?: string; reportData?: string };
};

export type Report = {
  id: string;
  description: string;
  photo?: string;
  lat?: number;
  lng?: number;
  address?: string;
  createdAt: number;
};

export type Notice = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "info" | "campanha" | "alerta";
  createdAt: number;
};

export type CastrationSlot = {
  id: string;
  date: string;
  location: string;
  slots: number;
  taken: number;
  createdAt: number;
};

type Stores = {
  animals: Animal[];
  reports: Report[];
  notices: Notice[];
  castrations: CastrationSlot[];
  isAdmin: boolean;
};

const defaults: Stores = {
  animals: [],
  reports: [],
  notices: [],
  castrations: [],
  isAdmin: false,
};

const KEY = "patasegura.v1";

function read(): Stores {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function write(s: Stores) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("patasegura:update"));
}

export function useStore() {
  const [state, setState] = useState<Stores>(defaults);

  useEffect(() => {
    setState(read());
    const handler = () => setState(read());
    window.addEventListener("patasegura:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("patasegura:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((patch: Partial<Stores>) => {
    const next = { ...read(), ...patch };
    write(next);
    setState(next);
  }, []);

  return { state, update };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}