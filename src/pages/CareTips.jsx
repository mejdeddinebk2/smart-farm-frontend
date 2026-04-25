import { useEffect, useState, useMemo, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaPaw, FaHeart, FaRegHeart, FaFilter, FaTimes,
  FaChevronRight, FaLeaf, FaDumbbell, FaCut, FaBrain,
  FaHeartbeat, FaStar, FaBookOpen, FaLightbulb,
  FaCheckCircle, FaSeedling, FaArrowRight, FaEye
} from 'react-icons/fa';
import {
  MdPets, MdCategory, MdTipsAndUpdates, MdAutoAwesome
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import { useBookmarks } from '../hooks/useBookmarks';
import DEFAULT_CARE_TIPS from '../data/careTips';

/* ═══════ Category Config ═══════ */
const CATEGORY_CONFIG = {
  all: {
    icon: <MdCategory size={14} />,
    emoji: '📋',
    label: 'All',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hoverBg: 'hover:bg-green-50',
  },
  nutrition: {
    icon: <FaSeedling size={14} />,
    emoji: '🥗',
    label: 'Nutrition',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    hoverBg: 'hover:bg-amber-50',
  },
  grooming: {
    icon: <FaCut size={14} />,
    emoji: '✂️',
    label: 'Grooming',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-700',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    hoverBg: 'hover:bg-pink-50',
  },
  exercise: {
    icon: <FaDumbbell size={14} />,
    emoji: '💪',
    label: 'Exercise',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
  },
  training: {
    icon: <FaBrain size={14} />,
    emoji: '🧠',
    label: 'Training',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    hoverBg: 'hover:bg-purple-50',
  },
  health: {
    icon: <FaHeartbeat size={14} />,
    emoji: '❤️‍🩹',
    label: 'Health',
    gradient: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    hoverBg: 'hover:bg-rose-50',
  },
  behavior: {
    icon: <MdPets size={14} />,
    emoji: '🐾',
    label: 'Behavior',
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    hoverBg: 'hover:bg-teal-50',
  },
};

const getCatConfig = (cat) => CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.all;

/* ═══════ Skeleton ═══════ */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="animate-pulse">
        <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-3 bg-gray-200 rounded-lg w-1/3" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-full mt-2" />
        </div>
      </div>
    </div>
  );
}

/* ═══════ Stat Card ═══════ */
function StatCard({ icon, iconBg, title, value, subtitle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-lg
        hover:-translate-y-1 transition-all duration-300 group cursor-default"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center
          group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        {subtitle && (
          <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">
            {subtitle}
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </motion.div>
  );
}

/* ═══════ Care Tip Card - FIXED WITH forwardRef ═══════ */
const CareTipCard = forwardRef(({ careTip, isBookmarked, onToggleBookmark, delay = 0 }, ref) => {
  const cat = getCatConfig(careTip.category);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 25 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bookmark Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleBookmark(careTip.id);
        }}
        className={`absolute top-5 right-5 z-10 w-10 h-10 rounded-xl flex items-center justify-center 
          transition-all duration-300 border shadow-sm
          ${isBookmarked
            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
            : 'bg-white/90 backdrop-blur-sm border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 hover:bg-red-50'
          }
          ${isHovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'}
        `}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isBookmarked ? (
          <FaHeart size={14} />
        ) : (
          <FaRegHeart size={14} />
        )}
      </button>

      <Link to={`/care-tips/${careTip.id}`} className="block h-full">
        <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
          hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col
          hover:border-gray-200">

          {/* Top Accent Bar */}
          <div className={`h-1.5 bg-gradient-to-r ${cat.gradient} transition-all duration-300
            ${isHovered ? 'h-2' : 'h-1.5'}`} />

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${cat.iconBg} flex items-center justify-center
                flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm
                border ${cat.border}`}>
                <span className={`${cat.iconColor} transition-transform duration-300
                  ${isHovered ? 'scale-110' : ''}`}>
                  {cat.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-800 leading-snug
                  group-hover:text-green-700 transition-colors duration-200 line-clamp-2 mb-2">
                  {careTip.title || 'Unnamed Care Tip'}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold
                    px-2.5 py-1 rounded-full border ${cat.badge} ${cat.border}`}>
                    <span className="text-xs">{cat.emoji}</span>
                    {cat.label}
                  </span>
                  {careTip.difficulty && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium
                      text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                      <FaStar size={8} className="text-amber-400" />
                      {careTip.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
              {careTip.description || 'No description available.'}
            </p>

            {/* Tags */}
            {careTip.tags && careTip.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {careTip.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium text-gray-500 bg-gray-100 
                      px-2.5 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
                {careTip.tags.length > 3 && (
                  <span className="text-[10px] font-medium text-gray-400 px-2 py-1">
                    +{careTip.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Key Points Preview */}
            {careTip.keyPoints && careTip.keyPoints.length > 0 && (
              <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Key Points
                </p>
                <div className="space-y-1.5">
                  {careTip.keyPoints.slice(0, 2).map((point, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <FaCheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-600 line-clamp-1">{point}</span>
                    </div>
                  ))}
                  {careTip.keyPoints.length > 2 && (
                    <p className="text-[10px] text-gray-400 pl-5">
                      +{careTip.keyPoints.length - 2} more points
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t border-gray-100 flex items-center justify-between
            transition-colors duration-300 ${isHovered ? cat.bg : 'bg-gray-50/50'}`}>
            <div className="flex items-center gap-3">
              {careTip.readTime && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-100">
                  <FaBookOpen size={9} /> {careTip.readTime}
                </span>
              )}
              {isBookmarked && (
                <span className="text-[10px] text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  <FaHeart size={8} /> Saved
                </span>
              )}
            </div>
            <span className={`text-xs font-semibold ${cat.text} flex items-center gap-1.5
              group-hover:gap-2.5 transition-all duration-300`}>
              Read more
              <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

CareTipCard.displayName = 'CareTipCard';

/* ═══════ MAIN COMPONENT ═══════ */
export default function CareTips() {
  const [careTipItems, setCareTipItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const categories = ['all', 'nutrition', 'grooming', 'exercise', 'training', 'health', 'behavior'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCareTipItems(DEFAULT_CARE_TIPS);
      setLoading(false);
      setError(null);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = [...careTipItems];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q) || tags.includes(q);
      });
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }

    if (showBookmarkedOnly) {
      filtered = filtered.filter(item => bookmarks.includes(item.id));
    }

    return filtered;
  }, [searchTerm, careTipItems, activeFilter, showBookmarkedOnly, bookmarks]);

  const stats = useMemo(() => {
    const categoryCounts = {};
    careTipItems.forEach(item => {
      const c = item.category || 'other';
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    });
    return {
      total: careTipItems.length,
      bookmarked: bookmarks.length,
      categories: Object.keys(categoryCounts).length,
      categoryCounts,
    };
  }, [careTipItems, bookmarks]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setShowBookmarkedOnly(false);
  };

  const hasActiveFilters = searchTerm || activeFilter !== 'all' || showBookmarkedOnly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl
                flex items-center justify-center shadow-lg shadow-green-200">
                <MdTipsAndUpdates className="text-white text-3xl" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full
                border-2 border-white flex items-center justify-center">
                <HiSparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                Farm Care Tips
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Expert-verified advice for keeping your farm healthy & thriving
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-green-50 text-green-700 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm transition-all ${
                  viewMode === 'list' 
                    ? 'bg-green-50 text-green-700 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Bookmarks Toggle */}
            <button
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                ${showBookmarkedOnly
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-500 shadow-sm'
                }`}
            >
              {showBookmarkedOnly ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
              Saved ({stats.bookmarked})
            </button>
          </div>
        </motion.header>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FaBookOpen className="text-green-600" size={16} />}
            iconBg="bg-green-100"
            title="Total Tips"
            value={stats.total}
            subtitle="Available"
            delay={0}
          />
          <StatCard
            icon={<MdCategory className="text-blue-600" size={18} />}
            iconBg="bg-blue-100"
            title="Categories"
            value={stats.categories}
            subtitle="Topics"
            delay={0.05}
          />
          <StatCard
            icon={<FaHeart className="text-red-500" size={14} />}
            iconBg="bg-red-100"
            title="Saved"
            value={stats.bookmarked}
            subtitle="Bookmarked"
            delay={0.1}
          />
          <StatCard
            icon={<FaEye className="text-emerald-600" size={15} />}
            iconBg="bg-emerald-100"
            title="Showing"
            value={filteredItems.length}
            subtitle={hasActiveFilters ? 'Filtered' : 'All'}
            delay={0.15}
          />
        </div>

        {/* ── Featured Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl 
            p-6 text-white shadow-xl shadow-green-200/50 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute right-20 -bottom-8 w-28 h-28 bg-white rounded-full" />
            <div className="absolute left-1/2 -top-6 w-20 h-20 bg-white rounded-full" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <FaLightbulb className="text-2xl" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h3 className="font-bold text-lg">Science-Backed Care Tips</h3>
                <span className="bg-white/20 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full">
                  EXPERT VERIFIED
                </span>
              </div>
              <p className="text-sm opacity-90 max-w-xl">
                Browse our curated collection of expert-verified tips for animal nutrition, health, 
                training, grooming, and behavioral management.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs opacity-80">Tips</p>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.categories}</p>
                <p className="text-xs opacity-80">Categories</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Search + Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search care tips by title, category, tag, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300
                focus:bg-white transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 
                  hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
              <FaFilter size={10} /> Filter by:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(category => {
                const cfg = getCatConfig(category);
                const count = category === 'all' ? stats.total : (stats.categoryCounts[category] || 0);
                const isActive = activeFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`text-xs font-medium px-3.5 py-2 rounded-xl transition-all duration-200 
                      flex items-center gap-1.5 ${
                      isActive
                        ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-md hover:shadow-lg`
                        : `bg-gray-50 text-gray-600 border border-gray-200 ${cfg.hoverBg} hover:border-gray-300`
                    }`}
                  >
                    {cfg.emoji} {cfg.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/25' : 'bg-gray-200/80'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results count & clear */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-700">{filteredItems.length}</span> of {stats.total} tips
              {activeFilter !== 'all' && (
                <span> in <span className={`font-bold ${getCatConfig(activeFilter).text}`}>
                  {getCatConfig(activeFilter).label}
                </span></span>
              )}
              {showBookmarkedOnly && <span className="text-red-500 font-medium"> (saved only)</span>}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-green-600 font-semibold hover:text-green-700 
                  flex items-center gap-1 hover:underline transition-all"
              >
                <FaTimes size={10} />
                Clear all filters
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-red-200 p-12 text-center max-w-md mx-auto shadow-sm"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimes className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to Load</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </motion.div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              {showBookmarkedOnly ? (
                <FaRegHeart className="text-gray-300 text-2xl" />
              ) : (
                <FaSearch className="text-gray-300 text-2xl" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {showBookmarkedOnly ? 'No saved tips yet' : 'No care tips found'}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mb-5">
              {showBookmarkedOnly
                ? "Browse our care tips collection and save the ones you find useful for quick access later."
                : 'Try adjusting your search or filter criteria to find relevant care tips.'}
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                rounded-xl text-sm font-semibold shadow-md shadow-green-200 hover:shadow-lg transition-all
                inline-flex items-center gap-2"
            >
              <MdAutoAwesome size={16} />
              {showBookmarkedOnly ? 'Browse All Tips' : 'Clear All Filters'}
            </button>
          </motion.div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((careTip, index) => (
                <CareTipCard
                  key={careTip.id}
                  careTip={careTip}
                  isBookmarked={bookmarks.includes(careTip.id)}
                  onToggleBookmark={toggleBookmark}
                  delay={Math.min(index * 0.04, 0.3)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Bottom Summary ── */}
        {!loading && careTipItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white
              shadow-xl shadow-green-200/50 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <HiSparkles className="w-5 h-5" />
                <h3 className="font-bold">Tips by Category</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.filter(c => c !== 'all').map(cat => {
                  const cfg = getCatConfig(cat);
                  const count = stats.categoryCounts[cat] || 0;
                  const isActive = activeFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`text-left rounded-xl p-3 transition-all duration-200 border ${
                        isActive 
                          ? 'bg-white/20 border-white/30 shadow-lg' 
                          : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cfg.emoji}</span>
                        <span className="text-xs font-medium opacity-90">{cfg.label}</span>
                      </div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">
                        {count === 1 ? 'tip' : 'tips'} available
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}