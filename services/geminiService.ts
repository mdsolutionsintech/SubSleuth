import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AlternativeService } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured alternative recommendations
const alternativeSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name of the alternative service" },
      priceDescription: { type: Type.STRING, description: "Short price description (e.g., '$9.99/mo' or 'Free'). Ensure you use the requested currency symbol." },
      savingsDescription: { type: Type.STRING, description: "Brief text explaining why it is cheaper or better value" },
      keyFeatures: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 3 key features"
      }
    },
    required: ["name", "priceDescription", "savingsDescription", "keyFeatures"]
  }
};

export const getAlternatives = async (serviceName: string, currencyCode: string = "USD"): Promise<AlternativeService[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `I am currently using ${serviceName} and it is too expensive. 
    Suggest 3 cheaper or free alternatives. 
    Focus on high value for money. 
    Important: Please provide pricing estimates in ${currencyCode} currency.
    Return the result in JSON format.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: alternativeSchema,
        systemInstruction: "You are a helpful financial assistant dedicated to saving users money on subscriptions.",
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as AlternativeService[];
    return data;
  } catch (error) {
    console.error("Error fetching alternatives:", error);
    throw new Error("Failed to find alternatives. Please try again.");
  }
};

export const getCancellationGuide = async (serviceName: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Provide a concise, step-by-step guide on how to cancel the subscription for ${serviceName}. 
    Include specific URL links to the cancellation page if they exist (formatted as markdown links). 
    If there are "dark patterns" or retention tricks to watch out for, mention them briefly.
    Format the response in Markdown.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert consumer advocate helping users cancel unwanted services quickly.",
      },
    });

    return response.text || "No details found.";
  } catch (error) {
    console.error("Error fetching guide:", error);
    throw new Error("Could not generate cancellation guide.");
  }
};