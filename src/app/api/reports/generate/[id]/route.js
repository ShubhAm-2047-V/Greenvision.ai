import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabaseAdmin } from '../../../../../lib/supabase';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const { data: prediction, error } = await supabaseAdmin
      .from('predictions')
      .select('*, farms(*)')
      .eq('id', id)
      .single();

    if (error || !prediction) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Embed standard fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Theme Colors (Dark Theme to match AgroMind AI website)
    const bgColor = rgb(17/255, 24/255, 39/255); // #111827 Dark background
    const primaryColor = rgb(16/255, 185/255, 129/255); // #10b981 Emerald Green accent
    const textLight = rgb(243/255, 244/255, 246/255); // #f3f4f6 Light text
    const textMuted = rgb(156/255, 163/255, 175/255); // #9ca3af Muted gray text

    // Draw full page dark background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgColor,
    });

    let y = height - 50;

    // Title
    page.drawText('AgroMind AI', { x: width / 2 - 70, y, size: 24, font: boldFont, color: primaryColor });
    y -= 30;
    page.drawText('Agronomic Analysis Report', { x: width / 2 - 100, y, size: 16, font: boldFont, color: textMuted });
    y -= 40;

    // Farm Details
    let farmName = 'Unknown Farm';
    if (prediction.farms) {
      if (Array.isArray(prediction.farms) && prediction.farms.length > 0) farmName = prediction.farms[0].name;
      else if (!Array.isArray(prediction.farms)) farmName = prediction.farms.name;
    }

    page.drawText('Farm Profile', { x: 50, y, size: 14, font: boldFont, color: primaryColor });
    y -= 20;
    page.drawText(`Farm Name: ${farmName}`, { x: 50, y, size: 10, font, color: textLight });
    y -= 15;
    page.drawText(`Location: ${prediction.village || 'N/A'}, ${prediction.district || 'N/A'}, ${prediction.state || 'N/A'}`, { x: 50, y, size: 10, font, color: textLight });
    y -= 30;

    // AI Recommendation
    page.drawText('AI Recommendation', { x: 50, y, size: 14, font: boldFont, color: primaryColor });
    y -= 20;
    page.drawText(`Recommended Crop: ${String(prediction.crop || 'Unknown').toUpperCase()}`, { x: 50, y, size: 10, font, color: textLight });
    y -= 15;
    page.drawText(`Confidence Score: ${prediction.confidence || 0}%`, { x: 50, y, size: 10, font, color: textLight });
    y -= 15;
    page.drawText(`Expected Yield: ${prediction.expected_yield || 'N/A'}`, { x: 50, y, size: 10, font, color: textLight });
    y -= 15;
    page.drawText(`Expected Profit: ${prediction.expected_profit || 'N/A'}`, { x: 50, y, size: 10, font, color: textLight });
    y -= 30;

    // Health Diagnostics
    page.drawText('Health Diagnostics', { x: 50, y, size: 14, font: boldFont, color: primaryColor });
    y -= 20;
    page.drawText(`Farm Health Score: ${prediction.farm_health_score || 0}/100`, { x: 50, y, size: 10, font, color: textLight });
    y -= 15;
    page.drawText(`Soil Health Score: ${prediction.soil_health_score || 0}/100`, { x: 50, y, size: 10, font, color: textLight });
    y -= 30;

    // Environmental
    if (prediction.weather_data) {
      page.drawText('Environmental Baselines', { x: 50, y, size: 14, font: boldFont, color: primaryColor });
      y -= 20;
      page.drawText(`Temperature: ${prediction.weather_data.temperature || 'N/A'} C`, { x: 50, y, size: 10, font, color: textLight });
      y -= 15;
      page.drawText(`Rainfall (Monthly Avg): ${prediction.weather_data.rainfall || 'N/A'} mm`, { x: 50, y, size: 10, font, color: textLight });
      y -= 15;
      page.drawText(`Soil Nitrogen: ${prediction.nitrogen || 'N/A'} g/kg`, { x: 50, y, size: 10, font, color: textLight });
      y -= 15;
      page.drawText(`Soil pH: ${prediction.ph || 'N/A'}`, { x: 50, y, size: 10, font, color: textLight });
      y -= 30;
    }

    // Expert Insights
    page.drawText('Expert Insights', { x: 50, y, size: 14, font: boldFont, color: primaryColor });
    y -= 20;
    
    // Primitive text wrapping logic
    const words = String(prediction.explanation || 'No detailed insights available.').split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const textWidth = font.widthOfTextAtSize(testLine, 10);
      
      if (textWidth > width - 100) {
        page.drawText(currentLine, { x: 50, y, size: 10, font, color: textMuted });
        y -= 15;
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, { x: 50, y, size: 10, font, color: textMuted });
    }

    y -= 40;
    page.drawText('Report auto-generated by AgroMind AI Platform.', { x: width / 2 - 100, y: 50, size: 8, font, color: textMuted });

    // Save as Uint8Array bytes
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="AgroMind_Report_${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ message: "Internal server error during PDF generation", error: String(err.message) }, { status: 500 });
  }
}
