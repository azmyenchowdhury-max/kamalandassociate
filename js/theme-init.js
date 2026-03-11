// Theme initialization script
// Runs early to avoid flash of incorrect theme on initial load.
(function () {
  try {
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark-mode');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark-mode');
    }
  } catch (e) {
    // LocalStorage may be unavailable (private mode), fall back to default.
  }
})();
