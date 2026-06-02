import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin } from '../../../../lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const user_id = formData.get('user_id');
    const crop_type = formData.get('crop_type') || 'tomato';

    if (!file || !user_id) {
      return NextResponse.json({ message: "Leaf image file and user_id are required." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `leaf_${user_id}_${Date.now()}.${fileExt}`;
    
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('leaf-images')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (storageError) {
      throw new Error("Supabase storage upload failed: " + storageError.message);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('leaf-images')
      .getPublicUrl(fileName);
    
    const imageUrl = urlData.publicUrl;

    const prompt = `
      You are an expert agricultural plant pathologist.
      
      CRITICAL INSTRUCTION: Examine the provided image. First, determine if the image is actually a leaf, crop, or plant. 
      If the image is completely unrelated to plants (e.g., a person, an animal, a car, a random object), you MUST respond ONLY with this exact JSON:
      {"error": "The uploaded image does not appear to be a plant or leaf. Please upload a valid crop image."}

      If the image IS a plant or leaf, assume it is a ${crop_type} plant. Identify any visible crop disease, pest infestation, or nutrient deficiency.
      
      Respond ONLY with a valid JSON matching this schema:
      {
        "disease_name": "Name of the disease (or 'Healthy' if no disease is found)",
        "confidence": 94.5,
        "severity": "Low / Medium / High / Critical",
        "treatment": "Actionable, step-by-step chemical/mechanical remedies to treat the active disease.",
        "medicine": "Recommended commercial fungicides, pesticides, or organic remedies (e.g. Copper Oxychloride, Neem oil spray)",
        "prevention": "Tips to prevent this disease in the next cropping cycle (soil sterilization, rotation)",
        "recovery_time": "Estimated recovery time if treatment is applied (e.g. '10 - 14 days')"
      }

      Do not include markdown wraps, just return the JSON text directly.
    `;

    const modelResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { mimeType: file.type, data: fileBuffer.toString('base64') } },
        prompt
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    let resultJson = {};
    try {
      resultJson = JSON.parse(modelResponse.text.trim());
    } catch (parseErr) {
      let cleanText = modelResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleanText);
    }

    if (resultJson.error) {
      return NextResponse.json({ message: resultJson.error }, { status: 400 });
    }

    const { data: record, error: dbError } = await supabaseAdmin
      .from('disease_records')
      .insert({
        user_id,
        image_url: imageUrl,
        crop_type,
        disease_name: resultJson.disease_name,
        confidence: resultJson.confidence,
        severity: resultJson.severity,
        treatment: resultJson.treatment,
        prevention: resultJson.prevention,
        medicine: resultJson.medicine,
        recovery_time: resultJson.recovery_time
      })
      .select()
      .single();

    if (dbError) throw new Error("Database disease record insertion failed: " + dbError.message);

    return NextResponse.json({
      message: "Leaf scan completed successfully.",
      record
    });

  } catch (err) {
    console.error("Leaf scanner API error:", err);
    return NextResponse.json({ message: "Internal server error during leaf diagnosis.", error: err.message }, { status: 500 });
  }
}
