import React from 'react';
import Link from 'next/link';

const features = [
  {
    icon: '🌱',
    title: 'AI Crop Prediction',
    desc: 'Upload farm images and grant GPS access. AI automatically pulls SoilGrids soil data, Open-Meteo weather forecasts, and recommends the best crops for your land.',
    link: '/predict',
    color: '#059669',
    bg: '#dcfce7',
  },
  {
    icon: '🔬',
    title: 'Leaf Disease Scanner',
    desc: 'Photograph any diseased crop leaf. Gemini Vision AI identifies rusts, blights, fungal spots, and nutrient deficiencies within seconds.',
    link: '/disease',
    color: '#0284c7',
    bg: '#e0f2fe',
  },
  {
    icon: '🎙️',
    title: 'Voice AI Advisor',
    desc: 'Speak directly to your farm advisor in English, Hindi, or Marathi. Get personalized agronomy advice with multilingual voice input and output.',
    link: '/advisor',
    color: '#7c3aed',
    bg: '#ede9fe',
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
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ══ HERO ══ */}
      <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', paddingTop: '3rem', paddingBottom: '3rem', gap: '4rem', flexWrap: 'wrap' }}>

        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#dcfce7', border: '1px solid #bbf7d0',
            color: '#15803d', padding: '0.5rem 1rem', borderRadius: '999px',
            fontSize: '0.8rem', fontWeight: 600, width: 'fit-content'
          }}>
            🌾 Precision Agriculture Platform — Powered by Gemini AI
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.08, color: '#0f172a', margin: 0 }}>
            Smart Farming{' '}
            <span style={{ color: '#059669' }}>Intelligence</span>
            <br />Platform
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '520px', lineHeight: 1.7, margin: 0 }}>
            Upload farm photographs, allow GPS access, and let Agrovision AI automatically analyze soil, weather, and crop conditions — <strong style={{ color: '#059669' }}>no manual data entry required.</strong>
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <Link href="/predict" style={{
              background: '#059669', color: '#fff', fontWeight: 700,
              padding: '1rem 2rem', borderRadius: '12px', textDecoration: 'none',
              fontSize: '0.95rem', boxShadow: '0 4px 24px rgba(5,150,105,0.3)',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}>
              🌱 Analyze My Farm
            </Link>
            <Link href="/register" style={{
              border: '1.5px solid #cbd5e1', color: '#374151', fontWeight: 600,
              padding: '1rem 2rem', borderRadius: '12px', textDecoration: 'none',
              fontSize: '0.95rem', background: '#fff'
            }}>
              Create Free Account
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            {[['97%', 'AI Accuracy'], ['3', 'Languages'], ['5+', 'Data APIs'], ['100%', 'Automated']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669' }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual Card */}
        <div style={{ flex: '1 1 340px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
            <div style={{
              background: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)',
              borderRadius: '24px', padding: '3rem 2.5rem', color: '#fff',
              boxShadow: '0 24px 60px rgba(5,150,105,0.3)', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌾</div>
              <div style={{ fontSize: '0.7rem', color: '#a7f3d0', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Latest AI Analysis
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.25rem' }}>Rice — 94.2% Match</div>
              <div style={{ fontSize: '0.85rem', color: '#d1fae5', marginBottom: '1.5rem' }}>Kharif Season · Maharashtra</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['Farm Health', '87%', '#34d399'], ['Soil Health', '79%', '#6ee7b7'], ['Confidence', '94%', '#a7f3d0'], ['Yield Est.', '2.8 T/ac', '#fff']].map(([k, v, c]) => (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#a7f3d0', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c, marginTop: '0.2rem' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating chips */}
            <div style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#fff', borderRadius: '12px', padding: '0.6rem 0.9rem', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '0.7rem', fontWeight: 700, color: '#059669', border: '1px solid #dcfce7' }}>
              ✅ SoilGrids Auto-fetched
            </div>
            <div style={{ position: 'absolute', bottom: '-12px', left: '-12px', background: '#fff', borderRadius: '12px', padding: '0.6rem 0.9rem', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', border: '1px solid #e0f2fe' }}>
              📍 GPS Auto-detected
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding: '5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
            Simple 4-Step Process
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem' }}>Zero Manual Data Entry</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>All soil, weather, and location parameters are fetched automatically from trusted scientific APIs.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {steps.map((step) => (
            <div key={step.num} style={{
              background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: '20px',
              padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#dcfce7', fontFamily: 'monospace', marginBottom: '1rem' }}>{step.num}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
            Core AI Modules
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem' }}>Everything a Modern Farmer Needs</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>From real-time soil analysis to multilingual voice advice — all in one platform.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: '#fff', border: `1.5px solid ${f.color}25`,
              borderRadius: '24px', padding: '2rem',
              boxShadow: '0 2px 20px rgba(0,0,0,0.05)'
            }}>
              <div style={{ width: '52px', height: '52px', background: f.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.7, margin: '0 0 1.25rem' }}>{f.desc}</p>
              <Link href={f.link} style={{ fontSize: '0.8rem', fontWeight: 700, color: f.color, textDecoration: 'none' }}>
                Try it now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══ DATA SOURCES ══ */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{
          background: '#f8fafc', border: '1.5px solid #e2e8f0',
          borderRadius: '24px', padding: '3rem', textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
            Powered by Trusted Data Sources
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 2rem' }}>
            Real-time data from globally-recognized scientific APIs — no guesswork, no manual entry.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {apis.map((api) => (
              <div key={api.name} style={{
                background: '#fff', border: '1.5px solid #f1f5f9',
                borderRadius: '16px', padding: '1.25rem', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{api.emoji}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{api.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>{api.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '4rem 0 6rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
          borderRadius: '28px', padding: '4rem 3rem', textAlign: 'center', color: '#fff',
          boxShadow: '0 20px 60px rgba(5,150,105,0.25)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '999px', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
            🌾 FREE TO START
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.2 }}>
            Start Optimizing Your Farm with AI Today
          </h2>
          <p style={{ color: '#a7f3d0', maxWidth: '520px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.7 }}>
            No hardware, no manual data entry — just your phone. GPS + photos → instant agronomic recommendations.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: '#fff', color: '#059669', fontWeight: 800,
              padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none',
              fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}>
              Create Free Account
            </Link>
            <Link href="/predict" style={{
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#fff', fontWeight: 700,
              padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none', fontSize: '0.95rem'
            }}>
              Analyze Farm Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
