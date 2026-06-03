import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateProjectReport() {
  const pdfDoc = await PDFDocument.create();
  
  // Embed standard fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Theme Colors (Warm White Theme to match AgroMind AI website)
  const bgColor = rgb(250/255, 248/255, 245/255); // #faf8f5 Warm White background
  const primaryColor = rgb(16/255, 185/255, 129/255); // #10b981 Emerald Green accent
  const textDark = rgb(31/255, 41/255, 55/255); // #1f2937 Dark text for readability
  const textMuted = rgb(75/255, 85/255, 99/255); // #4b5563 Muted gray text

  let page;
  let width, height;
  let y;

  const addNewPage = () => {
    page = pdfDoc.addPage([595, 842]); // A4 Size
    width = page.getSize().width;
    height = page.getSize().height;
    page.drawRectangle({ x: 0, y: 0, width, height, color: bgColor });
    y = height - 50;
  };

  addNewPage();

  const checkPageBreak = (spaceNeeded) => {
    if (y - spaceNeeded < 50) {
      addNewPage();
    }
  };

  const writeText = (text, size, textFont, color, align = 'left') => {
    if (!text) return;
    const lines = String(text).split('\n');
    for (const line of lines) {
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine + word + ' ';
        const textWidth = textFont.widthOfTextAtSize(testLine, size);
        
        if (textWidth > width - 100) {
          checkPageBreak(size * 1.5);
          const xPos = align === 'center' ? (width - textFont.widthOfTextAtSize(currentLine.trim(), size)) / 2 : 50;
          page.drawText(currentLine.trim(), { x: xPos, y, size, font: textFont, color });
          y -= size * 1.5;
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.trim()) {
        checkPageBreak(size * 1.5);
        const xPos = align === 'center' ? (width - textFont.widthOfTextAtSize(currentLine.trim(), size)) / 2 : 50;
        page.drawText(currentLine.trim(), { x: xPos, y, size, font: textFont, color });
        y -= size * 1.5;
      }
    }
  };

  const addSection = (title, content) => {
    if (!content || content.trim() === '') return;
    checkPageBreak(40);
    y -= 10;
    writeText(title, 16, boldFont, primaryColor);
    y -= 10;
    writeText(content, 12, font, textDark);
    y -= 20;
  };

  const addBulletPoints = (title, points) => {
    checkPageBreak(40);
    y -= 10;
    writeText(title, 16, boldFont, primaryColor);
    y -= 10;
    for (const point of points) {
      writeText(`• ${point}`, 12, font, textDark);
      y -= 5;
    }
    y -= 15;
  };

  // COVER PAGE
  y -= 200;
  writeText('AgroMind AI', 36, boldFont, primaryColor, 'center');
  y -= 15;
  writeText('Project Architecture & Documentation Report', 18, boldFont, textDark, 'center');
  y -= 30;
  writeText('Presented by: Shubham', 14, font, textMuted, 'center');
  
  addNewPage();

  // CONTENT
  addSection('1. Project Overview', 
    'AgroMind AI is a state-of-the-art multimodal agricultural intelligence platform designed to empower farmers and agronomists with precision data. By leveraging advanced artificial intelligence, geolocation, and environmental APIs, the platform conducts comprehensive visual and data-driven analysis of farms to provide highly accurate crop recommendations, yield forecasts, and soil health diagnostics.'
  );

  addBulletPoints('2. Core Features', [
    'Multimodal Visual Analysis: Analyzes farm and crop images to identify health, pests, and growth stages using Google Gemini 2.5 Flash Vision.',
    'Environmental Context Aggregation: Automatically pulls real-time weather forecasts, rainfall data, and localized soil chemical baselines (Nitrogen, pH, Carbon) based on GPS coordinates.',
    'Intelligent Recommendation Engine: Generates data-driven crop recommendations, expected profit margins, and dynamic fertilizer/irrigation schedules.',
    'Automated Reporting: Dynamically generates beautifully formatted, paginated PDF reports.',
    'Email Delivery System: Seamlessly emails the finalized PDF reports to the user upon generation.'
  ]);

  addBulletPoints('3. Technology Stack', [
    'Frontend Framework: Next.js 14 (React) with Server Components.',
    'Styling: Tailwind CSS for a highly responsive, modern, and accessible user interface.',
    'Backend & API: Next.js Edge and Serverless API Routes.',
    'Database & Authentication: Supabase (PostgreSQL) for secure data persistence and user session management.',
    'Artificial Intelligence: Google Gemini 2.5 Flash for rapid, multimodal generative analysis.',
    'PDF Generation: pdf-lib for dynamic, secure, and filesystem-independent PDF rendering on Vercel.',
    'Email Engine: NodeMailer connected via secure SMTP.'
  ]);

  addBulletPoints('4. Third-Party APIs & Data Sources', [
    'Nominatim (OpenStreetMap): Reverse geocoding to translate raw GPS coordinates into Village, District, and State identifiers.',
    'Open-Meteo: Real-time and forecasted meteorological data (Temperature, Humidity, Rainfall).',
    'SoilGrids (ISRIC): High-resolution global soil property baselines (pH, Nitrogen, Soil Texture).'
  ]);

  addSection('5. System Architecture & Workflow', 
    '1. Data Ingestion: The user inputs their farm details, precise location (Lat/Lon), and uploads images of their crops/soil.\n' +
    '2. Context Gathering: The Next.js backend asynchronously queries Nominatim, Open-Meteo, and SoilGrids to build an environmental profile.\n' +
    '3. AI Inference: The images and environmental data are packaged into a strict prompt and sent to the Gemini 2.5 Flash model. The AI is instructed to return a structured JSON response containing the agronomic analysis.\n' +
    '4. Persistence: The structured results are stored securely in the Supabase PostgreSQL database.\n' +
    '5. PDF Rendering: The pdf-lib engine reads the database record and dynamically renders a multi-page PDF document, applying a warm white theme and wrapping long text fields.\n' +
    '6. Delivery: NodeMailer attaches the generated PDF buffer to an HTML email and sends it directly to the user.'
  );

  addSection('6. Key Technical Challenges Solved', 
    '• Vercel Edge Compatibility: Overcame strict serverless filesystem limitations by completely replacing legacy PDF libraries (pdfkit) with pdf-lib, which embeds standard fonts directly into the bundle via base64 encoding.\n' +
    '• AI Timeouts: Handled Vercel Lambda timeouts by isolating the Gemini API call and configuring maxDuration exports, ensuring the AI has ample time to generate deeply detailed agronomic insights without falling back to placeholder text.\n' +
    '• Dynamic Text Pagination: Engineered a custom text-wrapping and pagination algorithm within the PDF generator to ensure the AI\'s lengthy expert insights seamlessly flow across multiple pages without overflowing or clipping.'
  );

  addSection('7. Conclusion', 
    'AgroMind AI demonstrates the powerful intersection of generative artificial intelligence and precision agriculture. By synthesizing visual data with localized environmental APIs, the platform democratizes access to expert-level agronomic intelligence, paving the way for optimized yields and sustainable farming practices.'
  );

  // Footer
  checkPageBreak(30);
  y -= 20;
  writeText('Generated automatically for project presentation.', 10, font, textMuted, 'center');

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('AgroMind_Project_Report.pdf', pdfBytes);
  console.log('Project report generated successfully at AgroMind_Project_Report.pdf');
}

generateProjectReport().catch(console.error);
