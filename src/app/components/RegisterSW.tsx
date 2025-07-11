'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    // Check the browser allows service workers
    if ('serviceWorker' in navigator) {
      // Register service worker from /sw.js
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);
    return null;
}
