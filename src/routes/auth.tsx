import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } => {
    const next = safeNext(s.next);
    return next ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar — PataSegura" },
      { name: "description", content: "Acesse o PataSegura." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const nav = useNavigate();
  const { next } = Route.useSearch();
  const goNext = () => {
    if (next) window.location.href = next;
    else nav({ to: "/" });
  };
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) goNext();
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);
    setBusy(false);
    if (error) setError(error);
    else goNext();
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-12">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-2.5">
          <PawPrint className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PataSegura</h1>
          <p className="text-xs text-muted-foreground">
            {mode === "signin" ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <label className="block">
          <span className="text-sm font-medium">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Senha</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
        className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
      >
        {mode === "signin" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
      </button>

      <p className="mt-8 text-[11px] text-muted-foreground text-center leading-relaxed">
        Apenas o e-mail oficial da equipe tem acesso de administrador.
        Demais contas podem visualizar a lista de cachorros cadastrados.
      </p>
    </div>
  );
}