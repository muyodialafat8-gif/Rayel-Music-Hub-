import React, { useState, useMemo } from 'react';
import { Search, X, Music, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { Song, ActiveTab } from '../types';
import { SongCard } from './SongCard';

interface SongCatalogueSectionProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onGetSong: (song: Song) => void;
  onNavigate: (tab: ActiveTab) => void;
  initialSearchQuery?: string;
}

export const SongCatalogueSection: React.FC<SongCatalogueSectionProps> = ({
  songs,
  onSelectSong,
  onGetSong,
  onNavigate,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');

  // Lightweight filter tags as specified in prompt:
  // ALL | AFROBEAT | AMAPIANO | LOVE | EMOTIONAL | DANCE
  const filterTags = [
    { label: 'ALL', id: 'ALL' },
    { label: 'AFROBEAT', id: 'AFROBEAT' },
    { label: 'AMAPIANO', id: 'AMAPIANO' },
    { label: 'LOVE', id: 'LOVE' },
    { label: 'EMOTIONAL', id: 'EMOTIONAL' },
    { label: 'DANCE', id: 'DANCE' },
  ];

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      // Search query match (title, genre, mood, language, songId, description)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        song.title.toLowerCase().includes(q) ||
        song.genre.toLowerCase().includes(q) ||
        song.mood.toLowerCase().includes(q) ||
        song.language.toLowerCase().includes(q) ||
        song.songId.toLowerCase().includes(q) ||
        song.description.toLowerCase().includes(q);

      // Lightweight filter tags match
      let matchesTag = true;
      if (selectedFilter === 'AFROBEAT') {
        matchesTag = song.genre.toLowerCase().includes('afrobeat') || song.genre.toLowerCase().includes('afro');
      } else if (selectedFilter === 'AMAPIANO') {
        matchesTag = song.genre.toLowerCase().includes('amapiano');
      } else if (selectedFilter === 'LOVE') {
        matchesTag =
          song.mood.toLowerCase().includes('romantic') ||
          song.mood.toLowerCase().includes('love') ||
          song.title.toLowerCase().includes('love');
      } else if (selectedFilter === 'EMOTIONAL') {
        matchesTag =
          song.mood.toLowerCase().includes('emotional') ||
          song.mood.toLowerCase().includes('heartbreak') ||
          song.mood.toLowerCase().includes('uplifting') ||
          song.mood.toLowerCase().includes('heartfelt');
      } else if (selectedFilter === 'DANCE') {
        matchesTag =
          song.mood.toLowerCase().includes('dance') ||
          song.mood.toLowerCase().includes('party') ||
          song.genre.toLowerCase().includes('dancehall') ||
          song.genre.toLowerCase().includes('amapiano');
      }

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'AVAILABLE') {
        matchesStatus = song.status === 'Available';
      } else if (statusFilter === 'SOLD') {
        matchesStatus = song.status === 'Sold';
      }

      return matchesSearch && matchesTag && matchesStatus;
    });
  }, [songs, searchQuery, selectedFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <section id="song-catalogue-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12 scroll-mt-24">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Music className="w-3.5 h-3.5" />
            <span>Complete Showroom</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-tight">
            ORIGINAL SONG CATALOGUE
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Browse ready compositions. Connect with Rayel on WhatsApp to receive the evaluation demo.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 self-start md:self-auto">
          <button
            id="status-filter-all"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-amber-500 text-black shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All ({songs.length})
          </button>
          <button
            id="status-filter-available"
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Available ({songs.filter((s) => s.status === 'Available').length})
          </button>
          <button
            id="status-filter-sold"
            onClick={() => setStatusFilter('SOLD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'SOLD'
                ? 'bg-red-500 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Sold ({songs.filter((s) => s.status === 'Sold').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <label htmlFor="catalogue-search-input" className="sr-only">
          Search original songs catalogue
        </label>
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-white/40 pointer-events-none" />
          <input
            id="catalogue-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by song title, genre (Afrobeat, Amapiano), mood, language..."
            aria-label="Search original songs catalogue by title, genre, mood, or language"
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#0f131c] border border-white/10 text-white placeholder-white/40 text-base sm:text-sm focus:outline-none focus:border-amber-400/80 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              className="absolute right-3.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lightweight Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        <span className="text-xs uppercase tracking-wider text-white/40 font-semibold shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {filterTags.map((tag) => {
          const isSelected = selectedFilter === tag.id;
          return (
            <button
              key={tag.id}
              id={`filter-tag-${tag.id.toLowerCase()}`}
              onClick={() => setSelectedFilter(tag.id)}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold tracking-wide whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Song Cards Grid or Empty State */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredSongs.map((song, index) => (
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
        /* Empty State as requested in Section 26 */
        <div className="p-8 sm:p-14 rounded-3xl bg-[#0e121a] border border-white/10 text-center max-w-xl mx-auto my-8 shadow-xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight mb-2">
            NO SONGS FOUND.
          </h3>
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            Can't find what you're looking for? Rayel can compose an original song specifically for your voice, style, and concept.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="empty-clear-filters-btn"
              onClick={clearFilters}
              aria-label="Reset all search filters"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Reset Filters
            </button>
            <button
              id="empty-request-custom-btn"
              onClick={() => onNavigate('custom')}
              aria-label="Request a custom song"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              REQUEST A CUSTOM SONG
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
