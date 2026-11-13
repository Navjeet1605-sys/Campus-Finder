/**
 * Input sanitization, XSS mitigation, and spam protection helpers
 */

// Basic strip tags pattern
const HTML_TAG_REGEX = /<[^>]*>?/gm;

// Suspicious phishing or abusive links/tokens
const SUSPICIOUS_PATTERNS = [
  /javascript:/i,
  /data:text\/html/i,
  /vbscript:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /<script/i,
  /t\.me\/[a-z0-9_]+/i, // Telegram spam bots
  /wa\.me\/\+?[0-9]+/i  // WhatsApp unsolicited promo links
];

export function sanitizeText(text: string, maxLength = 1000): string {
  if (!text) return '';
  return text
    .replace(HTML_TAG_REGEX, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, maxLength);
}

export function detectSpamPattern(content: string): { isSpam: boolean; reason?: string } {
  if (!content) return { isSpam: false };

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isSpam: true,
        reason: 'Message contains suspicious patterns or unverified links.'
      };
    }
  }

  // Check character repetition spam e.g. "aaaaaaaaaaaaaa..."
  if (/(.)\1{35,}/.test(content)) {
    return {
      isSpam: true,
      reason: 'Repeated character spam detected.'
    };
  }

  return { isSpam: false };
}
