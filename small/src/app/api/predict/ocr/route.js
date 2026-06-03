import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ message: "Soil Health Card photo file is required." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { mimeType: file.type, data: fileBuffer.toString('base64') } },
        `Perform OCR on this soil report or card. Extract the values of:
        - Nitrogen (N)
        - Phosphorus (P)
        - Potassium (K)
        - Soil pH
        - Soil Organic Carbon (OC)
        
        Respond strictly in a valid JSON format with keys: nitrogen, phosphorus, potassium, ph, organic_carbon. 
        If a value cannot be found, set it to null. 
        Do not output markdown code formatting, return raw JSON.`
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsedOcr = JSON.parse(response.text.trim());
    return NextResponse.json({
      message: "OCR report read successfully.",
      data: parsedOcr
    });
  } catch (err) {
    console.error("OCR API error:", err);
    return NextResponse.json({ message: "Soil report OCR failed.", error: err.message }, { status: 500 });
  }
}
