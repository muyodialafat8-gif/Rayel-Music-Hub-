import React from 'react';
import { Code2, Phone, ExternalLink } from 'lucide-react';

export const DeveloperCreditBanner: React.FC = () => {
  return (
    <aside
      id="marvintech-developer-credit"
      aria-label="Website Developer Credit"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-10"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0f18] border border-violet-500/25 p-5 sm:p-6 shadow-xl shadow-violet-950/20">
        {/* Subtle tasteful violet ambient glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-violet-500/5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          {/* Creator Details */}
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[11px] font-mono font-bold tracking-wider uppercase">
              <Code2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>WEBSITE CREATED BY MARVINTECH STUDIOS</span>
            </div>
            <p className="text-sm text-white/80 font-medium">
              Need a website, app, branding or digital solution?
            </p>
          </div>

          {/* Contact Action */}
          <div className="shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            <a
              id="marvintech-contact-btn"
              href="tel:0766051929"
              aria-label="Contact website developer MarvinTech Studios at 0766051929"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/40 hover:border-violet-400 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <Phone className="w-3.5 h-3.5 shrink-0 text-violet-300" />
              <span>CONTACT US: 0766051929</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
