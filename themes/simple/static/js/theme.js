/* Apply before first paint; storage is optional in private browsing. */
try { const t = localStorage.getItem('jim-theme'); if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t; } catch (_) {}
