import React from 'react';
import Link from 'next/link';

const features = [
  {
    icon: '🌱',
    title: 'AI Crop Prediction',
    desc: 'Upload farm images and grant GPS access. AI automatically pulls SoilGrids soil data, Open-Meteo weather forecasts, and recommends the best crops for your land.',
    link: '/predict',
  },
  {
    icon: '🔬',
    title: 'Leaf Disease Scanner',
    desc: 'Photograph any diseased crop leaf. Gemini Vision AI identifies rusts, blights, fungal spots, and nutrient deficiencies within seconds.',
    link: '/disease',
  },
  {
    icon: '🎙️',
    title: 'Voice AI Advisor',
    desc: 'Speak directly to your farm advisor in English, Hindi, or Marathi. Get personalized agronomy advice with multilingual voice input and output.',
    link: '/advisor',
  },
];

const steps = [
  { num: '01', title: 'Upload Farm Photos', desc: 'Upload images of your farm, soil, or crops (JPG, PNG, WEBP).' },
  { num: '02', title: 'Allow Location Access', desc: 'Grant GPS access — coordinates fetch real-time weather & soil data.' },
  { num: '03', title: 'AI Analyzes Everything', desc: 'Gemini Vision + SoilGrids + Open-Meteo compile a full agronomic report.' },
  { num: '04', title: 'Get Your Farm Report', desc: 'Receive crop recommendations, fertilizer plan & downloadable PDF.' },
];

const apis = [
  { name: 'Open-Meteo', detail: 'Live weather forecasts', emoji: '🌤️' },
  { name: 'ISRIC SoilGrids', detail: 'Global soil chemistry', emoji: '🪨' },
  { name: 'OSM Nominatim', detail: 'Reverse geocoding', emoji: '📍' },
  { name: 'Gemini Vision AI', detail: 'Image understanding', emoji: '✨' },
];

export default function LandingPage() {
  return (
    <div>
      {/* ══ HERO ══ */}
      <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', padding: '20px 16px', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="sk-card" style={{ padding: '8px 16px', display: 'inline-flex', width: 'fit-content', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold' }}>
            🌾 Precision Agriculture Platform — Powered by Gemini AI
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', margin: 0, lineHeight: 1.1 }}>
            Smart Farming <br />
            <span style={{ color: 'var(--primary)' }}>Intelligence</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '520px', lineHeight: 1.6, margin: 0 }}>
            Upload farm photographs, allow GPS access, and let AgroMind AI automatically analyze soil, weather, and crop conditions — <strong>no manual data entry required.</strong>
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Link href="/predict" className="sk-button-primary sk-button" style={{ textDecoration: 'none', padding: '16px 32px', fontSize: '16px' }}>
              🌱 Analyze My Farm
            </Link>
            <Link href="/register" className="sk-button" style={{ textDecoration: 'none', padding: '16px 32px', fontSize: '16px' }}>
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div style={{ flex: '1 1 280px', display: 'flex', justifyContent: 'center' }}>
          <div className="sk-card anim-pop" style={{ width: '100%', maxWidth: '480px', position: 'relative', background: 'var(--grad-convex)' }}>
            <div className="anim-float" style={{ fontSize: '4rem', marginBottom: '16px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>🌾</div>
            <div style={{ fontSize: '12px', color: 'var(--primary-dark)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px' }}>
              Latest AI Analysis
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>Rice — 94.2% Match</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Kharif Season · Maharashtra</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[['Farm Health', '87%'], ['Soil Health', '79%'], ['Confidence', '94%'], ['Yield Est.', '2.8 T/ac']].map(([k, v]) => (
                <div key={k} className="sk-card" style={{ padding: '16px', boxShadow: 'var(--shadow-in)', background: 'transparent' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '4px' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Floating chips */}
            <div className="sk-card" style={{ position: 'absolute', top: '-20px', right: '-20px', padding: '12px 20px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-dark)', borderRadius: '30px' }}>
              ✅ SoilGrids Auto-fetched
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding: '80px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2>Zero Manual Data Entry</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>All soil, weather, and location parameters are fetched automatically from trusted scientific APIs.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {steps.map((step) => (
            <div key={step.num} className="sk-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '40px', fontWeight: 900, color: 'var(--primary-light)', opacity: 0.5 }}>{step.num}</div>
              <h3>{step.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding: '60px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2>Everything a Modern Farmer Needs</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>From real-time soil analysis to multilingual voice advice — all in one platform.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {features.map((f) => (
            <div key={f.title} className="sk-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="anim-float" style={{ fontSize: '48px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              <Link href={f.link} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>
                Try it now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '80px 16px', textAlign: 'center' }}>
        <div className="sk-card" style={{ background: 'var(--grad-primary)', color: 'white', padding: '60px 24px', borderRadius: '30px', boxShadow: 'var(--shadow-heavy)' }}>
          <h2 style={{ color: 'white', marginBottom: '16px' }}>Start Optimizing Your Farm Today</h2>
          <p style={{ maxWidth: '520px', margin: '0 auto 32px', opacity: 0.9 }}>
            No hardware, no manual data entry — just your phone. GPS + photos → instant agronomic recommendations.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="sk-button" style={{ textDecoration: 'none' }}>
              Create Free Account
            </Link>
            <Link href="/predict" className="sk-button" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              Analyze Farm Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
