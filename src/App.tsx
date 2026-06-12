import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Sparkles, 
  Smile, 
  HelpCircle, 
  Download, 
  Upload, 
  BookOpen, 
  Check, 
  RefreshCw, 
  FileText, 
  Image as ImageIcon, 
  Flame, 
  MessageSquare, 
  Compass, 
  AlertCircle,
  Pencil,
  Trash2,
  Save,
  Heart
} from "lucide-react";
import { MemeText, MemeTemplate, GlossaryItem, SavedMeme } from "./types";
import { PRESET_TEMPLATES, FUNNY_SUGGESTIONS } from "./templatesData";
import staticGlossary from "./data/glossario.json";
import { translateText, generateCaptions, generateComic } from "./api/groq";
import MemeCanvas from "./components/MemeCanvas";

const getSafeImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  return url;
};

export default function App() {
  // Application State
  const [templates, setTemplates] = useState<MemeTemplate[]>(PRESET_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(PRESET_TEMPLATES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [texts, setTexts] = useState<MemeText[]>(PRESET_TEMPLATES[0]?.defaultTexts?.map((t, idx) => ({
    ...t,
    id: `default-${idx}`
  })) || []);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:3">("1:1");

  // Glossary and Translation States
  const [glossary, setGlossary] = useState<GlossaryItem[]>(staticGlossary);
  const [activeGlossaryTab, setActiveGlossaryTab] = useState<string>("all");
  const [searchWord, setSearchWord] = useState<string>("");
  const [italianInput, setItalianInput] = useState<string>("");
  const [translationResult, setTranslationResult] = useState<{ translated: string; explanation: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Database CRUD States for the Glossary
  const [newWord, setNewWord] = useState<string>("");
  const [newWordDefinition, setNewWordDefinition] = useState<string>("");
  const [newWordUsage, setNewWordUsage] = useState<string>("");
  const [newWordPhraseMean, setNewWordPhraseMean] = useState<string>("");
  const [isEditingWord, setIsEditingWord] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Suggested captions & Comic states
  const [memeTheme, setMemeTheme] = useState<string>("Stanchezza");
  const [suggestedCaptions, setSuggestedCaptions] = useState<{ text: string; tags: string[] }[]>([]);
  const [isLoadingCaptions, setIsLoadingCaptions] = useState<boolean>(false);
  const [comicThemeInput, setComicThemeInput] = useState<string>("La Bidonata");
  const [comicScript, setComicScript] = useState<{ title: string; panels: { panel: number; prompt: string; dialogue: string }[] } | null>(null);
  const [isGeneratingComic, setIsGeneratingComic] = useState<boolean>(false);
  
  // App alerts/notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Gallery state loaded from localStorage
  const [gallery, setGallery] = useState<SavedMeme[]>(() => {
    try {
      const saved = localStorage.getItem("spoletino_meme_gallery");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Setup dictionary and generate initial captions
  useEffect(() => {
    setGlossary(staticGlossary);
    // Generate initial captions
    fetchCaptions("Generico");
  }, []);

  // Update texts when template changes
  const selectTemplate = (tpl: MemeTemplate) => {
    setSelectedTemplate(tpl);
    setCustomImage(null);
    if (tpl.defaultTexts) {
      setTexts(tpl.defaultTexts.map((t, i) => ({
        ...t,
        id: `tpl-${tpl.id}-${i}-${Date.now()}`
      })));
    } else {
      setTexts([]);
    }
    setSelectedTextId(null);
    showNotice(`Meme caricato: ${tpl.name}`, "info");
  };

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
          setSelectedTemplate(null);
          setTexts([
            {
              id: `custom-text-${Date.now()}`,
              text: "DAJE COSSÌ!",
              x: 50,
              y: 80,
              fontSize: 26,
              color: "#ffffff",
              outlineColor: "#000000",
              backgroundColor: "transparent",
              isBubble: false,
              bubbleType: "plain",
              rotation: 0
            }
          ]);
          setSelectedTextId(null);
          showNotice("Immagine caricata con successo!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to trigger custom state alerts
  const showNotice = (msg: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(prev => prev?.message === msg ? null : prev);
    }, 4500);
  };

  // Fetch AI generated captions on a requested topic
  const fetchCaptions = async (topic: string) => {
    setIsLoadingCaptions(true);
    try {
      const data = await generateCaptions(topic);
      setSuggestedCaptions(data);
    } catch {
      // Fallback
      setSuggestedCaptions([
        { text: `Senti che fiauru de ${topic}!`, tags: [topic, "sia"] },
        { text: `Ma che stai a stroligà de ${topic}?`, tags: [topic, "stroligà"] },
        { text: `Oggidì me sbatte proprio la fatica de la ${topic}!`, tags: [topic, "fatica"] },
        { text: `C'ho 'na freca de roba da di' su la ${topic}!`, tags: [topic, "freca"] }
      ]);
    } finally {
      setIsLoadingCaptions(false);
    }
  };

  // Call the AI Translate API
  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!italianInput.trim()) return;

    setIsTranslating(true);
    setTranslationResult(null);

    try {
      const data = await translateText(italianInput);
      setTranslationResult(data);
      showNotice("Traduzione completata!", "success");
    } catch (err: any) {
      showNotice("Impossibile contattare il traduttore AI. Usato traduttore locale.", "error");
      setTranslationResult({
        translated: `Ma che stai a di'? Me pare d'ascoltà un strolucu!`,
        explanation: "Modalità offline: configura la chiave d'API del modello per ottenere traduzioni perfette ed elaborate dall'assistente Gemini."
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Call the AI Comic Dialogue API
  const handleGenerateComicScript = async () => {
    setIsGeneratingComic(true);
    try {
      const data = await generateComic(comicThemeInput);
      setComicScript(data);
      showNotice("Sceneggiatura di fumetto generata!", "success");
    } catch {
      setComicScript({
        title: "Disavventura de lu Bardascio",
        panels: [
          { panel: 1, prompt: "Due amici all'ombra de la Rocca Albornoziana", dialogue: "A: Ma andò sta lu strolucu de Mario?" },
          { panel: 2, prompt: "Un amico tira fuori un pezzo di pane con affettato rinfrescante", dialogue: "B: Mario è rimasto a casa ciocio ciocio! Dice che tira 'na sgricia." },
          { panel: 3, prompt: "I due iniziano a mangiare contenti", dialogue: "A: Meglio così, c'avemo 'na freca de capocollo tutta per noi!" }
        ]
      });
    } finally {
      setIsGeneratingComic(false);
    }
  };

  // Load a comic script dialogue directly onto the active canvas
  const applyComicDialogue = (dialogueText: string, panelNum: number) => {
    const freshBubble: MemeText = {
      id: `comic-speech-${Date.now()}`,
      text: dialogueText,
      x: panelNum === 1 ? 25 : panelNum === 2 ? 50 : 75,
      y: 35 + (panelNum * 10) % 30,
      fontSize: 18,
      color: "#000000",
      outlineColor: "#000000",
      backgroundColor: "#ffffff",
      isBubble: true,
      bubbleType: "speech",
      rotation: panelNum === 1 ? -4 : panelNum === 2 ? 0 : 4
    };
    setTexts(prev => [...prev, freshBubble]);
    setSelectedTextId(freshBubble.id);
    showNotice(`Aggiunta battuta del Pannello ${panelNum} come nuvoletta!`);
  };

  // Add a brand new plain or bubble text
  const addNewText = (isBubble: boolean = false) => {
    const newText: MemeText = {
      id: `text-${Date.now()}`,
      text: isBubble ? "Che m'hai a di'?" : "INFOLLATO DA LA FRECA",
      x: 50,
      y: 50,
      fontSize: isBubble ? 18 : 28,
      color: isBubble ? "#000000" : "#ffffff",
      outlineColor: isBubble ? "#000000" : "#000000",
      backgroundColor: isBubble ? "#ffffff" : "transparent",
      isBubble,
      bubbleType: "speech",
      rotation: 0
    };
    setTexts(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    showNotice(isBubble ? "Nuvoletta fumetto aggiunta!" : "Testo classico aggiunto!");
  };

  // Generate and export image via canvas drawing API
  const handleExportJPG = () => {
    const canvasElement = document.createElement("canvas");
    const container = document.getElementById("meme-canvas-render-target");
    if (!container) {
      showNotice("Errore nell'inizializzare il motore di rendering", "error");
      return;
    }

    const { width, height } = container.getBoundingClientRect();
    // Use double resolution for sharp high quality image
    const scale = 2;
    canvasElement.width = width * scale;
    canvasElement.height = height * scale;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Dynamic Image background rendering function
    const drawContent = () => {
      // 1. Draw solid backdrop or gradient
      if (customImage || selectedTemplate?.url) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = getSafeImageUrl(customImage || selectedTemplate?.url || "");
        bgImg.onload = () => {
          // Draw image cropped cleanly
          const imgRatio = bgImg.width / bgImg.height;
          const canvasRatio = width / height;
          let dx = 0, dy = 0, dWidth = width, dHeight = height;

          if (imgRatio > canvasRatio) {
            const tempWidth = height * imgRatio;
            dx = (width - tempWidth) / 2;
            dWidth = tempWidth;
          } else {
            const tempHeight = width / imgRatio;
            dy = (height - tempHeight) / 2;
            dHeight = tempHeight;
          }

          ctx.drawImage(bgImg, dx, dy, dWidth, dHeight);
          drawAllTexts();
        };
        bgImg.onerror = () => {
          // Fallback to gradient if image fails
          drawGradientBg();
          drawAllTexts();
        };
      } else {
        drawGradientBg();
        drawAllTexts();
      }
    };

    const drawGradientBg = () => {
      if (selectedTemplate?.gradient) {
        // Simple linear parsing
        const grad = ctx.createLinearGradient(0, 0, width, height);
        if (selectedTemplate.id === "spoleto-sunset") {
          grad.addColorStop(0, "#d97706");
          grad.addColorStop(1, "#7f1d1d");
        } else if (selectedTemplate.id === "ponte-torri") {
          grad.addColorStop(0, "#111827");
          grad.addColorStop(1, "#3b82f6");
        } else if (selectedTemplate.id === "classic-drake") {
          grad.addColorStop(0, "#ef4444");
          grad.addColorStop(1, "#3b82f6");
        } else {
          grad.addColorStop(0, "#1c1917");
          grad.addColorStop(1, "#0c0a09");
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "#FF5F1F"; // Brutalist color backup
      }
      ctx.fillRect(0, 0, width, height);
    };

    const drawAllTexts = () => {
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = words[0] || "";

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + " " + word;
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth < maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines;
      };

      texts.forEach((t) => {
        const px = (t.x / 100) * width;
        const py = (t.y / 100) * height;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((t.rotation * Math.PI) / 180);

        if (t.isBubble) {
          // Draw Comic bubble
          ctx.font = `bold ${t.fontSize}px sans-serif`;

          // Wrap text inside 200px limit (bubbles usually max-w-[280px] including padding)
          const lines = wrapText(t.text, 200);
          const lineHeight = t.fontSize * 1.25;
          const totalTextHeight = lines.length * lineHeight;

          // Compute box width based on the longest wrapped line
          const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
          const textWidth = Math.max(130, maxLineWidth + 30);
          const textHeight = totalTextHeight + 25;
          const bx = -textWidth / 2;
          const by = -textHeight / 2;

          // Bubble background & shadow
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 4;
          ctx.fillStyle = t.backgroundColor || "#ffffff";
          ctx.strokeStyle = t.outlineColor || "#000000";
          ctx.lineWidth = 3;

          // Rounded bubble rect
          ctx.beginPath();
          ctx.roundRect(bx, by, textWidth, textHeight, 14);
          ctx.fill();
          ctx.shadowColor = "transparent"; // Reset shadow
          ctx.stroke();

          // Tail for speech bubble
          if (t.bubbleType === "speech") {
            ctx.fillStyle = t.backgroundColor || "#ffffff";
            ctx.strokeStyle = t.outlineColor || "#000000";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10, textHeight / 2);
            ctx.lineTo(0, textHeight / 2 + 12);
            ctx.lineTo(10, textHeight / 2);
            ctx.stroke();
            ctx.fill();
          }

          // Render multiline text inside bubble
          ctx.fillStyle = t.color || "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          lines.forEach((line, index) => {
            // Distribute lines vertically centered inside the bubble
            const ly = by + 12 + (index * lineHeight) + (lineHeight / 2);
            ctx.fillText(line, 0, ly);
          });

        } else {
          // Classic Impact Meme text
          ctx.font = `900 ${t.fontSize}px Arial, Impact, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Wrap classic impact meme text based on 90% of parent width
          const lines = wrapText(t.text.toUpperCase(), width * 0.9);
          const lineHeight = t.fontSize * 1.25;
          const totalTextHeight = lines.length * lineHeight;
          const startY = -totalTextHeight / 2 + lineHeight / 2;

          lines.forEach((line, index) => {
            const ly = startY + index * lineHeight;

            // Shadow or stroke
            if (t.outlineColor && t.outlineColor !== "transparent") {
              ctx.strokeStyle = t.outlineColor;
              ctx.lineWidth = 5;
              ctx.strokeText(line, 0, ly);
            }
            ctx.fillStyle = t.color;
            ctx.fillText(line, 0, ly);
          });
        }
        ctx.restore();
      });

      // Export trigger
      try {
        const url = canvasElement.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `spoleto_meme_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotice("Meme scaricato con successo!", "success");
      } catch (err: any) {
        showNotice("Errore durante il download. Alcune immagini esterne potrebbero bloccare l'esportazione.", "error");
      }
    };

    drawContent();
  };

  // Gallery CRUD functions and local storage management
  const generateMemeThumbnail = (callback: (dataUrl: string) => void) => {
    const canvasElement = document.createElement("canvas");
    const container = document.getElementById("meme-canvas-render-target");
    if (!container) {
      showNotice("Errore nell'inizializzare il motore di rendering per la galleria", "error");
      return;
    }

    const { width, height } = container.getBoundingClientRect();
    const scale = 1.5; // Optimized for high fidelity and lower storage footprint
    canvasElement.width = width * scale;
    canvasElement.height = height * scale;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);

    const drawContent = () => {
      if (customImage || selectedTemplate?.url) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = getSafeImageUrl(customImage || selectedTemplate?.url || "");
        bgImg.onload = () => {
          const imgRatio = bgImg.width / bgImg.height;
          const canvasRatio = width / height;
          let dx = 0, dy = 0, dWidth = width, dHeight = height;

          if (imgRatio > canvasRatio) {
            const tempWidth = height * imgRatio;
            dx = (width - tempWidth) / 2;
            dWidth = tempWidth;
          } else {
            const tempHeight = width / imgRatio;
            dy = (height - tempHeight) / 2;
            dHeight = tempHeight;
          }

          ctx.drawImage(bgImg, dx, dy, dWidth, dHeight);
          drawAllTexts();
        };
        bgImg.onerror = () => {
          drawGradientBg();
          drawAllTexts();
        };
      } else {
        drawGradientBg();
        drawAllTexts();
      }
    };

    const drawGradientBg = () => {
      if (selectedTemplate?.gradient) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        if (selectedTemplate.id === "spoleto-sunset") {
          grad.addColorStop(0, "#d97706");
          grad.addColorStop(1, "#7f1d1d");
        } else if (selectedTemplate.id === "ponte-torri") {
          grad.addColorStop(0, "#111827");
          grad.addColorStop(1, "#3b82f6");
        } else if (selectedTemplate.id === "classic-drake") {
          grad.addColorStop(0, "#ef4444");
          grad.addColorStop(1, "#3b82f6");
        } else {
          grad.addColorStop(0, "#1c1917");
          grad.addColorStop(1, "#0c0a09");
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "#FF5F1F";
      }
      ctx.fillRect(0, 0, width, height);
    };

    const drawAllTexts = () => {
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = words[0] || "";

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + " " + word;
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth < maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines;
      };

      texts.forEach((t) => {
        ctx.save();
        ctx.translate((t.x / 100) * width, (t.y / 100) * height);
        ctx.rotate((t.rotation * Math.PI) / 180);

        if (t.isBubble) {
          ctx.font = `bold ${t.fontSize}px Arial, sans-serif`;
          const lines = wrapText(t.text, 220);
          const lineHeight = t.fontSize * 1.25;
          let maxLineWidth = 100;
          lines.forEach((line) => {
            const lineWidth = ctx.measureText(line).width;
            if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
          });

          const textHeight = lines.length * lineHeight;
          const paddingX = 14;
          const paddingY = 10;
          const boxWidth = maxLineWidth + paddingX * 2;
          const boxHeight = textHeight + paddingY * 2;

          const bx = -boxWidth / 2;
          const by = -boxHeight / 2;

          ctx.fillStyle = t.backgroundColor || "#ffffff";
          ctx.strokeStyle = t.outlineColor || "#000000";
          ctx.lineWidth = 3;

          // Draw speech bubble background roundrect
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(bx, by, boxWidth, boxHeight, 12);
          } else {
            ctx.rect(bx, by, boxWidth, boxHeight);
          }
          ctx.fill();
          ctx.stroke();

          if (t.bubbleType === "speech") {
            ctx.fillStyle = t.backgroundColor || "#ffffff";
            ctx.strokeStyle = t.outlineColor || "#000000";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10, boxHeight / 2);
            ctx.lineTo(0, boxHeight / 2 + 12);
            ctx.lineTo(10, boxHeight / 2);
            ctx.stroke();
            ctx.fill();
          }

          ctx.fillStyle = t.color || "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          lines.forEach((line, index) => {
            const ly = by + paddingY + (index * lineHeight) + (lineHeight / 2);
            ctx.fillText(line, 0, ly);
          });
        } else {
          ctx.font = `900 ${t.fontSize}px Arial, Impact, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const lines = wrapText(t.text.toUpperCase(), width * 0.9);
          const lineHeight = t.fontSize * 1.25;
          const totalTextHeight = lines.length * lineHeight;
          const startY = -totalTextHeight / 2 + lineHeight / 2;

          lines.forEach((line, index) => {
            const ly = startY + index * lineHeight;
            if (t.outlineColor && t.outlineColor !== "transparent") {
              ctx.strokeStyle = t.outlineColor;
              ctx.lineWidth = 5;
              ctx.strokeText(line, 0, ly);
            }
            ctx.fillStyle = t.color;
            ctx.fillText(line, 0, ly);
          });
        }
        ctx.restore();
      });

      // Execute callback with data URL
      callback(canvasElement.toDataURL("image/png"));
    };

    drawContent();
  };

  const handleSaveToGallery = () => {
    const container = document.getElementById("meme-canvas-render-target");
    if (!container) {
      showNotice("Impossibile trovare l'elemento di montaggio per il salvataggio.", "error");
      return;
    }

    try {
      const defaultTitle = selectedTemplate ? `Meme su ${selectedTemplate.name}` : "Meme Spoletino Personalizzato";
      const title = prompt("Assegna un titolo a questo capolavoro spoletino:", defaultTitle) || defaultTitle;
      
      generateMemeThumbnail((thumbnailData) => {
        const newMeme: SavedMeme = {
          id: `meme-${Date.now()}`,
          title: title,
          timestamp: Date.now(),
          thumbnail: thumbnailData,
          template: selectedTemplate,
          customImage: customImage,
          texts: JSON.parse(JSON.stringify(texts)), // Deep copy of texts
          aspectRatio: aspectRatio
        };

        const updatedGallery = [newMeme, ...gallery];
        setGallery(updatedGallery);
        localStorage.setItem("spoletino_meme_gallery", JSON.stringify(updatedGallery));
        showNotice("Meme aggiunto alla Galleria locale!", "success");
      });
    } catch (err: any) {
      console.error(err);
      showNotice("Errore durante il salvataggio in Galleria.", "error");
    }
  };

  const handleDeleteFromGallery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Sei sicuro de volé eliminà questo meme dalla Galleria?")) return;
    const updated = gallery.filter(item => item.id !== id);
    setGallery(updated);
    localStorage.setItem("spoletino_meme_gallery", JSON.stringify(updated));
    showNotice("Meme eliminato dalla Galleria!", "success");
  };

  const handleLoadFromGallery = (item: SavedMeme) => {
    if (confirm(`Vuoi caricare '${item.title}' nell'editor? Questo sostituirà il fumetto corrente.`)) {
      setSelectedTemplate(item.template);
      setCustomImage(item.customImage || null);
      setTexts(item.texts);
      setAspectRatio(item.aspectRatio);
      setSelectedTextId(null);
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      showNotice(`Fumetto '${item.title}' caricato nell'editor!`, "success");
    }
  };

  // Preset Spoleto dialect buttons to quickly stamp text on comic
  const stampWordOnCanvas = (word: string, meaning: string) => {
    const newBubble: MemeText = {
      id: `glos-stamp-${Date.now()}`,
      text: word.toUpperCase() + "!",
      x: 35 + Math.random() * 30,
      y: 40 + Math.random() * 20,
      fontSize: 22,
      color: "#000000",
      outlineColor: "#000000",
      backgroundColor: "#ffffff",
      isBubble: true,
      bubbleType: "speech",
      rotation: Math.floor(Math.random() * 20) - 10
    };
    setTexts(prev => [...prev, newBubble]);
    setSelectedTextId(newBubble.id);
    showNotice(`Parola '${word}' stampata sul fumetto!`);
  };

  // Database CRUD client handlers
  const handleSaveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newWordDefinition.trim() || !newWordUsage.trim() || !newWordPhraseMean.trim()) {
      showNotice("Tutti i campi sono obbligatori pe' sarbà la parola!", "error");
      return;
    }

    try {
      const newGlossaryItem = {
        word: newWord.trim(),
        definition: newWordDefinition.trim(),
        usage: newWordUsage.trim(),
        phraseMean: newWordPhraseMean.trim()
      };
      
      let updatedGlossary = [...glossary];
      const existingIndex = updatedGlossary.findIndex(item => item.word.toLowerCase() === newGlossaryItem.word.toLowerCase());
      
      if (existingIndex !== -1) {
        updatedGlossary[existingIndex] = newGlossaryItem;
      } else {
        updatedGlossary.unshift(newGlossaryItem);
      }
      
      setGlossary(updatedGlossary);
      
      showNotice(
        isEditingWord 
          ? `Parola '${newWord}' modificata nel database!` 
          : `Parola '${newWord}' aggiunta al database spoletino!`, 
        "success"
      );

      // Reset form
      setNewWord("");
      setNewWordDefinition("");
      setNewWordUsage("");
      setNewWordPhraseMean("");
      setIsEditingWord(null);
      setShowAddForm(false);
    } catch (err: any) {
      showNotice(`Errore: ${err.message}`, "error");
    }
  };

  const handleDeleteWord = async (wordToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid stamping word
    if (!confirm(`Sei sicuro de volé cancellà '${wordToDelete}' dal database?`)) {
      return;
    }

    try {
      const updatedGlossary = glossary.filter(item => item.word.toLowerCase() !== wordToDelete.toLowerCase());
      setGlossary(updatedGlossary);
      showNotice(`Parola '${wordToDelete}' cancellata dal database!`, "success");
    } catch (err: any) {
      showNotice(`Errore: ${err.message}`, "error");
    }
  };

  const handleStartEditWord = (item: GlossaryItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid stamping
    setNewWord(item.word);
    setNewWordDefinition(item.definition);
    setNewWordUsage(item.usage);
    setNewWordPhraseMean(item.phraseMean);
    setIsEditingWord(item.word);
    setShowAddForm(true);
  };

  // Filter dictionary glossary
  const filteredGlossary = glossary.filter(item => {
    const matchSearch = item.word.toLowerCase().includes(searchWord.toLowerCase()) || 
                        item.definition.toLowerCase().includes(searchWord.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FF5F1F] font-sans text-black p-4 md:p-6 select-none flex flex-col">
      {/* Alert Notification System */}
      {notification && (
        <div 
          id="toast-notification"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md ${
            notification.type === "success" ? "bg-green-300" : 
            notification.type === "error" ? "bg-red-300" : "bg-yellow-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold text-sm tracking-tight">{notification.message}</p>
        </div>
      )}

      {/* Hero Header bar */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-4 border-black bg-white p-4 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 border-2 border-black p-2 font-black rotate-[-3deg] text-xs">
            DAJE FORTE!
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic flex items-center gap-2">
              BARDASCI MEME <span className="text-xs font-mono font-medium lowercase not-italic bg-black text-white px-2 py-0.5 rounded ml-1">v1.2</span>
            </h1>
            <p className="text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
              Crea fumetti, caricature e meme nel verace dialetto del Festival dei Due Mondi
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <label className="bg-sky-300 border-4 border-black px-4 py-2 text-sm font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-sky-200 cursor-pointer transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> Importa Foto
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </label>
          <button
            onClick={() => {
              // Clear state of custom text
              setCustomImage(null);
              setSelectedTemplate(PRESET_TEMPLATES[0]);
              setTexts(PRESET_TEMPLATES[0].defaultTexts?.map((t, idx) => ({ ...t, id: `default-${idx}` })) || []);
              setSelectedTextId(null);
              showNotice("Editor ripristinato!", "info");
            }}
            className="bg-red-400 border-4 border-black px-4 py-2 text-sm font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-300 cursor-pointer transition flex items-center gap-2"
          >
            Nuvo Fumetto
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Layout & Tools & Ideas */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Main Controls Block */}
          <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black mb-3 border-b-4 border-black pb-1.5 uppercase tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> 1. Modifica Oggetti
            </h2>

            <div className="space-y-3.5">
              <button
                onClick={() => addNewText(false)}
                className="w-full bg-stone-900 text-white hover:bg-stone-800 border-2 border-black p-3 font-bold text-center text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" /> Aggiungi Testo Standard
              </button>

              <button
                onClick={() => addNewText(true)}
                className="w-full bg-emerald-400 hover:bg-emerald-300 border-2 border-black p-3 font-bold text-center text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Aggiungi Nuvoletta
              </button>

              {/* Aspect Ratio choice */}
              <div>
                <label className="block text-xs font-black uppercase text-stone-500 mb-1">Rapporto di Forma</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["1:1", "16:9", "4:3"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1.5 text-xs font-black uppercase border-2 border-black ${
                        aspectRatio === ratio ? "bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template quick preview switcher */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-black uppercase text-stone-500">Scegli uno sfondo tipico</label>
                  {customImage && (
                    <span className="text-[10px] font-black text-rose-600 bg-rose-100 border border-rose-400 px-1.5 rounded uppercase animate-pulse">
                      Foto Personalizzata Attiva
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => selectTemplate(tpl)}
                      title={tpl.name}
                      className={`aspect-square border-2 border-black relative overflow-hidden group hover:scale-105 transition-all ${
                        selectedTemplate?.id === tpl.id && !customImage ? "ring-4 ring-emerald-500 scale-105" : "opacity-60 hover:opacity-100"
                      }`}
                      style={{
                        background: tpl.url ? `url(${getSafeImageUrl(tpl.url)}) center/cover no-repeat` : tpl.gradient || "#ccc"
                      }}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 text-[8px] uppercase tracking-tighter text-white font-bold p-0.5 truncate text-center">
                        {tpl.name}
                      </div>
                    </button>
                  ))}
                  
                  {/* Custom upload button inside the gallery choices */}
                  <label className={`aspect-square border-2 border-dashed border-stone-800 flex flex-col items-center justify-center cursor-pointer transition-all select-none relative group hover:scale-105 ${
                    customImage ? "bg-emerald-100 border-emerald-500 ring-4 ring-emerald-500 scale-105" : "bg-stone-50 hover:bg-stone-100"
                  }`}>
                    <Upload className={`w-5 h-5 group-hover:scale-110 transition-transform ${customImage ? "text-emerald-700" : "text-stone-700"}`} />
                    <span className={`text-[8px] uppercase font-black mt-1 text-center leading-none px-1 ${customImage ? "text-emerald-800" : "text-stone-700"}`}>
                      {customImage ? "Modifica" : "Tua Foto"}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* AI Helper tool: Captions suggested generator */}
          <div className="border-4 border-black bg-yellow-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black mb-1 uppercase tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-700" /> Didascalie Prompt AI
            </h3>
            <p className="text-[11px] font-bold text-stone-700 uppercase mb-3">Genera battute in dialetto per il tuo meme</p>

            <div className="flex gap-1.5 mb-3">
              <select 
                value={memeTheme}
                onChange={(e) => setMemeTheme(e.target.value)}
                className="flex-1 bg-white border-2 border-black p-1.5 text-xs font-bold focus:outline-none"
              >
                <option value="Generico">Generico</option>
                <option value="Cibo">Cibo (Sugo, Tartufi)</option>
                <option value="Stanchezza">Stanchezza (Fatica)</option>
                <option value="Amore">Relazioni (Bucatona/Ciocia)</option>
                <option value="Soldi">Soldi & Lavoro</option>
                <option value="Umorismo">Umorismo (Stroligo)</option>
              </select>
              <button
                onClick={() => fetchCaptions(memeTheme)}
                disabled={isLoadingCaptions}
                className="bg-black text-white hover:bg-stone-800 px-3 py-1 text-xs font-black uppercase flex items-center gap-1"
              >
                {isLoadingCaptions ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Genera"}
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {suggestedCaptions.map((cap, i) => (
                <div
                  key={i}
                  onClick={() => {
                    // Inject this caption directly to the center
                    const textItem: MemeText = {
                      id: `suggest-${i}-${Date.now()}`,
                      text: cap.text,
                      x: 50,
                      y: 70,
                      fontSize: 20,
                      color: "#ffffff",
                      outlineColor: "#000000",
                      backgroundColor: "transparent",
                      isBubble: false,
                      bubbleType: "plain",
                      rotation: 0
                    };
                    setTexts(prev => [...prev, textItem]);
                    setSelectedTextId(textItem.id);
                    showNotice("Aggiunta battuta sul canvas!");
                  }}
                  className="bg-white hover:bg-stone-50 p-2 border-2 border-black cursor-pointer transition text-xs font-bold hover:translate-x-1"
                >
                  <p className="italic text-stone-950">"{cap.text}"</p>
                  <div className="flex gap-1 mt-1 text-[9px] font-mono uppercase text-sky-700">
                    {cap.tags?.map((t, idx) => <span key={idx}>#{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Editor Canvas & Immediate adjustments */}
        <section className="lg:col-span-6 space-y-6 flex flex-col items-center">
          
          {/* Active Canvas Block styled in Brutalist dots backdrop */}
          <div className="w-full border-4 border-black bg-stone-100 p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative canvas-area">
            
            <div className="flex justify-between items-center mb-3">
              <span className="bg-black text-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                🎨 Area di Montaggio
              </span>
              <span className="text-xs font-black uppercase text-stone-600">
                Sfondo: {customImage ? "Foto Personalizzata" : selectedTemplate?.name || "Gradiente Sfondo"}
              </span>
            </div>

            <MemeCanvas
              template={selectedTemplate}
              customImage={customImage}
              texts={texts}
              onTextsChange={setTexts}
              selectedTextId={selectedTextId}
              onSelectText={setSelectedTextId}
              aspectRatio={aspectRatio}
            />

            {/* Quick action buttons below canvas */}
            <div className="mt-5 flex flex-wrap gap-3 justify-between items-center w-full max-w-2xl bg-white p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold uppercase text-stone-600">
                ⭐ Tocca e trascina i testi o girali per comporre la tua opera
              </p>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSaveToGallery}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black px-4 py-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 active:translate-y-0.5 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Salva in Galleria
                </button>
                <button
                  onClick={handleExportJPG}
                  className="bg-green-400 hover:bg-green-300 text-black border-2 border-black px-4 py-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 active:translate-y-0.5 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Immagine (.PNG)
                </button>
              </div>
            </div>
          </div>

          {/* AI Dialogues Comic book storyboard creator */}
          <div className="w-full border-4 border-black bg-sky-200 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black mb-1 uppercase tracking-tight flex items-center gap-1.5 text-stone-900">
              <Sparkles className="w-5 h-5 text-indigo-700 animate-bounce" /> Sceneggiatura di Fumetto in Spoletino
            </h3>
            <p className="text-xs font-semibold text-stone-800 uppercase mb-4">
              Chiedi all'AI di strutturare una divertente storia divisa in tre battute per darti l'ispirazione!
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Es: Litigio al mercato, Incontro a Piazza Duomo..."
                value={comicThemeInput}
                onChange={(e) => setComicThemeInput(e.target.value)}
                className="flex-1 bg-white border-2 border-black p-2 text-xs font-bold uppercase placeholder-stone-400 focus:outline-none"
              />
              <button
                onClick={handleGenerateComicScript}
                disabled={isGeneratingComic}
                className="bg-black text-white hover:bg-stone-800 px-4 py-2 text-xs font-black uppercase flex items-center gap-2"
              >
                {isGeneratingComic ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Genera Storia"}
              </button>
            </div>

            {comicScript ? (
              <div className="border-2 border-black bg-white p-3 space-y-3">
                <div className="flex justify-between items-center bg-yellow-400 border-b-2 border-black p-1.5 -mx-3 -mt-3">
                  <h4 className="font-extrabold uppercase text-xs">TITOLO: {comicScript.title}</h4>
                  <span className="text-[9px] font-mono bg-black text-white px-1.5">DIALOGHI AI</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {comicScript.panels?.map((p, idx) => (
                    <div key={idx} className="border-2 border-black p-2 bg-stone-50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] bg-sky-400 text-black px-1 font-black uppercase mb-1 inline-block">
                          Pannello {p.panel}
                        </span>
                        <p className="text-[10px] italic text-stone-600 line-clamp-2 leading-tight mb-2">"{p.prompt}"</p>
                      </div>
                      <div className="bg-white p-1.5 border border-stone-300 rounded mb-2">
                        <p className="text-xs font-bold text-stone-800 tracking-tight">"{p.dialogue}"</p>
                      </div>
                      <button
                        onClick={() => applyComicDialogue(p.dialogue, p.panel)}
                        className="w-full bg-emerald-300 hover:bg-emerald-400 border border-black py-0.5 text-[9px] font-black uppercase text-center"
                      >
                        Applica Battuta
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 border-2 border-dashed border-stone-400 bg-white/70">
                <p className="text-xs font-bold text-stone-600 uppercase">
                  Nessuna sceneggiatura attiva. Digita un argomento e clicca "Genera Storia".
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Interactive Dialect Dictionary Translator & Glossary stamp */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* AI Translator Engine Box */}
          <div className="border-4 border-black bg-emerald-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black mb-1 uppercase tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-800" /> Traduttore AI Spoletino
            </h3>
            <p className="text-xs font-bold uppercase text-stone-800 mb-3">Converte istantaneamente la tua frase in dialetto!</p>

            <form onSubmit={handleTranslate} className="space-y-3">
              <textarea
                placeholder="Scrivi una frase in Italiano... es. 'Oggi sono molto stanco'"
                value={italianInput}
                onChange={(e) => setItalianInput(e.target.value)}
                rows={2}
                className="w-full bg-white border-2 border-black p-2 text-xs font-semibold focus:outline-none placeholder-stone-400"
              />
              <button
                type="submit"
                disabled={isTranslating || !italianInput.trim()}
                className="w-full bg-black text-white hover:bg-stone-800 p-2 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                {isTranslating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Traduci in Spoletino"}
              </button>
            </form>

            {translationResult && (
              <div className="mt-3 bg-white border-2 border-black p-3 space-y-2">
                <div className="bg-yellow-400 p-2 border border-black">
                  <span className="text-[9px] font-mono uppercase bg-black text-white px-1.5 py-0.5">Dialetto Spoletino</span>
                  <p className="font-extrabold text-base text-stone-900 mt-1">"{translationResult.translated}"</p>
                </div>
                
                <p className="text-[10px] text-stone-700 leading-tight">
                  <span className="font-bold">Spiegazione:</span> {translationResult.explanation}
                </p>

                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      // Apply translated dialetto to canvas
                      const item: MemeText = {
                        id: `transl-item-${Date.now()}`,
                        text: translationResult.translated,
                        x: 50,
                        y: 75,
                        fontSize: 20,
                        color: "#000000",
                        outlineColor: "#ffffff",
                        backgroundColor: "#ffffff",
                        isBubble: true,
                        bubbleType: "speech",
                        rotation: 0
                      };
                      setTexts(prev => [...prev, item]);
                      setSelectedTextId(item.id);
                      showNotice("Traduzione applicata al fumetto!");
                    }}
                    className="flex-1 bg-sky-300 hover:bg-sky-400 border border-black text-[9px] py-1 font-black uppercase text-center"
                  >
                    Usa come nuvoletta
                  </button>
                  <button
                    onClick={() => {
                      // Apply plain text to canvas
                      const item: MemeText = {
                        id: `transl-item-${Date.now()}`,
                        text: translationResult.translated.toUpperCase(),
                        x: 50,
                        y: 15,
                        fontSize: 24,
                        color: "#ffffff",
                        outlineColor: "#000000",
                        backgroundColor: "transparent",
                        isBubble: false,
                        bubbleType: "plain",
                        rotation: 0
                      };
                      setTexts(prev => [...prev, item]);
                      setSelectedTextId(item.id);
                      showNotice("Traduzione applicata come testo meme!");
                    }}
                    className="flex-1 bg-stone-900 hover:bg-stone-800 text-white border border-black text-[9px] py-1 font-black uppercase text-center"
                  >
                    Usa come testo meme
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dictionary glossary stamp box */}
          <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <h3 className="text-lg font-black mb-1 uppercase tracking-tight flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-indigo-700" /> Lu Dizionariettu Spoletino
            </h3>
            <p className="text-xs font-bold text-stone-600 uppercase mb-3">
              Tocca una parola per stamparla come nuvoletta di fumetto!
            </p>

            <div className="flex gap-1.5 mb-3">
              <input
                type="text"
                placeholder="Cerca parola o significato..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="flex-1 bg-stone-50 border-2 border-black p-2 text-xs font-black uppercase placeholder-stone-400 focus:outline-none"
              />
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (showAddForm) {
                    setIsEditingWord(null);
                    setNewWord("");
                    setNewWordDefinition("");
                    setNewWordUsage("");
                    setNewWordPhraseMean("");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-black px-3 py-1 text-xs font-black uppercase text-center cursor-pointer transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              >
                {showAddForm ? "Chiudi" : "➕ Nuvo DB"}
              </button>
            </div>

            {/* Dynamic INSERT/UPDATE Form */}
            {showAddForm && (
              <form onSubmit={handleSaveWord} className="mb-4 bg-amber-50 border-2 border-black p-3 space-y-2.5">
                <div className="flex justify-between items-center border-b-2 border-black pb-1">
                  <h4 className="text-xs font-black uppercase text-indigo-900 tracking-tight">
                    {isEditingWord ? "✏️ Modifica Parola DB" : "➕ Nuova Parola nel DB"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setIsEditingWord(null);
                      setNewWord("");
                      setNewWordDefinition("");
                      setNewWordUsage("");
                      setNewWordPhraseMean("");
                    }}
                    className="text-stone-500 hover:text-black font-black uppercase text-[9px] border border-black px-1.5 bg-white"
                  >
                    Annulla
                  </button>
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-stone-500 mb-0.5">Parola Spoletina</label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    disabled={!!isEditingWord}
                    placeholder="es: Fiauru"
                    className="w-full bg-white border-2 border-black px-1.5 py-1 text-xs font-bold uppercase placeholder-stone-400 focus:outline-none disabled:bg-stone-250 disabled:text-stone-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-stone-500 mb-0.5">Definizione Italiana</label>
                  <input
                    type="text"
                    value={newWordDefinition}
                    onChange={(e) => setNewWordDefinition(e.target.value)}
                    placeholder="es: Buona fragranza / profumo"
                    className="w-full bg-white border-2 border-black px-1.5 py-1 text-xs font-bold placeholder-stone-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-stone-500 mb-0.5">Frase Spoletina d'Uso</label>
                  <input
                    type="text"
                    value={newWordUsage}
                    onChange={(e) => setNewWordUsage(e.target.value)}
                    placeholder="es: Che fiauru de sugo cocito!"
                    className="w-full bg-white border-2 border-black px-1.5 py-1 text-xs font-bold placeholder-stone-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-stone-500 mb-0.5">Traduzione Italiana</label>
                  <input
                    type="text"
                    value={newWordPhraseMean}
                    onChange={(e) => setNewWordPhraseMean(e.target.value)}
                    placeholder="es: Che profumo di sugo cotto!"
                    className="w-full bg-white border-2 border-black px-1.5 py-1 text-xs font-bold placeholder-stone-400 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black py-1 px-2 font-black uppercase text-xs text-center cursor-pointer transition shadow-[2px_2px_0px_0px_#000]"
                >
                  {isEditingWord ? "Aggiorna nel DB" : "Salva nel DB Locale"}
                </button>
              </form>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredGlossary.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => stampWordOnCanvas(item.word, item.definition)}
                  className="dialect-tag group bg-stone-50 hover:bg-yellow-100 p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition flex flex-col"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-sm uppercase text-indigo-900 group-hover:text-amber-700">
                      {item.word}
                    </span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-bold text-stone-500 uppercase mr-1 truncate max-w-[100px]" title={item.definition}>
                        ➡️ ({item.definition})
                      </span>
                      <button
                        title="Modifica Parola nel DB"
                        onClick={(e) => handleStartEditWord(item, e)}
                        className="p-1 border border-black bg-stone-100 hover:bg-yellow-300 transition text-stone-700 cursor-pointer"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <button
                        title="Cancella dal DB"
                        onClick={(e) => handleDeleteWord(item.word, e)}
                        className="p-1 border border-black bg-red-100 hover:bg-red-400 text-red-700 hover:text-white transition cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-600 italic">
                    <span className="font-semibold not-italic text-stone-500">Uso: </span> "{item.usage}"
                  </p>
                  <p className="text-[9px] font-mono text-stone-500 leading-none mt-1">
                    Significato: {item.phraseMean}
                  </p>
                </div>
              ))}
              {filteredGlossary.length === 0 && (
                <p className="text-center text-xs font-semibold uppercase text-stone-400 py-4">
                  Nessun vocabolo corrispondente
                </p>
              )}
            </div>

            <div className="mt-3 p-2 bg-yellow-100 border-2 border-black text-[10px] font-semibold text-stone-700">
              <span className="font-black">Lo sapevi?</span> Il termine <span className="font-black">"strolucu"</span> (strologo) a Spoleto si usa affettuosamente per chi dà consigli strampalati o parla in modo strano!
            </div>
          </div>
        </aside>
      </main>

      {/* Galleria dei Capolavori Section */}
      <section id="galleria-capolavori" className="mt-12 mb-6 border-4 border-black bg-stone-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" /> La Galleria de li Capolavori
            </h2>
            <p className="text-xs md:text-sm font-bold text-stone-700 uppercase tracking-wide">
              I tuoi meme e vignette salvati localmente. Riaprili nell'editor pe' modificalli o scaricali di nuovo!
            </p>
          </div>
          <span className="bg-black text-white px-3 py-1 text-xs font-mono font-bold uppercase rounded">
            💾 Meme salvati: {gallery.length}
          </span>
        </div>

        {gallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-square bg-stone-900 border-b-4 border-black flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="object-contain w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-yellow-400 text-black border-2 border-black text-[9px] font-mono uppercase font-bold px-1.5 py-0.5">
                    {item.aspectRatio}
                  </div>
                  <button
                    onClick={(e) => handleDeleteFromGallery(item.id, e)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-400 text-white border-2 border-black p-1.5 transition shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
                    title="Elimina dalla Galleria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info and load actions */}
                <div className="p-3 bg-stone-50 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold uppercase text-sm text-stone-900 tracking-tight line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase mt-0.5">
                      Salvato il: {new Date(item.timestamp).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>

                  <div className="flex gap-2 w-full mt-1">
                    <button
                      onClick={() => handleLoadFromGallery(item)}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black py-1.5 text-xs font-black uppercase text-center cursor-pointer transition shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5"
                    >
                      ✏️ Modifica
                    </button>
                    <a
                      href={item.thumbnail}
                      download={`galleria_spoleto_${item.id}.png`}
                      className="flex-1 bg-green-400 hover:bg-green-300 text-black border-2 border-black py-1.5 text-xs font-black uppercase text-center cursor-pointer transition shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5 text-center flex items-center justify-center"
                    >
                      ⬇️ Scarica
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-4 border-dashed border-black/30 bg-stone-100 flex flex-col items-center justify-center gap-3">
            <Smile className="w-12 h-12 text-stone-400 animate-bounce" />
            <p className="font-black text-sm text-stone-600 uppercase tracking-widest leading-none">
              La Galleria è ancora vuota, stroloco!
            </p>
            <p className="text-xs font-semibold text-stone-500 uppercase leading-snug">
              Crea un meme quassù e premi il pulsante "Salva in Galleria" per metterlo in mostra qui!
            </p>
          </div>
        )}
      </section>

      {/* Footer styled as a classic brutalist layout */}
      <footer className="mt-8 pt-4 border-t-4 border-black flex flex-col md:flex-row justify-between items-center text-[11px] uppercase font-bold tracking-widest text-black/90 gap-2">
        <div className="bg-black text-white px-3 py-1 font-mono">
          BARDASCI MEME CO. &copy; 2026
        </div>
        <div>
          CRAFTED WITH AMORE, BRUTALISMO & DIALETTU SPOLETINO IN UMBRIA
        </div>
      </footer>
    </div>
  );
}
