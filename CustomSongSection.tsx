import React, { useState } from 'react';
import { PenTool, MessageSquare, CheckCircle2, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { CustomSongRequest } from '../types';
import { openWhatsApp, buildWhatsAppUrl, generateCustomSongMessage, RAYEL_WHATSAPP_DISPLAY } from '../utils/whatsapp';
import {
  validateArtistName,
  validatePhone,
  validateSongTopic,
  validateAdditionalMessage,
} from '../utils/validation';

const GENRE_OPTIONS = [
  'Afrobeat',
  'Amapiano',
  'Afropop',
  'R&B',
  'Gospel',
  'Hip-Hop',
  'Dancehall',
  'Other',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Luganda',
  'Swahili',
  'Runyankole',
  'Runyoro',
  'Tooro',
  'Other',
];

const MOOD_OPTIONS = [
  'Romantic',
  'Emotional',
  'Happy',
  'Inspirational',
  'Sad',
  'Energetic',
  'Party',
  'Motivational',
];

const VOCAL_PREFERENCES = [
  'No preference',
  'Male',
  'Female',
  'Duet',
];

export const CustomSongSection: React.FC = () => {
  const [artistName, setArtistName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [genre, setGenre] = useState('Afrobeat');
  const [customGenre, setCustomGenre] = useState('');
  const [language, setLanguage] = useState('English');
  const [customLanguage, setCustomLanguage] = useState('');
  const [mood, setMood] = useState('Romantic');
  const [vocalPreference, setVocalPreference] = useState('No preference');
  const [songTopic, setSongTopic] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{
    artistName?: string;
    whatsappNumber?: string;
    customGenre?: string;
    customLanguage?: string;
    songTopic?: string;
    additionalDetails?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

  const handleCopyNumber = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(RAYEL_WHATSAPP_DISPLAY);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = RAYEL_WHATSAPP_DISPLAY;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch (err) {
      console.error('Failed to copy phone number:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      artistName?: string;
      whatsappNumber?: string;
      customGenre?: string;
      customLanguage?: string;
      songTopic?: string;
      additionalDetails?: string;
    } = {};

    // Validate Artist Name (2-80 chars)
    const nameCheck = validateArtistName(artistName);
    if (!nameCheck.isValid) {
      newErrors.artistName = nameCheck.error;
    }

    // Validate WhatsApp (7-15 digits)
    const phoneCheck = validatePhone(whatsappNumber);
    if (!phoneCheck.isValid) {
      newErrors.whatsappNumber = phoneCheck.error;
    }

    // Validate Custom Genre if "Other" is selected
    if (genre === 'Other' && !customGenre.trim()) {
      newErrors.customGenre = 'Please specify your custom genre.';
    }

    // Validate Custom Language if "Other" is selected
    if (language === 'Other' && !customLanguage.trim()) {
      newErrors.customLanguage = 'Please specify your custom language.';
    }

    // Validate Song Topic (5-300 chars)
    const topicCheck = validateSongTopic(songTopic);
    if (!topicCheck.isValid) {
      newErrors.songTopic = topicCheck.error;
    }

    // Validate Additional Details (optional, max 500 chars)
    const detailsCheck = validateAdditionalMessage(additionalDetails);
    if (!detailsCheck.isValid) {
      newErrors.additionalDetails = detailsCheck.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const request: CustomSongRequest = {
      artistName: nameCheck.value,
      whatsappNumber: phoneCheck.normalized,
      genre,
      customGenre: genre === 'Other' ? customGenre.trim() : undefined,
      language,
      customLanguage: language === 'Other' ? customLanguage.trim() : undefined,
      mood,
      vocalPreference,
      vocalRange: vocalPreference,
      songTopic: topicCheck.value,
      additionalDetails: detailsCheck.value || undefined,
    };

    const message = generateCustomSongMessage(request);
    const url = buildWhatsAppUrl(message);
    setGeneratedUrl(url);

    // Open WhatsApp externally directly in user gesture context
    openWhatsApp(message);
    setIsSubmitting(false);
    setShowFallback(true);
  };

  return (
    <section
      id="custom-song-section"
      className="max-w-5xl mx-auto my-8 sm:my-12 px-4 sm:px-6 lg:px-8 scroll-mt-24"
    >
      <div className="relative rounded-3xl bg-gradient-to-b from-[#131722] via-[#0f121a] to-[#0c0e14] border border-amber-500/25 shadow-2xl p-5 sm:p-8 lg:p-10 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>Bespoke Songwriting</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight uppercase">
            CAN'T FIND THE RIGHT SONG? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              WE'LL WRITE IT FOR YOU.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-white/70 mt-3 leading-relaxed">
            Tell us your idea, story, sound or message and Rayel Music Hub can create an original song around your vision.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto relative bg-[#090b10]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 sm:p-8">
          {/* Fallback notification if WhatsApp didn't open */}
          {showFallback && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">
                  WhatsApp couldn't be opened automatically.
                </span>
              </div>
              <p className="text-white/80">
                Chat with Rayel manually: <strong className="font-mono text-emerald-400 font-bold text-sm">{RAYEL_WHATSAPP_DISPLAY}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  id="copy-custom-number-btn"
                  onClick={handleCopyNumber}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied 0742224328!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white/70" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
                {generatedUrl && (
                  <a
                    id="open-custom-whatsapp-direct"
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-display font-black text-xs hover:from-emerald-400 hover:to-emerald-500 transition-colors"
                  >
                    <span>Open WhatsApp Directly</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            {/* Artist & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="custom-artist-name"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Artist Name <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="custom-artist-name"
                  type="text"
                  required
                  maxLength={80}
                  value={artistName}
                  onChange={(e) => {
                    setArtistName(e.target.value);
                    if (errors.artistName) setErrors((prev) => ({ ...prev, artistName: undefined }));
                  }}
                  placeholder="e.g. Liam Ray or Queen Sheebah"
                  aria-invalid={!!errors.artistName}
                  aria-describedby={errors.artistName ? 'custom-artist-name-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    errors.artistName ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {errors.artistName && (
                  <p id="custom-artist-name-error" className="mt-1.5 text-xs text-red-400 font-medium">
                    {errors.artistName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="custom-whatsapp-number"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  WhatsApp Number <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="custom-whatsapp-number"
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => {
                    setWhatsappNumber(e.target.value);
                    if (errors.whatsappNumber) setErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
                  }}
                  placeholder="e.g. +256 7XXXXXXXX"
                  aria-invalid={!!errors.whatsappNumber}
                  aria-describedby={errors.whatsappNumber ? 'custom-whatsapp-number-error' : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    errors.whatsappNumber ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {errors.whatsappNumber && (
                  <p id="custom-whatsapp-number-error" className="mt-1.5 text-xs text-red-400 font-medium">
                    {errors.whatsappNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Genre & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="custom-genre-select"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Genre <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <select
                  id="custom-genre-select"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white text-base sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
                >
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                {genre === 'Other' && (
                  <div className="mt-2.5">
                    <label htmlFor="custom-genre-input" className="block text-[11px] text-amber-300 font-medium mb-1">
                      Specify Custom Genre <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="custom-genre-input"
                      type="text"
                      required
                      value={customGenre}
                      onChange={(e) => {
                        setCustomGenre(e.target.value);
                        if (errors.customGenre) setErrors((prev) => ({ ...prev, customGenre: undefined }));
                      }}
                      placeholder="e.g. Kadongo Kamu, Reggae-Fusion"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-white text-sm ${
                        errors.customGenre ? 'border-red-500' : 'border-amber-500/40'
                      }`}
                    />
                    {errors.customGenre && (
                      <p className="mt-1 text-xs text-red-400">{errors.customGenre}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="custom-language-select"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Language <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <select
                  id="custom-language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white text-base sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>

                {language === 'Other' && (
                  <div className="mt-2.5">
                    <label htmlFor="custom-language-input" className="block text-[11px] text-amber-300 font-medium mb-1">
                      Specify Custom Language <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="custom-language-input"
                      type="text"
                      required
                      value={customLanguage}
                      onChange={(e) => {
                        setCustomLanguage(e.target.value);
                        if (errors.customLanguage) setErrors((prev) => ({ ...prev, customLanguage: undefined }));
                      }}
                      placeholder="e.g. Acholi, French, Lingala"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-white text-sm ${
                        errors.customLanguage ? 'border-red-500' : 'border-amber-500/40'
                      }`}
                    />
                    {errors.customLanguage && (
                      <p className="mt-1 text-xs text-red-400">{errors.customLanguage}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mood & Vocal Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="custom-mood-select"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Mood <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <select
                  id="custom-mood-select"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white text-base sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
                >
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="custom-vocal-select"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5"
                >
                  Vocal Preference <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <select
                  id="custom-vocal-select"
                  value={vocalPreference}
                  onChange={(e) => setVocalPreference(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white text-base sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
                >
                  {VOCAL_PREFERENCES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Song Topic (5 to 300 chars) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="custom-song-topic"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider"
                >
                  Song Topic <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <span className={`text-[11px] ${songTopic.length > 300 ? 'text-red-400 font-bold' : 'text-white/40'}`}>
                  {songTopic.length}/300
                </span>
              </div>
              <input
                id="custom-song-topic"
                type="text"
                required
                maxLength={300}
                value={songTopic}
                onChange={(e) => {
                  setSongTopic(e.target.value);
                  if (errors.songTopic) setErrors((prev) => ({ ...prev, songTopic: undefined }));
                }}
                placeholder="e.g. Overcoming doubts from critics, or falling for someone unexpected in Kampala..."
                aria-invalid={!!errors.songTopic}
                aria-describedby={errors.songTopic ? 'custom-song-topic-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  errors.songTopic ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                }`}
              />
              {errors.songTopic && (
                <p id="custom-song-topic-error" className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.songTopic}
                </p>
              )}
            </div>

            {/* Additional Details (Optional, max 500 chars) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="custom-additional-details"
                  className="block text-xs font-semibold text-white/80 uppercase tracking-wider"
                >
                  Additional Details <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <span className={`text-[11px] ${additionalDetails.length > 500 ? 'text-red-400 font-bold' : 'text-white/40'}`}>
                  {additionalDetails.length}/500
                </span>
              </div>
              <textarea
                id="custom-additional-details"
                rows={3}
                maxLength={500}
                value={additionalDetails}
                onChange={(e) => {
                  setAdditionalDetails(e.target.value);
                  if (errors.additionalDetails) setErrors((prev) => ({ ...prev, additionalDetails: undefined }));
                }}
                placeholder="Artist influences, tempo ideas, vocal range guidance, deadline requirements..."
                aria-invalid={!!errors.additionalDetails}
                aria-describedby={errors.additionalDetails ? 'custom-additional-details-error' : undefined}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 text-base sm:text-sm transition-colors resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  errors.additionalDetails ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-400'
                }`}
              />
              {errors.additionalDetails && (
                <p id="custom-additional-details-error" className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.additionalDetails}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="submit-custom-song-btn"
              type="submit"
              disabled={isSubmitting}
              aria-label="Send custom song request to Rayel on WhatsApp"
              className="w-full min-h-[48px] py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 active:scale-98 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening WhatsApp…</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>SEND REQUEST TO RAYEL ON WHATSAPP</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-white/50 mt-2">
              Opens WhatsApp directly with Rayel Music Hub ({RAYEL_WHATSAPP_DISPLAY}). Demos and draft hooks are shared privately.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
