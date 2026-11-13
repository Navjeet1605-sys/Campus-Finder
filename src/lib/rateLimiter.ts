/**
 * High-performance sliding-window in-memory and storage-backed rate limiter
 * Protects chat messaging, item reporting, and sensitive client operations against flood attacks.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class SlidingWindowRateLimiter {
  private key: string;
  private maxRequests: number;
  private windowMs: number;
  private inMemoryTimestamps: number[] = [];

  constructor(key: string, maxRequests: number, windowSeconds: number) {
    this.key = `cf_rl_${key}`;
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      const saved = sessionStorage.getItem(this.key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        this.inMemoryTimestamps = Array.isArray(parsed) 
          ? parsed.filter(t => typeof t === 'number' && now - t < this.windowMs)
          : [];
      }
    } catch {
      this.inMemoryTimestamps = [];
    }
  }

  private saveToStorage(): void {
    try {
      sessionStorage.setItem(this.key, JSON.stringify(this.inMemoryTimestamps));
    } catch {
      // Storage quota or private mode fallback
    }
  }

  /**
   * Check if action is allowed without consuming a request token
   */
  public check(): RateLimitResult {
    const now = Date.now();
    // Prune expired timestamps outside the sliding window
    this.inMemoryTimestamps = this.inMemoryTimestamps.filter(t => now - t < this.windowMs);

    if (this.inMemoryTimestamps.length < this.maxRequests) {
      return {
        allowed: true,
        remaining: this.maxRequests - this.inMemoryTimestamps.length,
        retryAfterSeconds: 0
      };
    }

    // Earliest timestamp that needs to expire
    const oldestTimestamp = this.inMemoryTimestamps[0];
    const retryAfterMs = this.windowMs - (now - oldestTimestamp);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds
    };
  }

  /**
   * Attempt action and consume 1 request token if allowed
   */
  public consume(): RateLimitResult {
    const status = this.check();
    if (status.allowed) {
      this.inMemoryTimestamps.push(Date.now());
      this.saveToStorage();
      return {
        allowed: true,
        remaining: Math.max(0, this.maxRequests - this.inMemoryTimestamps.length),
        retryAfterSeconds: 0
      };
    }
    return status;
  }

  /**
   * Manually reset rate limiter for this key
   */
  public reset(): void {
    this.inMemoryTimestamps = [];
    try {
      sessionStorage.removeItem(this.key);
    } catch {
      // Ignore storage errors
    }
  }
}

// Pre-configured rate limiters
// 1. Chat Limiter: Max 5 messages in 10 seconds (stops script/macro spam)
export const chatMessageLimiter = new SlidingWindowRateLimiter('chat_msg', 5, 10);

// 2. Report Item Limiter: Max 3 item submissions in 60 seconds
export const reportItemLimiter = new SlidingWindowRateLimiter('item_report', 3, 60);

// 3. Quick Action Limiter: Max 10 interactions in 15 seconds
export const actionLimiter = new SlidingWindowRateLimiter('quick_action', 10, 15);
