import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — Dialetto Spoletino (ricerca linguistica giugno 2026)
// Fonti: Grande Vocabolario del Dialetto Spoletino (Cuzzini Neri & Gentili, 2008)
//        Aqvilifer.altervista.org · AboutUmbria Magazine · MySpoleto.it
// ════════════════════════════════════════════════════════════════════════════

const SPOLETO_SYSTEM_PROMPT = `Sei un esperto linguista del dialetto spoletino — il dialetto umbro parlato a Spoleto e nel Ducato di Spoleto (Umbria centrale, Italia).
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
   - ng → gn: mangia→magna, piange→piagne
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
VOCABOLARIO SPOLETINO COMPLETO — A-Z
════════════════════════════════════════════

A: Abburucchiatu=avvolto stretto · Abbricòcolo=albicocca · Abbruscà=abbrustolire · Acitillo=aceto leggero · Acquetta/Manière/Picchetto/Cirifischio=vinello · Ammannì=apparecchiare · Appettasse=far suo un lavoro · Appigitasse=raccomandarsi · Aresta=uva acerba · Arcoie=raccogliere · Arromentasse=darsi da fare · Asseia=adesso · Arvené/Arvène=tornare/ritorna · Azzezzecane=perder tempo

B: Bacu/Granitto/Vaco=acino d'uva · Bé=bere · Berta/Lecca/Ciucca/Sborgna=ubriacatura · Beverone=gran bevitore · Biriciancola=altalena · Billo/Dindo/Viru=tacchino · Biocca/Fiocca/Peccia=chioccia · Boccia=bottiglia · Boie=uova fradice · Burbucane=mormorare · Burdicasse=rovesciarsi

C: Cajcchia=cavola · Capusturnu=testa vuota (insulto) · Casciu=giù di tono · Cajina/Pulla=gallina · Callaro=paiolo · Cascio/Cacio=formaggio · Chiavattone=disordinato · Chiottu chiottu=zitto zitto · Cicurella=pochissimo · Cillitti=geloni · Ciucca=zucca/sbornia · Ciucu=piccolo · Coelle=niente · Commatte=perder tempo · Crepore=noia · Crescia=pizza al formaggio · Crucchiulu=guscio di fave/noci · Cuccuma=bricco del caffè

D: Decchi/Decco=qui · Delli/Dello=là · Dienza=ascolto (date dienza=ascoltate) · Dimane=domani · Dorge=dolce · Dresmarino/Tremeschino=rosmarino

F: Fantillu/Pottu=bambino · Fiauru=profumo intenso · Ciafuru=cattivo odore · Fiara=fiamma · Foco=fuoco · Focone=braciere · Frigghie=friggere

G: Ganassa=mascella (avé 'na bona ganassa=buon appetito) · Graspo=grappolo · Grasselli/Truzzoli=sfrizzoli di maiale · Gregna=covone di grano · Grugnu=brutta faccia

I-J: Issu/Essa=lui/lei · Jamo/Jemo=andiamo · 'Ncitosa=antipatica · 'Ncroccu=chi non si regge in piedi · 'Ngenne=dà dolore da freddo · 'Ngrugnasse=mettere il muso · 'Ntrociatu=infangato · 'Nciuccasse=ubriacarsi

L: Laddello=laggiù · Lena=legna · Liacciola=fazzoletto merenda · Lippichinu=attaccabrighe · Lucchìa=svogliatezza/pigrizia · Lu=articolo maschile · Lurzane=giocare · Lustra=lucido da scarpe

M: Magnà=mangiare · Magnerella=fame persistente · Malanottu=barbagianni/persona losca · Marracciu=roncola · Mascicà=masticare · Massera=questa sera · Mesamianno=non vedo l'ora · Merenna=pasto di mezzogiorno · Miccu=furbastro · Moffice=morbido e soffice · Mordo=molto · Mosciarella=castagna secca · Mucido=ammuffito · Mullica=mollica del pane

N: Nardu=alto · Nicco/Niccaccione=ghiotto · 'Ncemmale=passabile · 'Nco=anche

O: Oh!/Uah!=saluto tipico · Oggidì=oggi · Ome=uomo · Onne (all')=pencolare da ubriaco

P: Papana=anitra · Perdaeri=davvero · Persico=pesca · Pimpuli=fichi secchi · Pobbè=non c'è male · Podèsse=può darsi · Pollai!=sbrigati! · Possu=dopo/dietro · Prescia=fretta · Prolicu=chiacchierone/saccente · Punillu=manciata · Pusigno=mangiare per golosità dopo aver pranzato

Q: Quaddecco=qui (periferia) · Quillu/Quistu=quello/questo · Quattrini=soldi

R: Racanacciu=ramarro · Ranuschia=grandine · Roccia=ciambella · Rugane=sgridare · Rugola=rughetta · Rosechella=ultima parte del pane

S: Saccio=so · Saracca=acciuga · Sbrenca=ragazza frivola · Sbriscicane/Sguillane/Scuiccià=scivolare · Scalampa=cessa la pioggia · Scardazzatu=spettinato · Scarsiatu=trascurato · Scì/Scine=sì · Sciorna/Sciuerta=stupidina/trasandata · Sciuccu=asciutto · Scintu=seduto · Scorocciasse=rompere tra fidanzati · Scoppacciu=brutta caduta · Sfantazzasse=fare baldoria · Spicciasse=pettinarsi · Spitissera=spiritosa · Stricchinitu=mal ridotto · Sciorina=ostentare/pavoneggiarsi

T: Tamanto=grandissimo · Tistu=codesto · Tricane=durare a lungo · Trofio=torbido (vino) · Turturu=bastone nodoso

U: Uah!=esclamazione di saluto/sorpresa · Ubbieta=barbabietola

V: Vassallu=bambino scavenzacollo · Vellegnà=vendemmiare · Vincìa=ramo di salice

Z: Zezzecca=bambino diavoletto/monello · Zozza=minestra troppo cotta

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
FRASI COMPLETE — SPOLETINO AUTENTICO
════════════════════════════════════════════

SALUTI: "Uah! Oh commmm'è?!" · "Che te pija un corbu, commmm'è?!" · "Che te pij n'corbu bisestile così dura quattr'anni!" · "Pollai, jemo ì!" · "Quando inauguri lu cervellu dimmelo che te regalo 'na coccia!"

CIBO: "Arvène a casa che è pronta la polenta co' le salsicce!" · "Sto a sbotto! C'ho 'na freca de roba in panza." · "Nu fiauru de tartufo e m'arvène la voglia de vive!" · "Magnà a du' ganasse" · "Bé a garganello"

STATO D'ANIMO: "Oggi me sbatte proprio la fatica!" · "Me pare d'ascoltà un strolucu!" · "M'ha bidonato pure stavorta, m'ha lasciato lì come uno strolucu." · "Sto tutto ciocio pe' la piova." · "Tira 'na sgricia tremenda, copriti!" · "Oggi sto rintronato peggio de le campane de lu Domo!"

MEME E IRONIA: "Se m'hai da bidonà, dimmelo prima che me metto in ghingheri!" · "M'ha ciaffato la birra, birbante de 'n bardascio!" · "Se piagne sempre, te s'ammoscia pure lu capocollo!" · "Quanno lu strolucu parla, mejo faje 'n sorrisu e di' de sì." · "C'era 'na freca de gente a piazza Duomo oggidì!" · "Vabbè jamo a facce 'n gocciu de vino che è mejo!"

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

// Lazy initialization helpers for Gemini SDK
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY non è configurata o è vuota. Abilitazione modalità offline.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to call Gemini with exponential backoff retry for transient errors (such as 503 unavailable).
let isQuotaExceededForCurrentSession = false;

async function generateContentWithRetry(params: any, retries = 2, delay = 500): Promise<any> {
  if (isQuotaExceededForCurrentSession) {
    throw new Error("Quota di richieste Gemini superata per oggi. Utilizzo automatico e silenzioso dei dizionari locali.");
  }

  const ai = getGeminiClient();

  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const errorMsg = String(error.message || error.status || "").toLowerCase();
    const isRateLimited = errorMsg.includes("429") ||
      errorMsg.includes("rate limit") ||
      errorMsg.includes("quota") ||
      errorMsg.includes("resource_exhausted") ||
      errorMsg.includes("exceeded your current quota");

    if (isRateLimited) {
      isQuotaExceededForCurrentSession = true;
      console.log(`Gemini API: Rilevato superamento quota (429). Attivazione dizionari locali offline.`);
      throw error;
    }

    if (retries > 1) {
      const isTransient = errorMsg.includes("503") ||
        errorMsg.includes("unavailable") ||
        errorMsg.includes("high demand") ||
        errorMsg.includes("spikes in demand");

      if (isTransient) {
        console.log(`Gemini API: Errore temporaneo (${errorMsg}). Riprovo tra ${delay}ms... (Tentativi rimasti: ${retries - 1})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return generateContentWithRetry(params, retries - 1, delay * 2);
      }
    }

    throw error;
  }
}

// Fallback high-quality presets for Spoleto dialect
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

  const dict: Record<string, string> = {
    "buongiorno": "buondì",
    "buon giorno": "buondì",
    "ciao": "oh!",
    "salve": "salute!",
    "amico": "compà",
    "amici": "compari",
    "ragazzo": "bardascio",
    "ragazzi": "bardasci",
    "ragazzino": "bardascettis",
    "ragazza": "bardascia",
    "bambino": "bardascio",
    "bambini": "bardasci",
    "mangiare": "magnà",
    "mangio": "magno",
    "mangiato": "magnato",
    "andiamo": "jamo",
    "andare": "da jé",
    "andato": "jito",
    "stanco": "straccu morto",
    "stanchi": "stracci morti",
    "freddo": "sgricia",
    "paura": "strizza",
    "ubriaco": "ciaffato",
    "scemo": "strolucu",
    "pazzo": "strolucu",
    "eccentrico": "strolucu",
    "bagnato": "ciocio",
    "bagnata": "ciocia",
    "molto": "una freca de",
    "tanto": "una freca de",
    "tanti": "una freca de",
    "fame": "fame tremenda",
    "pieno": "a sbotto",
    "dito": "lu tito",
    "soldi": "quattrini",
    "rubare": "fregà",
    "rubato": "fregato",
    "lavoro": "fatica",
    "dormire": "ronfà",
    "parlare": "stroligà",
    "parla": "stroliga",
    "vedere": "vedé",
    "bere": "spillà 'n goccetto",
    "bevuto": "bevuto",
    "oggi": "oggidì",
    "domani": "dimane",
    "ritornare": "arvené",
    "torna": "arvène",
    "cibo": "roba da magnà",
    "bello": "bello spoletino",
    "bella": "bella spoletina",
    "fottuto": "fregato",
    "imbrogliato": "bidonato",
    "fretta": "prescia",
    "pigro": "c'ho la lucchìa",
    "sbrigati": "pollai!",
    "stasera": "massera",
    "adesso": "asseia",
    "davvero": "perdaeri",
    "forse": "podèsse",
    "niente": "coelle",
    "profumo": "fiauru",
    "puzza": "ciafuru",
    "scivolato": "so' scuicciato",
    "caduto": "so' cascato"
  };

  const words = text.split(/\s+/);
  const translatedWords = words.map(w => {
    const cleanWord = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    if (dict[cleanWord]) {
      return dict[cleanWord];
    }
    return w;
  });

  let translated = translatedWords.join(" ");

  translated = translated
    .replace(/\bil\b/gi, "lu")
    .replace(/\bìll\b/gi, "lu")
    .replace(/\blo\b/gi, "lu")
    .replace(/\bi\b/gi, "li")
    .replace(/\bdi\b/gi, "de")
    .replace(/\bcon\b/gi, "co'")
    .replace(/\bper\b/gi, "pe'");

  const replacedTerms: string[] = [];
  for (const [key, val] of Object.entries(dict)) {
    if (query.includes(key)) {
      replacedTerms.push(`"${key}" → "${val}"`);
    }
  }

  let explanation = "Dizionario offline locale di Spoleto: ";
  if (replacedTerms.length > 0) {
    explanation += "Traduzione dinamica locale: " + replacedTerms.join(", ") + ".";
  } else {
    explanation += "Traduzione letterale rustica ottimizzata con dialettologia umbro-spoletina.";
  }

  return { translated, explanation };
}

// 1. API: Translate Italian sentence to Spoletino
app.post("/api/spoletino/translate", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Il testo da tradurre è richiesto." });
  }

  try {
    const prompt = `Traduci la seguente frase in italiano in un dialetto spoletino autentico, rustico e divertente.
La risposta deve essere ESCLUSIVAMENTE in formato JSON con la seguente struttura:
{
  "translated": "la frase tradotta in dialetto spoletino con accenti corretti",
  "explanation": "una breve spiegazione in italiano del significato, dei vocaboli usati (es. spiegando parole tipiche come 'strolucu', 'ciocia', 'sgricia', 'bardascio', 'fiauru', 'lu tito', 'freca', 'meco', 'teco', 'bidonà' se applicabili) e del tono."
}

Frase da tradurre: "${text}"`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SPOLETO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.8,
      }
    });

    const replyText = response.text || "{}";
    const data = JSON.parse(replyText.trim());
    return res.json(data);
  } catch (error: any) {
    console.log("Dizionario locale spoletino attivato per la traduzione.");
    const result = smartTranslateOffline(text);
    return res.json(result);
  }
});

// 2. API: Generate custom meme captions or ideas
app.post("/api/spoletino/captions", async (req, res) => {
  const { topic } = req.body;
  const selectedTopic = topic || "generico";

  try {
    const prompt = `Crea 4 frasi umoristiche in dialetto spoletino sul tema: "${selectedTopic}".
Ogni frase deve essere corta, perfetta come didascalia di un meme (espressiva, dissacrante, rustico-affettuosa).
La risposta deve essere ESCLUSIVAMENTE in formato JSON con la seguente struttura:
[
  { "text": "battuta spoletina 1", "tags": ["tema1", "parola-chiave"] },
  { "text": "battuta spoletina 2", "tags": ["tema2", "parola-chiave"] },
  { "text": "battuta spoletina 3", "tags": ["tema3", "parola-chiave"] },
  { "text": "battuta spoletina 4", "tags": ["tema4", "parola-chiave"] }
]`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SPOLETO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.9,
      }
    });

    const replyText = response.text || "[]";
    const data = JSON.parse(replyText.trim());
    return res.json(data);
  } catch (error: any) {
    console.log("Generatore locale didascalie spoletine attivato.");
    const filtered = FALLBACK_CAPTIONS.filter(cap =>
      cap.tags.some(t => t.toLowerCase().includes(selectedTopic.toLowerCase()))
    );
    return res.json(filtered.length > 0 ? filtered : FALLBACK_CAPTIONS.slice(0, 4));
  }
});

// 3. API: Generate a comic dialogue outline
app.post("/api/spoletino/comics", async (req, res) => {
  const { theme } = req.body;
  const selectedTheme = theme || "Incontro fortuito";

  try {
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

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SPOLETO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.85,
      }
    });

    const replyText = response.text || "{}";
    const data = JSON.parse(replyText.trim());
    return res.json(data);
  } catch (error: any) {
    console.log("Generatore locale fumetti spoletini attivato.");
    const item = FALLBACK_COMIC_IDEAS.find(c => c.title.toLowerCase().includes(selectedTheme.toLowerCase())) || FALLBACK_COMIC_IDEAS[0];
    return res.json(item);
  }
});

// 4. API: Spoletino Word of the day & mini glossary list (File-backed Database with CRUD)
const DB_FILE = path.join(process.cwd(), "spoletino_db.json");

const INITIAL_GLOSSARY = [
  { word: "Strolucu", definition: "Uomo strambo o eccentrico", usage: "Ma che stai a di', fai meno lo strolucu!", phraseMean: "Non parlare a vanvera, fai meno lo strano!" },
  { word: "Ciocia", definition: "Bagnato fradicio o sciatto/pigro", usage: "Chiudi quel rubinetto sennò me diventi 'na ciocia!", phraseMean: "Chiudi il rubinetto altrimenti ti bagni tutto!" },
  { word: "Sgricia", definition: "Freddo gelido o nevischio", usage: "Coprite bene che tira 'na sgricia tremenda!", phraseMean: "Copriti bene perché fa un freddo cane!" },
  { word: "Bardascio", definition: "Bambino o ragazzino", usage: "Quel bardascio sta sempre a freca' le ciliegie.", phraseMean: "Quel fanciullo ruba sempre le ciliegie." },
  { word: "Lu tito", definition: "Il dito", usage: "M'ho schiacciato lu tito co' la porta!", phraseMean: "Mi sono schiacciato il dito con la porta!" },
  { word: "Fiauru", definition: "Profumo o odore intenso", usage: "Senti che fiauru de sugo cocito arvène da là!", phraseMean: "Senti che profumo di sugo cotto giunge da là!" },
  { word: "Bidonà", definition: "Truffare o non presentarsi a un appuntamento", usage: "M'ha bidonato pure stavorta, m'ha lasciato lì come uno strolucu.", phraseMean: "Mi ha dato buca anche questa volta, mi ha lasciato lì ad attendere come un tonto." },
  { word: "Freca", definition: "Rubare o indicare grande quantità ('na freca)", usage: "C'era 'na freca de gente in piazza oggidì!", phraseMean: "C'era un sacco di gente in piazza oggi!" },
  { word: "In ghingheri", definition: "Vestito elegante o da festa", usage: "Oddio andò vai combinato così in ghingheri, a la sfilata?", phraseMean: "Dove vai vestito così elegante, a una sfilata?" },
  { word: "Arvené", definition: "Tornare, ritornare indietro", usage: "Arvène a casa che è pronta la polenta co' le salsicce!", phraseMean: "Torna a casa che è pronta la polenta con le salsicce!" },
  { word: "Ciaffato", definition: "Ubriaco barcollante", usage: "Sei arvenù a casa tutto ciaffato un'artra vorta!", phraseMean: "Sei tornato a casa completamente ubriaco ancora una volta!" },
  { word: "Stroligà", definition: "Rimuginare, pensare troppo intensamente", usage: "Ma che c'hai da stroligà sempre oggidì?", phraseMean: "Ma cosa continui sempre a pensare e preoccuparti oggi?" },
  { word: "Ciocio", definition: "Umido, bagnato dall'umidità", usage: "C'ho li piedi tutti cioci pe' la piova.", phraseMean: "Ho i piedi completamente bagnati a causa della pioggia." },
  { word: "Sbatte la fatica", definition: "Provare un'incredibile riluttanza a lavorare", usage: "Oggi me sbatte proprio la fatica!", phraseMean: "Oggi ho proprio un'enorme pigrizia e nessuna voglia di fare fatica!" },
  { word: "A sbotto", definition: "Super sazio, strapieno di cibo", usage: "Doppo tre piatti de strozzapreti sto a sbotto!", phraseMean: "Dopo aver mangiato tre porzioni di strozzapreti sono strapieno!" },
  { word: "Quattrini", definition: "Soldi, denaro", usage: "Senza li quattrini non se canta messa meco!", phraseMean: "Senza denaro non si fa nulla con me!" },
  { word: "Ciafuru", definition: "Cattivo odore, puzza sgradevole", usage: "Che è 'sto ciafuru de bruciato?", phraseMean: "Cos'è questo cattivo odore di bruciato?" },
  { word: "Scuiccià", definition: "Scivolare violentemente perdendo l'equilibrio", usage: "So' scuicciato sopra la buccia de melone bagnata!", phraseMean: "Sono scivolato per terra sopra la buccia di melone bagnata!" },
  { word: "Pincio", definition: "Ghiacciolo tagliente", usage: "Tira 'na sgricia che pende li pinci da la grondaia!", phraseMean: "Fa così freddo che scendono i ghiaccioli dalla grondaia!" },
  { word: "Meco", definition: "Con me", usage: "Vène meco a piazza Duomo che c'è la festa!", phraseMean: "Vieni con me a piazza Duomo che c'è festa!" },
  { word: "Teco", definition: "Con te", usage: "Vengo teco pe' vicoli di Spoleto.", phraseMean: "Vengo con te per i vicoli di Spoleto." },
  { word: "Seco", definition: "Con sé, portare dietro", usage: "S'è portato seco tutta la porchetta!", phraseMean: "Si è portato con sé tutta la porchetta!" },
  { word: "Brusco", definition: "Scorbutico, aspro, scontroso", usage: "Oggi lu nonnu è brusco prima de magnà.", phraseMean: "Oggi il nonno è scontroso prima di mangiare." },
  { word: "Rosola", definition: "Cicoria selvatica dei prati", usage: "Friggi la rosola co' lu tartufo!", phraseMean: "Salta in padella la cicoria selvatica con il tartufo!" },
  { word: "Sciorina", definition: "Ostentare, mettersi in mostra sfacciatamente", usage: "Non sciorina li quattrini in piazza!", phraseMean: "Non pavoneggiarti sbandierando i soldi in piazza!" },
  { word: "Sbrufolà", definition: "Graffiare o rovinare una superficie", usage: "M'hai sbrufolato tutto lu sportello de la carretta!", phraseMean: "Mi hai rigato lo sportello dell'auto!" },
  { word: "Smusà", definition: "Sbeccare l'angolo di ceramica o vetro", usage: "Hai smusato tutta la tazza de la nonna!", phraseMean: "Hai rotto l'angolino della tazza della nonna!" },
  { word: "Scorrucciato", definition: "Imbronciato, adirato", usage: "Ma perché stai così scorrucciato oggidì?", phraseMean: "Ma perché sei così imbronciato oggi?" },
  // Nuovi vocaboli aggiunti — giugno 2026
  { word: "Jemo", definition: "Andiamo (forma spoletina con I rafforzativa)", usage: "Jemo ì, pollai che famo tardi!", phraseMean: "Andiamo, sbrigati che siamo in ritardo!" },
  { word: "Pollai", definition: "Sbrigati, spicciati", usage: "Pollai che c'aspettano!", phraseMean: "Sbrigati che ci aspettano!" },
  { word: "Strizza", definition: "Paura, spavento", usage: "M'arriva la strizza soro a pensarci!", phraseMean: "Mi viene paura solo a pensarci!" },
  { word: "Mordo", definition: "Molto (la L impura diventa R in spoletino)", usage: "È mordo bravo quistu bardascio!", phraseMean: "È molto bravo questo ragazzo!" },
  { word: "Magnà", definition: "Mangiare", usage: "Jamo a magnà che è pronto!", phraseMean: "Andiamo a mangiare che è pronto!" },
  { word: "Mesamianno", definition: "Non vedo l'ora", usage: "Mesamianno de arvené a casa!", phraseMean: "Non vedo l'ora di tornare a casa!" },
  { word: "Capusturnu", definition: "Testa vuota, persona stolida", usage: "Non fà lu capusturnu davanti a tutti!", phraseMean: "Non fare lo stupido davanti a tutti!" },
  { word: "Prescia", definition: "Fretta", usage: "C'ho 'na prescia tremenda, pollai!", phraseMean: "Ho moltissima fretta, sbrigati!" },
  { word: "Vassallu", definition: "Bambino discolo, scavenzacollo", usage: "Quel vassallu ha rotto tutti li giochi!", phraseMean: "Quel monello ha rotto tutti i giocattoli!" },
  { word: "Zezzecca", definition: "Bambino diavoletto, monello impenitente", usage: "Quella zezzecca c'ha bidonato de novu!", phraseMean: "Quel monellaccio ci ha dato buca di nuovo!" },
  { word: "Prolicu", definition: "Chiacchierone che vuole sempre aver ragione", usage: "Non fà lu prolicu e ascolta!", phraseMean: "Non fare il saccente e ascolta!" },
  { word: "Lucchìa", definition: "Svogliatezza, pigrizia profonda", usage: "Oggi c'ho 'na lucchìa tremenda!", phraseMean: "Oggi sono pigro da morire!" },
  { word: "Sfantazzasse", definition: "Fare baldoria, gozzovigliare", usage: "Jamo a sfantazzasse massera!", phraseMean: "Andiamo a divertirci stasera!" },
  { word: "Perdaeri", definition: "Davvero, sul serio", usage: "Perdaeri, non c'ho capito coelle!", phraseMean: "Davvero, non ci ho capito nulla!" },
  { word: "Asseia", definition: "Adesso (asseia punti = proprio adesso)", usage: "Asseia punti me ne vado, pollai!", phraseMean: "Proprio adesso me ne vado, sbrigati!" },
  { word: "Mesamianno", definition: "Non vedo l'ora", usage: "Mesamianno de magnà la polenta co' le salsicce!", phraseMean: "Non vedo l'ora di mangiare la polenta con le salsicce!" },
];

function readGlossaryDb(): any[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_GLOSSARY, null, 2), "utf-8");
      return INITIAL_GLOSSARY;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Errore della lettura del database dei vocaboli:", error);
    return INITIAL_GLOSSARY;
  }
}

function writeGlossaryDb(data: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Errore della scrittura del database dei vocaboli:", error);
  }
}

// CORS Proxy to bypass hotlinking protection
app.get("/api/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).send("Parameter url is required");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err: any) {
    console.error("Proxy error for URL:", targetUrl, err);
    return res.status(500).send(`Proxy error: ${err.message}`);
  }
});

// 4.1. GET all words
app.get("/api/spoletino/glossary", (req, res) => {
  const glossary = readGlossaryDb();
  return res.json(glossary);
});

// 4.2. POST add/update word
app.post("/api/spoletino/glossary", (req, res) => {
  const { word, definition, usage, phraseMean } = req.body;
  if (!word || !definition || !usage || !phraseMean) {
    return res.status(400).json({ error: "Tutti i campi (word, definition, usage, phraseMean) sono obbligatori!" });
  }

  const glossary = readGlossaryDb();
  const existingIndex = glossary.findIndex(item => item.word.toLowerCase() === word.toLowerCase().trim());

  if (existingIndex !== -1) {
    glossary[existingIndex] = {
      word: word.trim(),
      definition: definition.trim(),
      usage: usage.trim(),
      phraseMean: phraseMean.trim()
    };
  } else {
    glossary.unshift({
      word: word.trim(),
      definition: definition.trim(),
      usage: usage.trim(),
      phraseMean: phraseMean.trim()
    });
  }

  writeGlossaryDb(glossary);
  return res.json({ success: true, glossary });
});

// 4.3. DELETE a word
app.delete("/api/spoletino/glossary/:word", (req, res) => {
  const { word } = req.params;
  if (!word) {
    return res.status(400).json({ error: "Parola da cancellare non specificata!" });
  }

  let glossary = readGlossaryDb();
  const initialLength = glossary.length;
  glossary = glossary.filter(item => item.word.toLowerCase() !== word.toLowerCase().trim());

  if (glossary.length === initialLength) {
    return res.status(404).json({ error: "Parola non trovata nel database." });
  }

  writeGlossaryDb(glossary);
  return res.json({ success: true, glossary });
});

// Serve frontend assets
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const serverInstance = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server SpoletoMeme in esecuzione sulla porta ${PORT}`);
});