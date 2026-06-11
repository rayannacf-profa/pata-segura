import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PawPrint, MapPin, AlertTriangle, Bell, CalendarCheck, Shield, LayoutTemplate } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PataSegura — Início" },
      { name: "description", content: "Tecnologia ajudando a proteger animais e a cidade." },
      { property: "og:title", content: "PataSegura" },
      { property: "og:description", content: "Tecnologia ajudando a proteger animais e a cidade." },
    ],
  }),
  component: Index,
});

function Index() {
  const { state } = useStore();
  const stats = [
    { label: "Animais", value: state.animals.length },
    { label: "Denúncias", value: state.reports.length },
    { label: "Avisos", value: state.notices.length },
  ];
  const actions = [
    { to: "/mapa", icon: MapPin, label: "Mapa de focos", desc: "Veja áreas críticas da cidade" },
    { to: "/denuncia", icon: AlertTriangle, label: "Denunciar maus-tratos", desc: "Envie fotos e localização" },
    { to: "/avisos", icon: Bell, label: "Avisos da prefeitura", desc: "Campanhas e atualizações" },
    { to: "/admin", icon: Shield, label: "Painel da prefeitura", desc: "Gestão e triagem clínica" },
    { to: "/editor", icon: LayoutTemplate, label: "Editor de protótipo", desc: "Esboce telas com elementos arrastáveis" },
  ] as const;

  return (
    <div className="mx-auto max-w-md">
      <header
        className="relative overflow-hidden px-6 pt-10 pb-8 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur">
            <PawPrint className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PataSegura</h1>
            <p className="text-xs text-primary-foreground/80">Proteção animal urbana</p>
          </div>
        </div>
        <p className="mt-5 text-base font-medium leading-snug">
          Tecnologia ajudando a proteger animais e a cidade.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur">
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-[11px] text-primary-foreground/80">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <section className="px-5 -mt-4">
        <Link
          to="/denuncia"
          className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)] border border-border"
        >
          <div className="rounded-xl bg-destructive/10 p-2.5">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Viu um animal em perigo?</div>
            <div className="text-xs text-muted-foreground">Denuncie agora — é rápido.</div>
          </div>
        </Link>
      </section>

      <section className="px-5 pt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Ações rápidas
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5"
            >
              <div className="rounded-xl bg-accent p-2 w-fit">
                <a.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="mt-3 text-sm font-semibold">{a.label}</div>
              <div className="mt-1 text-xs text-muted-foreground leading-snug">{a.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Últimos avisos
        </h2>
        <div className="mt-3 space-y-2">
          {state.notices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
              <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Sem avisos no momento. A prefeitura publicará novidades aqui.
              </p>
            </div>
          ) : (
            state.notices.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{n.title}</div>
                  <span className="text-[10px] uppercase tracking-wide text-primary">{n.type}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="px-5 pt-6 pb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarCheck className="h-4 w-4" />
        Programa municipal de proteção animal
      </section>
    </div>
  );
}
