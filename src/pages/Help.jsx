import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaQuestionCircle, FaBook, FaVideo, FaEnvelope, FaPhone,
  FaChevronDown, FaChevronUp, FaSearch, FaTractor,
  FaSeedling, FaBell, FaChartLine, FaShieldAlt,
  FaLightbulb, FaExternalLinkAlt, FaComments, FaHeadset,
  FaFileAlt, FaPlayCircle, FaTimes, FaCheckCircle,
  FaInfoCircle, FaExclamationTriangle, FaRocket, FaCog,
  FaHeart, FaGlobe, FaMobile, FaDesktop
} from 'react-icons/fa';
import {
  MdHelp, MdSupport, MdSchool, MdForum, MdLiveHelp,
  MdArticle, MdVideoLibrary, MdEmail
} from 'react-icons/md';
import { FaCow } from 'react-icons/fa6';


/* ═══════ Toast Component ═══════ */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-gradient-to-r from-emerald-600 to-green-600",
    error: "bg-gradient-to-r from-red-600 to-rose-600",
    info: "bg-gradient-to-r from-blue-600 to-sky-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500"
  };

  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
    warning: <FaBell />
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

/* ═══════ FAQ Item ═══════ */
function FAQItem({ faq, isExpanded, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded 
          ? 'border-green-300 bg-gradient-to-br from-green-50/50 to-emerald-50/30 shadow-lg shadow-green-100/30'
          : 'border-gray-200 bg-white hover:border-green-200 hover:shadow-md'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left transition-all"
      >
        <span className={`font-semibold text-sm pr-4 ${isExpanded ? 'text-green-700' : 'text-gray-800'}`}>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            isExpanded ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <FaChevronDown size={12} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              <div className="p-4 bg-white/80 rounded-xl border border-green-100">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════ Guide Card ═══════ */
function GuideCard({ guide, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5
                 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
                        ${guide.type === 'video' 
                          ? 'bg-gradient-to-br from-red-500 to-rose-500 shadow-red-200/50' 
                          : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-200/50'
                        }`}>
          {guide.type === 'video' ? <FaVideo className="text-white text-lg" /> : <FaBook className="text-white text-lg" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">{guide.title}</h4>
          <p className="text-xs text-gray-500 mt-1">{guide.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              guide.type === 'video' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {guide.type === 'video' ? <FaPlayCircle size={10} /> : <FaFileAlt size={10} />}
              {guide.duration}
            </span>
            <span className="text-[10px] text-gray-400">{guide.views} views</span>
          </div>
        </div>
        <FaExternalLinkAlt className="text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
      </div>
    </motion.div>
  );
}

/* ═══════ Quick Action Card ═══════ */
function QuickActionCard({ icon, iconBg, title, description, buttonText, onClick, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-6
                 shadow-sm hover:shadow-2xl transition-all duration-300 text-center group"
    >
      <div className={`w-16 h-16 mx-auto rounded-2xl ${iconBg} flex items-center justify-center
                      shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 mb-4">{description}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white
                   font-bold text-sm rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-200/50
                   transition-all duration-300"
      >
        {buttonText}
      </motion.button>
    </motion.div>
  );
}

/* ═══════ MAIN HELP COMPONENT ═══════ */
export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const categories = [
    { id: 'all', name: 'All Topics', icon: <FaBook />, color: 'from-gray-500 to-slate-500' },
    { id: 'getting-started', name: 'Getting Started', icon: <FaRocket />, color: 'from-blue-500 to-indigo-500' },
    { id: 'animals', name: 'Animals', icon: <FaCow />, color: 'from-amber-500 to-orange-500' },
    { id: 'plants', name: 'Plants', icon: <FaSeedling />, color: 'from-green-500 to-emerald-500' },
    { id: 'notifications', name: 'Notifications', icon: <FaBell />, color: 'from-purple-500 to-violet-500' },
    { id: 'analytics', name: 'Analytics', icon: <FaChartLine />, color: 'from-cyan-500 to-teal-500' },
    { id: 'account', name: 'Account', icon: <FaShieldAlt />, color: 'from-red-500 to-rose-500' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create my first farm?',
      answer: 'To create your first farm, navigate to the Dashboard and click "Create Farm". Fill in details like farm name, location, and type. Once created, you can immediately start adding animals and plants to begin managing your smart farm.'
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What features are included in the free plan?',
      answer: 'The free plan includes basic farm management with up to 10 animals, 20 plants, basic health monitoring, daily notifications, and access to our mobile app. Premium features include unlimited animals/plants, AI disease detection, and advanced analytics.'
    },
    {
      id: 3,
      category: 'animals',
      question: 'How do I track animal health?',
      answer: 'Navigate to the Animals section and select any animal to view its health dashboard. You can log health records, schedule vaccinations, track feeding patterns, and set up automatic health alerts. Our AI system also provides predictive health insights.'
    },
    {
      id: 4,
      category: 'animals',
      question: 'How does the automatic feeding system work?',
      answer: 'The automatic feeding system monitors your animals\' fullness levels and triggers feeding based on your configured schedules. You can customize feeding times, portion sizes, and food types for each animal species. Enable it in Settings > Farm Settings.'
    },
    {
      id: 5,
      category: 'animals',
      question: 'What do the fullness indicators mean?',
      answer: 'The fullness meter shows: Green (80-100%) - Well fed and healthy, Yellow (50-79%) - Needs attention soon, Orange (20-49%) - Hungry and needs feeding, Red (0-19%) - Critical hunger level requiring immediate attention.'
    },
    {
      id: 6,
      category: 'plants',
      question: 'How do I set up automatic watering?',
      answer: 'Go to Settings > Farm Settings and enable "Auto Watering". Configure moisture thresholds for each plant type. When soil moisture drops below your threshold, the system automatically schedules watering or triggers connected irrigation systems.'
    },
    {
      id: 7,
      category: 'plants',
      question: 'How do I identify plant diseases?',
      answer: 'Use our AI Disease Detection feature by navigating to Detection > Upload Image. Take a clear photo of the affected plant area. Our AI analyzes the image and provides disease identification along with treatment recommendations and prevention tips.'
    },
    {
      id: 8,
      category: 'notifications',
      question: 'How do I customize my notifications?',
      answer: 'Go to Settings > Notifications to configure your preferences. You can enable/disable different channels (email, push, SMS), set alert thresholds for tank levels, and choose which events trigger notifications. Fine-tune each alert type individually.'
    },
    {
      id: 9,
      category: 'notifications',
      question: 'Why am I not receiving notifications?',
      answer: 'Check these common issues: 1) Browser notification permissions, 2) Settings > Notifications to ensure alerts are enabled, 3) Email spam folder for email notifications, 4) Phone\'s Do Not Disturb mode for mobile. Contact support if issues persist.'
    },
    {
      id: 10,
      category: 'analytics',
      question: 'How do I export my farm data?',
      answer: 'Go to Settings > Data & Privacy and click "Export All My Data". You can export all data or select specific categories. Data is exported in JSON format compatible with spreadsheets and other farm management tools.'
    },
    {
      id: 11,
      category: 'analytics',
      question: 'What analytics are available?',
      answer: 'Our analytics include: Animal health trends and predictions, feeding pattern analysis, plant growth tracking, water usage statistics, cost analysis reports, seasonal performance comparisons, and AI-powered recommendations. Access them from Dashboard or Analytics section.'
    },
    {
      id: 12,
      category: 'account',
      question: 'How do I enable two-factor authentication?',
      answer: 'Navigate to Settings > Security and toggle "Two-Factor Authentication". You\'ll be guided to set up an authenticator app (like Google Authenticator or Authy) by scanning a QR code. After setup, you\'ll need to enter a verification code when logging in.'
    }
  ];

  const guides = [
    { id: 1, title: 'Complete Farm Setup Guide', description: 'Learn how to set up your smart farm from scratch', duration: '15 min read', type: 'article', views: '12.5k' },
    { id: 2, title: 'Animal Health Monitoring', description: 'Understanding health metrics and alerts', duration: '10 min read', type: 'article', views: '8.2k' },
    { id: 3, title: 'Plant Care Automation', description: 'Set up automatic watering and monitoring', duration: '8 min read', type: 'article', views: '6.8k' },
    { id: 4, title: 'Using AI Disease Detection', description: 'Step-by-step video guide to our AI features', duration: '12 min video', type: 'video', views: '15.3k' },
    { id: 5, title: 'Tank Management System', description: 'Managing water and food tanks efficiently', duration: '6 min read', type: 'article', views: '4.1k' },
    { id: 6, title: 'Mobile App Tutorial', description: 'Getting the most out of our mobile app', duration: '10 min video', type: 'video', views: '9.7k' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50">
      <GridBackground />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}
      </AnimatePresence>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[1400px] mx-auto px-6 py-6 space-y-8"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 md:p-12
                     text-white shadow-2xl shadow-green-300/30 overflow-hidden relative"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MdHelp className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black">Help Center</h1>
                <p className="text-white/70 text-sm mt-1">Find answers and learn how to use Smart Farm</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search for help articles, guides, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-gray-800 text-sm
                           placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={<FaHeadset className="text-2xl text-white" />}
            iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200/50"
            title="Live Support"
            description="Chat with our team"
            buttonText="Start Chat"
            onClick={() => showToast('Connecting to support...', 'info')}
            delay={0}
          />
          <QuickActionCard
            icon={<FaFileAlt className="text-2xl text-white" />}
            iconBg="bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-200/50"
            title="Documentation"
            description="Read detailed guides"
            buttonText="Browse Docs"
            onClick={() => showToast('Opening documentation...', 'info')}
            delay={0.05}
          />
          <QuickActionCard
            icon={<FaPlayCircle className="text-2xl text-white" />}
            iconBg="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200/50"
            title="Video Tutorials"
            description="Watch how-to videos"
            buttonText="Watch Now"
            onClick={() => showToast('Loading video library...', 'info')}
            delay={0.1}
          />
          <QuickActionCard
            icon={<FaComments className="text-2xl text-white" />}
            iconBg="bg-gradient-to-br from-emerald-500 to-green-600 shadow-green-200/50"
            title="Community"
            description="Join discussions"
            buttonText="Join Forum"
            onClick={() => showToast('Opening community forum...', 'info')}
            delay={0.15}
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBook className="text-green-500" /> Categories
              </h3>
              
              <div className="space-y-1">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                                transition-all duration-200 ${
                                  activeCategory === category.id
                                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                  >
                    <span className={activeCategory === category.id ? '' : 'text-gray-400'}>
                      {category.icon}
                    </span>
                    <span className="font-medium text-sm">{category.name}</span>
                    <span className={`ml-auto text-xs font-bold ${
                      activeCategory === category.id ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {category.id === 'all' ? faqs.length : faqs.filter(f => f.category === category.id).length}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Pro Tip */}
              <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <FaLightbulb className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">Pro Tip</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono shadow-sm">Ctrl</kbd> + 
                  <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono shadow-sm ml-1">/</kbd> to quickly access search from anywhere.
                </p>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={fadeUp} className="lg:col-span-3 space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                    <FaQuestionCircle className="text-green-500" /> Frequently Asked Questions
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <FAQItem
                      key={faq.id}
                      faq={faq}
                      isExpanded={expandedFaq === faq.id}
                      onToggle={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaQuestionCircle className="text-3xl text-gray-300" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">No results found</h3>
                    <p className="text-sm text-gray-500">Try adjusting your search or browse all categories</p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                      className="mt-4 px-4 py-2 bg-green-100 text-green-700 font-semibold text-sm rounded-xl
                                 hover:bg-green-200 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Popular Guides */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
                <MdSchool className="text-blue-500" /> Popular Guides
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guides.map((guide, index) => (
                  <GuideCard key={guide.id} guide={guide} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Section */}
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-3xl p-8 md:p-12 text-center border border-gray-100"
        >
          <h2 className="text-2xl font-black text-gray-800 mb-2">Still need help?</h2>
          <p className="text-gray-500 mb-8">Our support team is available 24/7 to assist you</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: <FaEnvelope className="text-2xl" />, title: 'Email Support', value: 'support@smartfarm.com', sub: 'Response within 24 hours', color: 'from-blue-500 to-indigo-500' },
              { icon: <FaPhone className="text-2xl" />, title: 'Phone Support', value: '+216 XX XXX XXX', sub: 'Mon-Fri, 9AM-6PM', color: 'from-green-500 to-emerald-500' },
              { icon: <FaComments className="text-2xl" />, title: 'Live Chat', value: 'Chat with us now', sub: 'Available 24/7', color: 'from-purple-500 to-violet-500' }
            ].map((contact, index) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${contact.color}
                                flex items-center justify-center text-white shadow-lg mb-4`}>
                  {contact.icon}
                </div>
                <h3 className="font-bold text-gray-800">{contact.title}</h3>
                <p className="text-green-600 font-semibold mt-1">{contact.value}</p>
                <p className="text-xs text-gray-400 mt-2">{contact.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={fadeUp} className="text-center py-4">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <FaHeart className="text-red-400" />
            Smart Farm Help Center • Built with care for our farmers
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
} 
