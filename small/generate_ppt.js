const PptxGenJS = require('pptxgenjs');
const path = require('path');

let pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';

// Define a Professional Corporate Theme
const theme = {
    bg: "FFFFFF", // Clean White
    primary: "0F4C81", // Classic Navy Blue
    secondary: "E2E8F0", // Soft Gray for backgrounds
    textMain: "1E293B", // Dark Gray/Black for readability
    textLight: "475569", // Medium Gray
    accent: "10B981" // Emerald Green for positive accents
};

// Define Master Slide for consistent look
pptx.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: theme.bg },
    objects: [
        // Top Header Bar
        { rect: { x: 0, y: 0, w: "100%", h: 0.6, fill: { color: theme.primary } } },
        // Bottom Footer Bar
        { rect: { x: 0, y: "94%", w: "100%", h: 0.4, fill: { color: theme.primary } } },
        // Footer Text
        { text: { text: "Agrovision.Ai - Mini Project Presentation", options: { x: 0.5, y: "94.5%", w: 5, h: 0.3, color: "FFFFFF", fontSize: 10, align: "left" } } },
        { text: { text: "2025-2026", options: { x: 7, y: "94.5%", w: 2.5, h: 0.3, color: "FFFFFF", fontSize: 10, align: "right" } } }
    ]
});

// Helper function to create standard slides
function addSlide(title, items) {
    let slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    
    // Title positioned well below the header
    slide.addText(title, {
        x: 0.5, y: 0.8, w: "90%", h: 0.8,
        fontSize: 32, bold: true, color: theme.primary,
        border: [ {pt: 0, color: "FFFFFF"}, {pt: 0, color: "FFFFFF"}, {pt: 2, color: theme.accent}, {pt: 0, color: "FFFFFF"} ]
    });

    // Items array mapping to text objects
    if (items && items.length > 0) {
        let textObj = items.map(bp => {
            // Check if it's a sub-bullet or main bullet
            if (bp.bold) {
                return {
                    text: bp.text,
                    options: { color: theme.primary, fontSize: 20, bold: true, breakLine: true, margin: 5 }
                };
            } else {
                return {
                    text: bp.text,
                    options: { color: theme.textMain, fontSize: 16, breakLine: true, margin: 10, bullet: true }
                };
            }
        });
        
        slide.addText(textObj, {
            x: 0.5, y: 1.8, w: "90%", h: "70%",
            align: "left", valign: "top", 
            lineSpacing: 25 // Adds breathing room between lines to prevent overlap
        });
    }
    return slide;
}

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.background = { color: theme.primary };
// Add a subtle shape decoration
slide1.addShape(pptx.ShapeType.rect, { x: 0, y: "60%", w: "100%", h: 0.5, fill: { color: theme.accent } });

slide1.addText("Agrovision.Ai", { x: "10%", y: "35%", w: "80%", h: 1.5, fontSize: 56, bold: true, color: "FFFFFF", align: "center" });
slide1.addText("Intelligent Agricultural Analysis & Crop Recommendation", { x: "10%", y: "48%", w: "80%", h: 1, fontSize: 22, color: theme.secondary, align: "center" });
slide1.addText("Mini Project Presentation", { x: "10%", y: "70%", w: "80%", h: 0.5, fontSize: 16, color: "FFFFFF", align: "center", italic: true });

// Slide 2: Problem Statement
addSlide("The Problem Statement", [
    { text: "Lack of Accessibility", bold: true },
    { text: "Smallholder farmers cannot afford expensive agricultural scientists or laboratory soil testing." },
    { text: "Delayed Diagnostics", bold: true },
    { text: "Waiting weeks for soil test results or expert advice leads to crop failure and disease spread." },
    { text: "Generic Advice", bold: true },
    { text: "Most existing farming apps provide generic advice that doesn't account for hyper-local soil or weather conditions." }
]);

// Slide 3: Proposed Solution
addSlide("Our Solution: Agrovision.Ai", [
    { text: "A 'Virtual Agronomist' right in the farmer's pocket.", bold: true },
    { text: "Zero-Typing Interface: Farmers simply upload a photo of their crop and share their GPS location." },
    { text: "Instant Data Gathering: Automatically fetches live weather and granular soil data based on GPS coordinates." },
    { text: "Advanced AI Diagnostics: Identifies diseases instantly using a custom-trained AI model combined with Google Gemini." },
    { text: "Actionable Reports: Generates a complete fertilizer, irrigation, and treatment plan in a printable PDF." }
]);

// Slide 4: System Architecture
addSlide("System Architecture & Workflow", [
    { text: "1. Data Input", bold: true },
    { text: "User provides an Image (Base64) + GPS Coordinates via the Web Application." },
    { text: "2. Parallel Fetching", bold: true },
    { text: "System uses Promise.all() to fetch Open-Meteo (Weather) and SoilGrids (Soil Chemistry) simultaneously." },
    { text: "3. Dual AI Processing", bold: true },
    { text: "Custom CNN model pre-processes the image for disease detection -> Passes data to Google Gemini Vision." },
    { text: "4. Output Generation", bold: true },
    { text: "JSON response is parsed -> PDF generated via pdf-lib -> Emailed securely via Nodemailer." }
]);

// Slide 5: Core Technologies
addSlide("Core Technology Stack", [
    { text: "Next.js 14 & React", bold: true },
    { text: "Provides a unified environment for lightning-fast frontend UI and serverless backend APIs." },
    { text: "Supabase (PostgreSQL)", bold: true },
    { text: "Handles secure user authentication, Row-Level Security (RLS), and highly structured relational data storage." },
    { text: "External Context APIs (Open-Meteo & SoilGrids)", bold: true },
    { text: "Bypasses the need for physical sensors by fetching highly accurate satellite and weather station data instantly." }
]);

// Slide 6: Custom Trained Machine Learning
addSlide("Custom Trained Machine Learning Model", [
    { text: "Why we built a custom model instead of just using ChatGPT?", bold: true },
    { text: "Dataset Collection: We gathered thousands of images of local crops and specific regional plant diseases." },
    { text: "CNN Architecture: Trained a specialized Convolutional Neural Network (CNN) using TensorFlow/PyTorch." },
    { text: "High Accuracy: Our custom model is specifically tuned for agricultural anomalies, providing higher accuracy than generic AI." },
    { text: "Hybrid Approach: The custom model detects the specific disease, while Gemini formulates the human-readable advice." }
]);

// Slide 7: Gemini Multimodal AI
addSlide("Google Gemini 2.5 Vision Integration", [
    { text: "Multimodal Analysis", bold: true },
    { text: "Gemini doesn't just read text; it 'sees' the image while reading the soil pH and weather data simultaneously." },
    { text: "Strict Prompt Engineering", bold: true },
    { text: "We enforce structured data by setting responseMimeType: 'application/json'. This prevents conversational errors." },
    { text: "Holistic Recommendations", bold: true },
    { text: "Combines our custom model's disease detection with real-time weather to recommend highly specific fertilizer schedules." }
]);

// Slide 8: Multilingual Voice Assistant
addSlide("Multilingual Voice Assistant", [
    { text: "Accessibility for Everyone", bold: true },
    { text: "Designed specifically for farmers who may struggle with reading long, complex text reports." },
    { text: "Native Web Speech API", bold: true },
    { text: "We utilize built-in browser technologies (SpeechRecognition & SpeechSynthesis) without paying for external APIs." },
    { text: "Regional Languages", bold: true },
    { text: "Supports interactive voice communication in English, Hindi, and Marathi for local farmers." }
]);

// Slide 9: Automated PDF Reporting
addSlide("Automated PDF Reporting", [
    { text: "Tangible Offline Value", bold: true },
    { text: "Farmers need records they can keep offline or print for government/bank loan applications." },
    { text: "Dynamic Generation", bold: true },
    { text: "We use server-side PDF generation tools (pdf-lib / puppeteer) to perfectly format the AI's JSON output into a beautiful document." },
    { text: "Instant Delivery", bold: true },
    { text: "Integrated Nodemailer SMTP dispatches the report directly to the farmer's inbox the second it is generated." }
]);

// Slide 10: Fault Tolerance & Performance
addSlide("Performance & Fault Tolerance", [
    { text: "Parallel Execution", bold: true },
    { text: "Using Promise.all() cuts API waiting times by a third. We fetch weather, soil, and location simultaneously." },
    { text: "Graceful Failures (try-catch)", bold: true },
    { text: "If the Weather API goes offline, our system catches the error. It sends 'Weather: Unknown' to the AI." },
    { text: "Resilience", bold: true },
    { text: "The app never crashes. The AI is instructed to provide the best possible advice even with missing data points." }
]);

// Slide 11: Real World Impact
addSlide("Real World Societal Impact", [
    { text: "Democratizing Science", bold: true },
    { text: "Brings precision agriculture technology—usually reserved for wealthy corporations—to smallholder farmers for free." },
    { text: "Resource Optimization", bold: true },
    { text: "Prevents over-fertilization (protecting the environment) and saves water by aligning irrigation with upcoming rain forecasts." },
    { text: "Yield Improvement", bold: true },
    { text: "Early and accurate disease detection prevents crop loss and increases profitability for the farmer." }
]);

// Slide 12: Q&A / Thank You
let slide12 = pptx.addSlide();
slide12.background = { color: theme.primary };
slide12.addShape(pptx.ShapeType.rect, { x: 0, y: "45%", w: "100%", h: 0.5, fill: { color: theme.accent } });
slide12.addText("Thank You!", { x: "10%", y: "25%", w: "80%", h: 1.5, fontSize: 64, bold: true, color: "FFFFFF", align: "center" });
slide12.addText("Any Questions?", { x: "10%", y: "55%", w: "80%", h: 1, fontSize: 32, color: theme.secondary, align: "center" });

// Save PPT
pptx.writeFile({ fileName: 'Agrovision_Ai_Presentation.pptx' })
    .then(fileName => {
        console.log('Successfully generated presentation: Agrovision_Ai_Presentation.pptx');
    })
    .catch(err => {
        console.error("Error generating PPT: ", err);
    });
