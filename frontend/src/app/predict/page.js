'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Geolocation
  const [coords, setCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Prediction Results
  const [predictLoading, setPredictLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // 1. Handle Multiple Farm Image uploads (JPG, PNG, WEBP)
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
      // Asynchronously compress selected files to fit Vercel payload thresholds
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

  // 2. Geolocation Access (captures coordinates)
  const triggerLocation = () => {
    setLocLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ lat, lon });
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

  // 3. Compile everything and query backend
  const executeAnalysis = async () => {
    if (!coords) {
      setError("Coordinates are required. Grant Geolocation access first.");
      return;
    }
    if (!user) {
      setError("Please log in or register to access agronomy reports.");
      return;
    }

    setPredictLoading(true);
    setStep(3);
    setError('');
    
    // Status text sequences
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
      // 0. Convert compressed images to base64 strings in parallel as a backend fallback
      const base64Images = await Promise.all(images.map(file => fileToBase64Obj(file)));
      const validBase64Images = base64Images.filter(img => img !== null);

      // 1. Upload compressed images directly to Supabase Storage from browser in parallel
      let uploadTimedOutOrFailed = false;

      const uploadPromises = images.map(async (file) => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error: uploadError } = await uploadWithTimeout(fileName, file);

          if (uploadError) {
            console.warn("Supabase direct upload returned error:", uploadError.message);
            uploadTimedOutOrFailed = true;
            return null;
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('farm-images')
              .getPublicUrl(fileName);
            return publicUrlData.publicUrl;
          }
        } catch (uploadErr) {
          console.warn("Supabase direct upload timed out or failed, using base64 fallback:", uploadErr.message);
          uploadTimedOutOrFailed = true;
          return null;
        }
      });

      const uploadedUrlResults = await Promise.all(uploadPromises);
      const uploadedUrls = uploadedUrlResults.filter(url => url !== null);

      // If any of the uploads failed or timed out, or if we didn't get all of them, use base64 fallback
      const useBase64Fallback = uploadTimedOutOrFailed || (uploadedUrls.length < images.length);

      // 2. Query backend using standard JSON API
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
      if (err.response?.data?.message) {
        detailedMsg += ` Error: ${err.response.data.message}`;
      } else if (err.response?.status) {
        detailedMsg += ` (HTTP Status: ${err.response.status} - ${err.response.statusText || 'Error'})`;
      } else if (err.message) {
        detailedMsg += ` Details: ${err.message}`;
      } else {
        detailedMsg += " Please check your internet connection and try again.";
      }
      setError(detailedMsg);
      setStep(2);
    } finally {
      clearInterval(timer);
      setPredictLoading(false);
    }
  };

  // 4. Download Report PDF
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-rose-500';
  };

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Analyze My Farm</h1>
        <p className="text-sm text-slate-500">Upload images and allow location access to automatically compile soil, weather, and AI recommendations.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4 text-xs font-semibold text-slate-400">
        {[
          { num: 1, label: "Upload Snapshots" },
          { num: 2, label: "Location & Run" },
          { num: 3, label: "AI Compilation" },
          { num: 4, label: "Agronomic Report" }
        ].map((s) => (
          <div key={s.num} className={`flex items-center gap-2 ${step === s.num ? 'text-primary' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === s.num ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-700'}`}>{s.num}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Icon name="camera" className="text-primary w-5 h-5" /> Farm & Crop Images
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Upload farm snapshots, soil images, or leaf photographs. Supported formats: JPG, PNG, WEBP.
              </p>
              
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 rounded-2xl p-8 relative flex flex-col items-center justify-center min-h-[180px] cursor-pointer">
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <Icon name="upload" className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-500">Drag & Drop or Select Images</span>
              </div>

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity border-0 cursor-pointer"
                      >
                        <Icon name="x" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setStep(2)} 
              disabled={images.length === 0}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-8 rounded-xl self-end cursor-pointer mt-4 disabled:opacity-50"
            >
              Continue to Location
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Farm Name</label>
                <input 
                  type="text" 
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div className="border-t border-slate-200/20 pt-6 flex flex-col items-center text-center gap-4">
                <Icon name="globe" className="w-16 h-16 text-primary stroke-1 animate-pulse" />
                <div className="max-w-md">
                  <h3 className="font-bold text-xl mb-1 text-slate-800 dark:text-white">Pinpoint Location</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Grant browser location access to automatically pull meteorological data from Open-Meteo and chemical parameters from SoilGrids.
                  </p>
                </div>

                <button 
                  onClick={triggerLocation} 
                  disabled={locLoading}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 border-0 cursor-pointer shadow-lg transition-all"
                >
                  {locLoading && <Icon name="refresh-cw" className="w-4 h-4 animate-spin" />}
                  Allow Location Access
                </button>

                {coords && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs rounded-xl flex items-center gap-2">
                    <Icon name="check-circle" className="w-4 h-4" />
                    Coordinates Resolved: Lat {coords.lat.toFixed(4)}, Lon {coords.lon.toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(1)} className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 rounded-xl cursor-pointer bg-transparent text-slate-700 dark:text-slate-350">Back</button>
              <button onClick={executeAnalysis} disabled={!coords || predictLoading} className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl cursor-pointer disabled:opacity-50">Execute Automated Analysis</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-28 gap-4"
          >
            <div className="relative flex items-center justify-center">
              <Icon name="refresh-cw" className="w-16 h-16 text-primary animate-spin stroke-1" />
              <Icon name="sprout" className="w-6 h-6 text-primary absolute" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">AgroMind AI Engine Processing...</h3>
            <p className="text-xs text-slate-400 font-mono animate-pulse">{loadingMsg}</p>
          </motion.div>
        )}

        {step === 4 && result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 text-left"
          >
            {/* Cover Action Header */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-950/40">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Geocoded Location</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                  {result.weather_data?.conditions ? `${result.state}, ${result.district}` : `${result.state}, India`}
                </h3>
              </div>
              <button 
                onClick={triggerPdfDownload} 
                disabled={pdfDownloading}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl border-0 cursor-pointer flex items-center gap-2 shadow-lg transition-all"
              >
                {pdfDownloading ? <Icon name="refresh-cw" className="w-4 h-4 animate-spin" /> : <Icon name="download" className="w-4 h-4" />}
                Download PDF Report
              </button>
            </div>

            {/* Health Scores Block */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className={`text-xl font-black ${getScoreColor(result.farm_health_score)}`}>{result.farm_health_score || '85'}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">Farm Health Score</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Vegetative growth, hydration density, and crop condition parameters computed from Vision-AI scans.</p>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className={`text-xl font-black ${getScoreColor(result.soil_health_score)}`}>{result.soil_health_score || '78'}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">Soil Health Score</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Estimated organic carbon, mineral nutrient balance, and hydration capacity indexes.</p>
                </div>
              </div>
            </div>

            {/* Main Crop Recommendation Card */}
            <div className="glass p-8 rounded-3xl border border-emerald-500/30 relative overflow-hidden shadow-xl bg-gradient-to-br from-emerald-500/5 to-transparent">
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Main Crop Recommendation</span>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-2 mt-2 capitalize">
                <Icon name="leaf" className="w-8 h-8 text-primary" /> {result.crop}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 py-4 border-y border-slate-200/50 dark:border-slate-800/30 text-xs">
                <div><span className="text-slate-400 block">Confidence Match</span><span className="font-bold text-primary text-sm">{(result.confidence).toFixed(1)}%</span></div>
                <div><span className="text-slate-400 block">Growing Duration</span><span className="font-bold text-sm">{result.crops_list?.[0]?.growth_duration || '120 Days'}</span></div>
                <div><span className="text-slate-400 block">Yield Forecast</span><span className="font-bold text-sm">{result.expected_yield}</span></div>
                <div><span className="text-slate-400 block">Profit Forecast</span><span className="font-bold text-emerald-600 text-sm">{result.expected_profit}</span></div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">{result.explanation}</p>
            </div>

            {/* Soil Chemistry Ratings */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                <Icon name="database" className="w-5 h-5 text-primary" /> Automated Soil Chemical Ratings (SoilGrids)
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { name: 'Nitrogen (N)', key: 'nitrogen', max: 150, unit: 'g/kg' },
                  { name: 'Phosphorus (P)', key: 'phosphorus', max: 100, unit: 'mg/kg' },
                  { name: 'Potassium (K)', key: 'potassium', max: 250, unit: 'mg/kg' },
                  { name: 'Soil pH', key: 'ph', max: 14, unit: 'pH' }
                ].map((item) => {
                  const data = result.soil_analysis?.[item.key] || { value: 0, status: 'N/A', confidence: 50 };
                  const barPercent = Math.min(100, (data.value / item.max) * 100);
                  
                  return (
                    <div key={item.name} className="flex flex-col gap-2 p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-slate-200/10">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-350">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">{data.status}</span>
                          <span className="text-slate-400 text-[10px]">Confidence: {data.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full rounded-full bg-primary transition-all duration-500" 
                          style={{ width: `${barPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                        {data.value} {item.unit}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mt-6 pt-6 border-t border-slate-200/20 text-xs">
                <div><span className="text-slate-450 block uppercase text-[10px] font-semibold">Organic Carbon</span><span className="font-bold mt-1 block text-slate-750 dark:text-slate-300">{result.soil_analysis?.organic_carbon?.value || '1.6'} g/kg</span></div>
                <div><span className="text-slate-450 block uppercase text-[10px] font-semibold">Soil Texture</span><span className="font-bold mt-1 block text-slate-755 dark:text-slate-300">{result.soil_analysis?.texture || 'Loam'}</span></div>
                <div><span className="text-slate-450 block uppercase text-[10px] font-semibold">Soil Moisture</span><span className="font-bold mt-1 block text-slate-755 dark:text-slate-300">{result.soil_analysis?.moisture || '24.5%'}</span></div>
              </div>
            </div>

            {/* Weather summary */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm text-xs">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                <Icon name="sun" className="w-5 h-5 text-yellow-500" /> Weather Summary (Open-Meteo)
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
                <div className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-slate-200/10">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Temperature</span>
                  <span className="text-lg font-bold block mt-1 text-slate-800 dark:text-white">{result.temperature?.toFixed(1) || '26.5'} °C</span>
                </div>
                <div className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-slate-200/10">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Humidity</span>
                  <span className="text-lg font-bold block mt-1 text-slate-800 dark:text-white">{result.humidity || '68'} %</span>
                </div>
                <div className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-slate-200/10">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Rainfall</span>
                  <span className="text-lg font-bold block mt-1 text-slate-800 dark:text-white">{result.rainfall?.toFixed(1) || '110.0'} mm</span>
                </div>
                <div className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-slate-200/10">
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Season</span>
                  <span className="text-lg font-bold block mt-1 text-primary capitalize">{result.season}</span>
                </div>
              </div>
            </div>

            {/* Crop Recommendations list comparison */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <Icon name="sprout" className="w-5 h-5 text-primary" /> Top 5 Suitable Crops Comparison
              </h3>
              <div className="flex flex-col gap-3">
                {result.crops_list?.map((crop, idx) => (
                  <div key={idx} className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-slate-200/10">
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white capitalize flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                        {crop.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Yield: <b>{crop.expected_yield}</b> | Profit: <b className="text-emerald-500">{crop.estimated_profit}</b> | Duration: <b>{crop.growth_duration}</b>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal italic">{crop.reasoning}</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-black self-start sm:self-auto flex-shrink-0">
                      {crop.suitability}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fertilizer split schedules */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm text-xs">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <Icon name="leaf" className="w-4 h-4 text-primary" /> Fertilizer Recommendation dosage splits
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/30">
                    <tr><th className="p-3">Fertilizer Type</th><th className="p-3">Quantity Required</th><th className="p-3">Schedule</th><th className="p-3">Application Method</th></tr>
                  </thead>
                  <tbody>
                    {result.fertilizer_plan?.fertilizers?.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-500/5 border-b border-slate-200/10">
                        <td className="p-3 font-semibold text-primary">{f.name}</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-350">{f.quantity}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{f.schedule}</td>
                        <td className="p-3 text-slate-650 dark:text-slate-400">{f.method || 'Broadcasting'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-250/20 mt-4 text-slate-600 dark:text-slate-300 leading-normal">
                <span className="font-bold text-slate-800 dark:text-white block mb-1">pH Balancing Advice:</span>
                {result.fertilizer_plan?.ph_advice}
              </div>
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 mt-3 text-primary-dark font-semibold">
                <span className="font-bold block mb-1">Organic Alternatives:</span>
                {result.fertilizer_plan?.organic_alternatives}
              </div>
            </div>

            {/* Irrigation schedule card */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm text-xs">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <Icon name="droplet" className="w-4 h-4 text-sky-500" /> Irrigation Scheduler Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-center">
                <div className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-slate-200/10">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Daily Water requirement</span>
                  <span className="text-xl font-bold text-sky-500 block mt-1">{result.irrigation_schedule?.daily_water_requirement_liters?.toLocaleString() || 'N/A'} Liters</span>
                </div>
                <div className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-slate-200/10">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Weekly Water requirement</span>
                  <span className="text-xl font-bold text-sky-500 block mt-1">{result.irrigation_schedule?.weekly_water_requirement_liters?.toLocaleString() || 'N/A'} Liters</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-200/20 pt-4">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Watering Frequency:</span>
                  <p className="text-slate-500">{result.irrigation_schedule?.irrigation_frequency || 'Every 2-3 days'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Best Watering Time:</span>
                  <p className="text-slate-500">{result.irrigation_schedule?.best_watering_times || 'Early morning / evening'}</p>
                </div>
              </div>

              <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl text-sky-850 dark:text-sky-300 mt-4 leading-normal">
                <span className="font-bold block mb-1 text-sky-900 dark:text-sky-200">Water Conservation Guidelines:</span>
                <ul className="list-disc pl-4 flex flex-col gap-1 mt-1">
                  {result.irrigation_schedule?.water_saving_tips?.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictPage;
