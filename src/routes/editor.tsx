import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Type, Square } from "lucide-react";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
  head: () => ({
    meta: [
      { title: "Editor de Protótipo · PataSegura" },
      { name: "description", content: "Editor visual simples para prototipar telas do PataSegura." },
    ],
  }),
});

type ElementType = "button" | "label";
interface PrototypeElement {
  id: string;
  type: ElementType;
  text: string;
  x: number;
  y: number;
}

const initial: PrototypeElement[] = [
  { id: "1", type: "button", text: "Entrar", x: 40, y: 40 },
  { id: "2", type: "label", text: "Bem-vindo ao PataSegura!", x: 40, y: 110 },
];

function EditorPage() {
  const [elements, setElements] = useState<PrototypeElement[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  const selected = elements.find((e) => e.id === selectedId) ?? null;

  const addElement = (type: ElementType) => {
    const id = crypto.randomUUID();
    setElements((prev) => [
      ...prev,
      { id, type, text: type === "button" ? "Botão" : "Texto", x: 60, y: 60 + prev.length * 20 },
    ]);
    setSelectedId(id);
  };

  const updateSelected = (patch: Partial<PrototypeElement>) => {
    if (!selected) return;
    setElements((prev) => prev.map((e) => (e.id === selected.id ? { ...e, ...patch } : e)));
  };

  const removeSelected = () => {
    if (!selected) return;
    setElements((prev) => prev.filter((e) => e.id !== selected.id));
    setSelectedId(null);
  };

  const onPointerDown = (e: React.PointerEvent, el: PrototypeElement) => {
    e.stopPropagation();
    setSelectedId(el.id);
    const target = e.currentTarget as HTMLElement;
    const canvas = target.parentElement!.getBoundingClientRect();
    setDragOffset({ x: e.clientX - canvas.left - el.x, y: e.clientY - canvas.top - el.y });
    target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragOffset || !selected) return;
    const canvas = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width - 20, e.clientX - canvas.left - dragOffset.x));
    const y = Math.max(0, Math.min(canvas.height - 20, e.clientY - canvas.top - dragOffset.y));
    updateSelected({ x, y });
  };

  const onPointerUp = () => setDragOffset(null);

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Editor de Protótipo</h1>
        <p className="text-sm text-muted-foreground">
          Adicione, mova e edite elementos para esboçar uma tela.
        </p>
      </header>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => addElement("button")}>
          <Plus className="h-4 w-4 mr-1" /> <Square className="h-4 w-4 mr-1" /> Botão
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addElement("label")}>
          <Plus className="h-4 w-4 mr-1" /> <Type className="h-4 w-4 mr-1" /> Texto
        </Button>
      </div>

      <Card
        className="relative h-[380px] w-full overflow-hidden bg-card border-dashed touch-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => setSelectedId(null)}
      >
        {elements.map((el) => {
          const isSel = el.id === selectedId;
          const base = "absolute select-none cursor-move";
          const ring = isSel ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "";
          return el.type === "button" ? (
            <div
              key={el.id}
              style={{ left: el.x, top: el.y }}
              onPointerDown={(e) => onPointerDown(e, el)}
              className={`${base} ${ring} rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium shadow`}
            >
              {el.text}
            </div>
          ) : (
            <div
              key={el.id}
              style={{ left: el.x, top: el.y }}
              onPointerDown={(e) => onPointerDown(e, el)}
              className={`${base} ${ring} text-foreground text-base px-1`}
            >
              {el.text}
            </div>
          );
        })}
      </Card>

      {selected ? (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Editando: {selected.type === "button" ? "Botão" : "Texto"}
            </span>
            <Button size="sm" variant="destructive" onClick={removeSelected}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="text">Texto</Label>
            <Input
              id="text"
              value={selected.text}
              onChange={(e) => updateSelected({ text: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="x">X</Label>
              <Input
                id="x"
                type="number"
                value={Math.round(selected.x)}
                onChange={(e) => updateSelected({ x: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="y">Y</Label>
              <Input
                id="y"
                type="number"
                value={Math.round(selected.y)}
                onChange={(e) => updateSelected({ y: Number(e.target.value) })}
              />
            </div>
          </div>
        </Card>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          Toque em um elemento para editar, ou arraste para reposicionar.
        </p>
      )}
    </div>
  );
}