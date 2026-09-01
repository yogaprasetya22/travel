import PageLayout from '@/Components/Layouts/PageLayout';
import { PageProps } from '@/Types';
import { usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, ShieldCheck, Mail, Building2, Crown, BadgeCheck } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <PageLayout
            title="Pengaturan Profil Akun"
            breadcrumbParent="Pengaturan Travel"
            breadcrumbPage="Profil Akun"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-5xl"
        >
            {/* User Profile Banner Card */}
            <div className="bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-2xl border border-primary/20 shrink-0">
                        {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">{user.name}</h1>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                <span className="capitalize">{user.role?.replace(/_/g, ' ') || 'Pengguna'}</span>
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
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
            </div>

            {/* Form Section Cards */}
            <div className="flex flex-col gap-6">
                {/* 1. Profile Information */}
                <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xs">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                {/* 2. Update Password */}
                <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xs">
                    <UpdatePasswordForm />
                </div>

                {/* 3. Delete Account */}
                <div className="bg-card/70 backdrop-blur-md border border-destructive/20 rounded-2xl p-6 shadow-xs bg-destructive/5">
                    <DeleteUserForm />
                </div>
            </div>
        </PageLayout>
    );
}
