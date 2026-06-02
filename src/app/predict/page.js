'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, supabase } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { predictCrop, getReportUrl } from '../../services/api';
import Icon from '../../components/Icon';
import { compressImage } from '../../utils/image';

const fileToBase64Obj = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => {
    const base64String = reader.result.split(',')[1];
    resolve({
      mimeType: file.type || 'image/jpeg',
      data: base64String
    });
  };
  reader.onerror = () => resolve(null);
  reader.readAsDataURL(file);
});

const PredictPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [farmName, setFarmName] = useState('My Smart Farm');

  const [coords, setCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('agromind_coords');
    if (saved) {
      try {
        setCoords(JSON.parse(saved));
        setLocationSuccess(true);
      } catch (e) {}
    }
  }, []);

  const [predictLoading, setPredictLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    
    const filteredFiles = files.filter(file => {
      if (!validFormats.includes(file.type)) {
        setError("Invalid file format. Please upload JPG, PNG, or WEBP images.");
        return false;
      }
      return true;
    });

    if (filteredFiles.length > 0) {
      setError('');
      const compressedFiles = await Promise.all(
        filteredFiles.map(file => compressImage(file))
      );
      
      setImages(prev => [...prev, ...compressedFiles]);
      const filePreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...filePreviews]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const triggerLocation = () => {
    setLocLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const newCoords = { lat, lon };
          setCoords(newCoords);
          localStorage.setItem('agromind_coords', JSON.stringify(newCoords));
          setLocationSuccess(true);
          setLocLoading(false);
        },
        (err) => {
          console.error("GPS coords capture error:", err);
          setError("Failed to access your location. Please grant browser GPS access.");
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("Browser geolocation is not supported by your browser.");
      setLocLoading(false);
    }
  };

  const uploadWithTimeout = (fileName, file) => {
    const uploadPromise = supabase.storage.from('farm-images').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase direct upload timed out after 15 seconds.")), 15000)
    );
    return Promise.race([uploadPromise, timeoutPromise]);
  };

  const executeAnalysis = async () => {
    if (!coords) {
      setError("Coordinates are required. Grant Geolocation access first.");
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least one farm image before analyzing.");
      setStep(1);
      return;
    }
    if (!user) {
      setError("Please log in or register to access agronomy reports.");
      return;
    }

    setPredictLoading(true);
    setStep(3);
    setError('');
    
    const sequences = [
      "Resolving coordinates via OpenStreetMap Nominatim...",
      "Gathering local meteorological forecasts from Open-Meteo...",
      "Extracting chemical soil profiles from ISRIC SoilGrids database...",
      "Uploading farm snapshots to secure Supabase storage...",
      "Running Gemini Vision image analysis on farm crops...",
      "Integrating parameters inside AI Agriculture Engine...",
      "Compiling yield projections and organic fertilizer schedules..."
    ];

    let i = 0;
    setLoadingMsg(sequences[0]);
    const timer = setInterval(() => {
      i++;
      if (i < sequences.length) {
        setLoadingMsg(sequences[i]);
      }
    }, 2500);

    try {
      const base64Images = await Promise.all(images.map(file => fileToBase64Obj(file)));
      const validBase64Images = base64Images.filter(img => img !== null);

      let uploadTimedOutOrFailed = false;

      const uploadPromises = images.map(async (file) => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error: uploadError } = await uploadWithTimeout(fileName, file);

          if (uploadError) {
            uploadTimedOutOrFailed = true;
            return null;
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('farm-images')
              .getPublicUrl(fileName);
            return publicUrlData.publicUrl;
          }
        } catch (uploadErr) {
          uploadTimedOutOrFailed = true;
          return null;
        }
      });

      const uploadedUrlResults = await Promise.all(uploadPromises);
      const uploadedUrls = uploadedUrlResults.filter(url => url !== null);
      const useBase64Fallback = uploadTimedOutOrFailed || (uploadedUrls.length < images.length);

      const payload = {
        lat: coords.lat,
        lon: coords.lon,
        user_id: user.id,
        farm_name: farmName,
        image_urls: uploadedUrls,
        image_base64s: useBase64Fallback ? validBase64Images : []
      };

      const res = await predictCrop(payload);
      setResult(res.data.prediction);
      setStep(4);
    } catch (err) {
      console.error(err);
      let detailedMsg = "Failed to generate AI crop planning report.";
      if (err.response?.data?.message) detailedMsg += ` Error: ${err.response.data.message}`;
      else if (err.message) detailedMsg += ` Details: ${err.message}`;
      setError(detailedMsg);
      setStep(2);
    } finally {
      clearInterval(timer);
      setPredictLoading(false);
    }
  };

  const triggerPdfDownload = async () => {
    if (!result?.id) return;
    setPdfDownloading(true);
    try {
      const res = await getReportUrl(result.id);
      const url = res.data.report_url;
      window.open(url, '_blank');
    } catch (err) {
      alert("PDF report download failed. Please try again.");
    } finally {
      setPdfDownloading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ color: 'var(--primary-dark)', margin: '0 0 8px' }}>Analyze My Farm</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Upload images and allow location access to automatically compile soil, weather, and AI recommendations.</p>
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#ffe4e6', color: '#e11d48', borderRadius: '12px', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {/* Stepper Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', fontSize: '12px', fontWeight: 'bold' }}>
        {[
          { num: 1, label: "Upload Snapshots" },
          { num: 2, label: "Location & Run" },
          { num: 3, label: "AI Compilation" },
          { num: 4, label: "Agronomic Report" }
        ].map((s) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step === s.num ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
            <span style={{ 
              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', 
              background: step === s.num ? 'var(--primary)' : 'transparent', color: step === s.num ? 'white' : 'inherit', border: '1px solid currentColor' 
            }}>{s.num}</span>
            <span className="desktop-only">{s.label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="sk-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="camera" style={{ color: 'var(--primary)' }} /> Farm & Crop Images
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Upload farm snapshots, soil images, or leaf photographs. Supported formats: JPG, PNG, WEBP.</p>
          
          <div className="sk-card" style={{ 
            border: '2px dashed var(--primary-light)', padding: '40px', textAlign: 'center', 
            position: 'relative', cursor: 'pointer', background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)'
          }}>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
            <Icon name="upload" style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Drag & Drop or Select Images</span>
          </div>

          {previews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
              {previews.map((src, i) => (
                <div key={i} className="sk-card" style={{ position: 'relative', width: '80px', height: '80px', padding: 0, overflow: 'hidden' }}>
                  <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>
                    <Icon name="x" style={{ width: '14px', height: '14px', margin: 'auto' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setStep(2)} disabled={images.length === 0} className="sk-button-primary sk-button" style={{ alignSelf: 'flex-end', marginTop: '16px' }}>
            Continue to Location
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="sk-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Farm Name</label>
            <input 
              type="text" 
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="sk-card"
              style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '16px', border: 'none', outline: 'none' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Icon name="globe" style={{ width: '64px', height: '64px', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Location Data</h3>
            
            {coords ? (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>We have your saved farm location. You can proceed with analysis, or update it if you have moved.</p>
                <div className="sk-card" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 'bold', fontSize: '14px', padding: '12px' }}>
                  Coordinates: Lat {coords.lat.toFixed(4)}, Lon {coords.lon.toFixed(4)}
                </div>
                <button onClick={triggerLocation} disabled={locLoading} className="sk-button" style={{ marginTop: '8px' }}>
                  {locLoading ? 'Updating...' : 'Update Location'}
                </button>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Grant browser location access to automatically pull meteorological data from Open-Meteo and chemical parameters from SoilGrids.</p>
                <button onClick={triggerLocation} disabled={locLoading} className="sk-button">
                  {locLoading ? 'Loading...' : 'Allow Location Access'}
                </button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <button onClick={() => setStep(1)} className="sk-button">Back</button>
            <button onClick={executeAnalysis} disabled={!coords || predictLoading} className="sk-button-primary sk-button">
              Execute Automated Analysis
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="sk-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: 'var(--primary-dark)' }}>AgroMind AI Engine Processing...</h3>
          <p style={{ color: 'var(--text-muted)', fontWeight: 'bold', marginTop: '16px' }}>{loadingMsg}</p>
        </div>
      )}

      {step === 4 && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="sk-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>Geocoded Location</span>
              <h3 style={{ margin: 0 }}>{result.weather_data?.conditions ? `${result.state}, ${result.district}` : `${result.state}, India`}</h3>
            </div>
            <button onClick={triggerPdfDownload} disabled={pdfDownloading} className="sk-button" style={{ background: '#1e293b', color: 'white' }}>
              {pdfDownloading ? 'Downloading...' : 'Download PDF Report'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="sk-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="sk-card" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {result.farm_health_score || '85'}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px' }}>Farm Health Score</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Vegetative growth, hydration density, and crop condition parameters.</p>
              </div>
            </div>
            <div className="sk-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="sk-card" style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {result.soil_health_score || '78'}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px' }}>Soil Health Score</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Estimated organic carbon, mineral nutrient balance.</p>
              </div>
            </div>
          </div>

          <div className="sk-card" style={{ background: 'var(--grad-convex)' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>Main Crop Recommendation</span>
            <h2 style={{ margin: '8px 0', fontSize: '32px', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'capitalize' }}>
              <Icon name="leaf" style={{ color: 'var(--primary)' }} /> {result.crop}
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', margin: '16px 0', padding: '16px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ flex: '1 1 120px' }}><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Confidence</span><strong style={{ color: 'var(--primary)' }}>{(result.confidence).toFixed(1)}%</strong></div>
              <div style={{ flex: '1 1 120px' }}><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Duration</span><strong>{result.crops_list?.[0]?.growth_duration || '120 Days'}</strong></div>
              <div style={{ flex: '1 1 120px' }}><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Yield</span><strong>{result.expected_yield}</strong></div>
              <div style={{ flex: '1 1 120px' }}><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Profit</span><strong style={{ color: '#10b981' }}>{result.expected_profit}</strong></div>
            </div>

            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)' }}>{result.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictPage;
