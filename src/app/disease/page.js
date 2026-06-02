'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { scanLeafDisease } from '../../services/api';
import Icon from '../../components/Icon';
import { compressImage } from '../../utils/image';

const DiseasePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [cropType, setCropType] = useState('tomato');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setError('');
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      setResult(null);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a leaf photograph to scan."); // Hardcoded error, wait maybe translate this later or leave as is since error comes from backend usually. Let's keep it simple.
      return;
    }
    if (!user) {
      setError("Please log in to register disease logs.");
      return;
    }

    setError('');
    setScanning(true);
    setResult(null);

    try {
      const res = await scanLeafDisease(selectedFile, cropType, user.id);
      setResult(res.data.record);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Leaf scanning diagnostic failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ color: 'var(--primary-dark)', margin: '0 0 8px' }}>{t('disease_title')}</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('disease_desc')}</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Upload Form */}
        <div className="sk-card" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <Icon name="camera" style={{ color: 'var(--primary)' }} /> {t('disease_upload_title')}
          </h3>
          
          {error && (
            <div style={{ padding: '12px', background: '#ffe4e6', color: '#e11d48', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{t('disease_crop_type')}</label>
              <select 
                value={cropType} 
                onChange={e => setCropType(e.target.value)} 
                className="sk-card"
                style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '12px', border: 'none', outline: 'none' }}
              >
                <option value="tomato">{t('disease_crop_tomato')}</option>
                <option value="potato">{t('disease_crop_potato')}</option>
                <option value="rice">{t('disease_crop_rice')}</option>
                <option value="wheat">{t('disease_crop_wheat')}</option>
                <option value="corn">{t('disease_crop_corn') || 'Corn'}</option>
                <option value="cotton">{t('disease_crop_cotton')}</option>
                <option value="sugarcane">{t('disease_crop_sugarcane')}</option>
                <option value="other">{t('disease_crop_other')}</option>
              </select>
            </div>

            <div className="sk-card" style={{ 
              border: '2px dashed var(--primary-light)', padding: '24px', textAlign: 'center', 
              position: 'relative', cursor: 'pointer', background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)',
              minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              
              {preview ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '12px' }}>
                  <img src={preview} alt="leaf" style={{ maxHeight: '180px', objectFit: 'contain' }} />
                  {scanning && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)' }}></div>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Icon name="upload" style={{ width: '40px', height: '40px', opacity: 0.5 }} />
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t('disease_drag')}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={scanning || !selectedFile} className="sk-button-primary sk-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {scanning ? (
                <>{t('disease_btn_scanning')}</>
              ) : (
                <><Icon name="sparkles" /> {t('disease_btn_scan')}</>
              )}
            </button>
          </form>
        </div>

        {/* Diagnostic Results Display */}
        <div style={{ flex: '2 1 280px' }}>
          {result ? (
            <div className="sk-card anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--grad-convex)' }}>
              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '50px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', alignSelf: 'flex-start' }}>
                Diagnosis Completed
              </span>
              
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Identified Pathology</span>
                <h3 style={{ fontSize: '24px', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-dark)' }}>
                  <Icon name="check-circle" style={{ color: 'var(--primary)' }} /> {t(result.disease_name.toLowerCase()) || result.disease_name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('disease_match_conf')}: <strong>{(result.confidence).toFixed(1)}%</strong> | Severity: <strong style={{ color: '#e11d48' }}>{t('disease_' + result.severity.toLowerCase()) || result.severity}</strong>
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px' }}>{t('disease_treatment')}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{result.treatment}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px' }}>{t('disease_medicine')}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{result.medicine}</p>
                </div>
              </div>

              <div className="sk-card" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '16px', marginTop: '12px' }}>
                <h4 style={{ color: 'var(--primary-dark)', margin: '0 0 8px' }}>{t('disease_prevention')}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{result.prevention}</p>
                {result.recovery_time && (
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
                    {t('disease_recovery')}: <strong>{result.recovery_time}</strong>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="sk-card anim-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
              <Icon name="upload" style={{ width: '48px', height: '48px', opacity: 0.3, marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 4px' }}>Diagnostic scan panel</h3>
              <p style={{ fontSize: '12px', maxWidth: '250px', margin: 0 }}>Upload a leaf photo on the left panel to execute crop pathology diagnostics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseasePage;
