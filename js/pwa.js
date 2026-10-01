/* Installable app support: registers the service worker (offline play),
 * shows the Install button and small notices for "offline ready" / updates. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const t = key => {
    const lang = document.documentElement.lang;
    return (UI_STRINGS[lang] && UI_STRINGS[lang][key]) || UI_STRINGS.en[key] || key;
  };

  // ---------------------------------------------------------------- notices
  let toastTimer = null;
  function showToast(key, actionKey, onAction) {
    clearTimeout(toastTimer);
    $('toastText').dataset.i18n = key; // re-translated if the language changes
    $('toastText').textContent = t(key);
    const btn = $('toastAction');
    btn.hidden = !actionKey;
    if (actionKey) {
      btn.dataset.i18n = actionKey;
      btn.textContent = t(actionKey);
      btn.onclick = onAction;
    } else {
      toastTimer = setTimeout(hideToast, 5000);
    }
    $('toast').hidden = false;
  }
  function hideToast() { $('toast').hidden = true; }
  $('toastClose').addEventListener('click', hideToast);

  // ---------------------------------------------------------------- install
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let deferredPrompt = null;

  function refreshInstallButton() {
    $('btnInstall').hidden = standalone();
  }

  window.addEventListener('beforeinstallprompt', e => {
    // Keep the browser's prompt for our own Install button.
    e.preventDefault();
    deferredPrompt = e;
    refreshInstallButton();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    $('btnInstall').hidden = true;
  });

  $('btnInstall').addEventListener('click', async () => {
    if (deferredPrompt) {
      const p = deferredPrompt;
      deferredPrompt = null;
      p.prompt();
      try { await p.userChoice; } catch (e) { /* ignore */ }
      return;
    }
    // No built-in prompt (iPhone/iPad, Safari, Firefox…): show how to do it by hand.
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
    const android = /Android/.test(ua);
    $('installIos').hidden = android;
    $('installAndroid').hidden = ios;
    $('installDesktop').hidden = ios || android;
    window.ChessUI.openModal('installModal');
  });

  refreshInstallButton();

  // ---------------------------------------------------------------- offline
  // Service workers need http(s); opening index.html from disk still works, just not offline-cached.
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;

  window.addEventListener('load', async () => {
    let reg;
    try {
      reg = await navigator.serviceWorker.register('sw.js');
    } catch (e) {
      return;
    }
    const firstInstall = !navigator.serviceWorker.controller;

    let updating = false;
    const offerUpdate = worker => {
      showToast('updateReady', 'reload', () => {
        hideToast();
        updating = true;
        worker.postMessage('skipWaiting');
      });
    };
    if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);

    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state !== 'installed') return;
        if (navigator.serviceWorker.controller) offerUpdate(worker);
        else if (firstInstall) showToast('offlineReady');
      });
    });

    // When the updated worker takes over, reload once so every file is the new version.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!updating) return;
      updating = false;
      location.reload();
    });

    // Long-running app sessions (installed on a phone) still pick up new versions.
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  });
})();
