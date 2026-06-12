export interface MemeText {
  id: string;
  text: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  fontSize: number; // in pixels
  color: string;
  outlineColor: string;
  backgroundColor: string;
  isBubble: boolean; // if true, render like a comic speech bubble
  bubbleType: "speech" | "thought" | "shout" | "plain";
  rotation: number; // in degrees
}

export interface MemeTemplate {
  id: string;
  name: string;
  category: "classic" | "spoleto_places" | "characters" | "colored";
  url: string; // image source or description
  gradient?: string; // fallback if standard colored backdrop
  defaultTexts?: Omit<MemeText, "id">[];
}

export interface ComicPanelData {
  id: string;
  title: string;
  backgroundUrl: string;
  backgroundGradient?: string;
  promptDescription?: string;
  texts: MemeText[];
}

export interface GlossaryItem {
  word: string;
  definition: string;
  usage: string;
  phraseMean: string;
}

export interface ComicStory {
  title: string;
  panels: {
    panel: number;
    prompt: string;
    dialogue: string;
  }[];
}

export interface SavedMeme {
  id: string;
  title: string;
  timestamp: number;
  thumbnail: string; // data URL of the generated image
  template: MemeTemplate | null;
  customImage: string | null;
  texts: MemeText[];
  aspectRatio: "1:1" | "16:9" | "4:3";
}
