import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Clock, ArrowRight, Check, Sparkles, ChevronRight } from 'lucide-react';

interface TimeRangePickerProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const QUICK_DURATIONS = [
    { label: '+30 Mnt', minutes: 30 },
    { label: '+1 Jam', minutes: 60 },
    { label: '+1.5 Jam', minutes: 90 },
    { label: '+2 Jam', minutes: 120 },
    { label: '+3 Jam', minutes: 180 },
];

export default function TimeRangePicker({
    value = '',
    onChange,
    placeholder = 'Pilih Jam (Mulai - Selesai)',
    className = '',
}: TimeRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

    // Parse initial value (format HH:mm - HH:mm)
    const parseRange = (val: string) => {
        const parts = val.split('-').map((s) => s.trim());
        const start = parts[0] || '08:00';
        const end = parts[1] || '10:00';

        const [startH, startM] = start.includes(':') ? start.split(':') : ['08', '00'];
        const [endH, endM] = end.includes(':') ? end.split(':') : ['10', '00'];

        return {
            startHour: startH.padStart(2, '0'),
            startMinute: startM.padStart(2, '0'),
            endHour: endH.padStart(2, '0'),
            endMinute: endM.padStart(2, '0'),
        };
    };

    const parsed = parseRange(value);
    const [startHour, setStartHour] = useState(parsed.startHour);
    const [startMinute, setStartMinute] = useState(parsed.startMinute);
    const [endHour, setEndHour] = useState(parsed.endHour);
    const [endMinute, setEndMinute] = useState(parsed.endMinute);

    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            const p = parseRange(value);
            setStartHour(p.startHour);
            setStartMinute(p.startMinute);
            setEndHour(p.endHour);
            setEndMinute(p.endMinute);
        }
    }, [value]);

    // Calculate duration addition
    const applyDuration = (addMinutes: number) => {
        const startTotalMinutes = parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);
        let endTotalMinutes = (startTotalMinutes + addMinutes) % (24 * 60);

        const newEndH = Math.floor(endTotalMinutes / 60).toString().padStart(2, '0');
        const newEndM = (Math.round((endTotalMinutes % 60) / 5) * 5 % 60).toString().padStart(2, '0');

        setEndHour(newEndH);
        setEndMinute(newEndM);
    };

    const handleApply = () => {
        const formatted = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
        onChange(formatted);
        setOpen(false);
    };

    const currentH = activeTab === 'start' ? startHour : endHour;
    const currentM = activeTab === 'start' ? startMinute : endMinute;

    const setHour = (h: string) => {
        if (activeTab === 'start') {
            setStartHour(h);
        } else {
            setEndHour(h);
        }
    };

    const setMinute = (m: string) => {
        if (activeTab === 'start') {
            setStartMinute(m);
        } else {
            setEndMinute(m);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                type="button"
                className={`inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted/40 text-xs font-mono transition cursor-pointer text-left shrink-0 select-none shadow-2xs ${className}`}
            >
                <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className={value ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                        {value || placeholder}
                    </span>
                </div>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="w-88 p-4 flex flex-col gap-3.5 rounded-2xl bg-card border border-border shadow-2xl z-50 animate-in fade-in-50 zoom-in-95"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" /> Pilih Rentang Jam
                    </span>
                    <div className="flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <span>{startHour}:{startMinute}</span>
                        <ArrowRight className="w-3 h-3 opacity-70" />
                        <span>{endHour}:{endMinute}</span>
                    </div>
                </div>

                {/* Dual Interactive Cards (Mulai vs Selesai) */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Card Mulai */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('start')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-0.5 relative ${
                            activeTab === 'start'
                                ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                                : 'bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground'
                        }`}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Jam Mulai
                        </span>
                        <div className="text-lg font-black font-mono tracking-tight text-foreground">
                            {startHour}<span className="animate-pulse">:</span>{startMinute}
                        </div>
                        {activeTab === 'start' && (
                            <span className="absolute bottom-1 right-2 text-[9px] font-bold text-primary">
                                Mengedit...
                            </span>
                        )}
                    </button>

                    {/* Card Selesai */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('end')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-0.5 relative ${
                            activeTab === 'end'
                                ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                                : 'bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground'
                        }`}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Jam Selesai
                        </span>
                        <div className="text-lg font-black font-mono tracking-tight text-foreground">
                            {endHour}<span className="animate-pulse">:</span>{endMinute}
                        </div>
                        {activeTab === 'end' && (
                            <span className="absolute bottom-1 right-2 text-[9px] font-bold text-primary">
                                Mengedit...
                            </span>
                        )}
                    </button>
                </div>

                {/* Quick Duration Addition Chips */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Set Durasi Kegiatan (Otomatis Hitung Selesai):
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto low-scrollbar pb-0.5">
                        {QUICK_DURATIONS.map((d) => (
                            <button
                                key={d.label}
                                type="button"
                                onClick={() => applyDuration(d.minutes)}
                                className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 text-[10px] font-bold transition cursor-pointer whitespace-nowrap shadow-2xs"
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Column Wheel Picker for Active Tab */}
                <div className="flex flex-col gap-1 bg-muted/20 p-2 rounded-xl border border-border/60">
                    <div className="grid grid-cols-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">
                        <span>Jam ({activeTab === 'start' ? 'Mulai' : 'Selesai'})</span>
                        <span>Menit</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Hours Column */}
                        <div
                            ref={hourListRef}
                            className="h-36 overflow-y-auto low-scrollbar space-y-1 pr-1"
                        >
                            {HOURS.map((h) => {
                                const isSelected = currentH === h;
                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setHour(h)}
                                        className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'hover:bg-muted text-foreground'
                                        }`}
                                    >
                                        {h}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Minutes Column */}
                        <div
                            ref={minuteListRef}
                            className="h-36 overflow-y-auto low-scrollbar space-y-1 pr-1"
                        >
                            {MINUTES.map((m) => {
                                const isSelected = currentM === m;
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMinute(m)}
                                        className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'hover:bg-muted text-foreground'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <Check className="w-4 h-4" />
                        <span>Terapkan Waktu</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
