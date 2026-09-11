import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, Lock, X } from 'lucide-react';
import { RAYEL_WHATSAPP_DISPLAY, RAYEL_WHATSAPP_BASE_URL } from '../utils/whatsapp';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'copyright' | null>(null);

  return (
    <footer id="main-footer" className="w-full bg-[#07090e] border-t border-white/10 pt-12 pb-24 md:pb-12 text-white/70 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/10">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black text-sm">
                R
              </div>
              <span className="font-display font-black text-xl tracking-wider text-white">
                RAYEL <span className="text-amber-400">MUSIC HUB</span>
              </span>
            </div>
            <p className="font-display font-bold text-xs uppercase tracking-widest text-amber-400/90 mb-1">
              YOUR STORY. OUR WORDS. YOUR HIT.
            </p>
            <p className="text-xs text-white/50">
              Original songs for artists.
            </p>
          </div>

          {/* Contact block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-base">📱</span>
              <span className="font-mono font-bold text-white text-sm">{RAYEL_WHATSAPP_DISPLAY}</span>
            </div>

            <a
              id="footer-chat-whatsapp-btn"
              href={RAYEL_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Rayel on WhatsApp"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <MessageSquare className="w-4 h-4 fill-emerald-400" />
              <span>Chat with Rayel on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Protection statement */}
        <div className="py-6 border-b border-white/5 text-[11px] text-white/40 leading-relaxed">
          <p>
            © Rayel Music Hub. All songs, concepts and songwriting materials are protected. Demos are provided for evaluation only. Unauthorized copying, redistribution or commercial use is prohibited. Rights and usage terms are agreed directly with Rayel Music Hub before purchase.
          </p>
        </div>

        {/* Bottom bar & links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 Rayel Music Hub. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <button
              id="footer-privacy-link"
              onClick={() => setModalType('privacy')}
              className="min-h-[44px] px-2 py-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              Privacy Policy
            </button>
            <button
              id="footer-terms-link"
              onClick={() => setModalType('terms')}
              className="min-h-[44px] px-2 py-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              Terms
            </button>
            <button
              id="footer-copyright-link"
              onClick={() => setModalType('copyright')}
              className="min-h-[44px] px-2 py-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              Copyright / Song Rights
            </button>
            <button
              id="footer-admin-link"
              onClick={onOpenAdmin}
              aria-label="Open Catalogue Admin Management Portal"
              className="min-h-[44px] flex items-center gap-1 hover:text-amber-400 transition-colors ml-1 py-1 px-2.5 rounded bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple Information Modal for Policy/Terms/Copyright */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0e121a] border border-white/10 rounded-2xl p-6 shadow-2xl text-white">
            <button
              id="close-policy-modal-btn"
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {modalType === 'privacy' && (
              <div>
                <h3 className="font-display font-bold text-lg text-amber-400 mb-2">Privacy Policy</h3>
                <p className="text-xs text-white/70 leading-relaxed space-y-2">
                  Rayel Music Hub values artist discretion. Any inquiries, contact details, custom song briefs, or audio shared via WhatsApp remain strictly confidential. We do not sell or distribute client contacts to third-party marketing brokers.
                </p>
              </div>
            )}

            {modalType === 'terms' && (
              <div>
                <h3 className="font-display font-bold text-lg text-amber-400 mb-2">Terms of Service</h3>
                <p className="text-xs text-white/70 leading-relaxed space-y-2">
                  All song listings display exclusive or non-exclusive commercial rates as agreed in contract. A song is guaranteed unassigned until purchase agreement is finalized and deposit/payment is verified directly by Rayel.
                </p>
              </div>
            )}

            {modalType === 'copyright' && (
              <div>
                <h3 className="font-display font-bold text-lg text-amber-400 mb-2">Copyright / Song Rights</h3>
                <p className="text-xs text-white/70 leading-relaxed space-y-2">
                  © 2026 Rayel Music Hub. Songs in this catalogue are original works protected by international copyright laws. Preview demos delivered over WhatsApp are for audition purposes only. Full master recording rights, publishing splits, and mechanical licensing are transferred upon completed purchase.
                </p>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
