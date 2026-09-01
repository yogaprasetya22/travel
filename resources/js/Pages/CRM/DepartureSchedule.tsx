import React, { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import {
    Calendar,
    Plane,
    Users,
    Search,
    Clock,
    LayoutGrid,
    Table as TableIcon,
    CheckCircle2,
    AlertCircle,
    FileCheck,
    UserCheck,
} from 'lucide-react';

import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';

interface JamaahSchedule {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    nomor_paspor: string | null;
    tanggal_keberangkatan: string | null;
    paket: {
        id: number;
        nama_paket: string;
        harga: number;
    };
    agen: {
        id: number;
        name: string;
    } | null;
}

interface Metrics {
    total_closing: number;
    total_scheduled: number;
    total_unscheduled: number;
    total_passport_ready: number;
}

interface DepartureScheduleProps extends PageProps {
    schedules: Record<string, JamaahSchedule[]>;
    paginatedJamaah: PaginatedData<JamaahSchedule>;
    metrics: Metrics;
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
}

export default function DepartureSchedule({
    schedules = {},
    paginatedJamaah,
    metrics,
    filters,
}: DepartureScheduleProps) {
    const isMounted = useMounted();
    const [viewMode, setViewMode] = useState<'group' | 'table'>('group');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'ALL');

    const debouncedSearchQuery = useDebounce(searchQuery, 350);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            route('crm.schedules.index'),
            {
                search: debouncedSearchQuery,
                status: statusFilter,
                per_page: paginatedJamaah.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearchQuery, statusFilter]);

    if (!isMounted) {
        return null;
    }

    const scheduleKeys = Object.keys(schedules);
    const jamaahTableData = paginatedJamaah.data || [];

    return (
        <PageLayout
            title="Jadwal Keberangkatan & Manasik"
            breadcrumbParent="CRM & Jamaah"
            breadcrumbPage="Jadwal Keberangkatan"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Manifest &amp; Jadwal Penerbangan Jamaah
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Pengelompokan kloter jamaah resmi berdasarkan tanggal keberangkatan umroh, manasik, dan verifikasi paspor.
                    </p>
                </div>

                {/* View Switcher Button */}
                <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/70 shrink-0">
                    <button
                        type="button"
                        onClick={() => setViewMode('group')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            viewMode === 'group'
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Kloter Grup</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            viewMode === 'table'
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span>Tabel Manifest</span>
                    </button>
                </div>
            </div>

            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Jamaah Closing</div>
                        <div className="text-2xl font-extrabold text-foreground mt-0.5">
                            {metrics?.total_closing || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Plane className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Sudah Ada Jadwal Terbang</div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {metrics?.total_scheduled || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Antrean Belum Dijadwalkan</div>
                        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                            {metrics?.total_unscheduled || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Paspor Terverifikasi</div>
                        <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                            {metrics?.total_passport_ready || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/60 p-3.5 rounded-2xl border border-border/80">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama, HP, paspor, paket, agen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium shrink-0">Status Jadwal:</span>
                        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/70">
                            {[
                                { id: 'ALL', label: 'Semua' },
                                { id: 'SCHEDULED', label: 'Sudah Terjadwal' },
                                { id: 'UNSCHEDULED', label: 'Belum Terjadwal' },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setStatusFilter(st.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        statusFilter === st.id
                                            ? 'bg-card text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {viewMode === 'table' && <PerPageSelector value={paginatedJamaah.per_page} />}
                </div>
            </div>

            {/* MODE 1: KLOTER GROUPS */}
            {viewMode === 'group' && (
                <div className="flex flex-col gap-6">
                    {scheduleKeys.map((dateKey) => {
                        const group = schedules[dateKey];
                        const isUnassigned = dateKey === 'Belum Ditentukan';

                        return (
                            <div
                                key={dateKey}
                                className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-center pb-3 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${isUnassigned ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                                            {isUnassigned ? <Clock className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground">
                                                {isUnassigned ? 'Antrean Belum Plot Tanggal Terbang' : `Kloter Penerbangan: ${new Date(dateKey).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">Total: {group.length} Jamaah Terdaftar dalam Kloter Ini</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted border border-border text-foreground">
                                        {group.length} Orang
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.map((jm) => (
                                        <div key={jm.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-sm text-foreground">{jm.nama_lengkap}</div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                                    jm.nomor_paspor
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {jm.nomor_paspor ? `Paspor: ${jm.nomor_paspor}` : 'Paspor Pending'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-primary font-medium">{jm.paket?.nama_paket}</div>
                                            <div className="text-xs text-muted-foreground flex justify-between items-center pt-2 border-t border-border/40">
                                                <span>HP: {jm.no_hp}</span>
                                                <span>{jm.agen ? `Agen: ${jm.agen.name}` : 'Direct'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {scheduleKeys.length === 0 && (
                        <div className="py-16 text-center text-sm text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border">
                            Tidak ada kloter jadwal yang cocok dengan kriteria pencarian.
                        </div>
                    )}
                </div>
            )}

            {/* MODE 2: TABLE MANIFEST */}
            {viewMode === 'table' && (
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground uppercase tracking-wider">
                                    <th className="px-6 py-4">Nama Jamaah &amp; Kontak</th>
                                    <th className="px-6 py-4">Paket Umroh</th>
                                    <th className="px-6 py-4">Status Dokumen Paspor</th>
                                    <th className="px-6 py-4">Plot Tanggal Terbang</th>
                                    <th className="px-6 py-4">PIC Agen</th>
                                    <th className="px-6 py-4 text-center">Aksi Pelunasan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs">
                                {jamaahTableData.map((jm) => (
                                    <tr key={jm.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-foreground">{jm.nama_lengkap}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">HP: {jm.no_hp}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{jm.paket?.nama_paket}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                jm.nomor_paspor
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                            }`}>
                                                {jm.nomor_paspor ? `Paspor: ${jm.nomor_paspor}` : 'Belum Ada Paspor'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {jm.tanggal_keberangkatan ? (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                    <Plane className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    <span>
                                                        {new Date(jm.tanggal_keberangkatan).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-amber-600 dark:text-amber-400 italic font-semibold">
                                                    Belum Dijadwalkan
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {jm.agen ? jm.agen.name : 'Direct Kantor'}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <a
                                                href={`/crm/customers?customer_id=${jm.id}&tab=financial`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold text-xs transition cursor-pointer"
                                                title="Buka Rincian Keuangan & Pelunasan"
                                            >
                                                <span>Rincian &amp; Bayar</span>
                                            </a>
                                        </td>
                                    </tr>
                                ))}

                                {jamaahTableData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground italic">
                                            Tidak ada data manifest yang sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-border/80 px-4 bg-muted/20">
                        <DataTablePagination
                            links={paginatedJamaah.links}
                            from={paginatedJamaah.from}
                            to={paginatedJamaah.to}
                            total={paginatedJamaah.total}
                            currentPage={paginatedJamaah.current_page}
                            lastPage={paginatedJamaah.last_page}
                        />
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
