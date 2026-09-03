import React from 'react';
import { copyToClipboard } from '@/lib/utils';
import themeData from '@/lib/theme-colors.json';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    MapPin,
    ShieldCheck,
    MessageCircle,
    FileText,
    Sparkles,
    ChevronRight,
    Building2,
    CheckCircle2,
    Share2,
    Globe,
    BookOpen,
    HeartHandshake,
    Video,
    Quote,
    Plane,
    PhoneCall,
} from 'lucide-react';
import { PageProps, LandingLinkItem, SocialLinks } from '@/Types';
import { Badge } from '@/Components/ui/badge';

interface Props extends PageProps {
    agent: any;
    tenant: any;
    packages?: any[];
    registerUrl: string;
}

export default function Profile({ agent, tenant, registerUrl }: Props) {
    const defaultQuote = "Setiap langkah Anda menuju Tanah Suci adalah perjalanan hati yang berharga. Saya berkomitmen hadir di setiap momennya—menyiapkan yang terbaik, menjaga kenyamanan, dan memastikan Anda dapat beribadah dengan tenang dan khusyuk. Bersama-sama, kita wujudkan perjalanan spiritual yang tak terlupakan.";

    // WhatsApp phone resolution: Agent Personal & Tenant Business Phone
    const rawAgentWa = agent.no_hp ? agent.no_hp.replace(/[^0-9]/g, '') : '';
    const formattedAgentWa = rawAgentWa ? (rawAgentWa.startsWith('0') ? '62' + rawAgentWa.slice(1) : rawAgentWa) : '628123456789';

    const rawTenantWa = tenant?.no_telepon ? tenant.no_telepon.replace(/[^0-9]/g, '') : '';
    const formattedTenantWa = rawTenantWa ? (rawTenantWa.startsWith('0') ? '62' + rawTenantWa.slice(1) : rawTenantWa) : formattedAgentWa;

    const mainWaUrl = `https://wa.me/${formattedAgentWa}?text=${encodeURIComponent(`Assalamu'alaikum ${agent.name}, saya ingin bersilaturahmi dan menanyakan informasi seputar bimbingan ibadah Umroh & Haji di ${tenant?.nama_travel || 'Travel'}.`)}`;

    // Custom landing links or respectful fallback defaults
    const customLinks: LandingLinkItem[] = agent.landing_links && agent.landing_links.length > 0
        ? agent.landing_links
        : [
            {
                title: 'Pendaftaran & Formulir Calon Jamaah',
                url: registerUrl,
                icon: 'form',
                target_type: 'custom_url',
                style_type: 'primary',
                is_highlight: true,
            },
            {
                title: 'Informasi Jadwal & Panduan Manasik',
                url: `${typeof window !== 'undefined' ? window.location.origin : ''}/#paket`,
                icon: 'guide',
                target_type: 'custom_url',
                style_type: 'default',
                is_highlight: false,
            },
        ];

    const resolveLinkHref = (item: LandingLinkItem) => {
        if (item.target_type === 'agent_wa') {
            const msg = item.wa_message || `Assalamu'alaikum ${agent.name}, saya ingin konsultasi seputar bimbingan ibadah Umroh.`;
            return `https://wa.me/${formattedAgentWa}?text=${encodeURIComponent(msg)}`;
        }
        if (item.target_type === 'tenant_wa') {
            const msg = item.wa_message || `Assalamu'alaikum CS ${tenant?.nama_travel || 'Travel'}, saya calon jamaah dari agen ${agent.name} ingin konsultasi paket Umroh.`;
            return `https://wa.me/${formattedTenantWa}?text=${encodeURIComponent(msg)}`;
        }
        if (item.url && item.url.includes('wa.me/6281234567890')) {
            return item.url.replace('wa.me/6281234567890', `wa.me/${formattedAgentWa}`);
        }
        return item.url || '#';
    };

    const getLinkIcon = (iconName?: string) => {
        switch (iconName) {
            case 'whatsapp':
            case 'chat':
                return <MessageCircle className="w-4 h-4" />;
            case 'form':
                return <FileText className="w-4 h-4" />;
            case 'plane':
                return <Plane className="w-4 h-4" />;
            case 'file':
            case 'guide':
                return <BookOpen className="w-4 h-4" />;
            case 'star':
                return <Sparkles className="w-4 h-4" />;
            case 'phone':
                return <PhoneCall className="w-4 h-4" />;
            default:
                return <Globe className="w-4 h-4" />;
        }
    };

    const getLinkClass = (item: LandingLinkItem) => {
        if (item.style_type === 'emerald') {
            return 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm border border-emerald-500/40';
        }
        if (item.style_type === 'primary' || item.is_highlight) {
            return 'bg-primary text-primary-foreground font-semibold shadow-xs border border-primary/30 hover:bg-primary/95';
        }
        return 'bg-card/85 hover:bg-muted text-foreground border border-border/80 hover:border-primary/40 font-medium';
    };

    const socials: SocialLinks = agent.social_links || {};

    // Display title
    const displayTitle = (!agent.jabatan || agent.jabatan.toLowerCase() === 'staff' || agent.jabatan.toLowerCase() === 'agen')
        ? 'Konsultan Bimbingan Umroh'
        : agent.jabatan;

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: `Konsultan Bimbingan Umroh - ${agent.name}`,
                text: `Bimbingan Ibadah Umroh & Haji Amanah bersama ${agent.name} (${tenant?.nama_travel || 'Travel Resmi'})`,
                url: window.location.href,
            }).catch(() => { });
        } else {
            await copyToClipboard(window.location.href);
            alert('Tautan halaman berhasil disalin.');
        }
    };

    return (
        <>
            <Head title={`Bimbingan Ibadah Umroh - ${agent.name} (${tenant?.nama_travel || 'Travel'})`} />

            <div
                className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-between selection:bg-primary selection:text-primary-foreground relative px-4 py-8 sm:py-12"
                style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'coffee']?.variables || themeData.themes['coffee'].variables) as React.CSSProperties}
            >
                {/* Background Ambient Glows & Subtle Islamic Radial Motif */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary/10 rounded-full blur-3xl opacity-60" />
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 h-64 border border-primary/10 rounded-full opacity-40 animate-pulse" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm h-64 bg-primary/5 rounded-full blur-2xl opacity-40" />
                </div>

                {/* Main Linktree Card Container */}
                <main className="w-full max-w-md mx-auto flex flex-col items-center gap-5 relative z-10">
                    {/* Top Travel Info & Share */}
                    <div className="w-full flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shadow-xs">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[11px] font-bold text-foreground leading-tight">
                                    {tenant?.nama_travel || 'Official Travel'}
                                </span>
                                <span className="text-[9px] text-muted-foreground">Penyelenggara Resmi Umroh &amp; Haji</span>
                            </div>
                        </div>

                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full bg-card hover:bg-muted border border-border/80 shadow-xs text-muted-foreground hover:text-foreground transition-all"
                            title="Bagikan Tautan"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Agent Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center text-center gap-3 w-full"
                    >
                        {/* Avatar with Sacred Ring */}
                        <div className="relative">
                            <div className="p-1.5 rounded-full ring-4 ring-primary/20 bg-card shadow-md">
                                <img
                                    src={agent.avatar_url || (agent.avatar ? `/storage/${agent.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=6F4E37&color=fff&size=256`)}
                                    alt={agent.name}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-background bg-background"
                                />
                            </div>
                            <div className="absolute bottom-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md border-2 border-background" title="Konsultan Bimbingan Terverifikasi">
                                <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="flex flex-col items-center gap-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                                {agent.name}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold text-[10px] tracking-wide px-2.5 py-0.5">
                                    {displayTitle}
                                </Badge>
                                {agent.kota && (
                                    <Badge variant="outline" className="text-[10px] font-medium border-border/80 gap-1 text-muted-foreground">
                                        <MapPin className="w-3 h-3 text-primary" />
                                        <span>{agent.kota}</span>
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Warm Commitment & Bio Slogan with Luxury Styling */}
                        <div className="w-full p-4.5 rounded-2xl bg-gradient-to-b from-card/90 to-card/60 backdrop-blur-md border border-border/80 shadow-xs text-left relative overflow-hidden group">
                            {/* Subtle Background Watermark */}
                            <Quote className="absolute top-2 right-3 w-10 h-10 text-primary/10 -rotate-12 pointer-events-none transition-transform group-hover:scale-110" />

                            <div className="flex items-start gap-2.5 relative z-10 p-5">
                                <div className="p-1 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <Quote className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-foreground/85 font-normal leading-relaxed">
                                        {agent.bio && agent.bio.trim() !== '' ? agent.bio : defaultQuote}
                                    </p>
                                    <div className="flex items-center gap-2 pt-0.5">
                                        <div className="h-px w-5 bg-primary/40" />
                                        <span className="text-[10px] font-semibold text-primary tracking-wide">
                                            Komitmen Pelayanan Konsultan
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Serene Trust Points */}
                        <div className="grid grid-cols-3 gap-2 w-full pt-0.5">
                            <div className="p-2.5 rounded-xl bg-card/40 border border-border/50 flex flex-col items-center text-center">
                                <HeartHandshake className="w-4 h-4 text-primary mb-1" />
                                <span className="text-[10px] font-medium text-foreground">Pendampingan Khusyuk</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/40 border border-border/50 flex flex-col items-center text-center">
                                <BookOpen className="w-4 h-4 text-primary mb-1" />
                                <span className="text-[10px] font-medium text-foreground">Sesuai Sunnah</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/40 border border-border/50 flex flex-col items-center text-center">
                                <CheckCircle2 className="w-4 h-4 text-primary mb-1" />
                                <span className="text-[10px] font-medium text-foreground">Resmi Kemenag</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* WhatsApp Serene Emerald Button (Kontak Utama) */}
                    <motion.a
                        href={mainWaUrl}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        className="w-full p-3.5 rounded-2xl bg-emerald-700/90 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-between shadow-sm transition-all border border-emerald-600/40"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-white/15 text-white shrink-0">
                                <MessageCircle className="w-4 h-4 fill-white" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-xs sm:text-sm">Konsultasi &amp; Tanya Jawab Bimbingan</span>
                                <span className="text-[10px] text-emerald-100 font-normal">Hubungi langsung via WhatsApp (+{formattedAgentWa})</span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
                    </motion.a>

                    {/* Action Links (Refined, Non-Aggressive) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="w-full flex flex-col gap-2.5"
                    >
                        {customLinks.map((item, index) => {
                            const finalHref = resolveLinkHref(item);
                            const isInternal = finalHref.startsWith('/') || (typeof window !== 'undefined' && finalHref.includes(window.location.host));
                            const targetType = item.target_type || (finalHref.includes('wa.me') ? (rawTenantWa && finalHref.includes(formattedTenantWa) ? 'tenant_wa' : 'agent_wa') : undefined);
                            const cardClass = getLinkClass(item);

                            return (
                                <motion.a
                                    key={index}
                                    href={finalHref}
                                    target={isInternal ? '_self' : '_blank'}
                                    rel="noreferrer"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`w-full p-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-xs ${cardClass}`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 rounded-xl shrink-0 bg-black/10 dark:bg-white/10">
                                            {getLinkIcon(item.icon)}
                                        </div>
                                        <div className="flex flex-col text-left min-w-0">
                                            <span className="text-xs sm:text-sm leading-snug font-bold">{item.title}</span>
                                            {targetType === 'tenant_wa' && (
                                                <span className="text-[10px] opacity-75 font-normal">➔ CS Induk Travel</span>
                                            )}
                                            {targetType === 'agent_wa' && (
                                                <span className="text-[10px] opacity-75 font-normal">➔ WA Pribadi Agen</span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 shrink-0 opacity-80" />
                                </motion.a>
                            );
                        })}
                    </motion.div>

                    {/* Social Media Bar */}
                    {(socials.instagram || socials.tiktok || socials.youtube || socials.facebook) && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                            {socials.instagram && (
                                <a
                                    href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-pink-500 border border-border/80 shadow-xs transition-colors"
                                    title="Instagram"
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {socials.tiktok && (
                                <a
                                    href={`https://tiktok.com/@${socials.tiktok.replace('@', '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 shadow-xs transition-colors"
                                    title="TikTok"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {socials.youtube && (
                                <a
                                    href={socials.youtube.startsWith('http') ? socials.youtube : `https://youtube.com/@${socials.youtube}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-red-500 border border-border/80 shadow-xs transition-colors"
                                    title="YouTube"
                                >
                                    <Video className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {socials.facebook && (
                                <a
                                    href={socials.facebook.startsWith('http') ? socials.facebook : `https://facebook.com/${socials.facebook}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-blue-500 border border-border/80 shadow-xs transition-colors"
                                    title="Facebook"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    )}

                    {/* Respectful Footer */}
                    <footer className="pt-3 pb-2 flex flex-col items-center gap-1 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/50 text-[10px] font-medium text-muted-foreground">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            <span>Layanan Konsultasi Resmi &amp; Amanah</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60">
                            &copy; {new Date().getFullYear()} {tenant?.nama_travel || 'Travel'}. Semoga menjadi langkah awal ibadah yang mabrur.
                        </p>
                    </footer>
                </main>
            </div>
        </>
    );
}
