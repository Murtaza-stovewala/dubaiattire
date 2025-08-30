"use client";

import { useEffect, useRef, useState } from "react";

type Garment = {
  id: string;
  label: string;
  src: string;
  // default placement/scaling
  x: number; // px from left
  y: number; // px from top
  scale: number; // 1 = 100%
  rotate: number; // degrees
  z: number; // layer order
};

// NOTE: Make sure these PNG files exist in your `public/cloth/` directory.
const CATALOG: Garment[] = [
  { id: "kurta1", label: "Blue Kurta", src: "/cloth/kurta1.png", x: 260, y: 250, scale: 1.5, rotate: 0, z: 10 },
  { id: "blazer1", label: "Black Blazer", src: "/cloth/blazer1.png", x: 260, y: 240, scale: 1.6, rotate: 0, z: 12 },
  { id: "pants1", label: "Beige Pants", src: "/cloth/pants1.png", x: 260, y: 450, scale: 1.5, rotate: 0, z: 8 },
];

export default function VirtualTrialClient() {
  const stageRef = useRef<HTMLDivElement>(null);
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

  const handleUpload = (file: File | null) => {
    setPersonFile(file);
    setCutoutUrl(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPersonUrl(url);
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
      const url = URL.createObjectURL(blob);
      setCutoutUrl(url);
    } catch (e: any) {
      console.error(e);
      alert(`Background removal failed: ${e.message}`);
    } finally {
      setLoadingCutout(false);
    }
  };

  const addLayer = (g: Garment) => {
    const unique = { ...g, id: `${g.id}-${crypto.randomUUID()}` };
    setLayers((prev) => [...prev, unique]);
    setActiveId(unique.id);
  };

  const dragInfo = useRef<{ id: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const target = layers.find((l) => l.id === id);
    if (!target || !stageRef.current) return;
    
    const stageRect = stageRef.current.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    dragInfo.current = { id, startX: sx, startY: sy, baseX: target.x, baseY: target.y };
    setActiveId(id);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragInfo.current || !stageRef.current) return;
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

  const updateActive = (patch: Partial<Omit<Garment, 'id' | 'label' | 'src'>>) => {
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
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(stage, { backgroundColor: null, scale: 2 });
      const data = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = data;
      a.download = "dubai-royal-attire-try-on.png";
      a.click();
    } catch (e) {
      console.error("Failed to export PNG:", e);
      alert("Could not export image. Please try again.");
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
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
          />
          <button
            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={!personFile || loadingCutout}
            onClick={callRemoveBg}
          >
            {loadingCutout ? "Processing..." : "Remove Background"}
          </button>
        </div>

        <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground">
          <h2 className="text-lg font-headline font-semibold">2. Add Garments</h2>
          <div className="flex flex-wrap gap-2">
            {CATALOG.map((g) => (
              <button
                key={g.id}
                onClick={() => addLayer(g)}
                className="px-3 py-1.5 rounded-md border bg-secondary hover:bg-accent hover:text-accent-foreground text-sm"
              >
                + {g.label}
              </button>
            ))}
          </div>
        </div>

        {activeLayer && (
          <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground">
            <h2 className="text-lg font-headline font-semibold">3. Adjust Layer</h2>
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
              <button onClick={removeActive} className="flex-1 px-3 py-2 rounded-md border text-sm">
                Remove
              </button>
              <button onClick={exportPNG} className="flex-1 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm">
                Export as PNG
              </button>
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
          { (cutoutUrl ?? personUrl) ? (
            <img
              src={(cutoutUrl ?? personUrl) as string}
              alt="person"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Upload a photo to begin
            </div>
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
                width: 300, // Fixed width for consistent scaling reference
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
        </div>

        <p className="mt-2 text-xs text-muted-foreground text-center">
          Click a garment to select it. Drag to move.
        </p>
      </div>
    </div>
  );
}
