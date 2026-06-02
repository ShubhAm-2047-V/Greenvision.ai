import { GoogleGenAI } from '@google/genai';
import supabase from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const scanDisease = async (req, res) => {
  const file = req.file;
  const { user_id, crop_type = "tomato" } = req.body;

  if (!file || !user_id) {
    return res.status(400).json({ message: "Leaf image file and user_id are required." });
  }

  try {
    // 1. Upload leaf image to Supabase Storage
    const fileExt = file.originalname.split('.').pop();
    const fileName = `leaf_${user_id}_${Date.now()}.${fileExt}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('leaf-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (storageError) {
      throw new Error("Supabase storage upload failed: " + storageError.message);
    }

    const { data: urlData } = supabase.storage
      .from('leaf-images')
      .getPublicUrl(fileName);
    
    const imageUrl = urlData.publicUrl;

    // 2. Query Gemini Vision model
    const prompt = `
      You are an expert agricultural plant pathologist.
      Examine this leaf photo of a ${crop_type} plant.
      Identify any visible crop disease, pest infestation, or nutrient deficiency.
      
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
        { inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } },
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
      console.error("JSON parsing error of Gemini Disease output, trying clean-up.", parseErr);
      let cleanText = modelResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleanText);
    }

    // 3. Write pathology record to Supabase disease_records table
    const { data: record, error: dbError } = await supabase
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

    res.status(200).json({
      message: "Leaf scan completed successfully.",
      record
    });

  } catch (err) {
    console.error("Leaf scanner API error:", err);
    res.status(500).json({ message: "Internal server error during leaf diagnosis.", error: err.message });
  }
};
