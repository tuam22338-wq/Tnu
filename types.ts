export enum Status {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

// NOTE: gemini-1.5-pro can be used but may require special access.
export enum Model {
  GEMINI_2_5_FLASH = 'gemini-2.5-flash',
  GEMINI_1_5_PRO = 'gemini-1.5-pro',
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
}

export interface Settings {
  apiKey: string;
  model: Model;
}

export enum AnalysisMode {
  OUTLINE = 'outline',
  CHARACTER_ANALYSIS = 'character_analysis',
}

export interface CharacterRelationship {
  characterName: string;
  relationship: string;
}

export interface CharacterArc {
  beginning: string;
  middle: string;
  end: string;
}

export interface CharacterProfile {
  name: string;
  description: string;
  role: 'Nhân vật chính' | 'Nhân vật phụ' | 'Nhân vật phản diện' | 'Khác';
  arc: CharacterArc;
  relationships: CharacterRelationship[];
  keyQuotes: string[];
}

export type CharacterAnalysisData = CharacterProfile[];