import React from 'react';
import { Tag } from 'lucide-react';

const DEFAULT_SOURCES = [
    { name: 'Instagram & Facebook Ads', desc: 'Iklan bersponsor media sosial' },
    { name: 'Referral Mitra Agen', desc: 'Direct sales dari mitra agen lapangan' },
    { name: 'Portal Pendaftaran Mandiri (B2C)', desc: 'Link registrasi email & website travel' },
    { name: 'Walk-in Kantor Pusat', desc: 'Jamaah datang langsung ke kantor' },
];

export function SourcesTab() {
    return (
        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
            <div className="pb-3 border-b border-border/60">
                <h3 className="font-bold text-base text-foreground">Kategori Sumber Prospek (Lead Channel Sources)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Daftar saluran akuisisi leads untuk analisis konversi marketing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEFAULT_SOURCES.map((src, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-3">
                        <Tag className="w-4 h-4 text-primary shrink-0" />
                        <div>
                            <div className="font-bold text-sm text-foreground">{src.name}</div>
                            <div className="text-xs text-muted-foreground">{src.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
