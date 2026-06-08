import API_BASE from '../config';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdMenuOpen,
  MdOutlinePets,
  MdOutlineLocalFlorist,
  MdOutlineWaterDrop,
  MdOutlineNotificationsActive,
  MdOutlineTipsAndUpdates,
  MdDashboard,
  MdOutlineSettings,
  MdKeyboardArrowDown,
  MdSearch
} from 'react-icons/md';
import {
  FaProductHunt,
  FaUserCircle,
  FaDog,
  FaRobot,
  FaDrumstickBite,
  FaChevronRight,
  FaLeaf,
  FaSeedling,
  FaShieldAlt,
  FaPaw,
} from 'react-icons/fa';
import {
  IoLogOut,
  IoSparkles,
  IoHelpCircleOutline,
  IoMoonOutline,
  IoSunnyOutline
} from 'react-icons/io5';
import {
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineSupport,
  HiSparkles
} from 'react-icons/hi';
import {
  FiActivity,
  FiZap,
  FiShield,
  FiClock,
  FiChevronDown,
  FiExternalLink
} from 'react-icons/fi';
import axios from 'axios';

/* ═══════════════════ MENU CONFIGURATION ═══════════════════ */
const menuItems = [
  {
    section: 'Main',
    items: [
      {
        icon: <MdDashboard size={22} />,
        label: 'Dashboard',
        path: '/dashboard',
        description: 'Farm overview & stats',
      },
    ],
  },
  {
    section: 'Farm Management',
    items: [
      {
        icon: <MdOutlinePets size={22} />,
        label: 'My Farm',
        description: 'Animals, plants & more',
        submenu: [
          {
            icon: <FaDog size={16} />,
            label: 'My Animals',
            path: '/my-animals',
            description: 'Manage livestock',
          },
          {
            icon: <MdOutlineLocalFlorist size={16} />,
            label: 'My Plants',
            path: '/my-plants',
            description: 'Manage crops',
          },
          {
            icon: <MdOutlineWaterDrop size={16} />,
            label: 'Watering',
            path: '/watering',
            description: 'Irrigation schedules',
          },
          {
            icon: <FaDrumstickBite size={16} />,
            label: 'Feeding',
            path: '/feeding',
            description: 'Feed management',
          },
        ],
      },
      {
        icon: <FaProductHunt size={22} />,
        label: 'Products',
        path: '/products',
        description: 'Farm products',
      },
    ],
  },
{
    section: 'Intelligence',
    items: [
      {
        icon: <FaRobot size={22} />,
        label: 'AI Detection',
        path: '/ai-farms',
        description: 'Smart diagnostics',
        isNew: true,
        gradient: 'from-purple-500 to-indigo-500',
        submenu: [
          {
            icon: <FaPaw size={16} />,
            label: 'Animal Detection',
            path: '/ai-animal-detection',
            description: 'Detect animal diseases',
          },
          {
            icon: <FaLeaf size={16} />,
            label: 'Plant Detection',
            path: '/ai-plant-detection',
            description: 'Detect plant diseases',
          },
          {
            icon: <FiClock size={16} />,
            label: 'Detection History',
            path: '/detection-history',
            description: 'Past AI scans',
          },
        ],
      },
      {
        icon: <MdOutlineTipsAndUpdates size={22} />,
        label: 'Care Tips',
        path: '/care-tips',
        description: 'Expert advice',
      },
    ],
  },
  {
    section: 'System',
    items: [
      {
        icon: <MdOutlineNotificationsActive size={22} />,
        label: 'Notifications',
        path: '/notifications',
        description: 'Alerts & updates',
        hasDynamicBadge: true,
      },
    ],
  },
];

/* ═══════════════════ HELPERS ═══════════════════ */
const API_BASE = API_BASE;

const formatRelativeTime = (ts) => {
  if (!ts) return '';
  const diffMs = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ═══════════════════ SIDEBAR COMPONENT ═══════════════════ */
export default function Sidebar({ setIsLoggedIn, username, email, isAdmin }) {
  const [open, setOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [farmStats, setFarmStats] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);

  // ── Auto collapse on small screens ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Update clock ──
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Fetch notification count ──
  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE}/api/notifications`, { headers });
      const notifications = Array.isArray(res.data) ? res.data : [];
      const unread = notifications.filter((n) => !n.read).length;
      setNotificationCount(unread);
    } catch {
      // silent
    }
  }, []);

  // ── Fetch farm stats for sidebar widget ──
  const fetchFarmStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      let farmId = localStorage.getItem('farmId');
      if (!farmId) {
        const userRes = await axios.get(`${API_BASE}/auth/user`, { headers });
        const userId = userRes.data.id || userRes.data.userId || userRes.data._id;
        const farmRes = await axios.get(`${API_BASE}/api/farms/user/${userId}`, { headers });
        farmId = farmRes.data?.id || farmRes.data?._id || farmRes.data?.farmId;
        if (farmId) localStorage.setItem('farmId', farmId);
      }

      if (!farmId) return;

      const [animalsRes, plantsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/farms/${farmId}/animals`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/farms/${farmId}/plants`, { headers }).catch(() => ({ data: [] })),
      ]);

      const animals = Array.isArray(animalsRes.data) ? animalsRes.data : [];
      const plants = Array.isArray(plantsRes.data) ? plantsRes.data : [];

      setFarmStats({
        animals: animals.length,
        plants: plants.length,
        healthy:
          animals.filter((a) => (a.healthStatus || '').toLowerCase() === 'healthy').length +
          plants.filter((p) => (p.healthStatus || '').toLowerCase() === 'healthy').length,
        total: animals.length + plants.length,
      });
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchNotificationCount();
    fetchFarmStats();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationCount, fetchFarmStats]);

  // ── Close user menu on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Auto-open submenu if child route is active ──
  useEffect(() => {
    menuItems.forEach((section) => {
      section.items.forEach((item) => {
        if (item.submenu) {
          const isChildActive = item.submenu.some((sub) => location.pathname === sub.path);
          if (isChildActive) {
            setOpenSubmenus((prev) => ({ ...prev, [item.label]: true }));
          }
        }
      });
    });
  }, [location.pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmId');
    setIsLoggedIn(false);
    toast.success('Signed out successfully!');
    navigate('/');
  };

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActiveLink = (path) => location.pathname === path;

  const isSubmenuActive = (submenu) =>
    submenu?.some((sub) => location.pathname === sub.path);

  // ── Search filter ──
  const filteredSections = searchQuery
    ? menuItems
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            const matchesLabel = item.label.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSub = item.submenu?.some((sub) =>
              sub.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchesLabel || matchesSub;
          }),
        }))
        .filter((section) => section.items.length > 0)
    : menuItems;

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="flex">
      {/* ── Sidebar ── */}
      <motion.nav
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200/80 flex flex-col z-40
                    transition-all duration-300 ease-in-out ${open ? 'w-[272px]' : 'w-[72px]'}`}
        style={{
          boxShadow: '4px 0 24px -8px rgba(0,0,0,0.06)',
        }}
      >
        {/* ══════ Header ══════ */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl
                                flex items-center justify-center shadow-lg shadow-green-200/50">
                  <FaLeaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg tracking-tight">MyFarm</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setOpen(!open)}
            className={`p-2 rounded-xl hover:bg-green-50 text-green-600 transition-all duration-200
                        active:scale-90 ${!open && 'mx-auto'}`}
          >
            <MdMenuOpen
              size={22}
              className={`transition-transform duration-300 ${!open && 'rotate-180'}`}
            />
          </button>
        </div>

        {/* ══════ Search ══════ */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="px-4 pt-3 pb-1 shrink-0"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300
                             focus:bg-white transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                               p-0.5 rounded"
                  >
                    ×
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════ Farm Stats Widget (expanded only) ══════ */}
        <AnimatePresence>
          {open && farmStats && !searchQuery && (
            <motion.div
              className="px-4 pt-2 pb-1 shrink-0"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                    Farm Overview
                  </span>
                  <FiActivity size={12} className="text-green-500" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Animals', value: farmStats.animals, icon: '🐾' },
                    { label: 'Plants', value: farmStats.plants, icon: '🌿' },
                    {
                      label: 'Healthy',
                      value: farmStats.total > 0
                        ? `${Math.round((farmStats.healthy / farmStats.total) * 100)}%`
                        : '—',
                      icon: '💚',
                    },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs mb-0.5">{stat.icon}</div>
                      <div className="text-sm font-bold text-gray-800">{stat.value}</div>
                      <div className="text-[9px] text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════ Menu Items ══════ */}
        <div className="flex-1 overflow-y-auto py-2 px-3 custom-sidebar-scroll">
          {filteredSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-2">
              {/* Section label */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    className="px-3 pt-3 pb-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {section.section}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {!open && sectionIndex > 0 && (
                <div className="mx-3 my-2 border-t border-gray-100" />
              )}

              <ul className="space-y-0.5">
                {section.items.map((item, index) => {
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isSubmenuOpen = openSubmenus[item.label];
                  const isActive = isActiveLink(item.path);
                  const isSubActive = isSubmenuActive(item.submenu);
                  const isHighlighted = isActive || isSubActive;
                  const badgeCount = item.hasDynamicBadge ? notificationCount : item.badge;

                  return (
                    <li key={index} className="relative">
                      {hasSubmenu ? (
                        /* ── Menu item WITH submenu ── */
                        <div>
                          <button
                            onClick={() => {
                              if (open) {
                                toggleSubmenu(item.label);
                              } else {
                                setOpen(true);
                                setTimeout(() => toggleSubmenu(item.label), 300);
                              }
                            }}
                            onMouseEnter={() => setHoveredItem(item.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        transition-all duration-200 group relative ${
                                          isHighlighted
                                            ? 'bg-green-50 text-green-700 shadow-sm shadow-green-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                          >
                            {/* Active bar */}
                            {isHighlighted && (
                              <motion.div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6
                                           bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full"
                                layoutId="activeBar"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                              />
                            )}

                            <span
                              className={`flex-shrink-0 transition-colors duration-200 ${
                                isHighlighted ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'
                              }`}
                            >
                              {item.icon}
                            </span>

                            <AnimatePresence>
                              {open && (
                                <motion.div
                                  className="flex items-center flex-1 min-w-0"
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: 'auto' }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex-1 text-left min-w-0">
                                    <span className="font-medium text-sm block truncate">
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span className="text-[10px] text-gray-400 block truncate">
                                        {item.description}
                                      </span>
                                    )}
                                  </div>
                                  <motion.div
                                    animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <FiChevronDown size={14} className="text-gray-400" />
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Tooltip (collapsed) */}
                            {!open && hoveredItem === item.label && (
                              <motion.div
                                className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white
                                           text-sm rounded-xl shadow-xl z-50 whitespace-nowrap"
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                              >
                                <div className="font-medium">{item.label}</div>
                                {item.description && (
                                  <div className="text-[10px] text-gray-400">{item.description}</div>
                                )}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1
                                                w-2 h-2 bg-gray-900 rotate-45" />
                              </motion.div>
                            )}
                          </button>

                          {/* ── Submenu (expanded) ── */}
                          <AnimatePresence>
                            {isSubmenuOpen && open && (
                              <motion.ul
                                className="mt-1 ml-4 pl-3 border-l-2 border-green-200 space-y-0.5 overflow-hidden"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                              >
                                {item.submenu.map((subItem, subIndex) => {
                                  const isSubActive2 = isActiveLink(subItem.path);
                                  return (
                                    <motion.li
                                      key={subIndex}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: subIndex * 0.05 }}
                                    >
                                      <Link
                                        to={subItem.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg
                                                    transition-all duration-200 group ${
                                                      isSubActive2
                                                        ? 'bg-green-100 text-green-700 shadow-sm'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                                    }`}
                                      >
                                        <span
                                          className={`transition-colors ${
                                            isSubActive2
                                              ? 'text-green-600'
                                              : 'text-gray-400 group-hover:text-green-500'
                                          }`}
                                        >
                                          {subItem.icon}
                                        </span>
                                        <div className="min-w-0">
                                          <span className="text-sm font-medium block truncate">
                                            {subItem.label}
                                          </span>
                                          {subItem.description && (
                                            <span className="text-[9px] text-gray-400 block truncate">
                                              {subItem.description}
                                            </span>
                                          )}
                                        </div>
                                        {isSubActive2 && (
                                          <motion.div
                                            className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                          />
                                        )}
                                      </Link>
                                    </motion.li>
                                  );
                                })}
                              </motion.ul>
                            )}
                          </AnimatePresence>

                          {/* ── Submenu flyout (collapsed) ── */}
                          {!open && hoveredItem === item.label && (
                            <motion.div
                              className="absolute left-full ml-3 top-0 bg-white rounded-xl shadow-2xl
                                         border border-gray-200 py-2 min-w-[200px] z-50"
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              onMouseEnter={() => setHoveredItem(item.label)}
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <div className="px-3 py-2 border-b border-gray-100">
                                <span className="font-semibold text-gray-800 text-sm">
                                  {item.label}
                                </span>
                                {item.description && (
                                  <span className="text-[10px] text-gray-400 block">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                              {item.submenu.map((subItem, subIndex) => {
                                const isSubActive2 = isActiveLink(subItem.path);
                                return (
                                  <Link
                                    key={subIndex}
                                    to={subItem.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 transition-all ${
                                      isSubActive2
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                                    }`}
                                  >
                                    <span
                                      className={
                                        isSubActive2 ? 'text-green-600' : 'text-gray-400'
                                      }
                                    >
                                      {subItem.icon}
                                    </span>
                                    <div className="min-w-0">
                                      <span className="text-sm font-medium block">
                                        {subItem.label}
                                      </span>
                                      {subItem.description && (
                                        <span className="text-[9px] text-gray-400 block">
                                          {subItem.description}
                                        </span>
                                      )}
                                    </div>
                                    {isSubActive2 && (
                                      <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    )}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        /* ── Regular menu item (no submenu) ── */
                        <Link
                          to={item.path}
                          onMouseEnter={() => setHoveredItem(item.label)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                                      duration-200 group relative ${
                                        isActive
                                          ? 'bg-green-50 text-green-700 shadow-sm shadow-green-100'
                                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                      }`}
                        >
                          {/* Active bar */}
                          {isActive && (
                            <motion.div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6
                                         bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full"
                              layoutId="activeBar"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}

                          <span
                            className={`flex-shrink-0 relative transition-colors duration-200 ${
                              isActive
                                ? 'text-green-600'
                                : 'text-gray-400 group-hover:text-green-500'
                            }`}
                          >
                            {item.icon}

                            {/* Dynamic badge */}
                            {badgeCount > 0 && (
                              <motion.span
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white
                                           text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full
                                           flex items-center justify-center shadow-sm
                                           ring-2 ring-white"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                              >
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </motion.span>
                            )}

                            {/* NEW tag */}
                            {item.isNew && (
                              <motion.span
                                className="absolute -top-1.5 -right-3 bg-gradient-to-r from-purple-500
                                           to-indigo-500 text-white text-[7px] font-bold px-1.5
                                           py-0.5 rounded-full shadow-sm"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                NEW
                              </motion.span>
                            )}
                          </span>

                          <AnimatePresence>
                            {open && (
                              <motion.div
                                className="flex items-center flex-1 min-w-0"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm block truncate">
                                    {item.label}
                                  </span>
                                  {item.description && (
                                    <span className="text-[10px] text-gray-400 block truncate">
                                      {item.description}
                                    </span>
                                  )}
                                </div>

                                {/* Badge (expanded) */}
                                {badgeCount > 0 && (
                                  <motion.span
                                    className="ml-auto bg-red-500 text-white text-[10px] font-bold
                                               min-w-[20px] h-5 px-1.5 rounded-full flex items-center
                                               justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                  >
                                    {badgeCount > 99 ? '99+' : badgeCount}
                                  </motion.span>
                                )}

                                {/* NEW tag (expanded) */}
                                {item.isNew && (
                                  <span
                                    className="ml-auto bg-gradient-to-r from-purple-500 to-indigo-500
                                               text-white text-[9px] font-bold px-2 py-0.5 rounded-full"
                                  >
                                    NEW
                                  </span>
                                )}

                                {/* Active dot */}
                                {isActive && !badgeCount && !item.isNew && (
                                  <motion.div
                                    className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                  />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Tooltip (collapsed) */}
                          {!open && hoveredItem === item.label && (
                            <motion.div
                              className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white
                                         text-sm rounded-xl shadow-xl z-50 whitespace-nowrap"
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <div className="font-medium flex items-center gap-2">
                                {item.label}
                                {badgeCount > 0 && (
                                  <span className="bg-red-500 text-[9px] px-1.5 py-0.5 rounded-full">
                                    {badgeCount}
                                  </span>
                                )}
                                {item.isNew && (
                                  <span className="bg-purple-500 text-[8px] px-1.5 py-0.5 rounded-full">
                                    NEW
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-[10px] text-gray-400">{item.description}</div>
                              )}
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1
                                              w-2 h-2 bg-gray-900 rotate-45" />
                            </motion.div>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ══════ Help & Settings (collapsed = icon only) ══════ */}
        <div className="px-3 py-2 border-t border-gray-100 shrink-0 space-y-0.5">
          <Link
            to="/settings"
            onMouseEnter={() => setHoveredItem('settings')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500
                        hover:bg-gray-50 hover:text-gray-700 transition-all group relative ${
                          !open && 'justify-center'
                        }`}
          >
            <HiOutlineCog size={20} className="text-gray-400 group-hover:text-green-500 transition-colors" />
            {open && <span className="text-sm font-medium">Settings</span>}
            {!open && hoveredItem === 'settings' && (
              <motion.div
                className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm
                           rounded-xl shadow-xl z-50 whitespace-nowrap"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Settings
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2
                                bg-gray-900 rotate-45" />
              </motion.div>
            )}
          </Link>

          <Link
            to="/help"
            onMouseEnter={() => setHoveredItem('help')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500
                        hover:bg-gray-50 hover:text-gray-700 transition-all group relative ${
                          !open && 'justify-center'
                        }`}
          >
            <HiOutlineSupport size={20} className="text-gray-400 group-hover:text-green-500 transition-colors" />
            {open && <span className="text-sm font-medium">Help & Support</span>}
            {!open && hoveredItem === 'help' && (
              <motion.div
                className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm
                           rounded-xl shadow-xl z-50 whitespace-nowrap"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Help & Support
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2
                                bg-gray-900 rotate-45" />
              </motion.div>
            )}
          </Link>
        </div>

        {/* ══════ Sign Out ══════ */}
        <div className="px-3 py-2 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSignOut}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500
                        hover:bg-red-50 hover:text-red-600 transition-all duration-200 group
                        relative ${!open && 'justify-center'}`}
          >
            <IoLogOut
              size={22}
              className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0"
            />
            <AnimatePresence>
              {open && (
                <motion.span
                  className="font-medium text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>

            {!open && hoveredItem === 'logout' && (
              <motion.div
                className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm
                           rounded-xl shadow-xl z-50 whitespace-nowrap"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Sign Out
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2
                                bg-gray-900 rotate-45" />
              </motion.div>
            )}
          </button>
        </div>

        {/* ══════ User Profile ══════ */}
        <div className="px-3 py-3 border-t border-gray-100 shrink-0" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => open && setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r
                          from-gray-50 to-gray-100/50 hover:from-green-50 hover:to-emerald-50
                          border border-gray-200/60 hover:border-green-200 transition-all
                          duration-200 group ${!open && 'justify-center'}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl
                                flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">
                    {(username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full
                                 border-2 border-white shadow-sm" />
              </div>

              <AnimatePresence>
                {open && (
                  <motion.div
                    className="flex-1 overflow-hidden text-left"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    <p className="font-semibold text-gray-800 truncate text-sm leading-tight">
                      {username || 'User'}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate leading-tight">
                      {email || 'email@example.com'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {open && (
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown size={14} className="text-gray-400" />
                </motion.div>
              )}
            </button>

            {/* User dropdown menu */}
            <AnimatePresence>
              {showUserMenu && open && (
                <motion.div
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl
                             border border-gray-200 overflow-hidden z-50"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500
                                      rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold">
                          {(username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{username || 'User'}</p>
                        <p className="text-[11px] text-gray-500">{email || 'email@example.com'}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[9px]
                                          bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full
                                          font-bold">
                            <FaShieldAlt size={8} /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-600
                                 hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUserCircle size={16} className="text-gray-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-600
                                 hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <HiOutlineCog size={16} className="text-gray-400" />
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        setDarkMode(!darkMode);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600
                                 hover:bg-gray-50 transition-colors text-sm"
                    >
                      {darkMode ? (
                        <IoSunnyOutline size={16} className="text-gray-400" />
                      ) : (
                        <IoMoonOutline size={16} className="text-gray-400" />
                      )}
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600
                                 hover:bg-red-50 transition-colors text-sm"
                    >
                      <IoLogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* ── Main Content Spacer ── */}
      <div
        className={`flex-1 min-h-screen bg-gray-50 transition-all duration-300 ${
          open ? 'ml-[272px]' : 'ml-[72px]'
        }`}
      >
        {/* Page content rendered here */}
      </div>

      {/* ── Custom Scrollbar ── */}
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 99px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
