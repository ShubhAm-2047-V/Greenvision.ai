const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    console.log("Launching headless browser to render PDF...");
    const browser = await puppeteer.launch({
      executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
      headless: true
    });
    const page = await browser.newPage();
    
    // Resolve absolute path for Windows
    const filePath = `file:///${path.resolve('Explanation_Standalone.html').replace(/\\/g, '/')}`;
    
    console.log(`Loading HTML file: ${filePath}`);
    // Wait until networkidle0
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    console.log("Generating high-quality PDF...");
    await page.pdf({
      path: 'Agrovision_Explanation_Guide.pdf',
      format: 'A4',
      printBackground: true, // Crucial to keep the Warm White theme colors
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    
    await browser.close();
    console.log("PDF Exported Successfully: Agrovision_Explanation_Guide.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
})();
