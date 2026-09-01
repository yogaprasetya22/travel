import PageLayout from '@/Components/Layouts/PageLayout';
import { PageProps } from '@/Types';
import { usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Mail, Building2, BadgeCheck } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
    protection,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    protection?: {
        isSoleOwner: boolean;
        isSoleSuperAdmin: boolean;
    };
}>) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <PageLayout
            title="Pengaturan Profil Akun"
            breadcrumbParent="Pengaturan Travel"
            breadcrumbPage="Profil Akun"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-5xl"
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
                                <Badge variant="secondary" className="gap-1 font-bold text-[11px] bg-primary/10 text-primary border border-primary/20">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    <span className="capitalize">{user.role?.replace(/_/g, ' ') || 'Pengguna'}</span>
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
