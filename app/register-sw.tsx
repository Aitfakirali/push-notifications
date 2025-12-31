"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("✅ Service Worker registered successfully");
            console.log("   Scope:", registration.scope);
            console.log("   State:", registration.active?.state);
            
            // Wait for the service worker to be active
            if (registration.active) {
              console.log("✅ Service Worker is active and ready");
            } else if (registration.installing) {
              console.log("⏳ Service Worker is installing...");
              registration.installing.addEventListener('statechange', (e) => {
                const sw = e.target as ServiceWorker;
                console.log("   SW state changed to:", sw.state);
                if (sw.state === 'activated') {
                  console.log("✅ Service Worker activated!");
                }
              });
            }
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log("🔄 Service Worker update found");
              
              newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log("✅ New Service Worker activated");
                  // Optionally reload the page to use new SW
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            });
          })
          .catch((error) => {
            console.error("❌ Service Worker registration failed:", error);
            console.error("   Make sure you're on HTTPS or localhost");
          });
      });

      // Log when service worker is ready for push
      navigator.serviceWorker.ready.then((registration) => {
        console.log("✅ Service Worker ready for push notifications");
        
        // Check if push manager is available
        if ('pushManager' in registration) {
          console.log("✅ Push Manager is available");
          
          // Check current subscription
          registration.pushManager.getSubscription().then(sub => {
            if (sub) {
              console.log("✅ Already subscribed to push notifications");
            } else {
              console.log("ℹ️ Not subscribed to push notifications yet");
            }
          });
        } else {
          console.warn("⚠️ Push Manager not available");
        }
      });
    } else {
      console.warn("⚠️ Service Workers are not supported in this browser");
    }
  }, []);

  return null;
}

