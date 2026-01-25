import { probeImageUrl } from './utils.js';
import { showNoMeta } from './sidebar.js';

export default class Gallery {
  constructor({
    previewEl,
    previewWrapperEl,
    imageEl,
    imageWrapperEl,
    placeholderEl,
    placeholderTextEl,
    infoEl,
    prevBtn,
    nextBtn,
  }) {
    this.previewEl = previewEl;
    this.previewWrapperEl = previewWrapperEl;
    this.imageEl = imageEl;
    this.imageWrapperEl = imageWrapperEl;
    this.placeholderEl = placeholderEl;
    this.placeholderTextEl = placeholderTextEl;
    this.infoEl = infoEl;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;

    this.urls = [];
    this.idx = 0;

    this.prevBtn.addEventListener('click', () => this.showPrev());
    this.nextBtn.addEventListener('click', () => this.showNext());
  }

  /**
   * Reset the gallery UI
   * @param {string} placeholderText Text to show while loading
   */
  reset(placeholderText = 'Loading...') {
    this.urls = [];
    this.idx = 0;
    this.previewEl.innerHTML = '';
    this.previewEl.style.transform = 'translateX(0)';
    this.imageEl.style.display = 'none';
    this.infoEl.textContent = '';

    // Show placeholder only if text is not no-meta
    if (placeholderText.toLowerCase().includes('no meta')) {
      showNoMeta();
    } else {
      this.placeholderEl.style.display = 'flex';
      const spinner = this.placeholderEl.querySelector('.spinner');
      if (spinner) spinner.style.display = 'block';
      this.placeholderTextEl.textContent = placeholderText;
    }
  }

  /**
   * Load images for a given key
   * @param {string} key
   * @param {number} maxImages
   * @returns {Promise<boolean>} true if at least one image loaded
   */
  async loadForKey(key, maxImages = 12) {
    if (!key) {
      showNoMeta();
      return false;
    }

    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    const candidates = [];

    for (let i = 1; i <= maxImages; i++) {
      for (const ext of exts) {
        candidates.push(`images/${key}/${i}.${ext}`);
      }
    }
    for (const ext of exts) {
      candidates.push(`images/${key}.${ext}`);
    }

    // Probe all candidates concurrently (limited to maxImages)
    const probes = await Promise.all(
      candidates.map(async url => (await probeImageUrl(url)) ? url : null)
    );

    const urls = [];
    const seen = new Set();
    for (const u of probes) {
      if (u && !seen.has(u)) {
        urls.push(u);
        seen.add(u);
      }
      if (urls.length >= maxImages) break;
    }

    if (!urls.length) {
      showNoMeta();
      return false;
    }

    this.urls = urls;
    this.idx = 0;
    this.showCurrent();
    this.preloadBackground();
    return true;
  }

  showCurrent() {
    const url = this.urls[this.idx];
    if (!url) return showNoMeta();

    // Show placeholder with spinner while loading
    this.placeholderEl.style.display = 'flex';
    const spinner = this.placeholderEl.querySelector('.spinner');
    if (spinner) spinner.style.display = 'block';
    this.placeholderTextEl.textContent = 'Loading image...';
    this.imageEl.style.display = 'none';
    this.imageEl.style.opacity = 0;

    const temp = new Image();
    temp.decoding = 'async';
    temp.onload = () => {
      const padding = 20;
      const wrapperWidth = this.imageWrapperEl.clientWidth - padding;
      const wrapperHeight = this.imageWrapperEl.clientHeight - padding;
      const ratio = Math.min(wrapperWidth / temp.naturalWidth, wrapperHeight / temp.naturalHeight);

      this.imageEl.width = Math.round(temp.naturalWidth * ratio);
      this.imageEl.height = Math.round(temp.naturalHeight * ratio);

      this.imageEl.src = url;
      this.imageEl.style.transition = 'opacity 0.35s ease-in-out';

      // Hide placeholder after load
      this.placeholderEl.style.display = 'none';
      this.imageEl.style.display = 'block';
      requestAnimationFrame(() => (this.imageEl.style.opacity = 1));

      this.updatePreviewStrip();
      this.infoEl.textContent = `${this.idx + 1} / ${this.urls.length}`;
    };
    temp.onerror = () => showNoMeta('Failed to load image');

    temp.src = url + '?_v=' + Date.now();
  }

  showPrev() {
    if (!this.urls.length) return;
    this.idx = (this.idx - 1 + this.urls.length) % this.urls.length;
    this.showCurrent();
  }

  showNext() {
    if (!this.urls.length) return;
    this.idx = (this.idx + 1) % this.urls.length;
    this.showCurrent();
  }

  updatePreviewStrip() {
    const THUMB_WIDTH = 48;
    const GAP = 6;
    const SLOT = THUMB_WIDTH + GAP;

    this.previewEl.innerHTML = '';
    this.urls.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `preview ${i + 1}`;
      img.loading = 'lazy';
      img.width = THUMB_WIDTH;
      img.height = THUMB_WIDTH;
      img.className = i === this.idx ? 'active' : '';
      img.onclick = () => {
        this.idx = i;
        this.showCurrent();
      };
      this.previewEl.appendChild(img);
    });

    const wrapperWidth = this.previewWrapperEl.clientWidth;
    const centerX = Math.round(wrapperWidth / 2 - THUMB_WIDTH / 2);
    const offset = centerX - this.idx * SLOT;
    this.previewEl.style.transform = `translateX(${offset}px)`;
  }

  preloadBackground() {
    const toPreload = this.urls.filter((_, i) => i !== this.idx);
    if (!toPreload.length) return;

    const doPreload = () => {
      toPreload.forEach(u => {
        const img = new Image();
        img.decoding = 'async';
        img.src = u;
      });
    };

    if ('requestIdleCallback' in window) requestIdleCallback(doPreload, { timeout: 2000 });
    else setTimeout(doPreload, 500);
  }
}
