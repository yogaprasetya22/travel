import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import CurrencyInput, { toRupiah } from '@/Components/CurrencyInput';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';
import {
    Calendar,
    Banknote,
    Percent,
    Plus,
    Trash2,
    UploadCloud,
    MapPin,
    Package,
    Clock,
} from 'lucide-react';
import TimeRangePicker from '@/Components/TimeRangePicker';
import { PackageItem, InventoryItem, ItineraryItem, ItineraryRundown } from './types';

export interface ItineraryRow extends ItineraryItem {}

interface AddPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventoryItems: InventoryItem[];
}

export function AddPackageModal({ isOpen, onClose, inventoryItems }: AddPackageModalProps) {
    const [commissionType, setCommissionType] = useState<'flat' | 'percentage'>('flat');
    const [itineraries, setItineraries] = useState<ItineraryRow[]>([
        {
            day: 1,
            title: 'Keberangkatan & Tiba di Jeddah/Madinah',
            description: 'Kumpul di Bandara Soekarno-Hatta, penerbangan langsung menuju Arab Saudi, check-in hotel.',
            location: 'Bandara & Hotel',
            rundowns: [
                { time: '04:00 - 06:00', activity: 'Kumpul Jamaah & Briefing Terminal 3 Bandara Soetta', notes: 'Pemberian ID Card & Paspor' },
                { time: '08:30 - 14:30', activity: 'Penerbangan Internasional ke Madinah / Jeddah', notes: 'Direct Flight SV/GA' },
                { time: '16:00 - 18:00', activity: 'Imigrasi, Bagasi & Check-in Hotel', notes: 'Istirahat & Persiapan Sholat' },
            ],
        },
    ]);

    const { data, setData, post, processing, errors, reset } = useForm<{
        nama_paket: string;
        harga: string;
        kuota: string;
        deskripsi: string;
        brosur_image: File | null;
        itinerary: string;
        komisi_flat: string;
        komisi_persentase: string;
        periode_mulai: string;
        periode_selesai: string;
        is_active: boolean;
        inventaris_ids: number[];
    }>({
        nama_paket: '',
        harga: '',
        kuota: '45',
        deskripsi: '',
        brosur_image: null,
        itinerary: '[]',
        komisi_flat: '1500000',
        komisi_persentase: '5',
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
        inventaris_ids: [],
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setCommissionType('flat');
            setItineraries([
                {
                    day: 1,
                    title: 'Keberangkatan & Tiba di Jeddah/Madinah',
                    description: 'Kumpul di Bandara Soekarno-Hatta, penerbangan langsung menuju Arab Saudi, check-in hotel.',
                    location: 'Bandara & Hotel',
                    rundowns: [
                        { time: '04:00 - 06:00', activity: 'Kumpul Jamaah & Briefing Terminal 3 Bandara Soetta', notes: 'Pemberian ID Card & Paspor' },
                        { time: '08:30 - 14:30', activity: 'Penerbangan Internasional ke Madinah / Jeddah', notes: 'Direct Flight' },
                        { time: '16:00 - 18:00', activity: 'Imigrasi, Bagasi & Check-in Hotel', notes: 'Istirahat' },
                    ],
                },
            ]);
        }
    }, [isOpen]);

    const addItineraryDay = () => {
        const nextDay = itineraries.length + 1;
        setItineraries((prev) => [
            ...prev,
            {
                day: nextDay,
                title: `Aktivitas Ibadah Hari ke-${nextDay}`,
                description: '',
                location: '',
                rundowns: [{ time: '08:00 - 10:00', activity: '', notes: '' }],
            },
        ]);
    };

    const removeItineraryDay = (index: number) => {
        setItineraries((prev) => prev.filter((_, i) => i !== index).map((row, i) => ({ ...row, day: i + 1 })));
    };

    const updateItineraryField = (index: number, field: keyof ItineraryRow, val: any) => {
        setItineraries((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: val };
            return next;
        });
    };

    const addRundown = (dayIdx: number) => {
        setItineraries((prev) => {
            const next = [...prev];
            const currentRundowns = next[dayIdx].rundowns || [];
            next[dayIdx] = {
                ...next[dayIdx],
                rundowns: [...currentRundowns, { time: '08:00 - 10:00', activity: '', notes: '' }],
            };
            return next;
        });
    };

    const removeRundown = (dayIdx: number, rundownIdx: number) => {
        setItineraries((prev) => {
            const next = [...prev];
            const currentRundowns = next[dayIdx].rundowns || [];
            next[dayIdx] = {
                ...next[dayIdx],
                rundowns: currentRundowns.filter((_, rIdx) => rIdx !== rundownIdx),
            };
            return next;
        });
    };

    const updateRundownField = (
        dayIdx: number,
        rundownIdx: number,
        field: keyof ItineraryRundown,
        val: string
    ) => {
        setItineraries((prev) => {
            const next = [...prev];
            const currentRundowns = [...(next[dayIdx].rundowns || [])];
            currentRundowns[rundownIdx] = {
                ...currentRundowns[rundownIdx],
                [field]: val,
            };
            next[dayIdx] = {
                ...next[dayIdx],
                rundowns: currentRundowns,
            };
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Attach json string of itinerary
        const formData = new FormData();
        formData.append('nama_paket', data.nama_paket);
        formData.append('harga', data.harga);
        formData.append('kuota', data.kuota || '45');
        formData.append('deskripsi', data.deskripsi);
        if (data.brosur_image) {
            formData.append('brosur_image', data.brosur_image);
        }
        formData.append('itinerary', JSON.stringify(itineraries));
        formData.append('komisi_flat', data.komisi_flat);
        formData.append('komisi_persentase', data.komisi_persentase);
        formData.append('periode_mulai', data.periode_mulai);
        formData.append('periode_selesai', data.periode_selesai);
        formData.append('is_active', data.is_active ? '1' : '0');

        data.inventaris_ids.forEach((id) => {
            formData.append('inventaris_ids[]', id.toString());
        });

        router.post(route('settings.master.store-package'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2 p-0 flex flex-col overflow-hidden">
                <SheetHeader className="p-6 pb-2 border-b border-border">
                    <SheetTitle>Tambah Paket Umroh &amp; Haji</SheetTitle>
                    <SheetDescription>Daftarkan produk paket travel, itinerary hari per hari dengan multi-rundown &amp; jam, kuota kursi, dan brosur visual.</SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 flex-1 overflow-y-auto">
                    <div>
                        <InputLabel htmlFor="nama_paket" value="Nama Paket *" />
                        <TextInput
                            id="nama_paket"
                            type="text"
                            value={data.nama_paket}
                            className="mt-1 block w-full text-xs"
                            onChange={(e) => setData('nama_paket', e.target.value)}
                            required
                            placeholder="Misal: Umroh Ramadhan VIP 2027"
                        />
                        <InputError message={errors.nama_paket} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="harga" value="Harga Paket (Rp) *" />
                            <div className="mt-1">
                                <CurrencyInput
                                    id="harga"
                                    value={data.harga}
                                    onChange={(val) => setData('harga', val)}
                                    placeholder="35.000.000"
                                    required
                                />
                            </div>
                            <InputError message={errors.harga} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="kuota" value="Total Kuota Seat *" />
                            <TextInput
                                id="kuota"
                                type="number"
                                min={1}
                                value={data.kuota}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('kuota', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="deskripsi" value="Ringkasan Deskripsi Paket" />
                        <textarea
                            id="deskripsi"
                            rows={2}
                            value={data.deskripsi}
                            onChange={(e) => setData('deskripsi', e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground"
                            placeholder="Penjelasan keunggulan hotel, maskapai, dan durasi program..."
                        />
                    </div>

                    {/* Brosur Upload */}
                    <div>
                        <InputLabel value="Foto / Desain Brosur Poster (JPG/PNG maks 5MB)" />
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => setData('brosur_image', e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary cursor-pointer"
                        />
                    </div>

                    {/* Itinerary Dynamic Repeater with Multi-Rundown */}
                    <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Jadwal Kegiatan Harian &amp; Multi-Rundown
                            </h4>
                            <button
                                type="button"
                                onClick={addItineraryDay}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Hari (Day)
                            </button>
                        </div>

                        <div className="space-y-4">
                            {itineraries.map((row, idx) => (
                                <div key={idx} className="p-3.5 bg-card border border-border rounded-xl flex flex-col gap-3 shadow-2xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                                                H{row.day}
                                            </span>
                                            <input
                                                type="text"
                                                value={row.title}
                                                onChange={(e) => updateItineraryField(idx, 'title', e.target.value)}
                                                className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-border bg-background flex-1"
                                                placeholder="Judul Hari (misal: Ziarah Kota Madinah)"
                                            />
                                        </div>
                                        {itineraries.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItineraryDay(idx)}
                                                className="p-1.5 text-muted-foreground hover:text-rose-500 transition rounded-lg hover:bg-rose-500/10 cursor-pointer"
                                                title="Hapus Hari Ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={row.location || ''}
                                            onChange={(e) => updateItineraryField(idx, 'location', e.target.value)}
                                            className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background"
                                            placeholder="Lokasi (misal: Masjid Nabawi, Raudhah)"
                                        />
                                        <input
                                            type="text"
                                            value={row.description}
                                            onChange={(e) => updateItineraryField(idx, 'description', e.target.value)}
                                            className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background"
                                            placeholder="Catatan / Ringkasan kegiatan hari ini..."
                                        />
                                    </div>

                                    {/* Multi-Rundown Sub Repeater */}
                                    <div className="p-3 bg-muted/40 rounded-xl border border-border/70 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-primary" /> Rundown &amp; Jam Kegiatan (Hari ke-{row.day})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => addRundown(idx)}
                                                className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" /> Tambah Jam/Rundown
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {(!row.rundowns || row.rundowns.length === 0) ? (
                                                <p className="text-[10px] text-muted-foreground italic">
                                                    Belum ada sub-rundown jam. Klik "+ Tambah Jam/Rundown" di atas.
                                                </p>
                                            ) : (
                                                row.rundowns.map((rd, rdIdx) => (
                                                    <div key={rdIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-background p-2 rounded-lg border border-border">
                                                        <TimeRangePicker
                                                            value={rd.time}
                                                            onChange={(val) => updateRundownField(idx, rdIdx, 'time', val)}
                                                            className="w-full sm:w-40 shrink-0"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={rd.activity}
                                                            onChange={(e) => updateRundownField(idx, rdIdx, 'activity', e.target.value)}
                                                            placeholder="Nama kegiatan (contoh: Ziarah Makam Rasulullah)"
                                                            className="flex-1 text-[11px] py-1 px-2 rounded-md border border-border bg-card font-medium"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={rd.notes || ''}
                                                            onChange={(e) => updateRundownField(idx, rdIdx, 'notes', e.target.value)}
                                                            placeholder="Catatan (opsional)"
                                                            className="w-full sm:w-36 text-[10px] py-1 px-2 rounded-md border border-border bg-card"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRundown(idx, rdIdx)}
                                                            className="p-1 text-muted-foreground hover:text-rose-500 self-end sm:self-auto cursor-pointer"
                                                            title="Hapus Agenda"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Commission Settings */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                        <InputLabel value="Skema Komisi Agen" />
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setCommissionType('flat');
                                    setData('komisi_persentase', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    commissionType === 'flat'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Nominal Standar (Rp)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCommissionType('percentage');
                                    setData('komisi_flat', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    commissionType === 'percentage'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Percent className="w-3.5 h-3.5" />
                                <span>Persentase (%)</span>
                            </button>
                        </div>

                        {commissionType === 'flat' ? (
                            <div className="mt-2">
                                <InputLabel htmlFor="komisi_flat" value="Nominal Komisi Flat" />
                                <div className="mt-1">
                                    <CurrencyInput
                                        id="komisi_flat"
                                        value={data.komisi_flat}
                                        onChange={(val) => setData('komisi_flat', val)}
                                        placeholder="1.500.000"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-col gap-2">
                                <InputLabel htmlFor="komisi_persentase" value="Persentase Komisi (%)" />
                                <div className="relative flex items-center">
                                    <TextInput
                                        id="komisi_persentase"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.komisi_persentase}
                                        className="block w-full pr-8 text-xs"
                                        onChange={(e) => setData('komisi_persentase', e.target.value)}
                                        placeholder="5"
                                    />
                                    <span className="absolute right-3 text-sm font-bold text-muted-foreground">%</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Hasil Estimasi Komisi:</span>
                                    <span className="font-extrabold text-primary">
                                        {toRupiah((parseFloat(data.harga.replace(/[^0-9]/g, '')) || 0) * (parseFloat(data.komisi_persentase) || 0) / 100)}{' '}
                                        <span className="font-normal text-[10px] text-muted-foreground">/ jamaah</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <SheetFooter className="p-4 border-t border-border flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-xs font-bold"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Paket & Itinerary'}
                        </PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface EditPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: PackageItem | null;
    inventoryItems: InventoryItem[];
}

export function EditPackageModal({ isOpen, onClose, pkg, inventoryItems }: EditPackageModalProps) {
    const [commissionType, setCommissionType] = useState<'flat' | 'percentage'>('flat');
    const [itineraries, setItineraries] = useState<ItineraryRow[]>([]);

    const { data, setData, put, processing, errors } = useForm<{
        nama_paket: string;
        harga: string;
        kuota: string;
        deskripsi: string;
        brosur_image: File | null;
        itinerary: string;
        komisi_flat: string;
        komisi_persentase: string;
        periode_mulai: string;
        periode_selesai: string;
        is_active: boolean;
        inventaris_ids: number[];
    }>({
        nama_paket: '',
        harga: '',
        kuota: '45',
        deskripsi: '',
        brosur_image: null,
        itinerary: '[]',
        komisi_flat: '0',
        komisi_persentase: '0',
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
        inventaris_ids: [],
    });

    useEffect(() => {
        if (pkg) {
            setData({
                nama_paket: pkg.nama_paket || '',
                harga: pkg.harga?.toString() || '0',
                kuota: pkg.kuota?.toString() || '45',
                deskripsi: pkg.deskripsi || '',
                brosur_image: null,
                itinerary: JSON.stringify(pkg.itinerary || []),
                komisi_flat: pkg.komisi_flat?.toString() || '0',
                komisi_persentase: pkg.komisi_persentase?.toString() || '0',
                periode_mulai: pkg.periode_mulai || '',
                periode_selesai: pkg.periode_selesai || '',
                is_active: pkg.is_active ?? true,
                inventaris_ids: pkg.inventaris?.map((i) => i.id) || [],
            });

            setCommissionType(pkg.komisi_persentase && pkg.komisi_persentase > 0 ? 'percentage' : 'flat');
            setItineraries(Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0
                ? pkg.itinerary
                : [{
                    day: 1,
                    title: 'Keberangkatan & Tiba di Jeddah',
                    description: 'Penerbangan langsung & check in hotel.',
                    location: 'Bandara',
                    rundowns: [{ time: '08:00 - 10:00', activity: 'Kumpul & Persiapan', notes: '' }],
                }]);
        }
    }, [pkg, isOpen]);

    const addItineraryDay = () => {
        const nextDay = itineraries.length + 1;
        setItineraries((prev) => [
            ...prev,
            {
                day: nextDay,
                title: `Aktivitas Ibadah Hari ke-${nextDay}`,
                description: '',
                location: '',
                rundowns: [{ time: '08:00 - 10:00', activity: '', notes: '' }],
            },
        ]);
    };

    const removeItineraryDay = (index: number) => {
        setItineraries((prev) => prev.filter((_, i) => i !== index).map((row, i) => ({ ...row, day: i + 1 })));
    };

    const updateItineraryField = (index: number, field: keyof ItineraryRow, val: any) => {
        setItineraries((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: val };
            return next;
        });
    };

    const addRundown = (dayIdx: number) => {
        setItineraries((prev) => {
            const next = [...prev];
            const currentRundowns = next[dayIdx].rundowns || [];
            next[dayIdx] = {
                ...next[dayIdx],
                rundowns: [...currentRundowns, { time: '08:00 - 10:00', activity: '', notes: '' }],
            };
            return next;
        });
    };

    const removeRundown = (dayIdx: number, rundownIdx: number) => {
        setItineraries((prev) => {
            const next = [...prev];
            const currentRundowns = next[dayIdx].rundowns || [];
            next[dayIdx] = {
                ...next[dayIdx],
                rundowns: currentRundowns.filter((_, rIdx) => rIdx !== rundownIdx),
            };
            return next;
        });
    };

    const updateRundownField = (
        dayIdx: number,
        rundownIdx: number,
        field: keyof ItineraryRundown,
        val: string
    ) => {
        setItineraries((prev) => {
            const next = [...prev];
            const currentRundowns = [...(next[dayIdx].rundowns || [])];
            currentRundowns[rundownIdx] = {
                ...currentRundowns[rundownIdx],
                [field]: val,
            };
            next[dayIdx] = {
                ...next[dayIdx],
                rundowns: currentRundowns,
            };
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pkg) return;

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('nama_paket', data.nama_paket);
        formData.append('harga', data.harga);
        formData.append('kuota', data.kuota || '45');
        formData.append('deskripsi', data.deskripsi);
        if (data.brosur_image) {
            formData.append('brosur_image', data.brosur_image);
        }
        formData.append('itinerary', JSON.stringify(itineraries));
        formData.append('komisi_flat', data.komisi_flat);
        formData.append('komisi_persentase', data.komisi_persentase);
        formData.append('periode_mulai', data.periode_mulai);
        formData.append('periode_selesai', data.periode_selesai);
        formData.append('is_active', data.is_active ? '1' : '0');

        data.inventaris_ids.forEach((id) => {
            formData.append('inventaris_ids[]', id.toString());
        });

        router.post(route('settings.master.update-package', pkg.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2 p-0 flex flex-col overflow-hidden">
                <SheetHeader className="p-6 pb-2 border-b border-border">
                    <SheetTitle>Edit Paket: {pkg?.nama_paket}</SheetTitle>
                    <SheetDescription>Perbarui rincian harga, kuota seat, itinerary jadwal harian &amp; multi-rundown, dan brosur paket.</SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 flex-1 overflow-y-auto">
                    <div>
                        <InputLabel htmlFor="edit_nama_paket" value="Nama Paket *" />
                        <TextInput
                            id="edit_nama_paket"
                            type="text"
                            value={data.nama_paket}
                            className="mt-1 block w-full text-xs"
                            onChange={(e) => setData('nama_paket', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="edit_harga" value="Harga Paket (Rp) *" />
                            <div className="mt-1">
                                <CurrencyInput
                                    id="edit_harga"
                                    value={data.harga}
                                    onChange={(val) => setData('harga', val)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="edit_kuota" value="Total Kuota Seat *" />
                            <TextInput
                                id="edit_kuota"
                                type="number"
                                min={1}
                                value={data.kuota}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('kuota', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Ringkasan Deskripsi Paket" />
                        <textarea
                            rows={2}
                            value={data.deskripsi}
                            onChange={(e) => setData('deskripsi', e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground"
                        />
                    </div>

                    {/* Brosur Upload */}
                    <div>
                        <InputLabel value="Ganti Foto / Desain Brosur (Opsional)" />
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => setData('brosur_image', e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary cursor-pointer"
                        />
                    </div>

                    {/* Itinerary Dynamic Repeater with Multi-Rundown */}
                    <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Jadwal Kegiatan Harian &amp; Multi-Rundown
                            </h4>
                            <button
                                type="button"
                                onClick={addItineraryDay}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Hari
                            </button>
                        </div>

                        <div className="space-y-4">
                            {itineraries.map((row, idx) => (
                                <div key={idx} className="p-3.5 bg-card border border-border rounded-xl flex flex-col gap-3 shadow-2xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                                                H{row.day}
                                            </span>
                                            <input
                                                type="text"
                                                value={row.title}
                                                onChange={(e) => updateItineraryField(idx, 'title', e.target.value)}
                                                className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-border bg-background flex-1"
                                                placeholder="Judul Hari"
                                            />
                                        </div>
                                        {itineraries.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItineraryDay(idx)}
                                                className="p-1.5 text-muted-foreground hover:text-rose-500 transition rounded-lg hover:bg-rose-500/10 cursor-pointer"
                                                title="Hapus Hari Ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={row.location || ''}
                                            onChange={(e) => updateItineraryField(idx, 'location', e.target.value)}
                                            className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background"
                                            placeholder="Lokasi (misal: Hotel Makkah, Masjidil Haram)"
                                        />
                                        <input
                                            type="text"
                                            value={row.description}
                                            onChange={(e) => updateItineraryField(idx, 'description', e.target.value)}
                                            className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background"
                                            placeholder="Catatan / Ringkasan kegiatan hari ini..."
                                        />
                                    </div>

                                    {/* Multi-Rundown Sub Repeater */}
                                    <div className="p-3 bg-muted/40 rounded-xl border border-border/70 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-primary" /> Rundown &amp; Jam Kegiatan (Hari ke-{row.day})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => addRundown(idx)}
                                                className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" /> Tambah Jam/Rundown
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {(!row.rundowns || row.rundowns.length === 0) ? (
                                                <p className="text-[10px] text-muted-foreground italic">
                                                    Belum ada sub-rundown jam. Klik "+ Tambah Jam/Rundown" di atas.
                                                </p>
                                            ) : (
                                                row.rundowns.map((rd, rdIdx) => (
                                                    <div key={rdIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-background p-2 rounded-lg border border-border">
                                                        <TimeRangePicker
                                                            value={rd.time}
                                                            onChange={(val) => updateRundownField(idx, rdIdx, 'time', val)}
                                                            className="w-full sm:w-40 shrink-0"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={rd.activity}
                                                            onChange={(e) => updateRundownField(idx, rdIdx, 'activity', e.target.value)}
                                                            placeholder="Nama kegiatan (contoh: Manasik / Ziarah)"
                                                            className="flex-1 text-[11px] py-1 px-2 rounded-md border border-border bg-card font-medium"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={rd.notes || ''}
                                                            onChange={(e) => updateRundownField(idx, rdIdx, 'notes', e.target.value)}
                                                            placeholder="Catatan (opsional)"
                                                            className="w-full sm:w-36 text-[10px] py-1 px-2 rounded-md border border-border bg-card"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRundown(idx, rdIdx)}
                                                            className="p-1 text-muted-foreground hover:text-rose-500 self-end sm:self-auto cursor-pointer"
                                                            title="Hapus Agenda"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Commission Settings */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                        <InputLabel value="Skema Komisi Agen" />
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setCommissionType('flat');
                                    setData('komisi_persentase', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    commissionType === 'flat'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Nominal Standar (Rp)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCommissionType('percentage');
                                    setData('komisi_flat', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    commissionType === 'percentage'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Percent className="w-3.5 h-3.5" />
                                <span>Persentase (%)</span>
                            </button>
                        </div>

                        {commissionType === 'flat' ? (
                            <div className="mt-2">
                                <InputLabel htmlFor="edit_komisi_flat" value="Nominal Komisi Flat" />
                                <div className="mt-1">
                                    <CurrencyInput
                                        id="edit_komisi_flat"
                                        value={data.komisi_flat}
                                        onChange={(val) => setData('komisi_flat', val)}
                                        placeholder="1.500.000"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-col gap-2">
                                <InputLabel htmlFor="edit_komisi_persentase" value="Persentase Komisi (%)" />
                                <div className="relative flex items-center">
                                    <TextInput
                                        id="edit_komisi_persentase"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.komisi_persentase}
                                        className="block w-full pr-8 text-xs"
                                        onChange={(e) => setData('komisi_persentase', e.target.value)}
                                        placeholder="5"
                                    />
                                    <span className="absolute right-3 text-sm font-bold text-muted-foreground">%</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Hasil Estimasi Komisi:</span>
                                    <span className="font-extrabold text-primary">
                                        {toRupiah((parseFloat(data.harga.replace(/[^0-9]/g, '')) || 0) * (parseFloat(data.komisi_persentase) || 0) / 100)}{' '}
                                        <span className="font-normal text-[10px] text-muted-foreground">/ jamaah</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <SheetFooter className="p-4 border-t border-border flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-xs font-bold"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Perbarui Paket'}
                        </PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
