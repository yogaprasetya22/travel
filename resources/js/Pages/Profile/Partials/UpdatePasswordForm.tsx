import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { updatePasswordSchema, zodErrors } from '@/lib/schemas';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';

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
        <section className={className}>
            <header className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-bold text-foreground">
                        Keamanan &amp; Kata Sandi
                    </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-7">
                    Pastikan akun Anda menggunakan kata sandi yang aman dan tidak mudah ditebak untuk menjaga kerahasiaan data travel.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-5 space-y-4 max-w-xl">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Kata Sandi Saat Ini"
                    />
                    <div className="relative mt-1">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type="password"
                            className="block w-full pl-10"
                            autoComplete="current-password"
                            placeholder="Masukkan password lama"
                        />
                    </div>
                    <InputError
                        message={errors.current_password}
                        className="mt-1.5"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />
                    <div className="relative mt-1">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="block w-full pl-10"
                            autoComplete="new-password"
                            placeholder="Minimal 8 karakter"
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi Baru"
                    />
                    <div className="relative mt-1">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type="password"
                            className="block w-full pl-10"
                            autoComplete="new-password"
                            placeholder="Ulangi password baru"
                        />
                    </div>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                    </PrimaryButton>

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
        </section>
    );
}
