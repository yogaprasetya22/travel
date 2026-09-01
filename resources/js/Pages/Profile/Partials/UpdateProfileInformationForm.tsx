import { useForm, usePage, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { updateProfileSchema, zodErrors } from '@/lib/schemas';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
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
        useForm({
            name: user.name,
            email: user.email,
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
        <Card className={`backdrop-blur-md shadow-xs ${className}`}>
            <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base font-bold text-foreground">
                        Informasi Profil Akun
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground ml-7">
                    Perbarui nama lengkap dan alamat email yang digunakan untuk login ke sistem.
                </CardDescription>
            </CardHeader>

            <form onSubmit={submit}>
                <CardContent className="pt-6 space-y-4 max-w-xl">
                    <div className="space-y-1.5">
                        <Label htmlFor="profile-name" className="text-xs font-semibold">
                            Nama Lengkap
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="profile-name"
                                type="text"
                                className="pl-10 text-xs rounded-xl"
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
                        <Label htmlFor="profile-email" className="text-xs font-semibold">
                            Alamat Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="profile-email"
                                type="email"
                                className="pl-10 text-xs rounded-xl"
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
                </CardContent>

                <CardFooter className="pt-2 pb-6 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="gap-2 rounded-xl text-xs font-bold shadow-xs">
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
                </CardFooter>
            </form>
        </Card>
    );
}
