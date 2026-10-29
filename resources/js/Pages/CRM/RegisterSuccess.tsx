import { Head } from '@inertiajs/react';
import React from 'react';
import { Tenant } from '@/Types';

interface RegisterSuccessProps {
    tenant: Tenant | null;
}

export default function RegisterSuccess({ tenant }: RegisterSuccessProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-4">
            <Head title="Registration Successful" />

            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl text-center">
                {/* Success Check Icon */}
                <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-150 dark:border-green-900/50">
                    <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Registration Completed!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Thank you for registering. Your details have been submitted successfully to{' '}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {tenant?.nama_travel || 'Travel Kolibrinektara'}
                    </span>.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    Our team will contact you shortly to guide you through the next steps and payment confirmation.
                </p>
            </div>
        </div>
    );
}
