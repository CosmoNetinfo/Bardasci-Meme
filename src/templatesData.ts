import { MemeTemplate, GlossaryItem } from "./types";

export const PRESET_TEMPLATES: MemeTemplate[] = [
  {
    id: "duomo-spoleto",
    name: "Il Duomo (Vista Piazza)",
    category: "spoleto_places",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Piazza_del_Duomo_%28Spoleto%29_1.jpg", // Majestic overview of the Duomo down the square stairs
    gradient: "linear-gradient(to bottom, #fef3c7, #b45309)", // Golden facade colors
    defaultTexts: [
      { text: "CHE BELLO LU DUOMO DE SPOLETO!", x: 50, y: 12, fontSize: 22, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "Me sbatte proprio la fatica oggidì!", x: 50, y: 88, fontSize: 20, color: "#fef08a", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "duomo-frontale",
    name: "Il Duomo (Vista Facciata)",
    category: "spoleto_places",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Spoleto_Duomo_Assunta_L_02.jpg", // Beautiful portrait front view of the cathedral facade
    gradient: "linear-gradient(to bottom, #eff6ff, #dbeafe)",
    defaultTexts: [
      { text: "QUANNO ESCI FORRRE DA LU DUOMO...", x: 50, y: 15, fontSize: 20, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "...e te pija la stanchezza!", x: 50, y: 85, fontSize: 22, color: "#ffffff", outlineColor: "#000000", backgroundColor: "rgba(0,0,0,0.5)", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "piazza-garibaldi",
    name: "Piazza Garibaldi",
    category: "spoleto_places",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Spoleto_-_Piazza_Garibaldi_-_San_Gregorio_Maggiore_-_statue.jpg", // Monument to Garibaldi with church
    gradient: "linear-gradient(to bottom, #bae6fd, #0284c7)",
    defaultTexts: [
      { text: "I compari di Piazza Garibaldi!", x: 50, y: 12, fontSize: 18, color: "#ffffff", outlineColor: "#000000", backgroundColor: "rgba(0,0,0,0.6)", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "Ma m'ha bidonato colossale oggidì!", x: 50, y: 88, fontSize: 18, color: "#f9a8d4", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "ponte-torri",
    name: "Ponte delle Torri",
    category: "spoleto_places",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Ponte_delle_torri.jpg", // Panoramic scenic bridge view
    gradient: "linear-gradient(to bottom, #111827, #3b82f6)", // Sky and landscape depth
    defaultTexts: [
      { text: "SOPRA LU PONTE DELLE TORRI...", x: 50, y: 15, fontSize: 22, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "Tira 'na sgricia che te pija lu panico!", x: 50, y: 80, fontSize: 20, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "ponte-tramonto",
    name: "Il Ponte al Tramonto",
    category: "spoleto_places",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Ponte_delle_Torri_Spoleto_Umbria.jpg", // Sunset bridge & Rocca
    gradient: "linear-gradient(to bottom, #d97706, #7f1d1d)", // Warm Umbrian Sun
    defaultTexts: [
      { text: "CHE FIAMMA DE TRAMONTO!", x: 50, y: 15, fontSize: 22, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "Andamo a magnasse 'na schiacciata!", x: 50, y: 82, fontSize: 20, color: "#fef08a", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "discesa-duomo",
    name: "Discesa al Duomo",
    category: "spoleto_places",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/0_Cath%C3%A9drale_de_Spoleto_-_Piazza_del_Duomo_2.jpg", // alley descending to Duomo Piazza
    gradient: "linear-gradient(to bottom, #ffffff, #78716c)",
    defaultTexts: [
      { text: "QUANDO TI METTI IN GHINGHERI", x: 50, y: 10, fontSize: 18, color: "#000000", outlineColor: "#ffffff", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "E sbrigli giù per via dell'Arringo!", x: 50, y: 90, fontSize: 18, color: "#ffffff", outlineColor: "#000000", backgroundColor: "#000000", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "meme-drake",
    name: "Drake Dilemma",
    category: "classic",
    url: "https://api.imgflip.com/s/meme/Drake-Hotline-Bling.jpg",
    gradient: "linear-gradient(to bottom, #f97316, #b45309)",
    defaultTexts: [
      { text: "Lavorà de venerdì pomeriggio oggidì", x: 74, y: 25, fontSize: 15, color: "#000000", outlineColor: "transparent", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "Fà lu strolucu per le vie di Spoleto", x: 74, y: 75, fontSize: 15, color: "#000000", outlineColor: "transparent", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "meme-distracted",
    name: "Fidanzato Distratto",
    category: "classic",
    url: "https://api.imgflip.com/s/meme/Distracted-Boyfriend.jpg",
    gradient: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
    defaultTexts: [
      { text: "LU MINISTRO", x: 30, y: 75, fontSize: 14, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "TECCHIATA DE STROZZAPRETI", x: 80, y: 65, fontSize: 13, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "LA DIETA SALUTARE", x: 52, y: 56, fontSize: 12, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "meme-two-buttons",
    name: "Due Pulsanti",
    category: "classic",
    url: "https://api.imgflip.com/s/meme/Two-Buttons.jpg",
    gradient: "linear-gradient(to bottom, #ef4444, #991b1b)",
    defaultTexts: [
      { text: "Andà a lavorà", x: 32, y: 28, fontSize: 12, color: "#000000", outlineColor: "transparent", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: -10 },
      { text: "Fà lo strolucu", x: 62, y: 24, fontSize: 12, color: "#000000", outlineColor: "transparent", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: -10 },
      { text: "BARDASCIO IN CRISI", x: 50, y: 85, fontSize: 15, color: "#ffffff", outlineColor: "#000000", backgroundColor: "rgba(0,0,0,0.5)", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "meme-woman-cat",
    name: "Donna contro Gatto",
    category: "classic",
    url: "https://api.imgflip.com/s/meme/Woman-Yelling-At-Cat.jpg",
    gradient: "linear-gradient(to bottom, #ec4899, #be185d)",
    defaultTexts: [
      { text: "M'avevi detto che offrivi la cena!", x: 25, y: 20, fontSize: 14, color: "#ffffff", outlineColor: "#000000", backgroundColor: "rgba(0,0,0,0.6)", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "Ma io c'ho solo 'na cipolla!", x: 75, y: 20, fontSize: 14, color: "#ffffff", outlineColor: "#000000", backgroundColor: "rgba(0,0,0,0.6)", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "meme-change-mind",
    name: "Cambia la mia idea",
    category: "classic",
    url: "https://api.imgflip.com/s/meme/Change-My-Mind.jpg",
    gradient: "linear-gradient(to bottom, #10b981, #047857)",
    defaultTexts: [
      { text: "Il capocollo spoletino batte qualsiasi salume al mondo.\n\nCHANGE MY MIND", x: 65, y: 40, fontSize: 12, color: "#000000", outlineColor: "transparent", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "meme-roll-safe",
    name: "Roll Safe (Cervellone)",
    category: "classic",
    url: "https://api.imgflip.com/s/meme/Roll-Safe-Think-About-It.jpg",
    gradient: "linear-gradient(to bottom, #1e293b, #0f172a)",
    defaultTexts: [
      { text: "Non te ponno bidonà", x: 50, y: 15, fontSize: 18, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "se non c'hai l'appuntamento!", x: 50, y: 82, fontSize: 18, color: "#fbe53e", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  },
  {
    id: "sagace-elder",
    name: "L'Anziano della Spina",
    category: "characters",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    gradient: "linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)", // Paper board
    defaultTexts: [
      { text: "Non fa' lo strolucu...", x: 50, y: 20, fontSize: 24, color: "#8d6e63", outlineColor: "transparent", backgroundColor: "rgba(255,255,255,0.9)", isBubble: true, bubbleType: "speech", rotation: 2 }
    ]
  },
  {
    id: "cinghiale-umbro",
    name: "Lu Cinghiale Birbante",
    category: "characters",
    url: "https://images.unsplash.com/photo-1590418606746-018840f9cd0f?auto=format&fit=crop&q=80&w=600", // Stable Unsplash photo of forest wild animal/boar, loads perfectly
    gradient: "linear-gradient(135deg, #115e59 0%, #134e4a 100%)", // Umbrian deep woods
    defaultTexts: [
      { text: "Quanno te frecano le fichi", x: 50, y: 15, fontSize: 22, color: "#ffffff", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 },
      { text: "E fai finta de gnente!", x: 50, y: 80, fontSize: 22, color: "#2dd4bf", outlineColor: "#000000", backgroundColor: "transparent", isBubble: false, bubbleType: "plain", rotation: 0 }
    ]
  }
];

export const STATIC_GLOSSARY: GlossaryItem[] = [
  { word: "Strolucu", definition: "Uomo strambo o eccentrico", usage: "Ma che stai a di', fai meno lo strolucu!", phraseMean: "Non parlare a vanvera, fai meno lo strano!" },
  { word: "Ciocia", definition: "Bagnato fradicio o sciatto/pigro", usage: "Chiudi quel rubinetto sennò me diventi 'na ciocia!", phraseMean: "Chiudi il rubinetto altrimenti ti bagni tutto!" },
  { word: "Sgricia", definition: "Freddo gelido o nevischio", usage: "Coprite bene che tira 'na sgricia tremenda!", phraseMean: "Copriti bene perché fa un freddo cane!" },
  { word: "Bardascio", definition: "Bambino o ragazzino", usage: "Quel bardascio sta sempre a freca' le ciliegie.", phraseMean: "Quel fanciullo ruba sempre le ciliegie." },
  { word: "Lu tito", definition: "Il dito", usage: "M'ho schiacciato lu tito co' la porta!", phraseMean: "Mi sono schiacciato il dito con la porta!" },
  { word: "Fiauru", definition: "Profumo o odore intenso", usage: "Senti che fiauru de sugo cocito arvène da là!", phraseMean: "Senti che profumo di sugo cotto giunge da là!" },
  { word: "Bidonà", definition: "Truffare o non presentarsi a un appuntamento", usage: "M'ha bidonato pure stavorta, m'ha lasciato lì come uno strolucu.", phraseMean: "Mi ha dato buca anche questa volta, mi ha lasciato lì ad attendere come un tonto." },
  { word: "Freca", definition: "Rubare, o indicare una grande quantità ('na freca)", usage: "C'era 'na freca de gente a la sfilata!", phraseMean: "C'era un sacco di gente alla sfilata!" },
  { word: "In ghingheri", definition: "Vestito in ghingheri, elegante", usage: "Andò vai così in ghingheri stasera?", phraseMean: "Dove vai tutto elegante stasera?" },
  { word: "Arvené", definition: "Tornare, ritornare indietro", usage: "Arvène presto che la polenta s'ammoscia!", phraseMean: "Ritorna presto che la polenta si raffredda!" }
];

export const FUNNY_SUGGESTIONS = [
  "C'ho 'na freca de fame, jamo a magnà li strozzapreti!",
  "Ma che stai a stroligà? Penza a lavorà!",
  "Maria m'ha bidonato stavorta, sto arrapato de rabbia!",
  "Me sbatte proprio oggidì la fatica, me ne stò lì ciocio ciocio.",
  "Mettete lu cappottino che tira 'na sgricia da far gelasse pure li titi!",
  "Senti che fiauru de tartufo nero spoletino!"
];
