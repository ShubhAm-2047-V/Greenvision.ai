import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin } from '../../../lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { user_id, message, locale } = await request.json();

    if (!message || !user_id) {
      return NextResponse.json({ message: "Message and user_id are required." }, { status: 400 });
    }

    const languageMap = {
      'en': 'English',
      'hi': 'Hindi',
      'mr': 'Marathi'
    };
    const targetLanguage = languageMap[locale] || 'English';

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabaseAdmin.from('chat_messages').insert({
          user_id,
          sender: 'user',
          text: message
        });
      }
    } catch (e) {
      console.warn("Could not log user message to supabase:", e);
    }

    const systemPrompt = `
      You are "AgroMind Assistant", a world-class agricultural expert, agronomist, and farm advisor.
      Answer the farmer's queries regarding soil chemistry, drip irrigation, NPK values, crop diseases, yield optimization, and general weather impacts.
      
      CRITICAL INSTRUCTIONS:
      - ALWAYS answer in ${targetLanguage}, regardless of what language the user types in.
      - Keep responses concise, clear, and highly practical for a farmer.
      - Do not use complex scientific terminology without immediately explaining it in simple terms.
      
      User query: "${message}"
    `;

    const modelResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt
    });

    const reply = modelResponse.text || "I am sorry, I couldn't formulate a response right now. Please try again.";

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabaseAdmin.from('chat_messages').insert({
          user_id,
          sender: 'bot',
          text: reply
        });
      }
    } catch (e) {
      console.warn("Could not log bot message to supabase:", e);
    }

    return NextResponse.json({
      message: "Reply generated successfully.",
      response: reply
    });

  } catch (err) {
    console.error("Chat advisor API error:", err);
    return NextResponse.json({ message: "Internal server error during advisor consultation.", error: err.message }, { status: 500 });
  }
}
