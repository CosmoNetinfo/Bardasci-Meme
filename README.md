<div align="center">

# 🎭 Bardasci Meme

**Crea fumetti, caricature e meme nel verace dialetto del Festival dei Due Mondi**

[![Made with React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*"Jamo ì! Crea lu tuo meme spoletino!"*

![Bardasci Meme Screenshot](https://upload.wikimedia.org/wikipedia/commons/e/ea/Piazza_del_Duomo_%28Spoleto%29_1.jpg)

</div>

---

## 🗣️ Cos'è

**Bardasci Meme** è un generatore di meme e fumetti in dialetto spoletino — il dialetto umbro parlato a Spoleto (PG), ricco di latinismi e con una cantilena inconfondibile.

L'app combina un editor visuale drag-and-drop con l'intelligenza artificiale per:
- tradurre frasi dall'italiano al dialetto spoletino autentico
- generare didascalie meme sul tema che vuoi
- creare sceneggiature di fumetti in 3 pannelli
- consultare e arricchire il glossario spoletino (42+ parole)

---

## ✨ Feature

| Feature | Descrizione |
|---|---|
| 🖼️ **Editor meme** | Canvas drag-and-drop con testi mobili e ruotabili |
| 💬 **Bolle fumetto** | Speech, thought, shout — trascinabili sul canvas |
| 📐 **Aspect ratio** | 1:1, 16:9, 4:3 selezionabili |
| 🏛️ **Template Spoleto** | Duomo, Ponte delle Torri, Piazza Garibaldi e altri luoghi iconici |
| 🎭 **Meme classici** | Drake, Distracted BF, Woman-Cat, Roll Safe... in versione spoletina |
| 📤 **Upload immagine** | Carica la tua foto e aggiungici il dialetto |
| 🤖 **Traduzione AI** | Italiano → Spoletino autentico con spiegazione dei vocaboli |
| ✏️ **Didascalie AI** | Genera 4 battute spoletine su qualsiasi tema |
| 📖 **Fumetti AI** | Sceneggiatura 3 pannelli pronta da disegnare |
| 📚 **Glossario** | 42+ voci spoletine con definizione, uso e significato |
| 💾 **Gallery locale** | Salva i tuoi meme preferiti |
| ⬇️ **Export PNG** | Download ad alta risoluzione (2x) |

---

## 🚀 Come iniziare

### Prerequisiti
- Node.js 18+
- Una API key Gemini (gratis su [Google AI Studio](https://aistudio.google.com)) o Groq (gratis su [console.groq.com](https://console.groq.com))

### Installazione

```bash
# Clona la repo
git clone https://github.com/CosmoNetinfo/Bardasci-Meme.git
cd Bardasci-Meme

# Installa le dipendenze
npm install

# Configura la chiave API
cp .env.example .env.local
# Modifica .env.local e inserisci la tua GEMINI_API_KEY o GROQ_API_KEY
```

### Avvio in sviluppo

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

### Build di produzione

```bash
npm run build
npm run preview
```

---

## ⚙️ Configurazione

Crea un file `.env.local` nella root del progetto:

```env
# Gemini (Google AI Studio — gratis, 500 req/giorno)
GEMINI_API_KEY=your_gemini_api_key_here

# Oppure Groq (gratis, no carta, 14.400 req/giorno, più veloce)
# VITE_GROQ_API_KEY=your_groq_api_key_here
```

L'app funziona anche **senza chiave API** grazie al dizionario offline integrato — le traduzione saranno meno elaborate ma sempre in spoletino autentico.

---

## 🏗️ Struttura del progetto

```text
Bardasci-Meme/
├── src/
│   ├── components/
│   │   └── MemeCanvas.tsx    # Canvas editor con drag/rotate
│   ├── App.tsx               # Componente principale (1500+ righe)
│   ├── types.ts              # Tipi TypeScript
│   ├── templatesData.ts      # Template e glossario statico
│   └── index.css             # Tailwind
├── server.ts                 # Backend Express (API AI + glossario CRUD)
├── index.html
├── vite.config.ts
├── package.json
└── .env.example
```

---

## 🗣️ Il dialetto spoletino

Lo spoletino è il dialetto dell'Umbria storica, parlato a Spoleto e nel Ducato di Spoleto. Ha caratteristiche fonetiche uniche:

- **Articolo `lu`** al posto di "il/lo" (dal latino *illum*)
- **Finali in -u**: gatto → *gattu*, vino → *vinu*
- **`nd` → `nn`**: quando → *quanno*, andare → *annà*  
- **`l` impura → `r`**: molto → *mordo*, altro → *artru*
- **Latinismi veri**: *meco* (con me), *teco* (con te), *possu* (dopo)
- **Rafforzativo finale `-ì`**: andiamo → *jemo ì!*

### Vocaboli iconici nell'app

| Parola | Significato |
|---|---|
| **Strolucu** | Persona strana/eccentrica |
| **Ciocia** | Bagnato fradicio |
| **Sgricia** | Freddo gelido, nevischio |
| **Bardascio** | Bambino, ragazzino |
| **Bidonà** | Dare buca, fregare |
| **Freca** | Gran quantità / rubare |
| **In ghingheri** | Vestito elegante |
| **Arvène** | Ritorna |
| **Fiauru** | Profumo intenso |
| **Mesamianno** | Non vedo l'ora |

*Vocabolario basato sul Grande Vocabolario del Dialetto Spoletino (Cuzzini Neri & Gentili, 2008, 1014 pp.)*

---

## 🤝 Contribuire

Pull request benvenute! In particolare:

- **Nuove parole nel glossario** — apri una PR con la voce in `src/templatesData.ts`
- **Nuovi template spoletini** — foto di Spoleto da Wikimedia Commons (licenza libera)
- **Fix bug** — see [Issues](https://github.com/CosmoNetinfo/Bardasci-Meme/issues)

### Aggiungere una parola al glossario

```typescript
// In src/templatesData.ts, aggiungi a STATIC_GLOSSARY:
{
  word: "NuovaParola",
  definition: "Significato in italiano",
  usage: "Frase d'esempio in spoletino",
  phraseMean: "Traduzione della frase d'esempio"
}
```

---

## 📄 Licenza

MIT © [CosmoNetinfo](https://github.com/CosmoNetinfo) — [DanyWolf](https://www.cosmonet.info/)

---

## 🔗 Link utili

- 🌐 **Blog:** [cosmonet.info](https://www.cosmonet.info/)
- 📺 **Articolo:** [Bardasci Meme su CosmoNet](https://www.cosmonet.info/)
- 💬 **Telegram:** [@cosmo_net](https://t.me/cosmo_net)
- 🎭 **Duo Pere Cotogne** — esperti di doppiaggio in spoletino: [perecotogne.com](https://www.perecotogne.com/)

---

<div align="center">

*"Che te pija un corbu bisestile così dura quattr'anni!"*

Fatto co' amore pe' Spoleto e lu Festival dei Due Mondi 🎪

</div>
