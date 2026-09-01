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
import { AlertTriangle, Lock, Trash2, Loader2 } from 'lucide-react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

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
        <Card className={`border-destructive/30 bg-destructive/5 backdrop-blur-md shadow-xs ${className}`}>
            <CardHeader className="pb-4 border-b border-destructive/20">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <CardTitle className="text-base font-bold text-destructive">
                        Zona Bahaya: Hapus Akun
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground ml-7">
                    Setelah akun Anda dihapus, semua riwayat akses dan data personal Anda akan dihapus permanen dari sistem.
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                <Button
                    variant="destructive"
                    onClick={confirmUserDeletion}
                    className="gap-2 rounded-xl text-xs font-bold shadow-xs"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Akun Saya</span>
                </Button>

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
                                        className="pl-10 text-xs rounded-xl"
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
                                    className="rounded-xl text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    className="gap-2 rounded-xl text-xs font-bold"
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
