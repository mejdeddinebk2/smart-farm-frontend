import { useEffect, useState, useCallback, useMemo, useRef, forwardRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBell, FaBellSlash, FaCheck,
  FaExclamationTriangle, FaInfoCircle, FaLeaf, FaPaw,
  FaCloudSun, FaHeartbeat, FaSync, FaTrash, FaTimes,
  FaClock, FaCheckCircle, FaSearch, FaChevronDown,
  FaShieldAlt, FaBolt, FaHistory, FaExpand, FaFilter,
  FaStar, FaArchive, FaEllipsisH, FaArrowUp, FaGlobeAmericas
} from 'react-icons/fa';
import {
  MdNotificationsActive, MdNotificationsNone, MdMarkEmailRead,
  MdFilterList, MdAutorenew, MdNewReleases, MdDone, MdDoneAll,
  MdDeleteSweep, MdSort, MdRefresh
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';

/* ═══════════════════════════════════════════
   Config & Helpers
   ═══════════════════════════════════════════ */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/*
 * ✅ FIX: Notification endpoints are GLOBAL (/api/notifications),
 *    NOT per-farm (/api/farms/{id}/notifications).
 *    Your Spring Boot controller is:  @RequestMapping("/api/notifications")
 */
const NOTIFICATION_API = `${API_BASE}/api/notifications`;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

/* ═══════ useDebounce Hook ═══════ */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/* ═══════ Relative Time Formatter ═══════ */
function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ═══════ Notification Type Config ═══════ */
const NOTIFICATION_TYPES = {
  animal: {
    icon: <FaPaw size={16} />,
    label: 'Animal',
    emoji: '🐾',
    iconColor: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    accentBorder: 'border-l-indigo-500',
    ring: 'ring-indigo-200',
  },
  plant: {
    icon: <FaLeaf size={16} />,
    label: 'Plant',
    emoji: '🌿',
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
    accentBorder: 'border-l-emerald-500',
    ring: 'ring-emerald-200',
  },
  weather: {
    icon: <FaCloudSun size={16} />,
    label: 'Weather',
    emoji: '🌤️',
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    gradient: 'from-amber-500 to-amber-600',
    accentBorder: 'border-l-amber-500',
    ring: 'ring-amber-200',
  },
  medical: {
    icon: <FaHeartbeat size={16} />,
    label: 'Medical',
    emoji: '❤️‍🩹',
    iconColor: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    gradient: 'from-rose-500 to-rose-600',
    accentBorder: 'border-l-rose-500',
    ring: 'ring-rose-200',
  },
};

const getTypeConfig = (type) =>
  NOTIFICATION_TYPES[type] || {
    icon: <FaInfoCircle size={16} />,
    label: type || 'General',
    emoji: '📢',
    iconColor: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-500',
    gradient: 'from-gray-500 to-gray-600',
    accentBorder: 'border-l-gray-400',
    ring: 'ring-gray-200',
  };

/* ═══════ Severity Config ═══════ */
const SEVERITY_CONFIG = {
  critical: { dot: 'bg-red-600', badge: 'bg-red-100 text-red-700 border-red-200', label: 'Critical', pulse: true },
  high: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200', label: 'High', pulse: true },
  medium: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium', pulse: false },
  low: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Low', pulse: false },
};

/* ═══════════════════════════════════════════
   Background Components
   ═══════════════════════════════════════════ */

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

const FloatingParticle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="pointer-events-none absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
    }}
    initial={{ x, y, opacity: 0, scale: 0 }}
    animate={{
      y: [y, y - 120, y],
      x: [x, x + 30, x - 20, x],
      opacity: [0, 0.3, 0.1, 0],
      scale: [0, 1, 0.3, 0],
    }}
    transition={{ delay, duration, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

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
      {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

/* ═══════ Toast ═══════ */
function Toast({ message, type = 'info', onClose }) {
  const savedOnClose = useRef(onClose);
  useEffect(() => {
    savedOnClose.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const id = setTimeout(() => savedOnClose.current(), 4000);
    return () => clearTimeout(id);
  }, []);

  const styles = {
    success: 'bg-gradient-to-r from-emerald-600 to-green-600',
    error: 'bg-gradient-to-r from-red-600 to-rose-600',
    info: 'bg-gradient-to-r from-blue-600 to-sky-600',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
  };
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
    warning: <FaBell />,
  };

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ x: 140, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 140, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`fixed top-6 right-6 z-[100] ${styles[type]} text-white px-5 py-3.5 rounded-2xl
        shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md backdrop-blur-sm
        border border-white/10`}
    >
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="hover:bg-white/20 rounded-full p-1.5 transition"
      >
        <FaTimes size={11} />
      </button>
    </motion.div>
  );
}

/* ═══════ Confirm Modal ═══════ */
function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full relative z-10 border border-gray-100"
      >
        <div className={`w-14 h-14 rounded-2xl ${danger ? 'bg-red-100' : 'bg-green-100'}
                        flex items-center justify-center mx-auto mb-4`}>
          {danger
            ? <FaExclamationTriangle className="text-red-500 text-xl" />
            : <FaCheckCircle className="text-green-500 text-xl" />}
        </div>
        <h3 id="confirm-title" className="text-lg font-bold text-gray-800 mb-2 text-center">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 text-center leading-relaxed">{message}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl
              hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all
              shadow-md active:scale-[0.97] ${
              danger
                ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200 hover:shadow-lg'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200 hover:shadow-lg'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════ Skeletons ═══════ */
function Skeleton({ className = '' }) {
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-14 w-72" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-32" />)}
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

/* ═══════ Stat Card ═══════ */
function StatCard({ icon, iconGradient, title, value, subtitle, delay = 0, onClick, active = false }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border shadow-sm p-4
        hover:shadow-xl transition-all duration-300 group text-left w-full overflow-hidden relative ${
        active ? 'border-green-300 ring-2 ring-green-100 shadow-green-100/50' : 'border-gray-100'
      }`}
    >
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-green-100/20 to-transparent
                      rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient}
          flex items-center justify-center mb-3 text-white shadow-md
          group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-gray-800 mt-0.5 tracking-tight">{value}</p>
        {subtitle && <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.button>
  );
}

/* ═══════ Notification Item ═══════ */
const NotificationItem = forwardRef(function NotificationItem(
  { notification, onMarkRead, onDelete, index, isProcessing },
  ref
) {
  const [showActions, setShowActions] = useState(false);
  const cfg = getTypeConfig(notification.type);
  const isUnread = !notification.read;
  const severity = SEVERITY_CONFIG[notification.severity] || SEVERITY_CONFIG.low;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 250, damping: 25 }}
      layout
      role="article"
      aria-label={`${isUnread ? 'Unread' : 'Read'} ${cfg.label} notification: ${notification.title}`}
      className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden
        transition-all duration-300 hover:shadow-lg
        ${isUnread ? `border-l-4 ${cfg.accentBorder} border-gray-100` : 'border-gray-100'}
        ${isUnread ? 'hover:shadow-xl' : 'opacity-75 hover:opacity-100'}
        ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onFocus={() => setShowActions(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setShowActions(false);
      }}
    >
      {/* Unread gradient accent */}
      {isUnread && (
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${cfg.gradient} rounded-r`} />
      )}

      {/* Decorative glow */}
      {isUnread && (
        <div className={`absolute -top-8 -right-8 w-32 h-32 ${cfg.bg} rounded-full blur-3xl
                        opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
      )}

      <div className="p-5 relative z-10">
        <div className="flex items-start gap-4">
          {/* Type icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex-shrink-0 w-13 h-13 rounded-xl ${cfg.bg} border ${cfg.border}
              flex items-center justify-center shadow-sm
              group-hover:shadow-md transition-all duration-300`}
            style={{ width: 52, height: 52 }}
          >
            <span className={cfg.iconColor}>{cfg.icon}</span>
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h3 className={`font-bold text-sm leading-tight ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title || 'Notification'}
                  </h3>
                  {isUnread && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, delay: index * 0.03 + 0.1 }}
                      className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-emerald-100
                        text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full
                        border border-green-200 shadow-sm shadow-green-100/50"
                    >
                      <HiSparkles size={10} /> New
                    </motion.span>
                  )}
                </div>

                {/* Message */}
                <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-600' : 'text-gray-500'}`}>
                  {notification.message}
                </p>

                {/* Meta badges */}
                <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1
                    rounded-full border ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.emoji} {cfg.label}
                  </span>

                  {notification.severity && (
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1
                      rounded-full border ${severity.badge}`}>
                      <span className="relative flex h-1.5 w-1.5">
                        {severity.pulse && (
                          <span className={`animate-ping absolute inline-flex h-full w-full
                                          rounded-full ${severity.dot} opacity-75`} />
                        )}
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${severity.dot}`} />
                      </span>
                      {severity.label}
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                    <FaClock size={8} />
                    <time dateTime={notification.createdAt}>
                      {formatRelativeTime(notification.createdAt)}
                    </time>
                  </span>

                  {notification.read && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MdDone size={12} /> Read
                    </span>
                  )}
                </div>
              </div>

              {/* Hover actions */}
              <div className={`flex items-center gap-1.5 flex-shrink-0 transition-all duration-300
                ${showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3 pointer-events-none'}`}>
                {isUnread && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onMarkRead(notification.id)}
                    disabled={isProcessing}
                    aria-label="Mark as read"
                    className="p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-200
                      hover:bg-green-100 hover:shadow-md transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck size={11} />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(notification.id)}
                  disabled={isProcessing}
                  aria-label="Delete notification"
                  className="p-2.5 rounded-xl bg-gray-50 text-gray-400 border border-gray-200
                    hover:bg-red-50 hover:text-red-500 hover:border-red-200 hover:shadow-md
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTrash size={11} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-3 border-green-200 border-t-green-500 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [processingIds, setProcessingIds] = useState(new Set());
  const [confirmModal, setConfirmModal] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const abortControllerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const listRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `p-${i}`,
        x: Math.random() * 1200,
        y: Math.random() * 600 + 50,
        size: Math.random() * 14 + 6,
        delay: Math.random() * 6,
        duration: Math.random() * 8 + 8,
      })),
    []
  );

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ═══════════════════════════════════════════
     ✅ FIXED: All notification API calls now use
     NOTIFICATION_API (/api/notifications) instead
     of /api/farms/{farmId}/notifications
     ═══════════════════════════════════════════ */

  /* ── Fetch ALL notifications ── */
  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (!silent) setLoading(true);
        setError(null);

        // ✅ FIXED: /api/notifications (global)
        const response = await axios.get(NOTIFICATION_API, {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setNotifications(response.data || []);
          setLastRefresh(new Date());
        }
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'AbortError') return;
        console.error('Fetch notifications error:', err);
        if (!silent) {
          setError('Failed to load notifications. Please try again.');
          showToast('Failed to load notifications', 'error');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [showToast]
  );

  /* ── Initial fetch + 30s polling ── */
  useEffect(() => {
    fetchNotifications();
    pollIntervalRef.current = setInterval(() => fetchNotifications(true), 30_000);
    return () => {
      abortControllerRef.current?.abort();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchNotifications]);

  /* ── Actions ── */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    showToast('Notifications refreshed', 'success');
  };

  const generateDynamicNotifications = async () => {
    try {
      setRefreshing(true);
      // ✅ FIXED: /api/notifications/generate-samples + correct axios.post(url, body, config)
      await axios.post(
        `${NOTIFICATION_API}/generate-samples`,
        {},
        { headers: getAuthHeaders() }
      );
      showToast('New notifications generated!', 'success');
      await fetchNotifications();
    } catch (err) {
      console.error('Generate failed:', err);
      showToast('Failed to generate notifications', 'error');
      setRefreshing(false);
    }
  };

  const markAsRead = async (id) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      // ✅ FIXED: /api/notifications/{id}/read
      await axios.put(`${NOTIFICATION_API}/${id}/read`, {}, { headers: getAuthHeaders() });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      showToast('Marked as read', 'success');
    } catch (err) {
      console.error('Mark-read failed:', err);
      showToast('Failed to mark as read', 'error');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const markAllAsRead = () => {
    setConfirmModal({
      title: 'Mark All as Read',
      message: `Mark all ${stats.unread} unread notifications as read?`,
      confirmText: 'Mark All Read',
      danger: false,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          // ✅ FIXED: /api/notifications/read-all
          await axios.put(`${NOTIFICATION_API}/read-all`, {}, { headers: getAuthHeaders() });
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          showToast('All notifications marked as read', 'success');
        } catch (err) {
          console.error('Mark-all-read failed:', err);
          showToast('Failed to mark all as read', 'error');
        }
      },
    });
  };

  const deleteNotification = async (id) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      // ✅ FIXED: /api/notifications/{id}
      await axios.delete(`${NOTIFICATION_API}/${id}`, { headers: getAuthHeaders() });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('Notification deleted', 'info');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete notification', 'error');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setShowUnreadOnly(false);
    setSortOrder('newest');
  };

  const hasActiveFilters = searchQuery || filterType !== 'all' || showUnreadOnly;

  /* ── Computed values ── */
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const read = total - unread;
    const typeCounts = {};
    notifications.forEach((n) => {
      const t = n.type || 'other';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const highPriority = notifications.filter(
      (n) => n.severity === 'high' || n.severity === 'critical'
    ).length;
    return { total, unread, read, typeCounts, highPriority };
  }, [notifications]);

  const displayNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.type === filterType);
    }
    if (showUnreadOnly) {
      filtered = filtered.filter((n) => !n.read);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.message || '').toLowerCase().includes(q) ||
          (n.type || '').toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortOrder === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortOrder === 'unread') {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

    return filtered;
  }, [notifications, filterType, showUnreadOnly, debouncedSearch, sortOrder]);

  /* ── Animation variants ── */
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  /* ═══════ Render ═══════ */

  if (loading && notifications.length === 0) return <LoadingState />;

  if (error && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-neutral-50
        flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center space-y-5 border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-xl font-black text-gray-800">Failed to Load</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchNotifications()}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl
              font-bold hover:shadow-xl hover:shadow-green-200/50 transition-all duration-300"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50 overflow-hidden">
      <GridBackground />
      <div className="pointer-events-none absolute -top-40 -right-40 w-[50rem] h-[50rem] rounded-full bg-green-300/8 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[50rem] h-[50rem] rounded-full bg-emerald-300/8 blur-[140px]" />
      {particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.key}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            open
            title={confirmModal.title}
            message={confirmModal.message}
            confirmText={confirmModal.confirmText}
            danger={confirmModal.danger}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600
                       rounded-2xl shadow-xl shadow-green-200/50 text-white flex items-center justify-center
                       hover:shadow-2xl hover:scale-110 transition-all"
          >
            <FaArrowUp />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6"
      >
        {/* ═══════ TOP BAR ═══════ */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-3
                     bg-white/80 backdrop-blur-xl rounded-2xl border border-green-100/80
                     shadow-sm shadow-green-100/30 px-5 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200
                            text-emerald-700 px-3 py-1.5 rounded-xl text-[11px] font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </div>
            <LiveClock />
            {lastRefresh && (
              <span className="hidden md:flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                <FaHistory className="text-green-500 text-[8px]" />
                {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Auto-refresh: 30s</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{stats.total} total</span>
          </div>
        </motion.div>

        {/* ═══════ HEADER ═══════ */}
        <motion.header variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl
              flex items-center justify-center shadow-xl shadow-green-200/50 relative">
              <MdNotificationsActive className="text-white text-2xl" />
              {stats.unread > 0 && (
                <motion.span
                  key={stats.unread}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px]
                    font-bold rounded-full flex items-center justify-center shadow-lg
                    ring-3 ring-white"
                >
                  {stats.unread > 99 ? '99+' : stats.unread}
                </motion.span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500
                                 bg-clip-text text-transparent">
                  Notifications
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Stay updated with your farm activities</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {stats.highPriority > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600
                  px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-red-100/50"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                {stats.highPriority} urgent
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg px-4 py-2.5
                rounded-xl text-sm font-semibold text-gray-700 hover:text-green-600 transition-all
                border border-gray-100 hover:border-green-200 disabled:opacity-50"
            >
              <FaSync className={`text-xs ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateDynamicNotifications}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg px-4 py-2.5
                rounded-xl text-sm font-semibold text-gray-700 hover:text-green-600 transition-all
                border border-gray-100 hover:border-green-200 disabled:opacity-50"
            >
              <MdAutorenew className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
              Generate
            </motion.button>

            {stats.unread > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600
                  text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-200/50
                  hover:shadow-xl transition-all"
              >
                <MdDoneAll size={16} />
                Mark All Read
              </motion.button>
            )}
          </div>
        </motion.header>

        {/* ═══════ STATS ═══════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<MdNotificationsActive size={16} />}
            iconGradient="from-green-500 to-emerald-500"
            title="Total"
            value={stats.total}
            subtitle="All notifications"
            delay={0}
          />
          <StatCard
            icon={<MdNewReleases size={16} />}
            iconGradient="from-blue-500 to-sky-500"
            title="Unread"
            value={stats.unread}
            subtitle={stats.unread > 0 ? 'Need attention' : 'All caught up ✅'}
            delay={0.05}
            onClick={() => { setShowUnreadOnly(true); setFilterType('all'); }}
            active={showUnreadOnly}
          />
          <StatCard
            icon={<MdMarkEmailRead size={16} />}
            iconGradient="from-emerald-500 to-teal-500"
            title="Read"
            value={stats.read}
            subtitle="Already reviewed"
            delay={0.1}
          />
          <StatCard
            icon={<FaExclamationTriangle size={13} />}
            iconGradient="from-red-500 to-rose-500"
            title="Urgent"
            value={stats.highPriority}
            subtitle={stats.highPriority > 0 ? 'Action required' : 'No urgency'}
            delay={0.15}
          />
        </motion.div>

        {/* ═══════ FILTERS BAR ═══════ */}
        <motion.div
          variants={fadeUp}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                aria-label="Search notifications"
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300
                  focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                    hover:text-gray-600 transition p-0.5"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 flex-wrap flex-1" role="group" aria-label="Filter by type">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest
                flex items-center gap-1 mr-1">
                <MdFilterList size={13} /> Type:
              </span>
              <button
                onClick={() => setFilterType('all')}
                aria-pressed={filterType === 'all'}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  filterType === 'all'
                    ? 'bg-green-600 text-white shadow-md shadow-green-200/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              {Object.entries(NOTIFICATION_TYPES).map(([type, cfg]) => {
                const count = stats.typeCounts[type] || 0;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    aria-pressed={filterType === type}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200
                      flex items-center gap-1.5 ${
                      filterType === type
                        ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cfg.emoji} {cfg.label}
                    {count > 0 && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        filterType === type ? 'bg-white/20' : 'bg-gray-200'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnreadOnly((prev) => !prev)}
                aria-pressed={showUnreadOnly}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg
                  transition-all duration-200 ${
                  showUnreadOnly
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showUnreadOnly ? <FaBell size={10} /> : <FaBellSlash size={10} />}
                {showUnreadOnly ? 'Unread' : 'All'}
              </button>

              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort order"
                  className="bg-gray-100 text-gray-600 text-[11px] font-bold pl-3 pr-8 py-1.5 rounded-lg
                    border-none focus:outline-none focus:ring-2 focus:ring-green-200 appearance-none
                    cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="unread">Unread first</option>
                </select>
                <FaChevronDown
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={8}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ RESULTS INFO ═══════ */}
        <motion.div variants={fadeUp} className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-700">{displayNotifications.length}</span>{' '}
            of {notifications.length}
            {filterType !== 'all' && (
              <span>
                {' '}— <span className="font-bold text-green-600">
                  {NOTIFICATION_TYPES[filterType]?.label || filterType}
                </span>
              </span>
            )}
            {showUnreadOnly && <span className="text-amber-600 font-bold"> (unread only)</span>}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1
                         hover:text-green-700 transition"
            >
              <FaTimes size={8} /> Clear filters
            </button>
          )}
        </motion.div>

        {/* ═══════ NOTIFICATIONS LIST ═══════ */}
        <div ref={listRef} className="space-y-3" role="feed" aria-label="Notifications list">
          <AnimatePresence mode="popLayout">
            {displayNotifications.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100
                           shadow-sm p-16 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-green-50 rounded-3xl
                                flex items-center justify-center mx-auto mb-6 shadow-inner
                                border border-gray-200/50">
                  <MdNotificationsNone className="text-gray-300 text-4xl" />
                </div>
                <h3 className="text-xl font-black text-gray-700 mb-2">
                  {showUnreadOnly
                    ? 'All Caught Up! 🎉'
                    : debouncedSearch
                    ? 'No Results Found'
                    : filterType !== 'all'
                    ? `No ${NOTIFICATION_TYPES[filterType]?.label || filterType} Notifications`
                    : 'No Notifications Yet'}
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mb-6">
                  {showUnreadOnly
                    ? "You've read all your notifications. Great job staying on top of things!"
                    : debouncedSearch
                    ? `No notifications match "${debouncedSearch}". Try different keywords.`
                    : filterType !== 'all'
                    ? `No ${(NOTIFICATION_TYPES[filterType]?.label || '').toLowerCase()} notifications yet.`
                    : 'Generate dynamic notifications to get started with your farm monitoring!'}
                </p>
                {hasActiveFilters ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearAllFilters}
                    className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold
                      hover:bg-gray-200 transition-all inline-flex items-center gap-2"
                  >
                    <FaTimes size={11} /> Clear Filters
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateDynamicNotifications}
                    disabled={refreshing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3
                      rounded-xl text-sm font-bold shadow-xl shadow-green-200/50 hover:shadow-2xl
                      transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <MdAutorenew className={refreshing ? 'animate-spin' : ''} size={16} />
                    Generate Notifications
                  </motion.button>
                )}
              </motion.div>
            ) : (
              displayNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                  index={index}
                  isProcessing={processingIds.has(notification.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ═══════ BOTTOM SUMMARY ═══════ */}
        {notifications.length > 0 && (
          <motion.div
            variants={fadeUp}
            className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl
                       p-7 text-white shadow-2xl shadow-green-300/30 overflow-hidden relative"
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl
                                flex items-center justify-center">
                  <FaGlobeAmericas className="text-white/90" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Notification Summary</h3>
                  <p className="text-[11px] text-white/60">Click a category to filter</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(NOTIFICATION_TYPES).map(([type, cfg]) => {
                  const count = stats.typeCounts[type] || 0;
                  const isActive = filterType === type;
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterType(isActive ? 'all' : type)}
                      className={`group text-left rounded-xl p-3 transition-all ${
                        isActive
                          ? 'bg-white/20 ring-2 ring-white/30'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{cfg.emoji}</span>
                        <span className="text-sm text-white/80 font-medium">{cfg.label}</span>
                      </div>
                      <p className="text-3xl font-black group-hover:scale-105 transition-transform origin-left">
                        {count}
                      </p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {count === 1 ? 'notification' : 'notifications'}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ FOOTER ═══════ */}
        <motion.div variants={fadeUp} className="text-center pb-4 pt-2">
          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="text-green-500" />
              Notifications v2.0
            </span>
            <span>•</span>
            <span>Auto-refreshes every 30s</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaHeartbeat className="text-red-400 text-[8px]" />
              Built with care
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Custom styles */}
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
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Notifications;