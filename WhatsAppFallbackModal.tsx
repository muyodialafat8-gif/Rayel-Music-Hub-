import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Copy, Check, X, ExternalLink } from 'lucide-react';
import {
  subscribeToWhatsAppBlocked,
  WhatsAppBlockedEvent,
  RAYEL_WHATSAPP_DISPLAY,
  RAYEL_WHATSAPP_BASE_URL,
} from '../utils/whatsapp';

export const WhatsAppFallbackModal: React.FC = () => {
  const [eventData, setEventData] = useState<WhatsAppBlockedEvent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToWhatsAppBlocked((data) => {
      setEventData(data);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!eventData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEventData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [eventData]);

  const handleCopy = async () => {
    const numberToCopy = eventData?.number || RAYEL_WHATSAPP_DISPLAY;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(numberToCopy);
      } else {
        // Fallback for non-secure or restricted clipboard context
        const textArea = document.createElement('textarea');
        textArea.value = numberToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy phone number:', err);
    }
  };

  if (!eventData) return null;

  const directUrl = eventData.url || RAYEL_WHATSAPP_BASE_URL;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-fallback-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0e121a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-white"
        >
          {/* Close button */}
          <button
            id="close-whatsapp-fallback-btn"
            onClick={() => setEventData(null)}
            aria-label="Close message"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon */}
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <MessageSquare className="w-6 h-6 fill-emerald-400/20" />
          </div>

          {/* Exact required messaging */}
          <h3
            id="whatsapp-fallback-title"
            className="font-display font-black text-lg text-white mb-2 tracking-tight"
          >
            WhatsApp couldn't be opened automatically.
          </h3>

          <p className="text-sm text-white/80 leading-relaxed mb-4">
            Chat with Rayel manually: <strong className="font-mono text-emerald-400 font-bold text-base">{eventData.number || RAYEL_WHATSAPP_DISPLAY}</strong>
          </p>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            {/* Copy Button */}
            <button
              id="copy-rayel-number-btn"
              onClick={handleCopy}
              aria-label="Copy Rayel WhatsApp phone number"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied 0742224328!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white/70" />
                  <span>Copy WhatsApp Number</span>
                </>
              )}
            </button>

            {/* Direct Open Link */}
            <a
              id="direct-open-whatsapp-link"
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setEventData(null)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Open WhatsApp Message Directly</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
