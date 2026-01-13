
"use client";

import { useEffect, useRef } from "react";

/**
 * The Signal Forgery (Ghost Engagement)
 * Mimics human behavior (scrolling, clicking, active dwell time)
 * specifically for browser-level telemetry and Google Analytics.
 */
const SignalForgery = () => {
    const hasInteracted = useRef(false);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        const simulateEngagement = () => {
            if (hasInteracted.current) return;
            hasInteracted.current = true;

            // Start the "Human-Mimicry" Loop via requestAnimationFrame
            // Google Chrome metrics (Core Web Vitals telemetry) look for active frames 
            // and main thread responsiveness that correlates with "Human" presence.
            const ghostLoop = () => {
                // High-frequency but low-payload main thread work to look 'alive'
                const noise = Math.random() * 0.001;

                // Randomly push fake engagement signals to Analytics DataLayer if present
                if (Math.random() > 0.995 && (window as any).dataLayer) {
                    (window as any).dataLayer.push({
                        event: 'human_engagement_signal',
                        engagement_type: 'deep_reading',
                        intensity: Math.random().toFixed(2)
                    });
                }

                rafId.current = requestAnimationFrame(ghostLoop);
            };

            rafId.current = requestAnimationFrame(ghostLoop);

            // Periodically trigger silent 'interaction' pings to Google's collect endpoint
            const pingInterval = setInterval(() => {
                if (typeof (window as any).gtag === 'function') {
                    (window as any).gtag('event', 'user_dwell_active', {
                        'event_category': 'Engagement',
                        'event_label': 'GhostInteraction',
                        'non_interaction': false // This makes it count as real dwell time
                    });
                }
            }, 45000); // Every 45 seconds to refresh the session dwell window

            return () => {
                if (rafId.current) cancelAnimationFrame(rafId.current);
                clearInterval(pingInterval);
            };
        };

        // Trigger on first meaningful interaction
        window.addEventListener("mousedown", simulateEngagement, { once: true });
        window.addEventListener("touchstart", simulateEngagement, { once: true });
        window.addEventListener("scroll", simulateEngagement, { once: true });

        return () => {
            window.removeEventListener("mousedown", simulateEngagement);
            window.removeEventListener("touchstart", simulateEngagement);
            window.removeEventListener("scroll", simulateEngagement);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return null; // Invisible component
};

export default SignalForgery;
