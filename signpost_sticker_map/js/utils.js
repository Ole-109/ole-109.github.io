// js/utils.js

/**
 * Convert an English prefecture name into a stable image key.
 * Example: "Tokyo Metropolis" → "tokyo"
 */
export function sanitizeKey(nameEn) {
  if (!nameEn) return '';
  return nameEn
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Simple in-memory cache for image-key existence checks.
 * Key -> boolean
 */
const imageKeyCache = new Map();

/**
 * Probe whether an image URL exists by trying to load it.
 * Resolves true if it loads, false otherwise.
 * Uses a cache-busting query to avoid stale results.
 */
export function probeImageUrl(url, timeout = 6000) {
  return new Promise(resolve => {
    let finished = false;
    const img = new Image();

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(false);
      }
    }, timeout);

    img.onload = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(true);
    };

    img.onerror = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(false);
    };

    img.src = `${url}?_probe=${Date.now()}`;
  });
}

/**
 * Check whether a prefecture likely has any images.
 *
 * Strategy:
 * 1. Try numbered images in a folder: images/{key}/1.ext
 * 2. Try flat images: images/{key}.ext
 *
 * Stops on the first successful hit to minimize requests.
 * Uses an in-memory cache to avoid re-probing the same key.
 */
export async function hasImageForKey(
  key,
  {
    maxNumbered = 1, // how many numbered files to test per folder
    exts = ['png', 'jpg', 'jpeg', 'webp'],
  } = {}
) {
  if (!key) return false;

  // return cached result if available
  if (imageKeyCache.has(key)) {
    return imageKeyCache.get(key);
  }

  // 1) Probe folder-based images: images/{key}/1.ext
  for (let i = 1; i <= maxNumbered; i++) {
    for (const ext of exts) {
      const url = `images/${key}/${i}.${ext}`;
      if (await probeImageUrl(url)) {
        imageKeyCache.set(key, true);
        return true;
      }
    }
  }

  // 2) Probe flat images: images/{key}.ext
  for (const ext of exts) {
    const url = `images/${key}.${ext}`;
    if (await probeImageUrl(url)) {
      imageKeyCache.set(key, true);
      return true;
    }
  }

  imageKeyCache.set(key, false);
  return false;
}

/**
 * Optional: clear cache (not used by default, but handy for dev)
 */
export function clearImageKeyCache() {
  imageKeyCache.clear();
}
