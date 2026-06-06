'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function PresentationSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "AGROMIND AI",
      subtitle: "Intelligent Agricultural Analysis & Crop Recommendation Platform",
      content: ["Presented By: Shubham", "Diploma in Computer Science Final Year Project"],
      center: true
    },
    {
      title: "1. The Problem Statement",
      content: [
        "Traditional farming relies on generational guesswork rather than empirical data.",
        "Consulting expert agronomists and utilizing soil laboratories is slow and expensive.",
        "Farmers lack real-time, localized insights into critical soil chemistry (Nitrogen, pH).",
        "Crop diseases spread rapidly before they are accurately diagnosed, leading to massive yield losses."
      ]
    },
    {
      title: "2. The Solution: Agrovision AI",
      content: [
        "A cloud-based, multimodal AI platform acting as a hyper-intelligent virtual agronomist.",
        "Requires zero manual data entry: farmers only need a smartphone camera and GPS location.",
        "Generates exhaustive crop, soil, and financial analysis in under 30 seconds.",
        "Democratizes precision agriculture, empowering smallholder farmers globally."
      ]
    },
    {
      title: "3. Core Platform Features",
      content: [
        "Multimodal Visual Analysis: AI interprets crop health and soil dryness directly from images.",
        "Contextual Aggregation: Automatically pulls live weather and subterranean soil baselines.",
        "Financial Forecasting: Dynamically calculates expected crop yields and profit margins.",
        "Automated Reporting: Custom engine dynamically generates paginated, styled PDF reports.",
        "Instant Email Delivery: Dispatches the final reports directly to the user offline."
      ]
    },
    {
      title: "4. Modern Technology Stack",
      content: [
        "Frontend: Built on Next.js 14 and React 18 for high performance.",
        "Styling: Tailwind CSS ensures a responsive, mobile-first design for on-field usage.",
        "Backend: Next.js Serverless API Routes and Edge Functions for massive scalability.",
        "Database & Auth: Supabase (PostgreSQL) handles secure data persistence.",
        "Utilities: pdf-lib (PDF generation) and NodeMailer (SMTP Email dispatch)."
      ]
    },
    {
      title: "5. Third-Party API Integrations",
      content: [
        "Google Gemini 2.5 Flash: The core generative vision-language AI model.",
        "Nominatim (OpenStreetMap): Reverse geocoding to translate GPS into village/district.",
        "Open-Meteo: Fetches real-time meteorological forecasting and 7-day rainfall averages.",
        "ISRIC SoilGrids: High-resolution spatial REST API for extracting Soil pH and Nitrogen levels."
      ]
    },
    {
      title: "6. System Architecture & Workflow",
      content: [
        "User uploads a farm image and grants browser GPS permissions.",
        "Next.js parallelizes requests to Nominatim, Open-Meteo, and SoilGrids.",
        "Aggregated context + image is injected into a strict prompt and sent to Gemini 2.5 Flash.",
        "AI returns a structured JSON recommendation matrix containing health scores and plans.",
        "Data is securely persisted into the Supabase database.",
        "PDF is dynamically rendered in memory and instantly emailed to the user."
      ]
    },
    {
      title: "7. The Intelligence Engine",
      content: [
        "Utilizes Multimodal processing, synthesizing visual pixels with textual API context.",
        "System Prompt explicitly forces the AI into an 'Expert Agronomist' persona.",
        "Cross-references visual leaf anomalies against localized weather history to diagnose blight.",
        "Generates highly structured, predictable JSON outputs to feed the frontend UI.",
        "Rigid grounding in API data severely reduces AI hallucination risk."
      ]
    },
    {
      title: "8. Key Engineering Achievements",
      content: [
        "Vercel Edge Compatibility: Overcame strict filesystem limits by rendering PDFs in-memory.",
        "Timeout Mitigation: Engineered the Next.js routes to robustly handle heavy 60s AI payloads.",
        "Custom Pagination Engine: Built a proprietary text-wrapping algorithm for dynamic PDF text.",
        "Frictionless UX: Designed a highly intuitive interface accessible to non-technical users."
      ]
    },
    {
      title: "9. Conclusion & Future Scope",
      content: [
        "Conclusion: Agrovision AI successfully proves that high-end agricultural intelligence can be accessible.",
        "Future Scope 1: Integration with physical IoT soil moisture sensors for live telemetry.",
        "Future Scope 2: Multilingual voice-to-text interface (Hindi, Marathi) for rural accessibility.",
        "Future Scope 3: Satellite imagery (NDVI) integration for macro-scale farm analysis."
      ]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const slide = slides[currentSlide];

  return (
    <div style={{ backgroundColor: '#faf8f5', color: '#1f2937', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Accent Bar */}
      <div style={{ height: '8px', backgroundColor: '#10b981', width: '100%' }}></div>

      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
          ← Back to Website
        </Link>
        <span style={{ color: '#4b5563', fontSize: '14px' }}>Agrovision AI Project Presentation</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          style={{ position: 'absolute', left: '20px', zIndex: 10, background: currentSlide === 0 ? '#e5e7eb' : '#10b981', color: currentSlide === 0 ? '#9ca3af' : 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'background 0.3s' }}
        >
          ←
        </button>

        <button 
          onClick={nextSlide} 
          disabled={currentSlide === slides.length - 1}
          style={{ position: 'absolute', right: '20px', zIndex: 10, background: currentSlide === slides.length - 1 ? '#e5e7eb' : '#10b981', color: currentSlide === slides.length - 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'background 0.3s' }}
        >
          →
        </button>

        {/* Slide Content */}
        <div style={{ width: '100%', maxWidth: '900px', padding: '40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: slide.center ? 'center' : 'left', transition: 'opacity 0.5s ease-in-out', animation: 'fadeIn 0.5s' }}>
          
          <h1 style={{ color: '#10b981', fontSize: slide.center ? '4rem' : '3rem', marginBottom: '10px', fontWeight: 'bold' }}>
            {slide.title}
          </h1>
          
          {slide.subtitle && (
            <h2 style={{ color: '#4b5563', fontSize: '1.8rem', marginBottom: '30px', fontWeight: 'normal' }}>
              {slide.subtitle}
            </h2>
          )}

          <ul style={{ listStyleType: slide.center ? 'none' : 'disc', paddingLeft: slide.center ? '0' : '40px', marginTop: '30px' }}>
            {slide.content.map((item, index) => (
              <li key={index} style={{ fontSize: '1.5rem', marginBottom: '20px', color: slide.center ? '#9ca3af' : '#1f2937', fontStyle: slide.center ? 'italic' : 'normal', lineHeight: '1.6' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Progress */}
      <div style={{ padding: '20px', textAlign: 'center', color: '#4b5563', fontSize: '16px', fontWeight: 'bold' }}>
        Slide {currentSlide + 1} of {slides.length}
      </div>
    </div>
  );
}
