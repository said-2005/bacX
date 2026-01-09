// ==============================================================================
// V17: THE ALERT BOMBER - Primitive Click Hijacker
// ==============================================================================
// This script runs IMMEDIATELY and uses window.alert() to diagnose navigation.
// If the alert appears but the page doesn't load, Next.js Router is the killer.
// ==============================================================================

(function V17_ALERT_BOMBER() {
    'use strict';

    // Flag to prevent infinite loops
    let isNavigating = false;

    // Store last known location for trace
    let lastClickTarget = null;
    let lastClickTime = 0;

    console.log('[V17] 🚨 ALERT BOMBER ACTIVATED');

    // =========================================================================
    // GLOBAL CLICK HIJACKER
    // =========================================================================
    document.addEventListener('click', function (e) {
        // Find the actual link element (might be nested)
        let target = e.target;
        let href = null;
        let attempts = 0;

        // Walk up the DOM to find an anchor or button with navigation
        while (target && attempts < 10) {
            if (target.tagName === 'A' && target.href) {
                href = target.href;
                break;
            }
            if (target.tagName === 'BUTTON' && target.dataset && target.dataset.href) {
                href = target.dataset.href;
                break;
            }
            // Check for onClick that might call router.push
            if (target.onclick || target.getAttribute('onclick')) {
                lastClickTarget = target;
                lastClickTime = Date.now();
                console.log('[V17] 📌 CLICK on element with onClick:', target.tagName, target.className);
            }
            target = target.parentElement;
            attempts++;
        }

        if (href && !isNavigating) {
            // Check if it's an internal navigation (same origin)
            try {
                const url = new URL(href, window.location.origin);
                const isInternal = url.origin === window.location.origin;

                if (isInternal) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    isNavigating = true;

                    // THE ALERT PROBE
                    const confirmed = confirm(
                        '🎯 V17 CLICK DETECTED!\n\n' +
                        '📍 Target: ' + url.pathname + '\n' +
                        '🔗 Full URL: ' + href + '\n\n' +
                        'Click OK to navigate with window.location (bypass Next.js)\n' +
                        'Click CANCEL to let Next.js handle it'
                    );

                    if (confirmed) {
                        // ROUTER BYPASS - Use raw window.location
                        console.log('[V17] 🚀 BYPASSING ROUTER with window.location.href');
                        window.location.href = href;
                    } else {
                        // Let Next.js handle it but monitor
                        console.log('[V17] ⚠️ Letting Next.js Router handle navigation...');
                        isNavigating = false;

                        // Set a watchdog
                        const watchdog = setTimeout(function () {
                            alert(
                                '💀 NEXT.JS ROUTER FROZE!\n\n' +
                                'The router did not complete navigation in 3 seconds.\n' +
                                'Target was: ' + url.pathname + '\n\n' +
                                'The Next.js Router is the MURDERER!'
                            );
                        }, 3000);

                        // Clear watchdog if we navigate
                        window.addEventListener('beforeunload', function () {
                            clearTimeout(watchdog);
                        }, { once: true });
                    }

                    return false;
                }
            } catch (err) {
                console.log('[V17] URL parse error:', err);
            }
        }
    }, true); // Use capture phase to intercept before React

    // =========================================================================
    // SILENT ERROR CAPTURE - Monitor for 500 errors
    // =========================================================================

    // Override fetch to catch errors
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        try {
            const response = await originalFetch.apply(this, args);

            if (response.status >= 500) {
                const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
                alert(
                    '💥 SERVER EXPLODED!\n\n' +
                    '❌ Status: ' + response.status + '\n' +
                    '📍 URL: ' + url + '\n' +
                    '⏱️ Time: ' + new Date().toISOString()
                );
            }

            return response;
        } catch (error) {
            alert(
                '💥 FETCH FAILED!\n\n' +
                '❌ Error: ' + (error.message || error) + '\n' +
                '📍 URL: ' + (typeof args[0] === 'string' ? args[0] : 'unknown')
            );
            throw error;
        }
    };

    // Catch unhandled errors
    window.addEventListener('error', function (e) {
        alert(
            '🔴 JAVASCRIPT ERROR!\n\n' +
            '❌ Message: ' + e.message + '\n' +
            '📁 File: ' + (e.filename || 'unknown') + '\n' +
            '📍 Line: ' + (e.lineno || '?') + ':' + (e.colno || '?')
        );
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function (e) {
        alert(
            '🔴 PROMISE REJECTED!\n\n' +
            '❌ Reason: ' + (e.reason?.message || e.reason || 'unknown')
        );
    });

    console.log('[V17] ✅ All interceptors installed');
})();
