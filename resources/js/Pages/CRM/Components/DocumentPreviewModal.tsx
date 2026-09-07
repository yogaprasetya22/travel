import React from 'react';
import { JamaahDocItem } from './types';
import { ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

interface DocumentPreviewModalProps {
    viewingDoc: JamaahDocItem | null;
    onCloseViewingDoc: () => void;
    selectedSlip: string | null;
    onCloseSelectedSlip: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    viewingDoc,
    onCloseViewingDoc,
    selectedSlip,
    onCloseSelectedSlip,
}) => {
    return (
        <>
            {/* Modal Preview Berkas Dokumen (PDF / Image) */}
            <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && onCloseViewingDoc()}>
                <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Preview: {viewingDoc?.title || viewingDoc?.type}</span>
                            </DialogTitle>
                            <p className="text-xs text-slate-500">{viewingDoc?.file_name}</p>
                        </div>
                        {viewingDoc?.url && (
                            <a 
                                href={viewingDoc.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 mr-8"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Buka Tab Baru
                            </a>
                        )}
                    </DialogHeader>
                    <div className="flex-1 w-full h-full bg-slate-950/5 dark:bg-slate-950 flex items-center justify-center overflow-hidden p-2">
                        {viewingDoc?.is_pdf ? (
                            <iframe 
                                src={viewingDoc.url || ''} 
                                className="w-full h-full rounded border-0" 
                                title={viewingDoc.title || viewingDoc.file_name}
                            />
                        ) : viewingDoc?.url ? (
                            <div className="w-full h-full overflow-auto flex items-center justify-center">
                                <img 
                                    src={viewingDoc.url} 
                                    alt={viewingDoc.title || viewingDoc.file_name} 
                                    className="max-w-full max-h-full object-contain rounded shadow-md"
                                />
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Bukti Slip Transfer */}
            <Dialog open={!!selectedSlip} onOpenChange={(open) => !open && onCloseSelectedSlip()}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Bukti Transfer / Pembayaran</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 flex justify-center bg-slate-100 dark:bg-slate-950 p-3 rounded-lg max-h-[70vh] overflow-auto">
                        {selectedSlip?.endsWith('.pdf') ? (
                            <iframe src={selectedSlip} className="w-full h-[500px] rounded" title="Bukti Transfer" />
                        ) : selectedSlip ? (
                            <img 
                                src={selectedSlip} 
                                alt="Bukti Transfer" 
                                className="max-h-[65vh] object-contain rounded shadow-sm" 
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DocumentPreviewModal;
