import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * VITE_GEMINI_API_KEY must be set in your .env file locally 
 * and in the Vercel Dashboard Environment Variables.
 */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getMissionDebrief = async (score: number, level: number, combo: number): Promise<string> => {
  // If no API key is provided, fail gracefully immediately to prevent app hang
  if (!API_KEY) {
    return "Intelligence relay offline. Secure the sector, Pilot.";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Updated to the stable high-speed model
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 100,
      }
    });

    const prompt = `You are a high-ranking Galactic Commander. Provide a short (2-3 sentence) 
      humorous and atmospheric mission debriefing for a pilot who just crashed. 
      Stats: Score: ${score}, Level: ${level}, Max Combo: ${combo}. 
      Use sci-fi jargon and be concise.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text || "Communication relay unstable. Mission data corrupted.";
  } catch (error) {
    console.error("Gemini Debrief Error:", error);
    return "The stars are silent today. Keep fighting, Pilot.";
  }
};
