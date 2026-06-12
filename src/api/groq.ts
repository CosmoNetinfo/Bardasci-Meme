export const SPOLETO_SYSTEM_PROMPT = `Sei un esperto linguista del dialetto spoletino — il dialetto umbro parlato a Spoleto e nel Ducato di Spoleto (Umbria centrale, Italia).
Il tuo compito è tradurre, creare battute, didascalie meme e fumetti usando questo dialetto in modo AUTENTICO, rustico e divertente.

════════════════════════════════════════════
FONOLOGIA E GRAMMATICA SPOLETINA — REGOLE BASE
════════════════════════════════════════════

1. ARTICOLI
   - "il / lo" → "lu" (da illum latino): lu gatto, lu pane, lu vino
   - "i / gli" → "li": li bardasci, li compari
   - "la / le" → invariato: la cajina, la freca

2. FINALI
   - Finale -o → -u: gatto→gattu, pane→panu, vino→vinu, tutto→tuttu
   - Finale -i nella penultima sillaba: mattoni→mattuni, quelli→quilli
   - Parole tronche aggiungono -ne: papà→papane, là→lane, cantare→cantane

3. CONSONANTI (trasformazioni tipiche)
   - nd → nn: manda→manna, quando→quanno, andare→annà
   - ng → gn: magna→magna, piange→piagne
   - ld → ll: caldaia→callaia
   - gl → j: paglia→paja, voglio→vojo, figlio→fijju
   - gio/giu → ju: Giovanni→Juvanni
   - b → v iniziale: bello→vellu, bere→vé
   - zz → nz: mezzo→menzo, pizza→pinza
   - v e d cadono tra vocali: coda→coa, arriva→arria, aveva→avea
   - r si sposta: capra→crapa, dentro→drento
   - l impura → r: molto→mordo, altro→artru
   - g cade davanti r: grosso→rossu, grano→rano
   - uo → o: vuoi→voi, fuoco→foco

4. INFINITI
   - Forma apocopata: camminare→camminà, leggere→legge, mangiare→magnà
   - Con epitesi -ne: cantare→cantane, andare→annane

5. PRONOMI E LOCATIVI
   - lui/lei → issu / essa
   - questo/questa → quistu / quista
   - quello/quella → quillu / quilla
   - qui → decchi / quaddecco
   - là → delli / laddello
   - con me → meco  |  con te → teco  |  con sé → seco
   - adesso → asseia / asseia punti (= proprio adesso)
   - oggi → oggidì  |  domani → dimane  |  questa sera → massera
   - dopo / dietro → possu
   - so (prima persona) → saccio

6. SALUTI E ESCLAMAZIONI TIPICHE
   - Ciao → Oh! / Uah!
   - Come stai? → Oh… commmm'è?! (con molte M)
   - Saluto ironico: "Che te pija un corbu!" / "Che te pij n'corbu bisestile così dura quattr'anni!"
   - Sbrigati → Pollai!
   - Andiamo → Jemo! / Jemo ì! (con I rafforzativa finale)
   - Non vedo l'ora → Mesamianno
   - Sì → Scì / Scine / Poscibè
   - Non c'è male → Pobbè
   - Davvero → Perdaeri / Perdero
   - Zitto zitto → Chiottu chiottu

════════════════════════════════════════════
VOCABOLI CHIAVE DELL'APP — DA USARE PRIORITARIAMENTE
════════════════════════════════════════════

- Strolucu = uomo strano/eccentrico. "Ma che fai, lu strolucu?!"
- Ciocia/Ciocio = bagnato fradicio. "Sto tutto ciocio pe' la piova!"
- Sgricia = freddo gelido/nevischio. "Tira 'na sgricia tremenda!"
- Bardascio/Bardascia = bambino/ragazza. "Birbante de 'n bardascio!"
- Lu tito = il dito. "M'ho schiacciato lu tito!"
- Fiauru = profumo intenso. "Che fiauru de tartufo!"
- Bidonà = dare buca/fregare. "M'ha bidonato pure stavorta!"
- Freca = rubare / grande quantità. "C'era 'na freca de gente!"
- In ghingheri = elegante. "Andò vai tutto in ghingheri?"
- Arvène = torna. "Arvène a casa che è pronta la polenta!"
- Ciaffato = ubriaco. "È arvenuto tutto ciaffato!"
- Stroligà = rimuginare. "Che c'hai da stroligà?"
- Sbatte la fatica = non avere voglia. "Oggi me sbatte la fatica!"
- A sbotto = strapieno. "Sto a sbotto!"
- Quattrini = soldi. "Senza li quattrini non se canta messa!"
- Meco/Teco/Seco = con me/te/sé. "Vène meco a piazza Duomo!"
- Scorrucciato = imbronciato. "Perché stai scorrucciato oggidì?"
- Brusco = scorbutico. "Oggi lu nonnu è brusco prima de magnà."
- Prescia = fretta. "C'ho 'na prescia tremenda!"
- Mesamianno = non vedo l'ora. "Mesamianno de arvené!"
- Capusturnu = testa vuota. "Non fà lu capusturnu!"

════════════════════════════════════════════
REGOLE DI STILE
════════════════════════════════════════════

1. RUSTICO MA AFFETTUOSO: diretto, colorito, ironia bonaria, mai osceno.
2. CANTILENA: le frasi hanno ritmo e musicalità caratteristica.
3. RAFFORZATIVI FINALI: la I finale rafforza (jemo ì! / forza ì!).
4. EPITESI -NE: le parole tronche aggiungono -ne (papane, lane, cantane).
5. LATINISMI: meco, teco, seco, possu, dienza — marchio di autenticità.
6. VARIANTI: accettare tutte le varianti dello stesso termine (billo/dindo/viru).
7. CONTESTO LOCALE: citare tartufo, porchetta, strozzapreti, polenta, Piazza Duomo, il Domo di Spoleto quando pertinente.`;

const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// Fallbacks if offline or no key
const FALLBACK_TRANSLATIONS: Record<string, { translated: string; explanation: string }> = {
  "cosa stai dicendo?": {
    translated: "Che m'hai a di'?",
    explanation: "Traduzione tipica spoletina per chiedere delucidazioni o esprimere finto sconcerto."
  },
  "andiamo a bere qualcosa": {
    translated: "Jamo a facce un goccetto da la spina!",
    explanation: "Andiamo a bere un bicchiere di vino spillato ('spina') o altro drink al bar."
  },
  "non capisco niente de quello che dici": {
    translated: "Me pare d'ascoltà un strolucu!",
    explanation: "Mi sembra di ascoltare uno strologo, ovvero una persona confusa o eccentrica."
  },
  "ragazzo birbante": {
    translated: "Birbante de 'n bardascio!",
    explanation: "Ragazzino vivace, furbo o indisciplinato. 'Bardascio' significa bambino o ragazzo."
  },
  "oggi sono stanco": {
    translated: "Oggi me sbatte proprio la fatica!",
    explanation: "Oggi non ho proprio voglia di fare fatica, mi sento estremamente pigro."
  },
  "pieno di cibo": {
    translated: "Sto a sbotto! C'ho 'na freca de roba in panza.",
    explanation: "Sono sazio, ho tantissimo cibo nello stomaco."
  }
};

const FALLBACK_CAPTIONS = [
  { text: "Quanno lu strolucu parla, mejo faje 'n sorrisu e di' de sì.", tags: ["Saggezza", "Strolucu"] },
  { text: "Jamo jamo, c'avemo 'na freca de cose da fa e pochissimo tempo!", tags: ["Fretta", "Amici"] },
  { text: "Mamma mia, oggi sto rintronato peggio de le campane de lu Domo!", tags: ["Stanchezza", "Duomo"] },
  { text: "Se m'hai da bidonà, dimmelo prima che me metto in ghingheri!", tags: ["Amore", "Ghingheri"] },
  { text: "Nu fiauru de tartufo e m'arvène la voglia de vive!", tags: ["Cibo", "Tartufo"] },
  { text: "Che stai a di'? Quella è 'na ciocia tremenda!", tags: ["Pettegolezzo", "Ciocia"] },
  { text: "M'ha ciaffato la birra, birbante de 'n bardascio!", tags: ["Furto", "Birbante"] },
  { text: "Se piagne sempre, te s'ammoscia pure lu capocollo!", tags: ["Ironia", "Cibo"] }
];

const FALLBACK_COMIC_IDEAS = [
  {
    title: "La Bidonata a Piazza Duomo",
    panels: [
      { panel: 1, prompt: "Due amici si incontrano a Piazza Duomo", dialogue: "A: Oh, ma andò è finita Maria? M'ha da bidonà pure stasera?" },
      { panel: 2, prompt: "Un amico guarda il telefono sconsolato", dialogue: "B: M'ha scritto mo: 'Sto a rinfrescame, c'ho la sgricia addosso!'" },
      { panel: 3, prompt: "I due si avviano verso il bar", dialogue: "A: Vabbè, jamo a facce 'n gocciu de vino che è mejo! Maria è proprio 'na ciocia." }
    ]
  },
  {
    title: "Lu Strolucu e la Sgricia",
    panels: [
      { panel: 1, prompt: "Un anziano in piazza guarda il cielo nuvoloso", dialogue: "Anziano: Oggi arvène la sgricia da li monti, lu sento 'nte le dita!" },
      { panel: 2, prompt: "Un ragazzo vestito leggero passa ridendo", dialogue: "Giovane: Ma che c'hai da stroligà sempre oggidì caro nonno?" },
      { panel: 3, prompt: "Inizia a grandinare fortissimo sul ragazzo", dialogue: "Anziano: Eh! Te l'avevo detto birbante, mo ti cioci come si deve!" }
    ]
  }
];

function smartTranslateOffline(text: string): { translated: string; explanation: string } {
  const query = text.toLowerCase().trim();

  for (const [key, value] of Object.entries(FALLBACK_TRANSLATIONS)) {
    if (query === key || query.includes(key) || key.includes(query)) {
      return value;
    }
  }
  return { 
    translated: "Che m'hai a di'?", 
    explanation: "Dizionario offline locale: Inserisci una API Key per una traduzione più accurata." 
  };
}

export async function translateText(text: string): Promise<{ translated: string; explanation: string }> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return smartTranslateOffline(text);
  }

  const prompt = `Traduci la seguente frase in italiano in un dialetto spoletino autentico, rustico e divertente.
La risposta deve essere ESCLUSIVAMENTE in formato JSON con la seguente struttura:
{
  "translated": "la frase tradotta in dialetto spoletino con accenti corretti",
  "explanation": "una breve spiegazione in italiano del significato, dei vocaboli usati (es. spiegando parole tipiche come 'strolucu', 'ciocia', 'sgricia', 'bardascio', 'fiauru', 'lu tito', 'freca', 'meco', 'teco', 'bidonà' se applicabili) e del tono."
}

Frase da tradurre: "${text}"`;

  try {
    const res = await fetch(GROQ_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SPOLETO_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      })
    });
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.warn("Groq API failed:", err);
    return smartTranslateOffline(text);
  }
}

export async function generateCaptions(topic: string): Promise<{ text: string; tags: string[] }[]> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const selectedTopic = topic || "generico";

  if (!apiKey) {
    const filtered = FALLBACK_CAPTIONS.filter(cap =>
      cap.tags.some(t => t.toLowerCase().includes(selectedTopic.toLowerCase()))
    );
    return filtered.length > 0 ? filtered : FALLBACK_CAPTIONS.slice(0, 4);
  }

  const prompt = `Crea 4 frasi umoristiche in dialetto spoletino sul tema: "${selectedTopic}".
Ogni frase deve essere corta, perfetta come didascalia di un meme (espressiva, dissacrante, rustico-affettuosa).
La risposta deve essere ESCLUSIVAMENTE in formato JSON con la seguente struttura:
[
  { "text": "battuta spoletina 1", "tags": ["tema1", "parola-chiave"] },
  { "text": "battuta spoletina 2", "tags": ["tema2", "parola-chiave"] },
  { "text": "battuta spoletina 3", "tags": ["tema3", "parola-chiave"] },
  { "text": "battuta spoletina 4", "tags": ["tema4", "parola-chiave"] }
]`;

  try {
    const res = await fetch(GROQ_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SPOLETO_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.9
      })
    });
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content).captions || JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.warn("Groq API failed:", err);
    return FALLBACK_CAPTIONS.slice(0, 4);
  }
}

export async function generateComic(theme: string): Promise<{ title: string; panels: { panel: number; prompt: string; dialogue: string }[] }> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const selectedTheme = theme || "Incontro fortuito";

  if (!apiKey) {
    return FALLBACK_COMIC_IDEAS.find(c => c.title.toLowerCase().includes(selectedTheme.toLowerCase())) || FALLBACK_COMIC_IDEAS[0];
  }

  const prompt = `Crea una breve sceneggiatura di fumetto in 3 pannelli/vignette sul tema: "${selectedTheme}".
Usa un dialetto spoletino divertente e verace per le battute.
La risposta deve essere ESCLUSIVAMENTE in formato JSON con la seguente struttura:
{
  "title": "Un titolo divertente in spoletino o italiano",
  "panels": [
    { "panel": 1, "prompt": "descrizione visiva della vignetta 1", "dialogue": "Battuta del personaggio A in dialetto" },
    { "panel": 2, "prompt": "descrizione visiva della vignetta 2", "dialogue": "Risposta in dialetto spoletino" },
    { "panel": 3, "prompt": "descrizione visiva vignetta 3, finale comico", "dialogue": "Esclamazione finale spoletina" }
  ]
}`;

  try {
    const res = await fetch(GROQ_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SPOLETO_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.85
      })
    });
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.warn("Groq API failed:", err);
    return FALLBACK_COMIC_IDEAS[0];
  }
}
