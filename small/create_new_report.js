const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Mini Project Report - Agrovision.Ai</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.6; margin: 0; padding: 0; }
        h1, h2, h3 { text-align: center; }
        .page { page-break-after: always; padding: 20px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .logo { width: 150px; display: block; margin: 20px auto; }
        p { text-align: justify; }
        ul { text-align: justify; }
    </style>
</head>
<body>

    <!-- Cover Page -->
    <div class="page">
        <h2>V.V.P. INSTITUTE OF ENGINEERING & TECHNOLOGY, SOLAPUR</h2>
        <img src="file:///${path.resolve('logo.jpeg').replace(/\\/g, '/')}" class="logo" alt="Logo" />
        <br/><br/>
        <h3>A MINI PROJECT REPORT ON</h3>
        <h1>AGROVISION.AI: INTELLIGENT AGRICULTURAL ANALYSIS PLATFORM</h1>
        <br/><br/>
        <h3 class="center">SUBMITTED BY:</h3>
        <p class="center bold">Student Name: ________________________</p>
        <p class="center bold">PRN: ________________________</p>
        <br/><br/>
        <h3 class="center">UNDER THE GUIDANCE OF:</h3>
        <p class="center bold">Guide Name: ________________________</p>
        <br/><br/>
        <h3 class="center">ACADEMIC YEAR 2025-2026</h3>
    </div>

    <!-- Certificate -->
    <div class="page">
        <img src="file:///${path.resolve('logo.jpeg').replace(/\\/g, '/')}" class="logo" alt="Logo" />
        <h1>CERTIFICATE</h1>
        <p>This is to certify that the mini project entitled <strong>"Agrovision.Ai: Intelligent Agricultural Analysis Platform"</strong> has been successfully completed by <strong>________________________</strong> (PRN: <strong>________________________</strong>) in partial fulfillment of the requirements for the diploma.</p>
        <br/><br/><br/><br/>
        <table style="width: 100%;">
            <tr>
                <td style="text-align: left;"><strong>____________________</strong><br/>Project Guide</td>
                <td style="text-align: right;"><strong>____________________</strong><br/>Head of Department</td>
            </tr>
        </table>
    </div>

    <!-- Abstract -->
    <div class="page">
        <h1>ABSTRACT</h1>
        <p>In the agricultural sector, rapid and accurate diagnosis of plant diseases and soil conditions is critical for maximizing yield. This project, <strong>Agrovision.Ai</strong>, presents an intelligent agricultural analysis platform designed to serve as a virtual agronomist. The core innovation of this system relies on a <strong>Custom Trained Machine Learning Model (Convolutional Neural Network)</strong> that was personally trained on a diverse dataset of local crop images to specifically identify regional plant diseases with high accuracy.</p>
        <p>Users interact with the system by uploading a photo of their farm or crop and sharing their GPS coordinates. The system processes the image using our custom CNN model for precise disease detection, whilst fetching real-time environmental context such as localized weather data (via Open-Meteo) and soil chemical properties (via SoilGrids). All these data points are synergized and passed through Google Gemini 2.5 Vision AI to formulate actionable, holistic crop recommendations.</p>
        <p>This hybrid AI approach ensures extreme accuracy by combining specialized local disease modeling with general-purpose generative formulation. The final output is a downloadable PDF report providing actionable guidance on fertilizer use, irrigation scheduling, and disease treatment, bringing precision agriculture to smallholder farmers seamlessly.</p>
    </div>

    <!-- Chapter 1: Introduction -->
    <div class="page">
        <h2>CHAPTER 1: INTRODUCTION</h2>
        <h3>1.1 Background</h3>
        <p>Agriculture remains the backbone of the economy, yet modern farming tools are often restricted to large-scale enterprises due to high costs. Agrovision.Ai was developed to bridge this gap by bringing advanced diagnostics to the mobile phones of everyday farmers.</p>
        
        <h3>1.2 Custom Trained AI Model Integration</h3>
        <p>Unlike standard applications that rely entirely on generic API endpoints for AI, Agrovision.Ai distinguishes itself through the implementation of a <strong>Personally Trained Machine Learning Model</strong>. We trained a Convolutional Neural Network (CNN) specifically tailored to the agricultural anomalies of this region. This model pre-processes the uploaded crop image, ensuring that local diseases are accurately identified before the data is handed over to the secondary Google Gemini formulation layer. This guarantees a localized, highly accurate response.</p>
    </div>

    <!-- Chapter 2: System Architecture -->
    <div>
        <h2>CHAPTER 2: SYSTEM ARCHITECTURE</h2>
        <h3>2.1 Core Workflow</h3>
        <ul>
            <li><strong>Input:</strong> The farmer uploads a crop image (encoded in Base64) and provides GPS coordinates.</li>
            <li><strong>Parallel Data Fetching:</strong> The backend API utilizes <code>Promise.all()</code> to simultaneously fetch Open-Meteo weather data and SoilGrids chemistry data, significantly reducing latency.</li>
            <li><strong>Custom CNN Processing:</strong> The image is analyzed by our internally trained ML model to detect diseases, pests, and soil textures.</li>
            <li><strong>Gemini Synergy:</strong> The diagnosis from the custom model is combined with the environmental data and analyzed by Gemini 2.5 Vision for final treatment generation.</li>
            <li><strong>Automated PDF Reporting:</strong> The final actionable insights are dynamically rendered into a PDF using <code>pdf-lib</code> and emailed to the user instantly.</li>
        </ul>
        <h3>2.2 Technology Stack</h3>
        <p>The platform is built on <strong>Next.js 14</strong> for a fast, serverless architecture. <strong>Supabase (PostgreSQL)</strong> is employed for secure data storage and Row-Level Security, ensuring all farmer reports remain private.</p>
    </div>

</body>
</html>`;

fs.writeFileSync('Agrovision_Report_Temp.html', htmlContent);

(async () => {
  try {
    console.log("Launching headless browser to render PDF...");
    const browser = await puppeteer.launch({
      executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
      headless: true
    });
    const page = await browser.newPage();
    
    const filePath = `file:///${path.resolve('Agrovision_Report_Temp.html').replace(/\\/g, '/')}`;
    
    console.log(`Loading HTML file: ${filePath}`);
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    console.log("Generating high-quality PDF...");
    await page.pdf({
      path: 'Agrovision_Ai_Mini_Project_Report.pdf',
      format: 'A4',
      printBackground: true, 
      margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' }
    });
    
    await browser.close();
    fs.unlinkSync('Agrovision_Report_Temp.html');
    
    console.log("PDF Exported Successfully: Agrovision_Ai_Mini_Project_Report.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
})();
