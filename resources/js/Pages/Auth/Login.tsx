import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { loginSchema, zodErrors } from '@/lib/schemas';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row w-full">
            <Head title="Log In" />

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
                        <div className="text-lg font-bold tracking-tight flex items-center gap-3">
                            <ApplicationLogo className="w-9 h-9 shrink-0" />
                            <span>HajjFlow <span className="font-normal text-amber-300">Pro</span></span>
                        </div>
                    </header>

                    <div className="mt-auto pb-6">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                            Begin Your Journey
                        </h1>
                        <p className="text-sm md:text-base text-gray-300 max-w-md leading-relaxed">
                            Sign in to manage travel documentation, review payments, coordinate itineraries, and complete your Hajj or Umrah preparations securely.
                        </p>
                    </div>
                </div>
            </section>

            {/* Right Side - Form Canvas */}
            <section className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-md w-full mx-auto">
                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-sm font-medium text-green-600 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    <Card className="border-gray-200/60 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900 rounded-3xl p-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">
                                Enter your credentials to access the HajjFlow Pro platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-5">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="rounded-xl p-3 dark:bg-gray-800"
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
                                        <Label htmlFor="password" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="rounded-xl p-3 dark:bg-gray-800"
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
                                    <span className="ms-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Remember this device
                                    </span>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-750 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl py-3 font-semibold transition"
                                    disabled={processing}
                                >
                                    {processing ? 'Logging in...' : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
