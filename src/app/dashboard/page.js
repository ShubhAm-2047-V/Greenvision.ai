'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, supabase } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import Icon from '../../components/Icon';

const DashboardPage = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestPred, setLatestPred] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { count: farmsCount } = await supabase
          .from('farms')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { data: preds, count: predsCount } = await supabase
          .from('predictions')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const { count: diseasesCount } = await supabase
          .from('disease_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        let avgN = 78;
        let avgP = 45;
        let avgK = 120;
        let avgPh = 6.6;

        if (preds && preds.length > 0) {
          const sumN = preds.reduce((acc, curr) => acc + (curr.nitrogen || 0), 0);
          const sumPh = preds.reduce((acc, curr) => acc + (curr.ph || 0), 0);
          const sumP = preds.reduce((acc, curr) => acc + (curr.phosphorus || 45), 0);
          const sumK = preds.reduce((acc, curr) => acc + (curr.potassium || 120), 0);
          avgN = (sumN / preds.length).toFixed(1);
          avgPh = (sumPh / preds.length).toFixed(1);
          avgP = (sumP / preds.length).toFixed(1);
          avgK = (sumK / preds.length).toFixed(1);
          
          setLatestPred(preds[0]);
        }

        const distributions = {};
        if (preds) {
          preds.forEach(p => {
            distributions[p.crop] = (distributions[p.crop] || 0) + 1;
          });
        }

        setStats({
          farmsCount: farmsCount || 0,
          predsCount: predsCount || 0,
          diseasesCount: diseasesCount || 0,
          avgN,
          avgP,
          avgK,
          avgPh,
          distributions
        });

        if (preds) {
          setHistory(preds.slice(0, 8));
        }

      } catch (err) {
        console.error("Dashboard database fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        {t('dash_loading')}
      </div>
    );
  }

  if (profile?.role === 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', color: 'var(--primary-dark)' }}>{t('dash_admin_title')}</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('dash_admin_desc')}</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {[
            { label: t('dash_admin_active_farmers'), val: stats?.farmsCount || 0, icon: "user", col: "var(--primary)" },
            { label: t('dash_admin_total_preds'), val: stats?.predsCount || 0, icon: "activity", col: "var(--accent)" },
            { label: t('dash_admin_path_scans'), val: stats?.diseasesCount || 0, icon: "camera", col: "#0ea5e9" },
            { label: t('dash_admin_ai_accuracy'), val: "97.4%", icon: "target", col: "#10b981" }
          ].map((s, i) => (
            <div key={i} className="sk-card anim-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', animationDelay: `${i * 0.1}s` }}>
              <div className="anim-pop" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '16px', borderRadius: '50%', color: s.col }}>
                <Icon name={s.icon} />
              </div>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>{s.label}</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '24px' }}>{s.val}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', color: 'var(--primary-dark)' }}>{t('dash_farmer_title')}</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('dash_farmer_desc')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/predict" className="sk-button-primary sk-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Icon name="plus" /> {t('dash_btn_analyze')}
          </Link>
          <Link href="/disease" className="sk-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Icon name="camera" style={{ color: 'var(--primary)' }} /> {t('dash_btn_scan')}
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {[
          { label: t('dash_metric_farm_health'), val: latestPred?.farm_health_score ? `${latestPred.farm_health_score}%` : 'N/A', icon: "activity", col: "var(--primary)" },
          { label: t('dash_metric_soil_health'), val: latestPred?.soil_health_score ? `${latestPred.soil_health_score}%` : 'N/A', icon: "sprout", col: "#10b981" },
          { label: t('dash_metric_weather'), val: latestPred?.weather_data?.conditions ? t(latestPred.weather_data.conditions.toLowerCase()) || latestPred.weather_data.conditions : t('stable'), icon: "sun", col: "#f59e0b" },
          { label: t('dash_metric_disease'), val: stats?.diseasesCount || 0, icon: "camera", col: "#e11d48" }
        ].map((s, i) => (
          <div key={i} className="sk-card anim-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', animationDelay: `${i * 0.1}s` }}>
            <div className="anim-pop" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '16px', borderRadius: '50%', color: s.col }}>
              <Icon name={s.icon} />
            </div>
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>{s.label}</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '24px', textTransform: 'capitalize' }}>{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {latestPred && (
        <div className="sk-card anim-slide-up" style={{ background: 'var(--grad-convex)', animationDelay: '0.4s' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px' }}>{t('dash_latest_badge')}</span>
          <h2 style={{ margin: '8px 0', fontSize: '28px', color: 'var(--primary-dark)' }}>{t('dash_latest_title')} <span style={{ color: 'var(--primary)' }}>{t(latestPred.crop.toLowerCase()) || latestPred.crop}</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, maxWidth: '800px' }}>{latestPred.explanation}</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ flex: '1 1 150px' }}><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{t('dash_latest_yield')}</span><strong style={{ fontSize: '16px' }}>{latestPred.expected_yield}</strong></div>
            <div style={{ flex: '1 1 150px' }}><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{t('dash_latest_revenue')}</span><strong style={{ fontSize: '16px' }}>{latestPred.expected_revenue}</strong></div>
            <div style={{ flex: '1 1 150px' }}><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{t('dash_latest_profit')}</span><strong style={{ fontSize: '16px', color: '#10b981' }}>{latestPred.expected_profit}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
