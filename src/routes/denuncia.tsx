import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Camera, MapPin, Check } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/denuncia")({
  head: () => ({
    meta: [
      { title: "Denúncia de maus-tratos — PataSegura" },
      { name: "description", content: "Envie fotos e localização para denunciar maus-tratos." },
    ],
  }),
  component: DenunciaPage,
});

function DenunciaPage() {
  const { addReport } = useStore();
  const nav = useNavigate();
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pickPhoto = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(file);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true }
    );
  };

  const submit = async () => {
    if (!description.trim()) return;
    try {
      await addReport({
        description: description.trim(),
        photo,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setDone(true);
      setTimeout(() => nav({ to: "/" }), 1200);
    } catch (e) {
      alert("Erro ao enviar denúncia: " + (e as Error).message);
    }
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-secondary/15 p-5">
          <Check className="h-10 w-10 text-secondary" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Denúncia enviada</h1>
        <p className="mt-1 text-sm text-muted-foreground">Obrigado por ajudar a proteger os animais.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-destructive/10 p-2.5">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Denúncia</h1>
            <p className="text-xs text-muted-foreground">Maus-tratos ou animal em risco</p>
          </div>
        </div>
      </header>

      <div className="px-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Descrição</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm min-h-28"
            placeholder="Descreva a situação observada..."
          />
        </label>

        <div>
          <span className="text-sm font-medium">Foto</span>
          <label className="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-4 cursor-pointer">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-sm">
              {photo ? "Foto adicionada" : "Tocar para enviar uma foto"}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => pickPhoto(e.target.files?.[0])}
            />
          </label>
          {photo && (
            <img src={photo} alt="" className="mt-2 w-full h-40 object-cover rounded-xl" />
          )}
        </div>

        <div>
          <span className="text-sm font-medium">Localização</span>
          <button
            onClick={getLocation}
            className="mt-1.5 w-full flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left"
          >
            <div className="rounded-xl bg-secondary/15 p-2.5">
              <MapPin className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex-1 text-sm">
              {loading
                ? "Obtendo localização..."
                : coords
                ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                : "Usar minha localização atual"}
            </div>
          </button>
        </div>

        <button
          onClick={submit}
          disabled={!description.trim()}
          className="w-full rounded-xl bg-destructive text-destructive-foreground py-3 text-sm font-semibold disabled:opacity-50"
        >
          Enviar denúncia
        </button>
      </div>
    </div>
  );
}