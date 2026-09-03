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
