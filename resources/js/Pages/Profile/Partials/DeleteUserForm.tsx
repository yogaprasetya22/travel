import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { AlertTriangle, Lock, Trash2 } from 'lucide-react';

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
        <section className={`space-y-4 ${className}`}>
            <header className="pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h2 className="text-base font-bold text-destructive">
                        Zona Bahaya: Hapus Akun
                    </h2>
                </div>

                <p className="mt-1 text-xs text-muted-foreground ml-7">
                    Setelah akun Anda dihapus, semua riwayat akses dan data personal Anda akan dihapus permanen dari sistem.
                </p>
            </header>

            <div>
                <DangerButton onClick={confirmUserDeletion}>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    <span>Hapus Akun Saya</span>
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <div className="flex items-center gap-2.5 text-destructive font-bold text-lg">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Konfirmasi Penghapusan Akun</span>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Apakah Anda yakin ingin menghapus akun ini secara permanen? Masukkan kata sandi Anda saat ini untuk mengonfirmasi tindakan ini.
                    </p>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi Akun"
                        />

                        <div className="relative mt-1">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="block w-full pl-10"
                                isFocused
                                placeholder="Masukkan password untuk konfirmasi"
                            />
                        </div>

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            {processing ? 'Menghapus...' : 'Ya, Hapus Akun Permanen'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
