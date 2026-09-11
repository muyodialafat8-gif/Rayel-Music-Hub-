import { Song, PurchaseInquiry, CustomSongRequest } from '../types';

export const RAYEL_WHATSAPP_DISPLAY = '0742224328';
export const RAYEL_WHATSAPP_NUMBER = '256742224328';
export const RAYEL_WHATSAPP_BASE_URL = `https://wa.me/${RAYEL_WHATSAPP_NUMBER}`;

export type WhatsAppBlockedEvent = {
  url: string;
  number: string;
};

type WhatsAppBlockedListener = (event: WhatsAppBlockedEvent) => void;
const blockedListeners = new Set<WhatsAppBlockedListener>();

export function subscribeToWhatsAppBlocked(listener: WhatsAppBlockedListener): () => void {
  blockedListeners.add(listener);
  return () => {
    blockedListeners.delete(listener);
  };
}

export function notifyWhatsAppBlocked(url: string) {
  blockedListeners.forEach((listener) =>
    listener({ url, number: RAYEL_WHATSAPP_DISPLAY })
  );
}

/**
 * Builds the official wa.me WhatsApp URL with JavaScript native encodeURIComponent().
 * Encodes the ENTIRE message cleanly preserving emojis, line breaks, punctuation.
 * Never uses manual string replacements.
 */
export function buildWhatsAppUrl(message?: string): string {
  if (!message || !message.trim()) {
    return RAYEL_WHATSAPP_BASE_URL;
  }
  const encodedMessage = encodeURIComponent(message.trim());
  return `${RAYEL_WHATSAPP_BASE_URL}?text=${encodedMessage}`;
}

/**
 * Opens WhatsApp as an external top-level/new browsing context using:
 * window.open(whatsappUrl, "_blank", "noopener,noreferrer");
 *
 * CRITICAL: Never uses window.location.href to avoid navigating the embedded iframe.
 * If blocked by browser popup restrictions, triggers the fallback notification.
 */
export function openWhatsApp(message?: string): boolean {
  const url = buildWhatsAppUrl(message);
  let openedWindow: Window | null = null;
  try {
    openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.error('Failed to open WhatsApp window:', err);
  }

  // If window.open was blocked or failed
  if (!openedWindow || openedWindow.closed || typeof openedWindow.closed === 'undefined') {
    notifyWhatsAppBlocked(url);
    return false;
  }

  return true;
}

/**
 * Generates dynamic WhatsApp message for demo request
 * Format strictly conforms to Requirement 6:
 *
 * Hello Rayel Music Hub 👋
 * 
 * I'd like to listen to the demo for:
 * 
 * 🎵 Song: [Title]
 * 🆔 Song ID: [ID]
 * 🎼 Genre: [Genre]
 * ❤️ Mood: [Mood]
 * 💰 Price: UGX [Price]
 * 
 * Please send me the demo.
 */
export function generateDemoRequestMessage(song: Song): string {
  const cleanPrice = song.price.startsWith('UGX') ? song.price : `UGX ${song.price}`;
  return `Hello Rayel Music Hub 👋

I'd like to listen to the demo for:

🎵 Song: ${song.title}
🆔 Song ID: ${song.songId}
🎼 Genre: ${song.genre}
❤️ Mood: ${song.mood}
💰 Price: ${cleanPrice}

Please send me the demo.`;
}

/**
 * Generates dynamic WhatsApp message for song purchase inquiry
 */
export function generatePurchaseMessage(inquiry: PurchaseInquiry): string {
  const cleanPrice = inquiry.price.startsWith('UGX') ? inquiry.price : `UGX ${inquiry.price}`;
  const parts = [
    `Hello Rayel Music Hub 👋`,
    ``,
    `I'm interested in purchasing this song:`,
    ``,
    `🎵 Song: ${inquiry.songName}`,
    `🆔 Song ID: ${inquiry.songId}`,
  ];

  if (inquiry.genre) {
    parts.push(`🎼 Genre: ${inquiry.genre}`);
  }
  if (inquiry.mood) {
    parts.push(`❤️ Mood: ${inquiry.mood}`);
  }

  parts.push(
    `💰 Price: ${cleanPrice}`,
    ``,
    `👤 Artist: ${inquiry.artistName}`,
    `📱 WhatsApp: ${inquiry.phone}`,
    `🌍 Country: ${inquiry.country}`,
  );

  if (inquiry.email && inquiry.email.trim()) {
    parts.push(`📧 Email: ${inquiry.email.trim()}`);
  }

  if (inquiry.additionalMessage && inquiry.additionalMessage.trim()) {
    parts.push(``, `Additional message:`, inquiry.additionalMessage.trim());
  }

  parts.push(``, `Please guide me through the purchase.`);

  return parts.join('\n');
}

/**
 * Generates dynamic WhatsApp message for custom song request
 * Format strictly conforms to Requirement 8:
 *
 * Hello Rayel Music Hub 👋
 * 
 * I'd like to request a custom song.
 * 
 * 👤 Artist: [Artist Name]
 * 📱 WhatsApp: [Phone]
 * 🎼 Genre: [Genre]
 * 🌍 Language: [Language]
 * ❤️ Mood: [Mood]
 * 🎤 Vocal: [Vocal Preference]
 * 
 * 🎵 Song Topic:
 * [Topic]
 * 
 * Additional details:
 * [Additional Details]
 * 
 * I'd like to discuss this with Rayel.
 */
export function generateCustomSongMessage(request: CustomSongRequest): string {
  const genreDisplay = request.genre === 'Other' && request.customGenre?.trim()
    ? `Other (${request.customGenre.trim()})`
    : request.genre;

  const languageDisplay = request.language === 'Other' && request.customLanguage?.trim()
    ? `Other (${request.customLanguage.trim()})`
    : request.language;

  const vocalDisplay = request.vocalPreference || request.vocalRange || 'No preference';

  const parts = [
    `Hello Rayel Music Hub 👋`,
    ``,
    `I'd like to request a custom song.`,
    ``,
    `👤 Artist: ${request.artistName}`,
    `📱 WhatsApp: ${request.whatsappNumber}`,
    `🎼 Genre: ${genreDisplay}`,
    `🌍 Language: ${languageDisplay}`,
    `❤️ Mood: ${request.mood}`,
    `🎤 Vocal: ${vocalDisplay}`,
    ``,
    `🎵 Song Topic:`,
    request.songTopic.trim(),
  ];

  if (request.additionalDetails && request.additionalDetails.trim()) {
    parts.push(``, `Additional details:`, request.additionalDetails.trim());
  }

  parts.push(``, `I'd like to discuss this with Rayel.`);

  return parts.join('\n');
}

/**
 * Generates general contact message
 */
export function generateGeneralContactMessage(topic?: string): string {
  if (topic) {
    return `Hello Rayel Music Hub 👋\n\nI'm contacting you regarding: ${topic}.\n\nPlease let me know how we can collaborate.`;
  }
  return `Hello Rayel Music Hub 👋\n\nI'd like to know more about your original songs catalogue and services.`;
}

