// js/sidebar.js v1.0.2

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
 * Show a ⚠ No meta available message in the image placeholder
 * @param {string} text Optional text override
 */
export function showNoMeta(text = 'No meta available') {
  const placeholder = document.getElementById('imagePlaceholder');
  const placeholderText = document.getElementById('placeholderText');
  const prefImage = document.getElementById('prefImage');
  const previewEl = document.getElementById('imagePreview');
  const galleryInfo = document.getElementById('galleryInfo');

  // Hide image element and preview
  prefImage.style.display = 'none';
  previewEl.innerHTML = '';
  galleryInfo.textContent = '';

  // Display placeholder with ⚠ and text only
  placeholder.style.display = 'flex';
  placeholderText.innerHTML = `<span class="no-meta-emoji">⚠</span><span class="no-meta-text">${text}</span>`;
}

/**
 * Show a single centered spinner while loading images
 * @param {string} text Optional loading text
 */
export function showLoading(text = 'Loading...') {
  const placeholder = document.getElementById('imagePlaceholder');
  const placeholderText = document.getElementById('placeholderText');
  const prefImage = document.getElementById('prefImage');
  const previewEl = document.getElementById('imagePreview');
  const galleryInfo = document.getElementById('galleryInfo');

  // Hide image element and preview
  prefImage.style.display = 'none';
  previewEl.innerHTML = '';
  galleryInfo.textContent = '';

  // Show placeholder with spinner and text
  placeholder.style.display = 'flex';
  placeholderText.innerHTML = `<div class="spinner"></div><span class="no-meta-text">${text}</span>`;
}
