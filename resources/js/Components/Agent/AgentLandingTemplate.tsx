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
    UserPlus,
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
        registerUrl || (agent.referral_code ? `/daftar?ref=${encodeURIComponent(agent.referral_code)}` : '/daftar');

    // Default links if none configured
    const customLinks: LandingLinkItem[] =
        agent.landing_links && agent.landing_links.length > 0
            ? agent.landing_links
            : [
                  {
                      title: 'Informasi Jadwal Paket & Biaya Umroh',
                      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/#paket`,
                      icon: 'plane',
                      target_type: 'custom_url',
                      style_type: 'default',
                      is_highlight: false,
                  },
                  {
                      title: 'Buku Panduan & Dokumentasi Sistem',
                      url: '/docs/agent',
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
        const iconClass = isPreview ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5';
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
            return 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs border border-emerald-500/30';
        }
        if (item.style_type === 'primary') {
            return 'bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs border border-primary/30';
        }
        return 'bg-card/90 hover:bg-card text-foreground border border-border/80 hover:border-primary/40 font-medium shadow-2xs';
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
        <div className={`w-full flex flex-col items-center ${isPreview ? 'gap-2.5 text-center select-none' : 'gap-4 sm:gap-5 text-center select-none'} ${className}`}>
            {/* Top Travel Info & Share */}
            <div className={`w-full flex items-center justify-between pb-2 border-b border-border/60 ${isPreview ? 'text-[9px]' : 'text-xs'}`}>
                <div className="flex items-center gap-2 text-left min-w-0">
                    <div className={`${isPreview ? 'w-5 h-5 rounded-md text-[10px]' : 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs'} bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0`}>
                        <Building2 className={isPreview ? 'w-3 h-3' : 'w-4 h-4'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={`${isPreview ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold text-foreground leading-tight truncate`}>
                            {tenant?.nama_travel || 'Official Travel'}
                        </span>
                        <span className={`${isPreview ? 'text-[7.5px]' : 'text-[10px]'} text-muted-foreground truncate`}>
                            Penyelenggara Resmi Umroh &amp; Haji
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleShare}
                    className={`${isPreview ? 'p-1' : 'p-1.5 sm:p-2'} rounded-full bg-card hover:bg-muted border border-border/80 shadow-xs text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer`}
                    title="Bagikan Tautan"
                >
                    <Share2 className={isPreview ? 'w-3 h-3' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
                </button>
            </div>

            {/* Agent Profile Details */}
            <div className={`flex flex-col items-center text-center ${isPreview ? 'gap-1.5' : 'gap-3'} w-full`}>
                {/* Avatar with Ring & Shield */}
                <div className="relative">
                    <div className={`p-1 rounded-full ${isPreview ? 'ring-2' : 'ring-3 sm:ring-4'} ring-primary/20 bg-card shadow-md`}>
                        <img
                            src={avatarSrc}
                            alt={agent.name}
                            className={`${isPreview ? 'w-16 h-16' : 'w-24 h-24 sm:w-28 sm:h-28'} rounded-full object-cover border-2 border-background bg-background`}
                        />
                    </div>
                    <div
                        className={`absolute bottom-0.5 right-0.5 bg-primary text-primary-foreground rounded-full ${isPreview ? 'p-0.5' : 'p-1 sm:p-1.5'} shadow-md border-2 border-background`}
                        title="Konsultan Bimbingan Terverifikasi"
                    >
                        <ShieldCheck className={isPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
                    </div>
                </div>

                {/* Name & Title Badges */}
                <div className="flex flex-col items-center gap-1">
                    <h1 className={`${isPreview ? 'text-xs sm:text-sm' : 'text-lg sm:text-xl font-bold'} font-extrabold text-foreground tracking-tight leading-tight`}>
                        {agent.name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                        <Badge
                            variant="secondary"
                            className={`bg-primary/10 text-primary border-primary/20 font-bold ${isPreview ? 'text-[7.5px] px-1.5 py-0.5' : 'text-[11px] sm:text-xs px-2.5 py-0.5'} tracking-wide`}
                        >
                            {displayTitle}
                        </Badge>
                        {agent.kota && (
                            <Badge
                                variant="outline"
                                className={`${isPreview ? 'text-[7.5px] px-1.5 py-0.5' : 'text-[11px] sm:text-xs px-2.5 py-0.5'} font-medium border-border/80 gap-1 text-muted-foreground`}
                            >
                                <MapPin className={isPreview ? 'w-2 h-2 text-primary' : 'w-3 h-3 text-primary'} />
                                <span>{agent.kota}</span>
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Bio Card */}
                <div className={`w-full ${isPreview ? 'p-2.5 rounded-xl' : 'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl'} bg-card/80 backdrop-blur-sm border border-border/80 shadow-xs text-left relative overflow-hidden group`}>
                    <Quote className={`absolute top-2 right-3 ${isPreview ? 'w-5 h-5' : 'w-8 h-8 sm:w-10 sm:h-10'} text-primary/10 -rotate-12 pointer-events-none`} />

                    <div className={`flex items-start ${isPreview ? 'gap-1.5' : 'gap-2.5'} relative z-10`}>
                        <div className={`p-1 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5`}>
                            <Quote className={isPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className={`${isPreview ? 'text-[8.5px] leading-tight' : 'text-xs sm:text-sm leading-relaxed'} text-muted-foreground font-normal`}>
                                {agent.bio && agent.bio.trim() !== '' ? agent.bio : defaultQuote}
                            </p>
                            <div className="flex items-center gap-1 pt-0.5">
                                <div className={`h-px ${isPreview ? 'w-3' : 'w-5'} bg-primary/40`} />
                                <span className={`${isPreview ? 'text-[7.5px]' : 'text-[10px] font-bold'} text-primary tracking-wide`}>
                                    Komitmen Pelayanan Konsultan
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Points */}
                <div className={`grid grid-cols-3 ${isPreview ? 'gap-1' : 'gap-1.5 sm:gap-2'} w-full pt-0.5`}>
                    <div className={`${isPreview ? 'py-1 px-1 rounded-lg' : 'py-1.5 px-2 sm:py-2 sm:px-2 rounded-xl'} bg-card/80 border border-border/80 flex flex-col items-center justify-center text-center shadow-2xs`}>
                        <HeartHandshake className={`${isPreview ? 'w-2.5 h-2.5 mb-0.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5'} text-primary`} />
                        <span className={`${isPreview ? 'text-[7px] leading-tight' : 'text-[9.5px] sm:text-xs leading-tight'} font-medium text-foreground`}>Pendampingan Khusyuk</span>
                    </div>

                    <div className={`${isPreview ? 'py-1 px-1 rounded-lg' : 'py-1.5 px-2 sm:py-2 sm:px-2 rounded-xl'} bg-card/80 border border-border/80 flex flex-col items-center justify-center text-center shadow-2xs`}>
                        <BookOpen className={`${isPreview ? 'w-2.5 h-2.5 mb-0.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5'} text-primary`} />
                        <span className={`${isPreview ? 'text-[7px] leading-tight' : 'text-[9.5px] sm:text-xs leading-tight'} font-medium text-foreground`}>Sesuai Sunnah</span>
                    </div>

                    <div className={`${isPreview ? 'py-1 px-1 rounded-lg' : 'py-1.5 px-2 sm:py-2 sm:px-2 rounded-xl'} bg-card/80 border border-border/80 flex flex-col items-center justify-center text-center shadow-2xs`}>
                        <CheckCircle2 className={`${isPreview ? 'w-2.5 h-2.5 mb-0.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5'} text-primary`} />
                        <span className={`${isPreview ? 'text-[7px] leading-tight' : 'text-[9.5px] sm:text-xs leading-tight'} font-medium text-foreground`}>Resmi Kemenag</span>
                    </div>
                </div>
            </div>

            {/* Primary Action Buttons: Register & WhatsApp */}
            <div className={`w-full flex flex-col ${isPreview ? 'gap-1.5' : 'gap-2 sm:gap-2.5'}`}>
                {/* 1. Dedicated Registration / Booking Button with Referral Code */}
                <motion.a
                    href={effectiveRegisterUrl}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    className={`w-full ${isPreview ? 'p-2 rounded-xl text-[9.5px]' : 'py-3 px-3.5 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm'} bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-between shadow-lg shadow-primary/15 transition-all border border-primary/30 group cursor-pointer`}
                >
                    <div className={`flex items-center ${isPreview ? 'gap-2' : 'gap-3'} min-w-0`}>
                        <div className={`${isPreview ? 'p-1 rounded-lg' : 'p-1.5 sm:p-2 rounded-lg sm:rounded-xl'} bg-white/20 text-white shrink-0`}>
                            <UserPlus className={`${isPreview ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                            <span className={`${isPreview ? 'text-[9.5px]' : 'text-xs sm:text-sm'} font-bold leading-tight truncate flex items-center gap-1.5`}>
                                <span>Pendaftaran &amp; Formulir Calon Jamaah</span>
                                {agent.referral_code && (
                                    <span className="text-[9px] sm:text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                                        {agent.referral_code}
                                    </span>
                                )}
                            </span>
                            <span className={`${isPreview ? 'text-[7.5px]' : 'text-[10px] sm:text-xs'} text-primary-foreground/80 font-normal truncate`}>
                                Daftar online langsung terhubung bimbingan {agent.name}
                            </span>
                        </div>
                    </div>
                    <ChevronRight className={`${isPreview ? 'w-3 h-3' : 'w-4 h-4'} text-primary-foreground/80 shrink-0 group-hover:translate-x-0.5 transition-transform`} />
                </motion.a>

                {/* 2. Main Contact WA Button */}
                <motion.a
                    href={mainWaUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    className={`w-full ${isPreview ? 'p-2 rounded-xl text-[9.5px]' : 'py-3 px-3.5 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm'} bg-card/90 hover:bg-card text-foreground font-semibold flex items-center justify-between shadow-2xs transition-all border border-border/80 hover:border-emerald-500/50 group cursor-pointer`}
                >
                    <div className={`flex items-center ${isPreview ? 'gap-2' : 'gap-3'} min-w-0`}>
                        <div className={`${isPreview ? 'p-1 rounded-lg' : 'p-1.5 sm:p-2 rounded-lg sm:rounded-xl'} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20`}>
                            <MessageCircle className={`${isPreview ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                            <span className={`${isPreview ? 'text-[9.5px]' : 'text-xs sm:text-sm'} font-bold leading-tight truncate`}>
                                Konsultasi &amp; Tanya Jawab Bimbingan
                            </span>
                            <span className={`${isPreview ? 'text-[7.5px]' : 'text-[10px] sm:text-xs'} text-muted-foreground font-normal truncate`}>
                                Hubungi langsung via WhatsApp (+{formattedAgentWa})
                            </span>
                        </div>
                    </div>
                    <ChevronRight className={`${isPreview ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground group-hover:translate-x-0.5 group-hover:text-emerald-500 transition-all shrink-0`} />
                </motion.a>
            </div>

            {/* Action Cards List */}
            <div className={`w-full flex flex-col ${isPreview ? 'gap-1.5' : 'gap-2 sm:gap-2.5'}`}>
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
                            className={`w-full ${isPreview ? 'p-2 rounded-xl' : 'py-3 px-3.5 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl'} transition-all flex items-center justify-between gap-2 shadow-xs ${cardClass}`}
                        >
                            <div className={`flex items-center ${isPreview ? 'gap-2' : 'gap-3'} flex-1 min-w-0`}>
                                <div className={`${isPreview ? 'p-1 rounded-lg' : 'p-1.5 sm:p-2 rounded-lg sm:rounded-xl'} shrink-0 bg-black/10 dark:bg-white/10`}>
                                    {getLinkIcon(item.icon)}
                                </div>
                                <div className="flex flex-col text-left min-w-0">
                                    <span className={`${isPreview ? 'text-[9.5px]' : 'text-xs sm:text-sm'} leading-snug font-bold truncate`}>
                                        {item.title || 'Tautan Tanpa Judul'}
                                    </span>
                                    {targetType === 'tenant_wa' && (
                                        <span className={`${isPreview ? 'text-[7.5px]' : 'text-[10px] sm:text-[11px]'} opacity-75 font-normal`}>➔ CS Induk Travel</span>
                                    )}
                                    {targetType === 'agent_wa' && (
                                        <span className={`${isPreview ? 'text-[7.5px]' : 'text-[10px] sm:text-[11px]'} opacity-75 font-normal`}>➔ WA Pribadi Agen</span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className={`${isPreview ? 'w-3 h-3' : 'w-4 h-4'} shrink-0 opacity-80`} />
                        </motion.a>
                    );
                })}
            </div>

            {/* Social Media Bar */}
            <div className={`flex items-center justify-center ${isPreview ? 'gap-2 pt-0.5' : 'gap-3 pt-1 sm:pt-2'}`}>
                {socials.instagram ? (
                    <a
                        href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`${isPreview ? 'p-1.5' : 'p-2 sm:p-2.5'} rounded-full bg-card hover:bg-muted text-pink-500 border border-border/80 shadow-2xs transition-transform hover:scale-110`}
                        title={`Instagram: ${socials.instagram}`}
                    >
                        <Share2 className={isPreview ? 'w-3 h-3' : 'w-4 h-4'} />
                    </a>
                ) : isPreview ? (
                    <div className="p-1.5 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="Instagram (Belum diisi)">
                        <Share2 className="w-3 h-3" />
                    </div>
                ) : null}

                {socials.tiktok ? (
                    <a
                        href={`https://tiktok.com/@${socials.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`${isPreview ? 'p-1.5' : 'p-2 sm:p-2.5'} rounded-full bg-card hover:bg-muted text-foreground border border-border/80 shadow-2xs transition-transform hover:scale-110`}
                        title={`TikTok: ${socials.tiktok}`}
                    >
                        <Globe className={isPreview ? 'w-3 h-3' : 'w-4 h-4'} />
                    </a>
                ) : isPreview ? (
                    <div className="p-1.5 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="TikTok (Belum diisi)">
                        <Globe className="w-3 h-3" />
                    </div>
                ) : null}

                {socials.youtube ? (
                    <a
                        href={socials.youtube.startsWith('http') ? socials.youtube : `https://youtube.com/@${socials.youtube}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`${isPreview ? 'p-1.5' : 'p-2 sm:p-2.5'} rounded-full bg-card hover:bg-muted text-red-500 border border-border/80 shadow-2xs transition-transform hover:scale-110`}
                        title={`YouTube: ${socials.youtube}`}
                    >
                        <Video className={isPreview ? 'w-3 h-3' : 'w-4 h-4'} />
                    </a>
                ) : isPreview ? (
                    <div className="p-1.5 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="YouTube (Belum diisi)">
                        <Video className="w-3 h-3" />
                    </div>
                ) : null}

                {socials.facebook ? (
                    <a
                        href={socials.facebook.startsWith('http') ? socials.facebook : `https://facebook.com/${socials.facebook}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`${isPreview ? 'p-1.5' : 'p-2 sm:p-2.5'} rounded-full bg-card hover:bg-muted text-blue-500 border border-border/80 shadow-2xs transition-transform hover:scale-110`}
                        title={`Facebook: ${socials.facebook}`}
                    >
                        <Globe className={isPreview ? 'w-3 h-3' : 'w-4 h-4'} />
                    </a>
                ) : isPreview ? (
                    <div className="p-1.5 rounded-full bg-card/60 text-muted-foreground/40 border border-border/40" title="Facebook (Belum diisi)">
                        <Globe className="w-3 h-3" />
                    </div>
                ) : null}
            </div>

            {/* Footer */}
            <footer className={`pt-1 sm:pt-2 pb-1 flex flex-col items-center gap-1 text-center w-full`}>
                <div className={`inline-flex items-center gap-1 ${isPreview ? 'px-2 py-0.5 text-[7px]' : 'px-3 py-1 text-[9.5px] sm:text-[10px]'} rounded-full bg-muted/40 border border-border/50 font-medium text-muted-foreground`}>
                    <ShieldCheck className={isPreview ? 'w-2.5 h-2.5 text-primary' : 'w-3 h-3 text-primary'} />
                    <span>Layanan Konsultasi Resmi &amp; Amanah</span>
                </div>
                <p className={`${isPreview ? 'text-[7px]' : 'text-[9.5px] sm:text-[10px]'} text-muted-foreground/60 leading-tight`}>
                    &copy; {new Date().getFullYear()} {tenant?.nama_travel || 'Travel'}. Semoga menjadi langkah awal ibadah yang mabrur.
                </p>
            </footer>
        </div>
    );
}
