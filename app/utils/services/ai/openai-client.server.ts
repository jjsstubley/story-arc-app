import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = "gpt-4o-mini";

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
