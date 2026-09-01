import React, { useState } from 'react';
import PageLayout from '@/Components/Layouts/PageLayout';
import { PageProps } from '@/Types';
import { usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Mail, Building2, BadgeCheck, Share2, Copy, Check, Sparkles } from 'lucide-react';

interface Props extends PageProps {
    mustVerifyEmail: boolean;
    status?: string;
    protection?: {
        isSoleOwner: boolean;
        isSoleSuperAdmin: boolean;
    };
}

export default function Edit({
    mustVerifyEmail,
    status,
    protection,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const [copied, setCopied] = useState(false);

    const referralUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/daftar?ref=${encodeURIComponent(user.email)}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <PageLayout
            title="Pengaturan Profil Akun"
            breadcrumbParent="Pengaturan Travel"
            breadcrumbPage="Profil Akun"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto"
        >
            {/* User Profile Banner with shadcn Card & Avatar */}
            <Card className="bg-card/60 backdrop-blur-md border border-border/80 shadow-xs">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-2xl border border-primary/20 bg-primary/10">
                            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-extrabold text-2xl">
                                {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-foreground">{user.name}</h1>
                                <Badge variant="secondary" className="gap-1 font-extrabold text-[11px] bg-primary/10 text-primary border border-primary/20">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    <span>{user.level_label || (user.level === 0 ? 'Level 0 (Super Admin Master)' : `Level ${user.level}`)}</span>
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{user.email}</span>
                                </div>
                                {user.tenant && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Building2 className="w-3.5 h-3.5 text-primary" />
                                            <span>{user.tenant.nama_travel}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Unique Referral Link Card for Agents & Leaders */}
            {user.level >= 1 && (
                <Card className="bg-gradient-to-r from-primary/5 via-card to-primary/5 border border-primary/20 shadow-xs rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="font-extrabold text-sm text-foreground">
                                    Link Referral Pendaftaran Calon Jamaah Anda
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-xl">
                                Bagikan link ini ke calon jamaah di WhatsApp / Medsos. Calon jamaah yang mendaftar melalui link ini akan otomatis ter-assign ke akun Anda dan komisi tercatat langsung.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                readOnly
                                value={referralUrl}
                                className="text-xs h-9 font-mono rounded-xl bg-background max-w-xs"
                            />
                            <Button
                                size="sm"
                                onClick={handleCopy}
                                className="text-xs font-bold rounded-xl h-9 gap-1.5 shrink-0"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Tersalin!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin Link</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Profile Forms with shadcn Components */}
            <div className="flex flex-col gap-6">
                {/* 1. Informasi Profil */}
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                />

                {/* 2. Update Password */}
                <UpdatePasswordForm />

                {/* 3. Delete Account with Protection */}
                <DeleteUserForm protection={protection} />
            </div>
        </PageLayout>
    );
}
