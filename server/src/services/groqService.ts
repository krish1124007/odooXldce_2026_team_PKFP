import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

let groqClient: Groq | null = null;

const getGroqClient = (): Groq | null => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "gsk_demo_key_placeholder" || apiKey.trim() === "") {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

export const getGroqModel = (): string => {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
};

export interface GroqChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_call_id?: string;
  name?: string;
  tool_calls?: any[];
}

export const runGroqChat = async (params: {
  messages: GroqChatMessage[];
  tools?: any[];
  model?: string;
  temperature?: number;
}) => {
  const client = getGroqClient();
  if (!client) {
    throw new Error("GROQ_API_KEY is missing or invalid. Agentic AI features operate in offline/fallback mode.");
  }

  const modelToUse = params.model || getGroqModel();

  try {
    const payload: any = {
      messages: params.messages,
      model: modelToUse,
      temperature: params.temperature ?? 0.2,
    };

    if (params.tools && params.tools.length > 0) {
      payload.tools = params.tools;
      payload.tool_choice = "auto";
    }

    const response = await client.chat.completions.create(payload);
    return response.choices[0]?.message;
  } catch (error: any) {
    console.error("Groq API Execution Error:", error.message || error);
    throw new Error(`Groq API Error: ${error.message || "Failed to communicate with Groq AI service."}`);
  }
};
