import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { registerSchema, zodErrors } from '@/lib/schemas';

export default function Register() {
    const { data, setData, post, processing, errors, reset, setError } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const clientErrors = zodErrors(registerSchema, data);
        if (Object.keys(clientErrors).length > 0) {
            setError(clientErrors as any);
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row w-full">
            <Head title="Register" />

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
                        <div className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white font-extrabold text-xs">
                                H
                            </div>
                            <span>HajjFlow <span className="font-normal text-indigo-200">Pro</span></span>
                        </div>
                    </header>

                    <div className="mt-auto pb-6">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                            Join the Platform
                        </h1>
                        <p className="text-sm md:text-base text-gray-300 max-w-md leading-relaxed">
                            Create your account to start managing travel pipelines, coordinating schedules, and tracking logistics securely.
                        </p>
                    </div>
                </div>
            </section>

            {/* Right Side - Form Canvas */}
            <section className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-md w-full mx-auto">
                    <Card className="border-gray-200/60 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900 rounded-3xl p-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">
                                Get started by filling out your account information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <Label htmlFor="name" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="rounded-xl p-3 dark:bg-gray-800"
                                        autoComplete="name"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
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
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <Label htmlFor="password" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="rounded-xl p-3 dark:bg-gray-800"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1">
                                    <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="rounded-xl p-3 dark:bg-gray-800"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <Link
                                        href={route('login')}
                                        className="text-xs text-gray-600 dark:text-gray-400 hover:underline font-semibold"
                                    >
                                        Already registered?
                                    </Link>

                                    <Button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-750 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl px-6 py-3 font-semibold transition"
                                        disabled={processing}
                                    >
                                        {processing ? 'Registering...' : 'Register'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
