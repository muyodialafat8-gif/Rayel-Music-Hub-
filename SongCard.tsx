import React from 'react';
import { Headphones, Flame, CheckCircle, XCircle, ChevronRight, MessageSquare } from 'lucide-react';
import { Song } from '../types';
import { openWhatsApp, generateDemoRequestMessage, RAYEL_WHATSAPP_BASE_URL } from '../utils/whatsapp';
import { useArtworkUrl } from '../utils/imageStorage';

interface SongCardProps {
  song: Song;
  priority?: boolean;
  onSelect: (song: Song) => void;
  onGetSong: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, priority = false, onSelect, onGetSong }) => {
  const isAvailable = song.status === 'Available';
  const artworkUrl = useArtworkUrl(song.coverUrl || song.coverImage);

  const handleDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    const msg = generateDemoRequestMessage(song);
    openWhatsApp(msg);
  };

  const handleGetSongClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    onGetSong(song);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(song);
    }
  };

  return (
    <div
      id={`song-card-${song.songId}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(song)}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${song.title}, genre ${song.genre}, status ${song.status}`}
      className={`group relative rounded-2xl bg-[#0e121a] border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        isAvailable
          ? 'border-white/10 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1'
          : 'border-red-500/20 opacity-85 hover:border-red-500/30'
      }`}
    >
      {/* Cover Image & Status Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#121622] select-none">
        <img
          src={artworkUrl}
          alt={`${song.title} song cover`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-105 block"
          width={400}
          height={400}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e121a] via-transparent to-black/40" />

        {/* Top Badges (Song ID & Dual Color/Icon/Text Status) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 font-mono text-xs font-bold tracking-wider border border-white/10">
            {song.songId}
          </span>

          {isAvailable ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-500/30 shadow-sm"
              aria-label="Status: Available"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>AVAILABLE</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/90 backdrop-blur-md text-red-300 text-xs font-bold border border-red-500/30 shadow-sm"
              aria-label="Status: Sold"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>SOLD</span>
            </span>
          )}
        </div>

        {/* Quick view overlay hint */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] text-white/90 flex items-center gap-1">
          <span>Inspect Song</span>
          <ChevronRight className="w-3 h-3 text-amber-400" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre & Mood */}
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400/90 mb-1.5 uppercase tracking-wide">
            <span>{song.genre}</span>
            <span className="text-white/20">•</span>
            <span className="text-white/60">{song.mood}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-extrabold text-lg sm:text-xl text-white group-hover:text-amber-300 transition-colors uppercase tracking-tight line-clamp-1 mb-2">
            {song.title}
          </h3>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-white/65 line-clamp-2 leading-relaxed mb-3">
            {song.description}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-white/5 mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Master & Commercial Rights</span>
            <span className="font-display font-black text-base sm:text-lg text-amber-400 tracking-tight">
              {song.price}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Demo button (min 44px touch target) */}
            <button
              id={`listen-demo-${song.songId}`}
              disabled={!isAvailable}
              onClick={handleDemoClick}
              aria-label={`Request ${song.title} demo on WhatsApp`}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isAvailable
                  ? 'bg-white/10 hover:bg-white/15 text-white hover:text-amber-300 border border-white/10 active:scale-95 cursor-pointer'
                  : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
              }`}
              title={isAvailable ? 'Request demo on WhatsApp' : 'Song demo is no longer shared'}
            >
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">LISTEN TO DEMO</span>
            </button>

            {/* Get song button or Contact Rayel when Sold (min 44px touch target) */}
            {isAvailable ? (
              <button
                id={`get-song-${song.songId}`}
                onClick={handleGetSongClick}
                aria-label={`Ask about buying ${song.title}`}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-display font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Flame className="w-3.5 h-3.5 shrink-0 fill-black" />
                <span className="truncate">GET THIS SONG</span>
              </button>
            ) : (
              <a
                id={`contact-rayel-${song.songId}`}
                href={RAYEL_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Song sold. Contact Rayel on WhatsApp regarding ${song.title}`}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-500/30 text-xs font-display font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">CONTACT RAYEL</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
