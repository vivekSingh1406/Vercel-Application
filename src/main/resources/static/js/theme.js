/* Apply the original device preference before first paint. */
(() => {
  try {
    const theme = JSON.parse(localStorage.getItem("gautiyan-tola-theme"));
    if (
      ["default", "green", "sunset", "earth", "night", "warm"].includes(theme)
    )
      document.documentElement.dataset.theme = theme;
  } catch {}
})();
