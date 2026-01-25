// js/sidebar.js

/**
 * Open the sidebar
 */
export function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('closing');
  sidebar.classList.add('open');
}

/**
 * Close the sidebar
 */
export function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('open');
  sidebar.classList.add('closing');
}

/**
 * Set prefecture names in the sidebar
 * @param {string} nameEn English name
 * @param {string} nameJa Japanese name
 */
export function setPrefectureNames(nameEn, nameJa) {
  const elEn = document.getElementById('prefNameEn');
  const elJa = document.getElementById('prefNameJa');

  elEn.innerText = nameEn;
  elJa.innerText = nameJa;
}

/**
 * Show spinner for loading images
 * @param {string} text Optional text under spinner
 */
export function showLoading(text = 'Loading image...') {
  const placeholder = document.getElementById('imagePlaceholder');
  const placeholderText = document.getElementById('placeholderText');
  const imageEl = document.getElementById('prefImage');
  const previewEl = document.getElementById('imagePreview');
  const galleryInfo = document.getElementById('galleryInfo');

  placeholder.style.display = 'flex';
  imageEl.style.display = 'none';
  previewEl.innerHTML = '';
  galleryInfo.textContent = '';

  // Use stacked layout
  placeholderText.innerHTML = `
    <div class="stacked">
      <span class="spinner"></span>
      <span class="loading-text">${text}</span>
    </div>
  `;
}

/**
 * Show the ⚠ No meta available message in the image placeholder
 * @param {string} text Optional text override
 */
export function showNoMeta(text = 'No meta available') {
  const placeholder = document.getElementById('imagePlaceholder');
  const placeholderText = document.getElementById('placeholderText');
  const imageEl = document.getElementById('prefImage');
  const previewEl = document.getElementById('imagePreview');
  const galleryInfo = document.getElementById('galleryInfo');

  placeholder.style.display = 'flex';
  imageEl.style.display = 'none';
  previewEl.innerHTML = '';
  galleryInfo.textContent = '';

  // Use stacked layout
  placeholderText.innerHTML = `
    <div class="stacked">
      <span class="no-meta-emoji">⚠</span>
      <span class="no-meta-text">${text}</span>
    </div>
  `;
}
