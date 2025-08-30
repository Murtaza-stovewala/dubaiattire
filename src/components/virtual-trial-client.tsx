
"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Upload, Shirt, Scissors } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import html2canvas from "html2canvas";

type Garment = {
  id: string;
  label: string;
  src: string; // This will now be a data URL from canvas
  x: number;
  y: number;
  scale: number;
  rotate: number;
  z: number;
};

// These are now templates/masks. They should be simple, transparent PNG outlines.
const GARMENT_TEMPLATES = [
    { id: "kurta-template", label: "Kurta", maskSrc: "/cloth/kurtanew_mask.png", shadingSrc: "/cloth/kurtanew_shading.png", borderSrc: "/cloth/kurtanew_border.png" },
    { id: "blazer-template", label: "Blazer", maskSrc: "/cloth/blazer1_mask.png", shadingSrc: "/cloth/blazer1_shading.png", borderSrc: "/cloth/blazer1_border.png" },
    { id: "sherwani-template", label: "Sherwani", maskSrc: "/cloth/sherwani1_mask.png", shadingSrc: "/cloth/sherwani1_shading.png", borderSrc: "/cloth/sherwani1_border.png" },
    { id: "pants-template", label: "Pants", maskSrc: "/cloth/pants1_mask.png", shadingSrc: "/cloth/pants1_shading.png", borderSrc: "/cloth/pants1_border.png" },
];


export default function VirtualTrialClient() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personUrl, setPersonUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [loadingCutout, setLoadingCutout] = useState(false);
  
  const [fabricFile, setFabricFile] = useState<File | null>(null);
  const [fabricUrl, setFabricUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof GARMENT_TEMPLATES)[0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [layers, setLayers] = useState<Garment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (personUrl) URL.revokeObjectURL(personUrl);
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
      if (fabricUrl) URL.revokeObjectURL(fabricUrl);
    };
  }, [personUrl, cutoutUrl, fabricUrl]);

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

  const handleFabricUpload = (file: File | null) => {
    setFabricFile(file);
    if(file){
        if (fabricUrl) URL.revokeObjectURL(fabricUrl); // Revoke old URL
        setFabricUrl(URL.createObjectURL(file));
    } else {
        setFabricUrl(null);
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

  const applyFabricToTemplate = async (maskSrc: string, fabricSrc: string, shadingSrc: string, borderSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Could not get canvas context");
  
      const loadImage = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = (err) => rej(new Error(`Failed to load image: ${src}. ${err.toString()}`));
        img.src = src;
      });
  
      Promise.all([loadImage(maskSrc), loadImage(fabricSrc), loadImage(shadingSrc), loadImage(borderSrc)])
        .then(([mask, fabric, shading, border]) => {
          if (mask.width === 0 || mask.height === 0) {
            return reject(new Error('Mask image has zero dimensions. Is it a valid PNG?'));
          }
          canvas.width = mask.width;
          canvas.height = mask.height;
  
          // 1. Fill with fabric
          const pattern = ctx.createPattern(fabric, "repeat");
          if (!pattern) return reject(new Error('Could not create fabric pattern.'));
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          // 2. Mask the kurta
          ctx.globalCompositeOperation = "destination-in";
          ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  
          // 3. Add shading (Multiply)
          ctx.globalCompositeOperation = "multiply";
          ctx.drawImage(shading, 0, 0, canvas.width, canvas.height);
  
          // 4. Add outline
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(border, 0, 0, canvas.width, canvas.height);
  
          resolve(canvas.toDataURL("image/png"));
        })
        .catch(reject);
    });
  };

  const handleGenerateGarment = async () => {
    if (!selectedTemplate || !fabricUrl) {
      toast({ variant: "destructive", title: "Missing selection", description: "Please select a garment and upload a fabric." });
      return;
    }
    setIsGenerating(true);
    try {
      const { maskSrc, shadingSrc, borderSrc } = selectedTemplate;
      const texturedGarmentSrc = await applyFabricToTemplate(maskSrc, fabricUrl, shadingSrc, borderSrc);
      const newGarment: Garment = {
        id: `${selectedTemplate.id}-${crypto.randomUUID()}`,
        label: selectedTemplate.label,
        src: texturedGarmentSrc,
        x: 260, y: 350, scale: 1.5, rotate: 0, z: 10,
      };
      setLayers(prev => [...prev, newGarment]);
      setActiveId(newGarment.id);
    } catch(e: any) {
      console.error(e);
      toast({ variant: "destructive", title: "Generation Failed", description: e.message || "Could not apply fabric to the garment." });
    } finally {
        setIsGenerating(false);
    }
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
    setActiveId(null);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5"/> 1. Upload Your Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              {loadingCutout ? <Loader2 className="animate-spin" /> : <><Scissors className="w-4 h-4 mr-2"/>Remove Background</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shirt className="w-5 h-5"/> 2. Design Garment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <label className="text-sm font-medium mb-2 block">Select Template</label>
                <div className="flex flex-wrap gap-2">
                    {GARMENT_TEMPLATES.map((g) => (
                      <Button
                        key={g.id}
                        variant={selectedTemplate?.id === g.id ? "default" : "outline"}
                        onClick={() => setSelectedTemplate(g)}
                      >
                        {g.label}
                      </Button>
                    ))}
                </div>
             </div>
             <div>
                <label className="text-sm font-medium mb-2 block">Upload Fabric</label>
                 <input
                  type="file"
                  accept="image/*"
                  className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  onChange={(e) => handleFabricUpload(e.target.files?.[0] ?? null)}
                />
             </div>
             {fabricUrl && 
                <div className="flex justify-center">
                    <Image src={fabricUrl} alt="Fabric swatch" width={80} height={80} className="rounded-md object-cover w-20 h-20 border" />
                </div>
              }
             <Button className="w-full" onClick={handleGenerateGarment} disabled={!selectedTemplate || !fabricUrl || isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin" /> : <><Wand2 className="w-4 h-4 mr-2"/>Generate Garment</>}
             </Button>
          </CardContent>
        </Card>

        {activeLayer && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">3. Adjust & Export</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-x-2 gap-y-3 items-center">
                  <label className="text-sm">Scale</label>
                  <input
                    type="range" min={0.2} max={3} step={0.01}
                    value={activeLayer.scale}
                    onChange={(e) => updateActive({ scale: parseFloat(e.target.value) })}
                    className="col-span-2 accent-primary"
                  />

                  <label className="text-sm">Rotate</label>
                  <input
                    type="range" min={-45} max={45} step={0.5}
                    value={activeLayer.rotate}
                    onChange={(e) => updateActive({ rotate: parseFloat(e.target.value) })}
                    className="col-span-2 accent-primary"
                  />

                  <label className="text-sm">Layer</label>
                  <input
                    type="range" min={1} max={30} step={1}
                    value={activeLayer.z}
                    onChange={(e) => updateActive({ z: parseInt(e.target.value, 10) })}
                    className="col-span-2 accent-primary"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={removeActive} variant="outline" className="flex-1">
                    Remove
                  </Button>
                  <Button onClick={exportPNG} className="flex-1">
                    Export as PNG
                  </Button>
                </div>
            </CardContent>
          </Card>
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
                width: 300, // Give layers a consistent base width for scaling
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

    