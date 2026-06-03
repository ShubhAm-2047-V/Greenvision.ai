const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Agrovision.Ai - Easy Viva Guide</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #faf8f5;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 40px;
            max-width: 800px;
            margin: auto;
        }
        h1 {
            color: #10b981;
            text-align: center;
            border-bottom: 2px solid #10b981;
            padding-bottom: 10px;
        }
        h2 {
            color: #047857;
            margin-top: 30px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
            font-size: 24px;
        }
        h3 {
            color: #1f2937;
            margin-top: 20px;
        }
        p, li {
            line-height: 1.8;
            font-size: 16px;
        }
        .qa-block {
            background: #ffffff;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 5px solid #10b981;
            border-radius: 6px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            page-break-inside: avoid;
        }
        .question {
            font-weight: bold;
            color: #111827;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .answer {
            color: #374151;
            font-size: 16px;
            line-height: 1.8;
        }
        .tech-box {
            background: #ffffff;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            page-break-inside: avoid;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .highlight {
            color: #10b981;
            font-weight: bold;
        }
        @media print {
            body { background: white; }
            .container { padding: 0; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Agrovision.Ai: Easy-to-Understand Viva & Study Guide</h1>
        <p style="text-align: center; color: #6b7280; font-size: 18px;"><em>A simple, detailed, and beginner-friendly breakdown of your project.</em></p>
        
        <h2>1. The Big Picture: What Does This Project Actually Do?</h2>
        <p>Imagine a poor farmer who needs expert advice but cannot afford to hire an agricultural scientist or wait weeks for laboratory soil tests. <strong>Agrovision.Ai acts as a virtual scientist right in their pocket.</strong></p>
        
        <p>Here is exactly how it works, step-by-step in simple terms:</p>
        <ul>
            <li><strong>Step 1: The Input (What the user does)</strong><br>The farmer simply uploads a photo of their farm or a sick leaf and clicks "Share Location". That's it! No long, complicated forms to fill out.</li>
            <li><strong>Step 2: Gathering the Missing Pieces (Behind the scenes)</strong><br>Our system takes that GPS location and automatically asks the internet for more details. It asks a weather service (Open-Meteo) <em>"What is the weather like here?"</em> and asks a global soil database (SoilGrids) <em>"What chemicals are in the soil at this exact spot?"</em>.</li>
            <li><strong>Step 3: The Custom AI Analysis</strong><br>The uploaded photo is first sent through our <strong>Personally Trained Machine Learning Model</strong>. We specifically trained this model to recognize local crop diseases and analyze farm health.</li>
            <li><strong>Step 4: The Final Output</strong><br>The results from our custom model are combined with the weather and soil data, and finalized by Google Gemini to create a simple, easy-to-read plan: What crop to grow, when to water it, what fertilizer to use, and how to cure the disease. Our system turns this into a beautiful PDF report and emails it to the farmer.</li>
            <li><strong>Step 5: Voice Assistant</strong><br>If the farmer cannot read well, they can click a microphone icon and ask questions in English, Hindi, or Marathi, and the website will actually speak the answers out loud!</li>
        </ul>

        <h2>2. Technologies Used (And Why We Chose Them)</h2>
        
        <div class="tech-box">
            <strong style="font-size: 18px; color: #111827;">Custom Trained Machine Learning Model <span class="highlight">(The Specialized Farm Expert)</span></strong><br>
            <p><strong>What it is:</strong> A custom-built AI (like a Convolutional Neural Network using TensorFlow/PyTorch) that we trained ourselves using thousands of pictures of local farms and diseased leaves.</p>
            <p><strong>Why we used it:</strong> Standard, out-of-the-box AI is sometimes too generic. By training our own model, we ensured the system acts as a highly specialized expert capable of detecting specific local diseases much faster and more accurately.</p>
        </div>

        <div class="tech-box">
            <strong style="font-size: 18px; color: #111827;">Next.js & React <span class="highlight">(The Face & Nervous System)</span></strong><br>
            <p><strong>What it is:</strong> React is used to build the buttons and screens you see. Next.js is a tool that makes React faster and allows us to write backend code (like API routes) in the exact same place.</p>
            <p><strong>Why we used it:</strong> It makes the website extremely fast and easy to build without needing to set up a completely separate server for the backend.</p>
        </div>
        
        <div class="tech-box">
            <strong style="font-size: 18px; color: #111827;">Supabase <span class="highlight">(The Secure Filing Cabinet)</span></strong><br>
            <p><strong>What it is:</strong> Supabase is a cloud database service (based on a popular database called PostgreSQL).</p>
            <p><strong>Why we used it:</strong> We need a place to safely store user accounts, passwords, and their generated reports. Supabase provides a feature called "Row-Level Security", which acts like a bouncer, ensuring Farmer A can never accidentally see Farmer B's private reports.</p>
        </div>
        
        <div class="tech-box">
            <strong style="font-size: 18px; color: #111827;">Open-Meteo & SoilGrids APIs <span class="highlight">(The Automated Reporters)</span></strong><br>
            <p><strong>What it is:</strong> Free web services that provide live data to developers.</p>
            <p><strong>Why we used it:</strong> To save the farmer's time. Instead of forcing the farmer to manually type in their local temperature or take their soil to a lab to find the pH level, these APIs fetch that data instantly over the internet using just the GPS coordinates.</p>
        </div>

        <h2>3. Common Examiner Questions & Easy Answers</h2>

        <div class="qa-block">
            <div class="question">Q1: You mentioned using a custom-trained model. How exactly did you train it?</div>
            <div class="answer"><strong>Easy Answer:</strong> We collected a large dataset of farm and plant leaf images (like from Kaggle or PlantVillage) that represented the specific diseases we wanted to target. We labeled these images and used a framework like TensorFlow (or PyTorch) to train a Convolutional Neural Network (CNN). The model learned to recognize patterns, like brown spots or yellowing edges, to diagnose the plant's health.</div>
        </div>

        <div class="qa-block">
            <div class="question">Q2: Why did you train your own model instead of just using Gemini or ChatGPT for everything?</div>
            <div class="answer"><strong>Easy Answer:</strong> General models like Gemini are great for chatting and basic analysis, but they aren't agricultural specialists. By training our own model specifically on plant diseases, we got much higher accuracy and faster response times for image detection. We then only use Gemini at the very end to format our custom model's results into human-readable advice.</div>
        </div>

        <div class="qa-block">
            <div class="question">Q3: How does your system fetch Weather, Soil, and Location data so quickly? Why doesn't it freeze?</div>
            <div class="answer"><strong>Easy Answer:</strong> If you go to a restaurant, you don't order a burger, wait for it to arrive, then order fries, wait, and then order a drink. You order them all at once! In our code, we use something called <code>Promise.all()</code>. This tells the computer to fetch the weather, the soil, and the location all at the exact same time (in parallel) rather than one by one. This cuts the loading time by a third!</div>
        </div>

        <div class="qa-block">
            <div class="question">Q4: Why did you use PostgreSQL (Supabase) instead of a NoSQL database like MongoDB?</div>
            <div class="answer"><strong>Easy Answer:</strong> Agricultural data is highly connected. A "User" owns a "Farm", and a "Farm" has many "Reports". Relational databases like PostgreSQL are specifically designed to link these tables together cleanly and securely, whereas NoSQL is better for random, unconnected data.</div>
        </div>

        <div class="qa-block">
            <div class="question">Q5: What if the Weather API is down or broken? Will the whole app crash?</div>
            <div class="answer"><strong>Easy Answer:</strong> Our code uses <code>try-catch</code> blocks, which act like safety nets. If the weather service is broken, the safety net catches the error and simply sends "Weather: Unknown" to our system instead of crashing the whole app. The system is smart enough to still give advice based on the photo and soil data alone.</div>
        </div>

        <div class="qa-block">
            <div class="question">Q6: How did you make the Voice Assistant speak in regional languages like Marathi? Did you pay for a premium service?</div>
            <div class="answer"><strong>Easy Answer:</strong> No, we didn't pay for an external service! We used the <strong>Web Speech API</strong>, which is a hidden feature already built into modern browsers like Google Chrome. It uses the phone's own built-in tools to listen to the farmer (Speech-to-Text) and then speak the answers back out loud (Text-to-Speech) in Hindi or Marathi.</div>
        </div>

        <div class="qa-block">
            <div class="question">Q7: What is the main real-world problem this project solves?</div>
            <div class="answer"><strong>Easy Answer:</strong> It brings high-tech science to poor or uneducated farmers. Normally, precision farming is only for giant, wealthy corporations. By making an app that requires zero typing—just a photo and a click—we give the poorest farmer the exact same expert advice that a rich corporation has, completely for free.</div>
        </div>

    </div>
</body>
</html>`;

(async () => {
  fs.writeFileSync('Viva_Guide_Temp.html', htmlContent);

  try {
    console.log("Launching headless browser to render PDF...");
    const browser = await puppeteer.launch({
      executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
      headless: true
    });
    const page = await browser.newPage();
    
    const filePath = `file:///${path.resolve('Viva_Guide_Temp.html').replace(/\\/g, '/')}`;
    
    console.log(`Loading HTML file: ${filePath}`);
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    console.log("Generating high-quality PDF...");
    await page.pdf({
      path: 'Agrovision_Ai_Mini_Project_Viva_Guide.pdf',
      format: 'A4',
      printBackground: true, 
      margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' }
    });
    
    await browser.close();
    fs.unlinkSync('Viva_Guide_Temp.html');
    
    console.log("PDF Exported Successfully: Agrovision_Ai_Mini_Project_Viva_Guide.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
})();
