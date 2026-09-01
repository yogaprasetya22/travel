import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { updatePasswordSchema, zodErrors } from '@/lib/schemas';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
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
        <Card className={`backdrop-blur-md shadow-xs ${className}`}>
            <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-base font-bold text-foreground">
                        Keamanan &amp; Kata Sandi
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground ml-7">
                    Pastikan akun Anda menggunakan kata sandi yang aman dan tidak mudah ditebak untuk menjaga kerahasiaan data travel.
                </CardDescription>
            </CardHeader>

            <form onSubmit={updatePassword}>
                <CardContent className="pt-6 space-y-4 max-w-xl">
                    <div className="space-y-1.5">
                        <Label htmlFor="current_password" className="text-xs font-semibold">
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
                                className="pl-10 text-xs rounded-xl"
                                autoComplete="current-password"
                                placeholder="Masukkan password lama"
                            />
                        </div>
                        {errors.current_password && (
                            <p className="text-xs text-destructive font-medium">{errors.current_password}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-semibold">
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
                                className="pl-10 text-xs rounded-xl"
                                autoComplete="new-password"
                                placeholder="Minimal 8 karakter"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-destructive font-medium">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-semibold">
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
                                className="pl-10 text-xs rounded-xl"
                                autoComplete="new-password"
                                placeholder="Ulangi password baru"
                            />
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-xs text-destructive font-medium">{errors.password_confirmation}</p>
                        )}
                    </div>
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
                </CardFooter>
            </form>
        </Card>
    );
}
