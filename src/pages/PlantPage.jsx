import API_BASE from '../config';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { notifyFarmChange } from '../utils/notify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Plus, X, Edit2, Trash2, Search, CalendarClock, Flower2,
  Beaker, Eye, Activity, Droplets, HeartPulse, Syringe,
  RefreshCw, ChevronRight, Filter, CheckCircle, AlertTriangle,
  Sprout, TreePine, Sun, CloudRain, Thermometer, Clock, FileText, MapPin
} from 'lucide-react';
import AIChatbot from '../components/AIChatbot';

/* ═══════ Helpers ═══════ */
const farmApiBase = 'http://localhost:8080/api/farms';
const baseUrlLegacy = 'http://localhost:8080/api/plants';

const healthConfig = {
  healthy: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Healthy' },
  warning: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Warning' },
  sick: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200', label: 'Sick' },
};
const getHealthStyle = (s) => healthConfig[(s || '').toLowerCase()] || { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border-gray-200', label: s || 'Unknown' };

const growthProgress = (p) => {
  if (!p?.plantingDate || !p?.expectedHarvestDate) return 0;
  const s = new Date(p.plantingDate).getTime(), e = new Date(p.expectedHarvestDate).getTime(), n = Date.now();
  if (n <= s) return 0;
  if (n >= e) return 100;
  return Math.min(100, Math.max(0, ((n - s) / (e - s)) * 100));
};

/* ═══════ Toast ═══════ */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const styles = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600', warning: 'bg-amber-500' };
  const icons = { success: <CheckCircle size={16} />, error: <AlertTriangle size={16} />, info: <Leaf size={16} />, warning: <AlertTriangle size={16} /> };
  return (
    <motion.div initial={{ x: 140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 140, opacity: 0 }}
      className={`fixed top-6 right-6 z-[100] ${styles[type]} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><X size={14} /></button>
    </motion.div>
  );
}

/* ═══════ Skeletons ═══════ */
function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`} />; }
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
      </div>
    </div>
  );
}

/* ═══════ Stat Card ═══════ */
function StatCard({ icon, iconBg, title, value, subtitle, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>{icon}</div>
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

/* ═══════ Plant Card ═══════ */
function PlantCard({ plant, isSelected, onView, onEdit, onDelete, delay = 0 }) {
  const hs = getHealthStyle(plant.healthStatus);
  const progress = growthProgress(plant);
  const progressColor = progress < 30 ? 'from-yellow-400 to-amber-500' : progress < 70 ? 'from-green-400 to-emerald-500' : 'from-emerald-500 to-teal-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`group bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm
        hover:shadow-lg transition-all duration-300 cursor-pointer relative
        ${isSelected ? 'ring-2 ring-green-500 shadow-green-100' : 'border-gray-100 hover:-translate-y-1'}`}
      onClick={() => onView(plant)}
    >
      {/* Hero */}
      <div className="h-36 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white relative overflow-hidden">
        {plant.imageUrl ? (
          <img src={plant.imageUrl} alt={plant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Sprout size={36} className="opacity-80" />
            <span className="text-xs font-medium opacity-60">{plant.type || 'Plant'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Health badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-sm bg-white/90 ${hs.text} ${hs.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hs.dot}`} />
            {hs.label}
          </span>
        </div>

        {/* Growth bar overlay */}
        {(plant.plantingDate && plant.expectedHarvestDate) && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5">
            <div className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-700`} style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">{plant.name || 'Unnamed'}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{plant.type || 'Unknown type'}</p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {plant.quantityOrArea && (
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
              <MapPin size={11} className="text-gray-400" />
              <span className="truncate">{plant.quantityOrArea}</span>
            </div>
          )}
          {plant.expectedHarvestDate && (
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
              <CalendarClock size={11} className="text-gray-400" />
              <span>{new Date(plant.expectedHarvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {plant.nextTreatment && (
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 col-span-2">
              <Syringe size={11} className="text-gray-400" />
              <span className="truncate">{plant.nextTreatment}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {(plant.plantingDate && plant.expectedHarvestDate) && (
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-400 font-medium">Growth</span>
              <span className="text-[10px] font-bold text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${progressColor} rounded-full`}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
            bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all active:scale-[0.97]"
            onClick={e => { e.stopPropagation(); onView(plant); }}>
            <Eye size={13} /> View
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
            bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all active:scale-[0.97]"
            onClick={e => { e.stopPropagation(); onEdit(plant); }}>
            <Edit2 size={13} /> Edit
          </button>
          <button className="py-2 px-3 rounded-xl text-xs font-medium
            bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all active:scale-[0.97]"
            onClick={e => { e.stopPropagation(); onDelete(plant); }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ Detail Panel ═══════ */
function DetailPanel({ plant, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  if (!plant) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-fit flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
        <Sprout size={28} className="text-green-300" />
      </div>
      <h3 className="font-bold text-gray-700 mb-1">No Plant Selected</h3>
      <p className="text-xs text-gray-400 max-w-[200px]">Click on any plant card to view its details here</p>
    </div>
  );

  const hs = getHealthStyle(plant.healthStatus);
  const progress = growthProgress(plant);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye size={14} /> },
    { id: 'care', label: 'Care', icon: <Droplets size={14} /> },
    { id: 'history', label: 'History', icon: <FileText size={14} /> },
  ];

  return (
    <motion.div key={plant.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit sticky top-4">

      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 relative">
        <button onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
          <X size={14} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/30">
            {plant.imageUrl ? <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" /> : <Sprout size={28} className="text-white" />}
          </div>
          <div className="text-white">
            <h3 className="font-bold text-lg leading-tight">{plant.name}</h3>
            <p className="text-sm opacity-80 capitalize">{plant.type || 'Unknown'}</p>
            <span className={`inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hs.dot}`} />
              {hs.label}
            </span>
          </div>
        </div>
      </div>

      {/* Growth Progress */}
      {(plant.plantingDate && plant.expectedHarvestDate) && (
        <div className="px-5 pt-4 pb-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1"><Activity size={11} /> Growth Progress</span>
            <span className="text-xs font-bold text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full relative">
              <div className="absolute inset-0 bg-white/20 rounded-full" style={{ animation: 'liquid-wave 3s ease-in-out infinite' }} />
            </motion.div>
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-medium">
            <span>Seedling</span><span>Vegetative</span><span>Flowering</span><span>Harvest</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-2 pt-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all ${
              activeTab === tab.id ? 'text-green-700 border-b-2 border-green-600 bg-green-50/50' : 'text-gray-400 hover:text-gray-600'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <MapPin size={13} />, label: 'Area', value: plant.quantityOrArea || '—' },
                  { icon: <CalendarClock size={13} />, label: 'Planted', value: plant.plantingDate ? new Date(plant.plantingDate).toLocaleDateString() : '—' },
                  { icon: <Sun size={13} />, label: 'Harvest', value: plant.expectedHarvestDate ? new Date(plant.expectedHarvestDate).toLocaleDateString() : '—' },
                  { icon: <HeartPulse size={13} />, label: 'Health', value: hs.label },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">{item.icon}<span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span></div>
                    <p className="text-sm font-bold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
              {plant.notes && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FileText size={10} /> Notes</p>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-2.5 border border-gray-100">{plant.notes}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'care' && (
            <motion.div key="care" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[
                { icon: <Syringe size={14} className="text-purple-500" />, bg: 'bg-purple-50', label: 'Next Treatment', value: plant.nextTreatment },
                { icon: <Droplets size={14} className="text-blue-500" />, bg: 'bg-blue-50', label: 'Irrigation', value: plant.irrigation },
                { icon: <Leaf size={14} className="text-green-500" />, bg: 'bg-green-50', label: 'Fertilizer', value: plant.fertilizer },
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center`}>{item.icon}</div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">{item.label}</p>
                    <p className="text-gray-700 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
              {!plant.nextTreatment && !plant.irrigation && !plant.fertilizer && (
                <div className="text-center py-6 text-gray-400">
                  <Droplets size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No care data recorded</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {plant.diseaseHistory ? (
                <div className="bg-red-50/50 rounded-xl border border-red-100 p-3">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Disease History</p>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{plant.diseaseHistory}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <HeartPulse size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-medium">No disease history</p>
                  <p className="text-[10px]">This plant has a clean record!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════ Modal Wrapper ═══════ */
function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow transition">
              <X size={16} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════ Form Field ═══════ */
function FormField({ label, icon, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}

const inputClass = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition bg-white placeholder:text-gray-300`;
const selectClass = `${inputClass} appearance-none`;

/* ═══════ MAIN COMPONENT ═══════ */
const MyPlantes = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmId, setFarmId] = useState(null);
  const [farmLoading, setFarmLoading] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '', imageUrl: '', type: '', plantingDate: '', expectedHarvestDate: '',
    quantityOrArea: '', healthStatus: '', notes: '', nextTreatment: '',
    fertilizer: '', irrigation: '', diseaseHistory: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const [editingPlant, setEditingPlant] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');

  const showToast = useCallback((message, type = 'info') => setToast({ message, type, key: Date.now() }), []);

  const resolvePlantUrl = (id) => farmId ? `${farmApiBase}/${farmId}/plants/${id}` : `${baseUrlLegacy}/${id}`;

  const resolveUserAndFarm = async () => {
    const token = localStorage.getItem('token');
    const storedFarmId = localStorage.getItem('farmId');
    if (storedFarmId) { setFarmId(storedFarmId); setFarmLoading(false); return; }
    if (!token) { setError('Not authenticated'); setFarmLoading(false); return; }
    try {
      const userRes = await axios.get('http://localhost:8080/auth/user', { headers: { Authorization: `Bearer ${token}` } });
      const userId = userRes.data.id || userRes.data.userId || userRes.data._id || userRes.data.sub;
      if (!userId) { setError('Could not resolve user id'); setFarmLoading(false); return; }
      try {
        const farmRes = await axios.get(`${farmApiBase}/user/${encodeURIComponent(userId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const fId = farmRes.data?.id || farmRes.data?.farmId;
        if (fId) { setFarmId(fId); localStorage.setItem('farmId', fId); } else setError('No farm found');
      } catch (e) {
        setError(e.response?.status === 404 ? 'No farm yet. Create one first.' : 'Failed to load farm');
      }
    } catch { setError('Failed to load user'); }
    finally { setFarmLoading(false); }
  };

  const fetchPlants = async (activeFarmId) => {
    if (!activeFarmId) { setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem('token');
      const endpoints = [`${farmApiBase}/${activeFarmId}/plants`, `${baseUrlLegacy}/farm/${activeFarmId}`];
      let data = [];
      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep, { headers: { Authorization: `Bearer ${token}` } });
          data = Array.isArray(res.data) ? res.data : res.data?.plants || [];
          if (Array.isArray(data)) break;
        } catch { continue; }
      }
      setPlants(data || []);
    } catch { setError('Failed to load plants'); }
    finally { setLoading(false); }
  };

  useEffect(() => { resolveUserAndFarm(); }, []);
  useEffect(() => { if (farmId) fetchPlants(farmId); }, [farmId]);

  const handleAddPlant = async (e) => {
    e.preventDefault();
    if (!farmId) { setAddError('No farm id'); return; }
    setAddLoading(true); setAddError(null);
    const token = localStorage.getItem('token');
    const payload = { ...Object.fromEntries(Object.entries(newForm).map(([k, v]) => [k, v.trim() || null])), farmId };
    try {
      await axios.post(`${farmApiBase}/${farmId}/plants`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setShowAddModal(false);
      setNewForm({ name: '', imageUrl: '', type: '', plantingDate: '', expectedHarvestDate: '', quantityOrArea: '', healthStatus: '', notes: '', nextTreatment: '', fertilizer: '', irrigation: '', diseaseHistory: '' });
      fetchPlants(farmId);
      showToast(`${payload.name || 'Plant'} added!`, 'success');
      try { notifyFarmChange(); } catch {}
    } catch { setAddError('Failed to add plant'); }
    setAddLoading(false);
  };

  const handleDeletePlant = async (objOrId) => {
    const obj = typeof objOrId === 'object' ? objOrId : null;
    const ids = [];
    if (obj) { if (obj.id) ids.push(obj.id); if (obj._id && obj._id !== obj.id) ids.push(obj._id); }
    else if (objOrId) ids.push(objOrId);
    if (!ids.length) { showToast('Invalid ID', 'error'); return; }
    if (!window.confirm('Delete this plant?')) return;
    const token = localStorage.getItem('token');
    for (const id of ids) {
      try {
        await axios.delete(`${baseUrlLegacy}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (selectedPlant?.id === id) setSelectedPlant(null);
        fetchPlants(farmId); showToast('Plant deleted', 'success');
        try { notifyFarmChange(); } catch {} return;
      } catch {
        try {
          await axios.delete(resolvePlantUrl(id), { headers: { Authorization: `Bearer ${token}` } });
          if (selectedPlant?.id === id) setSelectedPlant(null);
          fetchPlants(farmId); showToast('Plant deleted', 'success');
          try { notifyFarmChange(); } catch {} return;
        } catch { continue; }
      }
    }
    showToast('Delete failed', 'error');
  };

  const startEdit = (p) => { setEditingPlant(p); setEditForm({ ...p }); };
  const cancelEdit = () => { setEditingPlant(null); setEditForm({}); };
  const saveEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      try {
        await axios.put(`${baseUrlLegacy}/${editingPlant.id}`, editForm, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      } catch {
        await axios.put(resolvePlantUrl(editingPlant.id), editForm, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      }
      setEditingPlant(null); fetchPlants(farmId);
      showToast(`${editForm.name || 'Plant'} updated!`, 'success');
      try { notifyFarmChange(); } catch {}
    } catch { showToast('Update failed', 'error'); }
  };

  /* ── Computed ── */
  const filteredPlants = useMemo(() => {
    return plants.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q);
      const matchHealth = healthFilter === 'all' || (p.healthStatus || '').toLowerCase() === healthFilter;
      return matchSearch && matchHealth;
    });
  }, [plants, searchQuery, healthFilter]);

  const stats = useMemo(() => ({
    total: plants.length,
    flowering: plants.filter(p => (p.type || '').toLowerCase().includes('flower')).length,
    withNextTreatment: plants.filter(p => p.nextTreatment?.trim()).length,
    upcomingHarvests: plants.filter(p => p.expectedHarvestDate && (new Date(p.expectedHarvestDate).getTime() - Date.now()) < 30 * 86400000 && new Date(p.expectedHarvestDate) > new Date()).length,
    healthy: plants.filter(p => (p.healthStatus || '').toLowerCase() === 'healthy').length,
  }), [plants]);

  if (farmLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-neutral-50 py-6 px-4 md:px-8">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Farm Error */}
        {!farmLoading && !farmId && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error || 'No farm associated.'}</p>
          </motion.div>
        )}

        {/* ── Header ── */}
        <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Plant Management</h1>
              <p className="text-sm text-gray-500">Monitor growth, health, and care for your crops</p>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search plants..."
                className="pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 w-60 transition shadow-sm" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={() => fetchPlants(farmId)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-green-600 hover:border-green-200 transition shadow-sm" title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 transition-all active:scale-[0.97]">
              <Plus size={16} /> Add Plant
            </button>
          </div>
        </motion.header>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Leaf size={18} className="text-green-600" />} iconBg="bg-green-100" title="Total Plants" value={stats.total} subtitle={`${stats.healthy} healthy`} delay={0} />
          <StatCard icon={<Flower2 size={18} className="text-pink-600" />} iconBg="bg-pink-100" title="Flowering" value={stats.flowering} delay={0.05} />
          <StatCard icon={<Beaker size={18} className="text-purple-600" />} iconBg="bg-purple-100" title="Treatments" value={stats.withNextTreatment} subtitle="Need treatment" delay={0.1} />
          <StatCard icon={<CalendarClock size={18} className="text-amber-600" />} iconBg="bg-amber-100" title="Upcoming Harvests" value={stats.upcomingHarvests} subtitle="Next 30 days" delay={0.15} />
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={12} /> Health:
          </span>
          {['all', 'healthy', 'warning', 'sick'].map(f => {
            const count = f === 'all' ? plants.length : plants.filter(p => (p.healthStatus || '').toLowerCase() === f).length;
            return (
              <button key={f} onClick={() => setHealthFilter(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  healthFilter === f ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600'
                }`}>
                {f === 'all' ? '📋' : f === 'healthy' ? '✅' : f === 'warning' ? '⚠️' : '🔴'} {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Main Content ── */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw size={28} className="text-green-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading plants...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
                <button onClick={() => fetchPlants(farmId)} className="mt-4 text-sm text-green-600 font-medium hover:underline">Retry</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filteredPlants.map((p, idx) => (
                    <PlantCard key={p.id || idx} plant={p} isSelected={selectedPlant?.id === p.id}
                      onView={setSelectedPlant} onEdit={startEdit} onDelete={handleDeletePlant} delay={idx * 0.04} />
                  ))}
                </AnimatePresence>
                {filteredPlants.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <Sprout size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No plants found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Detail Panel ── */}
          <div className="w-full xl:w-[360px] 2xl:w-[400px] flex-shrink-0">
            <DetailPanel plant={selectedPlant} onClose={() => setSelectedPlant(null)} />
          </div>
        </div>
      </div>

      {/* ── Add Modal ── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Plant" maxWidth="max-w-2xl">
        <form className="grid md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1" onSubmit={handleAddPlant}>
          <FormField label="Name" icon={<Sprout size={10} />}>
            <input className={inputClass} placeholder="e.g., Tomato" required value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} />
          </FormField>
          <FormField label="Type" icon={<Leaf size={10} />}>
            <input className={inputClass} placeholder="e.g., Vegetable" value={newForm.type} onChange={e => setNewForm(p => ({ ...p, type: e.target.value }))} />
          </FormField>
          <FormField label="Image URL" icon={<Eye size={10} />}>
            <input className={inputClass} placeholder="https://..." value={newForm.imageUrl} onChange={e => setNewForm(p => ({ ...p, imageUrl: e.target.value }))} />
          </FormField>
          <FormField label="Quantity/Area" icon={<MapPin size={10} />}>
            <input className={inputClass} placeholder="e.g., 50 sqm" value={newForm.quantityOrArea} onChange={e => setNewForm(p => ({ ...p, quantityOrArea: e.target.value }))} />
          </FormField>
          <FormField label="Planting Date" icon={<CalendarClock size={10} />}>
            <input type="date" className={inputClass} value={newForm.plantingDate} onChange={e => setNewForm(p => ({ ...p, plantingDate: e.target.value }))} />
          </FormField>
          <FormField label="Expected Harvest" icon={<Sun size={10} />}>
            <input type="date" className={inputClass} value={newForm.expectedHarvestDate} onChange={e => setNewForm(p => ({ ...p, expectedHarvestDate: e.target.value }))} />
          </FormField>
          <FormField label="Health Status" icon={<HeartPulse size={10} />}>
            <select className={selectClass} value={newForm.healthStatus} onChange={e => setNewForm(p => ({ ...p, healthStatus: e.target.value }))}>
              <option value="">Select</option><option value="Healthy">✅ Healthy</option><option value="Warning">⚠️ Warning</option><option value="Sick">🔴 Sick</option>
            </select>
          </FormField>
          <FormField label="Next Treatment" icon={<Syringe size={10} />}>
            <input className={inputClass} placeholder="e.g., Fungicide" value={newForm.nextTreatment} onChange={e => setNewForm(p => ({ ...p, nextTreatment: e.target.value }))} />
          </FormField>
          <FormField label="Fertilizer" icon={<Leaf size={10} />}>
            <input className={inputClass} placeholder="e.g., NPK 10-10-10" value={newForm.fertilizer} onChange={e => setNewForm(p => ({ ...p, fertilizer: e.target.value }))} />
          </FormField>
          <FormField label="Irrigation" icon={<Droplets size={10} />}>
            <input className={inputClass} placeholder="e.g., Drip" value={newForm.irrigation} onChange={e => setNewForm(p => ({ ...p, irrigation: e.target.value }))} />
          </FormField>
          <FormField label="Disease History" className="md:col-span-2">
            <textarea className={`${inputClass} h-20 resize-none`} placeholder="Past diseases..." value={newForm.diseaseHistory} onChange={e => setNewForm(p => ({ ...p, diseaseHistory: e.target.value }))} />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea className={`${inputClass} h-24 resize-none`} placeholder="Additional notes..." value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))} />
          </FormField>
          <div className="md:col-span-2 flex items-center gap-3 pt-3 border-t border-gray-100">
            <button disabled={addLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-green-200 hover:shadow-lg transition-all active:scale-[0.97] disabled:opacity-50">
              {addLoading ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
              {addLoading ? 'Adding...' : 'Add Plant'}
            </button>
            <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition border border-gray-200">Cancel</button>
            {addError && <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {addError}</span>}
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editingPlant} onClose={cancelEdit} title={`Edit ${editingPlant?.name || 'Plant'}`} maxWidth="max-w-2xl">
        <form className="grid md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1" onSubmit={saveEdit}>
          {[
            { key: 'name', label: 'Name', icon: <Sprout size={10} /> },
            { key: 'type', label: 'Type', icon: <Leaf size={10} /> },
            { key: 'imageUrl', label: 'Image URL', icon: <Eye size={10} /> },
            { key: 'quantityOrArea', label: 'Quantity/Area', icon: <MapPin size={10} /> },
            { key: 'fertilizer', label: 'Fertilizer', icon: <Leaf size={10} /> },
            { key: 'irrigation', label: 'Irrigation', icon: <Droplets size={10} /> },
            { key: 'nextTreatment', label: 'Treatment', icon: <Syringe size={10} /> },
          ].map(f => (
            <FormField key={f.key} label={f.label} icon={f.icon}>
              <input className={inputClass} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </FormField>
          ))}
          <FormField label="Planting Date" icon={<CalendarClock size={10} />}>
            <input type="date" className={inputClass} value={editForm.plantingDate || ''} onChange={e => setEditForm(p => ({ ...p, plantingDate: e.target.value }))} />
          </FormField>
          <FormField label="Expected Harvest" icon={<Sun size={10} />}>
            <input type="date" className={inputClass} value={editForm.expectedHarvestDate || ''} onChange={e => setEditForm(p => ({ ...p, expectedHarvestDate: e.target.value }))} />
          </FormField>
          <FormField label="Health Status" icon={<HeartPulse size={10} />}>
            <select className={selectClass} value={editForm.healthStatus || ''} onChange={e => setEditForm(p => ({ ...p, healthStatus: e.target.value }))}>
              <option value="">Select</option><option value="Healthy">✅ Healthy</option><option value="Warning">⚠️ Warning</option><option value="Sick">🔴 Sick</option>
            </select>
          </FormField>
          <FormField label="Disease History" className="md:col-span-2">
            <textarea className={`${inputClass} h-20 resize-none`} value={editForm.diseaseHistory || ''} onChange={e => setEditForm(p => ({ ...p, diseaseHistory: e.target.value }))} />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea className={`${inputClass} h-24 resize-none`} value={editForm.notes || ''} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
          </FormField>
          <div className="md:col-span-2 flex gap-3 pt-3 border-t border-gray-100">
            <button type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-semibold shadow-md shadow-green-200 hover:shadow-lg transition-all active:scale-[0.97] flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Save Changes
            </button>
            <button type="button" onClick={cancelEdit}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition border border-gray-200">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* AI Chatbot */}
      <AIChatbot isOpen={chatbotOpen} onToggle={() => setChatbotOpen(!chatbotOpen)} context="plant_management"
        pageData={{
          plants, totalCount: plants.length,
          breakdown: plants.reduce((acc, p) => { const t = p.type || 'Unknown'; acc[t] = (acc[t] || 0) + 1; return acc; }, {}),
          healthStats: { healthy: stats.healthy, warning: plants.filter(p => p.healthStatus === 'Warning').length, sick: plants.filter(p => p.healthStatus === 'Sick').length },
          upcomingHarvests: stats.upcomingHarvests, farmId
        }}
      />

      <style>{`
        @keyframes liquid-wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50%      { transform: translateX(-5%) scaleY(1.03); }
        }
      `}</style>
    </div>
  );
};

export default MyPlantes;
