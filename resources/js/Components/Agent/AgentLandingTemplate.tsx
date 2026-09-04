import React from 'react';
import { copyToClipboard } from '@/lib/utils';
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
import { LandingLinkItem, SocialLinks, Tenant } from '@/Types';
import { Badge } from '@/Components/ui/badge';

export interface AgentData {
    name: string;
    avatar_url?: string | null;
    avatar?: string | null;
    no_hp?: string | null;
    kota?: string | null;
    bio?: string | null;
    jabatan?: string | null;
    referral_code?: string;
    landing_links?: LandingLinkItem[];
    social_links?: SocialLinks;
}

interface AgentLandingTemplateProps {
    agent: AgentData;
    tenant?: Tenant | null;
    registerUrl?: string;
    isPreview?: boolean;
    className?: string;
}

export default function AgentLandingTemplate({
    agent,
    tenant,
    registerUrl,
    isPreview = false,
    className = '',
}: AgentLandingTemplateProps) {
    const defaultQuote =
        'Setiap langkah Anda menuju Tanah Suci adalah perjalanan hati yang berharga. Saya berkomitmen hadir di setiap momennya—menyiapkan yang terbaik, menjaga kenyamanan, dan memastikan Anda dapat beribadah dengan tenang dan khusyuk. Bersama-sama, kita wujudkan perjalanan spiritual yang tak terlupakan.';

    // Phone resolution: Agent & Tenant
    const cleanAgentPhone = (agent.no_hp || '').replace(/[^0-9]/g, '');
    const formattedAgentWa = cleanAgentPhone
        ? cleanAgentPhone.startsWith('0')
            ? '62' + cleanAgentPhone.slice(1)
            : cleanAgentPhone
        : '628123456789';

    const rawTenantWa = (tenant?.no_telepon || '').replace(/[^0-9]/g, '');
    const formattedTenantWa = rawTenantWa
        ? rawTenantWa.startsWith('0')
            ? '62' + rawTenantWa.slice(1)
            : rawTenantWa
        : formattedAgentWa;

    const mainWaUrl = `https://wa.me/${formattedAgentWa}?text=${encodeURIComponent(
        `Assalamu'alaikum ${agent.name}, saya ingin bersilaturahmi dan menanyakan informasi seputar bimbingan ibadah Umroh & Haji di ${tenant?.nama_travel || 'Travel'}.`
    )}`;

    const effectiveRegisterUrl =
        registerUrl || (agent.referral_code ? `/register?ref=${agent.referral_code}` : '/register');

    // Default links if none configured
    const customLinks: LandingLinkItem[] =
        agent.landing_links && agent.landing_links.length > 0
            ? agent.landing_links
            : [
                  {
                      title: 'Pendaftaran & Formulir Calon Jamaah',
                      url: effectiveRegisterUrl,
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
            const msg =
                item.wa_message ||
                `Assalamu'alaikum ${agent.name}, saya ingin konsultasi seputar bimbingan ibadah Umroh.`;
            return `https://wa.me/${formattedAgentWa}?text=${encodeURIComponent(msg)}`;
        }
        if (item.target_type === 'tenant_wa') {
            const msg =
                item.wa_message ||
                `Assalamu'alaikum CS ${tenant?.nama_travel || 'Travel'}, saya calon jamaah dari agen ${agent.name} ingin konsultasi paket Umroh.`;
            return `https://wa.me/${formattedTenantWa}?text=${encodeURIComponent(msg)}`;
        }
        if (item.url && item.url.includes('wa.me/6281234567890')) {
            return item.url.replace('wa.me/6281234567890', `wa.me/${formattedAgentWa}`);
        }
        return item.url || '#';
    };

    const getLinkIcon = (iconName?: string) => {
        const iconClass = isPreview ? 'w-3.5 h-3.5' : 'w-4 h-4';
        switch (iconName) {
            case 'whatsapp':
            case 'chat':
                return <MessageCircle className={iconClass} />;
            case 'form':
                return <FileText className={iconClass} />;
            case 'plane':
                return <Plane className={iconClass} />;
            case 'file':
            case 'guide':
                return <BookOpen className={iconClass} />;
            case 'star':
                return <Sparkles className={iconClass} />;
            case 'phone':
                return <PhoneCall className={iconClass} />;
            default:
                return <Globe className={iconClass} />;
        }
    };

    const getLinkClass = (item: LandingLinkItem) => {
        if (item.style_type === 'emerald') {
            return 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm border border-emerald-500/40';
        }
        if (item.style_type === 'primary') {
            return 'bg-primary text-primary-foreground font-semibold shadow-xs border border-primary/30 hover:bg-primary/95';
        }
        return 'bg-card/85 hover:bg-card text-foreground border border-border/80 hover:border-primary/40 font-medium';
    };

    const socials: SocialLinks = agent.social_links || {};

    const displayTitle =
        !agent.jabatan ||
        agent.jabatan.toLowerCase() === 'staff' ||
        agent.jabatan.toLowerCase() === 'agen'
            ? 'Konsultan Bimbingan Umroh'
            : agent.jabatan;

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator
                .share({
                    title: `Konsultan Bimbingan Umroh - ${agent.name}`,
                    text: `Bimbingan Ibadah Umroh & Haji Amanah bersama ${agent.name} (${tenant?.nama_travel || 'Travel Resmi'})`,
                    url: window.location.href,
                })
                .catch(() => {});
        } else {
            await copyToClipboard(window.location.href);
            alert('Tautan halaman berhasil disalin.');
        }
    };

    const avatarSrc =
        agent.avatar_url ||
        (agent.avatar ? `/storage/${agent.avatar}` : null) ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name || 'Agent')}&background=6F4E37&color=fff&size=256`;

    return (
        <div className={`w-full flex flex-col items-center gap-4 text-center select-none ${className}`}>
            {/* Top Travel Info & Share */}
            <div className="w-full flex items-center justify-between pb-1 border-b border-border/40">
                <div className="flex items-center gap-2 text-left min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-foreground leading-tight truncate">
                            {tenant?.nama_travel || 'Official Travel'}
                        </span>
                        <span className="text-[8.5px] text-muted-foreground truncate">
                            Penyelenggara Resmi Umroh &amp; Haji
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 rounded-full bg-card hover:bg-muted border border-border/80 shadow-xs text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
                    title="Bagikan Tautan"
                >
                    <Share2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Agent Profile Details */}
            <div className="flex flex-col items-center text-center gap-2.5 w-full">
                {/* Avatar with Sacred Ring & Shield */}
                <div className="relative">
                    <div className="p-1 rounded-full ring-4 ring-primary/20 bg-card shadow-md">
                        <img
                            src={avatarSrc}
                            alt={agent.name}
                            className={`${isPreview ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'} rounded-full object-cover border-2 border-background bg-background`}
                        />
                    </div>
                    <div
                        className="absolute bottom-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-1 shadow-md border-2 border-background"
                        title="Konsultan Bimbingan Terverifikasi"
                    >
                        <ShieldCheck className="w-3 h-3" />
                    </div>
                </div>

                {/* Name & Title Badges */}
                <div className="flex flex-col items-center gap-1">
                    <h1 className={`${isPreview ? 'text-base' : 'text-xl sm:text-2xl'} font-bold text-foreground tracking-tight leading-tight`}>
                        {agent.name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                        <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 font-semibold text-[9.5px] tracking-wide px-2.5 py-0.5"
                        >
                            {displayTitle}
                        </Badge>
                        {agent.kota && (
                            <Badge
                                variant="outline"
                                className="text-[9.5px] font-medium border-border/80 gap-1 text-muted-foreground"
                            >
                                <MapPin className="w-2.5 h-2.5 text-primary" />
                                <span>{agent.kota}</span>
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Bio Card with Sacred Quote */}
                <div className="w-full p-3.5 rounded-2xl bg-gradient-to-b from-card/90 to-card/60 backdrop-blur-md border border-border/80 shadow-xs text-left relative overflow-hidden group">
                    <Quote className="absolute top-2 right-3 w-8 h-8 text-primary/10 -rotate-12 pointer-events-none" />

                    <div className="flex items-start gap-2.5 relative z-10">
                        <div className="p-1 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                            <Quote className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] sm:text-xs text-foreground/85 font-normal leading-relaxed">
                                {agent.bio && agent.bio.trim() !== '' ? agent.bio : defaultQuote}
                            </p>
                            <div className="flex items-center gap-1.5 pt-0.5">
                                <div className="h-px w-4 bg-primary/40" />
                                <span className="text-[9.5px] font-semibold text-primary tracking-wide">
                                    Komitmen Pelayanan Konsultan
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Points */}
                <div className="grid grid-cols-3 gap-1.5 w-full pt-0.5">
                    <div className="p-2 rounded-xl bg-card/40 border border-border/50 flex flex-col items-center text-center">
                        <HeartHandshake className="w-3.5 h-3.5 text-primary mb-0.5" />
                        <span className="text-[9px] font-medium text-foreground">Pendampingan Khusyuk</span>
                    </div>

                    <div className="p-2 rounded-xl bg-card/40 border border-border/50 flex flex-col items-center text-center">
                        <BookOpen className="w-3.5 h-3.5 text-primary mb-0.5" />
                        <span className="text-[9px] font-medium text-foreground">Sesuai Sunnah</span>
                    </div>

                    <div className="p-2 rounded-xl bg-card/40 border border-border/50 flex flex-col items-center text-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mb-0.5" />
                        <span className="text-[9px] font-medium text-foreground">Resmi Kemenag</span>
                    </div>
                </div>
            </div>

            {/* Main Emerald Contact WA Button */}
            <motion.a
                href={mainWaUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-between shadow-xs transition-all border border-emerald-500/40"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-white/20 text-white shrink-0">
                        <MessageCircle className="w-4 h-4 fill-white" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs sm:text-sm font-bold leading-tight truncate">
                            Konsultasi &amp; Tanya Jawab Bimbingan
                        </span>
                        <span className="text-[9px] text-emerald-100 font-normal">
                            Hubungi langsung via WhatsApp (+{formattedAgentWa})
                        </span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
            </motion.a>

            {/* Action Cards List */}
            <div className="w-full flex flex-col gap-2">
                {customLinks.map((item, index) => {
                    const finalHref = resolveLinkHref(item);
                    const isInternal =
                        finalHref.startsWith('/') ||
                        (typeof window !== 'undefined' && finalHref.includes(window.location.host));
                    const targetType =
                        item.target_type ||
                        (finalHref.includes('wa.me')
                            ? rawTenantWa && finalHref.includes(formattedTenantWa)
                                ? 'tenant_wa'
                                : 'agent_wa'
                            : undefined);
                    const cardClass = getLinkClass(item);

                    return (
                        <motion.a
                            key={item.id || index}
                            href={finalHref}
                            target={isInternal ? '_self' : '_blank'}
                            rel="noreferrer"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between gap-2.5 shadow-xs ${cardClass}`}
                        >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className="p-1.5 rounded-xl shrink-0 bg-black/10 dark:bg-white/10">
                                    {getLinkIcon(item.icon)}
                                </div>
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="text-xs sm:text-sm leading-snug font-bold truncate">
                                        {item.title || 'Tautan Tanpa Judul'}
                                    </span>
                                    {targetType === 'tenant_wa' && (
                                        <span className="text-[9px] opacity-75 font-normal">➔ CS Induk Travel</span>
                                    )}
                                    {targetType === 'agent_wa' && (
                                        <span className="text-[9px] opacity-75 font-normal">➔ WA Pribadi Agen</span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        </motion.a>
                    );
                })}
            </div>

            {/* Social Media Bar */}
            <div className="flex items-center justify-center gap-2.5 pt-2">
                {socials.instagram ? (
                    <a
                        href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-card hover:bg-muted text-pink-500 border border-border/80 shadow-2xs transition-transform hover:scale-110"
                        title={`Instagram: ${socials.instagram}`}
                    >
                        <Share2 className="w-3.5 h-3.5" />
                    </a>
                ) : isPreview ? (
                    <div className="p-2 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="Instagram (Belum diisi)">
                        <Share2 className="w-3.5 h-3.5" />
                    </div>
                ) : null}

                {socials.tiktok ? (
                    <a
                        href={`https://tiktok.com/@${socials.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-card hover:bg-muted text-foreground border border-border/80 shadow-2xs transition-transform hover:scale-110"
                        title={`TikTok: ${socials.tiktok}`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                    </a>
                ) : isPreview ? (
                    <div className="p-2 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="TikTok (Belum diisi)">
                        <Globe className="w-3.5 h-3.5" />
                    </div>
                ) : null}

                {socials.youtube ? (
                    <a
                        href={socials.youtube.startsWith('http') ? socials.youtube : `https://youtube.com/@${socials.youtube}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-card hover:bg-muted text-red-500 border border-border/80 shadow-2xs transition-transform hover:scale-110"
                        title={`YouTube: ${socials.youtube}`}
                    >
                        <Video className="w-3.5 h-3.5" />
                    </a>
                ) : isPreview ? (
                    <div className="p-2 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="YouTube (Belum diisi)">
                        <Video className="w-3.5 h-3.5" />
                    </div>
                ) : null}

                {socials.facebook ? (
                    <a
                        href={socials.facebook.startsWith('http') ? socials.facebook : `https://facebook.com/${socials.facebook}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-card hover:bg-muted text-blue-500 border border-border/80 shadow-2xs transition-transform hover:scale-110"
                        title={`Facebook: ${socials.facebook}`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                    </a>
                ) : isPreview ? (
                    <div className="p-2 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="Facebook (Belum diisi)">
                        <Globe className="w-3.5 h-3.5" />
                    </div>
                ) : null}
            </div>

            {/* Footer */}
            <footer className="pt-3 pb-2 flex flex-col items-center gap-1 text-center w-full">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/40 border border-border/50 text-[8px] font-medium text-muted-foreground">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span>Layanan Konsultasi Resmi &amp; Amanah</span>
                </div>
                <p className="text-[8px] text-muted-foreground/60 leading-tight">
                    &copy; {new Date().getFullYear()} {tenant?.nama_travel || 'Travel'}. Semoga menjadi langkah awal ibadah yang mabrur.
                </p>
            </footer>
        </div>
    );
}
