import API_BASE from '../config';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaLeaf, FaPaw, FaRocket, FaCheckCircle, FaExclamationTriangle,
  FaServer, FaSync, FaKeyboard, FaCircle, FaClock, FaChartBar,
  FaBolt, FaShieldAlt, FaArrowRight, FaWifi, FaDatabase,
  FaMicrochip, FaHistory, FaInfoCircle, FaTimes, FaTerminal,
  FaNetworkWired, FaCog, FaPlay, FaStopCircle, FaChevronDown,
  FaSearch, FaExternalLinkAlt, FaGlobe, FaHeartbeat, FaCheckDouble,
  FaLayerGroup, FaFingerprint, FaSeedling, FaDog, FaCode
} from 'react-icons/fa';
import AIChatbot from '../components/AIChatbot';

/* ═══════════════════ FLOATING PARTICLES ═══════════════════ */
const FloatingParticle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="pointer-events-none absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)`,
    }}
    initial={{ x, y, opacity: 0, scale: 0 }}
    animate={{
      y: [y, y - 160, y],
      x: [x, x + 40, x - 30, x],
      opacity: [0, 0.5, 0.15, 0],
      scale: [0, 1.2, 0.4, 0],
    }}
    transition={{ delay, duration, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ═══════════════════ GRID BACKGROUND ═══════════════════ */
const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.008]"
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg, transparent, transparent 80px, rgba(34,197,94,0.3) 80px, rgba(34,197,94,0.3) 81px
        )`,
      }}
    />
  </div>
);

/* ═══════════════════ STATUS BADGE ═══════════════════ */
const StatusBadge = ({ status, label, showPulse = false, size = 'sm' }) => {
  const map = {
    up: {
      icon: <FaCheckCircle />,
      cls: 'text-green-700 bg-green-50 border-green-200',
      pulse: 'bg-green-500',
    },
    down: {
      icon: <FaExclamationTriangle />,
      cls: 'text-red-700 bg-red-50 border-red-200',
      pulse: 'bg-red-500',
    },
    warn: {
      icon: <FaExclamationTriangle />,
      cls: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      pulse: 'bg-yellow-500',
    },
    checking: {
      icon: <FaSync className="animate-spin" />,
      cls: 'text-blue-700 bg-blue-50 border-blue-200',
      pulse: 'bg-blue-500',
    },
    unknown: {
      icon: <FaRocket />,
      cls: 'text-gray-700 bg-gray-50 border-gray-200',
      pulse: 'bg-gray-400',
    },
  };
  const cfg = map[status] || map.unknown;
  const sizeClass = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold border
                  ${sizeClass} ${cfg.cls} transition-all duration-300`}
    >
      {showPulse && status !== 'checking' && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.pulse} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.pulse}`} />
        </span>
      )}
      {cfg.icon} {label}
    </span>
  );
};

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

/* ═══════════════════ LATENCY BAR ═══════════════════ */
const LatencyBar = ({ ms, maxMs = 500 }) => {
  const pct = Math.min((ms / maxMs) * 100, 100);
  const color =
    ms === 0
      ? 'bg-gray-300'
      : ms < 100
      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
      : ms < 300
      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
      : 'bg-gradient-to-r from-red-400 to-rose-500';

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: ms === 0 ? '0%' : `${Math.max(pct, 5)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-gray-500 w-14 text-right font-mono font-bold">
        {ms === 0 ? '—' : `${ms}ms`}
      </span>
    </div>
  );
};

/* ═══════════════════ METRIC PILL ═══════════════════ */
const MetricPill = ({ icon, label, value, variant = 'green' }) => {
  const variants = {
    green: 'bg-green-50 border-green-100 text-green-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    gray: 'bg-gray-50 border-gray-100 text-gray-700',
  };
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs
                  font-medium ${variants[variant]} cursor-default
                  transition-all duration-200 hover:shadow-sm`}
    >
      {icon}
      <span className="hidden sm:inline text-gray-500">{label}</span>
      <span className="font-bold">{value}</span>
    </motion.div>
  );
};

/* ═══════════════════ UPTIME INDICATOR ═══════════════════ */
const UptimeIndicator = ({ checks }) => {
  const last10 = [...checks.slice(-10)];
  while (last10.length < 10) last10.unshift(null);

  return (
    <div className="flex items-center gap-0.5">
      {last10.map((c, i) => (
        <motion.div
          key={`uptime-${i}`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.04 }}
          className={`w-2 h-7 rounded-sm transition-colors duration-300 ${
            c === null
              ? 'bg-gray-200'
              : c
              ? 'bg-gradient-to-t from-green-500 to-emerald-400'
              : 'bg-gradient-to-t from-red-500 to-rose-400'
          }`}
          title={c === null ? 'No data' : c ? 'UP' : 'DOWN'}
        />
      ))}
    </div>
  );
};

/* ═══════════════════ ANIMATED NUMBER ═══════════════════ */
const AnimatedNumber = ({ value }) => (
  <motion.span
    key={value}
    initial={{ y: -10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="inline-block"
  >
    {value}
  </motion.span>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const AIDetectionHub = () => {
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Statuses
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [plantModelStatus, setPlantModelStatus] = useState('unknown');
  const [animalModelStatus, setAnimalModelStatus] = useState('unknown');
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [checkCount, setCheckCount] = useState(0);

  // Latencies
  const [latency, setLatency] = useState({ backend: 0, plant: 0, animal: 0 });

  // Uptime history
  const [uptimeHistory, setUptimeHistory] = useState([]);

  // Logs
  const [logs, setLogs] = useState([]);

  // Refs
  const checkingRef = useRef(false);
  const initRef = useRef(false);
  const intervalRef = useRef(null);

  // Auto refresh
  const [autoRefresh, setAutoRefresh] = useState(false);

  // UI state
  const [showInfo, setShowInfo] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  /* ── addLog ── */
  const addLog = useCallback((msg, type = 'info') => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setLogs((prev) => {
      if (prev.length > 0 && prev[0].msg === msg && Date.now() - (prev[0]._ts || 0) < 200) {
        return prev;
      }
      return [
        { id: uniqueId, msg, type, time: new Date().toLocaleTimeString(), _ts: Date.now() },
        ...prev,
      ].slice(0, 50);
    });
  }, []);

  /* ── ping helper — uses OPTIONS to avoid POST/GET errors ── */
  const ping = useCallback(async (url, opts = {}, timeout = 4000) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    const t0 = performance.now();
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(id);
      return {
        ok: res.ok,
        status: res.status,
        ms: Math.round(performance.now() - t0),
        reachable: true,
      };
    } catch {
      clearTimeout(id);
      return {
        ok: false,
        status: 0,
        ms: Math.round(performance.now() - t0),
        reachable: false,
      };
    }
  }, []);

  /* ══════════════════════════════════════════════════════
     SAFE HEALTH CHECK — NO POST, NO GET on detect endpoints
     Uses the SAME approach as the working original:
     • GET /actuator/health for backend
     • OPTIONS /api/detect?model=... for models
     OPTIONS never triggers 500 errors.
     ══════════════════════════════════════════════════════ */
  const checkAll = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    addLog('🔍 Running connectivity check…', 'info');

    // ─── 1) Backend — try actuator first, then root fallback ───
    let backendUp = false;
    let backendMs = 0;

    const actuator = await ping('http://localhost:8080/actuator/health', { method: 'GET' }, 3000);

    if (actuator.ok) {
      backendUp = true;
      backendMs = actuator.ms;
      addLog(`✅ Backend UP via /actuator/health — ${actuator.ms}ms (HTTP ${actuator.status})`, 'success');
    } else if (actuator.reachable && actuator.status > 0) {
      // Server responded but maybe actuator is disabled — still means backend is running
      backendUp = true;
      backendMs = actuator.ms;
      addLog(`✅ Backend UP (actuator returned ${actuator.status}) — ${actuator.ms}ms`, 'success');
    } else {
      // Try root as fallback
      const root = await ping('http://localhost:8080/', { method: 'GET' }, 2000);
      if (root.reachable && root.status > 0) {
        backendUp = true;
        backendMs = root.ms;
        addLog(`✅ Backend UP (root fallback) — ${root.ms}ms`, 'success');
      } else {
        backendMs = root.ms;
        addLog(`❌ Backend DOWN — no response (${root.ms}ms)`, 'error');
      }
    }

    setBackendStatus(backendUp ? 'up' : 'down');
    setLatency((l) => ({ ...l, backend: backendMs }));
    setUptimeHistory((h) => [...h.slice(-19), backendUp]);

    // ─── 2) Model endpoints — OPTIONS only (safe, no 500 errors) ───
    let plant = 'down';
    let animal = 'down';
    let pMs = 0;
    let aMs = 0;

    if (backendUp) {
      addLog('ℹ️ Probing model endpoints via OPTIONS (safe)…', 'info');

      const p = await ping(
        'http://localhost:8080/api/detect?model=plant',
        { method: 'OPTIONS' },
        3000
      );
      const a = await ping(
        'http://localhost:8080/api/detect?model=animal',
        { method: 'OPTIONS' },
        3000
      );

      pMs = p.ms;
      aMs = a.ms;

      // OPTIONS returns 200 if CORS is configured, or sometimes 403/405
      // Any HTTP response means the endpoint is registered and alive
      if (p.ok) {
        plant = 'up';
      } else if (p.reachable && p.status > 0) {
        // Got a response (maybe 403/405) — endpoint exists but CORS might block
        plant = 'warn';
      } else {
        plant = 'down';
      }

      if (a.ok) {
        animal = 'up';
      } else if (a.reachable && a.status > 0) {
        animal = 'warn';
      } else {
        animal = 'down';
      }

      addLog(
        `🌿 Plant endpoint: ${plant.toUpperCase()} (${pMs}ms${p.status ? `, HTTP ${p.status}` : ''})`,
        plant === 'up' ? 'success' : plant === 'warn' ? 'warn' : 'error'
      );
      addLog(
        `🐾 Animal endpoint: ${animal.toUpperCase()} (${aMs}ms${a.status ? `, HTTP ${a.status}` : ''})`,
        animal === 'up' ? 'success' : animal === 'warn' ? 'warn' : 'error'
      );
    } else {
      addLog('⏭ Skipping model checks — backend is offline', 'warn');
    }

    setPlantModelStatus(plant);
    setAnimalModelStatus(animal);
    setLatency((l) => ({ ...l, plant: pMs, animal: aMs }));
    setLastChecked(new Date());
    setCheckCount((c) => c + 1);
    setChecking(false);
    checkingRef.current = false;
    addLog('✓ Health check complete', 'success');
  }, [addLog, ping]);

  /* ── auto-refresh ── */
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(checkAll, 15000);
      addLog('⏱ Auto-refresh enabled (15s)', 'info');
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, checkAll, addLog]);

  /* ── init ONCE + keyboard shortcuts ── */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    checkAll();

    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'p') navigate('/ai-plant-detection');
      if (k === 'a') navigate('/ai-animal-detection');
      if (k === 'r') checkAll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── derived state ── */
  const quickHint = useMemo(
    () =>
      backendStatus === 'up'
        ? 'All systems operational — select a detection module to begin.'
        : 'Backend offline — start your Spring Boot server on localhost:8080.',
    [backendStatus]
  );

  const overallStatus = useMemo(() => {
    if (checking) return 'checking';
    if (backendStatus === 'up' && plantModelStatus === 'up' && animalModelStatus === 'up') return 'up';
    if (backendStatus === 'down') return 'down';
    return 'warn';
  }, [backendStatus, plantModelStatus, animalModelStatus, checking]);

  const uptimePercent = useMemo(() => {
    if (uptimeHistory.length === 0) return '—';
    const ups = uptimeHistory.filter(Boolean).length;
    return `${Math.round((ups / uptimeHistory.length) * 100)}%`;
  }, [uptimeHistory]);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return logs;
    return logs.filter((l) => l.type === logFilter);
  }, [logs, logFilter]);

  /* ── animation variants ── */
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  };

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: `particle-${i}`,
        x: Math.random() * 1400,
        y: Math.random() * 700 + 50,
        size: Math.random() * 18 + 6,
        delay: Math.random() * 8,
        duration: Math.random() * 10 + 8,
      })),
    []
  );

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Background */}
      <GridBackground />
      <div className="pointer-events-none absolute -top-40 -right-40 w-[55rem] h-[55rem] rounded-full bg-green-300/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[55rem] h-[55rem] rounded-full bg-emerald-300/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[75rem] h-[45rem] rounded-full bg-teal-200/5 blur-[160px]" />
      <div className="pointer-events-none absolute top-0 right-1/4 w-[30rem] h-[30rem] rounded-full bg-green-400/5 blur-[100px]" />
      {particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* ═══════ Top Bar ═══════ */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-3 mb-8
                     bg-white/80 backdrop-blur-xl rounded-2xl border border-green-100/80
                     shadow-sm shadow-green-100/30 px-5 py-3.5"
        >
          <div className="flex items-center gap-4">
            <StatusBadge status={overallStatus} label="System" showPulse size="lg" />
            <LiveClock />
            <div className="hidden md:flex items-center gap-2">
              <UptimeIndicator checks={uptimeHistory} />
              <div className="flex flex-col ml-1">
                <span className="text-[9px] text-gray-400 leading-tight">uptime</span>
                <span className="text-[11px] font-bold text-green-600 leading-tight">
                  {uptimePercent}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <MetricPill
              icon={<FaBolt />}
              label="Latency"
              value={latency.backend ? `${latency.backend}ms` : '—'}
              variant={
                latency.backend === 0 ? 'gray'
                  : latency.backend < 200 ? 'green'
                  : latency.backend < 500 ? 'purple'
                  : 'red'
              }
            />
            <MetricPill icon={<FaLayerGroup />} label="Models" value="3" variant="blue" />
            <MetricPill icon={<FaMicrochip />} label="Engine" value="YOLOv8" variant="purple" />
            <MetricPill
              icon={<FaSearch />}
              label="Checks"
              value={<AnimatedNumber value={checkCount} />}
              variant="gray"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAutoRefresh((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold
                          border transition-all duration-300 ${
                            autoRefresh
                              ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200/50'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
              title="Auto-refresh every 15s"
            >
              {autoRefresh ? (
                <><FaStopCircle /> Stop</>
              ) : (
                <><FaPlay className="text-[8px]" /> Auto</>
              )}
            </motion.button>

            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50
                         transition-all duration-200"
              title="Info"
            >
              <FaInfoCircle />
            </button>
          </div>
        </motion.div>

        {/* ═══════ Header ═══════ */}
        <motion.div variants={fadeUp} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full
                       bg-gradient-to-r from-green-100 to-emerald-100 text-green-700
                       text-xs font-bold mb-5 border border-green-200/50
                       shadow-sm shadow-green-100/50"
          >
            <FaShieldAlt className="text-green-500" />
            AI-Powered Detection Platform v2.0
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              AI Detection
            </span>{' '}
            Hub
          </h1>

          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {quickHint}
          </p>

          {/* Backend down banner */}
          <AnimatePresence>
            {backendStatus === 'down' && !checking && (
              <motion.div
                key="backend-down-banner"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-5 inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl
                           bg-red-50 border border-red-200 text-red-700 text-sm
                           shadow-lg shadow-red-100/50"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <FaExclamationTriangle className="text-red-500 text-lg" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Backend not reachable</div>
                  <div className="text-xs text-red-500 mt-0.5">
                    Run{' '}
                    <code className="bg-red-100 px-1.5 py-0.5 rounded-md font-mono font-bold">
                      mvn spring-boot:run
                    </code>{' '}
                    then click <strong>Check Now</strong>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All systems go banner */}
          <AnimatePresence>
            {overallStatus === 'up' && !checking && (
              <motion.div
                key="all-systems-go"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-5 inline-flex items-center gap-3 px-6 py-3 rounded-2xl
                           bg-green-50 border border-green-200 text-green-700 text-sm
                           shadow-lg shadow-green-100/50"
              >
                <FaCheckDouble className="text-green-500 text-lg" />
                <span className="font-bold">All systems operational</span>
                <span className="text-xs text-green-500">•</span>
                <span className="text-xs text-green-600">{latency.backend}ms avg response</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-gray-400">
            {[
              { key: 'P', label: 'Plant', icon: <FaLeaf className="text-green-500" /> },
              { key: 'A', label: 'Animal', icon: <FaPaw className="text-blue-500" /> },
              { key: 'R', label: 'Refresh', icon: <FaSync className="text-purple-500" /> },
            ].map((s) => (
              <motion.span
                whileHover={{ scale: 1.1 }}
                key={`shortcut-${s.key}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           bg-white/60 border border-gray-100 cursor-default"
              >
                <kbd className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600
                                font-mono text-[10px] font-bold border border-gray-200 shadow-sm">
                  {s.key}
                </kbd>
                {s.icon}
                <span className="text-gray-500">{s.label}</span>
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ═══════ Detection Cards ═══════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* ── Plant Card ── */}
          <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/ai-plant-detection')}
            className="group relative cursor-pointer bg-white/90 backdrop-blur-sm rounded-3xl
                       shadow-lg hover:shadow-2xl hover:shadow-green-200/30
                       border border-green-100 hover:border-green-300
                       p-8 text-left transition-all duration-500 overflow-hidden"
          >
            <div className="absolute -top-32 -right-24 w-72 h-72 bg-green-200/20 rounded-full blur-3xl
                            transition-all duration-700 group-hover:bg-green-300/40 group-hover:scale-125" />
            <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-emerald-200/10 rounded-full blur-3xl
                            transition-all duration-700 group-hover:bg-emerald-300/20 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r
                            from-green-400 via-emerald-500 to-teal-400
                            opacity-0 group-hover:opacity-100 transition-opacity
                            duration-300 rounded-b-3xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="bg-gradient-to-br from-green-100 to-emerald-100
                               w-16 h-16 rounded-2xl flex items-center justify-center
                               shadow-inner border border-green-200/50
                               group-hover:shadow-lg group-hover:shadow-green-200
                               transition-all duration-300"
                  >
                    <FaLeaf className="text-green-600 text-3xl group-hover:scale-110 transition-transform" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-800 group-hover:text-green-700 transition-colors">
                      Plant Detection
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={plantModelStatus} label="Plant Model" showPulse />
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <FaCircle className="text-green-500 text-[5px]" /> YOLOv8
                  </span>
                  <div className="text-[9px] text-gray-300 font-mono bg-gray-50 px-2 py-0.5 rounded-md">best.pt</div>
                  <div className="text-[9px] text-gray-300 font-mono bg-gray-50 px-2 py-0.5 rounded-md">best_leaf.pt</div>
                </div>
              </div>

              <p className="text-gray-500 mt-5 text-sm leading-relaxed">
                Identify plant diseases or classify leaf species using embedded YOLO models.
                Get real-time confidence scores, bounding boxes, and detailed analytics dashboards.
              </p>

              <div className="mt-5">
                <div className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-widest font-semibold">
                  Response Time
                </div>
                <LatencyBar ms={latency.plant} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: 'Disease Detection', icon: <FaSeedling className="text-[8px]" /> },
                  { label: 'Leaf Classification', icon: <FaLeaf className="text-[8px]" /> },
                  { label: 'Analytics', icon: <FaChartBar className="text-[8px]" /> },
                  { label: 'Detection History', icon: <FaHistory className="text-[8px]" /> },
                ].map((t) => (
                  <span
                    key={`plant-tag-${t.label}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                               bg-green-50 text-green-700 border border-green-200
                               text-[11px] font-semibold"
                  >
                    {t.icon} {t.label}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between">
                <motion.span
                  whileHover={{ x: 3 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r
                              from-green-600 to-emerald-600 text-white px-6 py-3
                              rounded-xl shadow-lg shadow-green-200/50
                              group-hover:shadow-green-300/50 font-bold text-sm
                              transition-all duration-300"
                >
                  Start Plant Detection
                  <FaArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </motion.span>
                <FaChartBar className="text-green-200 text-3xl group-hover:text-green-300 transition-colors" />
              </div>
            </div>
          </motion.div>

          {/* ── Animal Card ── */}
          <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/ai-animal-detection')}
            className="group relative cursor-pointer bg-white/90 backdrop-blur-sm rounded-3xl
                       shadow-lg hover:shadow-2xl hover:shadow-blue-200/30
                       border border-blue-100 hover:border-blue-300
                       p-8 text-left transition-all duration-500 overflow-hidden"
          >
            <div className="absolute -top-32 -right-24 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl
                            transition-all duration-700 group-hover:bg-sky-300/40 group-hover:scale-125" />
            <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-blue-200/10 rounded-full blur-3xl
                            transition-all duration-700 group-hover:bg-blue-300/20 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r
                            from-blue-400 via-sky-500 to-cyan-400
                            opacity-0 group-hover:opacity-100 transition-opacity
                            duration-300 rounded-b-3xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: -12, scale: 1.1 }}
                    className="bg-gradient-to-br from-blue-100 to-sky-100
                               w-16 h-16 rounded-2xl flex items-center justify-center
                               shadow-inner border border-blue-200/50
                               group-hover:shadow-lg group-hover:shadow-blue-200
                               transition-all duration-300"
                  >
                    <FaPaw className="text-blue-600 text-3xl group-hover:scale-110 transition-transform" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-800 group-hover:text-blue-700 transition-colors">
                      Animal Detection
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={animalModelStatus} label="Animal Model" showPulse />
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <FaCircle className="text-blue-500 text-[5px]" /> YOLOv8
                  </span>
                  <div className="text-[9px] text-gray-300 font-mono bg-gray-50 px-2 py-0.5 rounded-md">best_animal.pt</div>
                </div>
              </div>

              <p className="text-gray-500 mt-5 text-sm leading-relaxed">
                Detect and recognize animals with high-accuracy models. Analyze health indicators,
                behavior patterns, and confidence score distributions in real-time.
              </p>

              <div className="mt-5">
                <div className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-widest font-semibold">
                  Response Time
                </div>
                <LatencyBar ms={latency.animal} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: 'Recognition', icon: <FaFingerprint className="text-[8px]" /> },
                  { label: 'Health Analysis', icon: <FaHeartbeat className="text-[8px]" /> },
                  { label: 'Behavior Modes', icon: <FaDog className="text-[8px]" /> },
                  { label: 'Analytics', icon: <FaChartBar className="text-[8px]" /> },
                ].map((t) => (
                  <span
                    key={`animal-tag-${t.label}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                               bg-blue-50 text-blue-700 border border-blue-200
                               text-[11px] font-semibold"
                  >
                    {t.icon} {t.label}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between">
                <motion.span
                  whileHover={{ x: 3 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r
                              from-blue-600 to-sky-600 text-white px-6 py-3
                              rounded-xl shadow-lg shadow-blue-200/50
                              group-hover:shadow-blue-300/50 font-bold text-sm
                              transition-all duration-300"
                >
                  Start Animal Detection
                  <FaArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </motion.span>
                <FaChartBar className="text-blue-200 text-3xl group-hover:text-blue-300 transition-colors" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══════ Status + Live Log ═══════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Panel */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-3xl
                          shadow-lg shadow-green-100/20 p-6 border border-green-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaNetworkWired className="text-green-600" />
                </div>
                System Status
              </h3>
              <div className="flex items-center gap-3">
                {lastChecked && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                    <FaHistory className="text-green-500" /> {lastChecked.toLocaleTimeString()}
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkAll}
                  disabled={checking}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                             bg-gradient-to-r from-green-50 to-emerald-50
                             hover:from-green-100 hover:to-emerald-100
                             text-green-700 text-xs font-bold border border-green-200
                             transition-all duration-200 shadow-sm
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checking ? <FaSync className="animate-spin" /> : <FaHeartbeat className="text-green-500" />}
                  {checking ? 'Checking…' : 'Check Now'}
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Backend Server', sub: 'localhost:8080', status: backendStatus,
                  ms: latency.backend, icon: <FaServer />, gradient: 'from-green-500 to-emerald-500',
                },
                {
                  label: 'Plant Models', sub: '2 models loaded', status: plantModelStatus,
                  ms: latency.plant, icon: <FaLeaf />, gradient: 'from-green-500 to-teal-500',
                },
                {
                  label: 'Animal Model', sub: '1 model loaded', status: animalModelStatus,
                  ms: latency.animal, icon: <FaPaw />, gradient: 'from-blue-500 to-sky-500',
                },
              ].map((s) => {
                const isUp = s.status === 'up';
                const isDown = s.status === 'down';
                const borderColor = isUp
                  ? 'border-green-200 bg-gradient-to-br from-green-50/60 to-emerald-50/40'
                  : isDown
                  ? 'border-red-200 bg-gradient-to-br from-red-50/60 to-rose-50/40'
                  : 'border-yellow-200 bg-gradient-to-br from-yellow-50/60 to-amber-50/40';

                return (
                  <motion.div
                    key={`status-${s.label}`}
                    layout
                    whileHover={{ scale: 1.02 }}
                    className={`p-5 rounded-2xl border-2 transition-all duration-500 ${borderColor}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center
                                    text-white bg-gradient-to-br ${
                                      isUp ? s.gradient
                                        : isDown ? 'from-red-400 to-rose-500'
                                        : 'from-yellow-400 to-amber-500'
                                    } shadow-md`}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-800">{s.label}</div>
                        <div className="text-[10px] text-gray-400">{s.sub}</div>
                      </div>
                    </div>
                    <StatusBadge status={s.status} label={s.status.toUpperCase()} showPulse />
                    <div className="mt-3">
                      <LatencyBar ms={s.ms} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Live Log */}
          <div className="bg-gray-950 rounded-3xl shadow-lg shadow-gray-900/20 p-5
                          border border-gray-800/50 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-green-900/50 flex items-center justify-center">
                  <FaTerminal className="text-green-400 text-[10px]" />
                </div>
                Live Log
              </h3>
              <div className="flex items-center gap-1">
                {[
                  { key: 'all', color: 'bg-gray-500' },
                  { key: 'error', color: 'bg-red-500' },
                  { key: 'success', color: 'bg-green-500' },
                  { key: 'warn', color: 'bg-yellow-500' },
                ].map((f) => (
                  <button
                    key={`filter-${f.key}`}
                    onClick={() => setLogFilter(f.key)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase
                               tracking-wider transition-all duration-200
                               ${logFilter === f.key
                                 ? 'bg-green-600 text-white shadow-sm'
                                 : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                               }`}
                  >
                    {f.key}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-72 space-y-0.5 font-mono
                            text-[11px] pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {filteredLogs.map((l) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -12, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-2 py-1 border-b border-gray-800/30"
                  >
                    <span className="text-gray-600 shrink-0">{l.time}</span>
                    <span
                      className={`${
                        l.type === 'success' ? 'text-green-400'
                          : l.type === 'error' ? 'text-red-400'
                          : l.type === 'warn' ? 'text-yellow-400'
                          : 'text-gray-400'
                      } break-all`}
                    >
                      {l.msg}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredLogs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                  <FaTerminal className="text-2xl mb-2 text-gray-700" />
                  <p className="italic text-xs">No logs to show</p>
                </div>
              )}
            </div>

            {logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="mt-3 text-[10px] text-gray-600 hover:text-gray-400
                           transition self-end flex items-center gap-1
                           px-2 py-1 rounded-md hover:bg-gray-800"
              >
                <FaTimes className="text-[8px]" /> Clear logs
              </button>
            )}
          </div>
        </motion.div>

        {/* ═══════ Collapsible Setup Guide ═══════ */}
        <motion.div variants={fadeUp} className="mb-8">
          <motion.button
            whileHover={{ scale: 1.005 }}
            onClick={() => setShowSetup((v) => !v)}
            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-5
                       border border-green-100 flex items-center justify-between
                       hover:shadow-md hover:border-green-200 transition-all duration-300"
          >
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FaCog className="text-green-600" />
              </div>
              Quick Setup Guide
              <span className="text-[10px] font-normal text-gray-400 ml-1">
                {showSetup ? 'Click to collapse' : '3 steps to get started'}
              </span>
            </h3>
            <motion.div animate={{ rotate: showSetup ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <FaChevronDown className="text-gray-400" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showSetup && (
              <motion.div
                key="setup-guide"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm mt-5">
                  {[
                    {
                      step: '01', icon: <FaCheckCircle className="text-green-500" />,
                      title: 'Frontend', desc: "Vite + React running in dev mode — you're here!",
                      code: 'npm run dev', color: 'green', gradient: 'from-green-500 to-emerald-500',
                    },
                    {
                      step: '02', icon: <FaServer className="text-blue-500" />,
                      title: 'Backend', desc: 'Start Spring Boot — exposes /actuator/health & /api/detect',
                      code: 'mvn spring-boot:run', color: 'blue', gradient: 'from-blue-500 to-sky-500',
                    },
                    {
                      step: '03', icon: <FaMicrochip className="text-purple-500" />,
                      title: 'AI Models', desc: 'Place YOLOv8 weights in the models/ directory.',
                      code: 'best.pt  best_leaf.pt  best_animal.pt', color: 'purple',
                      gradient: 'from-purple-500 to-violet-500',
                    },
                  ].map((s) => (
                    <motion.div
                      key={`setup-${s.step}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: parseInt(s.step) * 0.1 }}
                      className="relative p-6 rounded-2xl border bg-white shadow-sm
                                 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      <span className="absolute top-3 right-3 text-5xl font-black text-gray-50
                                       group-hover:text-gray-100 transition-colors">
                        {s.step}
                      </span>
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${s.gradient} opacity-60`} />
                      <div className="flex items-center gap-2.5 font-bold text-gray-800 mb-3">
                        <div className={`w-7 h-7 rounded-lg bg-${s.color}-100 flex items-center justify-center`}>
                          {s.icon}
                        </div>
                        {s.title}
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed mb-4">{s.desc}</p>
                      <code className="block text-[10px] bg-gray-950 text-green-400 px-4 py-2.5
                                       rounded-xl font-mono border border-gray-800">
                        <span className="text-gray-600">$ </span>{s.code}
                      </code>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══════ CTA ═══════ */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/ai-plant-detection')}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600
                       hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3.5
                       rounded-xl shadow-xl shadow-green-200/50 font-bold
                       flex items-center justify-center gap-3 text-sm
                       transition-all duration-300"
          >
            <FaLeaf /> Plant Detection <FaArrowRight />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/ai-animal-detection')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-600
                       hover:from-blue-700 hover:to-sky-700 text-white px-8 py-3.5
                       rounded-xl shadow-xl shadow-blue-200/50 font-bold
                       flex items-center justify-center gap-3 text-sm
                       transition-all duration-300"
          >
            <FaPaw /> Animal Detection <FaArrowRight />
          </motion.button>
        </motion.div>

        {/* ═══════ Footer ═══════ */}
        <motion.div variants={fadeUp} className="text-center pb-8">
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="text-green-500" />
              AI Detection Hub v2.0
            </span>
            <span>•</span>
            <span>React + Spring Boot + YOLOv8</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaHeartbeat className="text-red-400 text-[10px]" />
              Built with care
            </span>
          </div>
        </motion.div>

        {/* Chatbot */}
        <AIChatbot
          isOpen={chatbotOpen}
          onToggle={() => setChatbotOpen(!chatbotOpen)}
          context="ai_detection_hub"
        />
      </motion.div>

      {/* ═══════ Info Modal ═══════ */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            key="info-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center
                       bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              key="info-modal-content"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-7
                         border border-green-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100
                                  flex items-center justify-center">
                    <FaInfoCircle className="text-green-600" />
                  </div>
                  About AI Detection Hub
                </h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <p className="leading-relaxed">
                  The <strong className="text-gray-800">AI Detection Hub</strong> is your central
                  dashboard for YOLOv8-powered plant and animal detection modules with real-time
                  system monitoring.
                </p>

                <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-5 rounded-2xl border space-y-3">
                  {[
                    { icon: <FaWifi className="text-green-500" />, text: 'Real-time connectivity monitoring with latency tracking' },
                    { icon: <FaGlobe className="text-blue-500" />, text: 'Uptime history visualization (last 10 checks)' },
                    { icon: <FaSync className="text-purple-500" />, text: 'Optional auto-refresh every 15 seconds' },
                    { icon: <FaTerminal className="text-orange-500" />, text: 'Live terminal log with filtering' },
                    { icon: <FaKeyboard className="text-indigo-500" />, text: 'Keyboard shortcuts — P (Plant), A (Animal), R (Refresh)' },
                    { icon: <FaHeartbeat className="text-red-500" />, text: 'Safe OPTIONS-based health probes — no 500 errors' },
                  ].map((item, i) => (
                    <div key={`info-item-${i}`} className="flex items-center gap-3 text-xs">
                      <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2">
                  <span>Version 2.0 • React + Framer Motion + Tailwind</span>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-green-600 hover:underline font-semibold"
                  >
                    Docs <FaExternalLinkAlt className="text-[8px]" />
                  </a>
                </div>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600
                           text-white font-bold hover:from-green-700 hover:to-emerald-700
                           transition-all duration-300 shadow-lg shadow-green-200/50
                           active:scale-[0.98]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollbar style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default AIDetectionHub;

