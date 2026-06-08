import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCog, FaBell, FaLock, FaPalette, FaLanguage,
  FaMoon, FaSun, FaSave,
  FaDatabase, FaWifi, FaShieldAlt, FaTrash, FaDownload,
  FaEnvelope, FaMobile, FaDesktop, FaGlobe, FaKey,
  FaEye, FaEyeSlash, FaExclamationTriangle, FaTractor,
  FaTimes, FaCheckCircle, FaInfoCircle, FaUser,
  FaChevronRight, FaLeaf, FaHeart, FaClock, FaSync,
  FaCloud, FaMapMarkerAlt, FaPhone, FaEdit, FaSpinner,
  FaSignOutAlt, FaHistory, FaSeedling
} from "react-icons/fa";
import {
  MdSettings, MdNotifications, MdSecurity, MdColorLens,
  MdStorage, MdPets, MdWaterDrop, MdRefresh
} from "react-icons/md";
import { FaCow } from "react-icons/fa6";

/* ═══════════════════════════════════════
   API CONFIG
   ═══════════════════════════════════════ */
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getStoredUserId() {
  return (
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId") ||
    ""
  );
}

async function authFetch(path, opts = {}) {
  const token = getToken();
  const headers = {
    ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...opts.headers,
  };
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(errText || `${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ═══════ Toast ═══════ */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = {
    success: "bg-gradient-to-r from-emerald-600 to-green-600",
    error: "bg-gradient-to-r from-red-600 to-rose-600",
    info: "bg-gradient-to-r from-blue-600 to-sky-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500",
  };
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
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

/* ═══════ Grid Background ═══════ */
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

/* ═══════ Loading Skeleton ═══════ */
function SettingsSkeleton() {
  const pulse = "animate-pulse bg-gray-200 rounded-xl";
  return (
    <div className="flex gap-6 max-w-[1400px] mx-auto px-6 py-6">
      <div className="w-64 flex-shrink-0 space-y-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={`h-12 ${pulse}`} />
        ))}
      </div>
      <div className="flex-1 space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-48 ${pulse}`} />
        ))}
      </div>
    </div>
  );
}

/* ═══════ Toggle Switch ═══════ */
function ToggleSwitch({ enabled, onChange, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${
        enabled
          ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200/50"
          : "bg-gray-200"
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 28 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full shadow-md bg-white"
      />
    </button>
  );
}

/* ═══════ Section Card ═══════ */
function SectionCard({ icon, iconBg, title, subtitle, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100
        shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      <div className="px-6 py-4 border-b border-gray-50/80 flex items-center gap-3
        bg-gradient-to-r from-white to-gray-50/30">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
          {subtitle && <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

/* ═══════ Setting Item ═══════ */
function SettingItem({ icon, iconColor, title, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 px-4 bg-gray-50/50 rounded-xl
      hover:bg-gray-100/50 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColor}
          flex items-center justify-center shadow-sm
          group-hover:scale-105 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   ███  MAIN SETTINGS COMPONENT  ███
   ═══════════════════════════════════════ */
export default function Settings() {
  /* ── remote data ── */
  const [user, setUser] = useState(null);
  const [farms, setFarms] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [plants, setPlants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [medicalProcesses, setMedical] = useState([]);

  /* ── UI state ── */
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  /* ── settings state ── */
  const [settings, setSettings] = useState({
    language: "en",
    timezone: "GMT+1",
    dateFormat: "DD/MM/YYYY",
    temperatureUnit: "celsius",
    theme: "light",
    compactMode: false,
    animations: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    animalAlerts: true,
    plantAlerts: true,
    weatherAlerts: true,
    tankAlerts: true,
    dailyDigest: false,
    weeklyReport: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    autoWatering: false,
    autoFeeding: false,
    lowTankThreshold: 20,
    criticalTankThreshold: 10,
    shareAnalytics: true,
    showOnlineStatus: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  /* dirty tracking */
  const [initialSettings, setInitialSettings] = useState(null);
  const isDirty = initialSettings && JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ message: msg, type, key: Date.now() });
  }, []);

  /* ═══════════════════════════════════
     FETCH ALL DATA
     ═══════════════════════════════════ */
  const fetchAllData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        /* 1 — user */
        let userData;
        try {
          userData = await authFetch("/auth/user");
        } catch {
          const uid = getStoredUserId();
          if (uid) userData = { id: uid, email: "user@smartfarm.com" };
          else throw new Error("Not authenticated. Please log in.");
        }
        setUser(userData);

        const userId = userData.id || userData._id || getStoredUserId();

        /* 2 — farms */
        let farmsData = [];
        try {
          const raw = await authFetch(`/api/farms/user/${userId}`);
          farmsData = Array.isArray(raw) ? raw : raw ? [raw] : [];
        } catch {}
        setFarms(farmsData);

        const farm = farmsData[0];
        if (farm) {
          const fid = farm.id || farm._id;

          /* 3 — animals */
          try {
            const a = await authFetch(`/api/farms/${fid}/animals`);
            setAnimals(Array.isArray(a) ? a : []);
          } catch {
            setAnimals([]);
          }

          /* 4 — plants */
          try {
            const p = await authFetch(`/api/farms/${fid}/plants`);
            setPlants(Array.isArray(p) ? p : []);
          } catch {
            setPlants([]);
          }

          /* 5 — notifications */
          try {
            const n = await authFetch(`/api/farms/${fid}/notifications`);
            setNotifications(Array.isArray(n) ? n : []);
          } catch {
            try {
              const n2 = await authFetch("/api/notifications");
              setNotifications(Array.isArray(n2) ? n2 : []);
            } catch {
              setNotifications([]);
            }
          }

          /* 6 — medical */
          try {
            const m = await authFetch("/api/medical-process");
            setMedical(Array.isArray(m) ? m : []);
          } catch {
            setMedical([]);
          }

          /* 7 — load farm settings from backend if available */
          try {
            const farmSettings = farm.settings || farm.config || {};
            if (Object.keys(farmSettings).length > 0) {
              setSettings((prev) => ({ ...prev, ...farmSettings }));
              setInitialSettings({ ...settings, ...farmSettings });
            }
          } catch {}
        }

        /* 8 — load local settings (merge) */
        const saved = localStorage.getItem("farmSettings");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSettings((prev) => {
              const merged = { ...prev, ...parsed };
              setInitialSettings(merged);
              return merged;
            });
          } catch {}
        } else {
          setInitialSettings(settings);
        }

        const lastSavedTime = localStorage.getItem("farmSettingsLastSaved");
        if (lastSavedTime) setLastSaved(new Date(lastSavedTime));

        setError(null);
      } catch (err) {
        console.error("Settings fetch error:", err);
        setError(err.message);
        if (!silent) showToast(err.message, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /* auto-refresh every 60s */
  useEffect(() => {
    const iv = setInterval(() => fetchAllData(true), 60000);
    return () => clearInterval(iv);
  }, [fetchAllData]);

  /* ═══════════════════════════════════
     DERIVED VALUES
     ═══════════════════════════════════ */
  const farm = farms[0] || null;
  const farmId = farm?.id || farm?._id || null;
  const userId = user?.id || user?._id || getStoredUserId();
  const userEmail = user?.email || "";
  const userName =
    `${user?.firstName || user?.first_name || ""} ${user?.lastName || user?.last_name || ""}`.trim() ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";
  const userRole = user?.role || "USER";
  const memberSince = user?.createdAt || user?.created_at || farm?.createdAt || "";
useEffect(() => {
  const root = document.documentElement;
  if (settings.theme === 'dark') {
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}, [settings.theme]);
  /* ═══════════════════════════════════
     HANDLERS
     ═══════════════════════════════════ */
  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /* ── save settings ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      /* save to localStorage */
      localStorage.setItem("farmSettings", JSON.stringify(settings));
      localStorage.setItem("farmSettingsLastSaved", new Date().toISOString());

      /* try saving to backend farm */
      if (farmId) {
        try {
          await authFetch(`/api/farms/${farmId}`, {
            method: "PUT",
            body: JSON.stringify({
              ...farm,
              settings: settings,
              autoWatering: settings.autoWatering,
              autoFeeding: settings.autoFeeding,
              lowTankThreshold: settings.lowTankThreshold,
              criticalTankThreshold: settings.criticalTankThreshold,
            }),
          });
        } catch (e) {
          console.warn("Farm settings PUT failed (non-critical):", e.message);
        }
      }

      /* try updating user notification prefs */
      try {
        await authFetch("/auth/user", {
          method: "PUT",
          body: JSON.stringify({
            emailNotifications: settings.emailNotifications,
            pushNotifications: settings.pushNotifications,
            smsNotifications: settings.smsNotifications,
            language: settings.language,
            timezone: settings.timezone,
            theme: settings.theme,
          }),
        });
      } catch (e) {
        console.warn("User settings PUT failed (non-critical):", e.message);
      }

      setInitialSettings({ ...settings });
      setLastSaved(new Date());
      showToast("Settings saved successfully!", "success");
    } catch (err) {
      showToast("Error saving: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── change password ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast("Passwords do not match!", "error");
      return;
    }
    if (passwords.new.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    setChangingPassword(true);
    try {
      /* try POST /auth/reset-password */
      await authFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: userEmail,
          currentPassword: passwords.current,
          oldPassword: passwords.current,
          newPassword: passwords.new,
          password: passwords.new,
          confirmPassword: passwords.confirm,
        }),
      });
      showToast("Password updated successfully!", "success");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      /* try alternative endpoint */
      try {
        await authFetch("/auth/change-password", {
          method: "POST",
          body: JSON.stringify({
            currentPassword: passwords.current,
            newPassword: passwords.new,
          }),
        });
        showToast("Password updated successfully!", "success");
        setPasswords({ current: "", new: "", confirm: "" });
      } catch (err2) {
        showToast("Error: " + (err2.message || err.message), "error");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  /* ── export all real data ── */
  const handleExportData = async () => {
    setExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        version: "2.0",
        user: {
          name: userName,
          email: userEmail,
          role: userRole,
          memberSince,
          id: userId,
        },
        settings,
        farms: farms.map((f) => ({
          id: f.id || f._id,
          name: f.name || f.farmName,
          type: f.type || f.farmType,
          size: f.size || f.farmSize,
          location: f.location,
          createdAt: f.createdAt,
        })),
        animals: animals.map((a) => ({
          id: a.id || a._id,
          name: a.name,
          species: a.species || a.type,
          breed: a.breed,
          health: a.health || a.healthStatus,
          fullness: a.fullness,
          age: a.age,
          weight: a.weight,
          createdAt: a.createdAt,
        })),
        plants: plants.map((p) => ({
          id: p.id || p._id,
          name: p.name,
          type: p.type || p.species,
          health: p.health || p.healthStatus,
          waterLevel: p.waterLevel || p.moisture,
          growthStage: p.growthStage,
          createdAt: p.createdAt,
        })),
        notifications: notifications.slice(0, 100).map((n) => ({
          id: n.id || n._id,
          message: n.message || n.title,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt || n.date,
        })),
        medicalRecords: medicalProcesses.map((m) => ({
          id: m.id || m._id,
          animalId: m.animalId,
          type: m.type,
          description: m.description,
          steps: m.steps,
          createdAt: m.createdAt,
        })),
        statistics: {
          totalAnimals: animals.length,
          totalPlants: plants.length,
          totalNotifications: notifications.length,
          totalMedicalRecords: medicalProcesses.length,
          totalFarms: farms.length,
          healthyAnimals: animals.filter(
            (a) =>
              a.health === "healthy" ||
              a.health === "good" ||
              a.healthStatus === "healthy"
          ).length,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smartfarm-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(
        `Exported ${animals.length} animals, ${plants.length} plants, ${notifications.length} notifications!`,
        "success"
      );
    } catch (err) {
      showToast("Export error: " + err.message, "error");
    } finally {
      setExporting(false);
    }
  };

  /* ── delete account ── */
  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm(
      "⚠️ This will permanently delete your account and ALL farm data. Continue?"
    );
    if (!confirm1) return;
    const confirm2 = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    if (confirm2 !== "DELETE") {
      showToast("Deletion cancelled", "info");
      return;
    }

    setDeleting(true);
    try {
      /* delete farms first */
      for (const f of farms) {
        try {
          await authFetch(`/api/farms/${f.id || f._id}`, { method: "DELETE" });
        } catch {}
      }

      /* try deleting user account */
      try {
        await authFetch("/auth/user", { method: "DELETE" });
      } catch {
        try {
          await authFetch(`/auth/user/${userId}`, { method: "DELETE" });
        } catch {}
      }

      /* clear local data */
      localStorage.clear();
      sessionStorage.clear();

      showToast("Account deleted. Redirecting...", "warning");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      showToast("Delete error: " + err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ── reset all settings ── */
  const handleResetSettings = () => {
    if (!window.confirm("Reset all settings to defaults?")) return;
    const defaults = {
      language: "en",
      timezone: "GMT+1",
      dateFormat: "DD/MM/YYYY",
      temperatureUnit: "celsius",
      theme: "light",
      compactMode: false,
      animations: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      animalAlerts: true,
      plantAlerts: true,
      weatherAlerts: true,
      tankAlerts: true,
      dailyDigest: false,
      weeklyReport: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true,
      autoWatering: false,
      autoFeeding: false,
      lowTankThreshold: 20,
      criticalTankThreshold: 10,
      shareAnalytics: true,
      showOnlineStatus: true,
    };
    setSettings(defaults);
    localStorage.removeItem("farmSettings");
    localStorage.removeItem("farmSettingsLastSaved");
    showToast("Settings reset to defaults", "info");
  };

  /* ── read all notifications ── */
  const handleReadAllNotifications = async () => {
    try {
      if (farmId) {
        await authFetch(`/api/farms/${farmId}/notifications/read-all`, {
          method: "PUT",
        });
      } else {
        await authFetch("/api/notifications/read-all", { method: "PUT" });
      }
      showToast("All notifications marked as read!", "success");
      fetchAllData(true);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  /* ── generate test notifications ── */
  const handleTestNotification = async () => {
    try {
      if (farmId) {
        await authFetch(`/api/farms/${farmId}/notifications/generate-dynamic`, {
          method: "POST",
        });
      } else {
        await authFetch("/api/notifications/generate-dynamic", {
          method: "POST",
        });
      }
      showToast("Test notifications generated!", "success");
      fetchAllData(true);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  /* ═══════════════════════════════════
     TABS & ANIMATION
     ═══════════════════════════════════ */
  const tabs = [
    {
      id: "general",
      label: "General",
      icon: <MdSettings className="text-lg" />,
      color: "from-blue-500 to-sky-500",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <MdColorLens className="text-lg" />,
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <MdNotifications className="text-lg" />,
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "security",
      label: "Security",
      icon: <MdSecurity className="text-lg" />,
      color: "from-red-500 to-rose-500",
    },
    {
      id: "farm",
      label: "Farm Settings",
      icon: <MdPets className="text-lg" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "data",
      label: "Data & Privacy",
      icon: <MdStorage className="text-lg" />,
      color: "from-gray-500 to-slate-500",
    },
  ];

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  /* ═══════════════════════════════════
     RENDER
     ═══════════════════════════════════ */
  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50">
        <GridBackground />
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-40 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaCog className="text-white text-xl animate-spin" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800">Settings</h1>
              <p className="text-xs text-gray-400">Loading your preferences...</p>
            </div>
          </div>
        </header>
        <SettingsSkeleton />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50 flex items-center justify-center">
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
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg"
          >
            <FaSync className="inline mr-2" /> Retry
          </motion.button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

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

      {/* ═══════ Header ═══════ */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-40 shadow-sm shadow-green-100/20">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200/50">
              <FaCog className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight">Settings</h1>
              <p className="text-xs text-gray-400 font-medium">
                Logged in as <span className="text-green-600 font-bold">{userName}</span>
                {lastSaved && (
                  <span className="ml-2 text-gray-300">
                    • Last saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* refresh */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm
                font-medium text-gray-600 hover:bg-gray-200 transition-all"
            >
              <FaSync className={refreshing ? "animate-spin" : ""} size={12} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            {/* save */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
                shadow-lg transition-all duration-300 ${
                  saving
                    ? "bg-gray-200 text-gray-500 cursor-wait"
                    : isDirty
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-xl animate-pulse"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:shadow-green-200/50"
                }`}
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : isDirty ? (
                <>
                  <FaSave /> Save Changes*
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[1400px] mx-auto px-6 py-6"
      >
        <div className="flex gap-6">
          {/* ═══════ Sidebar ═══════ */}
          <motion.div variants={fadeUp} className="w-64 flex-shrink-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-3 sticky top-24">
              <div className="space-y-1">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                      transition-all duration-300 group ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <span className={activeTab === tab.id ? "" : "text-gray-400 group-hover:text-gray-600"}>
                      {tab.icon}
                    </span>
                    <span className="font-semibold text-sm">{tab.label}</span>
                    {tab.id === "notifications" && unreadCount > 0 && (
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <FaChevronRight className="ml-auto text-xs opacity-70" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-800 truncate max-w-[140px]">{userName}</p>
                      <p className="text-[10px] text-green-600 capitalize">{userRole.toLowerCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-green-700">
                      <FaTractor size={10} />
                      <span>{farms.length} farm{farms.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-green-700">
                      <FaCow size={10} />
                      <span>{animals.length} animals</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-green-700">
                      <FaSeedling size={10} />
                      <span>{plants.length} plants</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-green-700">
                      <FaBell size={10} />
                      <span>{unreadCount} unread alerts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-green-600 font-medium">All systems operational</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════ Content ═══════ */}
          <motion.div variants={fadeUp} className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              {/* ══════════ GENERAL ══════════ */}
              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SectionCard
                    icon={<FaCog className="text-blue-500" />}
                    iconBg="bg-gradient-to-br from-blue-100 to-sky-100"
                    title="General Settings"
                    subtitle={`Account: ${userEmail}`}
                  >
                    <div className="space-y-3">
                      <SettingItem
                        icon={<FaLanguage className="text-white text-sm" />}
                        iconColor="from-blue-400 to-blue-600"
                        title="Language"
                        description="Select your preferred language"
                      >
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange("language", e.target.value)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                            focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500
                            cursor-pointer min-w-[140px]"
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="ar">العربية</option>
                          <option value="es">Español</option>
                        </select>
                      </SettingItem>

                      <SettingItem
                        icon={<FaGlobe className="text-white text-sm" />}
                        iconColor="from-emerald-400 to-emerald-600"
                        title="Timezone"
                        description="Set your local timezone"
                      >
                        <select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange("timezone", e.target.value)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                            focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500
                            cursor-pointer min-w-[140px]"
                        >
                          <option value="GMT+1">GMT+1 (Tunisia)</option>
                          <option value="UTC">UTC</option>
                          <option value="GMT+2">GMT+2 (Egypt)</option>
                          <option value="EST">EST (US Eastern)</option>
                          <option value="PST">PST (US Pacific)</option>
                        </select>
                      </SettingItem>

                      <SettingItem
                        icon={<FaClock className="text-white text-sm" />}
                        iconColor="from-purple-400 to-purple-600"
                        title="Date Format"
                        description="Choose how dates are displayed"
                      >
                        <select
                          value={settings.dateFormat}
                          onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                            focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500
                            cursor-pointer min-w-[140px]"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </SettingItem>

                      <SettingItem
                        icon={<FaCloud className="text-white text-sm" />}
                        iconColor="from-amber-400 to-orange-500"
                        title="Temperature Unit"
                        description="Celsius or Fahrenheit"
                      >
                        <div className="flex bg-gray-100 rounded-xl p-1">
                          {["celsius", "fahrenheit"].map((unit) => (
                            <button
                              key={unit}
                              onClick={() => handleSettingChange("temperatureUnit", unit)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                                settings.temperatureUnit === unit
                                  ? "bg-white text-gray-800 shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              {unit === "celsius" ? "°C" : "°F"}
                            </button>
                          ))}
                        </div>
                      </SettingItem>
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ══════════ APPEARANCE ══════════ */}
              {activeTab === "appearance" && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SectionCard
                    icon={<FaPalette className="text-purple-500" />}
                    iconBg="bg-gradient-to-br from-purple-100 to-violet-100"
                    title="Appearance"
                    subtitle="Customize the look and feel"
                  >
                    <div className="space-y-3">
                      <SettingItem
                        icon={
                          settings.theme === "dark" ? (
                            <FaMoon className="text-white text-sm" />
                          ) : (
                            <FaSun className="text-white text-sm" />
                          )
                        }
                        iconColor={
                          settings.theme === "dark"
                            ? "from-indigo-500 to-purple-600"
                            : "from-amber-400 to-orange-500"
                        }
                        title="Theme"
                        description="Choose between light and dark mode"
                      >
                        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                          <button
                            onClick={() => handleSettingChange("theme", "light")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              settings.theme === "light"
                                ? "bg-white text-amber-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <FaSun /> Light
                          </button>
                          <button
                            onClick={() => handleSettingChange("theme", "dark")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              settings.theme === "dark"
                                ? "bg-gray-800 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <FaMoon /> Dark
                          </button>
                        </div>
                      </SettingItem>

                      <SettingItem
                        icon={<FaDesktop className="text-white text-sm" />}
                        iconColor="from-cyan-400 to-cyan-600"
                        title="Compact Mode"
                        description="Use smaller spacing and elements"
                      >
                        <ToggleSwitch
                          enabled={settings.compactMode}
                          onChange={(val) => handleSettingChange("compactMode", val)}
                        />
                      </SettingItem>

                      <SettingItem
                        icon={<FaHeart className="text-white text-sm" />}
                        iconColor="from-pink-400 to-rose-500"
                        title="Animations"
                        description="Enable smooth transitions and effects"
                      >
                        <ToggleSwitch
                          enabled={settings.animations}
                          onChange={(val) => handleSettingChange("animations", val)}
                        />
                      </SettingItem>
                    </div>

                    {/* Theme Preview */}
                    <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Preview</p>
                      <div
                        className={`p-4 rounded-xl border ${
                          settings.theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className={`text-sm font-bold ${settings.theme === "dark" ? "text-white" : "text-gray-800"}`}>
                          {farm?.name || "Sample Farm"} Dashboard
                        </div>
                        <div className={`text-xs mt-1 ${settings.theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {animals.length} animals • {plants.length} plants • {unreadCount} alerts
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ══════════ NOTIFICATIONS ══════════ */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Live stats bar */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-black text-gray-800">{notifications.length}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Total</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div className="text-center">
                          <p className="text-2xl font-black text-red-500">{unreadCount}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Unread</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div className="text-center">
                          <p className="text-2xl font-black text-green-500">
                            {notifications.length - unreadCount}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">Read</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleReadAllNotifications}
                          className="px-4 py-2 bg-green-100 text-green-700 font-bold text-xs rounded-xl
                            hover:bg-green-200 transition-all"
                        >
                          <FaCheckCircle className="inline mr-1.5" /> Mark All Read
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleTestNotification}
                          className="px-4 py-2 bg-blue-100 text-blue-700 font-bold text-xs rounded-xl
                            hover:bg-blue-200 transition-all"
                        >
                          <FaBell className="inline mr-1.5" /> Test Alerts
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <SectionCard
                    icon={<FaBell className="text-amber-500" />}
                    iconBg="bg-gradient-to-br from-amber-100 to-orange-100"
                    title="Notification Channels"
                    subtitle="How you want to receive notifications"
                  >
                    <div className="space-y-3">
                      <SettingItem
                        icon={<FaEnvelope className="text-white text-sm" />}
                        iconColor="from-blue-400 to-blue-600"
                        title="Email Notifications"
                        description={`Send to ${userEmail}`}
                      >
                        <ToggleSwitch
                          enabled={settings.emailNotifications}
                          onChange={(val) => handleSettingChange("emailNotifications", val)}
                        />
                      </SettingItem>

                      <SettingItem
                        icon={<FaBell className="text-white text-sm" />}
                        iconColor="from-purple-400 to-purple-600"
                        title="Push Notifications"
                        description="Browser push notifications"
                      >
                        <ToggleSwitch
                          enabled={settings.pushNotifications}
                          onChange={(val) => handleSettingChange("pushNotifications", val)}
                        />
                      </SettingItem>

                      <SettingItem
                        icon={<FaMobile className="text-white text-sm" />}
                        iconColor="from-green-400 to-emerald-600"
                        title="SMS Notifications"
                        description="Critical alerts via SMS"
                      >
                        <ToggleSwitch
                          enabled={settings.smsNotifications}
                          onChange={(val) => handleSettingChange("smsNotifications", val)}
                        />
                      </SettingItem>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<FaExclamationTriangle className="text-red-500" />}
                    iconBg="bg-gradient-to-br from-red-100 to-rose-100"
                    title="Alert Types"
                    subtitle={`Monitoring ${animals.length} animals and ${plants.length} plants`}
                  >
                    <div className="space-y-3">
                      {[
                        {
                          key: "animalAlerts",
                          icon: <FaCow />,
                          color: "from-amber-400 to-amber-600",
                          title: "Animal Alerts",
                          desc: `Health & feeding for ${animals.length} animals`,
                        },
                        {
                          key: "plantAlerts",
                          icon: <FaLeaf />,
                          color: "from-green-400 to-green-600",
                          title: "Plant Alerts",
                          desc: `Watering & growth for ${plants.length} plants`,
                        },
                        {
                          key: "weatherAlerts",
                          icon: <FaCloud />,
                          color: "from-blue-400 to-blue-600",
                          title: "Weather Alerts",
                          desc: "Severe weather warnings",
                        },
                        {
                          key: "tankAlerts",
                          icon: <MdWaterDrop />,
                          color: "from-cyan-400 to-cyan-600",
                          title: "Tank Alerts",
                          desc: `Threshold: ${settings.lowTankThreshold}% low / ${settings.criticalTankThreshold}% critical`,
                        },
                      ].map((item) => (
                        <SettingItem
                          key={item.key}
                          icon={<span className="text-white text-sm">{item.icon}</span>}
                          iconColor={item.color}
                          title={item.title}
                          description={item.desc}
                        >
                          <ToggleSwitch
                            enabled={settings[item.key]}
                            onChange={(val) => handleSettingChange(item.key, val)}
                          />
                        </SettingItem>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<FaClock className="text-indigo-500" />}
                    iconBg="bg-gradient-to-br from-indigo-100 to-purple-100"
                    title="Reports"
                    subtitle="Scheduled summary reports"
                  >
                    <div className="space-y-3">
                      <SettingItem
                        icon={<FaSun className="text-white text-sm" />}
                        iconColor="from-amber-400 to-orange-500"
                        title="Daily Digest"
                        description="Receive daily summary at 8 AM"
                      >
                        <ToggleSwitch
                          enabled={settings.dailyDigest}
                          onChange={(val) => handleSettingChange("dailyDigest", val)}
                        />
                      </SettingItem>
                      <SettingItem
                        icon={<FaChevronRight className="text-white text-sm" />}
                        iconColor="from-indigo-400 to-indigo-600"
                        title="Weekly Report"
                        description="Detailed weekly analytics every Monday"
                      >
                        <ToggleSwitch
                          enabled={settings.weeklyReport}
                          onChange={(val) => handleSettingChange("weeklyReport", val)}
                        />
                      </SettingItem>
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ══════════ SECURITY ══════════ */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <SectionCard
                    icon={<FaKey className="text-red-500" />}
                    iconBg="bg-gradient-to-br from-red-100 to-rose-100"
                    title="Change Password"
                    subtitle={`Account: ${userEmail}`}
                  >
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwords.current}
                            onChange={(e) =>
                              setPasswords((p) => ({ ...p, current: e.target.value }))
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 pr-12"
                            placeholder="Enter current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwords.new}
                          onChange={(e) =>
                            setPasswords((p) => ({ ...p, new: e.target.value }))
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                            focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          placeholder="Enter new password (min 8 chars)"
                          minLength={8}
                          required
                        />
                        {passwords.new && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  passwords.new.length >= 12
                                    ? "bg-green-500 w-full"
                                    : passwords.new.length >= 8
                                    ? "bg-amber-500 w-2/3"
                                    : "bg-red-500 w-1/3"
                                }`}
                                style={{
                                  width:
                                    passwords.new.length >= 12
                                      ? "100%"
                                      : passwords.new.length >= 8
                                      ? "66%"
                                      : "33%",
                                }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                passwords.new.length >= 12
                                  ? "text-green-600"
                                  : passwords.new.length >= 8
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {passwords.new.length >= 12
                                ? "Strong"
                                : passwords.new.length >= 8
                                ? "Medium"
                                : "Weak"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) =>
                            setPasswords((p) => ({ ...p, confirm: e.target.value }))
                          }
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm
                            focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                              passwords.confirm &&
                              passwords.confirm !== passwords.new
                                ? "border-red-300 focus:border-red-500"
                                : passwords.confirm && passwords.confirm === passwords.new
                                ? "border-green-300 focus:border-green-500"
                                : "border-gray-200 focus:border-green-500"
                            }`}
                          placeholder="Confirm new password"
                          required
                        />
                        {passwords.confirm && passwords.confirm !== passwords.new && (
                          <p className="text-[10px] text-red-500 mt-1 font-medium">
                            Passwords do not match
                          </p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={changingPassword}
                        className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl shadow-lg
                          transition-all duration-300 ${
                            changingPassword
                              ? "bg-gray-200 text-gray-500 cursor-wait"
                              : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-xl hover:shadow-red-200/50"
                          }`}
                      >
                        {changingPassword ? (
                          <>
                            <FaSpinner className="animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <FaKey /> Update Password
                          </>
                        )}
                      </motion.button>
                    </form>
                  </SectionCard>

                  <SectionCard
                    icon={<FaShieldAlt className="text-indigo-500" />}
                    iconBg="bg-gradient-to-br from-indigo-100 to-purple-100"
                    title="Security Options"
                    subtitle="Additional security settings"
                  >
                    <div className="space-y-3">
                      <SettingItem
                        icon={<FaMobile className="text-white text-sm" />}
                        iconColor="from-indigo-400 to-indigo-600"
                        title="Two-Factor Authentication"
                        description="Add an extra layer of security"
                      >
                        <ToggleSwitch
                          enabled={settings.twoFactorAuth}
                          onChange={(val) => handleSettingChange("twoFactorAuth", val)}
                        />
                      </SettingItem>

                      <SettingItem
                        icon={<FaBell className="text-white text-sm" />}
                        iconColor="from-amber-400 to-amber-600"
                        title="Login Alerts"
                        description={`Notify ${userEmail} on new sign-ins`}
                      >
                        <ToggleSwitch
                          enabled={settings.loginAlerts}
                          onChange={(val) => handleSettingChange("loginAlerts", val)}
                        />
                      </SettingItem>

                      <SettingItem
                        icon={<FaClock className="text-white text-sm" />}
                        iconColor="from-gray-400 to-gray-600"
                        title="Session Timeout"
                        description="Auto logout after inactivity"
                      >
                        <select
                          value={settings.sessionTimeout}
                          onChange={(e) =>
                            handleSettingChange("sessionTimeout", parseInt(e.target.value))
                          }
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                            focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500
                            cursor-pointer min-w-[140px]"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={0}>Never</option>
                        </select>
                      </SettingItem>
                    </div>

                    {/* Active sessions info */}
                    <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-3">
                        <FaDesktop className="text-indigo-500" />
                        <div>
                          <p className="text-sm font-bold text-indigo-800">Current Session</p>
                          <p className="text-xs text-indigo-600">
                            {navigator.userAgent.includes("Chrome")
                              ? "Chrome"
                              : navigator.userAgent.includes("Firefox")
                              ? "Firefox"
                              : "Browser"}{" "}
                            • {new Date().toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-green-600 font-bold">Active</span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ══════════ FARM SETTINGS ══════════ */}
              {activeTab === "farm" && (
                <motion.div
                  key="farm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Farm info bar */}
                  {farm && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <FaTractor className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-gray-800">
                            {farm.name || farm.farmName || "My Farm"}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {farm.type || farm.farmType || "Farm"} •{" "}
                            {farm.size || farm.farmSize || "—"} •{" "}
                            {animals.length} animals • {plants.length} plants
                          </p>
                        </div>
                        <div className="flex gap-4 text-center">
                          <div>
                            <p className="text-lg font-black text-amber-500">{animals.length}</p>
                            <p className="text-[10px] text-gray-400">Animals</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-green-500">{plants.length}</p>
                            <p className="text-[10px] text-gray-400">Plants</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-blue-500">
                              {medicalProcesses.length}
                            </p>
                            <p className="text-[10px] text-gray-400">Medical</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <SectionCard
                    icon={<FaTractor className="text-green-500" />}
                    iconBg="bg-gradient-to-br from-green-100 to-emerald-100"
                    title="Automation"
                    subtitle="Automatic farm management features"
                  >
                    <div className="space-y-3">
                      <SettingItem
                        icon={<MdWaterDrop className="text-white text-lg" />}
                        iconColor="from-blue-400 to-cyan-500"
                        title="Auto Watering"
                        description={`Automatically water ${plants.length} plants when needed`}
                      >
                        <ToggleSwitch
                          enabled={settings.autoWatering}
                          onChange={(val) => handleSettingChange("autoWatering", val)}
                        />
                      </SettingItem>

                      <SettingItem
                        icon={<MdPets className="text-white text-lg" />}
                        iconColor="from-amber-400 to-orange-500"
                        title="Auto Feeding"
                        description={`Automatically feed ${animals.length} animals on schedule`}
                      >
                        <ToggleSwitch
                          enabled={settings.autoFeeding}
                          onChange={(val) => handleSettingChange("autoFeeding", val)}
                        />
                      </SettingItem>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<FaExclamationTriangle className="text-amber-500" />}
                    iconBg="bg-gradient-to-br from-amber-100 to-orange-100"
                    title="Alert Thresholds"
                    subtitle="Configure when to trigger alerts"
                  >
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">Low Tank Warning</p>
                            <p className="text-xs text-gray-400">Alert when level falls below</p>
                          </div>
                          <span className="text-2xl font-black text-amber-500">
                            {settings.lowTankThreshold}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={settings.lowTankThreshold}
                          onChange={(e) =>
                            handleSettingChange("lowTankThreshold", parseInt(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-amber-500
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-lg"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                          <span>5%</span>
                          <span>50%</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">Critical Tank Level</p>
                            <p className="text-xs text-gray-400">Urgent alert threshold</p>
                          </div>
                          <span className="text-2xl font-black text-red-500">
                            {settings.criticalTankThreshold}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={settings.criticalTankThreshold}
                          onChange={(e) =>
                            handleSettingChange(
                              "criticalTankThreshold",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-red-500
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-lg"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                          <span>1%</span>
                          <span>20%</span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  {/* Species breakdown */}
                  {animals.length > 0 && (
                    <SectionCard
                      icon={<FaCow className="text-amber-500" />}
                      iconBg="bg-gradient-to-br from-amber-100 to-orange-100"
                      title="Animal Species Overview"
                      subtitle="Breakdown by species from your farm"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(
                          animals.reduce((acc, a) => {
                            const sp = a.species || a.type || "Unknown";
                            acc[sp] = (acc[sp] || 0) + 1;
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
                    </SectionCard>
                  )}
                </motion.div>
              )}

              {/* ══════════ DATA & PRIVACY ══════════ */}
              {activeTab === "data" && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Data summary */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                      <FaDatabase className="text-indigo-500" /> Your Data Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Farms", count: farms.length, color: "text-green-600 bg-green-50" },
                        { label: "Animals", count: animals.length, color: "text-amber-600 bg-amber-50" },
                        { label: "Plants", count: plants.length, color: "text-emerald-600 bg-emerald-50" },
                        {
                          label: "Notifications",
                          count: notifications.length,
                          color: "text-blue-600 bg-blue-50",
                        },
                        {
                          label: "Medical",
                          count: medicalProcesses.length,
                          color: "text-red-600 bg-red-50",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`${item.color} rounded-xl p-4 text-center border border-gray-100`}
                        >
                          <p className="text-2xl font-black">{item.count}</p>
                          <p className="text-[10px] font-medium mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <SectionCard
                    icon={<FaShieldAlt className="text-gray-500" />}
                    iconBg="bg-gradient-to-br from-gray-100 to-slate-100"
                    title="Privacy"
                    subtitle="Manage your privacy preferences"
                  >
                    <div className="space-y-3">
                      <SettingItem
                        icon={<FaWifi className="text-white text-sm" />}
                        iconColor="from-green-400 to-emerald-600"
                        title="Show Online Status"
                        description="Let others see when you're online"
                      >
                        <ToggleSwitch
                          enabled={settings.showOnlineStatus}
                          onChange={(val) => handleSettingChange("showOnlineStatus", val)}
                        />
                      </SettingItem>

                      <SettingItem
                        icon={<FaDatabase className="text-white text-sm" />}
                        iconColor="from-blue-400 to-blue-600"
                        title="Share Analytics"
                        description="Help improve the app with anonymous data"
                      >
                        <ToggleSwitch
                          enabled={settings.shareAnalytics}
                          onChange={(val) => handleSettingChange("shareAnalytics", val)}
                        />
                      </SettingItem>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<FaDatabase className="text-indigo-500" />}
                    iconBg="bg-gradient-to-br from-indigo-100 to-purple-100"
                    title="Data Management"
                    subtitle="Export or delete your data"
                  >
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportData}
                        disabled={exporting}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4
                          font-bold text-sm rounded-xl shadow-lg transition-all duration-300 ${
                            exporting
                              ? "bg-gray-200 text-gray-500 cursor-wait"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-200/50"
                          }`}
                      >
                        {exporting ? (
                          <>
                            <FaSpinner className="animate-spin" /> Exporting {animals.length} animals,{" "}
                            {plants.length} plants...
                          </>
                        ) : (
                          <>
                            <FaDownload /> Export All My Data ({farms.length} farms, {animals.length}{" "}
                            animals, {plants.length} plants)
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleResetSettings}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4
                          bg-amber-50 text-amber-700 border-2 border-amber-200
                          font-bold text-sm rounded-xl hover:bg-amber-100 transition-all duration-300"
                      >
                        <MdRefresh /> Reset All Settings to Defaults
                      </motion.button>

                      {/* Danger zone */}
                      <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                        <div className="flex items-start gap-3">
                          <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-red-700">Danger Zone</p>
                            <p className="text-xs text-red-500 mt-1">
                              Deleting your account will permanently remove all{" "}
                              <strong>{farms.length}</strong> farms,{" "}
                              <strong>{animals.length}</strong> animals,{" "}
                              <strong>{plants.length}</strong> plants, and all associated data.
                              This cannot be undone.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleDeleteAccount}
                              disabled={deleting}
                              className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs
                                transition-all ${
                                  deleting
                                    ? "bg-gray-200 text-gray-500 cursor-wait"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                            >
                              {deleting ? (
                                <>
                                  <FaSpinner className="animate-spin" /> Deleting...
                                </>
                              ) : (
                                <>
                                  <FaTrash /> Delete my account permanently
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-gray-400">
        <p className="flex items-center justify-center gap-2">
          <FaShieldAlt className="text-green-500" />
          Smart Farm Settings • Connected to {API}
          {lastSaved && <span>• Last saved {lastSaved.toLocaleString()}</span>}
        </p>
      </div>
    </div>
  );
}