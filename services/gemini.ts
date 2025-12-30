
import { GoogleGenAI, Type } from "@google/genai";
import { VibeData, GeminiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeTopic(topic: string): Promise<VibeData> {
  const prompt = `Analyze the current global "vibe" and public sentiment regarding the topic: "${topic}". 
  Provide a sentiment score between -1 (extremely negative/hostile) and 1 (extremely positive/joyful).
  Generate 5 realistic mock social media posts that reflect this sentiment.
  Also provide a one-sentence summary of the overall mood.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Sentiment score from -1 to 1" },
          summary: { type: Type.STRING, description: "Brief summary of the mood" },
          posts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                author: { type: Type.STRING },
                handle: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["author", "handle", "content"]
            }
          }
        },
        required: ["score", "summary", "posts"]
      }
    }
  });

  const rawData: GeminiResponse = JSON.parse(response.text);

  return {
    score: rawData.score,
    summary: rawData.summary,
    trend: rawData.score > 0 ? 'up' : 'down',
    posts: rawData.posts.map((p, idx) => ({
      id: `${idx}-${Date.now()}`,
      author: p.author,
      handle: p.handle,
      content: p.content,
      timestamp: 'Just now',
      sentiment: rawData.score > 0.3 ? 'positive' : rawData.score < -0.3 ? 'negative' : 'neutral'
    }))
  };
}
