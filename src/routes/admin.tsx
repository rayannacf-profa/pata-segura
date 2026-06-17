import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Plus, Trash2, CalendarCheck, PawPrint, FileText, Stethoscope, Download, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Dog = {
  id: string;
  description: string;
  condition: string;
  photo: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  created_at: string;
};

function useDogs() {
  return useQuery<Dog[]>({
    queryKey: ["dogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Dog[];
    },
  });
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel da prefeitura — PataSegura" },
      { name: "description", content: "Gestão de animais, denúncias, castração e triagem clínica." },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "animals" | "reports" | "castration" | "triage";

function AdminPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>(isAdmin ? "overview" : "animals");

  const tabs: { id: Tab; label: string }[] = isAdmin
    ? [
        { id: "overview", label: "Visão geral" },
        { id: "animals", label: "Animais" },
        { id: "reports", label: "Denúncias" },
        { id: "castration", label: "Castração" },
        { id: "triage", label: "Triagem" },
      ]
    : [{ id: "animals", label: "Cachorros cadastrados" }];

  return (
    <div className="mx-auto max-w-md">
      <header
        className="px-5 pt-8 pb-6 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">
              {isAdmin ? "Painel da prefeitura" : "Cachorros cadastrados"}
            </h1>
            <p className="text-xs text-primary-foreground/80">
              {isAdmin ? "Gestão e planejamento" : "Visualização pública"}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 -mt-3 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-soft)]"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 pb-8">
        {tab === "overview" && isAdmin && <Overview />}
        {tab === "animals" && <Animals />}
        {tab === "reports" && isAdmin && <Reports />}
        {tab === "castration" && isAdmin && <Castration />}
        {tab === "triage" && isAdmin && <Triage />}
      </div>
    </div>
  );
}

function Overview() {
  const { state } = useStore();
  const { data: dogs = [] } = useDogs();
  const cards = [
    { label: "Animais cadastrados", value: dogs.length, icon: PawPrint, color: "text-primary", bg: "bg-primary/10" },
    { label: "Denúncias recebidas", value: state.reports.length, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Avisos publicados", value: state.notices.length, icon: FileText, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Datas de castração", value: state.castrations.length, icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-4">
            <div className={`rounded-xl ${c.bg} p-2 w-fit`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
            <div className="text-[11px] text-muted-foreground leading-tight">{c.label}</div>
          </div>
        ))}
      </div>
      <Link
        to="/cadastro"
        className="block rounded-2xl bg-primary text-primary-foreground p-4 text-center text-sm font-semibold shadow-[var(--shadow-soft)]"
      >
        + Cadastrar novo animal
      </Link>
    </div>
  );
}

function Animals() {
  const { isAdmin } = useAuth();
  const { data: dogs = [], isLoading } = useDogs();
  const qc = useQueryClient();
  const [open, setOpen] = useState<Dog | null>(null);

  const remove = async (id: string) => {
    const { error } = await supabase.from("dogs").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["dogs"] });
    qc.invalidateQueries({ queryKey: ["dogs", "count"] });
  };

  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>;
  }
  if (dogs.length === 0) {
    return (
      <EmptyState
        icon={PawPrint}
        message="Nenhum animal cadastrado ainda."
        cta={isAdmin ? { to: "/cadastro", label: "Cadastrar primeiro animal" } : undefined}
      />
    );
  }
  return (
    <div className="space-y-3">
      {dogs.map((a) => (
        <div key={a.id} className="rounded-2xl border border-border bg-card p-3 flex gap-3">
          <button onClick={() => setOpen(a)} className="flex-shrink-0">
            {a.photo ? (
              <img src={a.photo} alt="" className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </button>
          <button onClick={() => setOpen(a)} className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide">{a.condition}</div>
            </div>
            <p className="text-sm mt-0.5 line-clamp-2">{a.description}</p>
            {a.lat != null && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {a.lat.toFixed(4)}, {a.lng?.toFixed(4)}
              </p>
            )}
          </button>
          {isAdmin && (
            <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive self-start" aria-label="Excluir">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {open.photo && <img src={open.photo} alt="" className="w-full max-h-80 object-cover rounded-t-2xl" />}
            <div className="p-4 space-y-3">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide">{open.condition}</div>
              <p className="text-sm whitespace-pre-wrap">{open.description}</p>
              {open.address && <p className="text-xs text-muted-foreground">{open.address}</p>}
              {open.lat != null && (
                <a href={`https://www.google.com/maps?q=${open.lat},${open.lng}`} target="_blank" rel="noreferrer" className="block text-xs text-primary underline">
                  Abrir no mapa ({open.lat.toFixed(5)}, {open.lng!.toFixed(5)})
                </a>
              )}
              <div className="text-[11px] text-muted-foreground">
                Cadastrado em {new Date(open.created_at).toLocaleString("pt-BR")}
              </div>
              <button onClick={() => setOpen(null)} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Reports() {
  const { state, removeReport } = useStore();
  const [open, setOpen] = useState<typeof state.reports[number] | null>(null);
  if (state.reports.length === 0) {
    return <EmptyState icon={AlertTriangle} message="Nenhuma denúncia recebida ainda." />;
  }
  return (
    <div className="space-y-3">
      {state.reports.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-3 flex gap-3">
          <button onClick={() => setOpen(r)} className="flex-shrink-0">
          {r.photo ? (
            <img src={r.photo} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          )}
          </button>
          <button onClick={() => setOpen(r)} className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground">
                {new Date(r.createdAt).toLocaleString("pt-BR")}
              </div>
            </div>
            <p className="text-sm mt-0.5 line-clamp-3">{r.description}</p>
            {r.lat != null && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {r.lat.toFixed(4)}, {r.lng!.toFixed(4)}
              </p>
            )}
          </button>
          {state.isAdmin && (
            <button
              onClick={() => removeReport(r.id).catch((e) => alert("Erro: " + e.message))}
              className="text-muted-foreground hover:text-destructive self-start"
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {open.photo && (
              <img src={open.photo} alt="" className="w-full max-h-80 object-cover rounded-t-2xl" />
            )}
            <div className="p-4 space-y-3">
              <div className="text-[11px] text-muted-foreground">
                {new Date(open.createdAt).toLocaleString("pt-BR")}
              </div>
              <p className="text-sm whitespace-pre-wrap">{open.description}</p>
              {open.address && (
                <p className="text-xs text-muted-foreground">{open.address}</p>
              )}
              {open.lat != null && (
                <a
                  href={`https://www.google.com/maps?q=${open.lat},${open.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-primary underline"
                >
                  Abrir no mapa ({open.lat.toFixed(5)}, {open.lng!.toFixed(5)})
                </a>
              )}
              <button
                onClick={() => setOpen(null)}
                className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Castration() {
  const { state, addCastration, removeCastration } = useStore();
  const [form, setForm] = useState({ date: "", location: "", slots: 20 });
  const [open, setOpen] = useState<typeof state.castrations[number] | null>(null);
  const create = async () => {
    if (!form.date || !form.location.trim()) return;
    try {
      await addCastration(form);
      setForm({ date: "", location: "", slots: 20 });
    } catch (e) {
      alert("Erro: " + (e as Error).message);
    }
  };
  return (
    <div className="space-y-4">
      {state.isAdmin && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarCheck className="h-4 w-4 text-primary" /> Nova data
          </div>
          <input
            type="date"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            placeholder="Local de atendimento"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            type="number"
            min={1}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={form.slots}
            onChange={(e) => setForm({ ...form, slots: Number(e.target.value) })}
          />
          <button onClick={create} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold">
            <Plus className="inline h-4 w-4 mr-1" /> Publicar agenda
          </button>
        </div>
      )}
      {state.castrations.length === 0 ? (
        <EmptyState icon={CalendarCheck} message="Nenhuma data de castração publicada." />
      ) : (
        <div className="space-y-2">
          {state.castrations.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
              <button onClick={() => setOpen(c)} className="rounded-xl bg-secondary/10 p-2">
                <CalendarCheck className="h-5 w-5 text-secondary" />
              </button>
              <button onClick={() => setOpen(c)} className="flex-1 min-w-0 text-left">
                <div className="text-sm font-semibold">{c.location}</div>
                <div className="text-xs text-muted-foreground">
                  {c.date} · {c.taken}/{c.slots} vagas
                </div>
              </button>
              {state.isAdmin && (
                <button
                  onClick={() => removeCastration(c.id).catch((e) => alert("Erro: " + e.message))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-secondary" />
              <h3 className="text-base font-semibold">{open.location}</h3>
            </div>
            <p className="text-sm"><span className="text-muted-foreground">Data:</span> {open.date}</p>
            <p className="text-sm"><span className="text-muted-foreground">Vagas:</span> {open.taken}/{open.slots} ocupadas</p>
            <p className="text-sm"><span className="text-muted-foreground">Disponíveis:</span> {Math.max(0, open.slots - open.taken)}</p>
            <div className="text-[11px] text-muted-foreground">
              Publicado em {new Date(open.createdAt).toLocaleString("pt-BR")}
            </div>
            <button onClick={() => setOpen(null)} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Triage() {
  const { state, setAnimalTriage } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  if (state.animals.length === 0) {
    return <EmptyState icon={Stethoscope} message="Cadastre animais para iniciar a triagem." />;
  }
  const setTriage = (id: string, patch: Partial<NonNullable<typeof state.animals[number]["triage"]>>) =>
    setAnimalTriage(id, patch).catch((e) => alert("Erro: " + e.message));
  const attachReport = (id: string, file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setTriage(id, { reportName: file.name, reportData: r.result as string });
    r.readAsDataURL(file);
  };
  const open = state.animals.find((a) => a.id === openId) ?? null;
  return (
    <div className="space-y-3">
      {state.animals.map((a) => (
        <button
          key={a.id}
          onClick={() => setOpenId(a.id)}
          className="w-full text-left rounded-2xl border border-border bg-card p-3"
        >
          <div className="flex items-center gap-3">
            {a.photo ? (
              <img src={a.photo} alt="" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold line-clamp-1">{a.description}</div>
              <div className="text-[11px] text-muted-foreground">
                {a.triage?.condition ? `Diagnóstico: ${a.triage.condition}` : "Sem diagnóstico"}
              </div>
            </div>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      ))}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={() => setOpenId(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              {open.photo ? (
                <img src={open.photo} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{open.description}</div>
                <div className="text-[11px] text-muted-foreground">{open.condition}</div>
              </div>
            </div>
            <select
              disabled={!state.isAdmin}
              value={open.triage?.condition ?? ""}
              onChange={(e) => setTriage(open.id, { condition: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="">Sem diagnóstico</option>
              <option>Calazar (Leishmaniose)</option>
              <option>Raiva</option>
              <option>Sarna</option>
              <option>Erliquiose</option>
              <option>Verminose</option>
              <option>Desnutrição</option>
              <option>Outro</option>
            </select>
            <textarea
              disabled={!state.isAdmin}
              value={open.triage?.notes ?? ""}
              onChange={(e) => setTriage(open.id, { notes: e.target.value })}
              placeholder="Observações clínicas"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-24 disabled:opacity-60"
            />
            {state.isAdmin && (
              <label className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-xs cursor-pointer">
                <FileText className="h-4 w-4 text-primary" />
                <span className="flex-1">
                  {open.triage?.reportName ? `Laudo: ${open.triage.reportName}` : "Anexar laudo (PDF/imagem)"}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => attachReport(open.id, e.target.files?.[0])}
                />
              </label>
            )}
            {open.triage?.reportData && (
              <a
                href={open.triage.reportData}
                download={open.triage.reportName}
                className="flex items-center justify-center gap-2 rounded-xl bg-secondary/15 text-secondary py-2 text-xs font-semibold"
              >
                <Download className="h-4 w-4" /> Baixar laudo
              </a>
            )}
            <button onClick={() => setOpenId(null)} className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
  cta,
}: {
  icon: typeof PawPrint;
  message: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      {cta && (
        <a
          href={cta.to}
          className="mt-3 inline-block rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold"
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}