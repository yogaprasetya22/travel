import { PageProps } from '@/Types';
import {
    HierarchyLevelItem,
    Tenant as TenantItem,
    User as HierarchyUser,
} from '@/Types';
import { BANK_OPTIONS } from '@/lib/constants';

export { BANK_OPTIONS };
export type { HierarchyLevelItem, HierarchyUser, TenantItem };

export interface UserHierarchyProps extends PageProps {
    users: HierarchyUser[];
    tenants?: TenantItem[];
    selectedTenantId?: number | null;
    hierarchyTree: HierarchyLevelItem[];
    allLevels: HierarchyLevelItem[];
    currentUserRole?: string;
}
