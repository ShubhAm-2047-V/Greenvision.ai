const pptxgen = require('pptxgenjs');

let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Theme Colors (Matching the website)
const bgColor = 'FAF8F5'; // Warm White
const primaryColor = '10B981'; // Emerald Green
const textDark = '1F2937'; // Dark Gray
const textMuted = '4B5563'; // Muted Gray

// Default Slide Master
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: bgColor },
  objects: [
    // Top Emerald Green Accent Bar
    { rect: { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: primaryColor } } },
    // Bottom Footer Text
    { text: { text: 'Agrovision AI Project Presentation - Diploma Final Year', options: { x: 0.5, y: '93%', w: '90%', fontSize: 10, color: textMuted, fontFace: 'Arial' } } }
  ]
});

// Helper function to add content slides
const addSlide = (title, contentLines) => {
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  
  // Slide Title
  slide.addText(title, { x: 0.5, y: 0.6, w: '90%', h: 0.8, fontSize: 36, bold: true, color: primaryColor, fontFace: 'Arial' });
  
  // Slide Content (Bulleted List)
  let content = contentLines.map(line => ({
    text: line,
    options: { bullet: { type: 'number' }, color: textDark, fontSize: 22, fontFace: 'Arial', breakLine: true }
  }));
  
  slide.addText(content, { x: 0.5, y: 1.8, w: '90%', h: 3.5, margin: 10, lineSpacing: 35 });
};

// 1. Title Slide (Custom Layout)
let slide1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide1.addText('AGROMIND AI', { x: 0, y: 2.0, w: '100%', h: 1, align: 'center', fontSize: 60, bold: true, color: primaryColor, fontFace: 'Arial' });
slide1.addText('Intelligent Agricultural Analysis & Crop Recommendation Platform', { x: 0, y: 3.2, w: '100%', h: 1, align: 'center', fontSize: 24, color: textDark, fontFace: 'Arial' });
slide1.addText('Presented By: Shubham', { x: 0, y: 4.5, w: '100%', h: 0.5, align: 'center', fontSize: 20, color: textMuted, fontFace: 'Arial', italic: true });

// 2. Problem Statement
addSlide('1. The Problem Statement', [
  'Traditional farming relies on generational guesswork rather than empirical data.',
  'Consulting expert agronomists and utilizing soil laboratories is slow and expensive.',
  'Farmers lack real-time, localized insights into critical soil chemistry (Nitrogen, pH).',
  'Crop diseases spread rapidly before they are accurately diagnosed, leading to massive yield losses.'
]);

// 3. The Solution
addSlide('2. The Solution: Agrovision AI', [
  'A cloud-based, multimodal AI platform acting as a hyper-intelligent virtual agronomist.',
  'Requires zero manual data entry: farmers only need a smartphone camera and GPS location.',
  'Generates exhaustive crop, soil, and financial analysis in under 30 seconds.',
  'Democratizes precision agriculture, empowering smallholder farmers globally.'
]);

// 4. Key Features
addSlide('3. Core Platform Features', [
  'Multimodal Visual Analysis: AI interprets crop health and soil dryness directly from images.',
  'Contextual Aggregation: Automatically pulls live weather and subterranean soil baselines.',
  'Financial Forecasting: Dynamically calculates expected crop yields and profit margins.',
  'Automated Reporting: Custom engine dynamically generates paginated, styled PDF reports.',
  'Instant Email Delivery: Dispatches the final reports directly to the user offline.'
]);

// 5. Technology Stack
addSlide('4. Modern Technology Stack', [
  'Frontend: Built on Next.js 14 and React 18 for high performance.',
  'Styling: Tailwind CSS ensures a responsive, mobile-first design for on-field usage.',
  'Backend: Next.js Serverless API Routes and Edge Functions for massive scalability.',
  'Database & Auth: Supabase (PostgreSQL) handles secure data persistence and Row Level Security.',
  'Utilities: pdf-lib (PDF generation) and NodeMailer (SMTP Email dispatch).'
]);

// 6. Third-Party Integrations
addSlide('5. Third-Party API Integrations', [
  'Google Gemini 2.5 Flash: The core generative vision-language AI model.',
  'Nominatim (OpenStreetMap): Reverse geocoding to translate GPS into village and district names.',
  'Open-Meteo: Fetches real-time meteorological forecasting and 7-day rainfall averages.',
  'ISRIC SoilGrids: High-resolution spatial REST API for extracting Soil pH and Nitrogen levels.'
]);

// 7. System Workflow
addSlide('6. System Architecture & Workflow', [
  'User uploads a farm image and grants browser GPS permissions.',
  'Next.js parallelizes requests to Nominatim, Open-Meteo, and SoilGrids.',
  'Aggregated context + image is injected into a strict prompt and sent to Gemini 2.5 Flash.',
  'AI returns a structured JSON recommendation matrix containing health scores and plans.',
  'Data is securely persisted into the Supabase database.',
  'PDF is dynamically rendered in memory and instantly emailed to the user.'
]);

// 8. Core AI Engine
addSlide('7. The Intelligence Engine', [
  'Utilizes Multimodal processing, synthesizing visual pixels with textual API context.',
  'System Prompt explicitly forces the AI into an "Expert Agronomist" persona.',
  'Cross-references visual leaf anomalies against localized weather history to diagnose blight.',
  'Generates highly structured, predictable JSON outputs to feed the frontend UI.',
  'Rigid grounding in API data severely reduces AI hallucination risk.'
]);

// 9. Technical Achievements
addSlide('8. Key Engineering Achievements', [
  'Vercel Edge Compatibility: Overcame strict filesystem limits by rendering PDFs completely in-memory.',
  'Timeout Mitigation: Engineered the Next.js routes to robustly handle heavy 60s AI payloads.',
  'Custom Pagination Engine: Built a proprietary text-wrapping algorithm for dynamic PDF text.',
  'Frictionless UX: Designed a highly intuitive interface accessible to non-technical users.'
]);

// 10. Conclusion & Future Scope
addSlide('9. Conclusion & Future Scope', [
  'Conclusion: Agrovision AI successfully proves that high-end agricultural intelligence can be accessible.',
  'Future Scope 1: Integration with physical IoT soil moisture sensors for live telemetry.',
  'Future Scope 2: Multilingual voice-to-text interface (Hindi, Marathi) for rural accessibility.',
  'Future Scope 3: Satellite imagery (NDVI) integration for macro-scale farm analysis.'
]);

// Generate the file
pptx.writeFile({ fileName: 'Agrovision_AI_Presentation.pptx' })
  .then(fileName => {
      console.log(`Successfully created PPTX file: ${fileName}`);
  })
  .catch(err => {
      console.error("Error creating PPTX:", err);
  });
