import React, { useRef, useState, useEffect } from "react";
import { MemeText, MemeTemplate } from "../types";
import { Move, RotateCw, Trash2, Type, MessageSquare, Cloud, Flame, Edit3 } from "lucide-react";

interface MemeCanvasProps {
  template: MemeTemplate | null;
  customImage: string | null;
  texts: MemeText[];
  onTextsChange: (texts: MemeText[]) => void;
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  aspectRatio: "1:1" | "16:9" | "4:3";
}

const getSafeImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http")) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export default function MemeCanvas({
  template,
  customImage,
  texts,
  onTextsChange,
  selectedTextId,
  onSelectText,
  aspectRatio
}: MemeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; startPercentX: number; startPercentY: number } | null>(null);
  const [rotateState, setRotateState] = useState<{ id: string; startAngle: number; startMouseAngle: number } | null>(null);

  // Derive aspect ratio tailwind classes
  const aspectClass = 
    aspectRatio === "16:9" ? "aspect-video" : 
    aspectRatio === "4:3" ? "aspect-[4/3]" : 
    "aspect-square";

  // Prevent default scroll behavior on mobile touch movements
  useEffect(() => {
    const preventTouch = (e: TouchEvent) => {
      if (dragState || rotateState) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventTouch, { passive: false });
    return () => document.removeEventListener("touchmove", preventTouch);
  }, [dragState, rotateState]);

  // Handle Drag Start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, text: MemeText) => {
    e.stopPropagation();
    onSelectText(text.id);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      id: text.id,
      startX: clientX,
      startY: clientY,
      startPercentX: text.x,
      startPercentY: text.y,
    });
  };

  // Handle Rotate Start
  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent, text: MemeText) => {
    e.stopPropagation();
    onSelectText(text.id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const itemCenterX = rect.left + (rect.width * text.x) / 100;
    const itemCenterY = rect.top + (rect.height * text.y) / 100;

    // Calculate current mouse angle relative to text center
    const dx = clientX - itemCenterX;
    const dy = clientY - itemCenterY;
    const mouseAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    setRotateState({
      id: text.id,
      startAngle: text.rotation,
      startMouseAngle: mouseAngle,
    });
  };

  // Handle Mouse/Touch move globally
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (dragState) {
        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = clientX - dragState.startX;
        const deltaY = clientY - dragState.startY;

        const deltaPercentX = (deltaX / rect.width) * 100;
        const deltaPercentY = (deltaY / rect.height) * 100;

        let newX = Math.min(100, Math.max(0, dragState.startPercentX + deltaPercentX));
        let newY = Math.min(100, Math.max(0, dragState.startPercentY + deltaPercentY));

        onTextsChange(texts.map(t => t.id === dragState.id ? { ...t, x: newX, y: newY } : t));
      }

      if (rotateState) {
        const rect = containerRef.current.getBoundingClientRect();
        const targetText = texts.find(t => t.id === rotateState.id);
        if (!targetText) return;

        const itemCenterX = rect.left + (rect.width * targetText.x) / 100;
        const itemCenterY = rect.top + (rect.height * targetText.y) / 100;

        const dx = clientX - itemCenterX;
        const dy = clientY - itemCenterY;
        const currentMouseAngle = Math.atan2(dy, dx) * (180 / Math.PI);

        const deltaAngle = currentMouseAngle - rotateState.startMouseAngle;
        let newRotation = (rotateState.startAngle + deltaAngle) % 360;

        onTextsChange(texts.map(t => t.id === rotateState.id ? { ...t, rotation: newRotation } : t));
      }
    };

    const handleEnd = () => {
      if (dragState) setDragState(null);
      if (rotateState) setRotateState(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [dragState, rotateState, texts, onTextsChange]);

  // Text attribute edits
  const handleTextValueChange = (id: string, val: string) => {
    onTextsChange(texts.map(t => t.id === id ? { ...t, text: val } : t));
  };

  const deleteText = (id: string) => {
    onTextsChange(texts.filter(t => t.id !== id));
    if (selectedTextId === id) onSelectText(null);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Target Canvas Container */}
      <div
        id="meme-canvas-render-target"
        ref={containerRef}
        onClick={() => onSelectText(null)}
        className={`relative w-full max-w-2xl bg-stone-900 border-2 border-stone-800 rounded-lg overflow-hidden shadow-xl transition-all duration-300 ${aspectClass}`}
        style={{
          background: customImage
            ? `url(${customImage}) center center / cover no-repeat`
            : template?.url
            ? `url(${getSafeImageUrl(template.url)}) center center / cover no-repeat`
            : template?.gradient || "linear-gradient(to right, #1c1917, #0c0a09)"
        }}
      >
        {/* Visual Overlay if using fallback gradient */}
        {!template?.url && !customImage && (
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)" }} />
        )}

        {/* Floating texts */}
        {texts.map((t) => {
          const isSelected = selectedTextId === t.id;
          
          return (
            <div
              key={t.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectText(t.id);
              }}
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                transform: `translate(-50%, -50%) rotate(${t.rotation}deg)`,
                cursor: "move"
              }}
              className={`absolute p-2 select-none group transition-shadow flex flex-col items-center justify-center ${
                t.isBubble ? "w-max max-w-[90%]" : "w-[90%]"
              } ${
                isSelected ? "ring-2 ring-emerald-500 rounded-md z-30 bg-opacity-100" : "hover:ring-1 hover:ring-emerald-300/60 z-10"
              }`}
            >
              {/* Comic Speech / Thought Bubble styles */}
              {t.isBubble ? (
                <div
                  style={{
                    backgroundColor: t.backgroundColor || "#ffffff",
                    borderColor: t.outlineColor || "#000000",
                    color: t.color || "#000000",
                    fontSize: `${t.fontSize}px`
                  }}
                  className={`relative p-3 min-w-[120px] max-w-[280px] font-sans font-medium text-center border-3 rounded-2xl shadow-md ${
                    t.bubbleType === "shout" ? "border-red-600 font-bold tracking-wide scale-110 animate-pulse bg-red-50" : "border-stone-950"
                  }`}
                >
                  {/* Speech Bubble Arrow */}
                  {t.bubbleType === "speech" && (
                    <div 
                      style={{ borderTopColor: t.backgroundColor || "#ffffff" }}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-stone-950" 
                    />
                  )}
                  {t.bubbleType === "speech" && (
                    <div 
                      style={{ borderTopColor: t.backgroundColor || "#ffffff" }}
                      className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[11px]" 
                    />
                  )}

                  {/* Thought Bubble Small dots */}
                  {t.bubbleType === "thought" && (
                    <div className="absolute -bottom-4 left-1/3 flex flex-col gap-1 items-center">
                      <div className="w-3 h-3 rounded-full border-2 border-stone-950 bg-white shadow-sm" />
                      <div className="w-1.5 h-1.5 rounded-full border-2 border-stone-950 bg-white" />
                    </div>
                  )}

                  {/* Shout Spike effect */}
                  {t.bubbleType === "shout" && (
                    <div className="absolute inset-0 -z-10 bg-amber-400 border-2 border-red-600 scale-105 rounded-xl opacity-20 transform rotate-3" />
                  )}

                  <div className="relative flex items-center justify-center min-h-[1.25em] w-full">
                    {!isSelected ? (
                      <span className="select-text px-1 whitespace-pre-wrap break-words">
                        {t.text || "Scrivi qui..."}
                      </span>
                    ) : (
                      <textarea
                        value={t.text}
                        onChange={(e) => handleTextValueChange(t.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Scrivi qui..."
                        rows={1}
                        className="w-full bg-transparent focus:outline-none text-center border-none placeholder-stone-400 p-0 m-0 resize-none overflow-hidden h-auto font-medium focus:ring-0"
                        style={{ fontStyle: t.bubbleType === "thought" ? "italic" : "normal" }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = `${el.scrollHeight}px`;
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* Classic Meme Impact Text Overlay */
                <div
                  style={{
                    color: t.color,
                    fontSize: `${t.fontSize}px`,
                    textShadow: t.outlineColor && t.outlineColor !== "transparent" ? `2px 2px 0px ${t.outlineColor}, -2px -2px 0px ${t.outlineColor}, 2px -2px 0px ${t.outlineColor}, -2px 2px 0px ${t.outlineColor}` : "none",
                    backgroundColor: t.backgroundColor !== "transparent" ? t.backgroundColor : "transparent"
                  }}
                  className="relative font-sans font-extrabold uppercase tracking-tight text-center whitespace-pre-wrap break-words w-full"
                >
                  {!isSelected ? (
                    <span className="select-text px-2 uppercase leading-tight">
                      {t.text || "TESTO MEME"}
                    </span>
                  ) : (
                    <textarea
                      value={t.text}
                      onChange={(e) => handleTextValueChange(t.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="TESTO MEME"
                      rows={1}
                      className="w-full bg-transparent text-center focus:outline-none select-text border-none cursor-text uppercase p-0 m-0 leading-tight resize-none overflow-hidden h-auto font-extrabold focus:ring-0"
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                    />
                  )}
                </div>
              )}

              {/* Manipulation Handles visible when selected */}
              {isSelected && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-stone-950 text-white rounded-full p-1 border border-stone-800 shadow-xl z-40">
                  <button
                    type="button"
                    onMouseDown={(e) => handleDragStart(e, t)}
                    onTouchStart={(e) => handleDragStart(e, t)}
                    title="Trascina"
                    className="p-1 hover:bg-stone-800 text-yellow-400 rounded-full cursor-move"
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => handleRotateStart(e, t)}
                    onTouchStart={(e) => handleRotateStart(e, t)}
                    title="Ruota"
                    className="p-1 hover:bg-stone-800 text-sky-400 rounded-full cursor-spin"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteText(t.id)}
                    title="Elimina"
                    className="p-1 hover:bg-red-900 text-red-400 rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor Controls Box */}
      {selectedTextId && (
        <div id="text-edit-panel" className="mt-4 w-full max-w-2xl bg-white p-4 rounded-xl border border-stone-200 shadow-md">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
            <h4 className="font-semibold text-stone-800 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" /> Modifica Testo Selezionato
            </h4>
            <button
              onClick={() => deleteText(selectedTextId)}
              className="text-xs flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition"
            >
              <Trash2 className="w-3" /> Elimina
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Styles and layout */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Testo della Battuta</label>
                <input
                  type="text"
                  value={texts.find(t => t.id === selectedTextId)?.text || ""}
                  onChange={(e) => handleTextValueChange(selectedTextId, e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-bold rounded-md border-2 border-black focus:outline-none focus:bg-stone-50 text-stone-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  placeholder="Modifica o scrivi qui il testo completo in dialetto..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Meme o Fumetto</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, isBubble: false, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent" } : t));
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 ${
                      !texts.find(t => t.id === selectedTextId)?.isBubble
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <Type className="w-3" /> Meme Classico
                  </button>
                  <button
                    onClick={() => {
                      onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, isBubble: true, color: "#000000", outlineColor: "#000000", backgroundColor: "#ffffff" } : t));
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 ${
                      texts.find(t => t.id === selectedTextId)?.isBubble
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <MessageSquare className="w-3" /> Vignetta
                  </button>
                </div>
              </div>

              {texts.find(t => t.id === selectedTextId)?.isBubble && (
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Stile Bolla</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["speech", "thought", "shout", "plain"] as const).map((bType) => (
                      <button
                        key={bType}
                        onClick={() => {
                          onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, bubbleType: bType } : t));
                        }}
                        className={`py-1 text-[10px] font-bold rounded capitalize ${
                          texts.find(t => t.id === selectedTextId)?.bubbleType === bType
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        {bType === "speech" && "Parlato"}
                        {bType === "thought" && "Pensato"}
                        {bType === "shout" && "Urlo"}
                        {bType === "plain" && "Piatto"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Dimensione Carattere (px)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={texts.find(t => t.id === selectedTextId)?.fontSize || 20}
                    onChange={(e) => {
                      const num = parseInt(e.target.value);
                      onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, fontSize: num } : t));
                    }}
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-800">
                    {texts.find(t => t.id === selectedTextId)?.fontSize || 20}px
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Colors and attributes */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Colore Testo</label>
                <div className="flex gap-2">
                  {["#ffffff", "#000000", "#facc15", "#f87171", "#60a5fa", "#4ade80"].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => {
                        onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, color: hex } : t));
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-6 h-6 rounded-full border-2 ${
                        texts.find(t => t.id === selectedTextId)?.color === hex
                          ? "border-emerald-500 scale-110"
                          : "border-stone-300"
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    title="Colore personalizzato"
                    value={texts.find(t => t.id === selectedTextId)?.color || "#ffffff"}
                    onChange={(e) => {
                      onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, color: e.target.value } : t));
                    }}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Contorno / Bordo</label>
                <div className="flex gap-2">
                  {["#000000", "#ffffff", "transparent", "#ef4444", "#1e3a8a"].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => {
                        onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, outlineColor: hex } : t));
                      }}
                      style={{ backgroundColor: hex === "transparent" ? "#ffffff" : hex }}
                      className={`w-6 h-6 rounded border ${
                        texts.find(t => t.id === selectedTextId)?.outlineColor === hex
                          ? "border-emerald-500 scale-110"
                          : "border-stone-300"
                      } relative ${hex === "transparent" ? "overflow-hidden" : ""}`}
                    >
                      {hex === "transparent" && (
                        <div className="absolute inset-0 bg-red-400 rotate-45 h-0.5 top-1/2 left-0 right-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Rotazione (Gradi)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={texts.find(t => t.id === selectedTextId)?.rotation || 0}
                    onChange={(e) => {
                      const num = parseInt(e.target.value);
                      onTextsChange(texts.map(t => t.id === selectedTextId ? { ...t, rotation: num } : t));
                    }}
                    className="w-full accent-sky-600"
                  />
                  <span className="text-xs font-mono font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-800">
                    {texts.find(t => t.id === selectedTextId)?.rotation || 0}°
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
