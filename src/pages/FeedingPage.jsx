import API_BASE from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  FaDrumstickBite, FaSync, FaExclamationTriangle, FaCalendarAlt,
  FaSyringe, FaClock, FaDog, FaCheckCircle, FaTimes, FaPlus,
  FaUtensils, FaInfoCircle, FaBell, FaChevronRight
} from 'react-icons/fa';
import { GiCow, GiChicken, GiSheep, GiWaterDrop } from 'react-icons/gi';
import { MdPets, MdSchedule, MdLocalDining } from 'react-icons/md';

const farmApiBase = 'http://localhost:8080/api/farms';

/* ──────── Helpers ──────── */
function fmt(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function isoFromTime(t) {
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), +m[1], +m[2]).toISOString();
}

function normalizeFullnessValue(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(raw);
  if (Number.isNaN(n)) return null;
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.min(100, Math.max(0, Math.round(n)));
}

function getFullnessPct(a) {
  const dbFull = normalizeFullnessValue(a?.fullness);
  if (dbFull !== null) return dbFull;
  try {
    const intake = Number(a?.todayIntakeLiters) || 0;
    const rec = Number(a?.recommendedIntakeLiters) ||
      ((a?.species && { cow: 25, dog: 1.5, sheep: 4, chicken: 0.2 }[a.species.toLowerCase()]) || 1);
    if (rec <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((intake / rec) * 100)));
  } catch { return 0; }
}

function getSpeciesIcon(species, size = 'text-xl') {
  switch ((species || '').toLowerCase()) {
    case 'cow': return <GiCow className={`${size} text-amber-600`} />;
    case 'dog': return <FaDog className={`${size} text-indigo-500`} />;
    case 'chicken': return <GiChicken className={`${size} text-rose-500`} />;
    case 'sheep': return <GiSheep className={`${size} text-emerald-600`} />;
    default: return <MdPets className={`${size} text-gray-400`} />;
  }
}

function getSpeciesColor(species) {
  switch ((species || '').toLowerCase()) {
    case 'cow': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'from-amber-400 to-amber-600', ring: 'ring-amber-200' };
    case 'dog': return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', bar: 'from-indigo-400 to-indigo-600', ring: 'ring-indigo-200' };
    case 'chicken': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', bar: 'from-rose-400 to-rose-600', ring: 'ring-rose-200' };
    case 'sheep': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-200' };
    default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', bar: 'from-gray-400 to-gray-600', ring: 'ring-gray-200' };
  }
}

/* ──────── Toast Notification ──────── */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-amber-500',
  };

  return (
    <div className={`fixed top-6 right-6 z-50 ${styles[type] || styles.info} text-white px-5 py-3 rounded-xl shadow-2xl
      flex items-center gap-3 animate-slide-in-right min-w-[280px] max-w-md`}>
      <div className="flex-shrink-0">
        {type === 'success' && <FaCheckCircle className="text-lg" />}
        {type === 'error' && <FaExclamationTriangle className="text-lg" />}
        {type === 'info' && <FaInfoCircle className="text-lg" />}
        {type === 'warning' && <FaBell className="text-lg" />}
      </div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition">
        <FaTimes className="text-xs" />
      </button>
    </div>
  );
}

/* ──────── Loading Skeleton ──────── */
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded ${className}`} />;
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Skeleton className="xl:col-span-4 h-96 rounded-xl" />
          <Skeleton className="xl:col-span-5 h-96 rounded-xl" />
          <Skeleton className="xl:col-span-3 h-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ──────── Main Component ──────── */
export default function FeedingPage() {
  const [token, setToken] = useState(null);
  const [farmId, setFarmId] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [nextFeeding, setNextFeeding] = useState(null);
  const [totalIntake, setTotalIntake] = useState(0);
  const [cowTank, setCowTank] = useState({ level: 0, low: false });
  const [dogTank, setDogTank] = useState({ level: 0, low: false });
  const [chickenTank, setChickenTank] = useState({ level: 0, low: false });
  const [sheepTank, setSheepTank] = useState({ level: 0, low: false });
  const [usageTotals, setUsageTotals] = useState({ cow: 0, dog: 0, chicken: 0, sheep: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [feedingAnimal, setFeedingAnimal] = useState(null);

  const didMarkThisSession = useRef(false);

  const FEEDING_TIMES = ['07:00', '12:00', '18:00'];
  const DEFAULT_INTAKE = { cow: 25, dog: 10.5, sheep: 14, chicken: 5.2 };

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  function getRecommended(a) {
    const species = (a?.species || '').toLowerCase();
    return Number(a?.recommendedIntakeLiters) || DEFAULT_INTAKE[species] || 1;
  }
  function getCurrent(a) { return Number(a?.todayIntakeLiters) || 0; }
  function hoursSinceLastIntake(a) {
    try {
      const t = a?.intakeUpdatedAt;
      if (!t) return 24;
      const h = (Date.now() - new Date(t).getTime()) / 36e5;
      return isFinite(h) ? h : 24;
    } catch { return 24; }
  }
  function hungerMultiplier(a) {
    const rec = getRecommended(a);
    const cur = getCurrent(a);
    if (rec <= 0) return 1;
    const hungerRemaining = Math.max(0, 1 - (cur / rec));
    const hours = hoursSinceLastIntake(a);
    let timeBonus = hours > 12 ? 0.5 : hours > 6 ? 0.2 : 0;
    return Math.min(2, 1 + hungerRemaining * 0.8 + timeBonus);
  }

  function canFeedAnimal(animal) {
    const species = (animal?.species || '').toLowerCase();
    const requiredAmount = getRecommended(animal);
    const tanks = { cow: cowTank, dog: dogTank, chicken: chickenTank, sheep: sheepTank };
    return (tanks[species]?.level ?? 0) >= requiredAmount;
  }

  function getTankForSpecies(species) {
    switch ((species || '').toLowerCase()) {
      case 'cow': return cowTank;
      case 'dog': return dogTank;
      case 'chicken': return chickenTank;
      case 'sheep': return sheepTank;
      default: return { level: 0, low: false };
    }
  }

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { setError('Not authenticated'); setLoading(false); return; }
    setToken(t);
    const fid = localStorage.getItem('farmId');
    if (!fid) { setError('No farm selected'); setLoading(false); return; }
    setFarmId(fid);
  }, []);

  /* ── fetch core ── */
  const fetchCore = async () => {
    if (!farmId || !token) return;
    setRefreshing(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [animalsRes, todayRes, intakeRes] = await Promise.all([
        axios.get(`${farmApiBase}/${farmId}/animals`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${farmApiBase}/${farmId}/animals/today-schedule`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${farmApiBase}/${farmId}/today-intake`, { headers }).catch(() => ({ data: { intake: 0 } })),
      ]);

      const serverAnimals = (animalsRes.data || []).map(sa => ({
        ...sa,
        todayIntakeLiters: Number(sa.todayIntakeLiters) || 0,
        recommendedIntakeLiters: sa.recommendedIntakeLiters == null ? undefined : Number(sa.recommendedIntakeLiters),
        fullness: normalizeFullnessValue(sa.fullness),
      }));

      setAnimals(prev => {
        return serverAnimals.map(sa => {
          const local = (prev || []).find(p => p.id === sa.id);
          if (local && (Number(local.todayIntakeLiters) || 0) > (Number(sa.todayIntakeLiters) || 0)) {
            return { ...sa, ...local, todayIntakeLiters: Number(local.todayIntakeLiters) || sa.todayIntakeLiters, fullness: sa.fullness ?? local.fullness };
          }
          return sa;
        });
      });

      setTotalIntake(intakeRes.data?.intake ?? 0);

      const events = [];
      FEEDING_TIMES.forEach(t => events.push({ time: t, type: 'feeding', label: 'Feed animals' }));
      (todayRes.data || []).forEach(a => {
        if (a.nextVisit) events.push({ time: '09:00', type: 'vet', label: `Vet: ${a.name}` });
        if (a.vaccinationDate) events.push({ time: '10:00', type: 'vaccination', label: `Vaccination: ${a.name}` });
      });
      events.sort((a, b) => a.time.localeCompare(b.time));
      setSchedule(events);

      const now = new Date();
      const nextF = FEEDING_TIMES.map(t => isoFromTime(t)).find(iso => new Date(iso) > now) || isoFromTime(FEEDING_TIMES[0]);
      setNextFeeding(nextF);

      setError('');
      await fetchTanks(headers);
    } catch (e) {
      console.error('[Feeding] fetchCore failed', e);
      setError('Failed to load feeding data');
    }
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => { if (farmId && token) fetchCore(); }, [farmId, token]);

  /* ── tanks ── */
  const fetchTanks = async (headers) => {
    if (!farmId) return;
    try {
      const [cowRes, dogRes, chickenRes, sheepRes, cowUsage, dogUsage, chickenUsage, sheepUsage] = await Promise.all([
        axios.get(`${farmApiBase}/${farmId}/cow-tank-level`, { headers }).catch(() => ({ data: { level: 0, low: false } })),
        axios.get(`${farmApiBase}/${farmId}/dog-tank-level`, { headers }).catch(() => ({ data: { level: 0, low: false } })),
        axios.get(`${farmApiBase}/${farmId}/chicken-tank-level`, { headers }).catch(() => ({ data: { level: 0, low: false } })),
        axios.get(`${farmApiBase}/${farmId}/sheep-tank-level`, { headers }).catch(() => ({ data: { level: 0, low: false } })),
        axios.get(`${farmApiBase}/${farmId}/cow-tank/usage-total`, { headers }).catch(() => ({ data: { total: 0 } })),
        axios.get(`${farmApiBase}/${farmId}/dog-tank/usage-total`, { headers }).catch(() => ({ data: { total: 0 } })),
        axios.get(`${farmApiBase}/${farmId}/chicken-tank/usage-total`, { headers }).catch(() => ({ data: { total: 0 } })),
        axios.get(`${farmApiBase}/${farmId}/sheep-tank/usage-total`, { headers }).catch(() => ({ data: { total: 0 } })),
      ]);
      setCowTank(cowRes.data || { level: 0, low: false });
      setDogTank(dogRes.data || { level: 0, low: false });
      setChickenTank(chickenRes.data || { level: 0, low: false });
      setSheepTank(sheepRes.data || { level: 0, low: false });
      setUsageTotals({
        cow: cowUsage.data?.total ?? 0,
        dog: dogUsage.data?.total ?? 0,
        chicken: chickenUsage.data?.total ?? 0,
        sheep: sheepUsage.data?.total ?? 0,
      });
    } catch (e) { console.error('[Feeding] fetchTanks failed', e); }
  };

  /* ── fullness decay ── */
  useEffect(() => {
    if (!farmId || !token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const tick = async () => {
      try {
        const res = await axios.get(`${farmApiBase}/${farmId}/animals`, { headers });
        for (const animal of (res.data || [])) {
          try {
            await axios.post(`${farmApiBase}/animals/${animal.id}/decrease-fullness`, {}, { headers });
          } catch { /* silent */ }
        }
        const refreshed = await axios.get(`${farmApiBase}/${farmId}/animals`, { headers });
        setAnimals(refreshed.data || []);
      } catch { /* silent */ }
    };
    tick();
    const id = setInterval(tick, 36000);
    return () => clearInterval(id);
  }, [farmId, token]);

  /* ── refill ── */
  const handleRefill = async (species, amount) => {
    if (!farmId || !token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.post(`${farmApiBase}/${farmId}/${species}-tank/refill?amount=${amount}`, {}, { headers });
      await fetchTanks(headers);
      showToast(`${species.charAt(0).toUpperCase() + species.slice(1)} tank refilled by ${amount} L`, 'success');
    } catch { showToast('Refill failed', 'error'); }
  };

  /* ── feed raw ── */
  const handleFeedRaw = async (animalId, liters = 1) => {
    if (!farmId || !token) return null;
    try {
      const speciesRes = await axios.get(`http://localhost:8080/api/animals/${animalId}/species`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const species = speciesRes.data;
      const url = `${farmApiBase}/${farmId}/animals/${animalId}/feed?liters=${liters}`;
      const r = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const farm = r.data;

      if (species) {
        const speciesLower = species.toLowerCase();
        const consumeMap = { dog: 60, cow: 25, sheep: 14, chicken: 5.2 };
        const consumeAmount = consumeMap[speciesLower] || liters;
        try {
          await axios.post(`${farmApiBase}/${farmId}/${speciesLower}-tank/refill?amount=${-consumeAmount}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await fetchTanks({ Authorization: `Bearer ${token}` });
        } catch { /* silent */ }
      }

      if (farm) {
        if (farm.animals) applyFarmData(farm);
        else await fetchCore();
      }
      return farm;
    } catch (e) { console.error('[Feeding] Feed failed', e); showToast('Feeding failed', 'error'); return null; }
  };

  /* ── feed all ── */
  const handleFeedAll = async (totalLiters) => {
    if (!farmId || !token || !animals.length) return;
    const total = Number(totalLiters) || 0;
    if (total <= 0) return;
    const count = animals.length;
    const basePer = total / count;
    const posts = [];
    for (const a of animals) {
      const rec = getRecommended(a);
      const cur = getCurrent(a);
      const remaining = Math.max(0, rec - cur);
      if (remaining <= 0) continue;
      const amount = Math.round(Math.min(remaining, basePer * hungerMultiplier(a)) * 10) / 10;
      if (amount > 0) posts.push({ id: a.id, amount });
    }
    try {
      for (const p of posts) await handleFeedRaw(p.id, p.amount);
      await fetchCore();
      const totalDistributed = Math.round(posts.reduce((s, p) => s + p.amount, 0) * 10) / 10;
      setTotalIntake(t => t + totalDistributed);
      showToast(`Distributed ${totalDistributed} L across ${posts.length} animals`, 'success');
    } catch { showToast('Feed all failed', 'error'); }
  };

  /* ── applyFarmData ── */
  const applyFarmData = (farmData) => {
    if (!farmData) return;
    if (Array.isArray(farmData.animals)) {
      setAnimals(farmData.animals.map(sa => ({
        ...sa,
        todayIntakeLiters: Number(sa.todayIntakeLiters) || 0,
        recommendedIntakeLiters: sa.recommendedIntakeLiters == null ? undefined : Number(sa.recommendedIntakeLiters),
        fullness: normalizeFullnessValue(sa.fullness),
      })));
    }
    try {
      const tankMap = { cowFoodTank: setCowTank, dogFoodTank: setDogTank, chickenFoodTank: setChickenTank, sheepFoodTank: setSheepTank };
      const thresholds = { cowFoodTank: 50, dogFoodTank: 20, chickenFoodTank: 20, sheepFoodTank: 50 };
      Object.entries(tankMap).forEach(([key, setter]) => {
        if (farmData[key]) {
          const lvl = Number(farmData[key].quantity || farmData[key].level || 0);
          setter({ level: lvl, low: lvl < thresholds[key] });
        }
      });
    } catch { /* silent */ }
  };

  /* ── admin set fullness ── */
  const adminSetFullness = async (animalOrId) => {
    if (!token) return;
    const id = typeof animalOrId === 'object' ? animalOrId.id : animalOrId;
    if (!id) return;
    setFeedingAnimal(id);
    try {
      await axios.get(`/api/animals/${id}/species`);
      await handleFeedRaw(id);
      await axios.post(`${farmApiBase}/animals/${id}/set-fullness`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setAnimals(prev => prev.map(a => a.id === id ? ({
        ...a,
        todayIntakeLiters: Number(a.recommendedIntakeLiters) || getRecommended(a),
        recommendedIntakeLiters: Number(a.recommendedIntakeLiters) || getRecommended(a),
        intakeUpdatedAt: new Date().toISOString(),
        fullness: 100,
      }) : a));
      await fetchCore();
      showToast('Animal fed to full!', 'success');
    } catch { showToast('Feeding failed', 'error'); }
    setFeedingAnimal(null);
  };

  /* ── auto-mark schedule ── */
  useEffect(() => {
    if (!schedule.length) return;
    const now = new Date();
    const feedEvents = schedule.filter(ev => ev.type === 'feeding' && FEEDING_TIMES.includes(ev.time));
    const candidates = feedEvents
      .map(ev => ({ ev, iso: isoFromTime(ev.time) }))
      .filter(x => x.iso && new Date(x.iso) <= now)
      .sort((a, b) => new Date(b.iso) - new Date(a.iso));
    if (!candidates.length) return;
    const latest = candidates[0];
    if (schedule.some(ev => ev.type === 'feeding' && ev.time === latest.ev.time && ev.done) || didMarkThisSession.current) return;
    setSchedule(prev => prev.map(ev =>
      ev.type === 'feeding' && ev.time === latest.ev.time ? { ...ev, done: true, doneAt: new Date().toISOString() } : ev
    ));
    didMarkThisSession.current = true;
  }, [schedule]);

  /* ── Computed ── */
  const hungryAnimals = animals.filter(a => getFullnessPct(a) < 40);
  const lowTanks = [
    { name: 'Cow', ...cowTank },
    { name: 'Dog', ...dogTank },
    { name: 'Chicken', ...chickenTank },
    { name: 'Sheep', ...sheepTank },
  ].filter(t => t.low);
  const averageFullness = animals.length
    ? Math.round(animals.reduce((s, a) => s + getFullnessPct(a), 0) / animals.length)
    : 0;

  /* ── Render ── */
  if (loading) return <LoadingState />;

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium
            hover:shadow-lg hover:shadow-green-200 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const nextEvent = schedule.find(ev => new Date(isoFromTime(ev.time)) > new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50/50 to-emerald-50 p-4 md:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}

      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* ── Header ── */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl
              flex items-center justify-center shadow-lg shadow-green-200">
              <FaDrumstickBite className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Feeding & Care</h1>
              <p className="text-sm text-gray-500">Monitor and manage animal nutrition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hungryAnimals.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-medium animate-pulse">
                <FaExclamationTriangle className="text-xs" />
                {hungryAnimals.length} hungry
              </div>
            )}
            <button
              onClick={fetchCore}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg px-4 py-2.5 rounded-xl
                text-sm font-medium text-gray-700 hover:text-green-600 transition-all duration-300
                border border-gray-100 hover:border-green-200 disabled:opacity-50"
            >
              <FaSync className={`text-xs ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* ── Overview Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 md:gap-4">
          <StatCard
            icon={<FaClock />}
            iconBg="bg-blue-100 text-blue-600"
            title="Next Feeding"
            value={nextFeeding ? fmt(nextFeeding) : '—'}
          />
          <StatCard
            icon={<MdSchedule />}
            iconBg="bg-amber-100 text-amber-600"
            title="Next Event"
            value={nextEvent ? nextEvent.time : '—'}
            sub={nextEvent?.label}
          />
          <StatCard
            icon={<MdPets />}
            iconBg="bg-cyan-100 text-cyan-600"
            title="Animals"
            value={animals.length}
          />
          <StatCard
            icon={<FaSyringe />}
            iconBg="bg-purple-100 text-purple-600"
            title="Vaccinations"
            value={schedule.filter(s => s.type === 'vaccination').length}
          />
          <TankMiniCard species="cow" tank={cowTank} />
          <TankMiniCard species="dog" tank={dogTank} />
          <TankMiniCard species="chicken" tank={chickenTank} />
          <TankMiniCard species="sheep" tank={sheepTank} />
        </div>

        {/* ── Alerts Banner ── */}
        {lowTanks.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Low Tank Alert</p>
              <p className="text-xs text-amber-600">
                {lowTanks.map(t => t.name).join(', ')} tank{lowTanks.length > 1 ? 's are' : ' is'} running low. Consider refilling soon.
              </p>
            </div>
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ── Schedule Timeline ── */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="p-5 pb-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-blue-500 text-sm" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">Today's Schedule</h2>
                    <p className="text-[11px] text-gray-400">{schedule.length} events planned</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 pt-3">
                {schedule.length ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-200 via-green-200 to-gray-100" />
                    <ul className="space-y-1">
                      {schedule.map((s, i) => {
                        const isDone = !!s.done;
                        const isPast = new Date(isoFromTime(s.time)) <= new Date();
                        const isCurrent = !isDone && isPast;
                        const typeStyles = {
                          feeding: { dot: isDone ? 'bg-green-500' : 'bg-blue-500', icon: <FaUtensils className="text-[8px] text-white" /> },
                          vet: { dot: 'bg-purple-500', icon: <FaPlus className="text-[8px] text-white" /> },
                          vaccination: { dot: 'bg-rose-500', icon: <FaSyringe className="text-[8px] text-white" /> },
                        };
                        const style = typeStyles[s.type] || typeStyles.feeding;

                        return (
                          <li key={i} className={`relative pl-12 py-3 rounded-xl transition-all duration-200
                            ${isCurrent ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
                          >
                            {/* Dot */}
                            <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full
                              ${style.dot} flex items-center justify-center shadow-sm
                              ${isCurrent ? 'ring-4 ring-blue-100 animate-pulse' : ''}
                              ${isDone ? 'ring-2 ring-green-100' : ''}`}
                            >
                              {isDone ? <FaCheckCircle className="text-[10px] text-white" /> : style.icon}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${isDone ? 'text-green-600' : isPast ? 'text-gray-600' : 'text-gray-800'}`}>
                                    {s.time}
                                  </span>
                                  <span className={`text-xs ${isDone ? 'text-green-600 line-through' : 'text-gray-700'} font-medium`}>
                                    {s.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{s.type}</span>
                                  {isDone && s.doneAt && (
                                    <span className="text-[10px] text-green-500 font-medium">
                                      ✓ {new Date(s.doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isDone && (
                                <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Done
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <MdSchedule className="text-4xl mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No events scheduled</p>
                    <p className="text-xs">Events will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Animal Intake Grid ── */}
          <div className="xl:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="p-5 pb-3 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MdLocalDining className="text-orange-500 text-lg" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-sm">Animal Nutrition</h2>
                      <p className="text-[11px] text-gray-400">
                        Avg. fullness: <span className={`font-bold ${averageFullness < 40 ? 'text-red-500' : averageFullness < 70 ? 'text-amber-500' : 'text-green-500'}`}>
                          {averageFullness}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg font-medium">
                    {animals.length} total
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {animals.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {animals.map(a => (
                      <AnimalCard
                        key={a.id}
                        animal={a}
                        onFeed={adminSetFullness}
                        canFeed={canFeedAnimal(a)}
                        isFeedingThis={feedingAnimal === a.id}
                        recommended={getRecommended(a)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <MdPets className="text-5xl mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No animals found</p>
                    <p className="text-xs">Add animals to your farm to track feeding</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Sidebar: Tanks + Feed All ── */}
          <div className="xl:col-span-3 flex flex-col gap-5">

            {/* Tanks */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 pb-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                    <GiWaterDrop className="text-amber-500 text-lg" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">Food Tanks</h2>
                    <p className="text-[11px] text-gray-400">Manage supply levels</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <TankCard species="cow" tank={cowTank} totalUsed={usageTotals.cow} onRefill={handleRefill} />
                <TankCard species="dog" tank={dogTank} totalUsed={usageTotals.dog} onRefill={handleRefill} />
                <TankCard species="chicken" tank={chickenTank} totalUsed={usageTotals.chicken} onRefill={handleRefill} />
                <TankCard species="sheep" tank={sheepTank} totalUsed={usageTotals.sheep} onRefill={handleRefill} />
              </div>
            </div>

            {/* Quick Feed All */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 pb-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaUtensils className="text-green-500 text-sm" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">Quick Actions</h2>
                    <p className="text-[11px] text-gray-400">Distribute food to all animals</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <FeedAllForm onFeedAll={handleFeedAll} />
              </div>
            </div>

            {/* Summary stats */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-200">
              <h3 className="text-sm font-bold mb-3 opacity-90">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Total Intake</span>
                  <span className="text-lg font-bold">{Math.round(totalIntake)} L</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Avg. Fullness</span>
                  <span className="text-lg font-bold">{averageFullness}%</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Hungry</span>
                  <span className={`text-lg font-bold ${hungryAnimals.length > 0 ? 'text-amber-200' : ''}`}>
                    {hungryAnimals.length}
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
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right .35s cubic-bezier(.22,1,.36,1) forwards; }

        @keyframes liquid-wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50%      { transform: translateX(-5%) scaleY(1.03); }
        }
        .animate-liquid { animation: liquid-wave 3s ease-in-out infinite; }

        @keyframes feed-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        .animate-feed-pulse { animation: feed-pulse .6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

/* ═══════════ Sub-Components ═══════════ */

function AnimalCard({ animal: a, onFeed, canFeed, isFeedingThis, recommended }) {
  const pct = getFullnessPct(a);
  const species = (a.species || '').toLowerCase();
  const colors = getSpeciesColor(species);
  const statusColor = pct < 30 ? 'text-red-500' : pct < 60 ? 'text-amber-500' : 'text-green-500';
  const barColor = pct < 30 ? 'from-red-400 to-red-500' : pct < 60 ? 'from-amber-400 to-amber-500' : 'from-green-400 to-green-500';
  const statusLabel = pct < 30 ? 'Hungry' : pct < 60 ? 'Moderate' : pct >= 90 ? 'Full' : 'Good';
  const statusBg = pct < 30 ? 'bg-red-50 text-red-600 border-red-100'
    : pct < 60 ? 'bg-amber-50 text-amber-600 border-amber-100'
    : 'bg-green-50 text-green-600 border-green-100';

  return (
    <div className={`group relative rounded-xl border ${colors.border} ${colors.bg} p-4
      transition-all duration-300 hover:shadow-md hover:shadow-gray-100 hover:-translate-y-0.5`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center
          border ${colors.border} transition-transform duration-200 group-hover:scale-110`}
        >
          {getSpeciesIcon(species, 'text-lg')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-800 truncate">{a.name || 'Unnamed'}</h3>
          <p className="text-[10px] text-gray-400 capitalize">{species || 'Unknown'}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${statusBg}`}>
          {statusLabel}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-gray-500 font-medium">Fullness</span>
          <span className={`text-xs font-bold ${statusColor}`}>{Math.min(100, pct)}%</span>
        </div>
        <div className="h-2.5 w-full bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700 ease-out relative`}
            style={{ width: `${Math.min(100, pct)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-liquid rounded-full" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-[10px] text-gray-400 mb-3">
        {a.intakeUpdatedAt
          ? `Last fed: ${new Date(a.intakeUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Not fed yet today'
        }
      </div>

      {/* Feed Button */}
      <button
        onClick={() => onFeed(a)}
        disabled={!canFeed || isFeedingThis}
        className={`w-full text-xs font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2
          ${canFeed && !isFeedingThis
            ? `bg-white border ${colors.border} ${colors.text} hover:shadow-sm active:scale-[0.98]`
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }
          ${isFeedingThis ? 'animate-feed-pulse' : ''}`
        }
        title={canFeed ? 'Feed to full' : `Need ${recommended}L in tank`}
      >
        {isFeedingThis ? (
          <>
            <FaSync className="animate-spin text-[10px]" /> Feeding...
          </>
        ) : (
          <>
            <FaDrumstickBite className="text-[10px]" /> Feed Now
          </>
        )}
      </button>
    </div>
  );
}

function TankCard({ species, tank, totalUsed, onRefill }) {
  const [amt, setAmt] = useState('10');
  const [isRefilling, setIsRefilling] = useState(false);
  const low = tank?.low;
  const level = tank?.level ?? 0;
  const colors = getSpeciesColor(species);
  const maxEstimate = Math.max(200, level + 100);
  const pct = Math.min(100, (level / maxEstimate) * 100);

  const doRefill = async () => {
    const a = parseFloat(amt) || 0;
    if (a <= 0) return;
    setIsRefilling(true);
    await onRefill(species, a);
    setIsRefilling(false);
  };

  return (
    <div className={`rounded-xl border ${low ? 'border-red-200 bg-red-50/30' : `${colors.border} ${colors.bg}`}
      p-3.5 transition-all duration-300 hover:shadow-sm`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
          {getSpeciesIcon(species, 'text-base')}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-gray-800 capitalize">{species}</span>
            <span className={`text-sm font-bold ${low ? 'text-red-500' : colors.text}`}>
              {Math.round(level)} L
            </span>
          </div>
        </div>
      </div>

      {/* Tank bar */}
      <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${low
            ? 'bg-gradient-to-r from-red-400 to-red-500'
            : `bg-gradient-to-r ${colors.bar}`
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] text-gray-500">
          Used today: <span className="font-semibold">{totalUsed} L</span>
        </span>
        {low && (
          <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse">
            <FaExclamationTriangle className="text-[8px]" /> Low
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min="0.1"
          step="0.1"
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 w-20 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all"
          value={amt}
          onChange={e => setAmt(e.target.value)}
        />
        <button
          onClick={doRefill}
          disabled={isRefilling}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs
            font-semibold hover:shadow-md hover:shadow-green-200 transition-all duration-300
            active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {isRefilling ? <FaSync className="animate-spin text-[10px]" /> : <FaPlus className="text-[10px]" />}
          Refill
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, title, value, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-3
        group-hover:scale-110 transition-transform duration-200`}
      >
        {React.cloneElement(icon, { className: 'text-sm' })}
      </div>
      <p className="text-[11px] text-gray-400 font-medium mb-0.5">{title}</p>
      <p className="text-lg font-bold text-gray-800 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

function TankMiniCard({ species, tank }) {
  const level = tank?.level ?? 0;
  const low = tank?.low;
  const colors = getSpeciesColor(species);

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${low ? 'border-red-200' : 'border-gray-100'}
      p-3.5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}
    >
      <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center
        border ${colors.border} group-hover:scale-110 transition-transform duration-200`}
      >
        {getSpeciesIcon(species, 'text-base')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 font-medium capitalize">{species} Tank</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm font-bold ${low ? 'text-red-500' : 'text-gray-800'}`}>
            {Math.round(level)} L
          </p>
          {low && <FaExclamationTriangle className="text-red-400 text-[10px] animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

function FeedAllForm({ onFeedAll }) {
  const [total, setTotal] = useState('5');
  const [isFeeding, setIsFeeding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = parseFloat(total) || 0;
    if (t <= 0) return;
    setIsFeeding(true);
    await onFeedAll(t);
    setIsFeeding(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
        <GiWaterDrop className="text-green-500" />
        Total Liters to Distribute
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          min="0.1"
          step="0.1"
          className="border border-gray-200 rounded-lg px-3 py-2 w-24 text-sm bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300
            focus:bg-white transition-all"
          value={total}
          onChange={e => setTotal(e.target.value)}
        />
        <button
          type="submit"
          disabled={isFeeding}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-lg
            text-sm font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all duration-300
            active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isFeeding ? (
            <>
              <FaSync className="animate-spin text-xs" /> Feeding...
            </>
          ) : (
            <>
              <FaDrumstickBite className="text-xs" /> Feed All
            </>
          )}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">
        Food will be distributed proportionally based on each animal's hunger level and species requirements.
      </p>
    </form>
  );
}

