import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Triage = { condition: string; notes: string; reportName?: string; reportData?: string };

export type Animal = {
  id: string;
  photo?: string;
  description: string;
  condition: string;
  lat?: number;
  lng?: number;
  address?: string;
  createdAt: number;
  triage?: Triage;
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

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useStore() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();

  const dogs = useQuery({
    queryKey: ["dogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const reports = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const notices = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const castrations = useQuery({
    queryKey: ["castrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("castrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const state = {
    animals: (dogs.data ?? []).map<Animal>((d) => ({
      id: d.id,
      photo: d.photo ?? undefined,
      description: d.description,
      condition: d.condition,
      lat: d.lat ?? undefined,
      lng: d.lng ?? undefined,
      address: d.address ?? undefined,
      createdAt: new Date(d.created_at).getTime(),
      triage: (d.triage as Triage | null) ?? undefined,
    })),
    reports: (reports.data ?? []).map<Report>((r) => ({
      id: r.id,
      description: r.description,
      photo: r.photo ?? undefined,
      lat: r.lat ?? undefined,
      lng: r.lng ?? undefined,
      address: r.address ?? undefined,
      createdAt: new Date(r.created_at).getTime(),
    })),
    notices: (notices.data ?? []).map<Notice>((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      date: n.date,
      type: n.type as Notice["type"],
      createdAt: new Date(n.created_at).getTime(),
    })),
    castrations: (castrations.data ?? []).map<CastrationSlot>((c) => ({
      id: c.id,
      date: c.date,
      location: c.location,
      slots: c.slots,
      taken: c.taken,
      createdAt: new Date(c.created_at).getTime(),
    })),
    isAdmin,
  };

  const addReport = async (r: { description: string; photo?: string; lat?: number; lng?: number; address?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("reports").insert({
      description: r.description,
      photo: r.photo ?? null,
      lat: r.lat ?? null,
      lng: r.lng ?? null,
      address: r.address ?? null,
      created_by: user?.id ?? null,
    });
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
  const removeReport = async (id: string) => {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["reports"] });
  };

  const addNotice = async (n: { title: string; message: string; date: string; type: Notice["type"] }) => {
    const { error } = await supabase.from("notices").insert(n);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["notices"] });
  };
  const removeNotice = async (id: string) => {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["notices"] });
  };

  const addCastration = async (c: { date: string; location: string; slots: number }) => {
    const { error } = await supabase.from("castrations").insert({ ...c, taken: 0 });
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["castrations"] });
  };
  const removeCastration = async (id: string) => {
    const { error } = await supabase.from("castrations").delete().eq("id", id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["castrations"] });
  };

  const setAnimalTriage = async (id: string, patch: Partial<Triage>) => {
    const current = state.animals.find((a) => a.id === id)?.triage ?? { condition: "", notes: "" };
    const next = { ...current, ...patch };
    const { error } = await supabase.from("dogs").update({ triage: next }).eq("id", id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["dogs"] });
  };

  return {
    state,
    addReport,
    removeReport,
    addNotice,
    removeNotice,
    addCastration,
    removeCastration,
    setAnimalTriage,
  };
}