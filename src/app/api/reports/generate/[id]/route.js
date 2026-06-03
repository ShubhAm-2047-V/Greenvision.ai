import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { generatePdfBuffer } from '../../../../../lib/pdfGenerator';

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

    // Use the shared utility to generate the PDF buffer
    const pdfBytes = await generatePdfBuffer(prediction);

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
