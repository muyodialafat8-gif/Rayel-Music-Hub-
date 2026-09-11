/**
 * Form validation utilities for Rayel Music Hub
 * Enforces client-side validation before generating WhatsApp URLs
 */

export interface ValidationResult<T = Record<string, unknown>> {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: T;
}

/**
 * Validates Artist Name:
 * - Required
 * - Minimum: 2 characters
 * - Maximum: 80 characters
 * - Trim leading/trailing spaces
 * - Do not allow an empty or whitespace-only value
 */
export function validateArtistName(name: string): { isValid: boolean; value: string; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, value: '', error: 'Please enter your artist name.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, value: trimmed, error: 'Please enter your artist name.' };
  }
  if (trimmed.length > 80) {
    return { isValid: false, value: trimmed, error: 'Artist name must be 80 characters or less.' };
  }
  return { isValid: true, value: trimmed };
}

/**
 * Validates Phone / WhatsApp:
 * - Required
 * - Minimum: 7 digits
 * - Maximum: 15 digits excluding formatting characters
 * - Allow common formatting such as spaces, "+", "-", and parentheses
 * - Normalize the value before processing without silently altering customer's actual number
 */
export function validatePhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, normalized: '', error: 'Please enter a valid WhatsApp/phone number.' };
  }

  // Count digits only
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return { isValid: false, normalized: trimmed, error: 'Please enter a valid WhatsApp/phone number.' };
  }

  return { isValid: true, normalized: trimmed };
}

/**
 * Validates Email:
 * - Optional
 * - If supplied, must use a valid email format
 * - Maximum: 150 characters
 */
export function validateEmail(email?: string): { isValid: boolean; value: string; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: true, value: '' };
  }
  const trimmed = email.trim();
  if (trimmed.length > 150) {
    return { isValid: false, value: trimmed, error: 'Please enter a valid email address.' };
  }
  // Standard RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, value: trimmed, error: 'Please enter a valid email address.' };
  }
  return { isValid: true, value: trimmed };
}

/**
 * Validates Country:
 * - Required
 */
export function validateCountry(country: string): { isValid: boolean; value: string; error?: string } {
  const trimmed = country.trim();
  if (!trimmed) {
    return { isValid: false, value: '', error: 'Please select your country.' };
  }
  return { isValid: true, value: trimmed };
}

/**
 * Validates Additional Message:
 * - Optional
 * - Maximum: 500 characters
 * - Trim unnecessary whitespace
 */
export function validateAdditionalMessage(message?: string): { isValid: boolean; value: string; error?: string } {
  if (!message || !message.trim()) {
    return { isValid: true, value: '' };
  }
  const trimmed = message.trim();
  if (trimmed.length > 500) {
    return { isValid: false, value: trimmed, error: 'Your message is too long. Please keep it under 500 characters.' };
  }
  return { isValid: true, value: trimmed };
}

/**
 * Validates Song Topic for Custom Request:
 * - Required
 * - Minimum: 5 characters
 * - Maximum: 300 characters
 */
export function validateSongTopic(topic: string): { isValid: boolean; value: string; error?: string } {
  const trimmed = topic.trim();
  if (!trimmed || trimmed.length < 5) {
    return { isValid: false, value: '', error: 'Please enter your song topic (at least 5 characters).' };
  }
  if (trimmed.length > 300) {
    return { isValid: false, value: trimmed, error: 'Song topic must be 300 characters or less.' };
  }
  return { isValid: true, value: trimmed };
}
