import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { updatePasswordSchema, zodErrors } from '@/lib/schemas';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Transition } from '@headlessui/react';
import { KeyRound, Lock, CheckCircle2, Save, Loader2 } from 'lucide-react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
        setError,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        const clientErrors = zodErrors(updatePasswordSchema, data);
        if (Object.keys(clientErrors).length > 0) {
            setError(clientErrors as any);
            return;
        }

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <Card className={`bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xs ${className}`}>
            <CardHeader className="p-0 pb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-foreground">
                            Keamanan &amp; Kata Sandi
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Pastikan akun Anda menggunakan kata sandi yang aman dan tidak mudah ditebak untuk menjaga kerahasiaan data travel.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 pt-6">
                <form onSubmit={updatePassword} className="flex flex-col gap-4 max-w-xl">
                    <div className="space-y-1.5">
                        <Label htmlFor="current_password" className="text-xs font-semibold text-foreground">
                            Kata Sandi Saat Ini
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) =>
                                    setData('current_password', e.target.value)
                                }
                                type="password"
                                className="pl-10 text-xs rounded-xl h-10 bg-background"
                                autoComplete="current-password"
                                placeholder="Masukkan password lama"
                            />
                        </div>
                        {errors.current_password && (
                            <p className="text-xs text-destructive font-medium">{errors.current_password}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                            Kata Sandi Baru
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="pl-10 text-xs rounded-xl h-10 bg-background"
                                autoComplete="new-password"
                                placeholder="Minimal 8 karakter"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-destructive font-medium">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-semibold text-foreground">
                            Konfirmasi Kata Sandi Baru
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                type="password"
                                className="pl-10 text-xs rounded-xl h-10 bg-background"
                                autoComplete="new-password"
                                placeholder="Ulangi password baru"
                            />
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-xs text-destructive font-medium">{errors.password_confirmation}</p>
                        )}
                    </div>

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
                                    <span>Perbarui Kata Sandi</span>
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
                                <span>Kata sandi berhasil diperbarui.</span>
                            </p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
