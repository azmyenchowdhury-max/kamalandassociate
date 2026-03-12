// Theme initialization script
// Runs early to avoid flash of incorrect theme on initial load.
(function () {
  document.documentElement.classList.add('dark-mode');
  try {
    localStorage.setItem('theme', 'dark');
  } catch (e) {
    // LocalStorage may be unavailable (private mode), fall back to default.
  }
})();
