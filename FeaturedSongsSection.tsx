import React from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { Song, ActiveTab } from '../types';
import { SongCard } from './SongCard';

interface FeaturedSongsSectionProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onGetSong: (song: Song) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const FeaturedSongsSection: React.FC<FeaturedSongsSectionProps> = ({
  songs,
  onSelectSong,
  onGetSong,
  onNavigate,
}) => {
  const featuredList = songs.filter((s) => s.featured);

  return (
    <section id="featured-songs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-14 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Curated Releases</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight uppercase">
            SONGS WAITING FOR A VOICE.
          </h2>
          <p className="text-sm sm:text-base text-white/65 mt-1 max-w-xl">
            Discover original songs created for artists looking for something special.
          </p>
        </div>

        <button
          id="view-all-catalogue-btn"
          onClick={() => onNavigate('songs')}
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors shrink-0"
        >
          <span>Browse Full Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of featured songs */}
      {featuredList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {featuredList.map((song, index) => (
            <SongCard
              key={song.songId}
              song={song}
              priority={index < 4}
              onSelect={onSelectSong}
              onGetSong={onGetSong}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-white/60 text-sm">No songs currently marked as featured.</p>
        </div>
      )}
    </section>
  );
};
