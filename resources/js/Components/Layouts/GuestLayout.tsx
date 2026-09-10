import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import themeData from '@/lib/theme-colors.json';

export default function Guest({ children }: PropsWithChildren) {
    const { auth, tenant } = usePage<any>().props;
    const activeTenant = tenant || auth?.active_tenant;
    const travelName = activeTenant?.nama_travel || 'HajjFlow Pro';
    const logoUrl = activeTenant?.logo;
    const themeName = (activeTenant?.theme_name as keyof typeof themeData.themes) || 'coffee';
    const themeStyles = (themeData.themes[themeName]?.variables || themeData.themes['coffee'].variables) as React.CSSProperties;

    return (
        <div className="flex min-h-screen flex-col items-center bg-muted/20 pt-6 sm:justify-center sm:pt-0 font-sans" style={themeStyles}>
            <div>
                <Link href="/" className="flex flex-col items-center gap-2">
                    {logoUrl ? (
                        <img src={logoUrl} alt={travelName} className="h-16 w-auto rounded-2xl shadow-sm" />
                    ) : (
                        <ApplicationLogo className="h-16 w-16 fill-current text-gray-500" />
                    )}
                    <span className="font-extrabold text-foreground text-base tracking-tight">{travelName}</span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-card border border-border px-6 py-5 shadow-lg sm:max-w-md sm:rounded-2xl text-card-foreground">
                {children}
            </div>
        </div>
    );
}
