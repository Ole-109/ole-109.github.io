// js/sidebar.js v1.0.5

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
 * Used only for gray prefectures (no images at all)
 * @param {string} text Optional text override
 */
export function showNoMeta(text = 'No meta available') {
  const placeholder = document.getElementById('imagePlaceholder');

  // Clear previous content
  placeholder.innerHTML = '';

  // Add ⚠ emoji and text
  const emoji = document.createElement('div');
  emoji.className = 'no-meta-emoji';
  emoji.textContent = '⚠';

  const txt = document.createElement('div');
  txt.className = 'no-meta-text';
  txt.textContent = text;

  placeholder.appendChild(emoji);
  placeholder.appendChild(txt);

  placeholder.style.display = 'flex';
  document.getElementById('placeholderText').style.display = 'none';
  document.getElementById('prefImage').style.display = 'none';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('galleryInfo').textContent = '';
}

/**
 * Show loading spinner centered in placeholder
 * Used only for blue prefectures while loading images
 * @param {string} text Optional placeholder text
 */
export function showLoading(text = 'Loading image...') {
  const placeholder = document.getElementById('imagePlaceholder');

  // Clear previous content
  placeholder.innerHTML = '';

  // Add spinner
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  placeholder.appendChild(spinner);

  // Add text below spinner
  const txt = document.createElement('div');
  txt.id = 'placeholderText';
  txt.textContent = text;
  placeholder.appendChild(txt);

  placeholder.style.display = 'flex';
  document.getElementById('prefImage').style.display = 'none';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('galleryInfo').textContent = '';
}
