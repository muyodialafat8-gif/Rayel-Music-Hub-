import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Headphones, Flame, ShieldAlert, Sparkles, CheckCircle2, XCircle, Music, MessageSquare } from 'lucide-react';
import { Song } from '../types';
import { openWhatsApp, generateDemoRequestMessage, RAYEL_WHATSAPP_BASE_URL } from '../utils/whatsapp';
import { useArtworkUrl } from '../utils/imageStorage';

interface SongDetailsModalProps {
  song: Song | null;
  onClose: () => void;
  onGetSong: (song: Song) => void;
}

export const SongDetailsModal: React.FC<SongDetailsModalProps> = ({ song, onClose, onGetSong }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const artworkUrl = useArtworkUrl(song?.coverUrl || song?.coverImage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!song) return null;

  const isAvailable = song.status === 'Available';

  const handleDemoClick = () => {
    if (!isAvailable) return;
    const msg = generateDemoRequestMessage(song);
    openWhatsApp(msg);
  };

  const handleGetSongClick = () => {
    if (!isAvailable) return;
    onGetSong(song);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="song-detail-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0e121a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 my-6 max-h-[90vh] flex flex-col"
        >
          {/* Close button (min 44x44px) */}
          <button
            id="close-song-detail-modal-btn"
            onClick={onClose}
            aria-label="Close song details"
            className="absolute top-4 right-4 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Top Showcase: Artwork + Info Header */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
              {/* Cover Artwork (1:1 aspect ratio) */}
              <div className="relative w-full max-w-[260px] sm:max-w-none sm:w-52 aspect-square rounded-2xl overflow-hidden bg-[#121622] shrink-0 border border-white/10 shadow-lg mx-auto sm:mx-0 select-none">
                <img
                  src={artworkUrl}
                  alt={`${song.title} song cover`}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover aspect-square block"
                  width={300}
                  height={300}
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-400 font-mono text-[11px] font-bold border border-white/10">
                    {song.songId}
                  </span>
                </div>
              </div>

              {/* Header Details */}
              <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                <div className="flex items-center gap-2 mb-2">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      AVAILABLE FOR EXCLUSIVE PURCHASE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 text-xs font-bold border border-red-500/30">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      SOLD EXCLUSIVELY
                    </span>
                  )}
                </div>

                <h2 id="song-detail-modal-title" className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
                  {song.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/70 mt-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-300 font-medium">
                    {song.genre}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-medium">
                    {song.mood}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60">
                    {song.language}
                  </span>
                </div>
              </div>
            </div>

            {/* Song Story / Description */}
            <div className="space-y-2 bg-[#121622]/60 rounded-2xl p-4 sm:p-5 border border-white/5">
              <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Composition Concept & Story</span>
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {song.description}
              </p>
            </div>

            {/* Song Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] text-white/40 uppercase tracking-wider block">Composition Rights</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">100% Exclusive Master</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] text-white/40 uppercase tracking-wider block">Deliverables</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">Guide Track & Stems</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-white/40 uppercase tracking-wider block">Catalogue ID</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 mt-0.5 block">{song.songId}</span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-white/60 uppercase tracking-wider font-semibold block">Official Catalogue Valuation</span>
                <span className="text-xs text-amber-300/80">Includes commercial release waiver & transfer documentation</span>
              </div>
              <span className="font-display font-black text-xl sm:text-2xl text-amber-400">
                {song.price}
              </span>
            </div>

            {/* Action Buttons & Protection Note */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Demo Button (min 44px) */}
                <button
                  id="modal-request-demo-btn"
                  disabled={!isAvailable}
                  onClick={handleDemoClick}
                  aria-label={`Request ${song.title} demo on WhatsApp`}
                  className={`min-h-[48px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isAvailable
                      ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:text-amber-300 active:scale-95 cursor-pointer'
                      : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>REQUEST DEMO ON WHATSAPP</span>
                </button>

                {/* Purchase Button or Contact Rayel when Sold (min 44px) */}
                {isAvailable ? (
                  <button
                    id="modal-get-song-btn"
                    onClick={handleGetSongClick}
                    aria-label={`Ask about buying ${song.title}`}
                    className="min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Flame className="w-4 h-4 fill-black" />
                    <span>GET THIS SONG</span>
                  </button>
                ) : (
                  <a
                    id="modal-contact-rayel-btn"
                    href={RAYEL_WHATSAPP_BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Song sold. Contact Rayel on WhatsApp regarding ${song.title}`}
                    className="min-h-[48px] py-3 px-4 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-500/30 font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>CONTACT RAYEL</span>
                  </a>
                )}
              </div>

              {/* Protection note */}
              <div className="flex items-start gap-2.5 text-xs text-white/50 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                <ShieldAlert className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
                <span>
                  Rayel Music Hub does not stream demos on public pages to safeguard original melodies and lyrics. When you tap request demo, Rayel connects directly with you on WhatsApp.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
