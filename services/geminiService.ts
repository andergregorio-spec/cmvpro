
import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface StructuredPurchase {
  product: string;
  category: Category;
  value: number;
  date: string;
}

export const parseVoiceTranscript = async (transcript: string): Promise<StructuredPurchase | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia informações de compra de restaurante deste texto: "${transcript}". Retorne JSON.`,
      config: {
        systemInstruction: "Você é um assistente de entrada de dados de restaurante. Analise o texto e identifique o produto, a categoria (comida ou bebida), o valor (apenas número) e a data (formato YYYY-MM-DD, use a data de hoje se não mencionada). Retorne exatamente o schema JSON solicitado.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["comida", "bebida"] },
            value: { type: Type.NUMBER },
            date: { type: Type.STRING }
          },
          required: ["product", "category", "value", "date"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as StructuredPurchase;
  } catch (error) {
    console.error("Error parsing voice transcript:", error);
    return null;
  }
};
