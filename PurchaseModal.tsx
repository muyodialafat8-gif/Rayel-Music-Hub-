import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, MessageSquare, Check, ShieldCheck, ExternalLink, Loader2, Copy } from 'lucide-react';
import { Song, PurchaseInquiry } from '../types';
import { openWhatsApp, buildWhatsAppUrl, generatePurchaseMessage, RAYEL_WHATSAPP_DISPLAY } from '../utils/whatsapp';
import { useArtworkUrl } from '../utils/imageStorage';
import {
  validateArtistName,
  validatePhone,
  validateEmail,
  validateCountry,
  validateAdditionalMessage,
} from '../utils/validation';

interface PurchaseModalProps {
  song: Song | null;
  onClose: () => void;
}

const COUNTRIES = [
  'Uganda',
  'Kenya',
  'Tanzania',
  'Rwanda',
  'Burundi',
  'South Sudan',
  'Nigeria',
  'Ghana',
  'South Africa',
  'United Kingdom',
  'United States',
  'Canada',
  'Germany',
  'France',
  'Australia',
  'United Arab Emirates',
  'Other Country',
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ song, onClose }) => {
  const artworkUrl = useArtworkUrl(song?.coverUrl || song?.coverImage);
  if (!song) return null;

  const [artistName, setArtistName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [additionalMessage, setAdditionalMessage] = useState('');

  // Per-field validation errors
  const [errors, setErrors] = useState<{
    artistName?: string;
    phone?: string;
    email?: string;
    country?: string;
    message?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleCopyNumber = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(RAYEL_WHATSAPP_DISPLAY);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = RAYEL_WHATSAPP_DISPLAY;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch (err) {
      console.error('Failed to copy number:', err);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      artistName?: string;
      phone?: string;
      email?: string;
      country?: string;
      message?: string;
    } = {};

    // Validate Artist Name
    const nameCheck = validateArtistName(artistName);
    if (!nameCheck.isValid) {
      newErrors.artistName = nameCheck.error;
    }

    // Validate Phone / WhatsApp
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) {
      newErrors.phone = phoneCheck.error;
    }

    // Validate Email (Optional)
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      newErrors.email = emailCheck.error;
    }

    // Validate Country
    const countryCheck = validateCountry(country);
    if (!countryCheck.isValid) {
      newErrors.country = countryCheck.error;
    }

    // Validate Additional Message (Optional, max 500 chars)
    const msgCheck = validateAdditionalMessage(additionalMessage);
    if (!msgCheck.isValid) {
      newErrors.message = msgCheck.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const inquiry: PurchaseInquiry = {
      artistName: nameCheck.value,
      phone: phoneCheck.normalized,
      email: emailCheck.value || undefined,
      country: countryCheck.value,
      songName: song.title,
      songId: song.songId,
      genre: song.genre,
      mood: song.mood,
      price: song.price,
      additionalMessage: msgCheck.value || undefined,
    };

    const message = generatePurchaseMessage(inquiry);
    const url = buildWhatsAppUrl(message);
    setGeneratedUrl(url);

    // Open WhatsApp externally directly in user gesture context
    openWhatsApp(message);
    setIsSubmitting(false);
    setShowFallback(true);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0e121a] border border-amber-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button with large touch target */}
          <button
            id="close-purchase-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            aria-label="Close purchase form"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-5 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold mb-2">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>Purchase & Rights Inquiry</span>
            </div>
            <h2 id="purchase-modal-title" className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              GET THIS SONG
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Submit your artist info to initiate direct purchase and rights agreement with Rayel on WhatsApp.
            </p>
          </div>

          {/* Read-Only Prefilled Song Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5 mb-5">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#121622] shrink-0 aspect-square">
              <img
                src={artworkUrl}
                alt={`${song.title} song cover`}
                className="w-full h-full object-cover aspect-square block"
                width={56}
                height={56}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-bold">{song.songId}</span>
                <span className="text-xs text-white/40">• {song.genre}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">Read-only</span>
              </div>
              <p className="text-sm font-display font-bold text-white truncate uppercase">{song.title}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-white/40 uppercase block">Price</span>
              <span className="font-display font-black text-sm sm:text-base text-amber-400">{song.price}</span>
            </div>
          </div>

          {/* Fallback if WhatsApp didn't open or direct manual chat link */}
          {showFallback && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">
                  WhatsApp couldn't be opened automatically.
                </span>
              </div>
              <p className="text-white/80">
                Chat with Rayel manually: <strong className="font-mono text-emerald-400 font-bold text-sm">{RAYEL_WHATSAPP_DISPLAY}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  id="copy-purchase-number-btn"
                  onClick={handleCopyNumber}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied 0742224328!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white/70" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
                {generatedUrl && (
                  <a
                    id="open-purchase-whatsapp-direct"
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-display font-black text-xs hover:from-emerald-400 hover:to-emerald-500 transition-colors"
                  >
                    <span>Open WhatsApp Directly</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Purchase Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Read-Only Song & Song ID Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="purchase-song-name"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Song <span className="text-white/40 font-normal">(Read-only)</span>
                </label>
                <input
                  id="purchase-song-name"
                  type="text"
                  readOnly
                  value={song.title}
                  tabIndex={-1}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 font-semibold cursor-not-allowed select-none text-base sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="purchase-song-id"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Song ID <span className="text-white/40 font-normal">(Read-only)</span>
                </label>
                <input
                  id="purchase-song-id"
                  type="text"
                  readOnly
                  value={song.songId}
                  tabIndex={-1}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-amber-400 font-mono font-bold cursor-not-allowed select-none text-base sm:text-sm"
                />
              </div>
            </div>

            {/* Artist Name */}
            <div>
              <label
                htmlFor="purchase-artist-name"
                className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
              >
                Artist Name / Stage Name <span className="text-amber-400" aria-hidden="true">*</span>
              </label>
              <input
                id="purchase-artist-name"
                type="text"
                required
                maxLength={80}
                value={artistName}
                onChange={(e) => {
                  setArtistName(e.target.value);
                  if (errors.artistName) setErrors((prev) => ({ ...prev, artistName: undefined }));
                }}
                placeholder="e.g. Eddy Prince or Rayel Duo"
                aria-invalid={!!errors.artistName}
                aria-describedby={errors.artistName ? 'purchase-artist-name-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  errors.artistName ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                }`}
              />
              {errors.artistName && (
                <p id="purchase-artist-name-error" className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.artistName}
                </p>
              )}
            </div>

            {/* Phone & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone / WhatsApp */}
              <div>
                <label
                  htmlFor="purchase-phone"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Phone / WhatsApp <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="purchase-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="e.g. +256 7XXXXXXXX"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'purchase-phone-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    errors.phone ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {errors.phone && (
                  <p id="purchase-phone-error" className="mt-1.5 text-xs text-red-400 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Country dropdown */}
              <div>
                <label
                  htmlFor="purchase-country"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Country <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <select
                  id="purchase-country"
                  required
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
                  }}
                  aria-invalid={!!errors.country}
                  aria-describedby={errors.country ? 'purchase-country-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-[#121622] border text-white text-base sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    errors.country ? 'border-red-500' : 'border-white/10 focus:border-amber-400'
                  }`}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p id="purchase-country-error" className="mt-1.5 text-xs text-red-400 font-medium">
                    {errors.country}
                  </p>
                )}
              </div>
            </div>

            {/* Email Address (Optional) */}
            <div>
              <label
                htmlFor="purchase-email"
                className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
              >
                Email Address <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <input
                id="purchase-email"
                type="email"
                maxLength={150}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="artist@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'purchase-email-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  errors.email ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                }`}
              />
              {errors.email && (
                <p id="purchase-email-error" className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Additional Message (Optional, max 500 chars) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="purchase-message"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider"
                >
                  Additional Message <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <span className={`text-[11px] ${additionalMessage.length > 500 ? 'text-red-400 font-bold' : 'text-white/40'}`}>
                  {additionalMessage.length}/500
                </span>
              </div>
              <textarea
                id="purchase-message"
                rows={3}
                maxLength={500}
                value={additionalMessage}
                onChange={(e) => {
                  setAdditionalMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                }}
                placeholder="Specific key adjustments, exclusivity confirmation, delivery timeline..."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'purchase-message-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  errors.message ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                }`}
              />
              {errors.message && (
                <p id="purchase-message-error" className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Direct WhatsApp Assurance */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                No online credit card checkout needed. Purchase terms and transfer are concluded directly via WhatsApp ({RAYEL_WHATSAPP_DISPLAY}).
              </span>
            </div>

            {/* Submit button */}
            <button
              id="submit-purchase-to-rayel-btn"
              type="submit"
              disabled={isSubmitting}
              aria-label={`Ask about buying ${song.title}`}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening WhatsApp…</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>ASK ABOUT BUYING {song.title.toUpperCase()}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
