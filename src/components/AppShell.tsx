import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, MapPin, Bell, AlertTriangle, Shield } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

const tabs = [
  { to: "/", label: "Início", icon: Home },
  { to: "/mapa", label: "Mapa", icon: MapPin },
  { to: "/avisos", label: "Avisos", icon: Bell },
  { to: "/denuncia", label: "Denúncia", icon: AlertTriangle },
  { to: "/admin", label: "Painel", icon: Shield },
] as const;

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user && path !== "/auth") {
      nav({ to: "/auth" });
    }
  }, [loading, user, path, nav]);

  const isAuthRoute = path === "/auth";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (isAuthRoute || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-md grid grid-cols-5">
          {tabs.map((t) => {
            const active = path === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}