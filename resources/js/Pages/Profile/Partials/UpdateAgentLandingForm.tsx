import React, { useState, useRef } from 'react';
import { getAgentBioUrl } from '@/lib/utils';
import { useForm, usePage } from '@inertiajs/react';
import { PageProps, LandingLinkItem, SocialLinks } from '@/Types';
import themeData from '@/lib/theme-colors.json';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import AgentLandingTemplate from '@/Components/Agent/AgentLandingTemplate';
import { Transition } from '@headlessui/react';
import {
    Camera,
    UploadCloud,
    Phone,
    MapPin,
    Link2,
    Plus,
    Trash2,
    Save,
    Loader2,
    CheckCircle2,
    ExternalLink,
    Sparkles,
    Share2,
    Globe,
    MessageCircle,
    Video,
    FileText,
    Plane,
    BookOpen,
    Building2,
    ShieldCheck,
    HeartHandshake,
    ChevronRight,
    Smartphone,
    Quote,
} from 'lucide-react';

export default function UpdateAgentLandingForm({
    className = '',
}: {
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;
    const tenant = user.tenant;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);

    const rawTenantWa = tenant?.no_telepon ? tenant.no_telepon.replace(/[^0-9]/g, '') : '';
    const formattedTenantWa = rawTenantWa.startsWith('0') ? '62' + rawTenantWa.slice(1) : rawTenantWa;

    const normalizeLink = (item: LandingLinkItem): LandingLinkItem => {
        let targetType = item.target_type;
        if (!targetType) {
            if (item.url && item.url.includes('wa.me')) {
                if (formattedTenantWa && item.url.includes(formattedTenantWa)) {
                    targetType = 'tenant_wa';
                } else {
                    targetType = 'agent_wa';
                }
            } else {
                targetType = 'custom_url';
            }
        }
        return {
            ...item,
            target_type: targetType,
            style_type: item.style_type || 'default',
        };
    };

    // Initial default links if agent has never set any
    const defaultLinks: LandingLinkItem[] = user.landing_links && user.landing_links.length > 0
        ? user.landing_links.map(normalizeLink)
        : [
            {
                id: 'link-1',
                title: 'Konsultasi & Tanya Jawab Bimbingan Ibadah',
                url: `https://wa.me/${user.no_hp ? user.no_hp.replace(/[^0-9]/g, '') : ''}?text=Assalamu'alaikum%20${encodeURIComponent(user.name)},%20saya%20ingin%20konsultasi%20bimbingan%20ibadah%20Umroh`,
                icon: 'whatsapp',
                target_type: 'agent_wa',
                wa_message: `Assalamu'alaikum ${user.name}, saya ingin konsultasi seputar bimbingan ibadah Umroh.`,
                style_type: 'emerald',
                is_highlight: true,
            },
            {
                id: 'link-2',
                title: 'Pendaftaran & Formulir Calon Jamaah',
                url: route('public.register', { ref: user.referral_code }),
                icon: 'form',
                target_type: 'custom_url',
                style_type: 'primary',
                is_highlight: false,
            },
            {
                id: 'link-3',
                title: 'Informasi Jadwal & Panduan Manasik',
                url: `${typeof window !== 'undefined' ? window.location.origin : ''}/#paket`,
                icon: 'guide',
                target_type: 'custom_url',
                style_type: 'default',
                is_highlight: false,
            },
        ];

    const initialSocials: SocialLinks = user.social_links || {
        instagram: '',
        tiktok: '',
        youtube: '',
        facebook: '',
    };

    const { data, setData, post, processing, recentlySuccessful, errors } =
        useForm<{
            _method: string;
            name: string;
            email: string;
            avatar: File | null;
            no_hp: string;
            kota: string;
            bio: string;
            landing_links: LandingLinkItem[];
            social_links: SocialLinks;
        }>({
            _method: 'PATCH',
            name: user.name,
            email: user.email,
            avatar: null,
            no_hp: user.no_hp || '',
            kota: user.kota || '',
            bio: user.bio || '',
            landing_links: defaultLinks,
            social_links: initialSocials,
        });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAddLink = (preset?: Partial<LandingLinkItem>) => {
        setData('landing_links', [
            ...data.landing_links,
            {
                id: `link-${Date.now()}`,
                title: preset?.title || 'Tautan Baru',
                url: preset?.url || 'https://',
                icon: preset?.icon || 'link',
                target_type: preset?.target_type || 'custom_url',
                wa_message: preset?.wa_message || '',
                style_type: preset?.style_type || 'default',
                is_highlight: preset?.is_highlight ?? false,
            },
        ]);
    };

    const handleRemoveLink = (index: number) => {
        setData(
            'landing_links',
            data.landing_links.filter((_, i) => i !== index)
        );
    };

    const handleLinkChange = (index: number, field: keyof LandingLinkItem, value: any) => {
        const updated = [...data.landing_links];
        updated[index] = { ...updated[index], [field]: value };
        setData('landing_links', updated);
    };

    const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
        setData('social_links', {
            ...data.social_links,
            [platform]: value,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const previewUrl = getAgentBioUrl(user.referral_code, user.tenant?.domain_atau_subdomain);

    // Formatted phone numbers for simulation in live preview
    const cleanAgentPhone = data.no_hp.replace(/[^0-9]/g, '');
    const formattedAgentWa = cleanAgentPhone
        ? (cleanAgentPhone.startsWith('0') ? '62' + cleanAgentPhone.slice(1) : cleanAgentPhone)
        : '628123456789';
    const cleanTenantPhone = (tenant?.no_telepon || '6281234567890').replace(/[^0-9]/g, '');

    const getIconComponent = (iconName?: string) => {
        switch (iconName) {
            case 'whatsapp':
            case 'chat':
                return <MessageCircle className="w-3.5 h-3.5" />;
            case 'form':
                return <FileText className="w-3.5 h-3.5" />;
            case 'plane':
                return <Plane className="w-3.5 h-3.5" />;
            case 'file':
            case 'guide':
                return <BookOpen className="w-3.5 h-3.5" />;
            case 'phone':
                return <Phone className="w-3.5 h-3.5" />;
            case 'star':
                return <Sparkles className="w-3.5 h-3.5" />;
            default:
                return <Globe className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            {/* LEFT COLUMN: The Rich Interactive Editor */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                <Card className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xs">
                    <CardHeader className="p-0 pb-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-foreground">
                                    Editor Bio Link &amp; Kontak WhatsApp
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Pilih tujuan nomor WhatsApp per tombol: Nomor Pribadi atau Nomor WhatsApp Induk Travel.
                                </CardDescription>
                            </div>
                        </div>

                        {previewUrl && (
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors border border-primary/20 shrink-0"
                            >
                                <span>Buka Bio Link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </CardHeader>

                    <CardContent className="p-0 pt-6">
                        <form onSubmit={submit} className="flex flex-col gap-6 w-full">
                            {/* 1. Upload Foto Profil / Avatar */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-muted/30 border border-border/70">
                                <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                                    <img
                                        src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=6F4E37&color=fff&size=256`}
                                        alt={data.name}
                                        className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30 shadow-md group-hover:opacity-80 transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                                    <span className="text-xs font-bold text-foreground">Foto Profil Konsultan</span>
                                    <p className="text-[11px] text-muted-foreground">Format JPG, PNG atau WebP (Maks 2MB). Foto akan otomatis tampil di bio link.</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-fit text-xs h-8 rounded-xl border-border mt-1"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                                        Ganti Foto
                                    </Button>
                                </div>
                            </div>

                            {/* 2. Informasi Kontak Utama & Bio */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="no_hp" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Nomor WhatsApp Pribadi Agen</span>
                                    </Label>
                                    <Input
                                        id="no_hp"
                                        value={data.no_hp}
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                        placeholder="081234567890"
                                        className="text-xs rounded-xl bg-background"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Digunakan untuk chat WhatsApp pribadi konsultan.</p>
                                    {errors.no_hp && <p className="text-[11px] text-destructive">{errors.no_hp}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="kota" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        <span>Kota Domisili Operasional</span>
                                    </Label>
                                    <Input
                                        id="kota"
                                        value={data.kota}
                                        onChange={(e) => setData('kota', e.target.value)}
                                        placeholder="Jakarta Selatan, Bandung, dll."
                                        className="text-xs rounded-xl bg-background"
                                    />
                                    {errors.kota && <p className="text-[11px] text-destructive">{errors.kota}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="bio" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Quote className="w-3.5 h-3.5 text-primary" />
                                    <span>Komitmen Pelayanan &amp; Slogan Bio</span>
                                </Label>
                                <textarea
                                    id="bio"
                                    rows={2}
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Tuliskan kata sambutan hangat atau komitmen bimbingan ibadah Anda..."
                                    className="w-full text-xs rounded-xl bg-background border border-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.bio && <p className="text-[11px] text-destructive">{errors.bio}</p>}
                            </div>

                            {/* 3. Daftar Kartu Tautan / Link Buttons */}
                            <div className="space-y-3 pt-4 border-t border-border/70">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Link2 className="w-4 h-4 text-primary" />
                                            <span>Tombol Tautan &amp; WhatsApp Call-to-Action</span>
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Atur nomor tujuan per tombol (Nomor Pribadi vs WhatsApp Induk Travel).
                                        </p>
                                    </div>

                                    {/* Preset Cepat */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddLink({
                                                title: 'Konsultasi Bimbingan (CS Induk Travel)',
                                                target_type: 'tenant_wa',
                                                icon: 'whatsapp',
                                                style_type: 'emerald',
                                                is_highlight: false,
                                                wa_message: `Assalamu'alaikum CS ${tenant?.nama_travel || 'Travel'}, saya ingin tanya info paket Umroh binaan konsultan ${user.name}.`,
                                            })}
                                            className="text-[10px] h-7 px-2.5 rounded-lg border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15"
                                        >
                                            + WA Induk Travel
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddLink({
                                                title: 'Chat Konsultan Pribadi',
                                                target_type: 'agent_wa',
                                                icon: 'whatsapp',
                                                style_type: 'emerald',
                                                is_highlight: false,
                                                wa_message: `Assalamu'alaikum ${user.name}, saya ingin konsultasi bimbingan ibadah Umroh.`,
                                            })}
                                            className="text-[10px] h-7 px-2.5 rounded-lg border-primary/30 text-primary bg-primary/5 hover:bg-primary/15"
                                        >
                                            + WA Pribadi
                                        </Button>

                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleAddLink()}
                                            className="text-[10px] h-7 px-2.5 rounded-lg bg-primary text-primary-foreground font-bold shadow-2xs"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Tambah Kartu
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3.5">
                                    {data.landing_links.map((link, idx) => (
                                        <div
                                            key={link.id || idx}
                                            className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${link.target_type === 'tenant_wa'
                                                ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/10'
                                                : link.target_type === 'agent_wa'
                                                    ? 'bg-blue-500/5 border-blue-500/30 dark:bg-blue-950/10'
                                                    : 'bg-card/90 border-border/80'
                                                }`}
                                        >
                                            {/* Header Card: Judul & Action */}
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <Input
                                                        value={link.title}
                                                        onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                                                        placeholder="Judul Tombol (Contoh: Pendaftaran Paket Umroh)"
                                                        className="text-xs font-bold bg-background h-8"
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveLink(idx)}
                                                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 rounded-lg shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            {/* Pilihan Target Tujuan Nomor */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleLinkChange(idx, 'target_type', 'agent_wa')}
                                                    className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold flex flex-col gap-1 cursor-pointer transition-all ${link.target_type === 'agent_wa'
                                                        ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30'
                                                        : 'border-border/70 bg-background/60 text-muted-foreground hover:border-foreground/30'
                                                        }`}
                                                >
                                                    <span className="font-bold flex items-center gap-1.5">
                                                        <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                                                        <span>WA Pribadi Saya</span>
                                                    </span>
                                                    <span className="text-[9px] opacity-75">
                                                        ({data.no_hp || 'Belum diisi'})
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleLinkChange(idx, 'target_type', 'tenant_wa')}
                                                    className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold flex flex-col gap-1 cursor-pointer transition-all ${link.target_type === 'tenant_wa'
                                                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30'
                                                        : 'border-border/70 bg-background/60 text-muted-foreground hover:border-foreground/30'
                                                        }`}
                                                >
                                                    <span className="font-bold flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span>WA Induk Travel</span>
                                                    </span>
                                                    <span className="text-[9px] opacity-75">
                                                        (CS: {tenant?.no_telepon || 'Bisnis Travel'})
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleLinkChange(idx, 'target_type', 'custom_url')}
                                                    className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold flex flex-col gap-1 cursor-pointer transition-all ${link.target_type === 'custom_url' || !link.target_type
                                                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                                                        : 'border-border/70 bg-background/60 text-muted-foreground hover:border-foreground/30'
                                                        }`}
                                                >
                                                    <span className="font-bold flex items-center gap-1.5">
                                                        <Globe className="w-3.5 h-3.5 text-primary" />
                                                        <span>Tautan / URL Web</span>
                                                    </span>
                                                    <span className="text-[9px] opacity-75">Form / Brosur / Link</span>
                                                </button>
                                            </div>

                                            {/* Input Detail Berdasarkan Target Type */}
                                            {link.target_type === 'agent_wa' && (
                                                <div className="space-y-1 bg-background/50 p-2.5 rounded-xl border border-blue-500/20">
                                                    <Label className="text-[10px] font-bold text-foreground">Pesan Pembuka WhatsApp ke Agen Pribadi:</Label>
                                                    <Input
                                                        value={link.wa_message || ''}
                                                        onChange={(e) => handleLinkChange(idx, 'wa_message', e.target.value)}
                                                        placeholder={`Assalamu'alaikum ${user.name}, saya ingin tanya paket Umroh...`}
                                                        className="text-xs h-8 bg-background"
                                                    />
                                                </div>
                                            )}

                                            {link.target_type === 'tenant_wa' && (
                                                <div className="space-y-1 bg-background/50 p-2.5 rounded-xl border border-emerald-500/20">
                                                    <Label className="text-[10px] font-bold text-foreground">Pesan Pembuka WhatsApp ke CS Induk Travel:</Label>
                                                    <Input
                                                        value={link.wa_message || ''}
                                                        onChange={(e) => handleLinkChange(idx, 'wa_message', e.target.value)}
                                                        placeholder={`Assalamu'alaikum CS ${tenant?.nama_travel || 'Travel'}, saya calon jamaah dari agen ${user.name}...`}
                                                        className="text-xs h-8 bg-background"
                                                    />
                                                </div>
                                            )}

                                            {(link.target_type === 'custom_url' || !link.target_type) && (
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-foreground">URL Lengkap / Tautan:</Label>
                                                    <Input
                                                        value={link.url}
                                                        onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                                                        placeholder="https://..."
                                                        className="text-xs h-8 bg-background font-mono"
                                                    />
                                                </div>
                                            )}

                                            {/* Pilihan Icon & Style Highlight */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground block mb-1">Pilihan Icon:</Label>
                                                    <select
                                                        value={link.icon || 'link'}
                                                        onChange={(e) => handleLinkChange(idx, 'icon', e.target.value)}
                                                        className="w-full text-xs h-8 rounded-lg bg-background border border-input px-2 text-foreground"
                                                    >
                                                        <option value="whatsapp">WhatsApp</option>
                                                        <option value="form">Form Pendaftaran</option>
                                                        <option value="plane">Pesawat / Paket</option>
                                                        <option value="file">Brosur / Panduan</option>
                                                        <option value="phone">Telepon</option>
                                                        <option value="star">Bintang / Highlight</option>
                                                        <option value="link">Tautan Web</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground block mb-1">Gaya Warna:</Label>
                                                    <select
                                                        value={link.style_type || 'default'}
                                                        onChange={(e) => handleLinkChange(idx, 'style_type', e.target.value)}
                                                        className="w-full text-xs h-8 rounded-lg bg-background border border-input px-2 text-foreground"
                                                    >
                                                        <option value="default">Standar (Sleek Glass)</option>
                                                        <option value="primary">Aksen Emas / Primary</option>
                                                        <option value="emerald">WhatsApp Hijau Emerald</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Social Media Links */}
                            <div className="space-y-3 pt-4 border-t border-border/70">
                                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Share2 className="w-4 h-4 text-primary" />
                                    <span>Akun Media Sosial Konsultan</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-muted-foreground">Instagram (Username):</Label>
                                        <Input
                                            value={data.social_links.instagram || ''}
                                            onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                            placeholder="@konsultan_umroh"
                                            className="text-xs h-8 bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-muted-foreground">TikTok (Username):</Label>
                                        <Input
                                            value={data.social_links.tiktok || ''}
                                            onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                                            placeholder="@konsultan_umroh"
                                            className="text-xs h-8 bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-muted-foreground">YouTube (Channel / URL):</Label>
                                        <Input
                                            value={data.social_links.youtube || ''}
                                            onChange={(e) => handleSocialChange('youtube', e.target.value)}
                                            placeholder="@channel_umroh atau https://youtube.com/..."
                                            className="text-xs h-8 bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-muted-foreground">Facebook (Username / URL):</Label>
                                        <Input
                                            value={data.social_links.facebook || ''}
                                            onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                            placeholder="username atau https://facebook.com/..."
                                            className="text-xs h-8 bg-background"
                                        />
                                    </div>
                                    <br />
                                </div>
                            </div>

                            {/* Submit Footer */}
                            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-6 -mb-6 border-t border-border/80 flex items-center justify-between rounded-b-2xl">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Tersimpan Sukses!
                                        </span>
                                    </Transition>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md px-6"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3.5 h-3.5 mr-1.5" />
                                            Simpan Perubahan Bio Link
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: Interactive Smartphone Live Preview */}
            <div className="lg:col-span-5 sticky top-20 flex flex-col items-center gap-3">
                <div className="flex items-center justify-between w-full max-w-[340px] px-2 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-primary" />
                        <span>Live Mobile Preview</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                        {tenant?.nama_travel || 'Travel'}
                    </Badge>
                </div>

                {/* Smartphone Device Frame */}
                <div className="w-[340px] h-[680px] bg-black rounded-[42px] p-2.5 shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col">
                    {/* Notch & Speaker */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-40 flex items-center justify-center pointer-events-none shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                        <div className="w-8 h-1 rounded-full bg-slate-800" />
                    </div>

                    {/* Inside Screen with Tenant Theme */}
                    <div
                        className="w-full h-full rounded-[34px] overflow-hidden bg-background text-foreground relative flex flex-col justify-between"
                        style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'luxury']?.variables || themeData.themes['luxury'].variables) as React.CSSProperties}
                    >
                        {/* Fixed Status Bar (Inside Screen, Themed Background + Backdrop Blur) */}
                        <div className="sticky top-0 left-0 right-0 h-9 px-6 pt-1 flex items-center justify-between text-[9px] font-semibold text-foreground/80 bg-background/85 backdrop-blur-md z-30 select-none border-b border-border/20 rounded-t-[30px]">
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-[8px] font-mono font-bold">5G</span>
                                <div className="w-3.5 h-2 rounded-xs border border-foreground/60 p-0.5 flex items-center">
                                    <div className="w-full h-full bg-foreground/70 rounded-2xs" />
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="w-full flex-1 overflow-y-auto no-scrollbar px-3 pb-4 pt-2 relative">
                            {/* Background Radial Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="w-full relative z-10">
                                <AgentLandingTemplate
                                    agent={{
                                        name: data.name,
                                        avatar_url: avatarPreview,
                                        no_hp: data.no_hp,
                                        kota: data.kota,
                                        bio: data.bio,
                                        jabatan: user.jabatan,
                                        referral_code: user.referral_code,
                                        landing_links: data.landing_links,
                                        social_links: data.social_links,
                                    }}
                                    tenant={tenant}
                                    isPreview={true}
                                />
                            </div>
                        </div>

                        {/* Bottom iOS Home Indicator */}
                        <div className="w-full py-2 bg-background/90 backdrop-blur-xs flex justify-center shrink-0 z-20 pointer-events-none">
                            <div className="w-24 h-1 bg-foreground/20 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
