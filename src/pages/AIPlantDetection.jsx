import API_BASE from '../config';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaLeaf, FaCamera, FaUpload, FaSync, FaDownload, FaEye,
  FaCheckCircle, FaExclamationTriangle, FaCopy, FaTimes,
  FaExpand, FaHistory, FaClock, FaBolt, FaChartBar,
  FaChevronDown, FaImage, FaList, FaCode, FaShieldAlt,
  FaMicrochip, FaFingerprint, FaCircle, FaInfoCircle,
  FaChartPie, FaFileExport, FaSearchPlus, FaArrowRight,
  FaLayerGroup, FaCrosshairs, FaWaveSquare, FaStar,
  FaDatabase, FaSeedling, FaHeartbeat, FaBug, FaVial,
  FaExchangeAlt
} from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import AIChatbot from '../components/AIChatbot';
import { saveDetection } from './DetectionHistory';

/* ═══════════════════ CONSTANTS ═══════════════════ */
const PALETTE = [
  '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#a855f7',
  '#14b8a6', '#0ea5e9', '#e11d48', '#6366f1', '#f97316',
];

/* ═══════════════════ HELPERS ═══════════════════ */
function colorFor(label, map) {
  if (map[label]) return map[label];
  map[label] = PALETTE[Object.keys(map).length % PALETTE.length];
  return map[label];
}

/* ═══════════════════ GRID BACKGROUND ═══════════════════ */
const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    />
  </div>
);

/* ═══════════════════ FLOATING PARTICLES ═══════════════════ */
const FloatingParticle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="pointer-events-none absolute rounded-full"
    style={{
      width: size, height: size,
      background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
    }}
    initial={{ x, y, opacity: 0, scale: 0 }}
    animate={{
      y: [y, y - 150, y], x: [x, x + 35, x - 25, x],
      opacity: [0, 0.4, 0.1, 0], scale: [0, 1.2, 0.3, 0],
    }}
    transition={{ delay, duration, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ═══════════════════ LIVE CLOCK ═══════════════════ */
const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums text-xs text-gray-500 flex items-center gap-1.5 font-mono">
      <FaClock className="text-green-500 animate-pulse" />
      {now.toLocaleTimeString()}
    </span>
  );
};

/* ═══════════════════ CONFIDENCE BAR ═══════════════════ */
const ConfidenceBar = ({ value, color = '#22c55e' }) => (
  <div className="flex items-center gap-2 w-full">
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(value * 100, 3)}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
    <span className="text-[10px] tabular-nums text-gray-500 w-12 text-right font-mono font-bold">
      {(value * 100).toFixed(1)}%
    </span>
  </div>
);

/* ═══════════════════ STAT CARD ═══════════════════ */
const StatCard = ({ icon, label, value, sub, color = 'green', delay = 0 }) => {
  const colors = {
    green: 'from-green-500 to-emerald-500 bg-green-50 border-green-200 text-green-700',
    blue: 'from-blue-500 to-sky-500 bg-blue-50 border-blue-200 text-blue-700',
    purple: 'from-purple-500 to-violet-500 bg-purple-50 border-purple-200 text-purple-700',
    amber: 'from-amber-500 to-orange-500 bg-amber-50 border-amber-200 text-amber-700',
    red: 'from-red-500 to-rose-500 bg-red-50 border-red-200 text-red-700',
    teal: 'from-teal-500 to-cyan-500 bg-teal-50 border-teal-200 text-teal-700',
  };
  const c = colors[color] || colors.green;
  const parts = c.split(' ');
  const grad = `${parts[0]} ${parts[1]}`;
  const bg = parts[2];
  const border = parts[3];
  const text = parts[4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`${bg} ${border} border rounded-2xl p-4 transition-all duration-300
                  hover:shadow-lg cursor-default`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center
                         justify-center text-white shadow-md`}>
          {icon}
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className={`text-2xl font-black ${text}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AIPlantDetection() {
  /* ── Core state ── */
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  /* ── Controls ── */
  const [confidenceThreshold, setConfidenceThreshold] = useState(25);
  const [displayMode, setDisplayMode] = useState('Draw Confidence');
  const [modelType, setModelType] = useState('plant'); // plant | leaf

  /* ── UI state ── */
  const [usingCamera, setUsingCamera] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [resultTab, setResultTab] = useState('summary');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [processingTime, setProcessingTime] = useState(0);

  /* ── Refs ── */
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ── Particles ── */
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `p-${i}`,
        x: Math.random() * 1400,
        y: Math.random() * 700 + 50,
        size: Math.random() * 16 + 6,
        delay: Math.random() * 8,
        duration: Math.random() * 10 + 8,
      })),
    []
  );

  /* ═══════════════════ FILE HANDLING ═══════════════════ */
  const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Please drop an image file.');
    if (f.size > 10 * 1024 * 1024) return toast.error('File must be under 10 MB.');
    setSelectedFile(f);
    setPreview(URL.createObjectURL(f));
    setDetectionResult(null);
    setUsingCamera(false);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Please upload an image file.');
    if (f.size > 10 * 1024 * 1024) return toast.error('File must be under 10 MB.');
    setSelectedFile(f);
    setPreview(URL.createObjectURL(f));
    setDetectionResult(null);
    setUsingCamera(false);
  };

  /* ═══════════════════ CAMERA ═══════════════════ */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 960, height: 540 },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setUsingCamera(true);
      setSelectedFile(null);
      setPreview(null);
      setDetectionResult(null);
    } catch {
      toast.error('Could not access camera.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    c.getContext('2d').drawImage(video, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setUsingCamera(false);
      video.srcObject?.getTracks().forEach((t) => t.stop());
    }, 'image/jpeg', 0.9);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreview(null);
    setDetectionResult(null);
    setUsingCamera(false);
    setHighlightId(null);
    setProcessingTime(0);
    videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
  };

  /* ═══════════════════ DETECTION (UNCHANGED CORE) ═══════════════════ */
  const handleDetection = async () => {
    if (!selectedFile) return toast.error('Please select or capture an image first.');
    const fd = new FormData();
    fd.append('file', selectedFile);
    setLoading(true);
    const t0 = performance.now();

    try {
      const res = await axios.post(
        `http://localhost:8080/api/detect?model=${modelType}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const elapsed = Math.round(performance.now() - t0);
      setProcessingTime(elapsed);

      const data = Array.isArray(res.data) ? res.data : [];
      const preds = data.map((d, i) => ({
        id: i,
        class: d.label,
        confidence: d.confidence,
        x1: d.bbox[0], y1: d.bbox[1], x2: d.bbox[2], y2: d.bbox[3],
      }));

      setDetectionResult({ status: 'success', message: 'OK', predictions: preds });
      setHighlightId(null);
      setResultTab('summary');

      // Push to history (in-component + localStorage + backend)
      const topPred = [...preds].sort((a, b) => b.confidence - a.confidence)[0];
      const historyEntry = {
        id:          Date.now(),
        timestamp:   new Date().toLocaleString(),
        count:       preds.length,
        filename:    selectedFile.name || 'capture.jpg',
        topClass:    topPred?.class || '—',
        topConf:     topPred?.confidence || 0,
        elapsed,
        modelType:   'plant',   // ← change to 'plant' in AIPlantDetection.jsx
        predictions: preds.map((p) => ({
          class:      p.class,
          confidence: p.confidence,
        })),
      };
      setDetectionHistory((prev) => [historyEntry, ...prev].slice(0, 15));
      saveDetection(historyEntry); // ← saves to localStorage + backend
      
      toast.success(`Detected ${preds.length} object(s) with "${modelType}" model in ${elapsed}ms!`);
    } catch (e) {
      console.error(e);
      setDetectionResult({ status: 'error', predictions: [] });
      toast.error('Detection failed — check backend.');
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════ FILTERED + DERIVED ═══════════════════ */
  const filteredPreds = useMemo(() => {
    if (!detectionResult?.predictions) return [];
    const t = confidenceThreshold / 100;
    return detectionResult.predictions.filter((p) => (p.confidence ?? 0) >= t);
  }, [detectionResult, confidenceThreshold]);

  const { colorMap, classCounts, avgConf, maxConf, maxLabel, minConf, uniqueCount } =
    useMemo(() => {
      const map = {};
      const counts = {};
      let sum = 0, max = -1, min = 2, maxL = '';
      filteredPreds.forEach((p) => {
        counts[p.class] = (counts[p.class] || 0) + 1;
        const c = p.confidence || 0;
        sum += c;
        if (c > max) { max = c; maxL = p.class; }
        if (c < min) min = c;
        colorFor(p.class, map);
      });
      return {
        colorMap: map,
        classCounts: counts,
        avgConf: filteredPreds.length ? sum / filteredPreds.length : 0,
        maxConf: max > 0 ? max : 0,
        maxLabel: maxL,
        minConf: min < 2 ? min : 0,
        uniqueCount: Object.keys(counts).length,
      };
    }, [filteredPreds]);

  /* ═══════════════════ CHART DATA ═══════════════════ */
  const doughnutData = useMemo(() => {
    const labels = Object.keys(classCounts);
    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => classCounts[l]),
          backgroundColor: labels.map((l) => colorMap[l] || PALETTE[0]),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 8,
        },
      ],
    };
  }, [classCounts, colorMap]);

  const barData = useMemo(() => {
    const top = [...filteredPreds]
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 8);
    return {
      labels: top.map((p) => p.class),
      datasets: [
        {
          label: 'Confidence (%)',
          data: top.map((p) => (p.confidence || 0) * 100),
          backgroundColor: top.map((p) => (colorMap[p.class] || PALETTE[0]) + 'CC'),
          borderColor: top.map((p) => colorMap[p.class] || PALETTE[0]),
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  }, [filteredPreds, colorMap]);

  const doughnutOptions = {
    cutout: '62%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const barOptions = {
    indexAxis: 'y',
    scales: {
      x: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` }, grid: { color: '#f3f4f6' } },
      y: { grid: { display: false } },
    },
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  /* ═══════════════════ CANVAS DRAWING ═══════════════════ */
  const drawBase = useCallback(async () => {
    if (!preview || !containerRef.current || !canvasRef.current) return;
    const containerWidth = containerRef.current.clientWidth || 800;
    const img = new Image();
    img.src = preview;
    await img.decode();
    const scale = containerWidth / img.naturalWidth;
    const height = Math.round(img.naturalHeight * scale);
    const maxH = 560;
    const finalScale = height > maxH ? maxH / img.naturalHeight : scale;
    const w = Math.round(img.naturalWidth * finalScale);
    const h = Math.round(img.naturalHeight * finalScale);
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    c.width = w;
    c.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  }, [preview]);

  const drawDetections = useCallback(async () => {
    await drawBase();
    if (!filteredPreds.length || !preview || !canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const img = new Image();
    img.src = preview;
    await img.decode();
    const sx = c.width / img.naturalWidth;
    const sy = c.height / img.naturalHeight;

    const highlighted = filteredPreds.find((p) => p.id === highlightId);
    const regular = filteredPreds.filter((p) => p.id !== highlightId);

    const drawBox = (p, style) => {
      const x = p.x1 * sx,
        y = p.y1 * sy,
        w = (p.x2 - p.x1) * sx,
        h = (p.y2 - p.y1) * sy;
      const color = colorMap[p.class] || '#22c55e';

      // Shadow glow for highlighted
      if (style.highlight) {
        ctx.shadowColor = color + '80';
        ctx.shadowBlur = 16;
      }

      ctx.lineWidth = style.lineWidth;
      ctx.strokeStyle = color;
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;

      // Corner accents
      const corner = Math.min(w, h, 20) * 0.4;
      ctx.lineWidth = style.lineWidth + 1;
      ctx.beginPath();
      ctx.moveTo(x, y + corner); ctx.lineTo(x, y); ctx.lineTo(x + corner, y);
      ctx.moveTo(x + w - corner, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + corner);
      ctx.moveTo(x + w, y + h - corner); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - corner, y + h);
      ctx.moveTo(x + corner, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - corner);
      ctx.stroke();
      ctx.lineWidth = style.lineWidth;

      if (displayMode !== 'Hide Labels') {
        const text =
          displayMode === 'Draw Confidence'
            ? `${p.class} ${(p.confidence * 100).toFixed(1)}%`
            : p.class;
        ctx.font = `${style.fontWeight} 13px "Inter", system-ui, sans-serif`;
        const pad = 8, th = 22, tw = ctx.measureText(text).width;
        const ly = y > th + 8 ? y - th - 4 : y + 4;
        // Rounded tag background
        ctx.beginPath();
        const r = 6;
        const bx = x, by = ly, bw = tw + pad * 2, bh = th;
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by); ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r); ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        ctx.lineTo(bx + r, by + bh); ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r); ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fillStyle = color + 'E8';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x + pad, ly + th - 7);
      }
    };

    regular.forEach((p) => drawBox(p, { lineWidth: 2.5, fontWeight: '600', highlight: false }));
    if (highlighted) drawBox(highlighted, { lineWidth: 4, fontWeight: '800', highlight: true });
  }, [drawBase, filteredPreds, displayMode, preview, highlightId, colorMap]);

  useEffect(() => { drawBase(); }, [drawBase]);
  useEffect(() => { drawDetections(); }, [drawDetections]);
  useEffect(() => {
    const onResize = () => drawDetections();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawDetections]);

  /* ═══════════════════ KEYBOARD SHORTCUTS ═══════════════════ */
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'd' || k === 'enter') { e.preventDefault(); handleDetection(); }
      if (k === 'escape') setFullscreenImage(null);
      if (k === 'c') clearAll();
      if (k === 'f' && canvasRef.current) {
        setFullscreenImage(canvasRef.current.toDataURL('image/png'));
      }
      if (k === 'm') setModelType((prev) => (prev === 'plant' ? 'leaf' : 'plant'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedFile, loading]); // eslint-disable-line

  /* ═══════════════════ EXPORT HELPERS ═══════════════════ */
  const copyResults = () => {
    if (!detectionResult) return;
    navigator.clipboard.writeText(
      JSON.stringify({ ...detectionResult, predictions: filteredPreds }, null, 2)
    );
    toast.success('Results copied to clipboard!');
  };

  const downloadJSON = () => {
    if (!detectionResult) return;
    const blob = new Blob(
      [JSON.stringify({ ...detectionResult, predictions: filteredPreds }, null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plant-detections-${modelType}-${Date.now()}.json`;
    a.click();
    toast.success('JSON downloaded!');
  };

  const downloadCSV = () => {
    if (!filteredPreds.length) return;
    const header = 'Class,Confidence,X1,Y1,X2,Y2\n';
    const rows = filteredPreds
      .map((p) => `${p.class},${(p.confidence * 100).toFixed(1)}%,${p.x1},${p.y1},${p.x2},${p.y2}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plant-detections-${modelType}-${Date.now()}.csv`;
    a.click();
    toast.success('CSV downloaded!');
  };

  const downloadAnnotatedImage = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.download = `plant-annotated-${modelType}-${Date.now()}.png`;
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
    toast.success('Annotated image saved!');
  };

  /* ── Model badge ── */
  const modelBadge = {
    plant: { icon: <FaSeedling />, label: 'Plant Disease', cls: 'text-green-600 bg-green-50 border-green-200', file: 'best.pt' },
    leaf: { icon: <FaLeaf />, label: 'Leaf Classification', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', file: 'best_leaf.pt' },
  }[modelType];

  /* ── Result tabs ── */
  const resultTabs = [
    { id: 'summary', label: 'Summary', icon: <FaChartBar className="text-[10px]" /> },
    { id: 'charts', label: 'Charts', icon: <FaChartPie className="text-[10px]" /> },
    { id: 'list', label: 'List', icon: <FaList className="text-[10px]" /> },
    { id: 'json', label: 'JSON', icon: <FaCode className="text-[10px]" /> },
  ];

  /* ── Animation variants ── */
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* ── Backgrounds ── */}
      <GridBackground />
      <div className="pointer-events-none absolute -top-40 -right-40 w-[55rem] h-[55rem] rounded-full bg-green-300/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[55rem] h-[55rem] rounded-full bg-emerald-300/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[70rem] h-[40rem] rounded-full bg-teal-200/5 blur-[160px]" />
      {particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* ═══════ TOP BAR ═══════ */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-3 mb-6
                     bg-white/80 backdrop-blur-xl rounded-2xl border border-green-100/80
                     shadow-sm shadow-green-100/30 px-5 py-3"
        >
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                              font-bold border ${modelBadge.cls}`}>
              {modelBadge.icon}
              {modelBadge.label}
            </span>
            <LiveClock />
            {processingTime > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                <FaBolt className="text-amber-500" /> {processingTime}ms
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {[
              { key: 'D', label: 'Detect' },
              { key: 'C', label: 'Clear' },
              { key: 'M', label: 'Model' },
              { key: 'F', label: 'Fullscreen' },
            ].map((s) => (
              <span key={s.key} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/60 border border-gray-100">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[9px] font-bold border border-gray-200 shadow-sm">
                  {s.key}
                </kbd>
                <span className="text-gray-500">{s.label}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* ═══════ HEADER ═══════ */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full
                       bg-gradient-to-r from-green-100 to-emerald-100 text-green-700
                       text-xs font-bold mb-4 border border-green-200/50 shadow-sm"
          >
            <FaShieldAlt className="text-green-500" />
            YOLOv8 Plant Detection Engine
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Plant Detection
            </span>{' '}
            Studio
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            Upload or capture an image to detect plant diseases or classify leaves with AI.
            Analyze results with interactive charts, confidence scores, and exportable data.
          </p>
        </motion.div>

        {/* ═══════ MAIN GRID ═══════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ────────── LEFT PANEL ────────── */}
          <motion.div variants={fadeUp} className="xl:col-span-3 space-y-5">
            {/* Upload Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <FaUpload className="text-green-600 text-sm" />
                  </div>
                  Input
                </h2>
                {(preview || usingCamera) && (
                  <button
                    onClick={clearAll}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    title="Clear (C)"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  dragActive
                    ? 'border-green-400 bg-green-50 shadow-lg shadow-green-100/50 scale-[1.02]'
                    : preview
                    ? 'border-green-200 bg-white'
                    : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                }`}
              >
                {dragActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-green-500/5 backdrop-blur-[1px] flex items-center
                               justify-center z-10 rounded-2xl"
                  >
                    <div className="text-green-600 font-bold text-sm flex items-center gap-2">
                      <FaDownload className="animate-bounce" /> Drop image here
                    </div>
                  </motion.div>
                )}

                {!preview && !usingCamera ? (
                  <div
                    className="p-8 text-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100
                                    flex items-center justify-center group-hover:scale-110 transition-transform duration-300
                                    shadow-inner border border-green-200/50">
                      <FaImage className="text-green-500 text-2xl" />
                    </div>
                    <p className="text-gray-700 font-semibold text-sm">Click to select an image</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Or drag & drop • JPG, PNG • Max 10 MB
                    </p>
                  </div>
                ) : preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="selected"
                      className="w-full max-h-48 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition rounded-2xl
                                    flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold
                                   text-gray-700 shadow-lg"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {!usingCamera ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startCamera}
                    className="bg-gradient-to-r from-gray-50 to-green-50 hover:from-green-50 hover:to-green-100
                               text-green-700 py-2.5 rounded-xl flex items-center justify-center gap-2
                               text-sm font-semibold border border-green-200 transition-all duration-300"
                  >
                    <FaCamera /> Camera
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={capturePhoto}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl
                               flex items-center justify-center gap-2 text-sm font-bold shadow-lg
                               shadow-green-200/50"
                  >
                    <FaCamera /> Capture
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDetection}
                  disabled={loading || !selectedFile}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                             text-white py-2.5 rounded-xl flex items-center justify-center gap-2
                             text-sm font-bold shadow-lg shadow-green-200/50
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? <FaSync className="animate-spin" /> : <FaCrosshairs />}
                  {loading ? 'Analyzing…' : 'Detect'}
                </motion.button>
              </div>
            </div>

            {/* Controls Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 p-5">
              <h2 className="text-sm font-bold flex items-center gap-2 text-gray-800 mb-4">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaLayerGroup className="text-green-600 text-[10px]" />
                </div>
                Controls
              </h2>

              <div className="space-y-5">
                {/* Model Selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Detection Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'plant', label: 'Plant Disease', icon: <FaSeedling className="text-[10px]" />, file: 'best.pt' },
                      { value: 'leaf', label: 'Leaf Classify', icon: <FaLeaf className="text-[10px]" />, file: 'best_leaf.pt' },
                    ].map((m) => {
                      const active = modelType === m.value;
                      return (
                        <button
                          key={m.value}
                          onClick={() => setModelType(m.value)}
                          className={`relative px-3 py-3 text-[11px] rounded-xl border-2 font-semibold
                                      flex flex-col items-center gap-1.5 transition-all duration-300 ${
                                        active
                                          ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200/50'
                                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'
                                      }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            active ? 'bg-white/20' : 'bg-green-50'
                          }`}>
                            {m.icon}
                          </div>
                          <span>{m.label}</span>
                          <span className={`text-[8px] font-mono ${active ? 'text-green-200' : 'text-gray-400'}`}>
                            {m.file}
                          </span>
                          {active && (
                            <motion.div
                              layoutId="model-indicator"
                              className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-green-600
                                         flex items-center justify-center"
                            >
                              <FaCheckCircle className="text-green-600 text-[6px]" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[9px] text-gray-400">
                    <FaExchangeAlt className="text-green-500" />
                    Press <kbd className="px-1 py-0.5 rounded bg-gray-100 border text-gray-500 font-mono font-bold">M</kbd> to switch
                  </div>
                </div>

                {/* Confidence Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-600">Confidence Threshold</label>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      confidenceThreshold > 70 ? 'bg-green-100 text-green-700'
                        : confidenceThreshold > 40 ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {confidenceThreshold}%
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(+e.target.value)}
                    className="w-full accent-green-600 h-2 rounded-full"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                    <span>Show all</span><span>High confidence only</span>
                  </div>
                </div>

                {/* Label Mode */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Label Display</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Draw Confidence', 'Draw Labels', 'Hide Labels'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setDisplayMode(m)}
                        className={`px-2 py-2 text-[10px] rounded-lg border font-semibold transition-all duration-200 ${
                          displayMode === m
                            ? 'bg-green-600 text-white border-green-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {m.replace('Draw ', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detection History */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 overflow-hidden">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="w-full p-4 flex items-center justify-between hover:bg-green-50/50 transition"
              >
                <h2 className="text-sm font-bold flex items-center gap-2 text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                    <FaHistory className="text-green-600 text-[10px]" />
                  </div>
                  History
                  {detectionHistory.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {detectionHistory.length}
                    </span>
                  )}
                </h2>
                <motion.div animate={{ rotate: showHistory ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <FaChevronDown className="text-gray-400 text-xs" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    key="history-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {detectionHistory.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">No detections yet.</p>
                      ) : (
                        detectionHistory.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border
                                       bg-gradient-to-r from-gray-50 to-green-50/30 text-xs"
                          >
                            <div>
                              <div className="font-bold text-gray-700 flex items-center gap-1.5">
                                {h.count} object(s)
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                                  h.model === 'plant' ? 'bg-green-100 text-green-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                  {h.model}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {h.topClass} • {h.elapsed}ms
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">{h.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ────────── CENTER PANEL ────────── */}
          <motion.div variants={fadeUp} className="xl:col-span-5">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 p-5 overflow-hidden">
              {/* Canvas toolbar */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <FaSearchPlus className="text-green-600 text-sm" />
                  </div>
                  Preview
                  {filteredPreds.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {filteredPreds.length} detected
                    </span>
                  )}
                </h2>

                <div className="flex items-center gap-1.5">
                  {canvasRef.current && preview && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={downloadAnnotatedImage}
                        className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                        title="Download annotated image"
                      >
                        <FaDownload className="text-sm" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFullscreenImage(canvasRef.current?.toDataURL('image/png'))}
                        className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                        title="Fullscreen (F)"
                      >
                        <FaExpand className="text-sm" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Canvas area */}
              <div
                ref={containerRef}
                className="relative w-full bg-gradient-to-br from-gray-50 to-green-50/30
                           rounded-2xl min-h-[440px] overflow-hidden flex items-center
                           justify-center border border-gray-100"
              >
                {usingCamera ? (
                  <div className="relative w-full">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl" />
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={capturePhoto}
                          className="bg-white text-green-600 px-6 py-2.5 rounded-full shadow-lg
                                     font-bold text-sm flex items-center gap-2"
                        >
                          <FaCamera /> Capture Photo
                        </motion.button>
                        <button
                          onClick={clearAll}
                          className="bg-white/20 text-white px-4 py-2.5 rounded-full text-sm font-medium
                                     backdrop-blur-sm hover:bg-white/30 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : preview ? (
                  <canvas ref={canvasRef} className="w-full h-auto rounded-2xl shadow-sm" />
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100
                                    flex items-center justify-center shadow-inner border border-green-200/50">
                      <FaLeaf className="text-green-400 text-3xl" />
                    </div>
                    <p className="text-gray-400 font-medium">No image selected</p>
                    <p className="text-xs text-gray-300 mt-1">Upload or capture an image to begin</p>
                  </div>
                )}

                {/* Loading overlay */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      key="loading-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center
                                 justify-center rounded-2xl z-20"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
                          <FaLeaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600 text-xs" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">Analyzing image…</div>
                          <div className="text-[10px] text-gray-400">
                            Running {modelType === 'plant' ? 'disease detection' : 'leaf classification'}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick legend */}
              {filteredPreds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {Object.entries(classCounts).map(([label, count]) => (
                    <span
                      key={`legend-${label}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                 bg-gray-50 border text-[11px] font-semibold text-gray-600"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: colorMap[label] }}
                      />
                      {label}
                      <span className="text-gray-400">×{count}</span>
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ────────── RIGHT PANEL ────────── */}
          <motion.div variants={fadeUp} className="xl:col-span-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 p-5 overflow-hidden">
              {/* Header + Export */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <FaChartBar className="text-green-600 text-sm" />
                  </div>
                  Results
                </h2>
                {detectionResult && (
                  <div className="flex items-center gap-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={copyResults}
                      className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                      title="Copy JSON"
                    >
                      <FaCopy className="text-sm" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={downloadJSON}
                      className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                      title="Download JSON"
                    >
                      <FaDownload className="text-sm" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={downloadCSV}
                      className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Download CSV"
                    >
                      <FaFileExport className="text-sm" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-gray-100/80 rounded-xl p-1">
                {resultTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setResultTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                               text-[11px] font-bold transition-all duration-200 ${
                                 resultTab === tab.id
                                   ? 'bg-white text-green-700 shadow-sm'
                                   : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                               }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {!detectionResult ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-green-50
                                  flex items-center justify-center mb-4 shadow-inner border border-gray-200/50">
                    <FaLeaf className="text-gray-300 text-2xl" />
                  </div>
                  <p className="text-gray-400 font-medium text-sm">No results yet</p>
                  <p className="text-xs text-gray-300 mt-1">Run a detection to see analysis</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {/* ── SUMMARY TAB ── */}
                    {resultTab === 'summary' && (
                      <motion.div
                        key="tab-summary"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-4"
                      >
                        {/* Status banner */}
                        <div className={`rounded-2xl p-4 border-2 ${
                          detectionResult.status === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 border-green-200'
                            : 'bg-gradient-to-r from-red-50 to-rose-50/50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            {detectionResult.status === 'success' ? (
                              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <FaCheckCircle className="text-green-600" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <FaExclamationTriangle className="text-red-600" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-sm text-gray-800">
                                {filteredPreds.length} object(s) detected
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {detectionResult.predictions?.length || 0} total •{' '}
                                {filteredPreds.length} above {confidenceThreshold}% •{' '}
                                <span className={`font-bold ${modelType === 'plant' ? 'text-green-600' : 'text-emerald-600'}`}>
                                  {modelType} model
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <StatCard
                            icon={<FaLayerGroup className="text-xs" />}
                            label="Detected"
                            value={filteredPreds.length}
                            sub={`${uniqueCount} unique`}
                            color="green"
                            delay={0}
                          />
                          <StatCard
                            icon={<FaWaveSquare className="text-xs" />}
                            label="Avg Conf"
                            value={`${(avgConf * 100).toFixed(1)}%`}
                            color="teal"
                            delay={0.05}
                          />
                          <StatCard
                            icon={<FaStar className="text-xs" />}
                            label="Best Match"
                            value={maxLabel || '—'}
                            sub={maxConf > 0 ? `${(maxConf * 100).toFixed(1)}%` : ''}
                            color="amber"
                            delay={0.1}
                          />
                          <StatCard
                            icon={<FaBolt className="text-xs" />}
                            label="Speed"
                            value={`${processingTime}ms`}
                            color="purple"
                            delay={0.15}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ── CHARTS TAB ── */}
                    {resultTab === 'charts' && (
                      <motion.div
                        key="tab-charts"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-5"
                      >
                        <div className="rounded-2xl p-4 border bg-gradient-to-br from-white to-green-50/30">
                          <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FaChartPie className="text-green-500" /> Class Distribution
                          </h4>
                          {Object.keys(classCounts).length ? (
                            <div style={{ height: 220 }}>
                              <Doughnut data={doughnutData} options={doughnutOptions} />
                            </div>
                          ) : (
                            <p className="text-gray-400 text-xs italic py-8 text-center">
                              No classes above threshold
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl p-4 border bg-gradient-to-br from-white to-green-50/30">
                          <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FaChartBar className="text-green-500" /> Top Confidences
                          </h4>
                          {filteredPreds.length ? (
                            <div style={{ height: Math.max(filteredPreds.length * 36, 160) }}>
                              <Bar data={barData} options={barOptions} />
                            </div>
                          ) : (
                            <p className="text-gray-400 text-xs italic py-8 text-center">
                              No detections to chart
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* ── LIST TAB ── */}
                    {resultTab === 'list' && (
                      <motion.div
                        key="tab-list"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        className="space-y-2"
                      >
                        {filteredPreds.length === 0 ? (
                          <p className="text-gray-400 text-xs italic py-8 text-center">
                            No detections above {confidenceThreshold}% threshold.
                          </p>
                        ) : (
                          filteredPreds.map((p, idx) => (
                            <motion.button
                              key={`det-${p.id}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              onClick={() => setHighlightId(p.id === highlightId ? null : p.id)}
                              className={`w-full flex items-center gap-3 border-2 rounded-2xl px-4 py-3
                                         text-left transition-all duration-300 group ${
                                           p.id === highlightId
                                             ? 'border-green-400 bg-green-50/80 shadow-lg shadow-green-100/50 scale-[1.01]'
                                             : 'border-gray-100 hover:border-green-200 hover:bg-green-50/30 hover:shadow-sm'
                                         }`}
                            >
                              <div
                                className="w-3 h-10 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: colorMap[p.class] || PALETTE[0] }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-gray-800 truncate">{p.class}</div>
                                <div className="mt-1">
                                  <ConfidenceBar value={p.confidence} color={colorMap[p.class]} />
                                </div>
                              </div>
                              <FaArrowRight className={`text-xs transition-all duration-300 shrink-0 ${
                                p.id === highlightId
                                  ? 'text-green-500 translate-x-1'
                                  : 'text-gray-300 group-hover:text-green-400'
                              }`} />
                            </motion.button>
                          ))
                        )}
                      </motion.div>
                    )}

                    {/* ── JSON TAB ── */}
                    {resultTab === 'json' && (
                      <motion.div
                        key="tab-json"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                      >
                        <div className="bg-gray-950 rounded-2xl p-4 border border-gray-800 overflow-hidden">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                              <FaCircle className="text-green-500 text-[4px]" /> response.json
                            </span>
                            <button
                              onClick={copyResults}
                              className="text-[10px] text-gray-500 hover:text-green-400 transition
                                         flex items-center gap-1"
                            >
                              <FaCopy className="text-[8px]" /> Copy
                            </button>
                          </div>
                          <pre className="text-[10px] text-green-400 font-mono overflow-auto max-h-96
                                          leading-relaxed custom-scrollbar">
                            {JSON.stringify(
                              {
                                status: detectionResult.status,
                                model: modelType,
                                count: filteredPreds.length,
                                predictions: filteredPreds,
                              },
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ═══════ MODEL INFO (Collapsible) ═══════ */}
        <motion.div variants={fadeUp} className="mt-8">
          <motion.button
            whileHover={{ scale: 1.003 }}
            onClick={() => setShowModelInfo((v) => !v)}
            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-5
                       border border-green-100 flex items-center justify-between
                       hover:shadow-md hover:border-green-200 transition-all duration-300"
          >
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FaInfoCircle className="text-green-600" />
              </div>
              Model & Architecture Info
              <span className="text-[10px] font-normal text-gray-400">
                {showModelInfo ? 'Click to collapse' : 'Technical details'}
              </span>
            </h3>
            <motion.div animate={{ rotate: showModelInfo ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <FaChevronDown className="text-gray-400" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showModelInfo && (
              <motion.div
                key="model-info"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  {[
                    {
                      icon: <FaDatabase className="text-green-500" />,
                      title: 'Models',
                      value: 'best.pt + best_leaf.pt',
                      gradient: 'from-green-500 to-emerald-500',
                    },
                    {
                      icon: <FaMicrochip className="text-purple-500" />,
                      title: 'Framework',
                      value: 'Ultralytics YOLOv8',
                      gradient: 'from-purple-500 to-violet-500',
                    },
                    {
                      icon: <FaLayerGroup className="text-teal-500" />,
                      title: 'Backend',
                      value: 'Spring Boot + Python',
                      gradient: 'from-teal-500 to-cyan-500',
                    },
                    {
                      icon: <FaFingerprint className="text-amber-500" />,
                      title: 'Endpoint',
                      value: `POST /api/detect?model=${modelType}`,
                      gradient: 'from-amber-500 to-orange-500',
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="relative p-5 rounded-2xl border bg-white shadow-sm hover:shadow-lg
                                 transition-all duration-300 overflow-hidden group"
                    >
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-60`} />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center
                                       group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-gray-800">{item.value}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══════ FOOTER ═══════ */}
        <motion.div variants={fadeUp} className="text-center mt-8 pb-6">
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="text-green-500" /> Plant Detection Studio v2.0
            </span>
            <span>•</span>
            <span>YOLOv8 + Spring Boot + React</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaHeartbeat className="text-red-400 text-[10px]" /> Built with care
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ═══════ FULLSCREEN MODAL ═══════ */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            key="fullscreen-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center
                       justify-center p-4 cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.div
              key="fullscreen-content"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenImage}
                alt="Fullscreen annotated"
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={downloadAnnotatedImage}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white
                             hover:bg-white/20 transition shadow-lg"
                  title="Download"
                >
                  <FaDownload />
                </button>
                <button
                  onClick={() => setFullscreenImage(null)}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white
                             hover:bg-white/20 transition shadow-lg"
                  title="Close (Esc)"
                >
                  <FaTimes />
                </button>
              </div>
              {filteredPreds.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl
                                px-4 py-2 text-white text-sm font-medium flex items-center gap-2">
                  <FaLeaf className="text-green-400" />
                  {filteredPreds.length} detection(s) • {uniqueCount} class(es) •{' '}
                  <span className="text-green-300">{modelType}</span> model
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ CHATBOT ═══════ */}
      <AIChatbot
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen(!chatbotOpen)}
        context="plant_detection"
      />

      {/* Scrollbar + slider styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-track {
          height: 6px;
          border-radius: 99px;
          background: linear-gradient(to right, #dcfce7, #22c55e);
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #22c55e;
          box-shadow: 0 2px 6px rgba(34,197,94,0.3);
          cursor: pointer;
          margin-top: -7px;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 10px rgba(34,197,94,0.5);
        }
      `}</style>
    </div>
  );
}

