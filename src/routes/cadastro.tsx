import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PawPrint, Camera, MapPin, ShieldAlert, Check } from "lucide-react";
import { useState } from "react";
import { useStore, uid, type Animal } from "@/lib/store";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro de animais — PataSegura" },
      { name: "description", content: "Cadastro de cães em situação de rua (acesso administrativo)." },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const { state, update } = useStore();
  const nav = useNavigate();
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Aparenta saudável");
  const [photo, setPhoto] = useState<string | undefined>();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [done, setDone] = useState(false);

  if (!state.isAdmin) {
    return (
      <div className="mx-auto max-w-md px-5 pt-10">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-3 text-lg font-bold">Acesso administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O cadastro de animais é feito pela equipe da prefeitura. Cidadãos podem ajudar enviando denúncias.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/denuncia"
              className="rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold"
            >
              Denunciar
            </Link>
            <Link
              to="/admin"
              className="rounded-xl border border-border bg-background py-2.5 text-sm font-semibold"
            >
              Painel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pickPhoto = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(file);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      undefined,
      { enableHighAccuracy: true }
    );
  };

  const submit = () => {
    if (!description.trim()) return;
    const a: Animal = {
      id: uid(),
      description: description.trim(),
      condition,
      photo,
      lat: coords?.lat,
      lng: coords?.lng,
      createdAt: Date.now(),
    };
    update({ animals: [a, ...state.animals] });
    setDone(true);
    setTimeout(() => nav({ to: "/admin" }), 1000);
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-secondary/15 p-5">
          <Check className="h-10 w-10 text-secondary" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Animal cadastrado</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <header className="px-5 pt-8 pb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-2.5">
          <PawPrint className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cadastrar animal</h1>
          <p className="text-xs text-muted-foreground">Modo administrador</p>
        </div>
      </header>

      <div className="px-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Descrição</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm min-h-24"
            placeholder="Porte, cor, comportamento..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Estado do animal</span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm"
          >
            <option>Aparenta saudável</option>
            <option>Magreza/debilitado</option>
            <option>Ferido</option>
            <option>Doente</option>
            <option>Agressivo</option>
            <option>Necessita resgate urgente</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-4 cursor-pointer">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-sm">{photo ? "Foto adicionada" : "Adicionar foto"}</div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => pickPhoto(e.target.files?.[0])}
          />
        </label>
        {photo && <img src={photo} alt="" className="w-full h-40 object-cover rounded-xl" />}

        <button
          onClick={getLocation}
          className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left"
        >
          <div className="rounded-xl bg-secondary/15 p-2.5">
            <MapPin className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1 text-sm">
            {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Capturar GPS"}
          </div>
        </button>

        <button
          onClick={submit}
          disabled={!description.trim()}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-50"
        >
          Salvar cadastro
        </button>
      </div>
    </div>
  );
}