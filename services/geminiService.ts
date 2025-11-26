import { GoogleGenAI } from "@google/genai";
import { GroupedAnime } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAnimeTaste = async (groupedData: GroupedAnime): Promise<string> => {
  // Prepare a condensed summary of the data to save tokens, though Flash context is large.
  // We format it as "Year: [List of top 10 titles]"
  let promptData = "";
  
  Object.keys(groupedData).sort().forEach(year => {
    const titles = groupedData[year]
        .slice(0, 15) // Limit to top 15 per year to avoid excessive payload
        .map(a => a.name_cn || a.name)
        .join(", ");
    promptData += `${year}: ${titles}\n`;
  });

  const prompt = `
    You are an expert anime critic and otaku culture historian.
    Below is a list of anime a user has watched, grouped by year.
    
    Data:
    ${promptData}

    Please provide a concise but fun "Otaku Personality Analysis" (max 200 words).
    1. Identify their favorite genres or themes based on the list.
    2. Comment on their "Anime Generation" (e.g., are they a 2000s nostalgic, a modern watcher, or eclectic?).
    3. Roast them slightly if their taste is very generic, or praise them if they found hidden gems.
    4. Return the response in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, the AI critic is currently taking a nap. Please try again later.";
  }
};
