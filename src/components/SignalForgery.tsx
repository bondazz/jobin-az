
"use client";

import { useEffect, useRef } from "react";

/**
 * Enhanced Signal Forgery (v2.0 - Persistence Overdrive)
 * 1. Works in background tabs using setInterval (more reliable than RAF in background)
 * 2. Simulates real human engagement for exactly 5 minutes (300 seconds)
 * 3. Uses real browser APIs to ensure the REAL IP is always sent to GA4
 * 4. Communicates with Service Worker to keep the session "warm"
 */
const SignalForgery = () => {
    const sessionStartTime = useRef<number>(Date.now());
    const TOTAL_TARGET_DWELL_MS = 305000; // ~5 minutes 
    const isRunning = useRef(true);

    useEffect(() => {
        const GA_ID = "G-41WK4BQ35T";

        const sendGhostSignal = () => {
            if (!isRunning.current) return;

            const elapsed = Date.now() - sessionStartTime.current;
            if (elapsed > TOTAL_TARGET_DWELL_MS) {
                isRunning.current = false;
                return;
            }

            // Push noise to dataLayer for internal Chrome/GA telemetry
            if ((window as any).dataLayer) {
                (window as any).dataLayer.push({
                    event: 'engagement_heartbeat',
                    timestamp: new Date().toISOString(),
                    ghost_activity: true,
                    dwell_elapsed: Math.round(elapsed / 1000)
                });
            }

            // Force a real GA event that counts as "Active" 
            // We use gtag directly to ensure it uses the user's real browser session and IP
            if (typeof (window as any).gtag === 'function') {
                (window as any).gtag('event', 'user_deep_engagement', {
                    'engagement_time_msec': 10000, // Tell GA they were active for 10s
                    'page_location': window.location.href,
                    'page_title': document.title,
                    'non_interaction': false // CRITICAL: Makes this an "engaged" session
                });
            }

            // Inform the Service Worker to stay alive and prefetch next likely targets
            if (navigator.serviceWorker?.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'GHOST_PULSE',
                    elapsed: elapsed
                });
            }
        };

        // Start the pulse: Every 25 seconds
        const pulse = setInterval(sendGhostSignal, 25000);

        // Immediate first signal
        const initialTimer = setTimeout(sendGhostSignal, 2000);

        // EXTRA: Tab close/Leave insurance
        const handleUnload = () => {
            if (typeof (window as any).gtag === 'function' && isRunning.current) {
                (window as any).gtag('event', 'user_final_engagement', {
                    'engagement_time_msec': 5000,
                    'session_persistence': 'overdrive'
                });
            }
        };

        window.addEventListener("beforeunload", handleUnload);

        // Visibility Change Handler
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                sendGhostSignal(); // Send immediate pulse when they come back
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(pulse);
            clearTimeout(initialTimer);
            window.removeEventListener("beforeunload", handleUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return null; // Invisible
};

export default SignalForgery;
