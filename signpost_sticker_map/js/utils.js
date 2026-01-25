// js/utils.js

// -------------------------------
// String helpers
// -------------------------------

/**
 * Convert an English prefecture name into an image key.
 * Example: "Tokyo Metropolis" -> "tokyo"
 */
export function sanitizeKey(nameEn) {
    if (!nameEn) return '';
    return nameEn
      .trim()
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }
  
  // -------------------------------
  // Browser helpers
  // -------------------------------
  
  /**
   * requestIdleCallback fallback
   */
  export function runWhenIdle(fn, timeout = 2000) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout });
    } else {
      setTimeout(fn, Math.min(timeout, 500));
    }
  }
  
  // -------------------------------
  // Optional small cache
  // -------------------------------
  
  /**
   * Simple in-memory cache (key -> value).
   * Useful if you later want to cache image probe results.
   */
  export class SimpleCache {
    constructor() {
      this.map = new Map();
    }
  
    has(key) {
      return this.map.has(key);
    }
  
    get(key) {
      return this.map.get(key);
    }
  
    set(key, value) {
      this.map.set(key, value);
    }
  
    clear() {
      this.map.clear();
    }
  }
  