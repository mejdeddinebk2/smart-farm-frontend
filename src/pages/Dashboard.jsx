import API_BASE from '../config';
import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaw, FaSeedling, FaBell, FaDrumstickBite, FaSun, FaCloudRain,
  FaTint, FaChartLine, FaArrowUp, FaArrowDown, FaEquals,
  FaExclamationTriangle, FaCheckCircle, FaSync, FaCalendarAlt,
  FaThermometerHalf, FaWind, FaCloud, FaEye, FaTimes, FaInfoCircle,
  FaShieldAlt, FaLeaf, FaHeart, FaClock, FaChevronDown, FaChevronUp,
  FaBolt, FaGlobeAmericas, FaLayerGroup, FaStar, FaHistory
} from "react-icons/fa";
import {
  MdDashboard, MdWaterDrop, MdPets, MdLocalFlorist,
  MdNotificationsActive, MdTrendingUp, MdInsights, MdTask,
  MdRefresh, MdFilterList
} from "react-icons/md";

/* ═══════ Dynamic Plot ═══════ */
const Plot = ({ data, layout, config, style, ...props }) => {
  const [PlotComponent, setPlotComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    import("react-plotly.js")
      .then(({ default: C }) => { setPlotComponent(() => C); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={style} className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/20 rounded-2xl border border-gray-100">
      <div className="text-center py-12">
        <div className="relative mx-auto w-10 h-10 mb-3">
          <div className="w-10 h-10 rounded-full border-3 border-green-200 border-t-green-500 animate-spin" />
          <FaChartLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 text-xs" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading chart…</p>
      </div>
    </div>
  );

  if (error || !PlotComponent) return (
    <div style={style} className="flex items-center justify-center bg-red-50/30 rounded-2xl border border-red-100">
      <div className="text-center py-12">
        <FaChartLine className="text-red-300 text-2xl mx-auto mb-3" />
        <p className="text-sm text-red-400 font-medium">Chart unavailable</p>
      </div>
    </div>
  );

  return <PlotComponent data={data} layout={layout} config={config} style={style} {...props} />;
};

/* ═══════ Toast ═══════ */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: "bg-gradient-to-r from-emerald-600 to-green-600",
    error: "bg-gradient-to-r from-red-600 to-rose-600",
    info: "bg-gradient-to-r from-blue-600 to-sky-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500"
  };
  const icons = {
    success: <FaCheckCircle />, error: <FaExclamationTriangle />,
    info: <FaInfoCircle />, warning: <FaBell />
  };
  return (
    <motion.div
      initial={{ x: 120, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed top-6 right-6 z-[100] ${styles[type]} text-white px-5 py-3.5
                  rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md
                  backdrop-blur-sm border border-white/10`}
    >
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1.5 transition">
        <FaTimes size={11} />
      </button>
    </motion.div>
  );
}

/* ═══════ Skeleton ═══════ */
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 h-full w-full
                      bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-neutral-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[420px]" />
          <Skeleton className="h-[420px]" />
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

/* ═══════ Live Clock ═══════ */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums text-[11px] text-gray-500 font-mono flex items-center gap-1.5">
      <FaClock className="text-green-500 animate-pulse text-[9px]" />
      {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

/* ═══════ KPI Card ═══════ */
function KPICard({ icon, iconBg, iconGradient, title, value, subtitle, trend, trendLabel, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5
                 hover:shadow-xl hover:border-green-200 transition-all duration-500 group overflow-hidden relative"
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-green-100/20 to-transparent
                      rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${iconGradient || iconBg}
                          flex items-center justify-center group-hover:scale-110
                          transition-transform duration-300 shadow-md`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              trend === "up" ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : trend === "down" ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-gray-50 text-gray-500 border border-gray-200"
            }`}>
              {trend === "up" ? <FaArrowUp size={7} /> : trend === "down" ? <FaArrowDown size={7} /> : <FaEquals size={7} />}
              {trendLabel || "vs prev."}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-gray-800 mt-1 tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

/* ═══════ Resource Card ═══════ */
function ResourceCard({ icon, iconBg, title, value, unit, status, statusColor, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5
                 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center
                        group-hover:scale-105 transition-transform duration-300 shadow-md`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-black text-gray-800">{value ?? "—"}</span>
            {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                statusColor.includes("green") || statusColor.includes("emerald") ? "bg-emerald-500 animate-pulse" :
                statusColor.includes("red") ? "bg-red-500 animate-pulse" :
                statusColor.includes("amber") ? "bg-amber-500 animate-pulse" : "bg-gray-400"
              }`} />
              {status}
            </span>
          </div>
          {description && <p className="text-[10px] text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ Section Card ═══════ */
function SectionCard({ icon, iconBg, title, subtitle, children, className = "", headerAction }) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100
                    shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-50/80 flex items-center justify-between flex-wrap gap-2
                      bg-gradient-to-r from-white to-gray-50/30">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>{icon}</div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            {subtitle && <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>}
          </div>
        </div>
        {headerAction}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ═══════ Alert Item ═══════ */
function AlertItem({ alert, index }) {
  const severityConfig = {
    high: { border: "border-l-red-500", bg: "bg-gradient-to-r from-red-50/80 to-rose-50/40", badge: "bg-red-100 text-red-700 border-red-200", icon: "🚨" },
    critical: { border: "border-l-red-600", bg: "bg-gradient-to-r from-red-50 to-rose-50/60", badge: "bg-red-500 text-white border-red-500", icon: "🔴" },
    medium: { border: "border-l-amber-500", bg: "bg-gradient-to-r from-amber-50/80 to-orange-50/40", badge: "bg-amber-100 text-amber-700 border-amber-200", icon: "⚠️" },
    low: { border: "border-l-gray-300", bg: "bg-gradient-to-r from-gray-50/80 to-slate-50/40", badge: "bg-gray-100 text-gray-600 border-gray-200", icon: "ℹ️" },
  };
  const typeIcons = {
    Water: "💧", Food: "🍽️", Health: "🏥", "Plant Health": "🌱",
    System: "⚙️", Vaccination: "💉", Visit: "📋", General: "📢"
  };
  const cfg = severityConfig[alert.severity] || severityConfig.low;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
      whileHover={{ x: 4, scale: 1.005 }}
      className={`border-l-4 ${cfg.border} ${cfg.bg} rounded-r-xl p-4
                  hover:shadow-md transition-all duration-300 cursor-default`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[alert.type] || "📢"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
              {alert.type || "General"}
            </span>
            <span className="text-[9px] text-gray-400 font-mono">
              {alert.createdAt ? new Date(alert.createdAt).toLocaleString("fr-FR", {
                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
              }) : "Now"}
            </span>
          </div>
          <p className="text-sm text-gray-700 font-medium leading-snug">{alert.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ Weather Widget ═══════ */
function WeatherWidget({ weather, rainForecast }) {
  if (!weather) return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
        <FaCloud className="text-2xl text-gray-300" />
      </div>
      <p className="text-sm font-medium">Météo indisponible</p>
      <p className="text-[10px] text-gray-300 mt-1">Données en cours de chargement</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-5 border border-blue-100
                      hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Température</p>
            <p className="text-4xl font-black text-gray-800 mt-1">
              {weather.temperature != null ? `${weather.temperature}°` : "—"}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Celsius</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl
                          flex items-center justify-center shadow-lg shadow-amber-200/50">
            <FaSun className="text-white text-2xl" />
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 border transition-shadow duration-300 hover:shadow-md ${
        rainForecast
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
          : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Pluie prévue</p>
            <p className="text-2xl font-black text-gray-800 mt-1">
              {weather.rainProbability != null ? `${weather.rainProbability}%` : rainForecast ? "Probable" : "Non"}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
            rainForecast ? "bg-blue-100" : "bg-green-100"
          }`}>
            <FaCloudRain className={`text-lg ${rainForecast ? "text-blue-500" : "text-green-500"}`} />
          </div>
        </div>
        {rainForecast && (
          <p className="text-[10px] text-blue-600 mt-3 font-medium bg-blue-100/50 px-3 py-1.5 rounded-lg">
            💡 Prévoyez la collecte d'eau de pluie
          </p>
        )}
      </div>

      {weather.summary && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
            <FaInfoCircle className="text-gray-400 text-[10px] shrink-0" />
            {weather.summary}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════ Grid Background ═══════ */
const GridBackground = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    <div
      className="absolute inset-0 opacity-[0.015]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
);

/* ═══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════ */
export default function Dashboard() {
  const [animals, setAnimals] = useState([]);
  const [plants, setPlants] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tanks, setTanks] = useState({});
  const [totalWaterAvailable, setTotalWaterAvailable] = useState(null);
  const [lowTank, setLowTank] = useState(false);
  const [totalFoodAvailable, setTotalFoodAvailable] = useState(null);
  const [nextWatering, setNextWatering] = useState(null);
  const [nextFeeding, setNextFeeding] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState([]);
  const [weather, setWeather] = useState(null);
  const [rainForecast, setRainForecast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmId, setFarmId] = useState(null);
  const [farmLoading, setFarmLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [alertFilter, setAlertFilter] = useState("all");
  const [lastRefresh, setLastRefresh] = useState(null);

  const [apiCapabilities, setApiCapabilities] = useState(() => {
    try {
      return {
        farmTanks: false, globalTanks: false, farmFoodStores: false,
        globalFoodStores: false, farmWeather: false,
        ...JSON.parse(localStorage.getItem("apiCaps") || "{}")
      };
    } catch {
      return { farmTanks: false, globalTanks: false, farmFoodStores: false, globalFoodStores: false, farmWeather: false };
    }
  });

  const farmApiBase = "http://localhost:8080/api/farms";
  const notificationApiBase = "http://localhost:8080/api/notifications";

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const markCap = (key, value) => {
    const next = { ...apiCapabilities, [key]: value };
    try { localStorage.setItem("apiCaps", JSON.stringify(next)); } catch {}
    setApiCapabilities(next);
  };
  const canTry = (key) => apiCapabilities[key] !== false;

  const extractUserIdFromToken = (token) => {
    try {
      const json = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return json.id || json.userId || json.sub || json.uid || null;
    } catch { return null; }
  };

  const resolveFarm = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Not authenticated"); setFarmLoading(false); return; }
    let userId = null;
    try {
      const userRes = await axios.get("http://localhost:8080/auth/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      userId = userRes.data.id || userRes.data.userId || userRes.data._id || userRes.data.sub || extractUserIdFromToken(token);
    } catch {
      userId = extractUserIdFromToken(token);
    }
    if (!userId) { setError("Cannot resolve user id"); setFarmLoading(false); return; }
    try {
      const farmRes = await axios.get(`${farmApiBase}/user/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fId = farmRes.data?.id || farmRes.data?._id || farmRes.data?.farmId;
      if (fId) setFarmId(fId);
      else setError("No farm found for user");
    } catch (e) {
      setError(e.response?.status === 404 ? "No farm yet. Create one." : "Failed to load farm");
    } finally {
      setFarmLoading(false);
    }
  };

  /* ════════════════════════════════════════════════════════
     loadData — FIXED notification URLs + axios.post syntax
     ════════════════════════════════════════════════════════ */
  const loadData = async (activeFarmId) => {
    if (!activeFarmId) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      const [aRes, pRes] = await Promise.all([
        axios.get(`${farmApiBase}/${activeFarmId}/animals`, headers).catch(() => ({ data: [] })),
        axios.get(`${farmApiBase}/${activeFarmId}/plants`, headers).catch(() => ({ data: [] })),
      ]);
      setAnimals(aRes.data || []);
      setPlants(pRes.data || []);
    } catch {
      setError("Load failed");
    } finally {
      setLoading(false);
    }

    /* ── Alerts ──
       FIX: Use /api/notifications (global) instead of /api/farms/{id}/notifications
       FIX: axios.post(url, body, config) — send {} as body, headers as 3rd param */
    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      let combinedAlerts = [];

      try {
        // ✅ FIXED: Correct endpoint + correct axios.post signature
        await axios.post(
          `${notificationApiBase}/generate-samples`,
          {},      // body (empty)
          headers  // config with auth header
        );
        const res = await axios.get(notificationApiBase, headers);
        combinedAlerts = res.data || [];
      } catch {
        combinedAlerts = [];
      }

      if (combinedAlerts.length === 0) {
        const sampleAlerts = [];
        if (typeof totalWaterAvailable === "number" && totalWaterAvailable < 20)
          sampleAlerts.push({
            id: "low-water", type: "Water",
            message: `Low water level: ${totalWaterAvailable}L remaining`,
            severity: "high", createdAt: new Date().toISOString()
          });
        if (typeof totalFoodAvailable === "number" && totalFoodAvailable < 10)
          sampleAlerts.push({
            id: "low-food", type: "Food",
            message: `Low food level: ${totalFoodAvailable}kg remaining`,
            severity: "medium", createdAt: new Date().toISOString()
          });
        (animals || []).forEach(a => {
          if (a.healthStatus === "sick" || a.healthStatus === "warning")
            sampleAlerts.push({
              id: `animal-${a.id}`, type: "Health",
              message: `${a.name || "Animal"} needs attention: ${a.healthStatus}`,
              severity: a.healthStatus === "sick" ? "high" : "medium",
              createdAt: new Date().toISOString()
            });
        });
        (plants || []).forEach(p => {
          if (p.healthStatus === "sick" || p.healthStatus === "warning")
            sampleAlerts.push({
              id: `plant-${p.id}`, type: "Plant Health",
              message: `${p.name || "Plant"} needs attention: ${p.healthStatus}`,
              severity: p.healthStatus === "sick" ? "high" : "medium",
              createdAt: new Date().toISOString()
            });
        });
        if (sampleAlerts.length > 0) combinedAlerts.push(...sampleAlerts);
        if (combinedAlerts.length === 0)
          combinedAlerts.push({
            id: "demo", type: "System",
            message: "Farm monitoring system is active",
            severity: "low", createdAt: new Date().toISOString()
          });
      }

      const inferType = (msg = "") => {
        const m = String(msg).toLowerCase();
        if (m.includes("vacc")) return "Vaccination";
        if (m.includes("visit")) return "Visit";
        if (m.includes("treat")) return "Treatment";
        if (m.includes("water")) return "Water";
        if (m.includes("food") || m.includes("feed")) return "Food";
        if (m.includes("health")) return "Health";
        return "General";
      };
      const inferSeverity = (msg = "") =>
        /overdue|late|high|urgent|sick/i.test(msg) ? "high"
          : /warning|missing|low/i.test(msg) ? "medium"
          : "low";
      const normalize = (arr) => (arr || []).map((a, i) => {
        if (typeof a === "string")
          return {
            id: `str-${i}`, type: inferType(a), message: a,
            severity: inferSeverity(a), createdAt: new Date().toISOString()
          };
        return {
          id: a.id ?? `obj-${i}`,
          type: a.type || inferType(a.message),
          message: a.message || a.title || a.description || "",
          severity: a.severity || inferSeverity(a.message || ""),
          createdAt: a.createdAt || new Date().toISOString(),
          entityId: a.entityId
        };
      });
      setAlerts(normalize(combinedAlerts));
    } catch {}

    // Tanks / resources
    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      let tanksData = {};
      let waterTotal = 0;

      try {
        const tankLevelRes = await axios.get(
          `${farmApiBase}/${activeFarmId}/tank-level`, headers
        ).catch(() => null);
        if (tankLevelRes?.data) {
          const level = Number(tankLevelRes.data.level ?? 0);
          waterTotal = Number.isFinite(level) ? level : 0;
          tanksData = tankLevelRes.data;
          setTanks(tanksData);
          setTotalWaterAvailable(waterTotal);
          setLowTank(Boolean(tanksData.low) || waterTotal < 20);
        }
      } catch {}

      try {
        const speciesUrls = ["cow", "dog", "chicken", "sheep"].map(
          s => `${farmApiBase}/${activeFarmId}/${s}-tank-level`
        );
        const results = await Promise.all(
          speciesUrls.map(u => axios.get(u, headers).catch(() => ({ data: null })))
        );
        const levels = results.map(r =>
          Number(r?.data?.level ?? r?.data?.quantity ?? r?.data?.amount ?? NaN)
        );
        if (levels.some(Number.isFinite)) {
          const vals = levels.map(l => Number.isFinite(l) ? l : 0);
          const combined = vals.reduce((s, v) => s + v, 0);
          tanksData = { ...tanksData, cow: vals[0], dog: vals[1], chicken: vals[2], sheep: vals[3], food: combined };
          setTanks(tanksData);
          setTotalFoodAvailable(combined);
        } else {
          try {
            const intakeRes = await axios.get(
              `${farmApiBase}/${activeFarmId}/today-intake`, headers
            ).catch(() => null);
            const val = Number(intakeRes?.data?.intake ?? intakeRes?.data?.total ?? NaN);
            setTotalFoodAvailable(Number.isFinite(val) ? val : 0);
          } catch {
            setTotalFoodAvailable(0);
          }
        }
      } catch {}

      const nextPlantWater = (plants || []).map(p => p.nextWatering).filter(Boolean).sort()[0] || null;
      const nextAnimalFeed = (animals || []).map(a => a.nextFeeding).filter(Boolean).sort()[0] || null;
      setNextWatering(nextPlantWater);
      setNextFeeding(nextAnimalFeed);

      const todays = [];
      if (nextAnimalFeed) todays.push({
        time: nextAnimalFeed, title: "Nourrir les animaux",
        meta: `${animals.length} animaux`, icon: "🍽️"
      });
      if (nextPlantWater) todays.push({
        time: nextPlantWater, title: "Arroser les plantes",
        meta: `${plants.length} plantes`, icon: "💧"
      });
      (alerts || []).filter(a => /overdue|urgent|empty|low/i.test(a.message || "")).forEach(a => {
        todays.push({ time: a.createdAt || new Date().toISOString(), title: a.message, meta: a.type, icon: "⚠️" });
      });
      setTasks(
        todays
          .map(t => ({ ...t, timeISO: new Date(t.time).toISOString() }))
          .sort((x, y) => new Date(x.timeISO) - new Date(y.timeISO))
      );

      const ins = [];
      if ((waterTotal || 0) < 20) ins.push(`Réservoir bas: prévoir ${Math.max(0, 20 - (waterTotal || 0))} L supplémentaires`);
      const foodTotal = totalFoodAvailable || 0;
      if (foodTotal < 10) ins.push(`Stock nourriture faible: ${foodTotal} unités restantes`);
      if ((alerts || []).length === 0) ins.push("Aucune alerte critique — tout va bien ✅");
      if (animals.length > 0 && animals.filter(a => (a.healthStatus || "").toLowerCase() === "healthy").length === animals.length)
        ins.push("Tous vos animaux sont en bonne santé! 🎉");
      setInsights(ins.slice(0, 5));

      // Weather
      try {
        let got = false;
        if (canTry("farmWeather")) {
          try {
            const wRes = await axios.get(`${farmApiBase}/${activeFarmId}/weather`, headers).catch(() => null);
            if (wRes?.data && Object.keys(wRes.data).length) {
              setWeather({
                summary: wRes.data.summary || wRes.data.description,
                temperature: wRes.data.temperature ?? wRes.data.temp,
                humidity: null,
                rainProbability: wRes.data.rainProbability ?? wRes.data.rainChance ?? wRes.data.rain
              });
              setRainForecast(Boolean(wRes.data.rain ?? (wRes.data.rainProbability != null && wRes.data.rainProbability >= 50)));
              got = true;
            }
          } catch (e) {
            if (e?.response?.status === 404) markCap("farmWeather", false);
          }
        }
        if (!got) {
          try {
            const rf = await axios.get(`${farmApiBase}/${activeFarmId}/rain-forecast`, headers).catch(() => null);
            if (rf?.data) {
              const prob = rf.data.probability ?? rf.data.prob ?? rf.data.percent ?? null;
              setWeather({
                summary: rf.data.summary || (prob >= 50 ? "Pluie probable" : "Pas de pluie attendue"),
                temperature: rf.data.temperature, humidity: null, rainProbability: prob
              });
              setRainForecast(prob != null ? prob >= 50 : Boolean(rf.data.rain));
              got = true;
            }
          } catch {}
        }
        if (!got && typeof navigator !== "undefined" && "geolocation" in navigator) {
          try {
            const pos = await new Promise((res, rej) =>
              navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
            );
            const { latitude: lat, longitude: lon } = pos.coords;
            const [curR, prR] = await Promise.all([
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`),
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability&forecast_days=1&timezone=auto`),
            ]);
            const curD = await curR.json();
            const prD = await prR.json();
            const probs = prD?.hourly?.precipitation_probability || [];
            const rainLikely = probs.slice(0, 6).some(p => p >= 50);
            setWeather({
              summary: "Météo locale",
              temperature: curD?.current_weather?.temperature,
              humidity: null,
              rainProbability: rainLikely ? 60 : probs[0] ?? null
            });
            setRainForecast(rainLikely);
          } catch {}
        }
      } catch {}
    } catch {}

    setLastRefresh(new Date());
  };

  useEffect(() => { resolveFarm(); }, []);
  useEffect(() => { if (farmId) loadData(farmId); }, [farmId]);

  // Fallback weather via geolocation
  useEffect(() => {
    if (!farmId || (weather && (weather.rainProbability != null || weather.temperature != null))) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    let mounted = true;
    navigator.geolocation.getCurrentPosition(async pos => {
      if (!mounted) return;
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        const [curR, prR] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability&forecast_days=1&timezone=auto`),
        ]);
        const curD = await curR.json();
        const prD = await prR.json();
        const probs = prD?.hourly?.precipitation_probability || [];
        const rainLikely = probs.slice(0, 6).some(p => p >= 50);
        if (mounted) {
          setWeather({
            summary: "Météo locale",
            temperature: curD?.current_weather?.temperature,
            humidity: null,
            rainProbability: rainLikely ? 60 : probs[0] ?? null
          });
          setRainForecast(rainLikely);
        }
      } catch {}
    }, () => {});
    return () => { mounted = false; };
  }, [farmId]);

  // Auto-refresh + event listener
  useEffect(() => {
    if (!farmId) return;
    let mounted = true;
    const handler = () => { if (mounted) loadData(farmId); };
    window.addEventListener("farmDataChanged", handler);
    const iv = setInterval(handler, 30000);
    return () => {
      mounted = false;
      window.removeEventListener("farmDataChanged", handler);
      clearInterval(iv);
    };
  }, [farmId]);

  /* ── Computed KPIs ── */
  const kpis = useMemo(() => {
    const as = {
      total: animals.length,
      healthy: animals.filter(a => (a.healthStatus || "").toLowerCase() === "healthy").length,
      warning: animals.filter(a => (a.healthStatus || "").toLowerCase() === "warning").length,
      sick: animals.filter(a => (a.healthStatus || "").toLowerCase() === "sick").length,
      unknown: animals.filter(a => !["healthy", "warning", "sick"].includes((a.healthStatus || "").toLowerCase())).length
    };
    const ps = {
      total: plants.length,
      healthy: plants.filter(p => (p.healthStatus || "").toLowerCase() === "healthy").length,
      warning: plants.filter(p => (p.healthStatus || "").toLowerCase() === "warning").length,
      sick: plants.filter(p => (p.healthStatus || "").toLowerCase() === "sick").length,
      unknown: plants.filter(p => !["healthy", "warning", "sick"].includes((p.healthStatus || "").toLowerCase())).length
    };
    const ahp = as.total > 0 ? Number((as.healthy / as.total * 100).toFixed(1)) : 0;
    const php = ps.total > 0 ? Number((ps.healthy / ps.total * 100).toFixed(1)) : 0;
    const critical = alerts.filter(a => a.severity === "high" || a.severity === "critical").length;
    return {
      animalStats: as, plantStats: ps,
      animalHealthPct: ahp, plantHealthPct: php,
      criticalAlerts: critical,
      totalAssets: as.total + ps.total,
      overallHealth: Number(((ahp + php) / 2).toFixed(1))
    };
  }, [animals, plants, alerts]);

  /* ── Health series ── */
  const score = (s) => {
    if (typeof s === "number") return Math.min(3, Math.max(0, s * 3));
    switch ((s || "").toLowerCase()) {
      case "healthy": return 0; case "warning": return 1; case "sick": return 2; default: return 3;
    }
  };

  const healthSeries = (list, dateFields) => {
    const now = new Date();
    const fmtMonth = (d) => new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: fmtMonth(d), items: []
      });
    }
    list.forEach(item => {
      let dtStr = dateFields.map(f => item[f]).find(Boolean) || now.toISOString();
      const dt = new Date(dtStr);
      if (isNaN(dt)) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const bucket = months.find(m => m.key === key) || months[months.length - 1];
      bucket.items.push(item);
    });
    let lastValid = 1;
    return months.map(m => {
      if (!m.items.length) return { month: m.label, score: lastValid, count: 0 };
      const avg = Number(
        (m.items.reduce((s, it) => s + score(it.healthStatus), 0) / m.items.length).toFixed(2)
      );
      lastValid = avg;
      return { month: m.label, score: avg, count: m.items.length };
    });
  };

  const animalHealth = useMemo(() => healthSeries(animals, ["birthDate", "createdAt"]), [animals]);
  const plantHealth = useMemo(() => healthSeries(plants, ["plantingDate", "createdAt"]), [plants]);

  const alertsBar = useMemo(() => {
    const map = {};
    (alerts || []).forEach(a => { const t = a?.type || "Autre"; map[t] = (map[t] || 0) + 1; });
    const arr = Object.entries(map).map(([type, value]) => ({ type, value }));
    return arr.length ? arr.sort((x, y) => y.value - x.value) : [{ type: "Aucun", value: 0 }];
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (alertFilter === "all") return alerts;
    return alerts.filter(a => a.severity === alertFilter);
  }, [alerts, alertFilter]);

  const createHealthDistributionChart = (stats, colors) => ({
    data: [{
      values: [stats.healthy, stats.warning, stats.sick, stats.unknown],
      labels: ["Sain", "Attention", "Malade", "Inconnu"],
      type: "pie", hole: 0.65,
      marker: { colors, line: { color: "#fff", width: 3 } },
      textinfo: "label+percent",
      textfont: { size: 11, color: "#1f2937", family: "Inter, system-ui, sans-serif" },
      hovertemplate: "<b>%{label}</b><br>Nombre: %{value}<br>%{percent}<extra></extra>"
    }],
    layout: {
      autosize: true, margin: { l: 20, r: 20, t: 10, b: 40 },
      paper_bgcolor: "rgba(255,255,255,0)",
      font: { family: "Inter, system-ui, sans-serif", size: 12 },
      showlegend: true,
      legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.05, font: { size: 10 } },
      annotations: [{
        text: `<b>${stats.total}</b><br><span style="font-size:11px">Total</span>`,
        x: 0.5, y: 0.5, font: { size: 18, color: "#1f2937" }, showarrow: false
      }]
    }
  });

  /* ── Render ── */
  if (farmLoading) return <LoadingState />;

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50">
      <GridBackground />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-40
                         shadow-sm shadow-green-100/20">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl
                            flex items-center justify-center shadow-lg shadow-green-200/50">
              <MdDashboard className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-800 tracking-tight">Farm Dashboard</h1>
              <p className="text-[10px] text-gray-400 font-medium flex items-center gap-2">
                Real-time farm analytics & monitoring
                {farmId && (
                  <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono text-[8px]">
                    {farmId.substring(0, 8)}…
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LiveClock />
            {lastRefresh && (
              <span className="hidden lg:flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                <FaHistory className="text-green-500 text-[8px]" />
                {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (farmId) { loadData(farmId); showToast("Dashboard refreshed", "success"); }
              }}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500
                         hover:text-green-600 hover:border-green-200 hover:bg-green-50
                         transition-all duration-200 shadow-sm"
              title="Refresh"
            >
              <FaSync size={13} className={loading ? "animate-spin" : ""} />
            </motion.button>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200
                            text-emerald-700 px-3 py-1.5 rounded-xl text-[11px] font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </header>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[1600px] mx-auto px-6 py-6 space-y-6"
      >
        {/* Error State */}
        {!farmLoading && !farmId && (
          <motion.div
            variants={fadeUp}
            className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6
                       flex items-center gap-4 shadow-lg shadow-red-100/30"
          >
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-red-500 text-xl" />
            </div>
            <div>
              <p className="font-bold text-red-800 text-base">Farm Not Found</p>
              <p className="text-sm text-red-600 mt-1">{error || "No farm associated. Create one first."}</p>
            </div>
          </motion.div>
        )}

        {/* ═══════ SUMMARY BAR ═══════ */}
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-7
                     text-white shadow-2xl shadow-green-300/30 overflow-hidden relative"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaGlobeAmericas className="text-white/90" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Farm Overview</h2>
                <p className="text-[11px] text-white/60">Real-time summary of all metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Animals", value: kpis.animalStats.total,
                  sub: `${kpis.animalStats.healthy} healthy`, icon: <FaPaw className="text-sm" />
                },
                {
                  label: "Total Plants", value: kpis.plantStats.total,
                  sub: `${kpis.plantStats.healthy} healthy`, icon: <FaSeedling className="text-sm" />
                },
                {
                  label: "Active Alerts", value: alerts.length,
                  sub: `${kpis.criticalAlerts} critical`, icon: <FaBell className="text-sm" />
                },
                {
                  label: "Health Score", value: `${kpis.overallHealth}%`,
                  sub: "Overall farm health", icon: <FaShieldAlt className="text-sm" />
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                      {item.icon}
                    </div>
                    <p className="text-sm text-white/70 font-medium">{item.label}</p>
                  </div>
                  <p className="text-3xl font-black group-hover:scale-105 transition-transform origin-left">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-white/50 mt-1">{item.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════ CRITICAL ALERTS BANNER ═══════ */}
        <AnimatePresence>
          {kpis.criticalAlerts > 0 && (
            <motion.div
              variants={fadeUp}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200
                         rounded-2xl p-5 shadow-lg shadow-red-100/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                    <FaBell className="text-red-500 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 text-sm">
                      Critical Alerts ({kpis.criticalAlerts})
                    </h3>
                    <p className="text-[10px] text-red-600">Immediate action required</p>
                  </div>
                </div>
                <span className="bg-red-500 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full
                                 shadow-lg shadow-red-200/50 animate-pulse">
                  🚨 URGENT
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts
                  .filter(a => a.severity === "high" || a.severity === "critical")
                  .slice(0, 6)
                  .map((alert, i) => (
                    <AlertItem key={alert.id || i} alert={alert} index={i} />
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ KPI CARDS ═══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<FaShieldAlt className="text-blue-600 text-lg" />}
            iconGradient="bg-gradient-to-br from-blue-500 to-sky-500"
            title="Overall Health"
            value={`${kpis.overallHealth}%`}
            subtitle="Combined animals & plants"
            trend="up" trendLabel="vs last month"
            delay={0}
          />
          <KPICard
            icon={<FaLayerGroup className="text-emerald-600 text-lg" />}
            iconGradient="bg-gradient-to-br from-emerald-500 to-green-500"
            title="Total Assets"
            value={kpis.totalAssets}
            subtitle={`${kpis.animalStats.total} animals · ${kpis.plantStats.total} plants`}
            delay={0.05}
          />
          <KPICard
            icon={<FaPaw className="text-purple-600 text-lg" />}
            iconGradient="bg-gradient-to-br from-purple-500 to-violet-500"
            title="Animal Health"
            value={`${kpis.animalHealthPct}%`}
            subtitle={`${kpis.animalStats.healthy} healthy of ${kpis.animalStats.total}`}
            delay={0.1}
          />
          <KPICard
            icon={<FaBell className="text-red-600 text-lg" />}
            iconGradient="bg-gradient-to-br from-red-500 to-rose-500"
            title="Critical Alerts"
            value={kpis.criticalAlerts}
            subtitle={kpis.criticalAlerts > 0 ? "Immediate attention needed" : "All clear ✅"}
            delay={0.15}
          />
        </div>

        {/* ═══════ RESOURCE CARDS ═══════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResourceCard
            icon={<MdWaterDrop className="text-blue-600 text-2xl" />}
            iconBg="bg-gradient-to-br from-blue-50 to-sky-100"
            title="Water Available"
            value={totalWaterAvailable}
            unit="L"
            status={lowTank ? "Low Level" : "Normal"}
            statusColor={lowTank
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-emerald-50 text-emerald-600 border border-emerald-200"}
            description={lowTank ? "Consider refilling the tank soon" : "Tank level is adequate"}
            delay={0.05}
          />
          <ResourceCard
            icon={<FaDrumstickBite className="text-amber-600 text-2xl" />}
            iconBg="bg-gradient-to-br from-amber-50 to-orange-100"
            title="Food Available"
            value={totalFoodAvailable}
            unit="kg"
            status={(totalFoodAvailable ?? 0) < 10 ? "Low Stock" : "Sufficient"}
            statusColor={(totalFoodAvailable ?? 0) < 10
              ? "bg-amber-50 text-amber-600 border border-amber-200"
              : "bg-emerald-50 text-emerald-600 border border-emerald-200"}
            description="View feeding section for per-species details"
            delay={0.1}
          />
        </motion.div>

        {/* ═══════ ALL ALERTS SECTION ═══════ */}
        {alerts.length > 0 && (
          <motion.div variants={fadeUp}>
            <SectionCard
              icon={<MdNotificationsActive className="text-blue-500" />}
              iconBg="bg-blue-100"
              title={`All Alerts (${alerts.length})`}
              subtitle="Complete alert history"
              headerAction={
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Filter pills */}
                  <div className="flex gap-1 bg-gray-100/80 rounded-lg p-0.5">
                    {[
                      { key: "all", label: "All" },
                      { key: "high", label: "Critical", color: "text-red-600" },
                      { key: "medium", label: "Medium", color: "text-amber-600" },
                      { key: "low", label: "Low", color: "text-gray-500" },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setAlertFilter(f.key)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 ${
                          alertFilter === f.key
                            ? "bg-white text-gray-800 shadow-sm"
                            : `${f.color || "text-gray-500"} hover:bg-white/50`
                        }`}
                      >
                        {f.label}
                        {f.key !== "all" && (
                          <span className="ml-1 opacity-60">
                            {alerts.filter(a => a.severity === f.key).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setAlertsExpanded(!alertsExpanded)}
                    className="flex items-center gap-1 text-[11px] text-green-600 font-semibold
                               hover:text-green-700 transition px-2 py-1 rounded-lg hover:bg-green-50"
                  >
                    {alertsExpanded ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
                    {alertsExpanded ? "Less" : "More"}
                  </button>
                </div>
              }
            >
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {filteredAlerts.slice(0, alertsExpanded ? 50 : 5).map((alert, i) => (
                  <AlertItem key={alert.id || i} alert={alert} index={i} />
                ))}
                {!alertsExpanded && filteredAlerts.length > 5 && (
                  <button
                    onClick={() => setAlertsExpanded(true)}
                    className="w-full py-3 text-center text-xs text-gray-500 font-medium
                               hover:text-green-600 bg-gray-50 rounded-xl hover:bg-green-50 transition"
                  >
                    View {filteredAlerts.length - 5} more alerts →
                  </button>
                )}
                {filteredAlerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <FaCheckCircle className="text-emerald-300 text-2xl mb-2" />
                    <p className="text-sm font-medium">No alerts matching filter</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ═══════ CHARTS GRID ═══════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Trends */}
          <SectionCard
            className="lg:col-span-2"
            icon={<MdTrendingUp className="text-blue-500" />}
            iconBg="bg-blue-100"
            title="Health Trends"
            subtitle="Last 6 months evolution"
          >
            <div style={{ height: 380 }}>
              <Plot
                data={[
                  {
                    x: animalHealth.map(d => d.month),
                    y: animalHealth.map(d => d.score),
                    type: "scatter", mode: "lines+markers", name: "Animals",
                    line: { color: "#8b5cf6", width: 3, shape: "spline" },
                    marker: { size: 8, color: "#8b5cf6", symbol: "circle" },
                    fill: "tonexty", fillcolor: "rgba(139,92,246,0.08)",
                    hovertemplate: "<b>Animals</b><br>%{x}: %{y:.1f}<extra></extra>"
                  },
                  {
                    x: plantHealth.map(d => d.month),
                    y: plantHealth.map(d => d.score),
                    type: "scatter", mode: "lines+markers", name: "Plants",
                    line: { color: "#10b981", width: 3, shape: "spline" },
                    marker: { size: 8, color: "#10b981", symbol: "circle" },
                    fill: "tonexty", fillcolor: "rgba(16,185,129,0.08)",
                    hovertemplate: "<b>Plants</b><br>%{x}: %{y:.1f}<extra></extra>"
                  }
                ]}
                layout={{
                  autosize: true, margin: { l: 60, r: 30, t: 10, b: 50 },
                  paper_bgcolor: "rgba(255,255,255,0)", plot_bgcolor: "rgba(249,250,251,0.3)",
                  font: { family: "Inter, system-ui, sans-serif", size: 12, color: "#374151" },
                  xaxis: {
                    showgrid: true, gridcolor: "rgba(229,231,235,0.6)",
                    showline: true, linecolor: "rgba(209,213,219,1)",
                    tickfont: { size: 11, color: "#6b7280" }
                  },
                  yaxis: {
                    range: [0, 3.2], tickvals: [0, 1, 2, 3],
                    ticktext: ["Excellent", "Good", "Caution", "Critical"],
                    tickfont: { size: 11, color: "#6b7280" },
                    showgrid: true, gridcolor: "rgba(229,231,235,0.6)",
                    showline: true, linecolor: "rgba(209,213,219,1)"
                  },
                  hovermode: "x unified",
                  legend: {
                    x: 1.02, y: 1, bgcolor: "rgba(255,255,255,0.9)",
                    bordercolor: "rgba(229,231,235,1)", borderwidth: 1, font: { size: 11 }
                  }
                }}
                config={{
                  displayModeBar: true, displaylogo: false,
                  modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
                  responsive: true
                }}
                useResizeHandler style={{ width: "100%", height: "100%" }}
              />
            </div>
          </SectionCard>

          {/* Animal Health Distribution */}
          <SectionCard
            icon={<FaHeart className="text-rose-500 text-sm" />}
            iconBg="bg-rose-100"
            title="Animal Health"
            subtitle="Distribution by status"
          >
            <div style={{ height: 340 }}>
              <Plot
                {...createHealthDistributionChart(kpis.animalStats, ["#10b981", "#f59e0b", "#ef4444", "#6b7280"])}
                config={{ displayModeBar: false, responsive: true }}
                useResizeHandler style={{ width: "100%", height: "100%" }}
              />
            </div>
          </SectionCard>
        </motion.div>

        {/* ═══════ BOTTOM ANALYTICS ═══════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plant Health */}
          <SectionCard
            icon={<FaLeaf className="text-emerald-500 text-sm" />}
            iconBg="bg-emerald-100"
            title="Plant Health"
            subtitle="Distribution by status"
          >
            <div style={{ height: 280 }}>
              <Plot
                {...createHealthDistributionChart(kpis.plantStats, ["#10b981", "#f59e0b", "#ef4444", "#6b7280"])}
                config={{ displayModeBar: false, responsive: true }}
                useResizeHandler style={{ width: "100%", height: "100%" }}
              />
            </div>
          </SectionCard>

          {/* Alert Analysis */}
          <SectionCard
            icon={<MdNotificationsActive className="text-amber-500" />}
            iconBg="bg-amber-100"
            title="Alert Analysis"
            subtitle="Distribution by type"
          >
            <div style={{ height: 280 }}>
              <Plot
                data={[{
                  x: alertsBar.map(d => d.type),
                  y: alertsBar.map(d => d.value),
                  type: "bar",
                  marker: {
                    color: alertsBar.map((_, i) =>
                      ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6b7280", "#3b82f6"][i % 6]
                    ),
                    line: { color: "#fff", width: 2 }
                  },
                  hovertemplate: "<b>%{x}</b><br>Count: %{y}<extra></extra>"
                }]}
                layout={{
                  autosize: true, margin: { l: 40, r: 20, t: 10, b: 70 },
                  paper_bgcolor: "rgba(255,255,255,0)",
                  plot_bgcolor: "rgba(249,250,251,0.3)",
                  font: { family: "Inter, system-ui, sans-serif", size: 12, color: "#374151" },
                  xaxis: { tickfont: { size: 10, color: "#6b7280" }, tickangle: -35 },
                  yaxis: {
                    tickfont: { size: 11, color: "#6b7280" },
                    showgrid: true, gridcolor: "rgba(229,231,235,0.6)"
                  },
                  bargap: 0.35
                }}
                config={{ displayModeBar: false, responsive: true }}
                useResizeHandler style={{ width: "100%", height: "100%" }}
              />
            </div>
          </SectionCard>
        </motion.div>

        {/* ═══════ ACTION ROW ═══════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Tasks */}
          <SectionCard
            icon={<MdTask className="text-blue-500" />}
            iconBg="bg-blue-100"
            title="Today's Tasks"
            subtitle={`${tasks.length} pending`}
            headerAction={
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = "/watering"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600
                             border border-blue-200 rounded-xl text-[10px] font-bold
                             hover:bg-blue-100 hover:shadow-sm transition-all"
                >
                  <FaTint size={9} /> Watering
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = "/feeding"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600
                             border border-amber-200 rounded-xl text-[10px] font-bold
                             hover:bg-amber-100 hover:shadow-sm transition-all"
                >
                  <FaDrumstickBite size={9} /> Feeding
                </motion.button>
              </div>
            }
          >
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {tasks.length ? tasks.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50/20
                             rounded-xl hover:shadow-sm transition-all border border-transparent
                             hover:border-blue-100 cursor-default"
                >
                  <span className="text-lg">{t.icon || "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {new Date(t.timeISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {t.meta}
                    </p>
                  </div>
                  <FaClock className="text-gray-300 text-[10px] flex-shrink-0" />
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                    <FaCheckCircle className="text-emerald-400 text-xl" />
                  </div>
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-[10px] text-gray-300 mt-1">No pending tasks</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Insights */}
          <SectionCard
            icon={<MdInsights className="text-purple-500" />}
            iconBg="bg-purple-100"
            title="Smart Insights"
            subtitle="AI-powered suggestions"
          >
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {insights.length ? insights.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50
                             rounded-xl border border-purple-100 hover:shadow-sm transition-all cursor-default"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <FaStar className="text-purple-500 text-xs" />
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">{s}</p>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-3">
                    <MdInsights className="text-purple-300 text-2xl" />
                  </div>
                  <p className="text-sm font-medium">No insights yet</p>
                  <p className="text-[10px] text-gray-300 mt-1">Insights appear based on data</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Weather */}
          <SectionCard
            icon={<FaSun className="text-amber-500 text-sm" />}
            iconBg="bg-gradient-to-br from-amber-100 to-orange-100"
            title="Weather"
            subtitle="Local forecast"
          >
            <WeatherWidget weather={weather} rainForecast={rainForecast} />
          </SectionCard>
        </motion.div>

        {/* ═══════ FOOTER ═══════ */}
        <motion.div variants={fadeUp} className="text-center pb-4 pt-2">
          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="text-green-500" />
              Farm Dashboard v2.0
            </span>
            <span>•</span>
            <span>React + Spring Boot</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaHeart className="text-red-400 text-[8px]" />
              Built with care
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Custom scrollbar styles */}
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
      `}</style>
    </div>
  );
}

