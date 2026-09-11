import React from 'react';
import { Sparkles, MessageSquare, ShieldCheck, CheckCircle2, Music, Award, ArrowRight } from 'lucide-react';
import { RAYEL_WHATSAPP_DISPLAY } from '../utils/whatsapp';
import { ActiveTab } from '../types';

interface AboutSectionProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate }) => {
  return (
    <section id="about-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-12 sm:my-16 scroll-mt-24">
      {/* Brand Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>African Songwriting House</span>
        </div>

        <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase mb-3">
          RAYEL MUSIC HUB
        </h2>

        <p className="font-display font-black text-lg sm:text-xl text-amber-400 tracking-wider uppercase mb-4">
          YOUR STORY. OUR WORDS. YOUR HIT.
        </p>

        <p className="text-sm sm:text-base text-white/75 leading-relaxed">
          Rayel Music Hub is a premier songwriting showroom built for artists, vocalists, and producers ready to own commercial-grade African hits. We compose original, rhythm-driven songs across Afrobeat, Amapiano, Afro-Soul, and Bongo Flava — crafted ready for your studio recording session.
        </p>
      </div>

      {/* 4-Step Customer Journey */}
      <div className="rounded-3xl bg-[#0e121a] border border-white/10 p-6 sm:p-10 mb-12">
        <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase text-center mb-8">
          HOW RAYEL MUSIC HUB WORKS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative">
            <span className="text-amber-500 font-mono font-black text-3xl opacity-40 block mb-2">01</span>
            <h4 className="font-display font-bold text-base text-white uppercase mb-1.5">
              1. Discover
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Explore our curated catalogue of ready original songs, complete with genre, mood, and fixed prices.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative">
            <span className="text-amber-500 font-mono font-black text-3xl opacity-40 block mb-2">02</span>
            <h4 className="font-display font-bold text-base text-white uppercase mb-1.5">
              2. Demo on WhatsApp
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Tap "Listen to Demo". Rayel personally sends the recorded vocal guide & beat snippet directly to your WhatsApp.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative">
            <span className="text-amber-500 font-mono font-black text-3xl opacity-40 block mb-2">03</span>
            <h4 className="font-display font-bold text-base text-white uppercase mb-1.5">
              3. Refine & Customise
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Discuss vocal keys, language tweaks, or bespoke verse adjustments directly with Rayel to match your tone.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative">
            <span className="text-amber-500 font-mono font-black text-3xl opacity-40 block mb-2">04</span>
            <h4 className="font-display font-bold text-base text-white uppercase mb-1.5">
              4. Transfer Rights
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Finalise agreement, receive full songwriting release documents, and the song is marked SOLD exclusively.
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy and Song Protection Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121622] to-[#0c0e14] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-bold text-amber-400 mb-2">
              <Award className="w-4 h-4" />
              <span>Artist-First Philosophy</span>
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase mb-3">
              Why We Keep Demos On WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed space-y-2">
              Streaming websites expose melody ideas to unauthorized rippers and copycats before an artist has time to record and release them. 
              <br /><br />
              At Rayel Music Hub, your creative safety is paramount: no public MP3 links, no public lyric scraps, no public stems. You receive a direct evaluation demo with personal songwriting consultation.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/50">Direct Songwriter Line:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{RAYEL_WHATSAPP_DISPLAY}</span>
          </div>
        </div>

        {/* Legal & Song Protection Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0c12] border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-bold text-amber-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Legal Copyright Protection</span>
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase mb-3">
              Song Rights & Intellectual Property
            </h3>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-white/70 leading-relaxed mb-4">
              © Rayel Music Hub. All songs, concepts and songwriting materials are protected. Demos are provided for evaluation only. Unauthorized copying, redistribution or commercial use is prohibited. Rights and usage terms are agreed directly with Rayel Music Hub before purchase.
            </div>
            <div className="space-y-1.5 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Exclusive transfer upon purchase (marked SOLD)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Written song split sheets & release documentation</span>
              </div>
            </div>
          </div>

          <button
            id="about-explore-catalogue-btn"
            onClick={() => onNavigate('songs')}
            aria-label="Explore original songs in catalogue"
            className="mt-6 w-full min-h-[44px] py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-display font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>Explore Original Songs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
