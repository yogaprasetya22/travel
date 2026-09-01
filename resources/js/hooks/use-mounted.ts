import { useState, useEffect } from 'react';

/**
 * Custom hook to safely determine if a component has mounted on the client.
 * Essential for preventing hydration mismatches, layout shifts, or premature
 * window/localStorage access across different devices and browsers.
 */
export function useMounted(): boolean {
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    return mounted;
}
