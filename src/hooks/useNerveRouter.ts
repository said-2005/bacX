"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

// ==============================================================================
// V14: useNerveRouter - Drop-in replacement for useRouter with diagnostics
// ==============================================================================
// Automatically routes through NerveSniper when active for freeze detection.
// Usage: Replace `const router = useRouter()` with `const router = useNerveRouter()`
// ==============================================================================

export function useNerveRouter() {
    const router = useRouter();

    const push = useCallback((href: string) => {
        // If Nerve Sniper is active, use intercepted push
        if (typeof window !== "undefined" && window.__NERVE_SNIPER_ACTIVE && window.__NERVE_INTERCEPT_PUSH) {
            console.log(`[NERVE] 🔫 Intercepting navigation to: ${href}`);
            window.__NERVE_INTERCEPT_PUSH(href);
        } else {
            router.push(href);
        }
    }, [router]);

    const replace = useCallback((href: string) => {
        // Replace doesn't need interception, but log for awareness
        if (typeof window !== "undefined" && window.__NERVE_SNIPER_ACTIVE) {
            console.log(`[NERVE] router.replace: ${href} (not intercepted)`);
        }
        router.replace(href);
    }, [router]);

    return {
        ...router,
        push,
        replace,
    };
}

export default useNerveRouter;
