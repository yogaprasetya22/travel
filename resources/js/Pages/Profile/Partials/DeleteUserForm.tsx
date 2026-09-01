import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';
import { AlertTriangle, Lock, Trash2, Loader2, ShieldAlert } from 'lucide-react';

interface Props {
    className?: string;
    protection?: {
        isSoleOwner: boolean;
        isSoleSuperAdmin: boolean;
    };
}

export default function DeleteUserForm({
    className = '',
    protection,
}: Props) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const isBlocked = protection?.isSoleOwner || protection?.isSoleSuperAdmin;

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <Card className={`border-destructive/30 bg-destructive/5 backdrop-blur-md rounded-2xl p-6 shadow-xs ${className}`}>
            <CardHeader className="p-0 pb-4 border-b border-destructive/20">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-destructive">
                            Zona Bahaya: Hapus Akun
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Setelah akun Anda dihapus, semua riwayat akses dan data personal Anda akan dihapus permanen dari sistem.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 pt-6 flex flex-col gap-4">
                {protection?.isSoleOwner && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-amber-700 dark:text-amber-300">
                                Akun Terproteksi: Pemilik Tunggal Travel
                            </h4>
                            <p className="text-muted-foreground mt-0.5 leading-relaxed">
                                Anda adalah satu-satunya akun berlevel <strong>Owner</strong> pada travel ini. Akun tidak dapat dihapus mandiri demi mencegah hilangnya akses administratif travel. Harap tunjuk akun Owner pengganti melalui menu Struktur Tim &amp; Jabatan terlebih dahulu.
                            </p>
                        </div>
                    </div>
                )}

                {protection?.isSoleSuperAdmin && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-xs flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-destructive">
                                Akun Terproteksi: Super Admin Master
                            </h4>
                            <p className="text-muted-foreground mt-0.5 leading-relaxed">
                                Akun ini adalah Super Admin Master utama platform dan tidak dapat dihapus mandiri.
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <Button
                        variant="destructive"
                        onClick={confirmUserDeletion}
                        disabled={isBlocked}
                        className="gap-2 rounded-xl text-xs font-bold shadow-xs px-5 h-9"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus Akun Saya</span>
                    </Button>
                </div>

                <Dialog open={confirmingUserDeletion} onOpenChange={(open) => { if (!open) closeModal(); else setConfirmingUserDeletion(true); }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-base">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Konfirmasi Penghapusan Akun</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
                                Apakah Anda yakin ingin menghapus akun ini secara permanen? Masukkan kata sandi Anda saat ini untuk mengonfirmasi tindakan ini.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={deleteUser} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="delete-confirm-password" className="text-xs font-semibold">
                                    Kata Sandi Akun
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="delete-confirm-password"
                                        type="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="pl-10 text-xs rounded-xl h-10 bg-background"
                                        placeholder="Masukkan password untuk konfirmasi"
                                        autoFocus
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive font-medium">{errors.password}</p>
                                )}
                            </div>

                            <DialogFooter className="mt-4 flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                    className="rounded-xl text-xs h-9"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    className="gap-2 rounded-xl text-xs font-bold h-9"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menghapus...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Ya, Hapus Akun Permanen</span>
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
