import React, { useState } from 'react';
import PageLayout from '@/Components/Layouts/PageLayout';
import { PageProps } from '@/Types';
import { usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateAgentLandingForm from './Partials/UpdateAgentLandingForm';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { getAgentBioUrl } from '@/lib/utils';
import {
    Mail,
    Building2,
    BadgeCheck,
    Copy,
    Check,
    Sparkles,
    User as UserIcon,
    Shield,
    ExternalLink,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';

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
    const [activeTab, setActiveTab] = useState<string>('linktree');

    const agentProfileUrl = getAgentBioUrl(user.referral_code, user.tenant?.domain_atau_subdomain);

    const handleCopy = () => {
        if (!agentProfileUrl) return;
        navigator.clipboard.writeText(agentProfileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <PageLayout
            title="Pengaturan Profil & Bio Link"
            breadcrumbParent="Pengaturan Travel"
            breadcrumbPage="Profil & Bio Link"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto"
        >
            {/* User Profile Banner with shadcn Card & Avatar */}
            <Card className="bg-card/60 backdrop-blur-md border border-border/80 shadow-xs">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-2xl border-2 border-primary/30 shadow-md">
                            <AvatarImage src={user.avatar_url || user.avatar || undefined} alt={user.name} className="object-cover" />
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

                    {agentProfileUrl && (
                        <a
                            href={agentProfileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all"
                        >
                            <span>Lihat Bio Link Saya</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </CardContent>
            </Card>

            {/* Unique Referral & Bio Link Card */}
            {agentProfileUrl && (
                <Card className="bg-gradient-to-r from-primary/10 via-card to-primary/5 border border-primary/20 shadow-xs rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="font-extrabold text-sm text-foreground">
                                    Tautan Bio Link &amp; Referral Resmi Anda
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-xl">
                                Pasang link ini di bio Instagram/TikTok/WhatsApp Anda. Calon jamaah yang mengklik akan langsung diarahkan ke halaman Linktree Anda.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                readOnly
                                value={agentProfileUrl}
                                className="text-xs h-9 font-mono rounded-xl bg-background max-w-xs"
                            />
                            <Button
                                size="sm"
                                onClick={handleCopy}
                                className="text-xs font-bold rounded-xl h-9 gap-1.5 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
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

            {/* Shadcn Tabs System */}
            <Tabs
                value={activeTab}
                onValueChange={(val) => { if (typeof val === 'string') setActiveTab(val); }}
                className="flex flex-col gap-6 w-full"
            >
                {/* Navigation Tabs List */}
                <TabsList className="flex flex-row overflow-x-auto no-scrollbar items-center justify-start w-full p-1.5 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 shadow-xs gap-1.5 h-auto bg-transparent">
                    <TabsTrigger
                        value="linktree"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted hover:text-foreground border-0 shadow-none after:hidden"
                    >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">Kustomisasi Bio Link (Linktree)</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="account"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted hover:text-foreground border-0 shadow-none after:hidden"
                    >
                        <UserIcon className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">Informasi Akun Dasar</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="security"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted hover:text-foreground border-0 shadow-none after:hidden"
                    >
                        <Shield className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">Keamanan &amp; Kata Sandi</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Forms based on Active Tab */}
                <div className="flex flex-col gap-6">
                    <TabsContent value="linktree" className="flex flex-col gap-6 m-0 outline-none">
                        <UpdateAgentLandingForm />
                    </TabsContent>

                    <TabsContent value="account" className="flex flex-col gap-6 m-0 outline-none">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </TabsContent>

                    <TabsContent value="security" className="flex flex-col gap-6 m-0 outline-none">
                        <UpdatePasswordForm />
                        <DeleteUserForm protection={protection} />
                    </TabsContent>
                </div>
            </Tabs>
        </PageLayout>
    );
}
