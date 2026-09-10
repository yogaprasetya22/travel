import {
    BankItem,
    InventoryItem,
    PackageItem,
    PageProps,
    Stage,
    ItineraryItem,
    ItineraryRundown,
} from '@/Types';

export type { Stage, PackageItem, BankItem, InventoryItem, ItineraryItem, ItineraryRundown };

export interface MasterDataProps extends PageProps {
    stages: Stage[];
    packages: PackageItem[];
    banks: BankItem[];
    inventoryItems: InventoryItem[];
    activeTab?: string;
}

