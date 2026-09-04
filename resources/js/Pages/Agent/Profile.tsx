import React from 'react';
import themeData from '@/lib/theme-colors.json';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/Types';
import AgentLandingTemplate from '@/Components/Agent/AgentLandingTemplate';

interface Props extends PageProps {
    agent: any;
    tenant: any;
    packages?: any[];
    registerUrl: string;
}

export default function Profile({ agent, tenant, registerUrl }: Props) {
    const activeTheme =
        themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'luxury'] ||
        themeData.themes['luxury'];

    return (
        <>
            <Head
                title={`Bimbingan Ibadah Umroh - ${agent.name} (${tenant?.nama_travel || 'Travel'})`}
            />

            <div
                className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-start selection:bg-primary selection:text-primary-foreground relative px-4 py-8 sm:py-12"
                style={activeTheme.variables as React.CSSProperties}
            >
                {/* Background Ambient Glows & Subtle Islamic Radial Motif */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary/10 rounded-full blur-3xl opacity-60" />
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 h-64 border border-primary/10 rounded-full opacity-40 animate-pulse" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm h-64 bg-primary/5 rounded-full blur-2xl opacity-40" />
                </div>

                {/* Main Linktree Card Container */}
                <main className="w-full max-w-md mx-auto relative z-10">
                    <AgentLandingTemplate
                        agent={agent}
                        tenant={tenant}
                        registerUrl={registerUrl}
                        isPreview={false}
                    />
                </main>
            </div>
        </>
    );
}
