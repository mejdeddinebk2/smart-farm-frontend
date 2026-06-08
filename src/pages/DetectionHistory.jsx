import API_BASE from '../config';
// DetectionHistory.jsx — persistent detection history (localStorage + backend sync)
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FaHistory, FaTrash, FaDownload, FaPaw, FaLeaf,
  FaClock, FaBolt, FaCheckCircle, FaExclamationTriangle,
  FaSearch, FaFilter, FaTimes, FaChartBar, FaCloud,
  FaSync, FaDatabase
} from 'react-icons/fa';

const STORAGE_KEY = 'smartfarm_detection_history';
const MAX_HISTORY  = 50;

/* ─── localStorage helpers ─── */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistLocally(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY))); }
  catch { /* quota exceeded — ignore */ }
}

export function clearHistory() { localStorage.removeItem(STORAGE_KEY); }

/* ─── Save to backend + localStorage ─── */
export async function saveDetection(entry) {
  // 1. Save locally first (instant)
  const current = loadHistory();
  const updated  = [entry, ...current].slice(0, MAX_HISTORY);
  persistLocally(updated);

  // 2. Try to save to backend (non-blocking)
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await axios.post(`${API_BASE}/api/history`, entry, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (e) {
    console.warn('History backend save failed (using localStorage only):', e.message);
  }

  return updated;
}

/* ─── UI helpers ─── */
const ModelBadge = ({ type }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
    type === 'animal' ? 'bg-blue-100 text-blue-700'
    : type === 'plant' ? 'bg-green-100 text-green-700'
    : 'bg-purple-100 text-purple-700'
  }`}>
    {type === 'animal' ? <FaPaw size={8} /> : <FaLeaf size={8} />}
    {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
  </span>
);

const ConfBar = ({ value }) => {
  const pct   = Math.round((value || 0) * 100);
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 font-mono w-8">{pct}%</span>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
const DetectionHistoryPage = () => {
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [source,     setSource]     = useState('local'); // 'local' | 'backend'
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy,     setSortBy]     = useState('newest');
  const [selected,   setSelected]   = useState(null);

  /* ── Load: try backend first, fall back to localStorage ── */
  const loadData = useCallback(async (showSync = false) => {
    if (showSync) setSyncing(true);
    else setLoading(true);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/api/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const backendData = (res.data || []).map((h) => ({
          id:          h.id || Date.now(),
          timestamp:   h.timestamp ? new Date(h.timestamp).toLocaleString() : '—',
          modelType:   h.detectionResult?.modelType || 'unknown',
          filename:    h.detectionResult?.filename  || 'image.jpg',
          topClass:    h.detectionResult?.topClass  || '—',
          topConf:     h.detectionResult?.topConf   || 0,
          count:       h.detectionResult?.count     || 0,
          elapsed:     h.detectionResult?.elapsed   || 0,
          predictions: h.detectionResult?.predictions || [],
          imageBase64: h.imageBase64 || null,
        }));
        // Merge with localStorage (backend wins for duplicates)
        const localData = loadHistory();
        const merged = [...backendData];
        localData.forEach((l) => {
          if (!merged.find((b) => b.id === l.id)) merged.push(l);
        });
        merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setHistory(merged.slice(0, MAX_HISTORY));
        persistLocally(merged);
        setSource('backend');
      } catch {
        // Backend failed — use localStorage
        setHistory(loadHistory());
        setSource('local');
      }
    } else {
      setHistory(loadHistory());
      setSource('local');
    }

    setLoading(false);
    setSyncing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Listen for new detections from other tabs/pages ── */
  useEffect(() => {
    const onStorage = () => setHistory(loadHistory());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ── Clear all ── */
  const handleClear = async () => {
    if (!window.confirm('Clear all detection history? This cannot be undone.')) return;
    clearHistory();
    setHistory([]);
    setSelected(null);
    // Try to clear backend too (best-effort)
    try {
      const token = localStorage.getItem('token');
      // no bulk-delete endpoint yet — just clear locally
    } catch { /* ignore */ }
  };

  /* ── Export JSON ── */
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `detection-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Filter + sort ── */
  const filtered = history
    .filter((h) => {
      if (filterType !== 'all' && h.modelType !== filterType) return false;
      if (search && !h.topClass?.toLowerCase().includes(search.toLowerCase()) &&
          !h.filename?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')     return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'oldest')     return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortBy === 'confidence') return (b.topConf || 0) - (a.topConf || 0);
      if (sortBy === 'count')      return (b.count   || 0) - (a.count   || 0);
      return 0;
    });

  /* ── Stats ── */
  const totalDetections = history.reduce((s, h) => s + (h.count || 0), 0);
  const avgConf = history.length
    ? ((history.reduce((s, h) => s + (h.topConf || 0), 0) / history.length) * 100).toFixed(1)
    : '—';
  const animalRuns = history.filter((h) => h.modelType === 'animal').length;
  const plantRuns  = history.filter((h) => h.modelType === 'plant' || h.modelType === 'leaf').length;

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-green-600" /> Detection History
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-400">
              {history.length} sessions · {totalDetections} total detections
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              source === 'backend' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {source === 'backend'
                ? <><FaCloud size={8} /> Synced with server</>
                : <><FaDatabase size={8} /> Local only</>}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => loadData(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600
                       rounded-xl text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
            <FaSync size={11} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600
                       rounded-xl text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all">
            <FaDownload size={11} /> Export JSON
          </button>
          <button onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-500
                       rounded-xl text-sm hover:bg-red-50 transition-all">
            <FaTrash size={11} /> Clear All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sessions',       value: history.length,          icon: <FaHistory />,  color: 'text-blue-600 bg-blue-50'   },
          { label: 'Detections',     value: totalDetections,         icon: <FaChartBar />, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Confidence', value: `${avgConf}%`,           icon: <FaBolt />,     color: 'text-yellow-600 bg-yellow-50'},
          { label: 'Animal / Plant', value: `${animalRuns} / ${plantRuns}`, icon: <FaPaw />, color: 'text-purple-600 bg-purple-50'},
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by label or filename…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-green-200">
          <option value="all">All Types</option>
          <option value="animal">Animal</option>
          <option value="plant">Plant</option>
          <option value="leaf">Leaf</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-green-200">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="confidence">Best Confidence</option>
          <option value="count">Most Detections</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FaHistory className="text-gray-200 text-5xl mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No detection history yet</p>
          <p className="text-sm text-gray-300 mt-1">
            Run a detection in Animal or Plant AI to save it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(selected?.id === h.id ? null : h)}
              className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                selected?.id === h.id
                  ? 'border-green-300 shadow-md shadow-green-100/30'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    h.modelType === 'animal' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {h.modelType === 'animal' ? <FaPaw size={14} /> : <FaLeaf size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-800">{h.topClass || 'Unknown'}</span>
                      <ModelBadge type={h.modelType || 'unknown'} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <FaClock size={9} /> {h.timestamp}
                      <span>·</span><FaBolt size={9} /> {h.elapsed}ms
                      <span>·</span>{h.count} detection{h.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-gray-700">
                    {Math.round((h.topConf || 0) * 100)}%
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 max-w-[100px] truncate">{h.filename}</p>
                </div>
              </div>

              <div className="mt-3">
                <ConfBar value={h.topConf || 0} />
              </div>

              {/* Thumbnail if available */}
              {h.imageBase64 && selected?.id === h.id && (
                <div className="mt-3">
                  <img
                    src={`data:image/jpeg;base64,${h.imageBase64}`}
                    alt="Detection"
                    className="w-full max-h-48 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Expanded predictions */}
              <AnimatePresence>
                {selected?.id === h.id && h.predictions && h.predictions.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        All Detections ({h.predictions.length})
                      </p>
                      <div className="space-y-2">
                        {h.predictions.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700 font-medium w-32 truncate">
                              {p.class || p.label || 'Unknown'}
                            </span>
                            <div className="flex-1">
                              <ConfBar value={p.confidence} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetectionHistoryPage;


