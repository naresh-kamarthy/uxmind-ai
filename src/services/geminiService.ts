import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `You are a Senior UX Researcher and UI Auditor.
Analyze the provided UI screenshot and produce a structured UX review report.
Focus on usability, accessibility, visual hierarchy, and design quality.

For each issue detected, provide bounding box coordinates (x, y, width, height) in percentage relative to the image dimensions.
- x, y: top-left corner (0-100)
- width, height: dimensions (0-100)

Return strictly valid JSON following this schema:
{
  "uxScore": number (0-100),
  "uiType": string,
  "metrics": {
    "accessibility": number (0-100),
    "mobile": number (0-100),
    "hierarchy": number (0-100),
    "consistency": number (0-100)
  },
  "issues": [
    {
      "title": string,
      "severity": "Low" | "Medium" | "High",
      "description": string,
      "type": "contrast" | "spacing" | "hierarchy" | "cta" | "accessibility" | "other",
      "coordinates": {
        "x": number,
        "y": number,
        "width": number,
        "height": number
      }
    }
  ],
  "improvements": string[]
}`;

export const analyzeScreenshot = async (base64Image: string): Promise<{ result: AnalysisResult; tokens: number }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const model = "gemini-3-flash-preview";
    
    const prompt = "Perform a comprehensive UX audit of this UI screenshot. Evaluate the interface for usability, accessibility, and design consistency. Identify specific issues and provide their coordinates.";
    
    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: base64Image.split(',')[1] || base64Image,
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [imagePart, { text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            uxScore: { type: Type.NUMBER },
            uiType: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              properties: {
                accessibility: { type: Type.NUMBER },
                mobile: { type: Type.NUMBER },
                hierarchy: { type: Type.NUMBER },
                consistency: { type: Type.NUMBER }
              },
              required: ["accessibility", "mobile", "hierarchy", "consistency"]
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["contrast", "spacing", "hierarchy", "cta", "accessibility", "other"] },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER }
                    },
                    required: ["x", "y", "width", "height"]
                  }
                },
                required: ["title", "severity", "description", "coordinates"]
              }
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["uxScore", "uiType", "metrics", "issues", "improvements"]
        }
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    const result = JSON.parse(resultText) as AnalysisResult;
    
    // Estimate tokens (rough approximation for display)
    const tokens = resultText.length / 4 + 1000; // 1000 for image context

    return { result, tokens: Math.round(tokens) };
  } catch (error: any) {
    if (error?.message?.includes("Requested entity was not found") || 
        error?.status === "NOT_FOUND" ||
        JSON.stringify(error).includes("NOT_FOUND")) {
      
      if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        throw new Error("API Key required. Please select a key and try again.");
      }
    }
    throw error;
  }
};

export const regenerateSection = async (section: string, currentContent: string, base64Image: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = "gemini-3-flash-preview";
    
    const prompt = `As a Senior UX Researcher, I want you to regenerate and improve this specific suggestion: "${currentContent}".
    The section is: ${section}.
    Improve only this specific point while keeping the overall layout and context of the UI in mind.
    Return ONLY the improved string, no JSON, no extra text.`;

    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: base64Image.split(',')[1] || base64Image,
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [imagePart, { text: prompt }] }],
    });

    return response.text || currentContent;
  } catch (error) {
    console.error("Regeneration error:", error);
    return currentContent;
  }
};
