import { createFileRoute } from "@tanstack/react-router";
import { Bell, Plus, Trash2, Megaphone, AlertCircle, Info } from "lucide-react";
import { useStore, type Notice } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/avisos")({
  head: () => ({
    meta: [
      { title: "Avisos da prefeitura — PataSegura" },
      { name: "description", content: "Campanhas, informações e atualizações da prefeitura." },
    ],
  }),
  component: AvisosPage,
});

const typeStyles: Record<Notice["type"], { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  campanha: { icon: Megaphone, color: "text-secondary", bg: "bg-secondary/10" },
  alerta: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

function AvisosPage() {
  const { state, addNotice, removeNotice } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", date: "", type: "info" as Notice["type"] });

  const create = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    try {
      await addNotice(form);
      setForm({ title: "", message: "", date: "", type: "info" });
      setOpen(false);
    } catch (e) {
      alert("Erro ao publicar: " + (e as Error).message);
    }
  };

  const remove = (id: string) => removeNotice(id).catch((e) => alert("Erro: " + e.message));

  return (
    <div className="mx-auto max-w-md">
      <header className="px-5 pt-8 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Avisos</h1>
          <p className="text-sm text-muted-foreground mt-1">Publicações da prefeitura.</p>
        </div>
        {state.isAdmin && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-primary text-primary-foreground p-2.5 shadow-[var(--shadow-soft)]"
            aria-label="Novo aviso"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </header>

      {state.isAdmin && open && (
        <div className="mx-5 mb-4 rounded-2xl border border-border bg-card p-4 space-y-3">
          <input
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-20"
            placeholder="Mensagem"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <select
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Notice["type"] })}
            >
              <option value="info">Informação</option>
              <option value="campanha">Campanha</option>
              <option value="alerta">Alerta</option>
            </select>
          </div>
          <button
            onClick={create}
            className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold"
          >
            Publicar
          </button>
        </div>
      )}

      <div className="px-5 space-y-3 pb-6">
        {state.notices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum aviso publicado ainda.
            </p>
            {!state.isAdmin && (
              <p className="mt-1 text-xs text-muted-foreground">
                Apenas a prefeitura pode publicar.
              </p>
            )}
          </div>
        ) : (
          state.notices.map((n) => {
            const style = typeStyles[n.type];
            const Icon = style.icon;
            return (
              <article key={n.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl ${style.bg} p-2`}>
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{n.title}</h3>
                      {state.isAdmin && (
                        <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                    {n.date && (
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-primary">{n.date}</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}