
import { GoogleGenAI, Modality } from "@google/genai";
import { D_HZ_SYSTEM_PROMPT } from "../constants";
import { AudioAnalysis } from "../types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey });
}

export interface GenerationOptions {
  useThinking?: boolean;
  useSearch?: boolean;
}

export const generateResponse = async (
  userMessage: string, 
  history: string[] = [], 
  options: GenerationOptions = {}
): Promise<{ text: string; groundingMetadata?: any }> => {
  if (!ai) throw new Error("API Key not configured");

  // Default to Flash for speed and standard tasks
  let model = "gemini-3-flash-preview"; 
  let config: any = {
    systemInstruction: D_HZ_SYSTEM_PROMPT,
    temperature: 0.9,
  };

  // Configure Thinking Mode (Must use Gemini 3 Pro)
  if (options.useThinking) {
    model = "gemini-3-pro-preview";
    config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for Pro
    // Note: maxOutputTokens must not be set when thinkingConfig is used with high budget preference
  } else {
    config.maxOutputTokens = 2000;
  }

  // Configure Search Grounding
  if (options.useSearch) {
    // Flash supports search
    config.tools = [{ googleSearch: {} }];
  }

  const fullContent = `${history.join("\n")}\nUser: ${userMessage}`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: fullContent }] },
      config
    });

    return {
      text: response.text || "Man, the engine stalled. Try again.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  if (!ai) return undefined;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        }
      }
    });
    // Return base64 audio data
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  if (!ai) throw new Error("API Key not configured");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
          { text: "Transcribe this audio exactly as spoken. Do not add any commentary." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};

// Real audio analysis function using Gemini 3 Flash Multimodal
export const analyzeAudioContext = async (
    filename: string, 
    duration: number, 
    audioBase64: string | null = null, 
    mimeType: string = "audio/mp3",
    userDescription: string = ""
): Promise<AudioAnalysis> => {
    if (!ai) throw new Error("API Key not configured");
    
    // We construct a multimodal prompt: Text + Audio
    const parts: any[] = [
        { 
            text: `
            Analyze this audio file (or audio description) acting as D-Hz (Master Audio Engineer).
            Filename: "${filename}"
            Duration: ${duration}s
            User Description: "${userDescription}"

            Task: Perform a technical audit of the audio characteristics.
            1. Detect BPM and Key accurately.
            2. Analyze Spectral Balance (Low/Mid/High energy).
            3. Analyze Stereo Image width.
            4. Assess Transient Density (Percussiveness).
            5. Provide 3 specific engineering suggestions for "Beefing Up" or producing this track in Suno V5.

            Output ONLY valid JSON matching this schema:
            {
              "filename": string,
              "duration": string (e.g. "3:45"),
              "sampleRate": string (inferred, e.g. "44.1kHz"),
              "detectedBpm": string (e.g. "140 BPM"),
              "detectedKey": string (e.g. "C Minor"),
              "spectralBalance": "Dark/Muddy" | "Balanced" | "Bright/Harsh" | "Mid-Forward",
              "transientDensity": "Low (Ambient)" | "Medium (Groove)" | "High (Percussive)",
              "stereoImage": "Mono" | "Narrow" | "Wide" | "Super-Wide",
              "suggestions": [string, string, string]
            }
            ` 
        }
    ];

    if (audioBase64) {
        parts.push({
            inlineData: {
                mimeType: mimeType,
                data: audioBase64
            }
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Flash is multimodal and fast
            contents: { parts: parts },
            config: { responseMimeType: "application/json" }
        });

        const jsonStr = response.text || "{}";
        // Clean markdown code blocks if present (Gemini sometimes adds them despite responseMimeType)
        const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as AudioAnalysis;
    } catch (error) {
        console.error("Analysis Error:", error);
        // Fallback mock data
        return {
            filename: filename,
            duration: `${Math.floor(duration/60)}:${Math.floor(duration%60).toString().padStart(2, '0')}`,
            sampleRate: "44.1kHz",
            detectedBpm: "Unknown",
            detectedKey: "Unknown",
            spectralBalance: "Balanced",
            transientDensity: "Medium (Groove)",
            stereoImage: "Wide",
            suggestions: ["Check low-end phase", "Verify transient clarity", "Monitor headroom"]
        };
    }
};
