import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Membangun URL Bio Link Agen dengan subdomain tenant yang sesuai.
 * Contoh: http://barokah.localhost:8000/agen/AG-DXPP4B
 */
export function getAgentBioUrl(referralCode?: string | null, tenantSubdomain?: string | null): string {
    if (!referralCode || typeof window === 'undefined') return '';

    const subdomain = tenantSubdomain || 'barokah';
    const { protocol, hostname, port } = window.location;
    const portSuffix = port ? `:${port}` : '';

    // Jika hostname sudah diawali dengan subdomain tenant
    if (hostname.startsWith(`${subdomain}.`)) {
        return `${protocol}//${hostname}${portSuffix}/agen/${referralCode}`;
    }

    // Jika di localhost / IP lokal
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${subdomain}.localhost${portSuffix}/agen/${referralCode}`;
    }

    // Jika di domain production
    const parts = hostname.split('.');
    if (parts.length >= 2) {
        const domainRoot = parts.slice(-2).join('.');
        return `${protocol}//${subdomain}.${domainRoot}${portSuffix}/agen/${referralCode}`;
    }

    return `${protocol}//${subdomain}.${hostname}${portSuffix}/agen/${referralCode}`;
}

/**
 * Universal clipboard copy supporting both Secure Contexts (HTTPS/localhost)
 * and non-secure HTTP IP address environments with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!text || typeof window === 'undefined') return false;

    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        // proceed to legacy fallback
    }

    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        return false;
    }
}
