// js/sidebar.js

// -------------------------------
// DOM references
// -------------------------------
const sidebar = document.getElementById('sidebar');
const prefNameEnEl = document.getElementById('prefNameEn');
const prefNameJaEl = document.getElementById('prefNameJa');

// -------------------------------
// Public API
// -------------------------------

export function openSidebar() {
  sidebar.classList.remove('closing');
  sidebar.classList.add('open');
  sidebar.setAttribute('aria-hidden', 'false');
}

export function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.classList.add('closing');
  sidebar.setAttribute('aria-hidden', 'true');
}

export function setPrefectureNames(nameEn, nameJa = '') {
  prefNameEnEl.textContent = nameEn || '';
  prefNameJaEl.textContent = nameJa || '';
}

// -------------------------------
// Optional helpers
// -------------------------------

export function isSidebarOpen() {
  return sidebar.classList.contains('open');
}
