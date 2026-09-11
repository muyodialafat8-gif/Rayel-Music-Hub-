import React from 'react';
import { Home, Music, PenTool, MessageSquare } from 'lucide-react';
import { ActiveTab } from '../types';
import { RAYEL_WHATSAPP_BASE_URL } from '../utils/whatsapp';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigate,
}) => {
  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0c12]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 pb-safe"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          id="mobile-nav-home"
          onClick={() => onNavigate('home')}
          aria-label="Navigate to Home"
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Home</span>
        </button>

        {/* Songs */}
        <button
          id="mobile-nav-songs"
          onClick={() => onNavigate('songs')}
          aria-label="Navigate to Songs Catalogue"
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            activeTab === 'songs' || activeTab === 'featured' ? 'text-amber-400 font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          <Music className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Songs</span>
        </button>

        {/* Custom Song */}
        <button
          id="mobile-nav-custom"
          onClick={() => onNavigate('custom')}
          aria-label="Navigate to Custom Song Request"
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            activeTab === 'custom' ? 'text-amber-400 font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          <PenTool className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Custom</span>
        </button>

        {/* WhatsApp Highlighted Button */}
        <a
          id="mobile-nav-whatsapp"
          href={RAYEL_WHATSAPP_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Rayel on WhatsApp"
          className="min-h-[44px] min-w-[56px] flex flex-col items-center justify-center py-1 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <MessageSquare className="w-5 h-5 fill-black mb-0.5" />
          <span className="text-[11px] font-extrabold tracking-tight">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
};
