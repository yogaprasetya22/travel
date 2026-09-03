import {
    BankItem,
    InventoryItem,
    PackageItem,
    PageProps,
    Stage,
} from '@/Types';

export type { Stage, PackageItem, BankItem, InventoryItem };

export interface MasterDataProps extends PageProps {
    stages: Stage[];
    packages: PackageItem[];
    banks: BankItem[];
    inventoryItems: InventoryItem[];
    activeTab?: string;
}
