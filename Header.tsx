import React from 'react';
import { Menu, Search, MessageSquare, Flame, Lock } from 'lucide-react';
import { RAYEL_WHATSAPP_DISPLAY, RAYEL_WHATSAPP_BASE_URL } from '../utils/whatsapp';
import { ActiveTab } from '../types';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenSearch,
  activeTab,
  onNavigate,
}) => {
  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 w-full bg-[#090b10]/90 backdrop-blur-md border-b border-white/5 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <button
          id="brand-logo-btn"
          onClick={() => onNavigate('home')}
          aria-label="Rayel Music Hub - Go to Home"
          className="min-h-[44px] flex items-center gap-3 text-left group rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span>R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-white flex items-center gap-1.5">
              RAYEL <span className="text-amber-400">MUSIC HUB</span>
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 font-medium hidden xs:inline">
              YOUR STORY. OUR WORDS. YOUR HIT.
            </span>
          </div>
        </button>

        {/* Desktop Quick Nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-white/70">
          <button
            id="nav-home-btn"
            onClick={() => onNavigate('home')}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              activeTab === 'home' ? 'text-amber-400 bg-white/5 font-semibold' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            id="nav-songs-btn"
            onClick={() => onNavigate('songs')}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              activeTab === 'songs' ? 'text-amber-400 bg-white/5 font-semibold' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Songs
          </button>
          <button
            id="nav-featured-btn"
            onClick={() => onNavigate('featured')}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              activeTab === 'featured' ? 'text-amber-400 bg-white/5 font-semibold' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Featured
          </button>
          <button
            id="nav-custom-btn"
            onClick={() => onNavigate('custom')}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              activeTab === 'custom' ? 'text-amber-400 bg-white/5 font-semibold' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Custom Song
          </button>
          <button
            id="nav-about-btn"
            onClick={() => onNavigate('about')}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              activeTab === 'about' ? 'text-amber-400 bg-white/5 font-semibold' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            About
          </button>
          <button
            id="nav-admin-btn"
            onClick={() => onNavigate('admin')}
            aria-label="Rayel Admin Portal (/admin)"
            className={`min-h-[44px] px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              activeTab === 'admin' ? 'text-amber-400 bg-white/5 font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Actions (Search, WhatsApp direct, Menu Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title="Search original songs"
            aria-label="Search original songs"
          >
            <Search className="w-5 h-5" />
          </button>

          <a
            id="header-whatsapp-btn"
            href={RAYEL_WHATSAPP_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Rayel on WhatsApp"
            className="hidden sm:inline-flex min-h-[44px] items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <MessageSquare className="w-4 h-4 fill-emerald-400/20" />
            <span>{RAYEL_WHATSAPP_DISPLAY}</span>
          </a>

          <button
            id="header-menu-btn"
            onClick={onOpenMenu}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center gap-2 cursor-pointer"
            aria-label="Open side navigation menu"
          >
            <Menu className="w-5 h-5" />
            <span className="hidden xs:inline text-xs font-semibold uppercase tracking-wider">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
