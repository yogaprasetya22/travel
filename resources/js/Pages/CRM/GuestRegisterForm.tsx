import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { Tenant, Paket } from '@/Types';
import { guestRegisterSchema, zodErrors } from '@/lib/schemas';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface GuestRegisterFormProps {
    email: string;
    packages: Paket[];
    tenant: Tenant | null;
}

export default function GuestRegisterForm({ email, packages, tenant }: GuestRegisterFormProps) {
    const { data, setData, post, processing, errors, setError } = useForm({
        nama_lengkap: '',
        nik: '',
        no_hp: '',
        email: email,
        paket_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const clientErrors = zodErrors(guestRegisterSchema, data);
        if (Object.keys(clientErrors).length > 0) {
            setError(clientErrors as any);
            return;
        }

        post(route('crm.guest-register-submit'));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-4">
            <Head title="Guest Registration" />

            <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
                {/* Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    {tenant?.logo ? (
                        <img
                            src={tenant.logo}
                            alt={tenant.nama_travel}
                            className="h-12 mx-auto mb-4 object-contain"
                        />
                    ) : (
                        <ApplicationLogo className="w-12 h-12 mb-3 shrink-0" />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Pilgrim Registration
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Welcome to {tenant?.nama_travel || 'Travel Kolibrinektara'}. Please complete your registration details.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={data.nama_lengkap}
                            onChange={(e) => setData('nama_lengkap', e.target.value)}
                            required
                            className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                            placeholder="John Doe"
                        />
                        {errors.nama_lengkap && (
                            <span className="text-xs text-red-500 mt-1 block">{errors.nama_lengkap}</span>
                        )}
                    </div>

                    {/* NIK */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                            NIK (National ID Number)
                        </label>
                        <input
                            type="text"
                            value={data.nik}
                            onChange={(e) => setData('nik', e.target.value)}
                            maxLength={16}
                            className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                            placeholder="16-digit ID number"
                        />
                        {errors.nik && (
                            <span className="text-xs text-red-500 mt-1 block">{errors.nik}</span>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            value={data.no_hp}
                            onChange={(e) => setData('no_hp', e.target.value)}
                            required
                            className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                            placeholder="08123456789"
                        />
                        {errors.no_hp && (
                            <span className="text-xs text-red-500 mt-1 block">{errors.no_hp}</span>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            disabled
                            className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 dark:text-gray-400 text-sm p-3 cursor-not-allowed"
                        />
                    </div>

                    {/* Package Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Choose Package
                        </label>
                        <select
                            value={data.paket_id}
                            onChange={(e) => setData('paket_id', e.target.value)}
                            required
                            className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                        >
                            <option value="">Select a package</option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.nama_paket} - Rp {Number(pkg.harga).toLocaleString('id-ID')}
                                </option>
                            ))}
                        </select>
                        {errors.paket_id && (
                            <span className="text-xs text-red-500 mt-1 block">{errors.paket_id}</span>
                        )}
                    </div>

                    {/* Mock Upload Section for aesthetics */}
                    <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-900/50 text-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2 font-medium">
                            KTP / Passport Scans
                        </span>
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 text-xs rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                            >
                                Upload KTP
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 text-xs rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                            >
                                Upload Passport
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {processing ? 'Submitting...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}
