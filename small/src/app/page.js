'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../context/TranslationContext';

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🌱',
      title: t('landing_feat1_title'),
      desc: t('landing_feat1_desc'),
      link: '/predict',
    },
    {
      icon: '🎙️',
      title: t('landing_feat3_title'),
      desc: t('landing_feat3_desc'),
      link: '/advisor',
    },
  ];

  const steps = [
    { num: '01', title: t('landing_step1_title'), desc: t('landing_step1_desc') },
    { num: '02', title: t('landing_step2_title'), desc: t('landing_step2_desc') },
    { num: '03', title: t('landing_step3_title'), desc: t('landing_step3_desc') },
    { num: '04', title: t('landing_step4_title'), desc: t('landing_step4_desc') },
  ];

  return (
    <div>
      {/* ══ HERO ══ */}
      <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', padding: '20px 16px', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="sk-card" style={{ padding: '8px 16px', display: 'inline-flex', width: 'fit-content', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold' }}>
            🌾 {t('landing_hero_badge')}
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', margin: 0, lineHeight: 1.1 }}>
            {t('landing_hero_title1')} <br />
            <span style={{ color: 'var(--primary)' }}>{t('landing_hero_title2')}</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '520px', lineHeight: 1.6, margin: 0 }}>
            {t('landing_hero_desc')}
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Link href="/predict" className="sk-button-primary sk-button" style={{ textDecoration: 'none', padding: '16px 32px', fontSize: '16px' }}>
              🌱 {t('landing_hero_btn1')}
            </Link>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div style={{ flex: '1 1 280px', display: 'flex', justifyContent: 'center' }}>
          <div className="sk-card anim-pop" style={{ width: '100%', maxWidth: '480px', position: 'relative', background: 'var(--grad-convex)' }}>
            <div className="anim-float" style={{ fontSize: '4rem', marginBottom: '16px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>🌾</div>
            <div style={{ fontSize: '12px', color: 'var(--primary-dark)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px' }}>
              {t('landing_hero_latest_title')}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>{t('landing_hero_rice_match')}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('landing_hero_kharif_maha')}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[[t('landing_hero_farm_health'), '87%'], [t('landing_hero_soil_health'), '79%'], [t('landing_hero_confidence'), '94%'], [t('landing_hero_yield_est'), '2.8 T/ac']].map(([k, v]) => (
                <div key={k} className="sk-card" style={{ padding: '16px', boxShadow: 'var(--shadow-in)', background: 'transparent' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '4px' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Floating chips */}
            <div className="sk-card" style={{ position: 'absolute', top: '-20px', right: '-20px', padding: '12px 20px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-dark)', borderRadius: '30px' }}>
              {t('landing_hero_soilgrids_badge')}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding: '80px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2>{t('landing_how_title')}</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>{t('landing_how_desc')}</p>
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
          <h2>{t('landing_features_title')}</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>{t('landing_features_desc')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {features.map((f) => (
            <div key={f.title} className="sk-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="anim-float" style={{ fontSize: '48px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              <Link href={f.link} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>
                {t('landing_try_now')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '80px 16px', textAlign: 'center' }}>
        <div className="sk-card" style={{ background: 'var(--grad-primary)', color: 'white', padding: '60px 24px', borderRadius: '30px', boxShadow: 'var(--shadow-heavy)' }}>
          <h2 style={{ color: 'white', marginBottom: '16px' }}>{t('landing_cta_title')}</h2>
          <p style={{ maxWidth: '520px', margin: '0 auto 32px', opacity: 0.9 }}>
            {t('landing_cta_desc')}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/predict" className="sk-button" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              {t('landing_cta_btn2')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
