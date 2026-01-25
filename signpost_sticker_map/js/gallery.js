// js/gallery.js

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
    // DOM refs
    this.previewEl = previewEl;
    this.previewWrapperEl = previewWrapperEl;
    this.imageEl = imageEl;
    this.imageWrapperEl = imageWrapperEl;
    this.placeholderEl = placeholderEl;
    this.placeholderTextEl = placeholderTextEl;
    this.infoEl = infoEl;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;

    // state
    this.urls = [];
    this.idx = 0;

    // events
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    window.addEventListener('resize', () => this.updatePreviewStrip());
  }

  // -------------------------------
  // Public API
  // -------------------------------

  reset(message = 'No image yet') {
    this.urls = [];
    this.idx = 0;

    this.imageEl.style.display = 'none';
    this.previewEl.innerHTML = '';
    this.previewEl.style.transform = 'translateX(0)';

    this.placeholderEl.style.display = 'flex';
    // if the message is the special no-meta indicator, render the warning layout
    if (message === 'NO_META') {
      this.#renderNoMeta();
    } else {
      this.placeholderTextEl.textContent = message;
    }

    this.infoEl.textContent = '';
  }

  async loadForKey(key, maxImages = 12) {
    if (!key) {
      this.reset('NO_META');
      return false;
    }

    const urls = await this.#loadImagesForKey(key, maxImages);
    this.urls = urls;
    this.idx = 0;

    if (!urls.length) {
      // show the special "no meta" UI
      this.reset('NO_META');
      return false;
    }

    this.show();
    this.updatePreviewStrip();
    this.#backgroundPreload(0);
    return true;
  }

  prev() {
    if (!this.urls.length) return;
    this.idx = (this.idx - 1 + this.urls.length) % this.urls.length;
    this.show();
  }

  next() {
    if (!this.urls.length) return;
    this.idx = (this.idx + 1) % this.urls.length;
    this.show();
  }

  // -------------------------------
  // Rendering
  // -------------------------------

  show() {
    if (!this.urls.length) {
      this.reset('NO_META');
      return;
    }

    const url = this.urls[this.idx];

    this.placeholderEl.style.display = 'flex';
    this.placeholderTextEl.textContent = 'Loading image…';
    this.imageEl.style.display = 'none';
    this.imageEl.style.opacity = 0;

    const temp = new Image();
    temp.decoding = 'async';

    temp.onload = () => {
      this.#fitImage(temp);

      this.imageEl.src = `${url}?_v=${Date.now()}`;
      this.imageEl.style.transition = 'opacity 0.35s ease-in-out';

      this.placeholderEl.style.display = 'none';
      this.imageEl.style.display = 'block';

      requestAnimationFrame(() => {
        this.imageEl.style.opacity = 1;
      });

      this.infoEl.textContent = `${this.idx + 1} / ${this.urls.length}`;
      this.updatePreviewStrip();
    };

    temp.onerror = () => {
      // if an image fails to load, fall back to showing the no-meta warning
      this.reset('NO_META');
      this.imageEl.style.display = 'none';
    };

    temp.src = `${url}?_probe=${Date.now()}`;
  }

  updatePreviewStrip() {
    this.previewEl.innerHTML = '';

    if (!this.urls.length) {
      this.previewEl.style.transform = 'translateX(0)';
      return;
    }

    const THUMB = 48;
    const GAP = 6;
    const SLOT = THUMB + GAP;

    this.urls.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `preview ${i + 1}`;
      img.loading = 'lazy';
      img.width = THUMB;
      img.height = THUMB;
      img.className = i === this.idx ? 'active' : '';

      img.addEventListener('click', () => {
        this.idx = i;
        this.show();
      });

      this.previewEl.appendChild(img);
    });

    const wrapperWidth = this.previewWrapperEl.clientWidth;
    const centerX = Math.round(wrapperWidth / 2 - THUMB / 2);
    const offset = centerX - this.idx * SLOT;

    this.previewEl.style.transform = `translateX(${offset}px)`;
  }

  // -------------------------------
  // Internal helpers
  // -------------------------------

  #fitImage(tempImg) {
    const padding = 20;
    const maxW = this.imageWrapperEl.clientWidth - padding;
    const maxH = this.imageWrapperEl.clientHeight - padding;

    const ratio = Math.min(
      maxW / tempImg.naturalWidth,
      maxH / tempImg.naturalHeight
    );

    this.imageEl.width = Math.round(tempImg.naturalWidth * ratio);
    this.imageEl.height = Math.round(tempImg.naturalHeight * ratio);
  }

  async #loadImagesForKey(key, maxImages) {
    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    const candidates = [];

    for (let i = 1; i <= maxImages; i++) {
      for (const ext of exts) {
        candidates.push({
          url: `images/${key}/${i}.${ext}`,
          order: i * 10 + exts.indexOf(ext),
        });
      }
    }

    for (const ext of exts) {
      candidates.push({
        url: `images/${key}.${ext}`,
        order: 9999 + exts.indexOf(ext),
      });
    }

    const probes = await Promise.allSettled(
      candidates.map(c => this.#probeImage(c.url))
    );

    const found = [];
    for (let i = 0; i < probes.length; i++) {
      if (probes[i].status === 'fulfilled' && probes[i].value === true) {
        found.push({
          url: candidates[i].url,
          order: candidates[i].order,
          idx: i,
        });
      }
    }

    found.sort((a, b) => a.order - b.order || a.idx - b.idx);

    const out = [];
    const seen = new Set();
    for (const f of found) {
      if (!seen.has(f.url)) {
        out.push(f.url);
        seen.add(f.url);
      }
      if (out.length >= maxImages) break;
    }

    return out;
  }

  #probeImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `${url}?_probe=${Date.now()}`;
    });
  }

  #backgroundPreload(skipIndex = 0) {
    const urls = this.urls.filter((_, i) => i !== skipIndex);
    if (!urls.length) return;

    const run = () => {
      urls.forEach(u => {
        const img = new Image();
        img.decoding = 'async';
        img.src = u;
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 500);
    }
  }

  // -------------------------------
  // No-meta rendering
  // -------------------------------
  #renderNoMeta() {
    // We use innerHTML to create a stacked layout: emoji above the message.
    // Keep it simple so you can style it via CSS.
    this.placeholderTextEl.innerHTML = `
      <div class="no-meta-emoji" aria-hidden="true">⚠</div>
      <div class="no-meta-text">No meta available</div>
    `;
  }
}
