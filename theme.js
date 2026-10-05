// Apply the saved theme before styles load to avoid a flash between pages.
(() => {
  let theme = 'dark';
  try {
    if (localStorage.getItem('chess-room-theme') === 'light') theme = 'light';
  } catch {}
  document.documentElement.dataset.theme = theme;
})();
