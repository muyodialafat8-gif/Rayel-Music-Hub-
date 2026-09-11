import React from 'react';
import { Music, PenTool, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section
      id="hero-section"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121622] via-[#0d1018] to-[#151926] border border-white/10 shadow-2xl my-4 sm:my-6 mx-4 sm:mx-6 lg:mx-8"
    >
      {/* Background ambient lighting and subtle vinyl / soundwave overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.07] bg-repeat"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="relative px-5 py-8 sm:px-10 sm:py-12 lg:py-14 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10">
        {/* Left copy & CTA buttons */}
        <div className="flex-1 text-center md:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>African Songwriting Showroom</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1] mb-3">
            YOUR NEXT HIT <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              IS WAITING.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 font-normal max-w-xl mb-6 leading-relaxed">
            Original songs written for artists ready to make their mark. Discover ready-to-record hits, request full demos via WhatsApp, or commission custom writing tailored to your voice.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              id="hero-explore-songs-btn"
              onClick={() => onNavigate('songs')}
              aria-label="Explore songs in catalogue"
              className="min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Music className="w-4 h-4 text-black" />
              <span>EXPLORE SONGS</span>
            </button>

            <button
              id="hero-custom-song-btn"
              onClick={() => onNavigate('custom')}
              aria-label="Request a bespoke custom song"
              className="min-h-[48px] px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-display font-semibold text-sm sm:text-base flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <PenTool className="w-4 h-4 text-amber-400" />
              <span>REQUEST A CUSTOM SONG</span>
            </button>
          </div>
        </div>

        {/* Right side compact feature pill / trust card */}
        <div className="w-full md:w-72 shrink-0 bg-[#0a0c12]/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">The Rayel Rule</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Direct Access
            </span>
          </div>

          <div className="space-y-2 text-xs text-white/80">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Full demo delivery directly via WhatsApp</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>100% original, unreleased melodies & lyrics</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Exclusive master & commercial songwriting transfer</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-white/40">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Protected catalogue — no public audio leaks</span>
          </div>
        </div>
      </div>
    </section>
  );
};
