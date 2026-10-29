import React from 'react';
import themeData from '@/lib/theme-colors.json';
import ApplicationLogo from '@/Components/ApplicationLogo';

import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/Types';
import {
    Sparkles,
    User,
    Phone,
    Mail,
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    Shield,
    Plane,
    Lock,
    Building2,
    Calendar,
    HelpCircle,
    BadgeCheck,
    UploadCloud,
    FileText,
    MapPin,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

interface PaketItem {
    id: number;
    nama_paket: string;
    harga: number;
    kuota?: number;
    available_seats?: number;
}

interface BankItem {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
}

interface TenantItem {
    id: number;
    nama_travel: string;
    domain_atau_subdomain?: string;
    theme_name?: string | null;
}

interface ReferralAgent {
    id: number;
    name: string;
    email: string;
    jabatan: string;
}

interface Props extends PageProps {
    tenant?: TenantItem | null;
    packages: PaketItem[];
    banks: BankItem[];
    selectedPackageId?: number | null;
    referralAgent?: ReferralAgent | null;
}

export default function Register({
    tenant,
    packages = [],
    banks = [],
    selectedPackageId,
    referralAgent,
}: Props) {
    const travelName = tenant?.nama_travel || 'HajjFlow Umroh & Haji';

    const { data, setData, post, processing, errors } = useForm<{
        nama_lengkap: string;
        jenis_kelamin: string;
        tempat_lahir: string;
        tanggal_lahir: string;
        nik: string;
        no_hp: string;
        email: string;
        alamat_ktp: string;
        alamat_domisili: string;
        golongan_darah: string;
        status_pernikahan: string;
        kontak_darurat_nama: string;
        kontak_darurat_hp: string;
        nomor_paspor: string;
        paket_id: string;
        agen_id: string;
        rekening_tenant_id: string;
        nominal_dp: string;
        catatan: string;
        file_ktp: File | null;
        file_kk: File | null;
        file_foto: File | null;
        file_paspor: File | null;
        bukti_transfer: File | null;
    }>({
        nama_lengkap: '',
        jenis_kelamin: 'L',
        tempat_lahir: '',
        tanggal_lahir: '',
        nik: '',
        no_hp: '',
        email: '',
        alamat_ktp: '',
        alamat_domisili: '',
        golongan_darah: '',
        status_pernikahan: 'Menikah',
        kontak_darurat_nama: '',
        kontak_darurat_hp: '',
        nomor_paspor: '',
        paket_id: selectedPackageId ? selectedPackageId.toString() : (packages[0]?.id ? packages[0].id.toString() : ''),
        agen_id: referralAgent?.id ? referralAgent.id.toString() : '',
        rekening_tenant_id: banks[0]?.id ? banks[0].id.toString() : '',
        nominal_dp: '',
        catatan: '',
        file_ktp: null,
        file_kk: null,
        file_foto: null,
        file_paspor: null,
        bukti_transfer: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('public.register.submit'), {
            forceFormData: true,
        });
    };

    const inputClasses =
        'w-full rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs h-10 px-3.5 py-2 shadow-2xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-medium';

    return (
        <div 
            className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground py-10 px-4 sm:px-6 lg:px-8 font-sans"
            style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'luxury']?.variables || themeData.themes['luxury'].variables) as React.CSSProperties}
        >
            <Head title={`Formulir Pendaftaran Calon Jamaah - ${travelName}`} />

            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Back Link */}
                <div>
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda Utama</span>
                    </Link>
                </div>

                {/* Form Header Card */}
                <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-3 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-foreground">{travelName}</h1>
                                <p className="text-xs text-muted-foreground">Formulir Pendaftaran &amp; Booking Kursi Ibadah Resmi</p>
                            </div>
                        </div>
                        {referralAgent && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs px-3 py-1.5 rounded-xl">
                                Agen Pendamping: {referralAgent.name}
                            </Badge>
                        )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2">
                        Silakan lengkapi data diri Anda di bawah ini dengan benar. Data KTP &amp; KK wajib dilampirkan untuk verifikasi awal dan reservasi kuota maskapai penerbangan.
                    </p>
                </div>

                {/* Main Registration Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    {/* SECTION 1: PILIHAN PAKET */}
                    <Card className="p-6 sm:p-7 rounded-3xl border border-border shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            <Plane className="w-4 h-4" />
                            <span>1. Pilihan Program Paket Keberangkatan</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {packages.map((pkg) => {
                                const isSelected = data.paket_id === pkg.id.toString();
                                const available = pkg.available_seats !== undefined ? pkg.available_seats : 45;

                                return (
                                    <div
                                        key={pkg.id}
                                        onClick={() => setData('paket_id', pkg.id.toString())}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                                            isSelected
                                                ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                                                : 'bg-card border-border hover:border-primary/40'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-bold text-sm text-foreground">{pkg.nama_paket}</div>
                                            <div className="text-xs font-black text-primary mt-0.5">
                                                Rp {pkg.harga.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        <Badge className={`text-[10px] font-bold ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            Sisa {available} Seat
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                        <InputError message={errors.paket_id} />
                    </Card>

                    {/* SECTION 2: BIODATA & IDENTITAS LENGKAP */}
                    <Card className="p-6 sm:p-7 rounded-3xl border border-border shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            <User className="w-4 h-4" />
                            <span>2. Biodata &amp; Data Identitas Calon Jamaah</span>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-foreground">Nama Lengkap Sesuai KTP / Paspor *</Label>
                            <input
                                type="text"
                                value={data.nama_lengkap}
                                onChange={(e) => setData('nama_lengkap', e.target.value)}
                                className={inputClasses}
                                placeholder="Contoh: Muhammad Yoga Pratama"
                                required
                            />
                            <InputError message={errors.nama_lengkap} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-foreground">Jenis Kelamin *</Label>
                                <select
                                    value={data.jenis_kelamin}
                                    onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-foreground">Tempat Lahir</Label>
                                <input
                                    type="text"
                                    value={data.tempat_lahir}
                                    onChange={(e) => setData('tempat_lahir', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Kota Kelahiran"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-foreground">Tanggal Lahir</Label>
                                <input
                                    type="date"
                                    value={data.tanggal_lahir}
                                    onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-foreground">Nomor Induk Kependudukan (NIK KTP)</Label>
                                <input
                                    type="text"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    className={inputClasses}
                                    placeholder="16 digit nomor KTP"
                                    maxLength={16}
                                />
                                <InputError message={errors.nik} className="mt-1" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-foreground">Nomor Paspor (Jika Sudah Ada)</Label>
                                <input
                                    type="text"
                                    value={data.nomor_paspor}
                                    onChange={(e) => setData('nomor_paspor', e.target.value.toUpperCase())}
                                    className={inputClasses}
                                    placeholder="Contoh: A 1234567"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-foreground">Nomor WhatsApp / HP Aktif *</Label>
                                <input
                                    type="tel"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    className={inputClasses}
                                    placeholder="0812xxxxxxxx"
                                    required
                                />
                                <InputError message={errors.no_hp} className="mt-1" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-foreground">Alamat Email (Untuk Invoice &amp; Berkas)</Label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputClasses}
                                    placeholder="nama@email.com"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-foreground">Alamat Lengkap Sesuai KTP</Label>
                            <textarea
                                rows={2}
                                value={data.alamat_ktp}
                                onChange={(e) => setData('alamat_ktp', e.target.value)}
                                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-foreground">Nama Kontak Darurat (Keluarga)</Label>
                                <input
                                    type="text"
                                    value={data.kontak_darurat_nama}
                                    onChange={(e) => setData('kontak_darurat_nama', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Suami / Istri / Anak / Orang Tua"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-foreground">No. HP Kontak Darurat</Label>
                                <input
                                    type="tel"
                                    value={data.kontak_darurat_hp}
                                    onChange={(e) => setData('kontak_darurat_hp', e.target.value)}
                                    className={inputClasses}
                                    placeholder="0813xxxxxxxx"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* SECTION 3: UPLOAD DOKUMEN (KTP & KK MANDATORY) */}
                    <Card className="p-6 sm:p-7 rounded-3xl border border-border shadow-xs flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                <UploadCloud className="w-4 h-4" />
                                <span>3. Lampiran Dokumen Persyaratan Pendaftaran</span>
                            </div>
                            <span className="text-[11px] text-rose-500 font-semibold">* KTP &amp; KK Wajib</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* KTP Upload (Mandatory) */}
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2">
                                <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                                    <span>Upload Foto / Scan KTP *</span>
                                    <Badge variant="destructive" className="text-[10px]">Wajib</Badge>
                                </Label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setData('file_ktp', e.target.files?.[0] || null)}
                                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground cursor-pointer"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground">Format JPG, PNG, atau PDF (Maks 5MB)</span>
                                <InputError message={errors.file_ktp} />
                            </div>

                            {/* KK Upload (Mandatory) */}
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2">
                                <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                                    <span>Upload Kartu Keluarga (KK) *</span>
                                    <Badge variant="destructive" className="text-[10px]">Wajib</Badge>
                                </Label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setData('file_kk', e.target.files?.[0] || null)}
                                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground cursor-pointer"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground">Format JPG, PNG, atau PDF (Maks 5MB)</span>
                                <InputError message={errors.file_kk} />
                            </div>

                            {/* Foto 4x6 Upload (Optional) */}
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2">
                                <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                                    <span>Pas Foto 4x6 (Background Putih)</span>
                                    <Badge variant="secondary" className="text-[10px]">Opsional</Badge>
                                </Label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => setData('file_foto', e.target.files?.[0] || null)}
                                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary cursor-pointer"
                                />
                                <span className="text-[10px] text-muted-foreground">Bisa disusulkan kemudian</span>
                                <InputError message={errors.file_foto} />
                            </div>

                            {/* Paspor Upload (Optional) */}
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2">
                                <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                                    <span>Scan Halaman Depan Paspor</span>
                                    <Badge variant="secondary" className="text-[10px]">Opsional</Badge>
                                </Label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setData('file_paspor', e.target.files?.[0] || null)}
                                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary cursor-pointer"
                                />
                                <span className="text-[10px] text-muted-foreground">Bisa disusulkan sebelum pengurusan visa</span>
                                <InputError message={errors.file_paspor} />
                            </div>
                        </div>
                    </Card>

                    {/* SECTION 4: INFORMASI PEMBAYARAN DP (OPSIONAL) */}
                    <Card className="p-6 sm:p-7 rounded-3xl border border-border shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            <CreditCard className="w-4 h-4" />
                            <span>4. Informasi Pembayaran Uang Muka (DP / Booking Seat)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-foreground">Nominal DP / Booking (Rp)</Label>
                                <input
                                    type="number"
                                    value={data.nominal_dp}
                                    onChange={(e) => setData('nominal_dp', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Contoh: 5000000"
                                    min={0}
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold text-foreground">Rekening Resmi Tujuan</Label>
                                <select
                                    value={data.rekening_tenant_id}
                                    onChange={(e) => setData('rekening_tenant_id', e.target.value)}
                                    className={inputClasses}
                                >
                                    {banks.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bank} - {b.nomor_rekening} (a.n {b.atas_nama})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Upload Bukti Transfer */}
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2">
                            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <UploadCloud className="w-3.5 h-3.5 text-primary" />
                                    <span>Upload Bukti Transfer / Pembayaran DP</span>
                                </span>
                                <Badge variant="secondary" className="text-[10px]">Opsional</Badge>
                            </Label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setData('bukti_transfer', e.target.files?.[0] || null)}
                                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary cursor-pointer"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Format JPG, PNG, atau PDF (Maks 5MB)</span>
                                {data.bukti_transfer && (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium truncate max-w-[200px]">
                                        <UploadCloud className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{data.bukti_transfer.name}</span>
                                    </span>
                                )}
                            </div>
                            <InputError message={errors.bukti_transfer} />
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-foreground">Catatan Tambahan / Permintaan Khusus</Label>
                            <input
                                type="text"
                                value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                                className={inputClasses}
                                placeholder="Contoh: Permintaan sekamar berdua dengan keluarga, vegetarian..."
                            />
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="w-full py-6 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-lg hover:shadow-primary/20 transition-all gap-2"
                        >
                            <span>{processing ? 'Memproses Pendaftaran & Upload Dokumen...' : 'Kirim Formulir Pendaftaran Sekarang'}</span>
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                        <p className="text-center text-[11px] text-muted-foreground">
                            Dengan mengirimkan formulir ini, Anda menyetujui bahwa data yang diisi adalah benar untuk keperluan administrasi ibadah Umroh/Haji.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
