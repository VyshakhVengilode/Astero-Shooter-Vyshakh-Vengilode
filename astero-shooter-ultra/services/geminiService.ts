
import { GoogleGenAI } from "@google/genai";

// Fix: Initialize GoogleGenAI using process.env.API_KEY directly as a named parameter as per SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMissionDebrief = async (score: number, level: number, combo: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-ranking Galactic Commander. Provide a short (2-3 sentence) humorous and atmospheric mission debriefing for a pilot who just crashed. 
      Their stats were: Score: ${score}, Level Reached: ${level}, Highest Combo: ${combo}. 
      Be creative, use sci-fi jargon, and mention their performance.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    // Fix: Access the response text via the .text property rather than a method call to comply with GenerateContentResponse requirements.
    return response.text || "Communication relay unstable. Mission data corrupted.";
  } catch (error) {
    console.error("Gemini Debrief Error:", error);
    return "The stars are silent today. Keep fighting, Pilot.";
  }
};
