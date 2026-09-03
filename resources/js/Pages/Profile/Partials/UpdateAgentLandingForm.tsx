import React, { useState, useRef } from 'react';
import { getAgentBioUrl } from '@/lib/utils';
import { useForm, usePage } from '@inertiajs/react';
import { PageProps, LandingLinkItem, SocialLinks } from '@/Types';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
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
} from 'lucide-react';

export default function UpdateAgentLandingForm({
    className = '',
}: {
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);

    // Initial default links if agent has never set any
    const defaultLinks: LandingLinkItem[] = user.landing_links && user.landing_links.length > 0
        ? user.landing_links
        : [
            {
                title: 'Konsultasi & Tanya Jawab Bimbingan Ibadah',
                url: `https://wa.me/${user.no_hp ? user.no_hp.replace(/[^0-9]/g, '') : ''}?text=Assalamu'alaikum%20${encodeURIComponent(user.name)},%20saya%20ingin%20konsultasi%20bimbingan%20ibadah%20Umroh`,
                icon: 'whatsapp',
                is_highlight: true,
            },
            {
                title: 'Pendaftaran & Formulir Calon Jamaah',
                url: route('public.register', { ref: user.referral_code }),
                icon: 'form',
                is_highlight: false,
            },
            {
                title: 'Informasi Jadwal & Panduan Manasik',
                url: `${typeof window !== 'undefined' ? window.location.origin : ''}/#paket`,
                icon: 'guide',
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

    const handleAddLink = () => {
        setData('landing_links', [
            ...data.landing_links,
            {
                title: '',
                url: 'https://',
                icon: 'link',
                is_highlight: false,
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

    return (
        <Card className={`bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xs ${className}`}>
            <CardHeader className="p-0 pb-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-foreground">
                            Kustomisasi Halaman Bio Link / Linktree Agen
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Atur foto profil, kontak WhatsApp, tombol tautan, dan medsos yang tampil di halaman bio link publik Anda.
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
                        <span>Preview Bio Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                )}
            </CardHeader>

            <CardContent className="p-0 pt-6">
                <form onSubmit={submit} className="flex flex-col gap-6 w-full">
                    {/* 1. Upload Foto Profil / Avatar */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 rounded-2xl bg-muted/40 border border-border/80">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=6F4E37&color=fff&size=256`}
                                alt={data.name}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary/30 shadow-md transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold">Ganti Foto</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-center sm:text-left flex-1">
                            <h4 className="text-sm font-bold text-foreground">Foto Profil &amp; Avatar Landing</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Format didukung: JPG, PNG, atau WEBP. Maksimal ukuran file 2MB. Foto ini akan tampil di bagian atas Bio Link dan avatar akun Anda.
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                            />
                            <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl text-xs font-semibold gap-1.5 h-8 border-border"
                                >
                                    <UploadCloud className="w-3.5 h-3.5 text-primary" />
                                    <span>Pilih Foto Baru</span>
                                </Button>
                            </div>
                            {errors.avatar && (
                                <p className="text-xs text-destructive font-medium">{errors.avatar}</p>
                            )}
                        </div>
                    </div>

                    {/* 2. Informasi Kontak & Domisili */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="agent-nohp" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-primary" />
                                <span>Nomor WhatsApp Konsultasi</span>
                            </Label>
                            <Input
                                id="agent-nohp"
                                type="text"
                                placeholder="Contoh: 081234567890"
                                className="text-xs rounded-xl h-10 bg-background"
                                value={data.no_hp}
                                onChange={(e) => setData('no_hp', e.target.value)}
                            />
                            {errors.no_hp && (
                                <p className="text-xs text-destructive font-medium">{errors.no_hp}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="agent-kota" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                <span>Kota / Area Domisili</span>
                            </Label>
                            <Input
                                id="agent-kota"
                                type="text"
                                placeholder="Contoh: Jakarta Selatan, Surabaya, Medan"
                                className="text-xs rounded-xl h-10 bg-background"
                                value={data.kota}
                                onChange={(e) => setData('kota', e.target.value)}
                            />
                            {errors.kota && (
                                <p className="text-xs text-destructive font-medium">{errors.kota}</p>
                            )}
                        </div>
                    </div>

                    {/* 3. Komitmen / Bio Slogan */}
                    <div className="space-y-1.5">
                        <Label htmlFor="agent-bio" className="text-xs font-semibold text-foreground">
                            Bio / Kalimat Komitmen Pelayanan
                        </Label>
                        <textarea
                            id="agent-bio"
                            rows={3}
                            className="w-full text-xs rounded-xl p-3 bg-background border border-border focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground resize-y"
                            placeholder="Tuliskan pesan sambutan atau komitmen pelayanan terbaik Anda untuk calon jamaah..."
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                        />
                        {errors.bio && (
                            <p className="text-xs text-destructive font-medium">{errors.bio}</p>
                        )}
                    </div>

                    {/* 4. Dynamic Link Builder (Tombol-tombol Tautan Linktree) */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Link2 className="w-4 h-4 text-primary" />
                                    <span>Daftar Tombol Tautan (Action Links)</span>
                                </Label>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Tombol-tombol yang akan muncul di Bio Link Anda (urutannya dari atas ke bawah).
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddLink}
                                className="rounded-xl text-xs font-bold gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/10"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Tautan</span>
                            </Button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {data.landing_links.map((link, index) => (
                                <div
                                    key={index}
                                    className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                                >
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 w-full">
                                        <div className="sm:col-span-5">
                                            <Input
                                                placeholder="Judul Tombol (misal: Brosur Paket 2026)"
                                                className="text-xs h-9 rounded-xl bg-background"
                                                value={link.title}
                                                onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div className="sm:col-span-7">
                                            <Input
                                                placeholder="URL Link (misal: https://...)"
                                                className="text-xs h-9 rounded-xl bg-background font-mono text-[11px]"
                                                value={link.url}
                                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleLinkChange(index, 'is_highlight', !link.is_highlight)}
                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                                                link.is_highlight
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                            }`}
                                            title="Tandai tombol sebagai Highlight Utama"
                                        >
                                            {link.is_highlight ? '★ Highlight' : 'Standard'}
                                        </button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveLink(index)}
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl"
                                            title="Hapus tautan ini"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Tautan Media Sosial */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Share2 className="w-4 h-4 text-primary" />
                            <span>Akun Media Sosial (Icon Bar di Bawah)</span>
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative">
                                <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                                <Input
                                    placeholder="Username Instagram (tanpa @)"
                                    className="pl-9 text-xs h-9 rounded-xl bg-background"
                                    value={data.social_links.instagram || ''}
                                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                                <Input
                                    placeholder="Username TikTok (tanpa @)"
                                    className="pl-9 text-xs h-9 rounded-xl bg-background"
                                    value={data.social_links.tiktok || ''}
                                    onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                <Input
                                    placeholder="Link Channel / Username YouTube"
                                    className="pl-9 text-xs h-9 rounded-xl bg-background"
                                    value={data.social_links.youtube || ''}
                                    onChange={(e) => handleSocialChange('youtube', e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                <Input
                                    placeholder="Username Facebook / Page"
                                    className="pl-9 text-xs h-9 rounded-xl bg-background"
                                    value={data.social_links.facebook || ''}
                                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2 rounded-xl text-xs font-bold shadow-md px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan Kustomisasi...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan Bio Link</span>
                                </>
                            )}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Kustomisasi Linktree berhasil disimpan!</span>
                            </p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
