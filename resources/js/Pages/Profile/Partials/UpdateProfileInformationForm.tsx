import { useForm, usePage, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { updateProfileSchema, zodErrors } from '@/lib/schemas';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Transition } from '@headlessui/react';
import { User, Mail, CheckCircle2, Save, Loader2 } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful, setError } =
        useForm<{
            name: string;
            email: string;
            bio: string;
        }>({
            name: user.name,
            email: user.email,
            bio: user.bio || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const clientErrors = zodErrors(updateProfileSchema, data);
        if (Object.keys(clientErrors).length > 0) {
            setError(clientErrors as any);
            return;
        }

        patch(route('profile.update'));
    };

    return (
        <Card className={`bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xs ${className}`}>
            <CardHeader className="p-0 pb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-foreground">
                            Informasi Profil Akun
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Perbarui nama lengkap, email, dan pesan komitmen profil publik Anda.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 pt-6">
                <form onSubmit={submit} className="flex flex-col gap-4 w-full">
                    <div className="space-y-1.5">
                        <Label htmlFor="profile-name" className="text-xs font-semibold text-foreground">
                            Nama Lengkap
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="profile-name"
                                type="text"
                                className="pl-10 text-xs rounded-xl h-10 bg-background"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-destructive font-medium">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="profile-email" className="text-xs font-semibold text-foreground">
                            Alamat Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="profile-email"
                                type="email"
                                className="pl-10 text-xs rounded-xl h-10 bg-background"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-destructive font-medium">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="profile-bio" className="text-xs font-semibold text-foreground">
                                Komitmen / Bio Agen (Ditampilkan di Halaman Profil Publik)
                            </Label>
                            <span className="text-[10px] text-muted-foreground">Opsional</span>
                        </div>
                        <textarea
                            id="profile-bio"
                            rows={3}
                            className="w-full text-xs rounded-xl p-3 bg-background border border-border focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground resize-y"
                            placeholder="Saya berkomitmen untuk mendampingi setiap langkah Anda menuju Tanah Suci. Dari persiapan hingga kepulangan, kenyamanan dan kekhusyukan ibadah Anda adalah prioritas utama saya."
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                        />
                        {errors.bio && (
                            <p className="text-xs text-destructive font-medium">{errors.bio}</p>
                        )}
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs">
                            <p className="text-amber-700 dark:text-amber-300">
                                Alamat email Anda belum diverifikasi.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="font-bold underline hover:text-amber-800 dark:hover:text-amber-200"
                                >
                                    Klik di sini untuk mengirim ulang email verifikasi.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    Tautan verifikasi baru telah dikirim ke alamat email Anda.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing} className="gap-2 rounded-xl text-xs font-bold shadow-xs px-5 h-9">
                            {processing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Simpan Profil</span>
                                </>
                            )}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out duration-300"
                            enterFrom="opacity-0 translate-y-1"
                            leave="transition ease-in-out duration-300"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Perubahan berhasil disimpan.</span>
                            </p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
