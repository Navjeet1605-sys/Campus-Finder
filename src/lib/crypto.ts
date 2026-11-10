/**
 * Cryptographic utility for password hashing & verification
 * Powered by Web Crypto API (SubtleCrypto) - Native, fast, secure, zero external dependencies.
 */

// Converts an ArrayBuffer to a hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a cryptographically secure random salt (16 bytes = 32 hex chars)
 */
export function generateSalt(): string {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  return bufferToHex(saltBytes.buffer);
}

/**
 * Hash a password using SHA-256 with a unique cryptographic salt.
 * Returns formatted string: "salt:hash"
 */
export async function hashPassword(password: string, existingSalt?: string): Promise<string> {
  const salt = existingSalt || generateSalt();
  const encoder = new TextEncoder();
  
  // Combine salt + password
  const saltedData = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const hashHex = bufferToHex(hashBuffer);

  return `${salt}:${hashHex}`;
}

/**
 * Verify a plain password against a stored "salt:hash" string.
 * Performs constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.includes(':')) {
    // If legacy plaintext password exists from earlier tests, compare directly or reject
    return storedHash === password;
  }

  const [salt, expectedHash] = storedHash.split(':');
  if (!salt || !expectedHash) return false;

  const encoder = new TextEncoder();
  const saltedData = encoder.encode(`${salt}:${password}`);
  const computedBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const computedHex = bufferToHex(computedBuffer);

  // Constant-time comparison
  if (computedHex.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computedHex.length; i++) {
    mismatch |= computedHex.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }

  return mismatch === 0;
}

