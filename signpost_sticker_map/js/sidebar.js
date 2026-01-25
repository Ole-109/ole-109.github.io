// js/sidebar.js
// Version 1.0.1

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
 * Show the ⚠ No meta available message in the image placeholder
 * @param {string} text Optional text override
 */
export function showNoMeta(text = 'No meta available') {
  const placeholder = document.getElementById('imagePlaceholder');
  const placeholderText = document.getElementById('placeholderText');
  const prefImage = document.getElementById('prefImage');
  const imagePreview = document.getElementById('imagePreview');
  const galleryInfo = document.getElementById('galleryInfo');

  // Hide image and preview
  prefImage.style.display = 'none';
  imagePreview.innerHTML = '';
  galleryInfo.textContent = '';

  // Show placeholder with ⚠ emoji above text
  placeholder.style.display = 'flex';
  placeholderText.innerHTML = `
    <span class="no-meta-emoji">⚠</span>
    <span class="no-meta-text">${text}</span>
  `;
}

/**
 * Show a loading spinner centered in the placeholder
 * @param {string} text Optional text to show below spinner
 */
export function showLoading(text = 'Loading image...') {
  const placeholder = document.getElementById('imagePlaceholder');
  const placeholderText = document.getElementById('placeholderText');
  const prefImage = document.getElementById('prefImage');
  const imagePreview = document.getElementById('imagePreview');
  const galleryInfo = document.getElementById('galleryInfo');

  // Hide image and preview
  prefImage.style.display = 'none';
  imagePreview.innerHTML = '';
  galleryInfo.textContent = '';

  // Show spinner and text
  placeholder.style.display = 'flex';
  placeholderText.innerHTML = `
    <div class="spinner"></div>
    <span class="no-meta-text">${text}</span>
  `;
}
