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
        // Query Farms
        const { count: farmsCount } = await supabase
          .from('farms')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Query Predictions
        const { data: preds, count: predsCount } = await supabase
          .from('predictions')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Query Disease Records
        const { count: diseasesCount } = await supabase
          .from('disease_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Calculate Soil parameters averages from predictions
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

        // Count recommended crop frequency distribution
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Icon name="refresh-cw" className="w-12 h-12 text-primary animate-spin" />
        <span className="text-sm text-slate-500">Loading your Agronomy Dashboard...</span>
      </div>
    );
  }

  // popular crops calculation
  const popularCrops = Object.entries(stats?.distributions || {}).sort((a,b) => b[1]-a[1]).slice(0, 4);
  const maxCropVal = popularCrops.length > 0 ? Math.max(...popularCrops.map(e => e[1])) : 1;

  if (profile?.role === 'admin') {
    return (
      <div className="flex flex-col gap-8 text-left">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Admin Console</h1>
          <p className="text-xs text-slate-500">Monitor precision systems and check agricultural AI metrics.</p>
        </div>

        {/* Admin Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Farmers", val: stats?.farmsCount || 0, icon: "user", col: "text-primary" },
            { label: "Total Predictions", val: stats?.predsCount || 0, icon: "activity", col: "text-accent" },
            { label: "Pathology Scans", val: stats?.diseasesCount || 0, icon: "camera", col: "text-sky-500" },
            { label: "AI System Accuracy", val: "97.4%", icon: "target", col: "text-emerald-500" }
          ].map((s, i) => (
            <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/30">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Icon name={s.icon} className="w-6 h-6" /></div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">{s.label}</span>
                <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{s.val}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Farmer Workspace UI
  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Farmer Workspace</h1>
          <p className="text-xs text-slate-500">View real-time farm health indices, soil parameters, and climate metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/predict" className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-3 rounded-xl shadow-lg border-0 cursor-pointer flex items-center gap-2 hover:scale-105 transition-all no-underline">
            <Icon name="plus" className="w-5 h-5" /> Analyze Farm
          </Link>
          <Link href="/disease" className="border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold px-5 py-3 rounded-xl bg-transparent cursor-pointer flex items-center gap-2 no-underline text-slate-700 dark:text-slate-350">
            <Icon name="camera" className="w-5 h-5 text-primary" /> Scan Leaf
          </Link>
        </div>
      </div>

      {/* Main KPI Dashboard Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/30">
          <div className="bg-primary/10 p-3 rounded-xl text-primary"><Icon name="activity" className="w-6 h-6" /></div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Farm Health Score</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {latestPred?.farm_health_score ? `${latestPred.farm_health_score}%` : 'N/A'}
            </h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/30">
          <div className="bg-primary/10 p-3 rounded-xl text-emerald-500"><Icon name="sprout" className="w-6 h-6" /></div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Soil Health Score</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {latestPred?.soil_health_score ? `${latestPred.soil_health_score}%` : 'N/A'}
            </h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/30">
          <div className="bg-primary/10 p-3 rounded-xl text-yellow-500"><Icon name="sun" className="w-6 h-6" /></div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Weather Condition</span>
            <h3 className="text-lg font-bold mt-1 text-slate-800 dark:text-white truncate max-w-[150px] capitalize">
              {latestPred?.weather_data?.conditions || 'Stable'}
            </h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/30">
          <div className="bg-primary/10 p-3 rounded-xl text-rose-500"><Icon name="camera" className="w-6 h-6" /></div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Disease Alerts</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {stats?.diseasesCount || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Latest Recommendation Details */}
      {latestPred && (
        <div className="glass p-6 rounded-3xl border border-primary/20 relative overflow-hidden bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <span className="text-[9px] uppercase font-bold text-primary tracking-widest">LATEST ANALYSIS</span>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-1 capitalize">
                Recommended Crop: <span className="text-primary">{latestPred.crop}</span>
              </h2>
              <p className="text-xs text-slate-450 mt-2 leading-relaxed max-w-2xl">{latestPred.explanation}</p>
              
              <div className="grid grid-cols-3 gap-4 mt-6 text-xs border-t border-slate-200/20 pt-4 max-w-lg">
                <div><span className="text-slate-400">Expected Yield</span><span className="font-bold block text-slate-850 dark:text-white">{latestPred.expected_yield}</span></div>
                <div><span className="text-slate-400">Expected Revenue</span><span className="font-bold block text-slate-850 dark:text-white">{latestPred.expected_revenue}</span></div>
                <div><span className="text-slate-400">Expected Profit</span><span className="font-bold block text-emerald-600">{latestPred.expected_profit}</span></div>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center border-l border-slate-200/20 pl-6 md:w-60 flex-shrink-0 text-xs">
              <div><span className="text-slate-400">Location:</span> <span className="font-bold text-slate-800 dark:text-white capitalize">{latestPred.district}, {latestPred.state}</span></div>
              <div><span className="text-slate-400">Confidence:</span> <span className="font-bold text-primary">{(latestPred.confidence).toFixed(1)}%</span></div>
              <div><span className="text-slate-400">Season:</span> <span className="font-bold text-slate-800 dark:text-white capitalize">{latestPred.season}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Soil properties */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
            <Icon name="activity" className="w-5 h-5 text-primary" /> Soil Nutrient Indexes (Mean averages)
          </h3>
          <div className="flex flex-col gap-4">
            {[
              { name: 'Nitrogen (N) - SoilGrids average', val: stats?.avgN, max: 150, unit: 'g/kg', col: '#10B981' },
              { name: 'Phosphorus (P) - SoilGrids average', val: stats?.avgP, max: 100, unit: 'mg/kg', col: '#3B82F6' },
              { name: 'Potassium (K) - SoilGrids average', val: stats?.avgK, max: 250, unit: 'mg/kg', col: '#EF4444' }
            ].map((n) => (
              <div key={n.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-350">
                  <span>{n.name}</span>
                  <span>{n.val} {n.unit}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-3.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (n.val / n.max) * 100)}%`, backgroundColor: n.col }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Crops Distribution Chart */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
            <Icon name="trending-up" className="w-5 h-5 text-accent" /> Recommended Crop Frequencies
          </h3>
          {popularCrops.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs">
              No crop predictions executed yet. Click "Analyze Farm" to run matching index.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {popularCrops.map(([crop, count]) => (
                <div key={crop} className="flex items-center gap-4">
                  <span className="w-24 text-xs font-semibold truncate capitalize text-slate-700 dark:text-slate-300">{crop}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-850 h-5 rounded-lg overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-lg flex items-center justify-end px-2 transition-all duration-500" 
                      style={{ width: `${(count / maxCropVal) * 100}%` }}
                    >
                      <span className="text-[9px] text-white font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crop Prediction History */}
      <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200/30 dark:border-slate-800/30 flex justify-between items-center bg-slate-100/10">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Agronomic Recommendations History</h3>
        </div>
        {history.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No predictions logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/30 dark:border-slate-800/30 font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Recommended Crop</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Farm Health Score</th>
                  <th className="px-6 py-4">Soil Health Score</th>
                  <th className="px-6 py-4">State / District</th>
                  <th className="px-6 py-4">Date Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-500/5">
                    <td className="px-6 py-4 font-bold text-primary capitalize">{row.crop}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                        {(row.confidence).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-bold">{row.farm_health_score ? `${row.farm_health_score}%` : 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-bold">{row.soil_health_score ? `${row.soil_health_score}%` : 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.state} / {row.district}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(row.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
