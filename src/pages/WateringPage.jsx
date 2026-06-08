import API_BASE from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTint, FaClock, FaExclamationTriangle, FaLeaf, FaWater,
  FaCloudRain, FaSync, FaCheckCircle, FaTimes, FaInfoCircle,
  FaSeedling, FaSun, FaPlus, FaCloud, FaBell
} from 'react-icons/fa';
import {
  MdWaterDrop, MdSchedule, MdLocalFlorist, MdAutoAwesome,
  MdTipsAndUpdates, MdOpacity, MdGrain
} from 'react-icons/md';
import AIChatbot from '../components/AIChatbot';

const farmApiBase = 'http://localhost:8080/api/farms';

/* ═══════ Helpers ═══════ */
function safeDecode(token) {
  try {
    const p = token.split('.')[1];
    if (!p) return null;
    return JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

function fmt(dt) {
  const d = new Date(dt);
  return isNaN(d) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isoFromTime(t) {
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), +m[1], +m[2]).toISOString();
}

function parseLastWatered(raw) {
  if (!raw) return '—';
  let d;
  if (typeof raw === 'string') {
    d = new Date(raw.replace(/\[.*\]$/, ''));
  } else if (typeof raw === 'number') {
    d = new Date(raw);
  } else if (raw instanceof Date) {
    d = raw;
  } else return '—';
  if (isNaN(d)) return '—';
  const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (t === '00:00' || t === '12:00 AM') return d.toLocaleDateString();
  return d.toLocaleDateString() + ' ' + t;
}

function getMoistureConfig(moisture) {
  if (moisture < 25) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'from-red-400 to-red-500', badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' };
  if (moisture < 40) return { label: 'Dry', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'from-orange-400 to-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' };
  if (moisture < 60) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'from-amber-400 to-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
  if (moisture < 80) return { label: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'from-emerald-400 to-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
  return { label: 'Excellent', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', bar: 'from-cyan-400 to-cyan-500', badge: 'bg-cyan-100 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' };
}

/* ═══════ Toast ═══════ */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  const styles = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600', warning: 'bg-amber-500' };
  const icons = { success: <FaCheckCircle />, error: <FaExclamationTriangle />, info: <FaInfoCircle />, warning: <FaBell /> };
  return (
    <motion.div initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 120, opacity: 0 }}
      className={`fixed top-6 right-6 z-[100] ${styles[type]} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><FaTimes size={12} /></button>
    </motion.div>
  );
}

/* ═══════ Skeletons ═══════ */
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`} />;
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-cyan-50/40 to-green-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Skeleton className="xl:col-span-4 h-96" />
          <Skeleton className="xl:col-span-5 h-96" />
          <Skeleton className="xl:col-span-3 h-96" />
        </div>
      </div>
    </div>
  );
}

/* ═══════ Section Card ═══════ */
function SectionCard({ icon, iconBg, title, subtitle, children, className = '', headerAction }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
          </div>
        </div>
        {headerAction}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ═══════ Stat Card ═══════ */
function StatCard({ icon, iconBg, title, value, accent, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <p className="text-[11px] text-gray-400 font-medium mb-0.5">{title}</p>
      <p className={`text-lg font-bold text-gray-800 leading-tight ${accent || ''}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
    </motion.div>
  );
}

/* ═══════ Plant Card ═══════ */
function PlantCard({ plant, onWater, tankEmpty, isWatering }) {
  const [liters, setLiters] = useState('3');
  const moisture = plant.soilMoisture ?? 0;
  const cfg = getMoistureConfig(moisture);

  const handleWater = (e) => {
    e.preventDefault();
    const l = parseInt(liters) || 0;
    if (l > 0) onWater(plant.id, l);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-white shadow-sm border ${cfg.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <FaSeedling className={`text-lg ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-gray-800 truncate">{plant.name || 'Unnamed'}</h4>
          <p className="text-[10px] text-gray-400 capitalize">{plant.species || plant.type || 'Plant'}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
            <MdOpacity size={10} /> Moisture
          </span>
          <span className={`text-xs font-bold ${cfg.color}`}>{Math.round(moisture)}%</span>
        </div>
        <div className="h-2.5 w-full bg-white rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, moisture)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full relative`}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full" style={{
              animation: 'liquid-wave 3s ease-in-out infinite'
            }} />
          </motion.div>
        </div>
      </div>

      {/* Last watered */}
      <div className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
        <FaClock size={8} />
        {parseLastWatered(plant.lastWatered)}
      </div>

      {/* Water Form */}
      <form onSubmit={handleWater} className="flex gap-2">
        <input
          type="number"
          min="1"
          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
          value={liters}
          onChange={e => setLiters(e.target.value)}
          placeholder="L"
        />
        <button
          type="submit"
          disabled={tankEmpty || isWatering}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold
            hover:shadow-md hover:shadow-blue-200 transition-all duration-300 active:scale-[0.97]
            disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {isWatering ? <FaSync className="animate-spin" size={10} /> : <FaTint size={10} />}
          Water
        </button>
      </form>
    </motion.div>
  );
}

/* ═══════ Schedule Timeline ═══════ */
function ScheduleTimeline({ schedule }) {
  const typeStyles = {
    watering: { dot: 'bg-blue-500', icon: <FaTint className="text-[8px] text-white" />, doneDot: 'bg-emerald-500' },
    treatment: { dot: 'bg-purple-500', icon: <FaPlus className="text-[8px] text-white" /> },
    harvest: { dot: 'bg-amber-500', icon: <FaLeaf className="text-[8px] text-white" /> },
    feeding: { dot: 'bg-orange-500', icon: <MdGrain className="text-[8px] text-white" /> },
  };

  if (!schedule.length) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <MdSchedule className="text-4xl text-gray-300 mb-3" />
      <p className="text-sm font-medium">No events scheduled</p>
      <p className="text-xs">Events will appear here</p>
    </div>
  );

  return (
    <div className="relative">
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-200 via-green-200 to-gray-100" />
      <ul className="space-y-1">
        {schedule.map((s, i) => {
          const isDone = !!s.done;
          const isPast = new Date(isoFromTime(s.time)) <= new Date();
          const isCurrent = !isDone && isPast;
          const style = typeStyles[s.type] || typeStyles.watering;

          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`relative pl-12 py-3 rounded-xl transition-all duration-200
                ${isCurrent ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
            >
              <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full
                ${isDone ? style.doneDot || 'bg-emerald-500' : style.dot} flex items-center justify-center shadow-sm
                ${isCurrent ? 'ring-4 ring-blue-100 animate-pulse' : ''}
                ${isDone ? 'ring-2 ring-green-100' : ''}`}
              >
                {isDone ? <FaCheckCircle className="text-[10px] text-white" /> : style.icon}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isDone ? 'text-emerald-600' : isPast ? 'text-gray-600' : 'text-gray-800'}`}>
                      {s.time}
                    </span>
                    <span className={`text-xs ${isDone ? 'text-emerald-600 line-through' : 'text-gray-700'} font-medium`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{s.type}</span>
                    {isDone && s.doneAt && (
                      <span className="text-[10px] text-emerald-500 font-medium">
                        ✓ {new Date(s.doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
                {isDone && (
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Done</span>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ═══════ MAIN COMPONENT ═══════ */
export default function WateringPage() {
  const [token, setToken] = useState(null);
  const [farmId, setFarmId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [plants, setPlants] = useState([]);
  const [animals] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [nextWatering, setNextWatering] = useState(null);
  const [tankLevel, setTankLevel] = useState(null);
  const [lowTank, setLowTank] = useState(false);
  const [rainForecast, setRainForecast] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [totalWaterUsed, setTotalWaterUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [geo, setGeo] = useState({ lat: null, lon: null, denied: false });
  const [nextEvent, setNextEvent] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [wateringPlant, setWateringPlant] = useState(null);

  const didMarkThisSession = useRef(false);

  const WATERING_TIMES = ['06:30', '12:30', '18:30'];

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  // Periodic soil moisture update
  useEffect(() => {
    if (!farmId || !token) return;
    let intervalId;
    let stop = false;

    async function updateMoisture() {
      let lat = geo.lat, lon = geo.lon;
      if (!lat || !lon) {
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              pos => { lat = pos.coords.latitude; lon = pos.coords.longitude; resolve(); },
              err => reject(err)
            );
          });
        } catch { return; }
      }

      let tempC = 25;
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const r = await fetch(url);
        const data = await r.json();
        tempC = data?.current_weather?.temperature ?? 25;
      } catch {}

      let latestPlants = [];
      try {
        const res = await axios.get(`${farmApiBase}/${farmId}/plants`, { headers: { Authorization: `Bearer ${token}` } });
        latestPlants = res.data || [];
      } catch { return; }

      const newPlants = await Promise.all(latestPlants.map(async p => {
        let moisture = typeof p.soilMoisture === 'number' ? p.soilMoisture : 80;
        let loss = 1 + Math.max(0, tempC - 20) * 0.5 - Math.max(0, 20 - tempC) * 0.3;
        moisture = Math.max(0, Math.min(100, moisture - loss));
        try {
          await axios.post(`${farmApiBase}/${farmId}/plants/${p.id}/water?liters=0`, { soilMoisture: moisture }, { headers: { Authorization: `Bearer ${token}` } });
          try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
        } catch {}
        return { ...p, soilMoisture: moisture };
      }));
      if (!stop) setPlants(newPlants);
    }

    updateMoisture();
    intervalId = setInterval(updateMoisture, 10 * 60 * 1000);
    return () => { stop = true; clearInterval(intervalId); };
  }, [farmId, token, geo.lat, geo.lon]);

  // Resolve token & farm
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { setError('Not authenticated'); setLoading(false); return; }
    setToken(t);

    const attemptResolve = async () => {
      setLoading(true); setError('');
      let uid = null;
      try {
        const r = await axios.get('http://localhost:8080/auth/user', { headers: { Authorization: `Bearer ${t}` } });
        uid = r.data?.id || r.data?.userId || r.data?._id || r.data?.sub || r.data?.uid;
      } catch {}
      if (!uid) {
        const decoded = safeDecode(t) || {};
        uid = decoded.id || decoded.userId || decoded._id || decoded.sub || decoded.uid;
      }
      let fid = localStorage.getItem('farmId');
      if (!uid && !fid) { setError('Cannot resolve user. Please re-login.'); setLoading(false); return; }
      if (uid) setUserId(uid);
      if (!fid && uid) {
        try {
          const fr = await axios.get(`${farmApiBase}/user/${uid}`, { headers: { Authorization: `Bearer ${t}` } });
          fid = fr.data?.id;
          if (fid) localStorage.setItem('farmId', fid);
        } catch { setError('Farm not found for this user'); setLoading(false); return; }
      }
      if (!fid) { setError('No farm associated. Create a farm first.'); setLoading(false); return; }
      setFarmId(fid);
      setLoading(false);
    };
    attemptResolve();
  }, []);

  // Fetch core data
  useEffect(() => {
    if (!farmId || !token) return;
    let cancelled = false;

    (async () => {
      setRefreshing(true);
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [plantsRes, todayPlantRes, tankRes, suggestRes, rainRes, usageRes] = await Promise.all([
          axios.get(`${farmApiBase}/${farmId}/plants`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${farmApiBase}/${farmId}/plants/today-schedule`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${farmApiBase}/${farmId}/tank-level`, { headers }).catch(() => ({ data: null })),
          axios.get(`${farmApiBase}/${farmId}/ai-suggestion`, { headers }).catch(() => ({ data: null })),
          axios.get(`${farmApiBase}/${farmId}/rain-forecast`, { headers }).catch(() => ({ data: null })),
          axios.get(`${farmApiBase}/${farmId}/water-usage`, { headers }).catch(() => ({ data: null })),
        ]);
        if (cancelled) return;

        const pl = plantsRes.data || [];
        setPlants(pl);
        setTankLevel(tankRes.data?.level ?? null);
        setLowTank(Boolean(tankRes.data?.low));
        setRainForecast(prev => prev || Boolean(rainRes.data?.rain));
        setAiSuggestion(suggestRes.data && Object.keys(suggestRes.data).length ? suggestRes.data : null);
        setTotalWaterUsed(usageRes.data?.total ?? 0);

        // Build schedule
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const events = [];
        WATERING_TIMES.forEach(t => events.push({ time: t, type: 'watering', label: 'Water plants' }));

        const dateMatches = (raw) => {
          if (!raw) return false;
          const m = String(raw).trim().match(/\d{4}-\d{2}-\d{2}/);
          return m ? m[0] === todayStr : false;
        };

        pl.forEach(p => {
          if (dateMatches(p.nextTreatment)) events.push({ time: '09:00', type: 'treatment', label: `Treatment: ${p.name}` });
          if (dateMatches(p.expectedHarvestDate)) events.push({ time: '05:00', type: 'harvest', label: `Harvest: ${p.name}` });
        });

        (todayPlantRes.data || []).forEach(p => {
          if (!events.some(e => e.type === 'treatment' && e.label.endsWith(p.name)) && p.nextTreatment)
            events.push({ time: '09:05', type: 'treatment', label: `Treatment: ${p.name}` });
          if (!events.some(e => e.type === 'harvest' && e.label.endsWith(p.name)) && p.expectedHarvestDate)
            events.push({ time: '05:05', type: 'harvest', label: `Harvest: ${p.name}` });
        });

        events.sort((a, b) => a.time.localeCompare(b.time));
        setSchedule(events);

        // Auto-mark past watering
        setTimeout(() => {
          if (didMarkThisSession.current) return;
          const now = new Date();
          const pastWatering = events
            .filter(ev => ev.type === 'watering')
            .map(ev => ({ ev, datetime: new Date(isoFromTime(ev.time)) }))
            .filter(({ datetime }) => datetime <= now)
            .sort((a, b) => b.datetime - a.datetime)[0];

          if (pastWatering && !events.some(ev => ev.type === 'watering' && ev.time === pastWatering.ev.time && ev.done)) {
            setSchedule(prev => prev.map(ev =>
              ev.type === 'watering' && ev.time === pastWatering.ev.time
                ? { ...ev, done: true, doneAt: new Date().toISOString() }
                : ev
            ));
            didMarkThisSession.current = true;
          }
        }, 1000);

        // Next watering
        const now = new Date();
        const nextW = WATERING_TIMES.map(t => isoFromTime(t)).find(iso => new Date(iso) > now) || isoFromTime(WATERING_TIMES[0]);
        setNextWatering(nextW);
        const nextEvt = events.find(ev => new Date(isoFromTime(ev.time)) > now);
        setNextEvent(nextEvt ? `${nextEvt.label} at ${nextEvt.time}` : 'All Done');
        setError('');
      } catch { setError('Failed to load data'); }
      setRefreshing(false);
    })();
    return () => { cancelled = true; };
  }, [farmId, token]);

  // Geolocation rain
  useEffect(() => {
    if (rainForecast) return;
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;
      setGeo({ lat: latitude, lon: longitude, denied: false });
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
        const r = await fetch(url);
        const data = await r.json();
        const probs = data?.hourly?.precipitation_probability || [];
        if (probs.slice(0, 6).some(p => p >= 50)) setRainForecast(true);
      } catch {}
    }, () => setGeo(g => ({ ...g, denied: true })));
  }, [rainForecast]);

  const handleRefill = async (amount) => {
    if (!farmId || !token) return;
    try {
      const r = await axios.post(`${farmApiBase}/${farmId}/tank/refill?amount=${amount}`, null, { headers: { Authorization: `Bearer ${token}` } });
      if (r.data?.level != null) setTankLevel(r.data.level);
      setLowTank(false);
      showToast(`Tank refilled by ${amount} L`, 'success');
      try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
    } catch { showToast('Refill failed', 'error'); }
  };

  const handleWaterPlant = async (plantId, liters = 5) => {
    if (!farmId || !token) return;
    setWateringPlant(plantId);
    try {
      const r = await axios.post(
        `${farmApiBase}/${farmId}/plants/${plantId}/water?liters=${liters}`, {},
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setPlants(prev => prev.map(p => p.id === plantId ? { ...p, ...r.data } : p));
      setTankLevel(l => l != null ? Math.max(0, l - liters) : l);
      setTotalWaterUsed(u => u + liters);
      const plant = plants.find(p => p.id === plantId);
      showToast(`${plant?.name || 'Plant'} watered with ${liters}L`, 'success');
      try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
    } catch { showToast('Watering failed', 'error'); }
    setWateringPlant(null);
  };

  const handleWaterAllPlants = async (totalLiters) => {
    if (!farmId || !token || !plants.length) return;
    const usable = tankLevel != null ? Math.min(tankLevel, totalLiters) : totalLiters;
    if (usable <= 0) return;
    const basePer = Math.floor(usable / plants.length);
    let remainder = usable - basePer * plants.length;

    for (const p of plants) {
      const give = basePer + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      try {
        await axios.post(`${farmApiBase}/${farmId}/plants/${p.id}/water?liters=${give}`, {},
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      } catch {}
    }
    setPlants(prev => prev.map(pl => ({
      ...pl,
      soilMoisture: Math.min(100, (pl.soilMoisture || 50) + 15),
      lastWatered: new Date().toISOString()
    })));
    setTankLevel(l => l != null ? Math.max(0, l - usable) : l);
    setTotalWaterUsed(u => u + usable);
    showToast(`Distributed ${usable}L across ${plants.length} plants`, 'success');
    try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
  };

  /* ── Computed ── */
  const dryPlants = plants.filter(p => (p.soilMoisture ?? 0) < 40);
  const avgMoisture = plants.length
    ? Math.round(plants.reduce((s, p) => s + (p.soilMoisture ?? 0), 0) / plants.length)
    : 0;
  const nextHarvest = plants.map(p => p.expectedHarvestDate).filter(Boolean).sort()[0] || null;
  const tankPct = tankLevel != null ? Math.min(100, Math.max(0, (tankLevel / Math.max(1, tankLevel + 100)) * 100)) : 0;

  /* ── Render ── */
  if (loading) return <LoadingState />;

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-cyan-50/40 to-green-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-medium
            hover:shadow-lg hover:shadow-blue-200 transition-all duration-300">
          Try Again
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-cyan-50/30 to-green-50 p-4 md:p-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* ── Header ── */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <MdWaterDrop className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Watering & Care</h1>
              <p className="text-sm text-gray-500">Monitor soil moisture and manage irrigation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dryPlants.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-medium animate-pulse">
                <FaExclamationTriangle className="text-xs" />
                {dryPlants.length} need water
              </div>
            )}
            {rainForecast && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 px-4 py-2 rounded-xl text-sm font-medium">
                <FaCloudRain className="text-xs" />
                Rain expected
              </div>
            )}
            <button
              onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 400); }}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg px-4 py-2.5 rounded-xl text-sm font-medium
                text-gray-700 hover:text-blue-600 transition-all duration-300 border border-gray-100 hover:border-blue-200 disabled:opacity-50"
            >
              <FaSync className={`text-xs ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          <StatCard
            icon={<FaClock className="text-blue-600 text-sm" />}
            iconBg="bg-blue-100"
            title="Next Watering"
            value={nextWatering ? fmt(nextWatering) : '—'}
          />
          <StatCard
            icon={<MdSchedule className="text-amber-600" />}
            iconBg="bg-amber-100"
            title="Next Event"
            value={nextEvent ? nextEvent.split(' at ')[1] || '—' : '—'}
            sub={nextEvent?.split(' at ')[0]}
          />
          <StatCard
            icon={<FaTint className="text-indigo-600 text-sm" />}
            iconBg="bg-indigo-100"
            title="Water Used"
            value={`${totalWaterUsed} L`}
            sub="Today's usage"
          />
          <StatCard
            icon={<FaWater className="text-cyan-600 text-sm" />}
            iconBg="bg-cyan-100"
            title="Tank Level"
            value={tankLevel != null ? `${tankLevel} L` : '—'}
            accent={lowTank ? 'text-red-600' : ''}
          />
          <StatCard
            icon={<FaCloudRain className="text-blue-500 text-sm" />}
            iconBg="bg-blue-100"
            title="Rain Forecast"
            value={rainForecast ? 'Likely' : 'No'}
            sub={rainForecast ? 'Save water today' : 'Irrigation needed'}
          />
          <StatCard
            icon={<FaLeaf className="text-emerald-600 text-sm" />}
            iconBg="bg-emerald-100"
            title="Next Harvest"
            value={nextHarvest ? nextHarvest.slice(5) : '—'}
          />
        </div>

        {/* ── Low Tank Alert ── */}
        {lowTank && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <FaExclamationTriangle className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Low Water Tank</p>
              <p className="text-xs text-red-600">Tank level is critically low. Refill to continue watering operations.</p>
            </div>
          </motion.div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Schedule */}
          <div className="xl:col-span-4">
            <SectionCard
              icon={<FaClock className="text-blue-500 text-sm" />}
              iconBg="bg-blue-100"
              title="Today's Schedule"
              subtitle={`${schedule.length} events planned`}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
                <ScheduleTimeline schedule={schedule} />
              </div>
            </SectionCard>
          </div>

          {/* Plant Moisture */}
          <div className="xl:col-span-5">
            <SectionCard
              icon={<MdLocalFlorist className="text-emerald-500" />}
              iconBg="bg-emerald-100"
              title="Plant Moisture"
              subtitle={`Avg. moisture: ${avgMoisture}%`}
              headerAction={
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  avgMoisture < 40 ? 'bg-red-100 text-red-700' : avgMoisture < 60 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {plants.length} plants
                </span>
              }
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
                {plants.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plants.map(p => (
                      <PlantCard
                        key={p.id}
                        plant={p}
                        onWater={handleWaterPlant}
                        tankEmpty={tankLevel === 0}
                        isWatering={wateringPlant === p.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <FaSeedling className="text-4xl text-gray-300 mb-3" />
                    <p className="text-sm font-medium">No plants found</p>
                    <p className="text-xs">Add plants to your farm to track moisture</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-3 flex flex-col gap-5">

            {/* Tank Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <FaWater className="text-cyan-600 text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Water Tank</h3>
                  <p className="text-[11px] text-gray-400">Current water supply</p>
                </div>
              </div>
              <div className="p-5">
                {/* Tank Visual */}
                <div className="relative bg-gradient-to-b from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 h-28 mb-4 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${tankPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`absolute bottom-0 left-0 right-0 rounded-b-lg ${
                      lowTank ? 'bg-gradient-to-t from-red-400 to-red-300' : 'bg-gradient-to-t from-cyan-500 to-cyan-300'
                    }`}
                  >
                    <div className="absolute inset-0 opacity-30"
                      style={{ animation: 'liquid-wave 3s ease-in-out infinite' }} />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${lowTank ? 'text-red-700' : 'text-cyan-700'}`}>
                        {tankLevel != null ? `${tankLevel}` : '—'}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">Liters</p>
                    </div>
                  </div>
                  {lowTank && (
                    <div className="absolute top-2 right-2">
                      <FaExclamationTriangle className="text-red-500 text-sm animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Refill Form */}
                <RefillForm onRefill={handleRefill} loading={refreshing} />
              </div>
            </div>

            {/* AI Suggestion */}
            <SectionCard
              icon={<MdAutoAwesome className="text-purple-500" />}
              iconBg="bg-purple-100"
              title="AI Suggestion"
              subtitle="Smart watering advice"
            >
              {aiSuggestion ? (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Water <strong className="text-purple-700">{aiSuggestion.plant}</strong> now
                    (soil at <span className="font-semibold text-amber-600">{aiSuggestion.soilMoisture}%</span>).
                    Suggest <span className="font-bold text-blue-600">{aiSuggestion.suggested} L</span>.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-gray-400">
                  <MdAutoAwesome className="text-2xl text-gray-300 mb-2" />
                  <p className="text-xs">No suggestion available</p>
                </div>
              )}
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard
              icon={<MdTipsAndUpdates className="text-amber-500" />}
              iconBg="bg-amber-100"
              title="Quick Actions"
              subtitle="Water all plants at once"
            >
              <WaterAllForm onWaterAll={handleWaterAllPlants} disabled={!plants.length || tankLevel === 0} />
              <div className="mt-4 space-y-2.5">
                <div className="flex items-start gap-2.5 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <FaSun className="text-amber-400 text-xs mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 leading-relaxed">Water early morning to reduce evaporation.</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <FaCloudRain className="text-blue-400 text-xs mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Rain: {rainForecast ? 'Likely soon — consider reducing irrigation.' : 'Low probability next hours.'}
                  </p>
                </div>
                {geo.denied && (
                  <div className="flex items-start gap-2.5 p-2.5 bg-red-50 rounded-lg border border-red-100">
                    <FaExclamationTriangle className="text-red-400 text-xs mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-red-600">Location denied — using backend weather only.</p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200"
            >
              <h3 className="text-sm font-bold mb-3 opacity-90">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Water Used</span>
                  <span className="text-lg font-bold">{totalWaterUsed} L</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Avg. Moisture</span>
                  <span className="text-lg font-bold">{avgMoisture}%</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Need Water</span>
                  <span className={`text-lg font-bold ${dryPlants.length > 0 ? 'text-amber-200' : ''}`}>
                    {dryPlants.length}
                  </span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Events Done</span>
                  <span className="text-lg font-bold">
                    {schedule.filter(s => s.done).length}/{schedule.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen(!chatbotOpen)}
        context="watering_management"
        pageData={{
          plants, totalPlants: plants.length,
          moistureStats: {
            dry: plants.filter(p => (p.soilMoisture || 0) < 40).length,
            moderate: plants.filter(p => (p.soilMoisture || 0) >= 40 && (p.soilMoisture || 0) < 60).length,
            moist: plants.filter(p => (p.soilMoisture || 0) >= 60).length,
          },
          wateringSchedule: schedule, nextWatering, tankLevel, lowTank,
          totalWaterUsed, rainForecast, aiSuggestion, nextEvent, farmId,
        }}
      />

      {/* Keyframe styles */}
      <style>{`
        @keyframes liquid-wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50%      { transform: translateX(-5%) scaleY(1.03); }
        }
      `}</style>
    </div>
  );
}

/* ═══════ Sub-Components ═══════ */

function RefillForm({ onRefill, loading }) {
  const [amount, setAmount] = useState('50');
  const [isRefilling, setIsRefilling] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (amt <= 0) return;
    setIsRefilling(true);
    await onRefill(amt);
    setIsRefilling(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <FaTint className="text-cyan-500" size={10} /> Refill Tank
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-300 focus:bg-white transition"
          placeholder="Amount (L)"
        />
        <button
          type="submit"
          disabled={loading || isRefilling}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold
            hover:shadow-md hover:shadow-cyan-200 transition-all duration-300 active:scale-[0.97]
            disabled:opacity-50 flex items-center gap-1.5"
        >
          {isRefilling ? <FaSync className="animate-spin" size={10} /> : <FaPlus size={10} />}
          Refill
        </button>
      </div>
    </form>
  );
}

function WaterAllForm({ onWaterAll, disabled }) {
  const [total, setTotal] = useState('20');
  const [isWatering, setIsWatering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = parseInt(total) || 0;
    if (t <= 0) return;
    setIsWatering(true);
    await onWaterAll(t);
    setIsWatering(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <MdOpacity className="text-blue-500" /> Total Liters to Distribute
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition"
          value={total}
          onChange={e => setTotal(e.target.value)}
          placeholder="Total (L)"
        />
        <button
          type="submit"
          disabled={disabled || isWatering}
          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold
            hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 active:scale-[0.97]
            disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isWatering ? (
            <><FaSync className="animate-spin" size={10} /> Watering...</>
          ) : (
            <><FaTint size={10} /> Water All</>
          )}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">
        Water will be distributed evenly across all plants based on available tank level.
      </p>
    </form>
  );
}
