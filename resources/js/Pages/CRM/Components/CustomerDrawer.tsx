import React, { useState, useEffect } from 'react';
import { Customer, BankAccount, JamaahDocItem, DocumentPermissionItem } from './types';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import {
    UserCheck,
    CreditCard,
    FileText,
    History,
    Edit3,
} from 'lucide-react';

import CustomerViewTab from './CustomerViewTab';
import CustomerDocumentsTab from './CustomerDocumentsTab';
import CustomerFinancialTab from './CustomerFinancialTab';
import CustomerHistoryTab from './CustomerHistoryTab';
import DocumentPreviewModal from './DocumentPreviewModal';

// Re-export all types so sibling components don't break
export * from './types';

interface CustomerDrawerProps {
    customer: Customer | null;
    isOpen?: boolean;
    onClose: () => void;
    banks?: BankAccount[];
    initialTab?: string;
    onEdit?: (customer: Customer) => void;
    documentPermissions?: DocumentPermissionItem[];
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
    customer,
    isOpen,
    onClose,
    banks = [],
    initialTab = 'view',
    onEdit,
    documentPermissions = [],
}) => {

    // If isOpen is explicitly passed use it, otherwise show if customer is truthy
    const isSheetOpen = isOpen !== undefined ? isOpen : !!customer;

    const [activeTab, setActiveTab] = useState<string>(initialTab || 'view');
    const [viewingDoc, setViewingDoc] = useState<JamaahDocItem | null>(null);
    const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

    useEffect(() => {
        if (isSheetOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isSheetOpen, initialTab]);

    if (!customer) return null;

    return (
        <>
            <Sheet open={isSheetOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-3xl lg:max-w-5xl p-0 overflow-hidden flex flex-col bg-background border-l border-border/80 z-50"
                >
                    {/* Drawer Header */}
                    <div className="p-5 border-b border-border/60 bg-muted/20">
                        <SheetHeader className="text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <SheetTitle className="text-lg font-bold text-foreground">
                                            {customer.nama_lengkap}
                                        </SheetTitle>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                            {(customer as any).crm_stage?.nama_tahap || (customer as any).crmStage?.nama_tahap || (customer.crm_stage_id ? `Tahap #${customer.crm_stage_id}` : 'Calon Jamaah')}
                                        </span>
                                    </div>
                                    <SheetDescription className="text-xs text-muted-foreground mt-1">
                                        ID: #{customer.id} &bull; No. HP: {customer.no_hp || '-'} &bull; Paspor: {customer.nomor_paspor || '-'}
                                    </SheetDescription>
                                </div>
                                {onEdit && (
                                    <Button
                                        size="sm"
                                        onClick={() => onEdit(customer)}
                                        className="gap-1.5 h-8 text-xs font-semibold mr-8"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit Data Jamaah
                                    </Button>
                                )}
                            </div>
                        </SheetHeader>
                    </div>

                    {/* Navigation Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <div className="px-5 border-b border-border/60 bg-card ">
                            <TabsList className="bg-transparent border-0 h-11 p-0 gap-4">
                                <TabsTrigger
                                    value="view"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Biodata
                                </TabsTrigger>
                                <TabsTrigger
                                    value="documents"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    Dokumen ({customer.documents?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="financial"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Keuangan
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <History className="w-3.5 h-3.5" />
                                    Jejak Aktivitas
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab Contents */}
                        <div className="flex-1 overflow-y-auto p-5 low-scrollbar">
                            <TabsContent value="view" className="m-0 focus-visible:outline-none">
                                <CustomerViewTab
                                    customer={customer}
                                    onEdit={onEdit}
                                    onPreviewDoc={(doc) => setViewingDoc(doc)}
                                    onSwitchToDocuments={() => setActiveTab('documents')}
                                    documentPermissions={documentPermissions}
                                />
                            </TabsContent>

                            <TabsContent value="documents" className="m-0 focus-visible:outline-none">
                                <CustomerDocumentsTab
                                    customer={customer}
                                    onPreviewDoc={(doc) => setViewingDoc(doc)}
                                    documentPermissions={documentPermissions}
                                />

                            </TabsContent>

                            <TabsContent value="financial" className="m-0 focus-visible:outline-none">
                                <CustomerFinancialTab
                                    customer={customer}
                                    banks={banks}
                                    onViewSlip={(url) => setSelectedSlip(url)}
                                />
                            </TabsContent>

                            <TabsContent value="history" className="m-0 focus-visible:outline-none">
                                <CustomerHistoryTab customer={customer} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </SheetContent>
            </Sheet>

            {/* Modals for Document & Slip Preview */}
            <DocumentPreviewModal
                viewingDoc={viewingDoc}
                onCloseViewingDoc={() => setViewingDoc(null)}
                selectedSlip={selectedSlip}
                onCloseSelectedSlip={() => setSelectedSlip(null)}
            />
        </>
    );
};

export default CustomerDrawer;
