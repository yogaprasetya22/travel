import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { updateProfileSchema, zodErrors } from '@/lib/schemas';
import { User, Mail, CheckCircle2 } from 'lucide-react';

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
        <section className={className}>
            <header className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-bold text-foreground">
                        Informasi Profil Akun
                    </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-7">
                    Perbarui nama lengkap dan alamat email yang digunakan untuk login ke sistem.
                </p>
            </header>

            <form onSubmit={submit} className="mt-5 space-y-4 max-w-xl">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                    <div className="relative mt-1">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <TextInput
                            id="name"
                            className="block w-full pl-10"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                    </div>
                    <InputError className="mt-1.5" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <div className="relative mt-1">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <TextInput
                            id="email"
                            type="email"
                            className="block w-full pl-10"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <InputError className="mt-1.5" message={errors.email} />
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
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan Profil'}
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
                            <span>Perubahan berhasil disimpan.</span>
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
