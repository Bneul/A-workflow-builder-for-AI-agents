import { GoogleGenAI } from "@google/genai";
import { NodeType } from "../types";

// Helper to get the AI client
const getAiClient = () => {
    // We assume process.env.API_KEY is available as per instructions.
    // In a real production app, this would likely be proxied through a backend
    // to keep the key secure, but for this client-side demo we use the env var directly.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const runNodeLogic = async (
  nodeType: NodeType,
  inputData: string,
  config: any
): Promise<string> => {
  const ai = getAiClient();
  const modelId = 'gemini-2.5-flash';

  try {
    if (nodeType === NodeType.TRIGGER_START) {
      // Trigger just passes its config input through
      return config.initialInput || inputData || '';
    }

    if (nodeType === NodeType.ACTION_OUTPUT) {
        // Output just returns what it received
        return inputData;
    }

    if (nodeType === NodeType.AI_GENERATION) {
      const systemInstruction = config.systemInstruction || 'You are a helpful assistant.';
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: inputData, // The previous node's output is this node's input
        config: {
            systemInstruction: systemInstruction,
            temperature: parseFloat(config.temperature || '0.7'),
            maxOutputTokens: parseInt(config.maxOutputTokens || '1000', 10),
        }
      });
      return response.text || '';
    }

    if (nodeType === NodeType.AI_ANALYSIS) {
      const prompt = `Analyze the following text based on these aspects: ${config.aspects || 'General Summary'}. \n\nText to analyze:\n"${inputData}"`;
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
            temperature: 0.2, // Lower temperature for analysis
        }
      });
      return response.text || '';
    }

    if (nodeType === NodeType.AI_CHAT) {
        const persona = config.persona || 'Helpful Assistant';
        const prompt = `Act as ${persona}. Respond to the following message:\n"${inputData}"`;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || '';
    }

    return "Unknown node type executed.";

  } catch (error: any) {
    console.error("Gemini Execution Error:", error);
    return `Error: ${error.message || 'Unknown error occurred during AI execution'}`;
  }
};
