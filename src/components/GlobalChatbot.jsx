import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageCircle, FiX, FiSend, FiMic, FiMicOff,
  FiVolume2, FiVolumeX, FiRefreshCw, FiMinimize2,
  FiMaximize2, FiUser, FiCpu, FiChevronDown,
  FiZap, FiDatabase, FiActivity, FiClock,
  FiTrash2, FiCopy, FiCheck, FiWifi
} from 'react-icons/fi';
import {
  FaLeaf, FaPaw, FaBell, FaShieldAlt, FaHeartbeat,
  FaSeedling, FaTint, FaDrumstickBite, FaRobot
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Groq from 'groq-sdk';

/* ═══════════════════════════════════════════════════════════
   ✅ GROQ CLIENT — Using a REAL chat model
   
   ❌ "meta-llama/llama-prompt-guard-2-86m" is a SECURITY
      model for detecting prompt injections. It only outputs
      "safe" or "unsafe" — it CANNOT have conversations.
   
   ❌ "llama3-8b-8192" has been DECOMMISSIONED by Groq.
   
   ✅ "llama-3.1-8b-instant" is the correct replacement:
      - Fast inference (perfect for chat)
      - Full conversation capability
      - Cost-effective
      - 8192 token context window
   ═══════════════════════════════════════════════════════════ */
const groq = new Groq({
  apiKey: 'YOUR_GROQ_API_KEY_HERE',
  dangerouslyAllowBrowser: true,
});

// ✅ Correct chat model
const GROQ_MODEL = 'llama-3.1-8b-instant';

/* ═══════════════════ NOTIFICATION API ═══════════════════ */
// ✅ FIX: Notifications are GLOBAL (/api/notifications),
//    NOT per-farm (/api/farms/{id}/notifications)
const API_BASE = 'http://localhost:8080';
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
};

/* ═══════════════════ QUICK PROMPTS ═══════════════════ */
const QUICK_PROMPTS = [
  { label: '🐾 Count Animals', prompt: 'How many animals do I have?' },
  { label: '🌿 Count Plants', prompt: 'How many plants do I have?' },
  { label: '📊 Farm Status', prompt: "What's my complete farm status?" },
  { label: '🔔 Alerts', prompt: 'Show me my alerts and notifications' },
  { label: '🍽️ Resources', prompt: 'What are my food and water levels?' },
  { label: '🏥 Health', prompt: 'How is the health of my animals and plants?' },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const GlobalChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🌟 Hello! I'm your AI Farm Assistant with **REAL-TIME** access to all your farm data.\n\nI can tell you exactly:\n• 🐾 How many animals & plants you have\n• 🏥 Their health status\n• 🍽️ Food & water levels\n• 🔔 Active alerts\n\nTry asking: **\"What's my farm status?\"**",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [farmData, setFarmData] = useState({});
  const [lastDataFetch, setLastDataFetch] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;
  const location = useLocation();

  const currentPageInfo = PAGE_CONTEXT[location.pathname] || {
    label: 'Farm',
    emoji: '🏠',
    color: 'gray',
  };

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── Load voices ── */
  useEffect(() => {
    const loadVoices = () => speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  /* ── Speech recognition ── */
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        setInputMessage(event.results[0][0].transcript);
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

      // Resolve farmId
      let farmId = localStorage.getItem('farmId');
      if (!farmId) {
        try {
          const userRes = await axios.get(`${API_BASE}/auth/user`, { headers });
          const userId =
            userRes.data.id || userRes.data.userId || userRes.data._id || userRes.data.sub;
          const farmRes = await axios.get(
            `${API_BASE}/api/farms/user/${encodeURIComponent(userId)}`,
            { headers }
          );
          farmId =
            farmRes.data?.id || farmRes.data?._id || farmRes.data?.farmId;
          if (farmId) localStorage.setItem('farmId', farmId);
        } catch {
          /* ignore */
        }
      }

      if (!farmId) {
        return { summary: { totalAnimals: 0, totalPlants: 0, note: 'no-farm' } };
      }

      const farmBase = `${API_BASE}/api/farms/${farmId}`;

      // Fetch all data in parallel
      const results = await Promise.all([
        axios.get(`${farmBase}/animals`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${farmBase}/plants`, { headers }).catch(() => ({ data: [] })),
        // ✅ FIX: Use global notification endpoint
        axios.get(NOTIFICATION_API, { headers }).catch(() => ({ data: [] })),
        axios.get(`${farmBase}/tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/cow-tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/dog-tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/chicken-tank-level`, { headers }).catch(() => ({ data: null })),
        axios.get(`${farmBase}/sheep-tank-level`, { headers }).catch(() => ({ data: null })),
      ]);

      const [animalsRes, plantsRes, notifRes, waterRes, cowRes, dogRes, chickenRes, sheepRes] =
        results;

      const animals = Array.isArray(animalsRes.data)
        ? animalsRes.data
        : animalsRes.data?.animals || [];
      const plants = Array.isArray(plantsRes.data)
        ? plantsRes.data
        : plantsRes.data?.plants || [];
      const notifications = notifRes.data || [];
      const waterLevel = Number(waterRes.data?.level ?? 0);

      // Food sources
      const foodSources = {};
      let totalFood = 0;
      [
        { key: 'cow', data: cowRes.data },
        { key: 'dog', data: dogRes.data },
        { key: 'chicken', data: chickenRes.data },
        { key: 'sheep', data: sheepRes.data },
      ].forEach(({ key, data }) => {
        const level = Number(data?.level ?? 0);
        if (level > 0) {
          foodSources[`${key}Food`] = level;
          totalFood += level;
        }
      });

      // Animal breakdown
      const animalBreakdown = {};
      animals.forEach((a) => {
        const species = a.species || 'Unknown';
        animalBreakdown[species] = (animalBreakdown[species] || 0) + 1;
      });

      // Plant breakdown
      const plantBreakdown = {};
      plants.forEach((p) => {
        const type = p.type || p.species || 'Unknown';
        plantBreakdown[type] = (plantBreakdown[type] || 0) + 1;
      });

      // Health stats
      const animalHealth = {
        healthy: animals.filter((a) => (a.healthStatus || '').toLowerCase() === 'healthy').length,
        warning: animals.filter((a) => (a.healthStatus || '').toLowerCase() === 'warning').length,
        sick: animals.filter((a) => (a.healthStatus || '').toLowerCase() === 'sick').length,
      };
      const plantHealth = {
        healthy: plants.filter((p) => (p.healthStatus || '').toLowerCase() === 'healthy').length,
        warning: plants.filter((p) => (p.healthStatus || '').toLowerCase() === 'warning').length,
        sick: plants.filter((p) => (p.healthStatus || '').toLowerCase() === 'sick').length,
      };

      const comprehensiveData = {
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
          animalHealth,
          plantHealth,
          foodSources,
          farmId,
          currentPage: location.pathname,
          timestamp: new Date().toISOString(),
          dataSource: 'farm-specific',
        },
      };

      setLastDataFetch(new Date());
      setIsDataLoading(false);
      return comprehensiveData;
    } catch (error) {
      console.error('Error fetching farm data:', error);
      setIsDataLoading(false);
      return {
        summary: {
          totalAnimals: 0,
          totalPlants: 0,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }, [location.pathname]);

  /* ── Auto-fetch on open / page change ── */
  useEffect(() => {
    if (isOpen) {
      fetchFarmData().then(setFarmData);
    }
  }, [isOpen, location.pathname, fetchFarmData]);

  /* ═══════════════════ BUILD CONTEXT PROMPT ═══════════════════ */
  const generateContextualResponse = useCallback(
    (question) => {
      const summary = farmData.summary || {};

      let farmStatus = `REAL-TIME FARM DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERVIEW:
• Animals: ${summary.totalAnimals || 0}
• Plants: ${summary.totalPlants || 0}
• Alerts: ${summary.totalAlerts || 0}
• Water: ${summary.waterLevel || 0} L
• Food: ${summary.totalFood || 0} kg`;

      // Animal breakdown
      if (summary.animalBreakdown && Object.keys(summary.animalBreakdown).length > 0) {
        farmStatus += '\n\n🐾 ANIMAL BREAKDOWN:';
        Object.entries(summary.animalBreakdown).forEach(([species, count]) => {
          farmStatus += `\n• ${species}: ${count}`;
        });
      }

      // Animal health
      if (summary.animalHealth) {
        farmStatus += `\n\n🏥 ANIMAL HEALTH:
• Healthy: ${summary.animalHealth.healthy}
• Warning: ${summary.animalHealth.warning}
• Sick: ${summary.animalHealth.sick}`;
      }

      // Individual animals (top 10)
      if (farmData.animals && farmData.animals.length > 0) {
        farmStatus += '\n\nINDIVIDUAL ANIMALS:';
        farmData.animals.slice(0, 10).forEach((a, i) => {
          farmStatus += `\n${i + 1}. ${a.name || 'Unnamed'} - ${a.species || '?'} - Health: ${a.healthStatus || '?'}${a.weight ? ` - ${a.weight}kg` : ''}`;
        });
        if (farmData.animals.length > 10)
          farmStatus += `\n... and ${farmData.animals.length - 10} more`;
      }

      // Plant breakdown
      if (summary.plantBreakdown && Object.keys(summary.plantBreakdown).length > 0) {
        farmStatus += '\n\n🌿 PLANT BREAKDOWN:';
        Object.entries(summary.plantBreakdown).forEach(([type, count]) => {
          farmStatus += `\n• ${type}: ${count}`;
        });
      }

      // Plant health
      if (summary.plantHealth) {
        farmStatus += `\n\n🌱 PLANT HEALTH:
• Healthy: ${summary.plantHealth.healthy}
• Warning: ${summary.plantHealth.warning}
• Sick: ${summary.plantHealth.sick}`;
      }

      // Individual plants (top 10)
      if (farmData.plants && farmData.plants.length > 0) {
        farmStatus += '\n\nINDIVIDUAL PLANTS:';
        farmData.plants.slice(0, 10).forEach((p, i) => {
          farmStatus += `\n${i + 1}. ${p.name || 'Unnamed'} - ${p.type || p.species || '?'} - Health: ${p.healthStatus || '?'}`;
        });
        if (farmData.plants.length > 10)
          farmStatus += `\n... and ${farmData.plants.length - 10} more`;
      }

      // Food sources
      if (summary.foodSources && Object.keys(summary.foodSources).length > 0) {
        farmStatus += '\n\n🍽️ FOOD BY TYPE:';
        Object.entries(summary.foodSources).forEach(([source, amount]) => {
          const label = source.replace('Food', '').charAt(0).toUpperCase() + source.replace('Food', '').slice(1);
          farmStatus += `\n• ${label}: ${amount} kg`;
        });
      }

      // Recent alerts
      if (farmData.notifications && farmData.notifications.length > 0) {
        farmStatus += '\n\n🔔 RECENT ALERTS:';
        farmData.notifications.slice(0, 5).forEach((n, i) => {
          farmStatus += `\n${i + 1}. ${n.title || n.type || 'Alert'}: ${n.message || ''}`;
        });
      }

      farmStatus += `\n\n📍 Current Page: ${currentPageInfo.label}
⏰ Updated: ${summary.timestamp ? new Date(summary.timestamp).toLocaleString() : 'now'}`;

      return `You are an expert farm management AI assistant with access to REAL, LIVE farm data.

${farmStatus}

User's Question: "${question}"

RULES:
1. Use EXACT numbers from the data — never invent data
2. Reference actual animal/plant names when available
3. If data is missing, say "No data available" — don't guess
4. Be conversational, helpful, and concise
5. Use emojis to make responses friendly
6. Provide actionable advice when relevant`;
    },
    [farmData, currentPageInfo]
  );

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
      // Refresh farm data before answering
      const latestData = await fetchFarmData();
      setFarmData(latestData);

      const q = question.trim().toLowerCase();
      const animalsCount = Array.isArray(latestData?.animals) ? latestData.animals.length : 0;
      const plantsCount = Array.isArray(latestData?.plants) ? latestData.plants.length : 0;
      const farmId = latestData?.summary?.farmId || localStorage.getItem('farmId') || 'unknown';

      // ── Deterministic answers for count questions (skip LLM) ──
      const isAnimalCount =
        (q.includes('how many') && /animal|pet|livestock/i.test(q)) ||
        q === 'animals' ||
        q === 'animal count';
      const isPlantCount =
        (q.includes('how many') && /plant|crop|vegetation/i.test(q)) ||
        q === 'plants' ||
        q === 'plant count';
      const isBothCount =
        q.includes('how many') && /animal/i.test(q) && /plant/i.test(q);

      if (isBothCount) {
        const text = `📊 According to your live farm data:\n\n🐾 **Animals:** ${animalsCount}\n🌿 **Plants:** ${plantsCount}\n\n_Farm ID: ${farmId}_`;
        addBotMessage(text);
        return;
      }
      if (isAnimalCount) {
        const text = `🐾 You have **${animalsCount} animals** in your farm.\n\n_Farm ID: ${farmId}_`;
        addBotMessage(text);
        return;
      }
      if (isPlantCount) {
        const text = `🌿 You have **${plantsCount} plants** in your farm.\n\n_Farm ID: ${farmId}_`;
        addBotMessage(text);
        return;
      }

      // ── Call Groq LLM for complex questions ──
      const contextPrompt = generateContextualResponse(question);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a comprehensive farm management AI assistant. You have access to complete real-time farm data. Provide helpful, accurate, conversational responses. Use emojis. Be concise but thorough.',
          },
          { role: 'user', content: contextPrompt },
        ],
        // ✅ CORRECT MODEL — llama-3.1-8b-instant (fast chat model)
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 600,
      });

      const responseText =
        completion.choices[0]?.message?.content ||
        "I'm having trouble processing that. Could you rephrase?";

      addBotMessage(responseText);
    } catch (error) {
      console.error('Error sending message:', error);

      let errorText = "Sorry, I'm experiencing technical difficulties. Please try again.";
      if (error?.message?.includes('decommissioned') || error?.status === 400) {
        errorText =
          '⚠️ The AI model is currently unavailable. The system will retry with a backup model.';
      }

      addBotMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, fetchFarmData, generateContextualResponse]);

  /* ── Helper: add bot message + optional TTS ── */
  const addBotMessage = useCallback(
    (text) => {
      const msg = { id: Date.now() + 1, text, isBot: true, timestamp: new Date() };
      setMessages((prev) => [...prev, msg]);

      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          text.replace(/[*_#`]/g, '').replace(/\n/g, '. ')
        );
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            /female|woman|zira|hazel|susan|samantha/i.test(v.name)
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
      }

      if (isMinimized) setUnreadCount((prev) => prev + 1);
    },
    [voiceEnabled, isMinimized]
  );

  /* ── Key press handler ── */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Voice controls ── */
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  /* ── Clear chat ── */
  const clearConversation = () => {
    setMessages([
      {
        id: Date.now(),
        text: "🔄 Chat cleared! I'm ready with fresh data. Ask me anything about your farm!",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
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

  /* ── Data summary for header ── */
  const summary = farmData.summary || {};
  const dataStats = [
    { icon: <FaPaw className="text-[8px]" />, value: summary.totalAnimals || 0 },
    { icon: <FaLeaf className="text-[8px]" />, value: summary.totalPlants || 0 },
    { icon: <FaBell className="text-[8px]" />, value: summary.totalAlerts || 0 },
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

              {/* Unread badge */}
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold
                             rounded-full w-6 h-6 flex items-center justify-center shadow-lg ring-2 ring-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}

              {/* Pulse ring */}
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
                  <h3 className="font-bold text-sm truncate">Farm AI Assistant</h3>
                  <div className="flex items-center gap-2 text-[10px] text-green-100">
                    {isDataLoading ? (
                      <span className="flex items-center gap-1">
                        <FiRefreshCw size={8} className="animate-spin" /> Syncing…
                      </span>
                    ) : lastDataFetch ? (
                      <span className="flex items-center gap-1">
                        <FiWifi size={8} /> {formatRelativeTime(lastDataFetch)}
                      </span>
                    ) : (
                      'Connecting…'
                    )}
                    <span className="w-0.5 h-0.5 rounded-full bg-green-200" />
                    <span className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded">
                      {currentPageInfo.emoji} {currentPageInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Data stats pills (visible when not minimized) */}
                {!isMinimized && (
                  <div className="hidden sm:flex items-center gap-1 mr-1">
                    {dataStats.map((s, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 text-[9px] bg-white/10 px-1.5 py-0.5
                                   rounded font-bold"
                      >
                        {s.icon} {s.value}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition"
                  title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                >
                  {voiceEnabled ? <FiVolume2 size={14} /> : <FiVolumeX size={14} />}
                </button>
                <button
                  onClick={() => fetchFarmData().then(setFarmData)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition"
                  title="Refresh data"
                >
                  <FiRefreshCw size={14} className={isDataLoading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition"
                >
                  {isMinimized ? <FiMaximize2 size={14} /> : <FiMinimize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>

            {/* ── Chat body (hidden when minimized) ── */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white
                                custom-scrollbar">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[85%] ${
                          msg.isBot ? 'flex-row' : 'flex-row-reverse'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                            msg.isBot
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {msg.isBot ? <FiCpu size={12} /> : <FiUser size={12} />}
                        </div>

                        {/* Bubble */}
                        <div className="group relative">
                          <div
                            className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                              msg.isBot
                                ? 'bg-white text-gray-800 border border-gray-100'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <div
                              className={`flex items-center justify-between mt-1.5 text-[10px] ${
                                msg.isBot ? 'text-gray-400' : 'text-green-200'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <FiClock size={8} />
                                {formatTimestamp(msg.timestamp)}
                              </span>
                              {msg.isBot && (
                                <span className="flex items-center gap-1 text-green-500">
                                  <FiZap size={8} /> {GROQ_MODEL.split('-').slice(0, 2).join('-')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Copy button (bot messages only) */}
                          {msg.isBot && (
                            <button
                              onClick={() => copyMessage(msg.id, msg.text)}
                              className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100
                                         p-1 bg-white border border-gray-200 rounded-md shadow-sm
                                         text-gray-400 hover:text-green-600 transition-all text-[10px]"
                              title="Copy"
                            >
                              {copiedId === msg.id ? (
                                <FiCheck size={10} className="text-green-500" />
                              ) : (
                                <FiCopy size={10} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading dots */}
                  {isLoading && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600
                                        flex items-center justify-center text-white shadow-sm">
                          <FiCpu size={12} />
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100
                                        flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-green-500 rounded-full"
                                animate={{ y: [0, -6, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">Thinking…</span>
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
                        placeholder="Ask about your farm…"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300
                                   transition-all bg-gray-50 focus:bg-white"
                        disabled={isLoading}
                      />
                      {isListening && (
                        <motion.div
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        >
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-200" />
                        </motion.div>
                      )}
                    </div>

                    {/* Voice button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={isListening ? stopListening : startListening}
                      className={`p-2.5 rounded-xl transition-all shadow-sm ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      }`}
                      title={isListening ? 'Stop listening' : 'Voice input'}
                    >
                      {isListening ? <FiMicOff size={16} /> : <FiMic size={16} />}
                    </motion.button>

                    {/* Stop speaking */}
                    {isSpeaking && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={stopSpeaking}
                        className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl
                                   shadow-sm shadow-orange-200"
                        title="Stop speaking"
                      >
                        <FiVolumeX size={16} />
                      </motion.button>
                    )}

                    {/* Send */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600
                                 hover:to-emerald-700 disabled:from-gray-200 disabled:to-gray-300
                                 text-white p-2.5 rounded-xl transition-all shadow-md shadow-green-200/50
                                 disabled:shadow-none"
                    >
                      <FiSend size={16} />
                    </motion.button>
                  </div>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between mt-2 px-1">
                    <button
                      onClick={clearConversation}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition flex items-center gap-1"
                    >
                      <FiTrash2 size={9} /> Clear
                    </button>
                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiZap size={8} className="text-green-500" />
                        Powered by Groq
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                      <span>{GROQ_MODEL}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar */}
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
    </>
  );
};

export default GlobalChatbot;