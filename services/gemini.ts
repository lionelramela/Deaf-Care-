
import { GoogleGenAI, Type, Modality } from "@google/genai";

const TEXT_TO_SIGN_PROMPT = `
Translate the following English sentence into ASL Gloss and provide a step-by-step description of the signs for someone who is learning.
Include the primary movements, handshapes, and locations.
`;

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const translateTextToSign = async (text: string) => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: TEXT_TO_SIGN_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gloss: { type: Type.STRING, description: 'The ASL Gloss version of the text' },
            description: { type: Type.STRING, description: 'Overall description of the signs' },
            movements: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Step-by-step physical movement instructions'
            }
          },
          required: ["gloss", "description", "movements"],
          propertyOrdering: ["gloss", "description", "movements"],
        }
      }
    });
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Text to Sign Error:", error);
    throw error;
  }
};

/**
 * Refines a community post to be more encouraging or professional.
 */
export const refineCommunityPost = async (text: string, category: string) => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this ${category} for a community board dedicated to the hearing impaired. Make it clear, supportive, and accessible. Text: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Refine Post Error:", error);
    return text;
  }
};

export const detectAndTranslateLanguage = async (text: string, targetLang: string) => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify the source language of the following text and translate it to ${targetLang}.
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING, description: 'The name of the detected source language' },
            translatedText: { type: Type.STRING, description: 'The translated version of the text' }
          },
          required: ["detectedLanguage", "translatedText"]
        }
      }
    });
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Auto-detect Translation Error:", error);
    return { detectedLanguage: "Unknown", translatedText: "Translation failed." };
  }
};

export const synthesizeSpeech = async (text: string) => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const createLiveTranscriptionSession = async (callbacks: any) => {
  const ai = getGeminiClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: "You are a live transcription assistant. Listen to the user's speech and transcribe it accurately and immediately."
    }
  });
};
