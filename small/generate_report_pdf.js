const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    console.log("Launching headless browser to render PDF...");
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: true
    });
    const page = await browser.newPage();
    
    // Resolve absolute path for Windows
    const filePath = `file:///${path.resolve('Agrovision_Report.html').replace(/\\/g, '/')}`;
    
    console.log(`Loading HTML file: ${filePath}`);
    // Wait until networkidle0
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    console.log("Generating high-quality PDF...");
    await page.pdf({
      path: 'Agrovision_Mini_Project_Report.pdf',
      format: 'A4',
      printBackground: true, 
      margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' }
    });
    
    await browser.close();
    console.log("PDF Exported Successfully: Agrovision_Mini_Project_Report.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
})();
