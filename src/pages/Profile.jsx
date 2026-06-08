import API_BASE from '../config';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera,
  FaEdit, FaSave, FaTimes, FaTractor, FaCalendar, FaShieldAlt,
  FaChartLine, FaSeedling, FaCheckCircle,
  FaAward, FaMedal, FaStar, FaCrown, FaLeaf, FaHeart,
  FaInfoCircle, FaClock, FaBell, FaExclamationTriangle,
  FaHistory, FaGlobe, FaSync, FaSpinner
} from "react-icons/fa";
import {
  MdDashboard, MdPets, MdVerified, MdEdit
} from "react-icons/md";
import { FaCow } from "react-icons/fa6";

/* ═══════════════════════════════════════════
   API CONFIG — change to match your backend
   ═══════════════════════════════════════════ */
const API = import.meta.env.VITE_API_URL || API_BASE;

/* ── get token from wherever your auth stores it ── */
function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

/* ── get stored userId (set at login) ── */
function getStoredUserId() {
  return (
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId") ||
    ""
  );
}

/* ── reusable fetch wrapper with auth header ── */
async function authFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ══════════════════════
   TOAST
   ══════════════════════ */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = {
    success: "bg-gradient-to-r from-emerald-600 to-green-600",
    error:   "bg-gradient-to-r from-red-600 to-rose-600",
    info:    "bg-gradient-to-r from-blue-600 to-sky-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500",
  };
  const icons = {
    success: <FaCheckCircle />,
    error:   <FaExclamationTriangle />,
    info:    <FaInfoCircle />,
    warning: <FaBell />,
  };

  return (
    <motion.div
      initial={{ x: 120, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed top-6 right-6 z-[100] ${bg[type]} text-white px-5 py-3.5
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

/* ══════════════════════
   GRID BG
   ══════════════════════ */
const GridBackground = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    <div
      className="absolute inset-0 opacity-[0.015]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

/* ══════════════════════
   LOADING SKELETON
   ══════════════════════ */
function ProfileSkeleton() {
  const pulse = "animate-pulse bg-gray-200 rounded-xl";
  return (
    <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-6 space-y-6">
      {/* cover */}
      <div className={`h-56 rounded-3xl ${pulse}`} />
      {/* card */}
      <div className="bg-white rounded-3xl p-8 -mt-20 mx-8 shadow-xl space-y-4">
        <div className="flex items-center gap-6">
          <div className={`w-36 h-36 rounded-3xl ${pulse}`} />
          <div className="flex-1 space-y-3">
            <div className={`h-8 w-60 ${pulse}`} />
            <div className={`h-4 w-40 ${pulse}`} />
            <div className="flex gap-2 mt-2">
              <div className={`h-7 w-28 rounded-full ${pulse}`} />
              <div className={`h-7 w-24 rounded-full ${pulse}`} />
            </div>
          </div>
        </div>
      </div>
      {/* tabs */}
      <div className={`h-14 ${pulse}`} />
      {/* stats */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-28 ${pulse}`} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   STAT CARD
   ══════════════════════ */
function StatCard({ icon, iconBg, value, label, trend }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5
        shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center
          shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-black text-gray-800">{value}</p>
          <p className="text-xs text-gray-400 font-medium">{label}</p>
        </div>
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`mt-3 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
          trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        }`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </motion.div>
  );
}

/* ══════════════════════
   ACHIEVEMENT CARD
   ══════════════════════ */
function AchievementCard({ achievement, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        achievement.unlocked
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-lg"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      {achievement.unlocked && (
        <div className="absolute top-3 right-3">
          <FaCheckCircle className="text-green-500" />
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
        achievement.unlocked
          ? `bg-gradient-to-br ${achievement.color} shadow-lg`
          : "bg-gray-200"
      }`}>
        <achievement.icon className={`text-xl ${achievement.unlocked ? "text-white" : "text-gray-400"}`} />
      </div>
      <h4 className={`font-bold text-sm ${achievement.unlocked ? "text-gray-800" : "text-gray-500"}`}>
        {achievement.name}
      </h4>
      <p className={`text-xs mt-1 ${achievement.unlocked ? "text-gray-500" : "text-gray-400"}`}>
        {achievement.description}
      </p>
      {achievement.unlocked && achievement.date && (
        <p className="text-[10px] text-green-600 mt-3 font-medium flex items-center gap-1">
          <FaCheckCircle size={8} /> Unlocked
        </p>
      )}
    </motion.div>
  );
}

/* ══════════════════════
   ACTIVITY ITEM
   ══════════════════════ */
function ActivityItem({ activity, index }) {
  const typeConfig = {
    animal:   { icon: <FaCow />,      bg: "bg-amber-100",  color: "text-amber-600" },
    plant:    { icon: <FaSeedling />,  bg: "bg-green-100",  color: "text-green-600" },
    medical:  { icon: <FaHeart />,     bg: "bg-red-100",    color: "text-red-600" },
    settings: { icon: <FaShieldAlt />, bg: "bg-indigo-100", color: "text-indigo-600" },
    alert:    { icon: <FaBell />,      bg: "bg-orange-100", color: "text-orange-600" },
    general:  { icon: <FaBell />,      bg: "bg-blue-100",   color: "text-blue-600" },
  };
  const cfg = typeConfig[activity.type] || typeConfig.general;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl
        hover:bg-gray-100/50 transition-all duration-200"
    >
      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center ${cfg.color}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
        <p className="text-xs text-gray-400">{activity.time}</p>
      </div>
      <FaClock className="text-gray-300 text-xs flex-shrink-0" />
    </motion.div>
  );
}

/* ══════════════════════════════════════
   TIME-AGO HELPER
   ══════════════════════════════════════ */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ════════════════════════════════════════════
   ███  MAIN PROFILE COMPONENT  ███
   ════════════════════════════════════════════ */
export default function Profile() {
  const fileInputRef = useRef(null);

  /* ── remote data ── */
  const [user, setUser]                 = useState(null);
  const [farms, setFarms]               = useState([]);
  const [animals, setAnimals]           = useState([]);
  const [plants, setPlants]             = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [medicalProcesses, setMedical]  = useState([]);

  /* ── UI state ── */
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [isEditing, setIsEditing]       = useState(false);
  const [activeTab, setActiveTab]       = useState("overview");
  const [toast, setToast]               = useState(null);

  /* ── editable profile extras (saved to localStorage) ── */
  const [profileExtras, setProfileExtras] = useState({
    bio: "",
    phone: "",
    location: "",
    website: "",
    avatar: null,
  });

  const showToast = useCallback((msg, type = "info") => {
    setToast({ message: msg, type, key: Date.now() });
  }, []);

  /* ═══════════════════════════════════════
     FETCH ALL DATA FROM BACKEND
     ═══════════════════════════════════════ */
  const fetchAllData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      /* 1 ── current user ── */
      let userData;
      try {
        userData = await authFetch("/auth/user");
      } catch {
        /* fallback: try with stored userId */
        const uid = getStoredUserId();
        if (uid) userData = { id: uid, email: "user@smartfarm.com" };
        else throw new Error("Not authenticated. Please log in.");
      }
      setUser(userData);

      const userId = userData.id || userData._id || getStoredUserId();

      /* 2 ── user farms ── */
      let farmsData = [];
      try {
        const raw = await authFetch(`/api/farms/user/${userId}`);
        farmsData = Array.isArray(raw) ? raw : raw ? [raw] : [];
      } catch { /* no farms yet */ }
      setFarms(farmsData);

      const farm = farmsData[0]; // primary farm

      if (farm) {
        const farmId = farm.id || farm._id;

        /* 3 ── animals ── */
        try {
          const a = await authFetch(`/api/farms/${farmId}/animals`);
          setAnimals(Array.isArray(a) ? a : []);
        } catch { setAnimals([]); }

        /* 4 ── plants ── */
        try {
          const p = await authFetch(`/api/farms/${farmId}/plants`);
          setPlants(Array.isArray(p) ? p : []);
        } catch { setPlants([]); }

        /* 5 ── notifications ── */
        try {
          const n = await authFetch(`/api/farms/${farmId}/notifications`);
          setNotifications(Array.isArray(n) ? n : []);
        } catch {
          try {
            const n2 = await authFetch("/api/notifications");
            setNotifications(Array.isArray(n2) ? n2 : []);
          } catch { setNotifications([]); }
        }

        /* 6 ── medical processes ── */
        try {
          const m = await authFetch("/api/medical-process");
          setMedical(Array.isArray(m) ? m : []);
        } catch { setMedical([]); }
      }

      setError(null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.message);
      if (!silent) showToast(err.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  /* ── initial load + load extras from localStorage ── */
  useEffect(() => {
    fetchAllData();

    const saved = localStorage.getItem("profileExtras");
    if (saved) {
      try { setProfileExtras(JSON.parse(saved)); } catch {}
    }
  }, [fetchAllData]);

  /* ── auto-refresh every 30 s ── */
  useEffect(() => {
    const iv = setInterval(() => fetchAllData(true), 30000);
    return () => clearInterval(iv);
  }, [fetchAllData]);

  /* ═══════════════════════════════════════
     DERIVED / COMPUTED VALUES
     ═══════════════════════════════════════ */
  const farm = farms[0] || null;

  const fullName = user
    ? `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || user.name || ""}`.trim() || user.username || user.email?.split("@")[0] || "Farmer"
    : "Loading...";

  const email       = user?.email || "";
  const memberSince = user?.createdAt || user?.created_at || user?.joinDate || farm?.createdAt || "";
  const farmName    = farm?.name || farm?.farmName || "My Farm";
  const farmSize    = farm?.size || farm?.farmSize || "—";
  const farmType    = farm?.type || farm?.farmType || "—";
  const farmLocation = farm?.location || profileExtras.location || "—";

  const healthyAnimals = animals.filter(a =>
    (a.health === "healthy" || a.health === "good" || a.healthStatus === "healthy" || a.isHealthy === true)
  ).length;

  const daysActive = memberSince
    ? Math.max(1, Math.floor((Date.now() - new Date(memberSince).getTime()) / 86400000))
    : 0;

  /* ── map notifications → activity feed ── */
  const activityFeed = notifications
    .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
    .slice(0, 15)
    .map(n => {
      const msg = n.message || n.title || n.content || "Notification";
      let type = "general";
      const lower = msg.toLowerCase();
      if (lower.includes("animal") || lower.includes("cow") || lower.includes("sheep") || lower.includes("feed"))
        type = "animal";
      else if (lower.includes("plant") || lower.includes("water") || lower.includes("harvest"))
        type = "plant";
      else if (lower.includes("health") || lower.includes("medical") || lower.includes("vaccine"))
        type = "medical";
      else if (lower.includes("alert") || lower.includes("warning") || lower.includes("tank"))
        type = "alert";
      else if (lower.includes("setting") || lower.includes("config"))
        type = "settings";

      return {
        id: n.id || n._id,
        action: msg,
        time: timeAgo(n.createdAt || n.date),
        type,
      };
    });

  /* ── dynamic achievements ── */
  const achievements = [
    {
      id: 1, name: "First Steps", description: "Created your first farm",
      icon: FaTractor, unlocked: farms.length > 0,
      color: "from-blue-500 to-blue-600", date: farm?.createdAt
    },
    {
      id: 2, name: "Animal Lover", description: "Added 10+ animals",
      icon: FaCow, unlocked: animals.length >= 10,
      color: "from-amber-500 to-orange-500", date: animals.length >= 10 ? true : null
    },
    {
      id: 3, name: "Green Thumb", description: "Planted 50+ crops",
      icon: FaSeedling, unlocked: plants.length >= 50,
      color: "from-green-500 to-emerald-500", date: plants.length >= 50 ? true : null
    },
    {
      id: 4, name: "Caretaker", description: "All animals healthy",
      icon: FaHeart, unlocked: animals.length > 0 && healthyAnimals === animals.length,
      color: "from-red-500 to-rose-500", date: null
    },
    {
      id: 5, name: "Hydration Master", description: "Added 20+ plants",
      icon: FaLeaf, unlocked: plants.length >= 20,
      color: "from-cyan-500 to-teal-500", date: null
    },
    {
      id: 6, name: "Centurion", description: "100+ days active",
      icon: FaCrown, unlocked: daysActive >= 100,
      color: "from-purple-500 to-violet-500", date: null
    },
    {
      id: 7, name: "Vet on Call", description: "5+ medical processes",
      icon: FaMedal, unlocked: medicalProcesses.length >= 5,
      color: "from-emerald-500 to-green-600", date: null
    },
    {
      id: 8, name: "Farm Legend", description: "50+ animals & 100+ plants",
      icon: FaStar, unlocked: animals.length >= 50 && plants.length >= 100,
      color: "from-yellow-500 to-amber-500", date: null
    },
  ];

  /* ═══════════════════════════════════════
     HANDLERS
     ═══════════════════════════════════════ */
  const handleExtraChange = (field, value) => {
    setProfileExtras(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      /* save profile extras to localStorage */
      localStorage.setItem("profileExtras", JSON.stringify(profileExtras));

      /* try updating user on backend (optional endpoint) */
      try {
        await authFetch("/auth/user", {
          method: "PUT",
          body: JSON.stringify({
            phone: profileExtras.phone,
            location: profileExtras.location,
            bio: profileExtras.bio,
            website: profileExtras.website,
          }),
        });
      } catch {
        /* PUT /auth/user might not exist — that's fine, extras are in localStorage */
      }

      /* try updating farm name / type if farm exists */
      if (farm) {
        try {
          await authFetch(`/api/farms/${farm.id || farm._id}`, {
            method: "PUT",
            body: JSON.stringify({
              name: farm.name,
              type: farm.type,
              size: farm.size,
              location: profileExtras.location,
            }),
          });
        } catch { /* farm PUT might not exist */ }
      }

      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
      fetchAllData(true);
    } catch (err) {
      showToast("Error saving profile: " + err.message, "error");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5 MB", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileExtras(prev => {
        const next = { ...prev, avatar: reader.result };
        localStorage.setItem("profileExtras", JSON.stringify(next));
        return next;
      });
      showToast("Photo updated!", "success");
    };
    reader.readAsDataURL(file);
  };

  /* ═══════════════════════════════════════
     ANIMATION VARIANTS
     ═══════════════════════════════════════ */
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const fadeUp  = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const tabs = [
    { id: "overview",     label: "Overview",      icon: <MdDashboard /> },
    { id: "details",      label: "Details",        icon: <FaUser /> },
    { id: "achievements", label: "Achievements",   icon: <FaAward /> },
    { id: "activity",     label: "Activity",       icon: <FaHistory /> },
  ];

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50">
        <GridBackground />
        <ProfileSkeleton />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50
        flex items-center justify-center">
        <GridBackground />
        <div className="text-center bg-white rounded-3xl p-12 shadow-xl max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchAllData()}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white
              font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <FaSync className="inline mr-2" /> Retry
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50">
      <GridBackground />

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            key={toast.key}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[1200px] mx-auto px-6 py-6 space-y-6"
      >
        {/* ══════════ PROFILE HEADER ══════════ */}
        <motion.div variants={fadeUp} className="relative">
          {/* cover */}
          <div className="h-48 md:h-56 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            {/* refresh button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl
                flex items-center justify-center text-white hover:bg-white/30 transition-all z-20"
            >
              <FaSync className={refreshing ? "animate-spin" : ""} />
            </motion.button>
          </div>

          {/* profile card */}
          <div className="relative -mt-20 mx-4 md:mx-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* avatar */}
                <div className="relative -mt-20 md:-mt-24">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white">
                    {profileExtras.avatar ? (
                      <img src={profileExtras.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <span className="text-white text-5xl font-black">
                          {fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600
                      rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white"
                  >
                    <FaCamera />
                  </motion.button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
                </div>

                {/* name & info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-800">{fullName}</h1>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <FaEnvelope className="text-green-500" /> {email}
                    </span>
                    {farm && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <FaTractor className="text-green-500" /> {farmName}
                      </span>
                    )}
                    {farmLocation !== "—" && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <FaMapMarkerAlt className="text-red-400" /> {farmLocation}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700
                      text-xs font-bold rounded-full border border-green-200">
                      <MdVerified /> {user?.role || "User"}
                    </span>
                    {memberSince && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700
                        text-xs font-bold rounded-full border border-blue-200">
                        <FaCalendar /> Since {new Date(memberSince).toLocaleDateString()}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700
                      text-xs font-bold rounded-full border border-emerald-200">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Online
                    </span>
                  </div>
                </div>

                {/* edit / save buttons */}
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                          text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <FaSave /> Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600
                          font-bold text-sm rounded-xl hover:bg-gray-200 transition-all"
                      >
                        <FaTimes /> Cancel
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                        text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <FaEdit /> Edit Profile
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════ TABS ══════════ */}
        <motion.div
          variants={fadeUp}
          className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-100"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
                transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* ══════════ TAB CONTENT ══════════ */}
        <AnimatePresence mode="wait">
          {/* ─── OVERVIEW ─── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<FaCow className="text-2xl text-white" />}
                  iconBg="bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200/50"
                  value={animals.length}
                  label="Total Animals"
                />
                <StatCard
                  icon={<FaSeedling className="text-2xl text-white" />}
                  iconBg="bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200/50"
                  value={plants.length}
                  label="Total Plants"
                />
                <StatCard
                  icon={<FaHeart className="text-2xl text-white" />}
                  iconBg="bg-gradient-to-br from-red-400 to-rose-500 shadow-red-200/50"
                  value={healthyAnimals}
                  label="Healthy Animals"
                />
                <StatCard
                  icon={<FaCalendar className="text-2xl text-white" />}
                  iconBg="bg-gradient-to-br from-purple-400 to-violet-500 shadow-purple-200/50"
                  value={daysActive}
                  label="Days Active"
                />
              </div>

              {/* bio */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                  <FaUser className="text-green-500" /> About
                </h3>
                {isEditing ? (
                  <textarea
                    value={profileExtras.bio}
                    onChange={e => handleExtraChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                    placeholder="Tell us about yourself and your farm..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {profileExtras.bio || "No bio yet. Click Edit Profile to add one."}
                  </p>
                )}
              </div>

              {/* farm info */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                  <FaTractor className="text-green-500" /> Farm Information
                </h3>
                {farm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Farm Name",  value: farmName },
                      { label: "Farm Size",  value: farmSize },
                      { label: "Farm Type",  value: farmType },
                      { label: "Animals",    value: `${animals.length} total (${healthyAnimals} healthy)` },
                      { label: "Plants",     value: `${plants.length} total` },
                      { label: "Notifications", value: `${notifications.length}` },
                      { label: "Medical Records", value: `${medicalProcesses.length}` },
                      { label: "Member Since", value: memberSince ? new Date(memberSince).toLocaleDateString() : "—" },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                          {item.label}
                        </p>
                        <p className="font-semibold text-gray-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaTractor className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No farm created yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Go to Dashboard to create your first farm.
                    </p>
                  </div>
                )}
              </div>

              {/* animal species breakdown */}
              {animals.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                    <FaCow className="text-amber-500" /> Animal Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(
                      animals.reduce((acc, a) => {
                        const species = a.species || a.type || "Unknown";
                        acc[species] = (acc[species] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([species, count]) => (
                      <div
                        key={species}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4
                          border border-amber-100 text-center"
                      >
                        <p className="text-2xl font-black text-amber-600">{count}</p>
                        <p className="text-xs text-amber-700 font-medium capitalize">{species}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── DETAILS ─── */}
          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                <FaEnvelope className="text-green-500" /> Contact & Account Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* email — read only from backend */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl
                    flex items-center justify-center text-green-600">
                    <FaEnvelope />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="font-semibold text-gray-800">{email}</p>
                  </div>
                </div>

                {/* phone — editable */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl
                    flex items-center justify-center text-green-600">
                    <FaPhone />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileExtras.phone}
                        onChange={e => handleExtraChange("phone", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mt-1
                          focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        placeholder="+216 XX XXX XXX"
                      />
                    ) : (
                      <p className="font-semibold text-gray-800">
                        {profileExtras.phone || "—"}
                      </p>
                    )}
                  </div>
                </div>

                {/* location — editable */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl
                    flex items-center justify-center text-green-600">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileExtras.location}
                        onChange={e => handleExtraChange("location", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mt-1
                          focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="font-semibold text-gray-800">{farmLocation}</p>
                    )}
                  </div>
                </div>

                {/* website — editable */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl
                    flex items-center justify-center text-green-600">
                    <FaGlobe />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Website</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileExtras.website}
                        onChange={e => handleExtraChange("website", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mt-1
                          focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        placeholder="yoursite.com"
                      />
                    ) : (
                      <p className="font-semibold text-gray-800">
                        {profileExtras.website || "—"}
                      </p>
                    )}
                  </div>
                </div>

                {/* role — from backend */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl
                    flex items-center justify-center text-green-600">
                    <FaShieldAlt />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Role</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {user?.role?.toLowerCase() || "user"}
                    </p>
                  </div>
                </div>

                {/* user ID — from backend */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl
                    flex items-center justify-center text-green-600">
                    <FaInfoCircle />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account ID</p>
                    <p className="font-semibold text-gray-800 text-xs font-mono">
                      {user?.id || user?._id || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* account status */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaShieldAlt className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-sm">Account Status</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Active &amp; Authenticated
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[10px] text-green-600 font-medium">Last refresh</p>
                    <p className="text-[10px] text-green-500">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ACHIEVEMENTS ─── */}
          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <FaAward className="text-amber-500" /> Achievements
                </h3>
                <span className="text-sm font-bold text-gray-500">
                  {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
                </span>
              </div>

              {/* progress bar */}
              <div className="mb-6">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((ach, i) => (
                  <AchievementCard key={ach.id} achievement={ach} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── ACTIVITY ─── */}
          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <FaHistory className="text-blue-500" /> Recent Activity
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchAllData(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm
                    font-medium text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <FaSync className={refreshing ? "animate-spin" : ""} size={12} />
                  Refresh
                </motion.button>
              </div>

              {activityFeed.length > 0 ? (
                <div className="space-y-3">
                  {activityFeed.map((act, i) => (
                    <ActivityItem key={act.id || i} activity={act} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No activity yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your farm notifications will appear here.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* footer */}
      <div className="text-center py-6 text-xs text-gray-400">
        <p className="flex items-center justify-center gap-2">
          <FaHeart className="text-red-400" />
          Smart Farm Profile • Real-time data from your account
        </p>
      </div>
    </div>
  );
}
