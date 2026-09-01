import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import {
    Palette,
    Bell,
    Shield,
    Globe,
    Check,
    Moon,
    Sun,
    Monitor,
    Sparkles,
} from 'lucide-react';

import { useTheme } from '@/Components/ThemeProvider';

interface AppSettingsProps extends PageProps {
    mustVerifyEmail: boolean;
    status?: string;
    tenant?: {
        nama_travel: string;
        domain_atau_subdomain: string;
    } | null;
}

export default function AppSettings({
    mustVerifyEmail,
    status,
    tenant,
}: AppSettingsProps) {
    const { auth } = usePage<PageProps>().props;
    const { theme, setTheme, themes } = useTheme();
    
    // Tab State: 'appearance' | 'notifications' | 'security' | 'regional'
    const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'security' | 'regional'>('appearance');
    const [themeFilter, setThemeFilter] = useState<'all' | 'light' | 'dark'>('all');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab && ['appearance', 'notifications', 'security', 'regional'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, []);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
    };

    const themeList = Object.values(themes || {});
    const filteredThemes = themeList.filter((item) => {
        if (themeFilter === 'light') return item.type === 'light';
        if (themeFilter === 'dark') return item.type === 'dark';
        return true;
    });

    // Notification Toggles state
    const [notifSettings, setNotifSettings] = useState({
        emailPaymentAlert: true,
        emailStockAlert: true,
        emailNewLeadAlert: true,
        inAppSound: false,
    });

    const toggleNotif = (key: keyof typeof notifSettings) => {
        setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Regional settings
    const [currencyFormat, setCurrencyFormat] = useState('IDR');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

    return (
        <PageLayout
            title="Pengaturan Aplikasi"
            breadcrumbParent="Settings Travel"
            breadcrumbPage="Pengaturan Aplikasi"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Sistem & Preferensi</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Kustomisasi tema tampilan, notifikasi otomatis, keamanan akun, dan preferensi regional travel Anda.
                    </p>
                </div>
            </div>

            {/* Settings Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Navigation Tabs Sidebar */}
                <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 bg-card/60 backdrop-blur-md p-3 rounded-2xl border border-border/80 shadow-xs overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            activeTab === 'appearance'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Palette className="w-4 h-4 shrink-0" />
                        <span>Tampilan & Tema</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            activeTab === 'notifications'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Bell className="w-4 h-4 shrink-0" />
                        <span>Notifikasi & Alert</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            activeTab === 'security'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Shield className="w-4 h-4 shrink-0" />
                        <span>Profil & Keamanan</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('regional')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            activeTab === 'regional'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Globe className="w-4 h-4 shrink-0" />
                        <span>Regional & Format</span>
                    </button>
                </div>

                {/* Tab Content Panels */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                    {/* 1. Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="flex flex-col gap-6">
                            {/* Quick Presets / System Default */}
                            <div className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            Mode & Gaya Tampilan
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Pilih mode dasar atau jelajahi koleksi tema warna di bawah untuk mengubah nuansa aplikasi secara instan.
                                        </p>
                                    </div>

                                    {/* Filter categories */}
                                    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 self-start sm:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => setThemeFilter('all')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                themeFilter === 'all'
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Semua ({themeList.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setThemeFilter('light')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                themeFilter === 'light'
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Light ({themeList.filter((t) => t.type === 'light').length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setThemeFilter('dark')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                themeFilter === 'dark'
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Dark ({themeList.filter((t) => t.type === 'dark').length})
                                        </button>
                                    </div>
                                </div>

                                {/* System default button */}
                                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-background/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                            <Monitor className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Ikuti Sistem Operasi (OS Default)</div>
                                            <div className="text-xs text-muted-foreground">Menyesuaikan mode Light / Dark otomatis sesuai pengaturan perangkat Anda.</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleThemeChange('system')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            theme === 'system'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'border border-border bg-card hover:bg-muted text-foreground'
                                        }`}
                                    >
                                        {theme === 'system' ? 'Aktif' : 'Terapkan'}
                                    </button>
                                </div>

                                {/* Visual Theme Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 pt-2">
                                    {filteredThemes.map((t) => {
                                        const isSelected = theme === t.name;
                                        const bgStyle = t.variables['--background'] 
                                            ? `hsl(${t.variables['--background']})` 
                                            : (t.type === 'dark' ? '#0f172a' : '#ffffff');
                                        const fgStyle = t.variables['--foreground'] 
                                            ? `hsl(${t.variables['--foreground']})` 
                                            : (t.type === 'dark' ? '#ffffff' : '#0f172a');

                                        return (
                                            <button
                                                key={t.name}
                                                type="button"
                                                onClick={() => handleThemeChange(t.name)}
                                                className={`group relative flex flex-col justify-between p-3 rounded-2xl border-2 text-left transition-all cursor-pointer overflow-hidden ${
                                                    isSelected
                                                        ? 'border-primary ring-2 ring-primary/30 shadow-md scale-[1.02]'
                                                        : 'border-border/70 hover:border-foreground/30 hover:shadow-xs'
                                                }`}
                                                style={{
                                                    backgroundColor: bgStyle,
                                                    color: fgStyle,
                                                }}
                                            >
                                                {/* Header in card */}
                                                <div className="flex items-center justify-between gap-1 mb-3">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="font-bold text-xs capitalize truncate" style={{ color: fgStyle }}>
                                                            {t.name}
                                                        </span>
                                                        <span 
                                                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                                                t.type === 'dark' ? 'bg-white/10 text-white/80' : 'bg-black/10 text-black/80'
                                                            }`}
                                                        >
                                                            {t.type}
                                                        </span>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 4 Swatch Pills with 'A' */}
                                                <div className="flex items-center gap-1">
                                                    {t.preview.map((color, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex-1 h-6 rounded-md flex items-center justify-center text-[10px] font-black shadow-xs"
                                                            style={{
                                                                backgroundColor: color,
                                                                color: '#ffffff',
                                                                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                                            }}
                                                        >
                                                            A
                                                        </div>
                                                    ))}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="flex flex-col gap-6">
                            <div className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Preferensi Notifikasi & Peringatan Otomatis</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Atur peringatan instan saat ada transaksi baru, stok logistik kritis, atau follow-up prospek.
                                    </p>
                                </div>

                                <div className="divide-y divide-border/60">
                                    <div className="py-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Email Alert: Pembayaran Masuk</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                Kirim email otomatis saat jamaah/agen mengunggah bukti transfer baru (status Pending).
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleNotif('emailPaymentAlert')}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                notifSettings.emailPaymentAlert ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    notifSettings.emailPaymentAlert ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="py-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Email Alert: Stok Logistik Menipis (Alert Limit)</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                Kirim notifikasi saat stok perlengkapan mencapai batas stok minimum di tabel inventaris.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleNotif('emailStockAlert')}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                notifSettings.emailStockAlert ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    notifSettings.emailStockAlert ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="py-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Email Alert: Prospek / Leads Baru</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                Kirim email saat ada calon jamaah mendaftar via formulir mandiri (B2C Registration).
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleNotif('emailNewLeadAlert')}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                notifSettings.emailNewLeadAlert ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    notifSettings.emailNewLeadAlert ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Security & Profile Tab */}
                    {activeTab === 'security' && (
                        <div className="flex flex-col gap-6">
                            <div className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>

                            <div className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
                                <UpdatePasswordForm />
                            </div>

                            <div className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
                                <DeleteUserForm />
                            </div>
                        </div>
                    )}

                    {/* 4. Regional & Format Tab */}
                    {activeTab === 'regional' && (
                        <div className="flex flex-col gap-6">
                            <div className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Pengaturan Format Regional & Mata Uang</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Standarisasi format angka, mata uang, dan tanggal untuk invoice dan dashboard operasional.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1.5">
                                            Mata Uang Utama
                                        </label>
                                        <select
                                            value={currencyFormat}
                                            onChange={(e) => setCurrencyFormat(e.target.value)}
                                            className="w-full rounded-xl border border-border bg-background text-foreground text-sm p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            <option value="IDR">Rupiah Indonesia (Rp / IDR)</option>
                                            <option value="SAR">Saudi Riyal (SAR)</option>
                                            <option value="USD">US Dollar ($ / USD)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1.5">
                                            Format Tanggal
                                        </label>
                                        <select
                                            value={dateFormat}
                                            onChange={(e) => setDateFormat(e.target.value)}
                                            className="w-full rounded-xl border border-border bg-background text-foreground text-sm p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 31/08/2026)</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD (Contoh: 2026-08-31)</option>
                                            <option value="DD MMMM YYYY">DD MMMM YYYY (Contoh: 31 Agustus 2026)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>Preferensi format diterapkan otomatis di seluruh laporan keuangan dan tabel jamaah.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}
