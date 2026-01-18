
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'roast' | 'diagnosis' | 'fix' | 'general' | 'error';
  promptCode?: string;
  timestamp: number;
  audioData?: string; // Base64 audio string
  groundingMetadata?: {
    groundingChunks?: Array<{
      web?: { uri: string; title: string };
    }>;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

export enum AppMode {
  GENERATOR = 'GENERATOR',
  BEEF_UP = 'BEEF_UP'
}

export interface Preset {
  genre: string;
  description: string;
  prompt: string;
}

export interface SongSection {
  id: string;
  name: string;
  bars: number;
  description: string;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'out' | 'build' | 'drop' | 'transition';
}

export interface StructureTemplate {
  id: string;
  label: string;
  description: string;
  sections: SongSection[];
  tags: string[]; // e.g., "Radio", "Extended", "Club"
}

export interface AudioAnalysis {
  filename: string;
  duration: string;
  sampleRate: string;
  detectedBpm: string;
  detectedKey: string;
  spectralBalance: 'Dark/Muddy' | 'Balanced' | 'Bright/Harsh' | 'Mid-Forward';
  transientDensity: 'Low (Ambient)' | 'Medium (Groove)' | 'High (Percussive)';
  stereoImage: 'Mono' | 'Narrow' | 'Wide' | 'Super-Wide';
  suggestions: string[];
}
