# Agrovision AI - Precision Agriculture Intelligence Platform

Agrovision AI is a production-ready, AI-powered smart agriculture platform designed to support farmers with real-time agronomic insights. By uploading a single farm image, the system automatically fetches geographic metadata, weather forecasts, and soil properties to compile personalized crop suitability rankings, fertilizer schedules, watering charts, and leaf disease diagnostic reports.

The system is entirely API-driven and powered by **Google Gemini 2.5 Pro**, **Gemini Vision**, **Open-Meteo**, **OpenStreetMap Nominatim**, and **SoilGrids (ISRIC)**.

---

## Technical Stack

* **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, Chart.js.
* **Backend**: Node.js, Express.js.
* **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row-Level Security (RLS).
* **Storage**: Supabase Storage Buckets.
* **AI Models**: Gemini 2.5 Pro (planning, chatbot, PDF compilation) & Gemini Vision (soil card OCR, farm analysis, leaf pathology).
* **APIs**: SoilGrids REST API, Open-Meteo API (requires no keys), OpenStreetMap Nominatim API (requires no keys).

---

## Directory Architecture

```text
Agrovision AI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js       # Supabase Node Client
│   │   ├── controllers/
│   │   │   ├── chatController.js # Gemini chatbot controller (English, Hindi, Marathi)
│   │   │   ├── diseaseController.js # Gemini Vision leaf diagnostic controller
│   │   │   ├── predictController.js # SoilGrids, weather, geocoding & crop matching controller
│   │   │   └── reportController.js  # Node PDFkit dynamic report compiler
│   │   ├── routes/
│   │   │   ├── chat.js
│   │   │   ├── disease.js
│   │   │   ├── predict.js
│   │   │   └── report.js
│   │   └── app.js                # Express Application Router & Middleware
│   ├── package.json              # Node backend configurations
│   └── .env.example              # Backend environment schema
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router Pages
│   │   │   ├── layout.js
│   │   │   ├── page.js           # Landing page
│   │   │   ├── login/page.js     # Auth Sign In
│   │   │   ├── register/page.js  # Auth Sign Up
│   │   │   ├── dashboard/page.js # Farmer Analytics panel
│   │   │   ├── predict/page.js   # Farm analysis stepper wizard
│   │   │   ├── disease/page.js   # Leaf scanner & diagnostic remedies
│   │   │   └── advisor/page.js   # Voice Chatbot (Speech Recognition & Speech Synthesis)
│   │   ├── components/           # Navbar, BottomNav (mobile navigation), Icon definitions
│   │   ├── context/              # AuthContext (Supabase) & TranslationContext (Locale Dictionary)
│   │   └── services/             # Axios API client integrations
│   ├── package.json              # Next.js package configurations
│   └── tailwind.config.js        # Design styling configs
├── database/
│   └── supabase_schema.sql       # SQL script containing tables, triggers & RLS
├── run.bat                       # Startup script booting backend and frontend simultaneously
└── README.md
```

---

## Local Setup & Installation

### Prerequisite: Supabase Database Setup

1. Create a free project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and execute the contents of [database/supabase_schema.sql](file:///e:/Agrovision%20AI/database/supabase_schema.sql). This will create all necessary tables, triggers, and Row-Level Security (RLS) policies.
3. In the **Storage** dashboard, create the following three public buckets:
   * `farm-images`
   * `leaf-images`
   * `farm-reports`
   Ensure you adjust the bucket access settings to **Public**.

---

### Step 1: Backend Configuration

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Set the variables:
   ```env
    PORT=5000
    SUPABASE_URL=https://your-project-id.supabase.co
    SUPABASE_ANON_KEY=your-supabase-anon-key
    GEMINI_API_KEY=your-google-gemini-key
   ```

---

### Step 2: Frontend Configuration

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

### Step 3: Run the Application

Return to the project root directory and run:
```bash
run.bat
```
This batch script automatically launches the Express API server (localhost:5000), the Next.js development server (localhost:3000), and opens the dashboard in your default browser.

---

## AI Voice Advisor Usage

The **AI Advisor** page features native Speech Recognition (Speech-to-Text) and Speech Synthesis (Text-to-Speech).
* **Languages Supported**: English, Hindi, and Marathi.
* **Recording**: Click the mic icon, grant mic access, and speak. An active waveform overlays the screen while listening.
* **Vocalization**: The AI response is read aloud in the native locale using your browser's matching speech engine. Turn voice output off or stop speech at any time using the header audio toggles.
