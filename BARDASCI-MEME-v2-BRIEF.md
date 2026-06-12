# 📋 BRIEF — Bardasci Meme v2.0
## Refactor completo · Giugno 2026

---

## 🔍 STATO ATTUALE (da codice reale letto su GitHub)

### Cosa funziona già bene
- **Editor meme completo**: canvas drag-and-drop, testi mobili, rotazione, bolle fumetto speech/thought/shout
- **Export PNG** a 2x risoluzione con drawImage su canvas HTML5
- **Upload immagine personalizzata** (FileReader → base64)
- **13 template preimpostati**: 6 luoghi di Spoleto (Duomo, Ponte delle Torri, Piazza Garibaldi...) + 7 meme classici (Drake, Distracted BF, Woman-Cat, Roll Safe...)
- **Glossario spoletino** con CRUD completo lato server (Express + file JSON)
- **Traduzione italiano → spoletino** via Gemini con fallback offline
- **Generatore didascalie AI** per tema libero
- **Generatore sceneggiatura fumetto** 3 pannelli
- **Galleria locale** salvata in `localStorage`
- **Design brutalist** arancione (#FF5F1F) con Tailwind, molto riconoscibile

### Problemi attuali
1. **Backend Express necessario** → impossibile deployare su Vercel static/edge senza configurazione
2. **Gemini API key** hardcoded nel `.env` → non funziona in produzione pubblica senza account
3. **"Failed to fetch"** sul glossario → mancava il proxy Vite (già fixato)
4. **Galleria in localStorage** → si perde cambiando device/browser
5. **Template classici da imgflip.com** → CORS bloccato spesso, le immagini non si caricano; workaround via `/api/proxy` ma fragile
6. **Nessuna generazione AI delle immagini** → solo testo su immagini esistenti
7. **`STATIC_GLOSSARY` nel frontend** ha solo 10 voci; il server ne ha 27-42 → disallineamento
8. **`templatesData.ts` non aggiornabile** senza deploy
9. **Unsplash URLs** per character templates → CDN stabile ma immagini generiche non spoletine

---

## 🏗️ ARCHITETTURA PROPOSTA — v2.0

### Opzione A — Full Static (consigliata per semplicità)
**Stack: React + Vite → deploy Vercel/GitHub Pages, zero backend**

Tutte le feature AI si chiamano **direttamente dal browser** verso API esterne con la chiave inserita dall'utente nelle impostazioni (o via env Vercel). Nessun server Express. Il glossario vive in un file JSON statico versionato nella repo + opzionalmente Supabase per persistenza.

```
Browser → Groq API (testo/traduzione)  [gratis, no card]
Browser → Cloudflare Images / Imgur API (storage immagini utente)
Browser → Supabase (glossario condiviso, gallery opzionale)  [free tier]
Vercel  → deploy statico, zero cold start, zero server
```

**Pro:** deploy con un click, Vercel free tier regge tutto, zero manutenzione server  
**Contro:** API key nel browser (accettabile per app pubblica con rate limit)

### Opzione B — Edge Functions (alternativa)
**Stack: React + Vite + Vercel Edge Functions**

Le edge function sostituiscono Express: `/api/translate`, `/api/captions`, `/api/comics`, `/api/glossary`. Vercel le esegue in edge (V8, ~50ms cold start vs ~1s Lambda).

```
Browser → Vercel Edge Functions → Groq API
Browser → Vercel Edge Functions → Supabase (glossario)
```

**Pro:** API key sicura server-side, più controllo  
**Contro:** leggermente più complessa da configurare

**→ Consiglio: Opzione A per iniziare, Opzione B quando/se serve proteggere la chiave**

---

## 🤖 MODELLO AI CONSIGLIATO — Addio Gemini

### Per la generazione testo (traduzione, didascalie, fumetti)

**🥇 Groq + Llama 3.3 70B** — raccomandato
- Gratis, no carta di credito, 14.400 req/giorno
- 800 tok/sec → risposta in ~0.3s (10x più veloce di Gemini)
- OpenAI-compatible API → cambio di 3 righe di codice
- Supporta `systemInstruction` via `system` message

```typescript
// Da questo (Gemini):
const response = await ai.models.generateContent({...})

// A questo (Groq):
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SPOLETO_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  })
})
```

**Alternativa: Mistral Nemo** (1B token/mese gratis, buono per italiano)  
**Alternativa: Gemini 2.5 Flash** (500 req/giorno gratis, se vuoi restare Google)

### Per la generazione immagini meme

Qui la situazione è più complessa. Le opzioni reali:

**Opzione 1 — Nessuna generazione AI, solo upload + template (consigliata)**
L'app già fa questo bene. Aggiungere una sezione di **upload pack di immagini spoletine** curate da te (foto Duomo, sagre, tartufo, gente del posto). Nessuna API, nessun costo, funziona sempre.

**Opzione 2 — Together.ai FLUX.1 (image generation gratuita)**
- Together.ai ha $1-100 di crediti gratuiti alla registrazione
- Modello: `black-forest-labs/FLUX.1-schnell-Free` → completamente gratuito, illimitato
- Genera immagini da prompt testuale in ~2 secondi
- L'utente descrive la scena, FLUX genera l'immagine, poi ci metti il testo sopra

```typescript
const response = await fetch("https://api.together.xyz/v1/images/generations", {
  headers: { Authorization: `Bearer ${TOGETHER_API_KEY}` },
  body: JSON.stringify({
    model: "black-forest-labs/FLUX.1-schnell-Free",
    prompt: "Anziano umbro con cappello, sfondo Piazza del Duomo di Spoleto, stile fumetto",
    width: 512, height: 512, steps: 4
  })
})
```

**Opzione 3 — Hugging Face Inference API (gratis con account)**
- `stabilityai/stable-diffusion-xl-base-1.0` via HF Spaces
- Più lento (~5-10 sec), ma gratuito con account HF

**→ Raccomandazione: Opzione 1 (pack immagini curate) + Opzione 2 (FLUX gratuito) come feature premium opzionale**

---

## 🗄️ DATABASE — Serve o No?

### Cosa attualmente usa un DB
- Glossario spoletino: ora è un file JSON locale `spoletino_db.json` — **va bene**
- Galleria meme: `localStorage` — **limite: solo sul device corrente**

### Proposta

**Per il glossario: JSON statico nella repo** (già 42 voci, cresce con PR)  
→ Nessun DB necessario. Il file `src/data/glossario.json` è la fonte di verità. Se vuoi aggiungere parole, fai commit.

**Per la galleria utente: Supabase (free tier)**  
→ Se vuoi che gli utenti salvino e condividano i meme, Supabase fa al caso:
- Free tier: 500MB storage, 50.000 righe, 2GB banda/mese
- Schema semplicissimo: `memes(id, title, image_url, texts_json, created_at, user_id?)`
- Oppure: storage Supabase per le immagini PNG esportate

**→ Per v2.0 iniziale: zero DB. Galleria in localStorage. Glossario in JSON statico.**  
**→ Per v2.1: aggiungi Supabase solo se vuoi gallery condivisa o login utenti.**

---

## 📦 DEPLOY — Dove Metterlo

### Raccomandazione: Vercel (gratuito)

| Voce | Dettaglio |
|---|---|
| **Hosting** | Vercel free tier — 100GB banda/mese, deploy istantaneo da GitHub |
| **URL** | `bardasci-meme.vercel.app` o dominio custom |
| **Build** | `npm run build` → `dist/` → Vercel serve staticamente |
| **API Keys** | Variabili ambiente Vercel → sicure, non nel codice |
| **CI/CD** | Push su `main` → deploy automatico |

**Alternativa: GitHub Pages** — ancora più semplice ma nessun supporto env vars (chiavi nel frontend)

---

## ✅ FEATURE DA AGGIUNGERE (priorità)

### 🔴 Must have (v2.0)
1. **Migrazione da Gemini a Groq** — 3 righe di codice, stesso risultato, più veloce e gratuito
2. **Rimozione backend Express** — tutto diventa frontend statico o edge function
3. **Fix CORS template imgflip** — sostituire con immagini da Wikimedia (già usate per Spoleto) o upload locale
4. **Glossario come JSON statico** nel frontend — fine del "Failed to fetch"
5. **Pack immagini spoletine curate** — 20-30 foto di Spoleto liberamente usabili (Wikimedia Commons) come template aggiuntivi
6. **System prompt spoletino iniettato** (già pronto nel file che ti ho dato)

### 🟠 Nice to have (v2.1)
7. **Generazione immagine con FLUX** tramite Together.ai — campo prompt, genera sfondo, poi editor testo
8. **Condivisione meme** — link diretto o download con watermark `bardasci.cosmonet.info`
9. **Modalità "Bardasci Story"** — 3 pannelli in sequenza esportati come strip verticale
10. **Supabase gallery** — salva e sfoglia meme degli altri utenti (community)

### 🟡 Futuro (v3.0)
11. **Login con Google/GitHub** via Supabase Auth
12. **Voting meme** — upvote/downvote
13. **CosmoRepo integration** — articolo su cosmonet.info con il link all'app

---

## 🔧 MODIFICHE TECNICHE CONCRETE (cosa toccare)

### 1. Rimuovi Express, porta tutto in frontend

```
server.ts → DA ELIMINARE
vite.config.ts → rimuovi il proxy
src/api/groq.ts → nuovo file con le 3 chiamate AI
src/data/glossario.json → il glossario diventa un import statico
```

### 2. Groq client (da creare)

```typescript
// src/api/groq.ts
const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function groqChat(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(GROQ_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}
```

### 3. .env per Vercel

```bash
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxx
VITE_TOGETHER_API_KEY=xxxxxxxxxxxx   # opzionale per FLUX
VITE_SUPABASE_URL=xxxxxxxxxxxx       # opzionale
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxx  # opzionale
```

### 4. Template imgflip → sostituire con Wikimedia

I template `Drake`, `Distracted BF`, ecc. da `api.imgflip.com` spesso non passano il CORS anche col proxy. Soluzione: usare le stesse immagini ma ospitate su Wikimedia Commons (pubblico dominio) o caricarle nella repo stessa in `public/templates/`.

### 5. Glossario JSON statico

```typescript
// src/data/glossario.json — 42 voci già pronte
// In App.tsx:
import glossario from "./data/glossario.json";
const [glossary, setGlossary] = useState<GlossaryItem[]>(glossario);
// Nessuna fetch, nessun backend, nessun errore
```

---

## 📐 STRUTTURA REPO FINALE

```
Bardasci-Meme/
├── public/
│   └── templates/          ← immagini meme locali (no CORS)
│       ├── drake.jpg
│       ├── distracted.jpg
│       └── spoleto-duomo.jpg
├── src/
│   ├── api/
│   │   ├── groq.ts         ← nuovo: sostituisce server.ts
│   │   ├── flux.ts         ← nuovo: generazione immagini (opzionale)
│   │   └── supabase.ts     ← nuovo: gallery condivisa (opzionale)
│   ├── data/
│   │   └── glossario.json  ← glossario statico (42+ voci)
│   ├── components/
│   │   └── MemeCanvas.tsx  ← invariato
│   ├── App.tsx             ← refactor: rimuove fetch backend
│   ├── types.ts            ← invariato
│   ├── templatesData.ts    ← aggiornato con URL locali
│   └── index.css
├── index.html
├── vite.config.ts          ← semplificato (no proxy)
├── package.json            ← rimuovi express, ts-node, ecc.
└── .env.example
```

---

## ⏱️ STIMA TEMPI

| Task | Tempo stimato |
|---|---|
| Migrazione Gemini → Groq | 30 min |
| Rimozione Express + refactor fetch | 1 ora |
| Fix template imgflip → locale | 45 min |
| Glossario JSON statico | 15 min |
| Deploy Vercel + env vars | 20 min |
| **Totale v2.0** | **~3 ore** |
| Pack 20 immagini Spoleto curate | 1 ora |
| FLUX image generation | 2 ore |
| **Totale v2.1** | **+3 ore** |

---

## 🚀 PROSSIMO PASSO SUGGERITO

1. **Decidi il deploy target** — Vercel (consigliato) o GitHub Pages
2. **Crea account Groq** su console.groq.com — gratuito, chiave subito
3. **Dimmi se vuoi Opzione A (full static) o B (edge functions)** e parte il codice

---

*Brief generato il 12/06/2026 — basato su lettura completa di tutti i file della repo CosmoNetinfo/Bardasci-Meme*
