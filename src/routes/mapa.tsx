import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Crosshair } from "lucide-react";
import { useStore } from "@/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de focos — PataSegura" },
      { name: "description", content: "Áreas com maior concentração de cães em situação de rua." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const { state } = useStore();

  const hotspots = useMemo(() => {
    const buckets = new Map<string, { lat: number; lng: number; count: number; address?: string }>();
    [...state.animals, ...state.reports].forEach((p) => {
      if (p.lat == null || p.lng == null) return;
      const key = `${p.lat.toFixed(2)},${p.lng.toFixed(2)}`;
      const cur = buckets.get(key) ?? { lat: p.lat, lng: p.lng, count: 0, address: p.address };
      cur.count += 1;
      buckets.set(key, cur);
    });
    return [...buckets.values()].sort((a, b) => b.count - a.count);
  }, [state.animals, state.reports]);

  const max = hotspots[0]?.count ?? 0;

  return (
    <div className="mx-auto max-w-md">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Mapa de focos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Áreas com maior concentração de cães em situação de rua.
        </p>
      </header>

      <div className="px-5">
        <div
          className="relative h-64 rounded-3xl border border-border overflow-hidden"
          style={{ background: "var(--gradient-card)" }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.55 0.14 220 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.14 220 / 0.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {hotspots.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <Crosshair className="h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum ponto registrado ainda. Cadastros e denúncias com localização aparecerão aqui.
              </p>
            </div>
          ) : (
            hotspots.slice(0, 12).map((h, i) => {
              const size = 24 + (h.count / max) * 40;
              return (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/30 border-2 border-destructive flex items-center justify-center text-[10px] font-bold text-destructive"
                  style={{
                    left: `${15 + ((Math.abs(h.lng) * 37) % 70)}%`,
                    top: `${15 + ((Math.abs(h.lat) * 53) % 70)}%`,
                    width: size,
                    height: size,
                  }}
                >
                  {h.count}
                </div>
              );
            })
          )}
        </div>
      </div>

      <section className="px-5 pt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Áreas críticas
        </h2>
        <div className="mt-3 space-y-2">
          {hotspots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center text-sm text-muted-foreground">
              Ainda não há áreas com registros.
            </div>
          ) : (
            hotspots.map((h, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="rounded-xl bg-destructive/10 p-2">
                  <MapPin className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {h.address ?? `${h.lat.toFixed(4)}, ${h.lng.toFixed(4)}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {h.count} {h.count === 1 ? "registro" : "registros"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}