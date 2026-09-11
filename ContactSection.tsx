import React from 'react';
import { MessageSquare, PhoneCall, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { RAYEL_WHATSAPP_DISPLAY, RAYEL_WHATSAPP_BASE_URL } from '../utils/whatsapp';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-14 sm:my-18 scroll-mt-24">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#121622] via-[#0d1017] to-[#151a24] border border-amber-500/30 p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Online & Ready on WhatsApp</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase mb-2">
            READY TO TALK MUSIC?
          </h2>

          <p className="text-base sm:text-lg text-white/70 mb-6">
            Talk directly to Rayel Music Hub.
          </p>

          {/* Big Phone Number Display */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/60 border border-white/10 mb-8 shadow-inner">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest">
              {RAYEL_WHATSAPP_DISPLAY}
            </span>
          </div>

          {/* Primary CTA Button */}
          <div>
            <a
              id="contact-chat-on-whatsapp-btn"
              href={RAYEL_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Rayel on WhatsApp"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display font-black text-base sm:text-lg tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageSquare className="w-6 h-6 fill-black" />
              <span>CHAT WITH RAYEL ON WHATSAPP</span>
            </a>
          </div>

          {/* Quick bullet guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 pt-8 border-t border-white/10 text-xs text-white/60">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Fast reply directly from songwriter</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Voice note melodies & demo clips</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Custom lyric revisions & key checks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
