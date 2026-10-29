import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Membangun URL Bio Link Agen dengan subdomain tenant yang sesuai.
 * Mendukung nip.io, raw IP, localhost, dan custom domain.
 * Contoh: https://barokah.travel.kolibrinektara.com/agen/AG-06063D
 */
export function getAgentBioUrl(
    referralCode?: string | null,
    tenantSubdomain?: string | null,
    tenantPublicUrl?: string | null
): string {
    if (!referralCode || typeof window === 'undefined') return '';

    // URL publik tenant dihitung server dari APP_URL: host dasar untuk tenant default, selain itu subdomain.
    if (tenantPublicUrl) {
        return `${tenantPublicUrl.replace(/\/$/, '')}/agen/${referralCode}`;
    }

    const subdomain = tenantSubdomain || 'hajjflow';
    const { protocol, hostname, port } = window.location;
    const portSuffix = port ? `:${port}` : '';

    // 1. Jika sudah berada di subdomain yang tepat
    if (hostname.startsWith(`${subdomain}.`)) {
        return `${protocol}//${hostname}${portSuffix}/agen/${referralCode}`;
    }

    // 2. Jika di localhost / 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${subdomain}.localhost${portSuffix}/agen/${referralCode}`;
    }

    // 3. Jika menggunakan wildcard DNS nip.io / sslip.io (misal: 72.62.125.68.nip.io atau tenant.72.62.125.68.nip.io)
    if (hostname.includes('.nip.io') || hostname.includes('.sslip.io')) {
        // Ambil root IP + nip.io (misal: 72.62.125.68.nip.io)
        const nipMatch = hostname.match(/(\d+\.\d+\.\d+\.\d+\.(?:nip|sslip)\.io)/);
        if (nipMatch) {
            return `${protocol}//${subdomain}.${nipMatch[1]}${portSuffix}/agen/${referralCode}`;
        }
    }

    // 4. Jika hostname adalah angka IPv4 mentah (misal: 72.62.125.68)
    const isRawIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (isRawIp) {
        return `${protocol}//${subdomain}.${hostname}.nip.io${portSuffix}/agen/${referralCode}`;
    }

    // 5. Jika custom domain biasa (misal: travelumroh.com atau app.travelumroh.com)
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
