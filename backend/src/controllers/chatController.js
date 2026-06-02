import { GoogleGenAI } from '@google/genai';
import supabase from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const handleChatMessage = async (req, res) => {
  const { user_id, message } = req.body;

  if (!message || !user_id) {
    return res.status(400).json({ message: "Message and user_id are required." });
  }

  try {
    // 1. Log the user's message to the chat table
    await supabase.from('chat_messages').insert({
      user_id,
      sender: 'user',
      text: message
    });

    // 2. Formulate prompt for Gemini
    const systemPrompt = `
      You are "AgroMind Assistant", a world-class agricultural expert, agronomist, and farm advisor.
      Answer the farmer's queries regarding soil chemistry, drip irrigation, NPK values, crop diseases, yield optimization, and general weather impacts.
      
      CRITICAL INSTRUCTIONS:
      - Answer in the SAME language as the query (English, Hindi, or Marathi).
      - Keep responses concise, clear, and highly practical for a farmer.
      - Do not use complex scientific terminology without immediately explaining it in simple terms.
      
      User query: "${message}"
    `;

    const modelResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt
    });

    const reply = modelResponse.text || "I am sorry, I couldn't formulate a response right now. Please try again.";

    // 3. Log the bot's response to the database
    await supabase.from('chat_messages').insert({
      user_id,
      sender: 'bot',
      text: reply
    });

    res.status(200).json({
      message: "Reply generated successfully.",
      response: reply
    });

  } catch (err) {
    console.error("Chat advisor API error:", err);
    res.status(500).json({ message: "Internal server error during advisor consultation.", error: err.message });
  }
};
