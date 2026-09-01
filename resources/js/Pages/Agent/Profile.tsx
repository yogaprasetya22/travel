import React from 'react';
import themeData from '@/lib/theme-colors.json';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, CheckCircle2, Quote, ShieldCheck, Sparkles, PhoneCall, FileCheck, Award } from 'lucide-react';
import { PageProps } from '@/Types';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface Props extends PageProps {
    agent: any;
    tenant: any;
    registerUrl: string;
}

export default function Profile({ agent, tenant, registerUrl }: Props) {
    const defaultQuote = "Saya berkomitmen untuk mendampingi setiap langkah Anda menuju Tanah Suci. Dari persiapan hingga kepulangan, kenyamanan dan kekhusyukan ibadah Anda adalah prioritas utama saya.";

    return (
        <>
            <Head title={`Profil Resmi Agen - ${agent.name}`} />

            <div 
                className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground"
                style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'coffee']?.variables || themeData.themes['coffee'].variables) as React.CSSProperties}
            >
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-black text-white min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
                    <div className="absolute inset-0">
                        <img
                            className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 ease-out"
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuRfx18XdPPHJgs8-pIgNNgSzlUT9_LuyX3E_DqSZx4w&s=10"
                            alt="Makkah Holy Mosque"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/80" />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                    </div>

                    <div className="relative max-w-5xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span>Layanan Pendampingan Resmi Ibadah Umroh &amp; Haji</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-normal sm:leading-tight max-w-4xl text-white"
                        >
                            Wujudkan Ibadah Suci Bersama{' '}
                            <span className="text-primary block mt-1">
                                {tenant?.nama_travel || 'Travel Kami'}
                            </span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-sm sm:text-lg text-white/80 max-w-2xl font-medium drop-shadow-xs"
                        >
                            Dapatkan bimbingan ibadah terpercaya, amanah, dan pelayanan profesional langsung bersama mitra konsultan resmi kami.
                        </motion.p>
                    </div>
                </div>

                {/* Profile Card Section */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
                    >
                        <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                            {/* Agent Bio / Info */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6">
                                <div className="relative shrink-0">
                                    <div className="p-1 rounded-full bg-gradient-to-tr from-primary to-primary/40 shadow-xl">
                                        <img
                                            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-background object-cover bg-background"
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=0D1117&color=fff&size=256`}
                                            alt={agent.name}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md border-2 border-background" title="Konsultan Resmi Terverifikasi">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                                            Konsultan Resmi {tenant?.nama_travel}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] font-semibold border-border">
                                            ID: {agent.referral_code || 'AG-VERIFIED'}
                                        </Badge>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                        {agent.name}
                                    </h2>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start text-xs sm:text-sm text-muted-foreground gap-x-4 gap-y-1 pt-0.5">
                                        <div className="flex items-center gap-1 font-semibold text-foreground">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            <span>4.9</span>
                                            <span className="text-muted-foreground font-normal text-xs">(120+ Jamaah Terbimbing)</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 text-primary" />
                                            <span>Konsultan Area Indonesia</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* CTA Button */}
                            <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0">
                                <Link href={registerUrl} className="w-full sm:w-auto">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm sm:text-base rounded-2xl px-8 py-6 shadow-xl shadow-primary/25 gap-2 transition-all hover:scale-[1.02]"
                                    >
                                        <span>Daftar Bersama Saya</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                    <span>Pendaftaran Cepat &amp; Terhubung Langsung</span>
                                </p>
                            </div>
                        </div>

                        {/* Testimonial / Quote Box (Dynamic from Agent Bio) */}
                        <div className="bg-muted/40 px-6 sm:px-10 py-6 border-t border-border flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                                <Quote className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Komitmen Pelayanan:</span>
                                <p className="text-sm sm:text-base text-foreground italic font-medium leading-relaxed">
                                    "{agent.bio && agent.bio.trim() !== '' ? agent.bio : defaultQuote}"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features & Benefits Section */}
                <div className="max-w-5xl mx-auto py-20 px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
                    <div className="text-center flex flex-col items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                            KEMUDAHAN &amp; KEUNTUNGAN
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            Keunggulan Mendaftar Melalui {agent.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl font-medium">
                            Nikmati fasilitas pendampingan personal dari persiapan dokumen hingga kepulangan ke tanah air.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: PhoneCall,
                                title: 'Konsultasi Personal 24/7',
                                desc: 'Dapatkan bantuan konsultasi langsung, info manasik, dan tanya jawab ibadah kapan saja tanpa ribet.'
                            },
                            {
                                icon: FileCheck,
                                title: 'Bantuan Penuh Dokumen',
                                desc: 'Pengurusan paspor, visa umroh, serta administrasi keberangkatan dibimbing langkah demi langkah.'
                            },
                            {
                                icon: Award,
                                title: 'Jaminan Harga & Kursi Resmi',
                                desc: 'Pemberangkatan terjamin resmi dengan kepastian hotel dan tiket pesawat direct tanpa transit.'
                            }
                        ].map((item, index) => {
                            const IconComp = item.icon;
                            return (
                                <motion.div 
                                    key={index}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-card p-6 rounded-3xl border border-border shadow-xs hover:shadow-md transition-all flex flex-col gap-3.5"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <IconComp className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom Floating CTA Banner */}
                    <div className="mt-6 p-8 rounded-3xl bg-card border border-border shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                        <div className="flex flex-col gap-1.5 max-w-lg">
                            <h3 className="text-lg sm:text-xl font-black text-foreground">Siap Memulai Langkah Menuju Baitullah?</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                Hubungi atau daftarkan nama Anda sekarang bersama {agent.name} untuk mendapatkan jadwal keberangkatan terbaik.
                            </p>
                        </div>
                        <Link href={registerUrl} className="shrink-0 w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs sm:text-sm rounded-2xl px-7 py-6 shadow-md">
                                Daftar Calon Jamaah Sekarang
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-card border-t border-border py-8 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {tenant?.nama_travel || 'Travel Kami'}. Didukung oleh Sistem Layanan Keagenan Resmi.</p>
                </footer>
            </div>
        </>
    );
}
