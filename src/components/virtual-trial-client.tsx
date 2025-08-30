"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

type Garment = {
  id: string;
  label: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  z: number;
};

// You need to add these transparent PNGs to your `public/cloth/` directory.
const CATALOG: Garment[] = [
    { id: "kurta-blue", label: "Blue Kurta", src: "/cloth/kurta1.png", x: 260, y: 350, scale: 1.5, rotate: 0, z: 10 },
    { id: "blazer-black", label: "Black Blazer", src: "/cloth/blazer1.png", x: 260, y: 350, scale: 1.5, rotate: 0, z: 12 },
    { id: "sherwani-gold", label: "Gold Sherwani", src: "/cloth/sherwani1.png", x: 260, y: 350, scale: 1.5, rotate: 0, z: 11 },
    { id: "pants-white", label: "White Pants", src: "/cloth/pants1.png", x: 260, y: 550, scale: 1.5, rotate: 0, z: 8 },
];


export default function VirtualTrialClient() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personUrl, setPersonUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [loadingCutout, setLoadingCutout] = useState(false);

  const [layers, setLayers] = useState<Garment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (personUrl) URL.revokeObjectURL(personUrl);
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    };
  }, [personUrl, cutoutUrl]);

  const handlePersonUpload = (file: File | null) => {
    setPersonFile(file);
    setCutoutUrl(null);
    setLayers([]); // Clear layers when new person is uploaded
    if (file) {
      setPersonUrl(URL.createObjectURL(file));
    } else {
      setPersonUrl(null);
    }
  };

  const callRemoveBg = async () => {
    if (!personFile) return;
    setLoadingCutout(true);
    try {
      const fd = new FormData();
      fd.append("image_file", personFile);
      const res = await fetch("/api/remove-bg", { method: "POST", body: fd });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Background removal proxy failed");
      }
      const blob = await res.blob();
      setCutoutUrl(URL.createObjectURL(blob));
      toast({ title: "Success", description: "Background removed." });
    } catch (e: any) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: `Background removal failed: ${e.message}` });
    } finally {
      setLoadingCutout(false);
    }
  };
  
  const addLayer = (garment: Garment) => {
    const newGarment = { ...garment, id: `${garment.id}-${crypto.randomUUID()}`};
    setLayers(prev => [...prev, newGarment]);
    setActiveId(newGarment.id);
  };

  const dragInfo = useRef<{ id: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    dragInfo.current = { id, startX: e.clientX, startY: e.clientY, baseX: target.x, baseY: target.y };
    setActiveId(id);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragInfo.current) return;
    const { id, startX, startY, baseX, baseY } = dragInfo.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, x: baseX + dx, y: baseY + dy } : l))
    );
  };

  const onMouseUp = () => {
    dragInfo.current = null;
  };

  const updateActive = (patch: Partial<Garment>) => {
    if (!activeId) return;
    setLayers((prev) => prev.map((l) => (l.id === activeId ? { ...l, ...patch } : l)));
  };

  const removeActive = () => {
    if (!activeId) return;
    setLayers((prev) => prev.filter((l) => l.id !== activeId));
    setActiveId(null);
  };
  
  const exportPNG = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    // Set activeId to null to hide the dashed outline before exporting
    setActiveId(null);
    // Brief delay to allow React to re-render without the outline
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(stage, { backgroundColor: null, scale: 2 });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "dubai-royal-attire-try-on.png";
      a.click();
    } catch (e) {
      console.error("Failed to export PNG:", e);
      toast({ variant: "destructive", title: "Export Error", description: "Could not export image." });
    }
  };
  
  const activeLayer = layers.find(l => l.id === activeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4"
         onMouseMove={onMouseMove}
         onMouseUp={onMouseUp}
         onMouseLeave={onMouseUp}
    >
      <div className="lg:col-span-2 space-y-4">
        <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground">
          <h2 className="text-lg font-headline font-semibold">1. Upload Your Photo</h2>
          <input
            type="file"
            accept="image/*"
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            onChange={(e) => handlePersonUpload(e.target.files?.[0] ?? null)}
          />
          <Button
            className="w-full"
            disabled={!personFile || loadingCutout}
            onClick={callRemoveBg}
          >
            {loadingCutout ? <Loader2 className="animate-spin" /> : "Remove Background"}
          </Button>
        </div>

        <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground">
            <h2 className="text-lg font-headline font-semibold">2. Choose Garments</h2>
             <div className="flex flex-wrap gap-2">
                {CATALOG.map((g) => (
                  <Button
                    key={g.id}
                    variant="outline"
                    onClick={() => addLayer(g)}
                  >
                    + {g.label}
                  </Button>
                ))}
            </div>
        </div>

        {activeLayer && (
          <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground">
            <h2 className="text-lg font-headline font-semibold">3. Adjust & Export</h2>
            <div className="grid grid-cols-3 gap-x-2 gap-y-3 items-center">
              <label className="text-sm">Scale</label>
              <input
                type="range" min={0.2} max={3} step={0.01}
                value={activeLayer.scale}
                onChange={(e) => updateActive({ scale: parseFloat(e.target.value) })}
                className="col-span-2"
              />

              <label className="text-sm">Rotate</label>
              <input
                type="range" min={-45} max={45} step={0.5}
                value={activeLayer.rotate}
                onChange={(e) => updateActive({ rotate: parseFloat(e.target.value) })}
                className="col-span-2"
              />

              <label className="text-sm">Layer</label>
              <input
                type="range" min={1} max={30} step={1}
                value={activeLayer.z}
                onChange={(e) => updateActive({ z: parseInt(e.target.value, 10) })}
                className="col-span-2"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={removeActive} variant="outline" className="flex-1">
                Remove
              </Button>
              <Button onClick={exportPNG} className="flex-1">
                Export as PNG
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        <div
          ref={stageRef}
          className="relative w-full max-w-[520px] aspect-[3/4] mx-auto rounded-lg border overflow-hidden bg-muted/50"
          onClick={() => setActiveId(null)}
        >
          { (cutoutUrl ?? personUrl) && (
            <img
              src={(cutoutUrl ?? personUrl) as string}
              alt="person"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
          )}

          {layers.map((l) => (
            <div
              key={l.id}
              onMouseDown={(e) => onMouseDown(e, l.id)}
              onClick={(e) => { e.stopPropagation(); setActiveId(l.id); }}
              style={{
                position: "absolute",
                left: l.x,
                top: l.y,
                transform: `translate(-50%, -50%) scale(${l.scale}) rotate(${l.rotate}deg)`,
                zIndex: l.z,
                cursor: "grab",
              }}
            >
               <div style={{
                outline: activeId === l.id ? "2px dashed hsl(var(--primary))" : "none",
                outlineOffset: '4px',
                borderRadius: '8px',
                transition: 'outline 0.2s'
              }}>
                <img src={l.src} alt={l.label} className="w-full select-none pointer-events-none" draggable={false} />
              </div>
            </div>
          ))}
          
           {!personUrl && (
             <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-8 text-center">
              Upload a photo of yourself to begin the virtual try-on experience.
            </div>
           )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground text-center">
          Click a garment to select it. Drag to move.
        </p>
      </div>
    </div>
  );
}
