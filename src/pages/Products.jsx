import API_BASE from '../config';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaSearch, FaTimes, FaChevronLeft, FaChevronRight,
  FaStar, FaLeaf, FaBox, FaTag, FaPlus, FaMinus, FaTrash,
  FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSync,
  FaFilter, FaSortAmountDown, FaHeart, FaRegHeart, FaEye,
  FaShoppingBag, FaPercent, FaTruck, FaShieldAlt
} from 'react-icons/fa';
import {
  MdStorefront, MdCategory, MdLocalOffer, MdInventory,
  MdShoppingBasket, MdClose, MdArrowForward, MdGrain
} from 'react-icons/md';
import AIChatbot from '../components/AIChatbot';

import farm1jpg from '../assets/images/farm1.jpg';
import farm1png from '../assets/images/farm1.png';
import farm3jpeg from '../assets/images/farm3.jpeg';
import plantejpg from '../assets/images/plante.jpg';
import cowImg from '../assets/images/cow.jpg';
import foodsheepImg from '../assets/images/foodsheep.jpg';
import foodcowImg from '../assets/images/foodcow.jpg';
import fooddogImg from '../assets/images/fooddog.jpg';
import chickenfoodImg from '../assets/images/chickenfood.jpg';
import dogImg from '../assets/images/dog.jpg';
import sheepImg from '../assets/images/sheep.jpg';
import chickenImg from '../assets/images/chicken.jpg';

/* ═══════ Data / Helpers ═══════ */
const SEED_PRODUCTS = [
  { name: 'Chicken Feed (20kg Bag)', category: 'Feed', min: 18, max: 35, rating: 4.5, reviews: 128, badge: 'Popular' },
  { name: 'Cow Mineral Block', category: 'Supplements', min: 10, max: 25, rating: 4.2, reviews: 67 },
  { name: 'Sheep Hay Bale (50kg)', category: 'Bedding', min: 12, max: 30, rating: 4.7, reviews: 203, badge: 'Best Seller' },
  { name: 'Calf Starter Pellet (10kg)', category: 'Feed', min: 15, max: 28, rating: 4.3, reviews: 45 },
  { name: 'Poultry Starter Crumble (25kg)', category: 'Feed', min: 20, max: 40, rating: 4.6, reviews: 156, badge: 'New' },
  { name: 'Layer Mash (20kg)', category: 'Feed', min: 22, max: 42, rating: 4.4, reviews: 89 },
  { name: 'Beef Cattle Supplement', category: 'Supplements', min: 30, max: 60, rating: 4.1, reviews: 34 },
  { name: 'Goat Mineral Mix (10kg)', category: 'Supplements', min: 12, max: 28, rating: 4.0, reviews: 22 },
  { name: 'Hay Net', category: 'Equipment', min: 8, max: 20, rating: 4.8, reviews: 312, badge: 'Top Rated' },
  { name: 'Silage Wrap (roll)', category: 'Equipment', min: 25, max: 55, rating: 3.9, reviews: 18 },
  { name: 'Livestock Dewormer', category: 'Health', min: 6, max: 25, rating: 4.5, reviews: 76 },
  { name: 'Milk Replacer (20kg)', category: 'Feed', min: 28, max: 60, rating: 4.3, reviews: 54 },
  { name: 'Barn Bedding Straw Bale', category: 'Bedding', min: 6, max: 18, rating: 4.6, reviews: 198 },
  { name: 'Pasture Seeder (kit)', category: 'Equipment', min: 40, max: 120, rating: 4.2, reviews: 41 },
  { name: 'Automatic Waterer (small)', category: 'Equipment', min: 35, max: 150, rating: 4.7, reviews: 167, badge: 'Premium' },
];

const CATEGORIES = ['All', 'Feed', 'Supplements', 'Equipment', 'Bedding', 'Health'];
const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'reviews-desc', label: 'Most Reviewed' },
];

const categoryConfig = {
  Feed: { icon: <MdGrain />, color: 'amber', emoji: '🌾' },
  Supplements: { icon: <FaLeaf />, color: 'emerald', emoji: '💊' },
  Equipment: { icon: <FaBox />, color: 'blue', emoji: '🔧' },
  Bedding: { icon: <MdInventory />, color: 'orange', emoji: '🛏️' },
  Health: { icon: <FaShieldAlt />, color: 'rose', emoji: '🏥' },
  'Agridata sector': { icon: <FaLeaf />, color: 'purple', emoji: '📊' },
};

const getCategoryStyle = (cat) => {
  const c = categoryConfig[cat] || { color: 'gray', emoji: '📦' };
  const colorMap = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' },
  };
  return { ...c, ...(colorMap[c.color] || colorMap.gray) };
};

function randBetween(min, max) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
const formatPrice = (p) => p?.toLocaleString(undefined, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }) ?? '—';

const seededImage = (seed) => {
  const s = String(seed || '').toLowerCase();
  if (/hay|straw|bale|silage/.test(s)) return farm3jpeg;
  if (/plant|plantain|vegetable|fruit|crop/.test(s)) return plantejpg;
  if (/cow|cattle|beef/.test(s)) return cowImg || farm1jpg;
  if (/chicken|poultry|egg/.test(s)) return chickenImg || farm1png;
  if (/sheep|goat/.test(s)) return sheepImg || farm3jpeg;
  if (/dog|puppy|canine/.test(s)) return dogImg || farm1png;
  return farm1jpg;
};

function resolveImage({ name = '', category = '', id = '' } = {}) {
  const n = name.toLowerCase();
  if (/cow|cattle|beef/.test(n)) return cowImg || farm1jpg;
  if (/chicken|poultry|egg/.test(n)) return chickenImg || farm1png;
  if (/sheep|goat/.test(n)) return sheepImg || farm3jpeg;
  if (/dog|puppy|canine/.test(n)) return dogImg || farm1png;
  if (/feed|food|mash|pellet|starter|crumble|replacer/.test(n)) {
    if (/chicken/.test(n)) return chickenfoodImg || farm1png;
    if (/sheep|goat/.test(n)) return foodsheepImg || farm3jpeg;
    if (/cow|cattle|beef/.test(n)) return foodcowImg || farm1jpg;
    if (/dog/.test(n)) return fooddogImg || dogImg || farm1png;
    return farm1jpg;
  }
  if (/hay|straw|bale|silage/.test(n)) return farm3jpeg;
  if (/plant|plantain|vegetable|fruit|crop/.test(n)) return plantejpg;
  if (/feed|supplement/.test(category?.toLowerCase())) return farm1jpg;
  if (/equipment|tool|seeder/.test(category?.toLowerCase())) return farm3jpeg;
  return seededImage(id || name || Math.random());
}

/* ═══════ Toast ═══════ */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600', warning: 'bg-amber-500' };
  const icons = { success: <FaCheckCircle />, error: <FaExclamationTriangle />, info: <FaInfoCircle />, warning: <FaTag /> };
  return (
    <motion.div initial={{ x: 140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 140, opacity: 0 }}
      className={`fixed top-6 right-6 z-[100] ${styles[type]} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><FaTimes size={12} /></button>
    </motion.div>
  );
}

/* ═══════ Skeleton ═══════ */
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`} />;
}

/* ═══════ Star Rating ═══════ */
function StarRating({ rating = 0, reviews = 0, size = 'sm' }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  const sizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={`${sizes[size]} ${
            i < full ? 'text-amber-400' : i === full && partial > 0 ? 'text-amber-300' : 'text-gray-200'
          }`} />
        ))}
      </div>
      <span className="text-[10px] text-gray-400 font-medium">({reviews})</span>
    </div>
  );
}

/* ═══════ Image Carousel ═══════ */
function ImageCarousel({ images = [], alt = '', height = 'h-52' }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (images.length <= 1 || hovering) return;
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % images.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [images, hovering]);

  const prev = (e) => { e.stopPropagation(); setIndex(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIndex(i => (i + 1) % images.length); };

  return (
    <div
      className={`relative ${height} overflow-hidden bg-gray-100 group`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index] || images[0]}
          alt={alt}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow-lg
              flex items-center justify-center text-gray-600 hover:text-gray-900
              opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
            <FaChevronLeft size={12} />
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow-lg
              flex items-center justify-center text-gray-600 hover:text-gray-900
              opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
            <FaChevronRight size={12} />
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'bg-white w-5 shadow-md' : 'bg-white/50 hover:bg-white/80'
                }`} />
            ))}
          </div>
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </div>
  );
}

/* ═══════ Cart Sidebar ═══════ */
function CartSidebar({ cart, onClose, onUpdateQty, onRemove, onClear }) {
  const total = cart.reduce((s, item) => s + (item.price || 0) * item.qty, 0);
  const count = cart.reduce((s, item) => s + item.qty, 0);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <FaShoppingCart className="text-green-600 text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Shopping Cart</h3>
              <p className="text-[11px] text-gray-400">{count} item{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center
              text-gray-400 hover:text-gray-600 transition">
            <MdClose size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FaShoppingBag className="text-4xl text-gray-300 mb-4" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs mt-1">Add products to get started</p>
            </div>
          ) : cart.map(item => (
            <motion.div key={item.id} layout
              className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
              <img src={item.images?.[0] || farm1jpg} alt={item.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
                <p className="text-xs text-gray-400">{item.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg">
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-800 transition"><FaMinus size={8} /></button>
                    <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-800 transition"><FaPlus size={8} /></button>
                  </div>
                  <span className="text-sm font-bold text-green-700">{formatPrice((item.price || 0) * item.qty)}</span>
                </div>
              </div>
              <button onClick={() => onRemove(item.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition self-start"><FaTrash size={12} /></button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between text-base">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-green-700">{formatPrice(total)}</span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl
              text-sm font-bold shadow-md shadow-green-200 hover:shadow-lg transition-all active:scale-[0.98]
              flex items-center justify-center gap-2">
              <FaShoppingBag size={14} /> Checkout
            </button>
            <button onClick={onClear}
              className="w-full text-xs text-gray-500 hover:text-red-500 font-medium transition py-1">
              Clear Cart
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}

/* ═══════ Product Detail Modal ═══════ */
function ProductModal({ product, onClose, onAddToCart, isInCart }) {
  if (!product) return null;
  const catStyle = getCategoryStyle(product.category);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}>

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-lg
              flex items-center justify-center text-gray-500 hover:text-gray-800 transition hover:scale-110">
            <FaTimes size={14} />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-1/2">
              <ImageCarousel images={product.images} alt={product.name} height="h-64 md:h-full" />
            </div>

            {/* Info */}
            <div className="md:w-1/2 p-6 flex flex-col">
              <span className={`self-start text-[10px] font-bold px-2.5 py-1 rounded-full border mb-3 ${catStyle.badge} ${catStyle.border}`}>
                {catStyle.emoji} {product.category}
              </span>

              <h2 className="text-xl font-bold text-gray-800 leading-tight">{product.name}</h2>

              <div className="mt-2">
                <StarRating rating={product.rating || 4} reviews={product.reviews || 0} size="md" />
              </div>

              {product.price != null && (
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-700">{formatPrice(product.price)}</span>
                  {product.unit && <span className="text-sm text-gray-400">/ {product.unit}</span>}
                </div>
              )}

              <p className="mt-4 text-sm text-gray-600 leading-relaxed flex-1">
                {product.description || 'Premium quality farm supply product.'}
              </p>

              {/* Features */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { icon: <FaTruck size={10} />, text: 'Free Shipping' },
                  { icon: <FaShieldAlt size={10} />, text: 'Quality Assured' },
                  { icon: <FaLeaf size={10} />, text: 'Farm Tested' },
                  { icon: <FaPercent size={10} />, text: 'Best Price' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-green-500">{f.icon}</span> {f.text}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => onAddToCart(product)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.97]
                    flex items-center justify-center gap-2 ${
                    isInCart
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200 hover:shadow-lg'
                  }`}>
                  {isInCart ? <><FaCheckCircle size={14} /> In Cart</> : <><FaShoppingCart size={14} /> Add to Cart</>}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════ Product Card ═══════ */
function ProductCard({ product, onAddToCart, onViewDetail, isInCart, isFavorite, onToggleFav, delay = 0 }) {
  const catStyle = getCategoryStyle(product.category);
  const badgeColors = {
    'Popular': 'bg-blue-500', 'Best Seller': 'bg-emerald-500', 'New': 'bg-purple-500',
    'Top Rated': 'bg-amber-500', 'Premium': 'bg-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative">
        <ImageCarousel images={product.images} alt={product.name} height="h-48" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className={`${badgeColors[product.badge] || 'bg-gray-500'} text-white text-[10px] font-bold
              px-2.5 py-1 rounded-full shadow-lg`}>
              {product.badge}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm bg-white/90 ${catStyle.text} ${catStyle.border}`}>
            {catStyle.emoji} {product.category}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5
          opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button onClick={(e) => { e.stopPropagation(); onToggleFav(product.id); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center
              hover:scale-110 transition-all">
            {isFavorite ? <FaHeart className="text-red-500" size={12} /> : <FaRegHeart className="text-gray-500" size={12} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onViewDetail(product); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center
              hover:scale-110 transition-all">
            <FaEye className="text-gray-500" size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>

        <div className="mt-1.5">
          <StarRating rating={product.rating || 4} reviews={product.reviews || 0} />
        </div>

        <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 flex-1 leading-relaxed">
          {product.description || 'High-quality farm supply product.'}
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            {product.price != null ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-green-700">{formatPrice(product.price)}</span>
                {product.unit && <span className="text-[10px] text-gray-400">/{product.unit}</span>}
              </div>
            ) : (
              <span className="text-sm text-gray-400">Price on request</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className={`p-2.5 rounded-xl transition-all duration-300 active:scale-90 ${
              isInCart
                ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-200 hover:shadow-lg hover:scale-105'
            }`}
            title={isInCart ? 'Already in cart' : 'Add to cart'}
          >
            {isInCart ? <FaCheckCircle size={14} /> : <FaPlus size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ MAIN COMPONENT ═══════ */
export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const showToast = useCallback((msg, type = 'info') => setToast({ message: msg, type, key: Date.now() }), []);

  const BACKEND_URL = API_BASE;

  const generate = useCallback((count = 12) => {
    setLoading(true);
    const pool = [...SEED_PRODUCTS].sort(() => 0.5 - Math.random());
    const selected = pool.slice(0, Math.min(count, pool.length)).map(p => {
      const id = (p.name + Math.random()).replace(/\s+/g, '_');
      const primary = resolveImage({ name: p.name, category: p.category, id });
      const imgs = [primary];
      const pn = p.name.toLowerCase();
      if (/cow|cattle|beef/.test(pn) && foodcowImg) imgs.push(foodcowImg);
      if (/chicken/.test(pn) && chickenfoodImg) imgs.push(chickenfoodImg);
      if (/sheep|goat/.test(pn) && foodsheepImg) imgs.push(foodsheepImg);
      if (/dog/.test(pn) && fooddogImg) imgs.push(fooddogImg);
      imgs.push(seededImage(p.name));
      return {
        id, name: p.name, category: p.category,
        price: randBetween(p.min, p.max),
        images: Array.from(new Set(imgs)),
        unit: p.name.match(/\((.*?)\)/)?.[1] || '',
        description: `High-quality ${p.category.toLowerCase()} for farm use. Premium grade, lab-tested for safety and efficacy.`,
        rating: p.rating || 4, reviews: p.reviews || 0, badge: p.badge || null,
      };
    });
    setTimeout(() => { setProducts(selected); setLoading(false); }, 200);
  }, []);

  useEffect(() => {
    const tryLoad = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const r = await fetch(`${BACKEND_URL}/api/products`, { headers });
        if (r.ok) {
          const list = await r.json();
          if (Array.isArray(list) && list.length > 0) {
            setProducts(list.map(p => ({
              ...p,
              price: p.price ?? randBetween(10, 80),
              images: Array.from(new Set([
                p.imageUrl || resolveImage({ name: p.name, category: p.category, id: p.id }),
                seededImage(p.name),
              ].filter(Boolean))),
              rating: p.rating || 4,
              reviews: p.reviews || 0,
              badge: p.badge || null,
              description: p.description || `High-quality ${(p.category || 'farm').toLowerCase()} product.`,
            })));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend fetch failed, using seed data:', err);
      }
      // Fallback to local seed data when backend is unreachable
      generate(12);
    };
    tryLoad();
  }, []);

  /* ── Cart logic ── */
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        showToast(`${product.name} quantity updated`, 'info');
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      showToast(`${product.name} added to cart`, 'success');
      return [...prev, { ...product, qty: 1 }];
    });
  }, [showToast]);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.id !== id)); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, []);

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(i => i.id !== id)), []);
  const clearCart = useCallback(() => { setCart([]); showToast('Cart cleared', 'info'); }, [showToast]);

  const toggleFav = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast('Removed from favorites', 'info'); }
      else { next.add(id); showToast('Added to favorites', 'success'); }
      return next;
    });
  }, [showToast]);

  /* ── Filtered & sorted ── */
  const displayProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      const matchCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchSearch && matchCategory;
    });

    const [field, dir] = sortBy.split('-');
    filtered.sort((a, b) => {
      let va, vb;
      switch (field) {
        case 'name': va = a.name; vb = b.name; return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        case 'price': va = a.price || 0; vb = b.price || 0; return dir === 'asc' ? va - vb : vb - va;
        case 'rating': va = a.rating || 0; vb = b.rating || 0; return vb - va;
        case 'reviews': va = a.reviews || 0; vb = b.reviews || 0; return vb - va;
        default: return 0;
      }
    });
    return filtered;
  }, [products, searchQuery, activeCategory, sortBy]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartIds = new Set(cart.map(i => i.id));

  const stats = useMemo(() => ({
    total: products.length,
    categories: [...new Set(products.map(p => p.category))].length,
    avgPrice: products.filter(p => p.price).length > 0
      ? Math.round(products.filter(p => p.price).reduce((s, p) => s + p.price, 0) / products.filter(p => p.price).length * 100) / 100
      : 0,
    avgRating: products.length > 0
      ? Math.round(products.reduce((s, p) => s + (p.rating || 0), 0) / products.length * 10) / 10
      : 0,
  }), [products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/30 to-neutral-50 p-4 md:p-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <CartSidebar cart={cart} onClose={() => setCartOpen(false)} onUpdateQty={updateQty}
            onRemove={removeFromCart} onClear={clearCart} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart} isInCart={cartIds.has(selectedProduct.id)} />
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* ── Header ── */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl
              flex items-center justify-center shadow-lg shadow-green-200">
              <MdStorefront className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Farm Supplies</h1>
              <p className="text-sm text-gray-500">Quality products for your agricultural needs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => generate(12)} disabled={loading}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg px-4 py-2.5 rounded-xl text-sm font-medium
                text-gray-700 hover:text-green-600 transition-all border border-gray-100 hover:border-green-200 disabled:opacity-50">
              <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600
                text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-green-200
                hover:shadow-lg transition-all active:scale-[0.97]">
              <FaShoppingCart size={14} />
              Cart
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold
                    rounded-full flex items-center justify-center shadow-lg"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </header>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <MdInventory className="text-green-600" />, bg: 'bg-green-100', label: 'Products', value: stats.total },
            { icon: <MdCategory className="text-blue-600" />, bg: 'bg-blue-100', label: 'Categories', value: stats.categories },
            { icon: <MdLocalOffer className="text-amber-600" />, bg: 'bg-amber-100', label: 'Avg. Price', value: formatPrice(stats.avgPrice) },
            { icon: <FaStar className="text-purple-600" />, bg: 'bg-purple-100', label: 'Avg. Rating', value: `${stats.avgRating} ★` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3
                hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center
                group-hover:scale-110 transition-transform duration-200`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-bold text-gray-800">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Promo Banner ── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-200
            flex items-center gap-4 overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute right-12 -bottom-6 w-20 h-20 bg-white/5 rounded-full" />
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaTruck className="text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">Free Shipping on All Orders</h3>
            <p className="text-xs opacity-80 mt-0.5">Quality farm supplies delivered directly to your farm. No minimum order required.</p>
          </div>
          <button className="bg-white text-green-700 px-4 py-2 rounded-xl text-xs font-bold
            hover:shadow-lg transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5">
            Shop Now <MdArrowForward />
          </button>
        </motion.div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 shadow-sm transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-400" size={11} />
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  activeCategory === cat
                    ? 'bg-green-600 text-white shadow-md shadow-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600'
                }`}>
                {cat !== 'All' && getCategoryStyle(cat).emoji} {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-600
              focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 shadow-sm appearance-none
              cursor-pointer min-w-[160px]">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* ── Results Info ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-700">{displayProducts.length}</span> of {products.length} products
            {activeCategory !== 'All' && <span> in <span className="font-bold text-green-600">{activeCategory}</span></span>}
          </p>
          {favorites.size > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FaHeart className="text-red-400" size={10} /> {favorites.size} favorited
            </span>
          )}
        </div>

        {/* ── Products Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaSearch className="text-gray-300 text-2xl" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg">No products found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm text-center">
              Try adjusting your search or filter to find what you're looking for
            </p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="mt-4 text-sm text-green-600 font-semibold hover:underline">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={addToCart}
                onViewDetail={setSelectedProduct}
                isInCart={cartIds.has(p.id)}
                isFavorite={favorites.has(p.id)}
                onToggleFav={toggleFav}
                delay={i * 0.04}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen(!chatbotOpen)}
        context="products_management"
        pageData={{
          products, totalProducts: products.length,
          categories: [...new Set(products.map(p => p.category))],
          priceRange: {
            min: Math.min(...products.map(p => p.price || 0).filter(p => p > 0)),
            max: Math.max(...products.map(p => p.price || 0)),
          },
          availableCategories: CATEGORIES.slice(1),
          loading, cart: cart.length, favorites: favorites.size,
        }}
      />
    </div>
  );
}

