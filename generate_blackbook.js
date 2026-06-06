const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const mdPath = 'C:\\\\Users\\\\SHUBHAM\\\\.gemini\\\\antigravity-ide\\\\brain\\\\05890d92-be88-45e1-ab2d-932418e0d5e9\\\\Agrovision_Black_Book.md';
    let mdContent = fs.readFileSync(mdPath, 'utf8');
    
    // Inject the logo before 'A PROJECT REPORT'
    const logoHtml = '<div style="text-align: center; margin-bottom: 20px;">\\n    <img src="file:///E:/Agrovision%20AI/small/logo.jpeg" alt="College Logo" style="width: 150px; height: auto; margin: 0 auto; display: block;">\\n</div>\\n\\n';
    mdContent = mdContent.replace('## A PROJECT REPORT', logoHtml + '## A PROJECT REPORT');
    mdContent = mdContent.replace('# CERTIFICATE', logoHtml + '# CERTIFICATE');
    
    // Read the template HTML
    const templateHtml = fs.readFileSync('BlackBook_Viewer.html', 'utf8');
    
    // Escape the markdown content for template literal
    const escapedMdContent = mdContent.replace(/\\/g, '\\\\\\\\').replace(/`/g, '\\\\`').replace(/\\$/g, '\\\\$');
    
    // Replace the fetch logic with direct injection
    let injectedHtml = templateHtml.replace(
      'loadMarkdown();', 
      `render(\`${escapedMdContent}\`);`
    );
    // Remove the fetch implementation to keep it clean
    injectedHtml = injectedHtml.replace(/async function loadMarkdown\(\)[\\s\\S]*?function render/m, 'function render');
    
    fs.writeFileSync('Temp_BlackBook.html', injectedHtml);

    console.log("Launching headless browser to render PDF...");
    const browser = await puppeteer.launch({
      executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
      headless: true
    });
    const page = await browser.newPage();
    
    const filePath = `file:///${path.resolve('Temp_BlackBook.html').replace(/\\/g, '/')}`;
    
    console.log(`Loading HTML file: ${filePath}`);
    // Increase timeout and wait for networkidle0
    await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Wait for mermaid to render
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Generating high-quality PDF...");
    await page.pdf({
      path: 'Agrovision_Black_Book.pdf',
      format: 'A4',
      printBackground: true, 
      margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' }
    });
    
    await browser.close();
    fs.unlinkSync('Temp_BlackBook.html');
    
    console.log("PDF Exported Successfully: Agrovision_Black_Book.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
})();
