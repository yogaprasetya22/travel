import React, { useState, useEffect } from 'react';
import PageLayout from '@/Components/Layouts/PageLayout';
import {
    GitPullRequest,
    Package,
    Landmark,
    Share2,
} from 'lucide-react';
import {
    MasterDataProps,
    PackageItem,
} from './MasterDataPartials/types';
import { StagesTab } from './MasterDataPartials/StagesTab';
import { StageModal } from './MasterDataPartials/StageModal';
import { PackagesTab } from './MasterDataPartials/PackagesTab';
import { AddPackageModal, EditPackageModal } from './MasterDataPartials/PackageModals';
import { BanksTab } from './MasterDataPartials/BanksTab';
import { BankModal } from './MasterDataPartials/BankModal';
import { SourcesTab } from './MasterDataPartials/SourcesTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';

export default function MasterData({
    stages = [],
    packages = [],
    banks = [],
    inventoryItems = [],
}: MasterDataProps) {
    const [currentTab, setCurrentTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const search = window.location.search;
            if (path.includes('banks')) return 'banks';
            if (path.includes('packages')) return 'packages';
            if (path.includes('stages')) return 'stages';
            if (path.includes('sources') || search.includes('tab=sources')) return 'sources';
        }
        return 'stages';
    });

    useEffect(() => {
        const path = window.location.pathname;
        const search = window.location.search;
        if (path.includes('banks')) setCurrentTab('banks');
        else if (path.includes('packages')) setCurrentTab('packages');
        else if (path.includes('stages')) setCurrentTab('stages');
        else if (path.includes('sources') || search.includes('tab=sources')) setCurrentTab('sources');
    }, []);

    const handleTabChange = (val: string | number | null) => {
        if (!val || typeof val !== 'string') return;
        setCurrentTab(val);
        const tabRoutes: Record<string, string> = {
            stages: '/settings/stages',
            packages: '/settings/packages',
            banks: '/settings/banks',
            sources: '/settings/master?tab=sources',
        };
        if (tabRoutes[val]) {
            window.history.replaceState(null, '', tabRoutes[val]);
        }
    };

    const tabTitles: Record<string, string> = {
        stages: 'Tahapan CRM (Pipeline)',
        packages: 'Paket Umroh & Haji',
        banks: 'Rekening Bank',
        sources: 'Sumber Prospek',
    };

    // Drawers states
    const [isAddStageOpen, setIsAddStageOpen] = useState(false);
    const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
    const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
    const [isAddBankOpen, setIsAddBankOpen] = useState(false);

    const handleOpenEditPackage = (pkg: PackageItem) => {
        setEditingPackage(pkg);
        setIsEditPackageOpen(true);
    };

    return (
        <PageLayout
            title={`Data Master - ${tabTitles[currentTab] || 'Travel'}`}
            breadcrumbParent="Pengaturan Travel"
            breadcrumbPage={tabTitles[currentTab] || 'Data Master'}
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Manajemen Data Master Operasional
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Kelola data referensi tahapan pipeline CRM, paket umroh &amp; haji, rekening bank resmi, dan klasifikasi prospek.
                    </p>
                </div>
            </div>

            {/* Master Data Shadcn Tabs */}
            <Tabs
                value={currentTab}
                onValueChange={handleTabChange}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full"
            >
                {/* Navigation Categories Sidebar (Horizontal Segmented Pills on Mobile, Vertical List on Desktop) */}
                <div className="lg:col-span-3 w-full">
                    <TabsList
                        className="flex flex-row lg:flex-col items-stretch justify-start w-full p-1.5 lg:p-2 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 shadow-xs gap-1.5 overflow-x-auto no-scrollbar h-auto bg-transparent"
                    >
                        <TabsTrigger
                            value="stages"
                            className="flex items-center justify-start gap-2.5 px-3.5 py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left w-auto lg:w-full shrink-0 cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted/80 hover:text-foreground border-0 shadow-none after:hidden"
                        >
                            <GitPullRequest className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">1. Tahapan CRM (Pipeline)</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="packages"
                            className="flex items-center justify-start gap-2.5 px-3.5 py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left w-auto lg:w-full shrink-0 cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted/80 hover:text-foreground border-0 shadow-none after:hidden"
                        >
                            <Package className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">2. Paket Umroh &amp; Haji</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="banks"
                            className="flex items-center justify-start gap-2.5 px-3.5 py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left w-auto lg:w-full shrink-0 cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted/80 hover:text-foreground border-0 shadow-none after:hidden"
                        >
                            <Landmark className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">3. Rekening Bank Travel</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="sources"
                            className="flex items-center justify-start gap-2.5 px-3.5 py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left w-auto lg:w-full shrink-0 cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted/80 hover:text-foreground border-0 shadow-none after:hidden"
                        >
                            <Share2 className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">4. Sumber Prospek (Lead Sources)</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab Content Panel */}
                <div className="lg:col-span-9 flex flex-col gap-6 w-full min-w-0">
                    {/* 1. STAGES TAB */}
                    <TabsContent value="stages" className="flex flex-col gap-6 m-0 outline-none">
                        <StagesTab
                            stages={stages}
                            onOpenAddStage={() => setIsAddStageOpen(true)}
                        />
                    </TabsContent>

                    {/* 2. PACKAGES TAB */}
                    <TabsContent value="packages" className="flex flex-col gap-6 m-0 outline-none">
                        <PackagesTab
                            packages={packages}
                            onOpenAddPackage={() => setIsAddPackageOpen(true)}
                            onOpenEditPackage={handleOpenEditPackage}
                        />
                    </TabsContent>

                    {/* 3. BANKS TAB */}
                    <TabsContent value="banks" className="flex flex-col gap-6 m-0 outline-none">
                        <BanksTab
                            banks={banks}
                            onOpenAddBank={() => setIsAddBankOpen(true)}
                        />
                    </TabsContent>

                    {/* 4. SOURCES TAB */}
                    <TabsContent value="sources" className="flex flex-col gap-6 m-0 outline-none">
                        <SourcesTab />
                    </TabsContent>
                </div>
            </Tabs>

            {/* Drawer: Add Stage */}
            <StageModal
                isOpen={isAddStageOpen}
                onClose={() => setIsAddStageOpen(false)}
                nextUrutan={stages.length + 1}
            />

            {/* Drawer: Add Package */}
            <AddPackageModal
                isOpen={isAddPackageOpen}
                onClose={() => setIsAddPackageOpen(false)}
                inventoryItems={inventoryItems}
            />

            {/* Drawer: Edit Package */}
            <EditPackageModal
                editingPackage={editingPackage}
                onClose={() => {
                    setIsEditPackageOpen(false);
                    setEditingPackage(null);
                }}
                inventoryItems={inventoryItems}
            />

            {/* Drawer: Add Bank */}
            <BankModal
                isOpen={isAddBankOpen}
                onClose={() => setIsAddBankOpen(false)}
            />
        </PageLayout>
    );
}
