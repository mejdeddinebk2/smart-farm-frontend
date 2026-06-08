import API_BASE from '../config';
import { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bone, Plus, Search, CalendarClock, Syringe, HeartPulse, Activity,
  Edit2, Trash2, Eye, X, Stethoscope, Filter, ChevronRight,
  AlertTriangle, CheckCircle, Clock, Weight, FileText, PawPrint,
  TrendingUp, BarChart3, Info, RefreshCw, Heart, Shield
} from 'lucide-react';
import AIChatbot from '../components/AIChatbot';
import { saveDetection } from './DetectionHistory';

const farmApiBase = 'http://localhost:8080/api/farms';
const baseAnimalsFallback = 'http://localhost:8080/api/animals';

/* ═══════════ Helpers ═══════════ */
const calcAge = (birthDate) => {
  if (!birthDate) return '';
  try {
    const diff = Date.now() - new Date(birthDate).getTime();
    const years = Math.floor(diff / 31557600000);
    const months = Math.floor((diff % 31557600000) / (30.44 * 86400000));
    if (years > 0) return `${years}y ${months}m`;
    return `${months}m`;
  } catch { return ''; }
};

const vaccinationDue = (vaccinationDate) => {
  if (!vaccinationDate) return false;
  return Date.now() - new Date(vaccinationDate).getTime() > 1000 * 60 * 60 * 24 * 30 * 6;
};

const healthColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'healthy': return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'warning': return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'sick': return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' };
    default: return { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' };
  }
};

const speciesConfig = {
  dog: { label: 'Dogs', emoji: '🐕', color: 'indigo', gradient: 'from-indigo-500 to-indigo-600' },
  chicken: { label: 'Chickens', emoji: '🐔', color: 'rose', gradient: 'from-rose-500 to-rose-600' },
  sheep: { label: 'Sheep', emoji: '🐑', color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
  cow: { label: 'Cows', emoji: '🐄', color: 'amber', gradient: 'from-amber-500 to-amber-600' },
};

const getSpeciesStyle = (species) => {
  const s = (species || '').toLowerCase();
  return speciesConfig[s] || { label: species, emoji: '🐾', color: 'gray', gradient: 'from-gray-500 to-gray-600' };
};

/* ═══════════ Toast ═══════════ */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600', warning: 'bg-amber-500',
  };
  const icons = {
    success: <CheckCircle size={18} />, error: <AlertTriangle size={18} />,
    info: <Info size={18} />, warning: <AlertTriangle size={18} />,
  };
  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      className={`fixed top-6 right-6 z-[100] ${styles[type]} text-white px-5 py-3.5 rounded-xl shadow-2xl
        flex items-center gap-3 min-w-[300px] max-w-md`}
    >
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><X size={14} /></button>
    </motion.div>
  );
}

/* ═══════════ Skeletons ═══════════ */
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg ${className}`} />;
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Stat Card ═══════════ */
function StatCard({ icon, iconBg, title, value, subtitle, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md
        hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center
          group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

/* ═══════════ Species Table ═══════════ */
function SpeciesTable({ title, emoji, animals, color, onView, onEdit, onDelete, selectedId }) {
  const colorMap = {
    indigo: { headerBg: 'bg-indigo-50', headerText: 'text-indigo-700', headerBorder: 'border-indigo-100', accent: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50/50', badge: 'bg-indigo-100 text-indigo-700' },
    rose: { headerBg: 'bg-rose-50', headerText: 'text-rose-700', headerBorder: 'border-rose-100', accent: 'text-rose-600', hoverBg: 'hover:bg-rose-50/50', badge: 'bg-rose-100 text-rose-700' },
    emerald: { headerBg: 'bg-emerald-50', headerText: 'text-emerald-700', headerBorder: 'border-emerald-100', accent: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700' },
    amber: { headerBg: 'bg-amber-50', headerText: 'text-amber-700', headerBorder: 'border-amber-100', accent: 'text-amber-600', hoverBg: 'hover:bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' },
    gray: { headerBg: 'bg-gray-50', headerText: 'text-gray-700', headerBorder: 'border-gray-100', accent: 'text-gray-600', hoverBg: 'hover:bg-gray-50/50', badge: 'bg-gray-100 text-gray-700' },
  };
  const c = colorMap[color] || colorMap.gray;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
      hover:shadow-md transition-shadow duration-300">
      <div className={`${c.headerBg} px-5 py-3.5 border-b ${c.headerBorder} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{emoji}</span>
          <h3 className={`font-bold text-sm ${c.headerText}`}>{title}</h3>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
          {animals.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className={`text-left text-[11px] font-semibold ${c.accent} uppercase tracking-wider px-5 py-3`}>Name</th>
              <th className={`text-left text-[11px] font-semibold ${c.accent} uppercase tracking-wider px-5 py-3`}>Breed</th>
              <th className={`text-left text-[11px] font-semibold ${c.accent} uppercase tracking-wider px-5 py-3`}>Age</th>
              <th className={`text-left text-[11px] font-semibold ${c.accent} uppercase tracking-wider px-5 py-3`}>Health</th>
              <th className={`text-right text-[11px] font-semibold ${c.accent} uppercase tracking-wider px-5 py-3`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {animals.map((a, idx) => {
              const hc = healthColor(a.healthStatus);
              const isSelected = selectedId === a.id;
              return (
                <motion.tr
                  key={a.id || a._id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`border-b border-gray-50 ${c.hoverBg} transition-colors cursor-pointer
                    ${isSelected ? 'bg-green-50/60 border-l-2 border-l-green-500' : ''}`}
                  onClick={() => onView(a)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${speciesConfig[(a.species||'').toLowerCase()]?.gradient || 'from-gray-400 to-gray-500'}
                        flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden`}>
                        {a.imageUrl
                          ? <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                          : (a.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">{a.name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{a.breed || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{calcAge(a.birthDate) || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${hc.bg} ${hc.text} border ${hc.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hc.dot}`} />
                      {a.healthStatus || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => onView(a)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all" title="View">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => onEdit(a)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => onDelete(a)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            {animals.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <PawPrint size={24} className="text-gray-300" />
                    <p className="text-xs font-medium">No {title.toLowerCase()} yet</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════ Animal Card ═══════════ */
function AnimalCard({ animal: a, isSelected, onView, onEdit, onDelete, delay = 0 }) {
  const sp = getSpeciesStyle(a.species);
  const hc = healthColor(a.healthStatus);
  const isDue = vaccinationDue(a.vaccinationDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`group bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm
        hover:shadow-lg transition-all duration-300 cursor-pointer relative
        ${isSelected ? 'ring-2 ring-green-500 shadow-green-100' : 'border-gray-100 hover:-translate-y-1'}`}
      onClick={() => onView(a)}
    >
      {/* Vaccination badge */}
      {isDue && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            <Syringe size={10} /> Due
          </span>
        </div>
      )}

      {/* Hero */}
      <div className={`h-32 bg-gradient-to-br ${sp.gradient} flex items-center justify-center
        text-white relative overflow-hidden`}>
        {a.imageUrl ? (
          <img src={a.imageUrl} alt={a.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">{sp.emoji}</span>
            <span className="text-xs font-medium opacity-70 capitalize">{a.species}</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{a.name || 'Unnamed'}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{a.species} {a.breed ? `• ${a.breed}` : ''}</p>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${hc.bg} ${hc.text} border ${hc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hc.dot}`} />
            {a.healthStatus || 'Unknown'}
          </span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {a.weight && (
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
              <Weight size={11} className="text-gray-400" />
              <span>{a.weight} kg</span>
            </div>
          )}
          {a.birthDate && (
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
              <Clock size={11} className="text-gray-400" />
              <span>{calcAge(a.birthDate)}</span>
            </div>
          )}
          {a.nextVisit && (
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 col-span-2">
              <CalendarClock size={11} className="text-gray-400" />
              <span>Visit: {new Date(a.nextVisit).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-2 flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
              bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all active:scale-[0.97]"
            onClick={e => { e.stopPropagation(); onView(a); }}
          >
            <Eye size={13} /> View
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
              bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all active:scale-[0.97]"
            onClick={e => { e.stopPropagation(); onEdit(a); }}
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            className="py-2 px-3 rounded-xl text-xs font-medium
              bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all active:scale-[0.97]"
            onClick={e => { e.stopPropagation(); onDelete(a); }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════ Detail Panel ═══════════ */
function DetailPanel({
  animal, onClose, weightEntries, weightInput, setWeightInput,
  weightDateInput, setWeightDateInput, addWeightEntry, renderWeightChart,
  processes, processLoading, newStepType, setNewStepType,
  newStepDescription, setNewStepDescription, handleAddStep
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!animal) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-fit flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
        <PawPrint size={28} className="text-green-300" />
      </div>
      <h3 className="font-bold text-gray-700 mb-1">No Animal Selected</h3>
      <p className="text-xs text-gray-400 max-w-[200px]">Click on any animal card or table row to view details here</p>
    </div>
  );

  const sp = getSpeciesStyle(animal.species);
  const hc = healthColor(animal.healthStatus);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye size={14} /> },
    { id: 'weight', label: 'Weight', icon: <TrendingUp size={14} /> },
    { id: 'medical', label: 'Medical', icon: <Stethoscope size={14} /> },
  ];

  return (
    <motion.div
      key={animal.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit sticky top-4"
    >
      {/* Header */}
      <div className={`bg-gradient-to-br ${sp.gradient} p-5 relative`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full
            flex items-center justify-center text-white hover:bg-white/30 transition"
        >
          <X size={14} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center
            text-3xl shadow-lg overflow-hidden border-2 border-white/30">
            {animal.imageUrl
              ? <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
              : sp.emoji}
          </div>
          <div className="text-white">
            <h3 className="font-bold text-lg leading-tight">{animal.name}</h3>
            <p className="text-sm opacity-80 capitalize">{animal.species} {animal.breed ? `• ${animal.breed}` : ''}</p>
            <span className={`inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full
              bg-white/20 backdrop-blur-sm text-white`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hc.dot}`} />
              {animal.healthStatus || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-2 pt-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all
              ${activeTab === tab.id
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50/50'
                : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Clock size={13} />, label: 'Age', value: calcAge(animal.birthDate) || '—' },
                  { icon: <Weight size={13} />, label: 'Weight', value: animal.weight ? `${animal.weight} kg` : '—' },
                  { icon: <Shield size={13} />, label: 'Sex', value: animal.sex || '—' },
                  { icon: <Heart size={13} />, label: 'Health', value: animal.healthStatus || '—' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      {item.icon}
                      <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Info rows */}
              <div className="space-y-2.5">
                {animal.vet && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Stethoscope size={14} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Veterinarian</p>
                      <p className="text-gray-700 font-medium">{animal.vet}</p>
                    </div>
                  </div>
                )}
                {animal.nextVisit && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CalendarClock size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Next Visit</p>
                      <p className="text-gray-700 font-medium">{new Date(animal.nextVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {animal.vaccinationDate && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                      ${vaccinationDue(animal.vaccinationDate) ? 'bg-red-50' : 'bg-green-50'}`}>
                      <Syringe size={14} className={vaccinationDue(animal.vaccinationDate) ? 'text-red-500' : 'text-green-500'} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Last Vaccination</p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-700 font-medium">{new Date(animal.vaccinationDate).toLocaleDateString()}</p>
                        {vaccinationDue(animal.vaccinationDate) && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">OVERDUE</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {(animal.feeding || animal.activity || animal.notes) && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {animal.feeding && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Bone size={10} /> Feeding
                      </p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-2.5">{animal.feeding}</p>
                    </div>
                  )}
                  {animal.activity && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Activity size={10} /> Activity
                      </p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-2.5">{animal.activity}</p>
                    </div>
                  )}
                  {animal.notes && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText size={10} /> Notes
                      </p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-2.5">{animal.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'weight' && (
            <motion.div key="weight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={16} className="text-green-600" />
                <h4 className="text-sm font-bold text-gray-700">Weight Tracking</h4>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                {renderWeightChart(animal.id)}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Weight (kg)"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs
                    focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                />
                <input
                  type="date"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs
                    focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition"
                  value={weightDateInput}
                  onChange={e => setWeightDateInput(e.target.value)}
                />
                <button
                  onClick={() => addWeightEntry(animal.id)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl
                    hover:shadow-md hover:shadow-green-200 transition-all active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
              {/* Entries list */}
              {(weightEntries[animal.id] || []).length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {(weightEntries[animal.id] || []).slice().reverse().map((entry, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span className="font-semibold text-gray-700">{entry.weight} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'medical' && (
            <motion.div key="medical" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope size={16} className="text-green-600" />
                <h4 className="text-sm font-bold text-gray-700">Medical Process</h4>
              </div>

              {processLoading && (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw size={18} className="text-green-500 animate-spin" />
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {(processes[animal.id] || []).map((step, i) => {
                  const stepColors = {
                    Symptome: 'bg-red-50 border-red-200 text-red-700',
                    Diagnostic: 'bg-blue-50 border-blue-200 text-blue-700',
                    Traitement: 'bg-green-50 border-green-200 text-green-700',
                    Suivi: 'bg-purple-50 border-purple-200 text-purple-700',
                  };
                  return (
                    <div key={i} className={`rounded-xl border p-3 ${stepColors[step.type] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{step.type}</p>
                      <p className="text-xs">{step.description}</p>
                    </div>
                  );
                })}
                {(!processes[animal.id] || processes[animal.id].length === 0) && !processLoading && (
                  <div className="text-center py-6 text-gray-400">
                    <Stethoscope size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No medical records</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddStep} className="space-y-2.5 pt-3 border-t border-gray-100">
                <p className="text-[11px] font-semibold text-gray-500">Add Medical Step</p>
                <select
                  required
                  value={newStepType}
                  onChange={e => setNewStepType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs
                    focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition
                    bg-white appearance-none"
                >
                  <option value="">Select type...</option>
                  <option value="Symptome">Symptôme</option>
                  <option value="Diagnostic">Diagnostic</option>
                  <option value="Traitement">Traitement</option>
                  <option value="Suivi">Suivi</option>
                </select>
                <textarea
                  required
                  value={newStepDescription}
                  onChange={e => setNewStepDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs h-20 resize-none
                    focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition"
                  placeholder="Describe the medical step..."
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl
                    text-xs font-semibold hover:shadow-md hover:shadow-green-200 transition-all active:scale-[0.97]
                    flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Step
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════ Modal Wrapper ═══════════ */
function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200
                flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow transition"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════ Form Input ═══════════ */
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

const inputClass = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
  focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition
  bg-white placeholder:text-gray-300`;

const selectClass = `${inputClass} appearance-none`;

/* ═══════════ MAIN COMPONENT ═══════════ */
const MyAnimals = () => {
  const [animals, setAnimals] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [chickens, setChickens] = useState([]);
  const [sheeps, setSheeps] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmId, setFarmId] = useState(null);
  const [farmLoading, setFarmLoading] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '', imageUrl: '', species: '', breed: '', birthDate: '', sex: '',
    weight: '', healthStatus: '', feeding: '', activity: '', notes: '',
    vet: '', nextVisit: '', vaccinationDate: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const [editingAnimal, setEditingAnimal] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tables'); // 'tables' | 'cards'
  const [speciesFilter, setSpeciesFilter] = useState('all');

  const [weightEntries, setWeightEntries] = useState({});
  const [weightInput, setWeightInput] = useState('');
  const [weightDateInput, setWeightDateInput] = useState('');

  const [processes, setProcesses] = useState({});
  const [newStepType, setNewStepType] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [processLoading, setProcessLoading] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const resolveAnimalUrl = (id) => farmId ? `${farmApiBase}/${farmId}/animals/${id}` : `${baseAnimalsFallback}/${id}`;

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
        if (fId) { setFarmId(fId); localStorage.setItem('farmId', fId); }
        else setError('No farm found for this user');
      } catch (fErr) {
        setError(fErr.response?.status === 404 ? 'You have no farm yet. Create one first.' : 'Failed to load farm');
      }
    } catch { setError('Failed to load user'); }
    finally { setFarmLoading(false); }
  };

  const distributeAnimals = (list) => {
    const d = [], c = [], s = [], co = [];
    (list || []).forEach(a => {
      const sp = (a.species || '').toLowerCase();
      if (sp === 'dog') d.push(a);
      else if (sp === 'chicken') c.push(a);
      else if (['sheep', 'sheeps'].includes(sp)) s.push(a);
      else if (sp === 'cow') co.push(a);
    });
    setDogs(d); setChickens(c); setSheeps(s); setCows(co);
  };

  const fetchAnimals = async (activeFarmId) => {
    if (!activeFarmId) return;
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem('token');
      const endpoints = [
        `${farmApiBase}/${activeFarmId}/animals`,
        `${baseAnimalsFallback}/farm/${activeFarmId}`,
      ];
      let data = [];
      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep, { headers: { Authorization: `Bearer ${token}` } });
          data = Array.isArray(res.data) ? res.data : res.data?.animals || [];
          if (Array.isArray(data)) break;
        } catch { continue; }
      }
      data = (data || []).map(a => ({ healthStatus: 'Unknown', ...a }));
      setAnimals(data);
      distributeAnimals(data);
    } catch { setError('Failed to load animals for farm'); }
    finally { setLoading(false); }
  };

  useEffect(() => { resolveUserAndFarm(); }, []);
  useEffect(() => { if (farmId) fetchAnimals(farmId); }, [farmId]);

  const fetchMedicalProcesses = async (id) => {
    if (!id) return;
    setProcessLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/medical-process/${id}`);
      setProcesses(p => ({ ...p, [id]: res.data || [] }));
    } catch { /* silent */ }
    finally { setProcessLoading(false); }
  };

  useEffect(() => {
    if (selectedAnimal && !processes[selectedAnimal.id]) fetchMedicalProcesses(selectedAnimal.id);
  }, [selectedAnimal]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!farmId) { setAddError('No farm id'); return; }
    setAddLoading(true); setAddError(null);
    const token = localStorage.getItem('token');
    const allowedSpecies = ['cow', 'dog', 'sheep', 'chicken'];
    if (!newForm.species || !allowedSpecies.includes(newForm.species.toLowerCase())) {
      setAddError('Species must be one of: cow, dog, sheep, chicken');
      setAddLoading(false); return;
    }
    try {
      await axios.post(`${farmApiBase}/${farmId}/animals`, { ...newForm, farmId }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setShowAddModal(false);
      setNewForm({ name: '', imageUrl: '', species: '', breed: '', birthDate: '', sex: '', weight: '', healthStatus: '', feeding: '', activity: '', notes: '', vet: '', nextVisit: '', vaccinationDate: '' });
      fetchAnimals(farmId);
      showToast(`${newForm.name || 'Animal'} added successfully!`, 'success');
      try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
    } catch { setAddError('Failed to add animal'); }
    setAddLoading(false);
  };

  const handleDelete = async (objOrId) => {
    const obj = typeof objOrId === 'object' ? objOrId : null;
    const ids = [];
    if (obj) { if (obj.id) ids.push(obj.id); if (obj._id && obj._id !== obj.id) ids.push(obj._id); }
    else if (objOrId) ids.push(objOrId);
    if (!ids.length) { showToast('Invalid ID', 'error'); return; }
    if (!window.confirm('Are you sure you want to delete this animal?')) return;
    const token = localStorage.getItem('token');
    for (const id of ids) {
      try {
        await axios.delete(`${baseAnimalsFallback}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (selectedAnimal?.id === id) setSelectedAnimal(null);
        fetchAnimals(farmId);
        showToast('Animal deleted', 'success');
        try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
        return;
      } catch {
        try {
          await axios.delete(resolveAnimalUrl(id), { headers: { Authorization: `Bearer ${token}` } });
          if (selectedAnimal?.id === id) setSelectedAnimal(null);
          fetchAnimals(farmId);
          showToast('Animal deleted', 'success');
          try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
          return;
        } catch { continue; }
      }
    }
    showToast('Delete failed', 'error');
  };

  const startEdit = (a) => { setEditingAnimal(a); setEditForm({ ...a }); };
  const cancelEdit = () => { setEditingAnimal(null); setEditForm({}); };

  const saveEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      try {
        await axios.put(`${baseAnimalsFallback}/${editingAnimal.id}`, editForm, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      } catch {
        await axios.put(resolveAnimalUrl(editingAnimal.id), editForm, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      }
      setEditingAnimal(null);
      fetchAnimals(farmId);
      showToast(`${editForm.name || 'Animal'} updated!`, 'success');
      try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
    } catch { showToast('Update failed', 'error'); }
  };

  const addWeightEntry = (animalId) => {
    if (!weightInput) return;
    const date = weightDateInput || new Date().toISOString().slice(0, 10);
    setWeightEntries(prev => ({ ...prev, [animalId]: [...(prev[animalId] || []), { date, weight: parseFloat(weightInput) }] }));
    setWeightInput(''); setWeightDateInput('');
  };

  const renderWeightChart = (animalId) => {
    const entries = (weightEntries[animalId] || []).slice(-12);
    if (!entries.length) return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <TrendingUp size={28} className="text-gray-300 mb-2" />
        <p className="text-xs font-medium">No weight data recorded</p>
        <p className="text-[10px]">Add entries below to track weight</p>
      </div>
    );
    const max = Math.max(...entries.map(e => e.weight));
    const min = Math.min(...entries.map(e => e.weight));
    const range = max - min || 1;
    const pts = entries.map((e, i) => {
      const x = entries.length === 1 ? 50 : (i / (entries.length - 1)) * 94 + 3;
      const y = 90 - ((e.weight - min) / range) * 75 + 5;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full h-28">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[25, 50, 75].map(y => (
            <line key={y} x1="3" y1={y} x2="97" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
          ))}
          {/* Area */}
          <polygon fill="url(#chartGrad)" points={`3,95 ${pts} 97,95`} />
          {/* Line */}
          <polyline fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
          {/* Dots */}
          {entries.map((e, i) => {
            const x = entries.length === 1 ? 50 : (i / (entries.length - 1)) * 94 + 3;
            const y = 90 - ((e.weight - min) / range) * 75 + 5;
            return <circle key={i} cx={x} cy={y} r="2" fill="#22c55e" stroke="white" strokeWidth="1" />;
          })}
        </svg>
        <div className="flex justify-between text-[9px] text-gray-400 px-1 -mt-1">
          <span>{entries[0]?.date}</span>
          <span>{entries[entries.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    try {
      await axios.post(`http://localhost:8080/api/medical-process/${selectedAnimal.id}/steps`, {
        type: newStepType, description: newStepDescription
      });
      setNewStepType(''); setNewStepDescription('');
      fetchMedicalProcesses(selectedAnimal.id);
      showToast('Medical step added', 'success');
      try { window.dispatchEvent(new Event('farmDataChanged')); } catch {}
    } catch { showToast('Failed to add step', 'error'); }
  };

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (a.name || '').toLowerCase().includes(q) ||
        (a.species || '').toLowerCase().includes(q) || (a.breed || '').toLowerCase().includes(q);
      const matchesSpecies = speciesFilter === 'all' || (a.species || '').toLowerCase() === speciesFilter;
      return matchesSearch && matchesSpecies;
    });
  }, [animals, searchQuery, speciesFilter]);

  const stats = useMemo(() => ({
    total: animals.length,
    upcomingVisits: animals.filter(a => a.nextVisit && (new Date(a.nextVisit).getTime() - Date.now()) < 30 * 86400000 && new Date(a.nextVisit) > new Date()).length,
    vaccinationAlerts: animals.filter(a => vaccinationDue(a.vaccinationDate)).length,
    healthy: animals.filter(a => (a.healthStatus || '').toLowerCase() === 'healthy').length,
  }), [animals]);

  if (farmLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-neutral-50 py-6 px-4 md:px-8">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Farm Error */}
        {!farmLoading && !farmId && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error || 'No farm associated. Create a farm first.'}</p>
          </motion.div>
        )}

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl
              flex items-center justify-center shadow-lg shadow-green-200">
              <PawPrint className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Animal Management</h1>
              <p className="text-sm text-gray-500">Monitor health, nutrition, and care for your livestock</p>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search animals..."
                className="pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 w-60 transition shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => fetchAnimals(farmId)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500
                hover:text-green-600 hover:border-green-200 transition shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white
                px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-green-200
                hover:shadow-lg hover:shadow-green-300 transition-all active:scale-[0.97]"
            >
              <Plus size={16} /> Add Animal
            </button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Bone size={18} className="text-green-600" />}
            iconBg="bg-green-100"
            title="Total Animals"
            value={stats.total}
            subtitle={`${dogs.length} dogs · ${cows.length} cows · ${sheeps.length} sheep · ${chickens.length} chickens`}
          />
          <StatCard
            icon={<CalendarClock size={18} className="text-blue-600" />}
            iconBg="bg-blue-100"
            title="Upcoming Visits"
            value={stats.upcomingVisits}
            subtitle="Next 30 days"
          />
          <StatCard
            icon={<Syringe size={18} className="text-amber-600" />}
            iconBg="bg-amber-100"
            title="Vaccination Due"
            value={stats.vaccinationAlerts}
            subtitle={stats.vaccinationAlerts > 0 ? 'Action needed' : 'All up to date'}
          />
          <StatCard
            icon={<HeartPulse size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-100"
            title="Healthy"
            value={stats.healthy}
            subtitle={`${stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0}% of total`}
          />
        </div>

        {/* Vaccination Alert */}
        {stats.vaccinationAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6
              flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Syringe size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Vaccination Alert</p>
              <p className="text-xs text-amber-600">
                {stats.vaccinationAlerts} animal{stats.vaccinationAlerts > 1 ? 's' : ''} overdue for vaccination.
                Review and schedule promptly.
              </p>
            </div>
            <ChevronRight size={18} className="text-amber-400" />
          </motion.div>
        )}

        {/* ── View Toggle + Species Filter ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
              <Filter size={12} className="inline mr-1" />Filter:
            </span>
            {[
              { key: 'all', label: 'All', count: animals.length },
              { key: 'dog', label: '🐕 Dogs', count: dogs.length },
              { key: 'cow', label: '🐄 Cows', count: cows.length },
              { key: 'sheep', label: '🐑 Sheep', count: sheeps.length },
              { key: 'chicken', label: '🐔 Chickens', count: chickens.length },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setSpeciesFilter(f.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all
                  ${speciesFilter === f.key
                    ? 'bg-green-600 text-white shadow-md shadow-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600'}`}
              >
                {f.label} <span className="opacity-70">({f.count})</span>
              </button>
            ))}
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('tables')}
              className={`px-3 py-1.5 text-xs font-medium transition ${viewMode === 'tables' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Tables
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-medium transition ${viewMode === 'cards' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Cards
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw size={28} className="text-green-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading animals...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
                <button onClick={() => fetchAnimals(farmId)}
                  className="mt-4 text-sm text-green-600 font-medium hover:underline">Retry</button>
              </div>
            ) : viewMode === 'tables' ? (
              /* ── Tables View ── */
              <div className="space-y-5">
                {(speciesFilter === 'all' || speciesFilter === 'dog') && (
                  <SpeciesTable title="Dogs" emoji="🐕" animals={speciesFilter === 'dog' ? filteredAnimals : dogs}
                    color="indigo" onView={setSelectedAnimal} onEdit={startEdit} onDelete={handleDelete}
                    selectedId={selectedAnimal?.id} />
                )}
                {(speciesFilter === 'all' || speciesFilter === 'cow') && (
                  <SpeciesTable title="Cows" emoji="🐄" animals={speciesFilter === 'cow' ? filteredAnimals : cows}
                    color="amber" onView={setSelectedAnimal} onEdit={startEdit} onDelete={handleDelete}
                    selectedId={selectedAnimal?.id} />
                )}
                {(speciesFilter === 'all' || speciesFilter === 'sheep') && (
                  <SpeciesTable title="Sheep" emoji="🐑" animals={speciesFilter === 'sheep' ? filteredAnimals : sheeps}
                    color="emerald" onView={setSelectedAnimal} onEdit={startEdit} onDelete={handleDelete}
                    selectedId={selectedAnimal?.id} />
                )}
                {(speciesFilter === 'all' || speciesFilter === 'chicken') && (
                  <SpeciesTable title="Chickens" emoji="🐔" animals={speciesFilter === 'chicken' ? filteredAnimals : chickens}
                    color="rose" onView={setSelectedAnimal} onEdit={startEdit} onDelete={handleDelete}
                    selectedId={selectedAnimal?.id} />
                )}
              </div>
            ) : (
              /* ── Cards View ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filteredAnimals.map((a, idx) => (
                    <AnimalCard
                      key={a.id || idx}
                      animal={a}
                      isSelected={selectedAnimal?.id === a.id}
                      onView={setSelectedAnimal}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      delay={idx * 0.04}
                    />
                  ))}
                </AnimatePresence>
                {filteredAnimals.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <PawPrint size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No animals found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Detail Panel ── */}
          <div className="w-full xl:w-[360px] 2xl:w-[400px] flex-shrink-0">
            <DetailPanel
              animal={selectedAnimal}
              onClose={() => setSelectedAnimal(null)}
              weightEntries={weightEntries}
              weightInput={weightInput}
              setWeightInput={setWeightInput}
              weightDateInput={weightDateInput}
              setWeightDateInput={setWeightDateInput}
              addWeightEntry={addWeightEntry}
              renderWeightChart={renderWeightChart}
              processes={processes}
              processLoading={processLoading}
              newStepType={newStepType}
              setNewStepType={setNewStepType}
              newStepDescription={newStepDescription}
              setNewStepDescription={setNewStepDescription}
              handleAddStep={handleAddStep}
            />
          </div>
        </div>
      </div>

      {/* ── Add Modal ── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Animal" maxWidth="max-w-2xl">
        <form className="grid md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1" onSubmit={handleAdd}>
          <FormField label="Name" icon={<PawPrint size={10} />}>
            <input className={inputClass} placeholder="e.g., Bella" value={newForm.name}
              onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} required />
          </FormField>
          <FormField label="Species" icon={<Bone size={10} />}>
            <select className={selectClass} value={newForm.species}
              onChange={e => setNewForm(p => ({ ...p, species: e.target.value }))} required>
              <option value="">Select species</option>
              <option value="cow">🐄 Cow</option>
              <option value="dog">🐕 Dog</option>
              <option value="sheep">🐑 Sheep</option>
              <option value="chicken">🐔 Chicken</option>
            </select>
          </FormField>
          <FormField label="Breed">
            <input className={inputClass} placeholder="e.g., Holstein" value={newForm.breed}
              onChange={e => setNewForm(p => ({ ...p, breed: e.target.value }))} />
          </FormField>
          <FormField label="Image URL">
            <input className={inputClass} placeholder="https://..." value={newForm.imageUrl}
              onChange={e => setNewForm(p => ({ ...p, imageUrl: e.target.value }))} />
          </FormField>
          <FormField label="Birth Date" icon={<Clock size={10} />}>
            <input type="date" className={inputClass} value={newForm.birthDate}
              onChange={e => setNewForm(p => ({ ...p, birthDate: e.target.value }))} />
          </FormField>
          <FormField label="Sex">
            <select className={selectClass} value={newForm.sex}
              onChange={e => setNewForm(p => ({ ...p, sex: e.target.value }))}>
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </FormField>
          <FormField label="Weight (kg)" icon={<Weight size={10} />}>
            <input type="number" step="0.1" className={inputClass} placeholder="0.0" value={newForm.weight}
              onChange={e => setNewForm(p => ({ ...p, weight: e.target.value }))} />
          </FormField>
          <FormField label="Health Status" icon={<HeartPulse size={10} />}>
            <select className={selectClass} value={newForm.healthStatus}
              onChange={e => setNewForm(p => ({ ...p, healthStatus: e.target.value }))}>
              <option value="">Select</option>
              <option value="Healthy">✅ Healthy</option>
              <option value="Warning">⚠️ Warning</option>
              <option value="Sick">🔴 Sick</option>
            </select>
          </FormField>
          <FormField label="Veterinarian" icon={<Stethoscope size={10} />}>
            <input className={inputClass} placeholder="Dr. Smith" value={newForm.vet}
              onChange={e => setNewForm(p => ({ ...p, vet: e.target.value }))} />
          </FormField>
          <FormField label="Next Visit" icon={<CalendarClock size={10} />}>
            <input type="date" className={inputClass} value={newForm.nextVisit}
              onChange={e => setNewForm(p => ({ ...p, nextVisit: e.target.value }))} />
          </FormField>
          <FormField label="Vaccination Date" icon={<Syringe size={10} />} className="md:col-span-2">
            <input type="date" className={inputClass} value={newForm.vaccinationDate}
              onChange={e => setNewForm(p => ({ ...p, vaccinationDate: e.target.value }))} />
          </FormField>
          <FormField label="Feeding Notes" className="md:col-span-2">
            <textarea className={`${inputClass} h-20 resize-none`} placeholder="Feeding schedule and diet..."
              value={newForm.feeding} onChange={e => setNewForm(p => ({ ...p, feeding: e.target.value }))} />
          </FormField>
          <FormField label="Activity" className="md:col-span-2">
            <textarea className={`${inputClass} h-20 resize-none`} placeholder="Activity level and exercise..."
              value={newForm.activity} onChange={e => setNewForm(p => ({ ...p, activity: e.target.value }))} />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea className={`${inputClass} h-24 resize-none`} placeholder="Additional notes..."
              value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))} />
          </FormField>
          <div className="md:col-span-2 flex items-center gap-3 pt-3 border-t border-gray-100">
            <button
              disabled={addLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white
                px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-green-200
                hover:shadow-lg transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {addLoading ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
              {addLoading ? 'Adding...' : 'Add Animal'}
            </button>
            <button type="button" onClick={() => setShowAddModal(false)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium
                hover:bg-gray-200 transition border border-gray-200">
              Cancel
            </button>
            {addError && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle size={12} /> {addError}
              </span>
            )}
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editingAnimal} onClose={cancelEdit}
        title={`Edit ${editingAnimal?.name || 'Animal'}`} maxWidth="max-w-2xl">
        <form className="grid md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1" onSubmit={saveEdit}>
          <FormField label="Name" icon={<PawPrint size={10} />}>
            <input className={inputClass} value={editForm.name || ''}
              onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
          </FormField>
          <FormField label="Species" icon={<Bone size={10} />}>
            <select className={selectClass} value={editForm.species || ''}
              onChange={e => setEditForm(p => ({ ...p, species: e.target.value }))}>
              <option value="">Select species</option>
              <option value="cow">🐄 Cow</option>
              <option value="dog">🐕 Dog</option>
              <option value="sheep">🐑 Sheep</option>
              <option value="chicken">🐔 Chicken</option>
            </select>
          </FormField>
          <FormField label="Breed">
            <input className={inputClass} value={editForm.breed || ''}
              onChange={e => setEditForm(p => ({ ...p, breed: e.target.value }))} />
          </FormField>
          <FormField label="Image URL">
            <input className={inputClass} value={editForm.imageUrl || ''}
              onChange={e => setEditForm(p => ({ ...p, imageUrl: e.target.value }))} />
          </FormField>
          <FormField label="Birth Date" icon={<Clock size={10} />}>
            <input type="date" className={inputClass} value={editForm.birthDate || ''}
              onChange={e => setEditForm(p => ({ ...p, birthDate: e.target.value }))} />
          </FormField>
          <FormField label="Sex">
            <select className={selectClass} value={editForm.sex || ''}
              onChange={e => setEditForm(p => ({ ...p, sex: e.target.value }))}>
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </FormField>
          <FormField label="Weight (kg)" icon={<Weight size={10} />}>
            <input type="number" step="0.1" className={inputClass} value={editForm.weight || ''}
              onChange={e => setEditForm(p => ({ ...p, weight: e.target.value }))} />
          </FormField>
          <FormField label="Health Status" icon={<HeartPulse size={10} />}>
            <select className={selectClass} value={editForm.healthStatus || ''}
              onChange={e => setEditForm(p => ({ ...p, healthStatus: e.target.value }))}>
              <option value="">Select</option>
              <option value="Healthy">✅ Healthy</option>
              <option value="Warning">⚠️ Warning</option>
              <option value="Sick">🔴 Sick</option>
            </select>
          </FormField>
          <FormField label="Veterinarian" icon={<Stethoscope size={10} />}>
            <input className={inputClass} value={editForm.vet || ''}
              onChange={e => setEditForm(p => ({ ...p, vet: e.target.value }))} />
          </FormField>
          <FormField label="Next Visit" icon={<CalendarClock size={10} />}>
            <input type="date" className={inputClass} value={editForm.nextVisit || ''}
              onChange={e => setEditForm(p => ({ ...p, nextVisit: e.target.value }))} />
          </FormField>
          <FormField label="Vaccination Date" icon={<Syringe size={10} />} className="md:col-span-2">
            <input type="date" className={inputClass} value={editForm.vaccinationDate || ''}
              onChange={e => setEditForm(p => ({ ...p, vaccinationDate: e.target.value }))} />
          </FormField>
          <FormField label="Feeding Notes" className="md:col-span-2">
            <textarea className={`${inputClass} h-20 resize-none`} value={editForm.feeding || ''}
              onChange={e => setEditForm(p => ({ ...p, feeding: e.target.value }))} />
          </FormField>
          <FormField label="Activity" className="md:col-span-2">
            <textarea className={`${inputClass} h-20 resize-none`} value={editForm.activity || ''}
              onChange={e => setEditForm(p => ({ ...p, activity: e.target.value }))} />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea className={`${inputClass} h-24 resize-none`} value={editForm.notes || ''}
              onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
          </FormField>
          <div className="md:col-span-2 flex gap-3 pt-3 border-t border-gray-100">
            <button type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl
                font-semibold shadow-md shadow-green-200 hover:shadow-lg transition-all active:scale-[0.97]
                flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Save Changes
            </button>
            <button type="button" onClick={cancelEdit}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium
                hover:bg-gray-200 transition border border-gray-200">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen(!chatbotOpen)}
        context="animal_management"
        pageData={{
          animals,
          totalCount: animals.length,
          breakdown: { dogs: dogs.length, chickens: chickens.length, sheep: sheeps.length, cows: cows.length },
          healthStats: {
            healthy: animals.filter(a => a.healthStatus === 'Healthy').length,
            warning: animals.filter(a => a.healthStatus === 'Warning').length,
            sick: animals.filter(a => a.healthStatus === 'Sick').length,
          },
          farmId,
        }}
      />
    </div>
  );
};

export default MyAnimals;

