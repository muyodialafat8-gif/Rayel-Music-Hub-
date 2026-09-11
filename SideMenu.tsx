import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, Music, Flame, PenTool, Info, MessageSquare, ShieldCheck, Lock } from 'lucide-react';
import { RAYEL_WHATSAPP_DISPLAY, RAYEL_WHATSAPP_BASE_URL } from '../utils/whatsapp';
import { ActiveTab } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAdmin: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  onOpenAdmin,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'songs', label: 'Songs Catalogue', icon: Music, emoji: '🎵' },
    { id: 'featured', label: 'Featured Songs', icon: Flame, emoji: '🔥' },
    { id: 'custom', label: 'Request Custom Song', icon: PenTool, emoji: '✍️' },
    { id: 'about', label: 'About Rayel', icon: Info, emoji: 'ℹ️' },
    { id: 'admin', label: 'Admin Portal', icon: Lock, emoji: '🔐' },
  ] as const;

  const handleSelect = (tab: ActiveTab) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[#0d1017] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-xl tracking-wider text-white">
                    RAYEL <span className="text-amber-400">MUSIC HUB</span>
                  </h2>
                  <p className="text-[11px] uppercase tracking-widest text-white/50 mt-0.5">
                    YOUR STORY. OUR WORDS. YOUR HIT.
                  </p>
                </div>
                <button
                  id="close-sidemenu-btn"
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu items */}
              <nav aria-label="Main menu" className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`menu-item-${item.id}`}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full min-h-[44px] flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg leading-none" aria-hidden="true">{item.emoji}</span>
                      <span className="text-base font-display">{item.label}</span>
                      {item.id === 'featured' && (
                        <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Hot
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* WhatsApp Rayel direct in menu */}
                <a
                  id="menu-item-whatsapp"
                  href={RAYEL_WHATSAPP_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  aria-label="Chat with Rayel on WhatsApp"
                  className="w-full min-h-[48px] flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all mt-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span className="text-lg leading-none" aria-hidden="true">📱</span>
                  <span className="text-base font-display font-semibold">WhatsApp Rayel</span>
                </a>
              </nav>
            </div>

            {/* Bottom info & WhatsApp conversion box */}
            <div className="p-6 border-t border-white/10 bg-[#0a0c12]/60 space-y-4">
              <div className="rounded-2xl p-4 bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 text-center">
                <p className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold">
                  Direct Songwriter Contact
                </p>
                <p className="font-display font-black text-xl text-white tracking-wider my-1">
                  {RAYEL_WHATSAPP_DISPLAY}
                </p>
                <p className="text-xs text-white/60 mb-3">
                  Ask for song demos, discuss custom writing & close orders directly.
                </p>
                <a
                  id="sidemenu-chat-whatsapp-btn"
                  href={RAYEL_WHATSAPP_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  aria-label="Chat with Rayel on WhatsApp"
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>Chat with Rayel on WhatsApp</span>
                </a>
              </div>

              {/* Admin Portal link & protection note */}
              <div className="flex items-center justify-between text-xs text-white/40 pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500/60" />
                  <span>Protected Demos & Rights</span>
                </div>
                <button
                  id="sidemenu-admin-btn"
                  onClick={() => {
                    onOpenAdmin();
                    onClose();
                  }}
                  aria-label="Open Catalogue Admin Management Portal"
                  className="flex items-center gap-1 hover:text-white/80 transition-colors py-2 px-2.5 rounded min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
