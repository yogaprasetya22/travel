import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { loginSchema, zodErrors } from '@/lib/schemas';
import themeData from '@/lib/theme-colors.json';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { auth, tenant } = usePage<any>().props;
    const activeTenant = tenant || auth?.active_tenant;
    const travelName = activeTenant?.nama_travel || 'HajjFlow Pro';
    const logoUrl = activeTenant?.logo;
    const themeName = (activeTenant?.theme_name as keyof typeof themeData.themes) || 'coffee';
    const themeStyles = (themeData.themes[themeName]?.variables || themeData.themes['coffee'].variables) as React.CSSProperties;

    const { data, setData, post, processing, errors, reset, setError } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const clientErrors = zodErrors(loginSchema, data);
        if (Object.keys(clientErrors).length > 0) {
            setError(clientErrors as any);
            return;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row w-full font-sans" style={themeStyles}>
            <Head title={`Log In - ${travelName}`} />

            {/* Left Side - Visual/Hero Area */}
            <section className="w-full md:w-5/12 lg:w-1/2 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden bg-slate-900 text-white min-h-[300px] md:min-h-screen">
                {/* Background Image with Dark Overlay */}
                <div 
                    className="absolute inset-0 z-0 opacity-40 mix-blend-overlay bg-cover bg-center"
                    style={{ 
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRswVp7sdN8JfRPeWwjQyAy2dlzioO16vN7vY3LCznA70_L_XRqOytWcYA5xGcicqFMycL6uxLW60IBvmfJpylNVoh0PqVwmYxZFvE97PbDA9VlyHwABejHG_zvfgb3c5zIEevEim4x2_P88hxvy9Fo76orXfLg-JK2U1gwbAaKijKNSGgyllShlyWoMVKUzg0cbHQeB8X2IX7jfSqRumCwxZpNGW8GgdsuoOfLNMl4W2bpRRjKkU')" 
                    }}
                ></div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col justify-between h-full w-full">
                    <header className="mb-12">
                        <Link href="/" className="text-lg font-bold tracking-tight flex items-center gap-3 hover:opacity-90 transition">
                            {logoUrl ? (
                                <img src={logoUrl} alt={travelName} className="h-10 w-auto rounded-xl shadow-xs" />
                            ) : (
                                <ApplicationLogo className="w-9 h-9 shrink-0" />
                            )}
                            <span className="font-extrabold text-white text-base sm:text-lg">{travelName}</span>
                        </Link>
                    </header>

                    <div className="mt-auto pb-6">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                            Portal Layanan &amp; Manajemen
                        </h1>
                        <p className="text-sm md:text-base text-gray-300 max-w-md leading-relaxed">
                            Masuk untuk mengelola dokumentasi perjalanan jamaah, verifikasi pembayaran kuitansi, monitoring koordinasi itinerary, dan persiapan Umroh &amp; Haji secara aman.
                        </p>
                    </div>
                </div>
            </section>

            {/* Right Side - Form Canvas */}
            <section className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-background text-foreground">
                <div className="max-w-md w-full mx-auto">
                    {status && (
                        <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                            {status}
                        </div>
                    )}

                    <Card className="border-border shadow-2xl bg-card text-card-foreground rounded-3xl p-3 sm:p-4">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Selamat Datang Kembali</CardTitle>
                            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                                Masukkan kredensial Anda untuk mengakses portal manajemen {travelName}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-5">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Alamat Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="rounded-xl p-3 bg-background border-border text-foreground focus-visible:ring-primary"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Kata Sandi
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs text-primary hover:underline font-semibold"
                                            >
                                                Lupa kata sandi?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="rounded-xl p-3 bg-background border-border text-foreground focus-visible:ring-primary"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span className="ms-2 text-xs text-muted-foreground font-medium">
                                        Ingat perangkat ini
                                    </span>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-semibold transition cursor-pointer shadow-md"
                                    disabled={processing}
                                >
                                    {processing ? 'Memproses Masuk...' : 'Masuk ke Portal'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
