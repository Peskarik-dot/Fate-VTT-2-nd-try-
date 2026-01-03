
import { GoogleGenAI } from "@google/genai";

export const getGMAssistance = async (prompt: string, context: string) => {
  // Always use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are an AI assistant for a FATE RPG Game Master. 
        Current context of the table: ${context}. 
        Keep responses concise, flavored for tabletop roleplaying, and helpful regarding FATE rules (Aspects, Skills, Stunts, Stress). 
        Respond in Russian as the primary language of the user.`,
      },
    });
    // Use .text property directly.
    return response.text || "Извините, я не смог обработать этот запрос.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Духи переплетений молчат. (Ошибка ИИ)";
  }
};
