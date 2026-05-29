import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Plus, Trash2, CalendarCheck, PawPrint, FileText, Stethoscope, Download, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useStore, uid, type CastrationSlot } from "@/lib/store";

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
  const { state, update } = useStore();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Visão geral" },
    { id: "animals", label: "Animais" },
    { id: "reports", label: "Denúncias" },
    { id: "castration", label: "Castração" },
    { id: "triage", label: "Triagem" },
  ];

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
            <h1 className="text-xl font-bold tracking-tight">Painel da prefeitura</h1>
            <p className="text-xs text-primary-foreground/80">Gestão e planejamento</p>
          </div>
        </div>
        <label className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/15 backdrop-blur px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Entrar como admin</div>
            <div className="text-[11px] text-primary-foreground/80">Habilita criação e moderação</div>
          </div>
          <input
            type="checkbox"
            checked={state.isAdmin}
            onChange={(e) => update({ isAdmin: e.target.checked })}
            className="h-5 w-9 appearance-none rounded-full bg-white/30 relative cursor-pointer transition-all
              checked:bg-secondary
              before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all
              checked:before:translate-x-4"
          />
        </label>
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
        {tab === "overview" && <Overview />}
        {tab === "animals" && <Animals />}
        {tab === "reports" && <Reports />}
        {tab === "castration" && <Castration />}
        {tab === "triage" && <Triage />}
      </div>
    </div>
  );
}

function Overview() {
  const { state } = useStore();
  const cards = [
    { label: "Animais cadastrados", value: state.animals.length, icon: PawPrint, color: "text-primary", bg: "bg-primary/10" },
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
      {state.isAdmin && (
        <Link
          to="/cadastro"
          className="block rounded-2xl bg-primary text-primary-foreground p-4 text-center text-sm font-semibold shadow-[var(--shadow-soft)]"
        >
          + Cadastrar novo animal
        </Link>
      )}
    </div>
  );
}

function Animals() {
  const { state, update } = useStore();
  if (state.animals.length === 0) {
    return (
      <EmptyState
        icon={PawPrint}
        message="Nenhum animal cadastrado ainda."
        cta={state.isAdmin ? { to: "/cadastro", label: "Cadastrar primeiro animal" } : undefined}
      />
    );
  }
  return (
    <div className="space-y-3">
      {state.animals.map((a) => (
        <div key={a.id} className="rounded-2xl border border-border bg-card p-3 flex gap-3">
          {a.photo ? (
            <img src={a.photo} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
              <PawPrint className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide">{a.condition}</div>
              {state.isAdmin && (
                <button
                  onClick={() => update({ animals: state.animals.filter((x) => x.id !== a.id) })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm mt-0.5 line-clamp-2">{a.description}</p>
            {a.lat != null && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {a.lat.toFixed(4)}, {a.lng!.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Reports() {
  const { state, update } = useStore();
  if (state.reports.length === 0) {
    return <EmptyState icon={AlertTriangle} message="Nenhuma denúncia recebida ainda." />;
  }
  return (
    <div className="space-y-3">
      {state.reports.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-3 flex gap-3">
          {r.photo ? (
            <img src={r.photo} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground">
                {new Date(r.createdAt).toLocaleString("pt-BR")}
              </div>
              {state.isAdmin && (
                <button
                  onClick={() => update({ reports: state.reports.filter((x) => x.id !== r.id) })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm mt-0.5 line-clamp-3">{r.description}</p>
            {r.lat != null && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {r.lat.toFixed(4)}, {r.lng!.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Castration() {
  const { state, update } = useStore();
  const [form, setForm] = useState({ date: "", location: "", slots: 20 });
  const create = () => {
    if (!form.date || !form.location.trim()) return;
    const c: CastrationSlot = { id: uid(), ...form, taken: 0, createdAt: Date.now() };
    update({ castrations: [c, ...state.castrations] });
    setForm({ date: "", location: "", slots: 20 });
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
              <div className="rounded-xl bg-secondary/10 p-2">
                <CalendarCheck className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{c.location}</div>
                <div className="text-xs text-muted-foreground">
                  {c.date} · {c.taken}/{c.slots} vagas
                </div>
              </div>
              {state.isAdmin && (
                <button
                  onClick={() => update({ castrations: state.castrations.filter((x) => x.id !== c.id) })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Triage() {
  const { state, update } = useStore();
  if (state.animals.length === 0) {
    return <EmptyState icon={Stethoscope} message="Cadastre animais para iniciar a triagem." />;
  }
  const setTriage = (id: string, patch: Partial<NonNullable<typeof state.animals[number]["triage"]>>) => {
    update({
      animals: state.animals.map((a) =>
        a.id === id
          ? { ...a, triage: { condition: "", notes: "", ...a.triage, ...patch } }
          : a
      ),
    });
  };
  const attachReport = (id: string, file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setTriage(id, { reportName: file.name, reportData: r.result as string });
    r.readAsDataURL(file);
  };
  return (
    <div className="space-y-3">
      {state.animals.map((a) => (
        <div key={a.id} className="rounded-2xl border border-border bg-card p-3 space-y-3">
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
              <div className="text-[11px] text-muted-foreground">{a.condition}</div>
            </div>
          </div>
          <select
            disabled={!state.isAdmin}
            value={a.triage?.condition ?? ""}
            onChange={(e) => setTriage(a.id, { condition: e.target.value })}
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
            value={a.triage?.notes ?? ""}
            onChange={(e) => setTriage(a.id, { notes: e.target.value })}
            placeholder="Observações clínicas"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-16 disabled:opacity-60"
          />
          {state.isAdmin && (
            <label className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-xs cursor-pointer">
              <FileText className="h-4 w-4 text-primary" />
              <span className="flex-1">
                {a.triage?.reportName ? `Laudo: ${a.triage.reportName}` : "Anexar laudo (PDF/imagem)"}
              </span>
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => attachReport(a.id, e.target.files?.[0])}
              />
            </label>
          )}
          {a.triage?.reportData && (
            <a
              href={a.triage.reportData}
              download={a.triage.reportName}
              className="flex items-center justify-center gap-2 rounded-xl bg-secondary/15 text-secondary py-2 text-xs font-semibold"
            >
              <Download className="h-4 w-4" /> Baixar laudo
            </a>
          )}
        </div>
      ))}
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
        <Link
          to={cta.to}
          className="mt-3 inline-block rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}