/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSongCatalogue } from './hooks/useSongCatalogue';
import { ActiveTab, Song } from './types';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroSection } from './components/HeroSection';
import { FeaturedSongsSection } from './components/FeaturedSongsSection';
import { SongCatalogueSection } from './components/SongCatalogueSection';
import { CustomSongSection } from './components/CustomSongSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { DeveloperCreditBanner } from './components/DeveloperCreditBanner';
import { SongDetailsModal } from './components/SongDetailsModal';
import { PurchaseModal } from './components/PurchaseModal';
import { AdminPortal } from './components/AdminPortal';
import { WhatsAppFallbackModal } from './components/WhatsAppFallbackModal';
import { MessageSquare, ArrowUp } from 'lucide-react';
import { RAYEL_WHATSAPP_DISPLAY, RAYEL_WHATSAPP_BASE_URL } from './utils/whatsapp';

export default function App() {
  const {
    songs,
    addSong,
    updateSong,
    deleteSong,
    markSold,
    markAvailable,
    featureSong,
    unfeatureSong,
    toggleStatus,
    toggleFeatured,
    resetToDefault,
  } = useSongCatalogue();

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#admin' || path.startsWith('/admin/')) {
        return 'admin';
      }
    }
    return 'home';
  });

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [purchaseSong, setPurchaseSong] = useState<Song | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Sync browser back/forward buttons with admin route
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync URL bar when activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeTab === 'admin') {
        if (window.location.pathname !== '/admin' && window.location.hash !== '#admin') {
          window.history.pushState(null, '', '/admin');
        }
      } else if (activeTab === 'home') {
        if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
          window.history.pushState(null, '', '/');
        }
      }
    }
  }, [activeTab]);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'admin') {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } else {
        if (window.location.pathname === '/admin') {
          window.history.pushState(null, '', '/');
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSearch = () => {
    setActiveTab('songs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const searchInput = document.getElementById('catalogue-search-input');
      searchInput?.focus();
    }, 200);
  };

  const handleOpenGetSong = (song: Song) => {
    setSelectedSong(null);
    setPurchaseSong(song);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (activeTab === 'admin') {
    return (
      <AdminPortal
        songs={songs}
        onAddSong={addSong}
        onUpdateSong={updateSong}
        onDeleteSong={deleteSong}
        onToggleStatus={toggleStatus}
        onToggleFeatured={toggleFeatured}
        onMarkSold={markSold}
        onMarkAvailable={markAvailable}
        onFeatureSong={featureSong}
        onUnfeatureSong={unfeatureSong}
        onResetCatalogue={resetToDefault}
        onClose={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-[#f1f3f7] flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <Header
        onOpenMenu={() => setIsSideMenuOpen(true)}
        onOpenSearch={handleOpenSearch}
        activeTab={activeTab}
        onNavigate={handleNavigate}
      />

      {/* Side Menu Drawer */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenAdmin={() => handleNavigate('admin')}
      />

      {/* Main Content Areas with mobile bottom navigation offset */}
      <main className="flex-1 pb-28 md:pb-12">
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <HeroSection onNavigate={handleNavigate} />

            {/* Featured Songs Section */}
            <FeaturedSongsSection
              songs={songs}
              onSelectSong={(song) => setSelectedSong(song)}
              onGetSong={handleOpenGetSong}
              onNavigate={handleNavigate}
            />

            {/* Custom Song Highlight Teaser */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141824] to-[#0c0e14] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Bespoke Songwriting Service
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase">
                    CAN'T FIND THE RIGHT SONG? WE'LL WRITE IT FOR YOU.
                  </h3>
                  <p className="text-xs sm:text-sm text-white/65 mt-1 max-w-xl">
                    Commission an original song created specifically around your vocal tone, story, or genre preference.
                  </p>
                </div>
                <button
                  id="home-request-custom-btn"
                  onClick={() => handleNavigate('custom')}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 shrink-0 transition-all active:scale-95"
                >
                  REQUEST CUSTOM SONG
                </button>
              </div>
            </section>

            {/* Contact / WhatsApp Section */}
            <ContactSection />
          </>
        )}

        {activeTab === 'songs' && (
          <SongCatalogueSection
            songs={songs}
            onSelectSong={(song) => setSelectedSong(song)}
            onGetSong={handleOpenGetSong}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'featured' && (
          <div className="pt-2">
            <FeaturedSongsSection
              songs={songs}
              onSelectSong={(song) => setSelectedSong(song)}
              onGetSong={handleOpenGetSong}
              onNavigate={handleNavigate}
            />
            {/* Direct prompt to explore non-featured or custom */}
            <div className="max-w-3xl mx-auto text-center px-4 mb-16">
              <p className="text-xs text-white/50 mb-3">Looking for more styles or upcoming unreleased concepts?</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleNavigate('songs')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  View All Songs
                </button>
                <button
                  onClick={() => handleNavigate('custom')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs"
                >
                  Commission Custom Hit
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <CustomSongSection />
        )}

        {activeTab === 'about' && (
          <AboutSection onNavigate={handleNavigate} />
        )}

        {activeTab === 'contact' && (
          <ContactSection />
        )}
      </main>

      {/* Persistent Floating WhatsApp quick trigger on Desktop */}
      <aside aria-label="Quick WhatsApp Contact" className="hidden md:block fixed bottom-6 right-6 z-30">
        <a
          id="floating-whatsapp-btn"
          href={RAYEL_WHATSAPP_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-display font-black text-xs shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all border border-emerald-400/40 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title="Direct WhatsApp: 0742224328"
          aria-label="Chat with Rayel on WhatsApp"
        >
          <MessageSquare className="w-4 h-4 fill-black" />
          <span>Chat on WhatsApp ({RAYEL_WHATSAPP_DISPLAY})</span>
        </a>
      </aside>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          id="back-to-top-btn"
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-20 right-6 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all shadow-lg"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Mobile Bottom Navigation (Home | Songs | Custom | WhatsApp) */}
      <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} />

      {/* Modals */}
      <SongDetailsModal
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
        onGetSong={handleOpenGetSong}
      />

      <PurchaseModal
        song={purchaseSong}
        onClose={() => setPurchaseSong(null)}
      />

      <WhatsAppFallbackModal />

      {/* Developer Credit Banner */}
      <DeveloperCreditBanner />

      {/* Footer */}
      <Footer onOpenAdmin={() => handleNavigate('admin')} />
    </div>
  );
}
