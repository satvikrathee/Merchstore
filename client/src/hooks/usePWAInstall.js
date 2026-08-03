// ─── src/hooks/usePWAInstall.js ─────────────────────────────────────────────────
// Captures the browser `beforeinstallprompt` event and provides:
//  - isInstallable  → true only when browser has a real prompt ready
//  - isInstalled    → true when app is already running as a PWA
//  - installPWA()   → calls deferredPrompt.prompt() directly (no fake modal)
//  - isUnsupported  → true when browser never fired beforeinstallprompt (no PWA support)

import { useState, useEffect, useRef } from 'react';

export const usePWAInstall = () => {
  const deferredPromptRef = useRef(null);
  const [isInstallable, setIsInstallable]   = useState(false);
  const [isInstalled,   setIsInstalled]     = useState(false);
  const [isUnsupported, setIsUnsupported]   = useState(false);

  useEffect(() => {
    // Already running in standalone / installed mode?
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (alreadyInstalled) {
      setIsInstalled(true);
      return; // No need to listen for install prompt
    }

    // Wait a few seconds — if no beforeinstallprompt fires, browser doesn't support PWA install
    const unsupportedTimer = setTimeout(() => {
      if (!deferredPromptRef.current) {
        setIsUnsupported(true);
      }
    }, 3000);

    const handleBeforeInstallPrompt = (e) => {
      // Critical: Prevent default mini-infobar / banner from auto-showing
      e.preventDefault();
      deferredPromptRef.current = e;
      setIsInstallable(true);
      setIsUnsupported(false);
      clearTimeout(unsupportedTimer);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(unsupportedTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Triggers the REAL native browser install dialog.
   * Only works when deferredPromptRef.current is available.
   */
  const installPWA = async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    // Show native browser install dialog
    prompt.prompt();

    try {
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    } catch (_) {
      // userChoice may reject in some browsers — safe to ignore
    } finally {
      deferredPromptRef.current = null;
    }
  };

  return { isInstallable, isInstalled, isUnsupported, installPWA };
};
