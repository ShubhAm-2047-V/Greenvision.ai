'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { scanLeafDisease } from '../../services/api';
import Icon from '../../components/Icon';

const DiseasePage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [cropType, setCropType] = useState('tomato');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a leaf photograph to scan.");
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
    <div className="flex flex-col gap-10 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Disease Scanner</h1>
        <p className="text-sm text-slate-500">Upload a leaf photo to diagnose plant pathology, symptoms, and recommend treatments.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Upload Form */}
        <div className="w-full lg:w-5/12 glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          <h3 className="font-bold flex items-center gap-2 mb-6 border-b border-slate-200/30 pb-4 text-slate-800 dark:text-white">
            <Icon name="camera" className="text-primary w-5 h-5" /> Image Upload
          </h3>
          
          {error && (
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleScan} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Crop Category</label>
              <select 
                value={cropType} 
                onChange={e=>setCropType(e.target.value)} 
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs dark:bg-slate-900 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-300"
              >
                <option value="tomato">Tomato</option>
                <option value="potato">Potato</option>
                <option value="rice">Rice</option>
                <option value="wheat">Wheat</option>
                <option value="corn">Corn</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 rounded-2xl p-6 relative flex flex-col items-center justify-center min-h-[220px] cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {preview ? (
                <div className="relative max-h-52 w-full flex items-center justify-center overflow-hidden rounded-xl">
                  <img src={preview} alt="leaf" className="max-h-48 object-contain" />
                  {scanning && <div className="scanline"></div>}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Icon name="upload" className="w-10 h-10 stroke-1" />
                  <span className="text-xs font-semibold">Select Leaf Image</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={scanning || !selectedFile} 
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-lg border-0 cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Icon name="refresh-cw" className="w-5 h-5 animate-spin" /> Diagnosing...
                </>
              ) : (
                <>
                  <Icon name="sparkles" className="w-5 h-5" /> Run Diagnosis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Diagnostic Results Display */}
        <div className="w-full lg:w-7/12">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass p-8 rounded-3xl border border-emerald-500/25 shadow-2xl flex flex-col gap-4 text-left"
              >
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] uppercase font-bold self-start">
                  Diagnosis Completed
                </span>
                
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">IDENTIFIED PATHOLOGY</span>
                  <h3 className="text-2xl font-bold flex items-center gap-2 mt-1 text-slate-800 dark:text-white">
                    <Icon name="shield-check" className="text-primary w-6 h-6" /> {result.disease_name}
                  </h3>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Confidence: <b>{(result.confidence).toFixed(1)}%</b> | Severity: <b className="text-rose-500">{result.severity}</b>
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-200/30 text-xs">
                  <div>
                    <h4 className="font-bold mb-2 text-slate-700 dark:text-slate-350">Remedial Action</h4>
                    <p className="text-slate-400 leading-relaxed">{result.treatment}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-slate-700 dark:text-slate-350">Commercial Medicine</h4>
                    <p className="text-slate-400 leading-relaxed">{result.medicine}</p>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-xs mt-3">
                  <h4 className="font-bold text-primary-dark mb-1">Prevention & Cleanliness</h4>
                  <p className="text-slate-700 dark:text-slate-350">{result.prevention}</p>
                  {result.recovery_time && (
                    <p className="text-slate-500 mt-2 text-[10px]">Estimated Recovery Window: <b>{result.recovery_time}</b></p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass p-12 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 text-slate-400 flex flex-col items-center justify-center text-center min-h-[40vh]">
                <Icon name="upload" className="w-12 h-12 text-primary/30 mb-4" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Diagnostic scan panel</h3>
                <p className="text-xs max-w-xs mt-1">Upload a leaf photo on the left panel to execute crop pathology diagnostics.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DiseasePage;
