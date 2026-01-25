// js/gallery.js v1.0.5
export default class Gallery {
  constructor({
    previewEl,
    previewWrapperEl,
    imageEl,
    imageWrapperEl,
    infoEl,
  }) {
    this.previewEl = previewEl;
    this.previewWrapperEl = previewWrapperEl;
    this.imageEl = imageEl;
    this.imageWrapperEl = imageWrapperEl;
    this.infoEl = infoEl;

    this.urls = [];
    this.idx = 0;
  }

  /**
   * Reset the gallery UI (hide images & preview)
   */
  reset() {
    this.urls = [];
    this.idx = 0;
    this.previewEl.innerHTML = '';
    this.previewEl.style.transform = 'translateX(0)';
    this.imageEl.style.display = 'none';
    this.infoEl.textContent = '';
  }

  /**
   * Load images for a given key
   * @param {string} key
   * @param {number} maxImages
   * @returns {Promise<boolean>} true if at least one image loaded
   */
  async loadForKey(key, maxImages = 12) {
    if (!key) return false;

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

    const urls = [];
    const seen = new Set();

    for (const url of candidates) {
      try {
        const exists = await this.probe(url);
        if (exists && !seen.has(url)) {
          urls.push(url);
          seen.add(url);
        }
        if (urls.length >= maxImages) break;
      } catch (err) {
        console.warn('Error probing image', url, err);
      }
    }

    if (!urls.length) return false;

    this.urls = urls;
    this.idx = 0;
    this.showCurrent();
    this.preloadOthers();
    return true;
  }

  /**
   * Show the current image
   */
  showCurrent() {
    const url = this.urls[this.idx];
    if (!url) return;

    this.imageEl.style.display = 'none';
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
      this.imageEl.style.display = 'block';
      requestAnimationFrame(() => {
        this.imageEl.style.opacity = 1;
      });

      this.updatePreviewStrip();
      this.infoEl.textContent = `${this.idx + 1} / ${this.urls.length}`;
    };
    temp.onerror = () => {
      this.imageEl.style.display = 'none';
    };
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

  preloadOthers() {
    const toPreload = this.urls.filter((_, i) => i !== this.idx);
    toPreload.forEach(u => {
      const img = new Image();
      img.decoding = 'async';
      img.src = u;
    });
  }

  probe(url, timeout = 6000) {
    return new Promise(resolve => {
      let done = false;
      const img = new Image();
      const timer = setTimeout(() => {
        if (!done) {
          done = true;
          resolve(false);
        }
      }, timeout);

      img.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve(true); } };
      img.onerror = () => { if (!done) { done = true; clearTimeout(timer); resolve(false); } };
      img.src = `${url}?_probe=${Date.now()}`;
    });
  }
}
