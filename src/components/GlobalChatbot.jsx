import API_BASE from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageCircle, FiX, FiSend, FiMic, FiMicOff,
  FiVolume2, FiVolumeX, FiRefreshCw, FiMinimize2,
  FiMaximize2, FiUser, FiCpu, FiChevronDown,
  FiZap, FiDatabase, FiActivity, FiClock,
  FiTrash2, FiCopy, FiCheck, FiWifi, FiNavigation
} from 'react-icons/fi';
import {
  FaLeaf, FaPaw, FaBell, FaShieldAlt, FaHeartbeat,
  FaSeedling, FaTint, FaDrumstickBite, FaRobot
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Groq from 'groq-sdk';

/* ═══════════════════════════════════════════════════════════
   GROQ CLIENT
   ═══════════════════════════════════════════════════════════ */
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE',
  dangerouslyAllowBrowser: true,
});

const GROQ_MODEL = 'llama-3.1-8b-instant';
const NOTIFICATION_API = `${API_BASE}/api/notifications`;

/* ═══════════════════ HELPERS ═══════════════════ */
const formatTimestamp = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatRelativeTime = (ts) => {
  if (!ts) return 'just now';
  const diffMs = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ═══════════════════ NAVIGATION MAP ═══════════════════ */
const NAVIGATION_MAP = {
  // Dashboard
  dashboard: '/dashboard',
  home: '/dashboard',
  overview: '/dashboard',
  stats: '/dashboard',

  // Animals
  animal: '/my-animals',
  animals: '/my-animals',
  livestock: '/my-animals',
  pets: '/my-animals',

  // Plants
  plant: '/my-plants',
  plants: '/my-plants',
  crops: '/my-plants',
  vegetation: '/my-plants',

  // Feeding
  feed: '/feeding',
  feeding: '/feeding',
  food: '/feeding',
  'food page': '/feeding',
  'feed page': '/feeding',
  'feeding page': '/feeding',

  // Watering
  water: '/watering',
  watering: '/watering',
  irrigation: '/watering',
  'water page': '/watering',

  // Products
  product: '/products',
  products: '/products',
  store: '/products',
  shop: '/products',

  // Notifications
  notification: '/notifications',
  notifications: '/notifications',
  alerts: '/notifications',

  // Care tips
  'care tip': '/care-tips',
  'care tips': '/care-tips',
  tips: '/care-tips',
  advice: '/care-tips',

  // AI Detection
  'ai detection': '/ai-detection',
  detection: '/ai-detection',
  'animal detection': '/ai-animal-detection',
  'plant detection': '/ai-plant-detection',
  'detect animal': '/ai-animal-detection',
  'detect plant': '/ai-plant-detection',

  // Settings / Profile / Help
  settings: '/settings',
  profile: '/profile',
  help: '/help',
  support: '/help',

  // Farm
  farm: '/farm',
};

/* ═══════════════════ PAGE CONTEXT MAP ═══════════════════ */
const PAGE_CONTEXT = {
  '/dashboard': { label: 'Dashboard', emoji: '📊', color: 'green' },
  '/my-animals': { label: 'Animals', emoji: '🐾', color: 'indigo' },
  '/my-plants': { label: 'Plants', emoji: '🌿', color: 'emerald' },
  '/products': { label: 'Products', emoji: '📦', color: 'amber' },
  '/care-tips': { label: 'Care Tips', emoji: '💡', color: 'purple' },
  '/feeding': { label: 'Feeding', emoji: '🍽️', color: 'orange' },
  '/watering': { label: 'Watering', emoji: '💧', color: 'blue' },
  '/notifications': { label: 'Alerts', emoji: '🔔', color: 'red' },
  '/ai-detection': { label: 'AI Detection', emoji: '🤖', color: 'teal' },
  '/ai-plant-detection': { label: 'Plant AI', emoji: '🌱', color: 'green' },
  '/ai-animal-detection': { label: 'Animal AI', emoji: '🐄', color: 'blue' },
  '/settings': { label: 'Settings', emoji: '⚙️', color: 'gray' },
  '/profile': { label: 'Profile', emoji: '👤', color: 'blue' },
  '/help': { label: 'Help', emoji: '❓', color: 'purple' },
  '/farm': { label: 'Farm', emoji: '🏡', color: 'green' },
};

/* ═══════════════════ QUICK PROMPTS ═══════════════════ */
const QUICK_PROMPTS = [
  { label: '🐾 My Animals', prompt: 'How many animals do I have and what are their names?' },
  { label: '🌿 My Plants', prompt: 'How many plants do I have?' },
  { label: '📊 Farm Status', prompt: "What's my complete farm status?" },
  { label: '🔔 Alerts', prompt: 'Show me my active alerts' },
  { label: '🍽️ Go to Feeding', prompt: 'Take me to the feeding page' },
  { label: '🏥 Health Report', prompt: 'Give me a full health report of my farm' },
];

/* ═══════════════════════════════════════════════════════════
   DETECT NAVIGATION INTENT
   Returns the target route if the message is a navigation request, else null
   ═══════════════════════════════════════════════════════════ */
function detectNavigationIntent(message) {
  const lower = message.toLowerCase();

  // Detect "go to X", "take me to X", "open X", "navigate to X", "show me X page"
  const navPhrases = [
    /go\s+to\s+(?:the\s+)?(.+?)(?:\s+page)?$/i,
    /take\s+me\s+to\s+(?:the\s+)?(.+?)(?:\s+page)?$/i,
    /open\s+(?:the\s+)?(.+?)(?:\s+page)?$/i,
    /navigate\s+to\s+(?:the\s+)?(.+?)(?:\s+page)?$/i,
    /show\s+me\s+(?:the\s+)?(.+?)\s+page$/i,
    /i\s+want\s+to\s+(?:go\s+to\s+)?(?:the\s+)?(.+?)(?:\s+page)?$/i,
  ];

  for (const pattern of navPhrases) {
    const match = lower.match(pattern);
    if (match) {
      const keyword = match[1].trim();
      // Direct lookup
      if (NAVIGATION_MAP[keyword]) return { route: NAVIGATION_MAP[keyword], label: keyword };
      // Partial match
      for (const [key, route] of Object.entries(NAVIGATION_MAP)) {
        if (keyword.includes(key) || key.includes(keyword)) {
          return { route, label: key };
        }
      }
    }
  }

  // Direct keyword-only messages like "feeding", "feed me", "watering"
  for (const [key, route] of Object.entries(NAVIGATION_MAP)) {
    if (lower === key || lower === `${key} page`) {
      return { route, label: key };
    }
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const GlobalChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🌟 Hey there! I'm **Farmy**, your AI farm assistant!\n\nI have **real-time** access to your farm data and I can:\n• 🐾 Tell you about your animals & plants\n• 🏥 Check health status\n• 🍽️ Check food & water levels\n• 🔔 Show your alerts\n• 🧭 **Navigate** you anywhere — just say *\"go to feeding page\"*!\n\nWhat can I help you with today? 🌱",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [farmData, setFarmData] = useState({});
  const [lastDataFetch, setLastDataFetch] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthRef = window.speechSynthesis;
  const location = useLocation();
  const navigate = useNavigate();

  const currentPageInfo = PAGE_CONTEXT[location.pathname] || {
    label: 'Farm',
    emoji: '🏠',
    color: 'gray',
  };

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  /* ── Load voices ── */
  useEffect(() => {
    const loadVoices = () => speechSynthRef?.getVoices();
    if (speechSynthRef) {
      speechSynthRef.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  /* ── Speech recognition ── */
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e) => {
        setInputMessage(e.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  /* ═══════════════════ FETCH FARM DATA ═══════════════════ */
  const fetchFarmData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return { summary: { totalAnimals: 0, totalPlants: 0, note: 'not-authenticated' } };

    setIsDataLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Resolve farmId without using it in the URL — fetch per user
      let farmId = localStorage.getItem('farmId');
      if (!farmId) {
        try {
          const userRes = await axios.get(`${API_BASE}/auth/user`, { headers });
          const userId = userRes.data.id || userRes.data.userId || userRes.data._id || userRes.data.sub;
          const farmRes = await axios.get(`${API_BASE}/api/farms/user/${encodeURIComponent(userId)}`, { headers });
          farmId = farmRes.data?.id || farmRes.data?._id || farmRes.data?.farmId;
          if (farmId) localStorage.setItem('farmId', farmId);
        } catch { /* ignore */ }
      }

      if (!farmId) {
        setIsDataLoading(false);
        return { summary: { totalAnimals: 0, totalPlants: 0, note: 'no-farm' } };
      }

      const farmBase = `${API_BASE}/api/farms/${farmId}`;

      const results = await Promise.all([
        axios.get(`${farmBase}/animals`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${farmBase}/plants`, { headers }).catch(() => ({ data: [] })),
        axios.get(NOTIFICATION_API, { headers }).catch(() => ({ data: [] })),
        axios.get(`${farmBase}/tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/cow-tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/dog-tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/chicken-tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/sheep-tank-level`, { headers }).catch(() => ({ data: null })),
      ]);

      const [animalsRes, plantsRes, notifRes, waterRes, cowRes, dogRes, chickenRes, sheepRes] = results;

      const animals = Array.isArray(animalsRes.data) ? animalsRes.data : animalsRes.data?.animals || [];
      const plants = Array.isArray(plantsRes.data) ? plantsRes.data : plantsRes.data?.plants || [];
      const notifications = Array.isArray(notifRes.data) ? notifRes.data : [];
      const waterLevel = Number(waterRes.data?.level ?? 0);

      const foodSources = {};
      let totalFood = 0;
      [
        { key: 'cow', data: cowRes.data },
        { key: 'dog', data: dogRes.data },
        { key: 'chicken', data: chickenRes.data },
        { key: 'sheep', data: sheepRes.data },
      ].forEach(({ key, data }) => {
        const level = Number(data?.level ?? 0);
        if (level > 0) { foodSources[`${key}Food`] = level; totalFood += level; }
      });

      const animalBreakdown = {};
      animals.forEach((a) => {
        const s = a.species || 'Unknown';
        animalBreakdown[s] = (animalBreakdown[s] || 0) + 1;
      });

      const plantBreakdown = {};
      plants.forEach((p) => {
        const t = p.type || p.species || 'Unknown';
        plantBreakdown[t] = (plantBreakdown[t] || 0) + 1;
      });

      const health = (arr) => ({
        healthy: arr.filter((x) => (x.healthStatus || '').toLowerCase() === 'healthy').length,
        warning: arr.filter((x) => (x.healthStatus || '').toLowerCase() === 'warning').length,
        sick: arr.filter((x) => (x.healthStatus || '').toLowerCase() === 'sick').length,
      });

      const data = {
        animals,
        plants,
        notifications,
        waterLevel,
        foodSources,
        summary: {
          totalAnimals: animals.length,
          totalPlants: plants.length,
          totalAlerts: notifications.length,
          totalFood,
          waterLevel,
          animalBreakdown,
          plantBreakdown,
          animalHealth: health(animals),
          plantHealth: health(plants),
          foodSources,
          currentPage: location.pathname,
          timestamp: new Date().toISOString(),
        },
      };

      setLastDataFetch(new Date());
      setIsDataLoading(false);
      return data;
    } catch (err) {
      console.error('fetchFarmData error:', err);
      setIsDataLoading(false);
      return { summary: { totalAnimals: 0, totalPlants: 0, error: err.message } };
    }
  }, [location.pathname]);

  /* ── Auto-fetch on open / page change ── */
  useEffect(() => {
    if (isOpen) fetchFarmData().then(setFarmData);
  }, [isOpen, location.pathname, fetchFarmData]);

  /* ═══════════════════ BUILD SYSTEM PROMPT WITH RAG ═══════════════════ */
  const buildSystemPrompt = useCallback((data) => {
    const s = data?.summary || {};
    const animals = data?.animals || [];
    const plants = data?.plants || [];
    const notifications = data?.notifications || [];

    let farmContext = `=== LIVE FARM DATA (RAG CONTEXT) ===

📊 OVERVIEW:
- Total Animals: ${s.totalAnimals ?? 0}
- Total Plants: ${s.totalPlants ?? 0}
- Active Alerts: ${s.totalAlerts ?? 0}
- Water Level: ${s.waterLevel ?? 0} L
- Total Food Stock: ${s.totalFood ?? 0} kg
- Current App Page: ${s.currentPage || 'unknown'}
- Data Timestamp: ${s.timestamp || new Date().toISOString()}`;

    if (Object.keys(s.animalBreakdown || {}).length > 0) {
      farmContext += '\n\n🐾 ANIMAL SPECIES BREAKDOWN:\n';
      Object.entries(s.animalBreakdown).forEach(([sp, cnt]) => {
        farmContext += `- ${sp}: ${cnt}\n`;
      });
    }

    if (s.animalHealth) {
      farmContext += `\n🏥 ANIMAL HEALTH:\n- Healthy: ${s.animalHealth.healthy}\n- Warning: ${s.animalHealth.warning}\n- Sick: ${s.animalHealth.sick}`;
    }

    if (animals.length > 0) {
      farmContext += '\n\n📋 INDIVIDUAL ANIMALS:\n';
      animals.slice(0, 15).forEach((a, i) => {
        farmContext += `${i + 1}. Name: ${a.name || 'Unnamed'} | Species: ${a.species || '?'} | Health: ${a.healthStatus || '?'}${a.weight ? ` | Weight: ${a.weight}kg` : ''}${a.age ? ` | Age: ${a.age}` : ''}\n`;
      });
    }

    if (Object.keys(s.plantBreakdown || {}).length > 0) {
      farmContext += '\n\n🌿 PLANT TYPE BREAKDOWN:\n';
      Object.entries(s.plantBreakdown).forEach(([t, cnt]) => {
        farmContext += `- ${t}: ${cnt}\n`;
      });
    }

    if (s.plantHealth) {
      farmContext += `\n🌱 PLANT HEALTH:\n- Healthy: ${s.plantHealth.healthy}\n- Warning: ${s.plantHealth.warning}\n- Sick: ${s.plantHealth.sick}`;
    }

    if (plants.length > 0) {
      farmContext += '\n\n📋 INDIVIDUAL PLANTS:\n';
      plants.slice(0, 15).forEach((p, i) => {
        farmContext += `${i + 1}. Name: ${p.name || 'Unnamed'} | Type: ${p.type || p.species || '?'} | Health: ${p.healthStatus || '?'}\n`;
      });
    }

    if (Object.keys(s.foodSources || {}).length > 0) {
      farmContext += '\n\n🍽️ FOOD STOCK BY ANIMAL TYPE:\n';
      Object.entries(s.foodSources).forEach(([src, amt]) => {
        const label = src.replace('Food', '');
        farmContext += `- ${label.charAt(0).toUpperCase() + label.slice(1)}: ${amt} kg\n`;
      });
    }

    if (notifications.length > 0) {
      farmContext += '\n\n🔔 RECENT ALERTS (latest 5):\n';
      notifications.slice(0, 5).forEach((n, i) => {
        farmContext += `${i + 1}. [${n.type || n.severity || 'Alert'}] ${n.title || ''}: ${n.message || ''}\n`;
      });
    }

    farmContext += `\n=== END OF FARM DATA ===`;

    return `You are **Farmy**, a friendly, witty, and knowledgeable AI farm assistant with a warm personality — like a smart farmhand who knows everything about the farm and talks like a real person.

${farmContext}

YOUR PERSONALITY:
- Warm, friendly, and conversational — like talking to a helpful friend
- Use emojis naturally (not excessively)
- Give direct, accurate answers based on the data above
- If data shows 0 or is missing, be honest: "Looks like no data is available for that"
- Add helpful farm tips when relevant
- Never invent numbers — always use exact values from the data above
- When asked to navigate/go somewhere, say you're taking the user there (the app will handle the actual navigation)
- Keep responses concise but complete (max 3-4 short paragraphs)

IMPORTANT RULES:
1. Use ONLY the numbers from the farm data above — never hallucinate counts
2. Refer to animals and plants by their actual names when available
3. Be conversational, not robotic
4. If asked "how many plants/animals" — give the exact count from the data
5. Do NOT expose farm IDs, internal IDs, or technical details to the user`;
  }, []);

  /* ═══════════════════ ADD BOT MESSAGE ═══════════════════ */
  const addBotMessage = useCallback((text, extra = {}) => {
    const msg = { id: Date.now() + 1, text, isBot: true, timestamp: new Date(), ...extra };
    setMessages((prev) => [...prev, msg]);

    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        text.replace(/[*_#`]/g, '').replace(/\n/g, '. ')
      );
      const voices = speechSynthRef?.getVoices() || [];
      const preferred =
        voices.find((v) => v.lang.startsWith('en') && /female|woman|zira|hazel|susan|samantha/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      speechSynthRef?.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
    }

    if (isMinimized) setUnreadCount((prev) => prev + 1);
  }, [voiceEnabled, isMinimized]);

  /* ═══════════════════ SEND MESSAGE ═══════════════════ */
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const question = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setShowQuickPrompts(false);

    try {
      // ── 1. Check navigation intent FIRST ──
      const navIntent = detectNavigationIntent(question);
      if (navIntent) {
        const pageLabel = navIntent.label.charAt(0).toUpperCase() + navIntent.label.slice(1);
        const pageEmoji = PAGE_CONTEXT[navIntent.route]?.emoji || '📍';
        addBotMessage(
          `${pageEmoji} Sure! Taking you to the **${pageLabel}** page right now! 🚀\n\nI'll be right here if you need anything else! 😊`
        );
        // Small delay so user sees the message, then navigate
        setTimeout(() => navigate(navIntent.route), 900);
        setIsLoading(false);
        return;
      }

      // ── 2. Fetch latest farm data ──
      const latestData = await fetchFarmData();
      setFarmData(latestData);

      const animals = latestData?.animals || [];
      const plants = latestData?.plants || [];
      const q = question.trim().toLowerCase();

      // ── 3. Deterministic shortcut answers (no LLM needed) ──
      const isAnimalCount = /how many animal|count.*animal|animal.*count|number of animal/i.test(q) || q === 'animals';
      const isPlantCount = /how many plant|count.*plant|plant.*count|number of plant/i.test(q) || q === 'plants';
      const isBothCount = isAnimalCount && isPlantCount;

      if (isBothCount) {
        addBotMessage(
          `📊 Here's your live farm count:\n\n🐾 **Animals:** ${animals.length}\n🌿 **Plants:** ${plants.length}\n\nWant details on any of them?`
        );
        setIsLoading(false);
        return;
      }
      if (isAnimalCount && !isPlantCount) {
        const breakdown = latestData?.summary?.animalBreakdown || {};
        let detail = '';
        if (Object.keys(breakdown).length > 0) {
          detail = '\n\n' + Object.entries(breakdown).map(([s, c]) => `• ${s}: ${c}`).join('\n');
        }
        addBotMessage(`🐾 You have **${animals.length} animal${animals.length !== 1 ? 's' : ''}** on your farm!${detail}`);
        setIsLoading(false);
        return;
      }
      if (isPlantCount && !isAnimalCount) {
        const breakdown = latestData?.summary?.plantBreakdown || {};
        let detail = '';
        if (Object.keys(breakdown).length > 0) {
          detail = '\n\n' + Object.entries(breakdown).map(([t, c]) => `• ${t}: ${c}`).join('\n');
        }
        addBotMessage(`🌿 You have **${plants.length} plant${plants.length !== 1 ? 's' : ''}** on your farm!${detail}`);
        setIsLoading(false);
        return;
      }

      // ── 4. Full RAG + LLM response ──
      const systemPrompt = buildSystemPrompt(latestData);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          // Include last 6 messages as conversation history for context
          ...messages.slice(-6).map((m) => ({
            role: m.isBot ? 'assistant' : 'user',
            content: m.text,
          })),
          { role: 'user', content: question },
        ],
        model: GROQ_MODEL,
        temperature: 0.65,
        max_tokens: 500,
      });

      const responseText =
        completion.choices[0]?.message?.content ||
        "Hmm, I had a little trouble with that. Could you try rephrasing? 🤔";

      addBotMessage(responseText);
    } catch (error) {
      console.error('Chatbot error:', error);
      addBotMessage(
        "Sorry, I hit a snag! 😅 Check your Groq API key or internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, fetchFarmData, buildSystemPrompt, addBotMessage, navigate, messages]);

  /* ── Key press ── */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── Voice controls ── */
  const startListening = () => {
    if (recognitionRef.current && !isListening) { setIsListening(true); recognitionRef.current.start(); }
  };
  const stopListening = () => {
    if (recognitionRef.current && isListening) { recognitionRef.current.stop(); setIsListening(false); }
  };
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) { speechSynthRef?.cancel(); setIsSpeaking(false); }
  };

  /* ── Clear chat ── */
  const clearConversation = () => {
    setMessages([{
      id: Date.now(),
      text: "🔄 Fresh start! I'm Farmy and I'm ready to help. What do you need? 🌱",
      isBot: true,
      timestamp: new Date(),
    }]);
    setUnreadCount(0);
    setShowQuickPrompts(true);
    fetchFarmData().then(setFarmData);
  };

  /* ── Copy message ── */
  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text.replace(/[*_#`]/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ── Open chat ── */
  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  /* ── Hide on auth pages ── */
  const hiddenPages = ['/login', '/register', '/reset-password'];
  if (hiddenPages.includes(location.pathname)) return null;

  const summary = farmData.summary || {};
  const dataStats = [
    { icon: <FaPaw className="text-[8px]" />, value: summary.totalAnimals ?? 0 },
    { icon: <FaLeaf className="text-[8px]" />, value: summary.totalPlants ?? 0 },
    { icon: <FaBell className="text-[8px]" />, value: summary.totalAlerts ?? 0 },
  ];

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <>
      {/* ═══════ FLOATING BUTTON ═══════ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <motion.button
              className="relative bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600
                         hover:to-emerald-700 text-white p-4 rounded-2xl shadow-2xl shadow-green-300/40"
              onClick={openChat}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaRobot size={24} />
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold
                             rounded-full w-6 h-6 flex items-center justify-center shadow-lg ring-2 ring-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-green-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ CHAT WINDOW ═══════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden
                       bg-white rounded-3xl shadow-2xl border border-gray-200/80"
            style={{ width: isMinimized ? 320 : 400, height: isMinimized ? 64 : 640 }}
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            layout
          >
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white
                            px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center
                                  justify-center shadow-inner">
                    <FaRobot size={18} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full
                                  border-2 border-white shadow-sm" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">Farmy — Farm AI</h3>
                  <div className="flex items-center gap-2 text-[10px] text-green-100">
                    {isDataLoading ? (
                      <span className="flex items-center gap-1">
                        <FiRefreshCw size={8} className="animate-spin" /> Syncing…
                      </span>
                    ) : lastDataFetch ? (
                      <span className="flex items-center gap-1">
                        <FiWifi size={8} /> {formatRelativeTime(lastDataFetch)}
                      </span>
                    ) : 'Connecting…'}
                    <span className="w-0.5 h-0.5 rounded-full bg-green-200" />
                    <span className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded">
                      {currentPageInfo.emoji} {currentPageInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!isMinimized && (
                  <div className="hidden sm:flex items-center gap-1 mr-1">
                    {dataStats.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-bold">
                        {s.icon} {s.value}
                      </span>
                    ))}
                  </div>
                )}
                <button onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition"
                  title={voiceEnabled ? 'Disable voice' : 'Enable voice'}>
                  {voiceEnabled ? <FiVolume2 size={14} /> : <FiVolumeX size={14} />}
                </button>
                <button onClick={() => fetchFarmData().then(setFarmData)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition" title="Refresh data">
                  <FiRefreshCw size={14} className={isDataLoading ? 'animate-spin' : ''} />
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition">
                  {isMinimized ? <FiMaximize2 size={14} /> : <FiMinimize2 size={14} />}
                </button>
                <button onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition">
                  <FiX size={14} />
                </button>
              </div>
            </div>

            {/* ── Chat body ── */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white custom-scrollbar">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                          msg.isBot
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {msg.isBot ? <FaRobot size={11} /> : <FiUser size={12} />}
                        </div>

                        {/* Bubble */}
                        <div className="group relative">
                          <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                            msg.isBot
                              ? 'bg-white text-gray-800 border border-gray-100'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          }`}>
                            {/* Render bold markdown */}
                            <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                              __html: msg.text
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                            }} />
                            <div className={`flex items-center justify-between mt-1.5 text-[10px] ${
                              msg.isBot ? 'text-gray-400' : 'text-green-200'
                            }`}>
                              <span className="flex items-center gap-1">
                                <FiClock size={8} />
                                {formatTimestamp(msg.timestamp)}
                              </span>
                              {msg.isBot && (
                                <span className="flex items-center gap-1 text-green-500">
                                  <FiZap size={8} /> Farmy
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Copy button */}
                          {msg.isBot && (
                            <button
                              onClick={() => copyMessage(msg.id, msg.text)}
                              className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100
                                         p-1 bg-white border border-gray-200 rounded-md shadow-sm
                                         text-gray-400 hover:text-green-600 transition-all text-[10px]"
                              title="Copy"
                            >
                              {copiedId === msg.id ? <FiCheck size={10} className="text-green-500" /> : <FiCopy size={10} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading dots */}
                  {isLoading && (
                    <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                          <FaRobot size={11} />
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full"
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">Farmy is thinking…</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ── Quick Prompts ── */}
                <AnimatePresence>
                  {showQuickPrompts && messages.length <= 2 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="p-3 bg-gray-50/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 px-1">
                          Quick Actions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_PROMPTS.map((qp) => (
                            <button
                              key={qp.label}
                              onClick={() => {
                                setInputMessage(qp.prompt);
                                setTimeout(() => inputRef.current?.focus(), 50);
                              }}
                              className="px-2.5 py-1.5 text-[11px] bg-white text-gray-600 rounded-lg
                                         border border-gray-200 hover:border-green-300 hover:bg-green-50
                                         hover:text-green-700 transition-all font-medium shadow-sm"
                            >
                              {qp.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Input Area ── */}
                <div className="p-3 border-t bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Farmy or say 'go to feeding'…"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300
                                   transition-all bg-gray-50 focus:bg-white"
                        disabled={isLoading}
                      />
                      {isListening && (
                        <motion.div className="absolute right-3 top-1/2 -translate-y-1/2"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}>
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-200" />
                        </motion.div>
                      )}
                    </div>

                    {/* Voice */}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                      onClick={isListening ? stopListening : startListening}
                      className={`p-2.5 rounded-xl transition-all shadow-sm ${
                        isListening ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      }`}>
                      {isListening ? <FiMicOff size={16} /> : <FiMic size={16} />}
                    </motion.button>

                    {/* Stop speaking */}
                    {isSpeaking && (
                      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}
                        onClick={stopSpeaking}
                        className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-200">
                        <FiVolumeX size={16} />
                      </motion.button>
                    )}

                    {/* Send */}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600
                                 hover:to-emerald-700 disabled:from-gray-200 disabled:to-gray-300
                                 text-white p-2.5 rounded-xl transition-all shadow-md shadow-green-200/50 disabled:shadow-none">
                      <FiSend size={16} />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between mt-2 px-1">
                    <button onClick={clearConversation}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition flex items-center gap-1">
                      <FiTrash2 size={9} /> Clear
                    </button>
                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiZap size={8} className="text-green-500" />
                        Powered by Groq
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <FiNavigation size={7} className="text-blue-400" /> Nav-enabled
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </>
  );
};

export default GlobalChatbot;


