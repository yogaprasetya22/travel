import { PaginatedData } from '@/Components/DataTablePagination';
import {
    AgentJamaahItem,
    HierarchyLevelItem,
    LeaderItem,
    User as Agent,
} from '@/Types';
import { BANK_OPTIONS } from '@/lib/constants';

export { BANK_OPTIONS };
export type { HierarchyLevelItem, LeaderItem, Agent, AgentJamaahItem };

export interface AgentsProps {
    agents: PaginatedData<Agent>;
    hierarchyLevels?: HierarchyLevelItem[];
    leaders?: LeaderItem[];
    metrics?: {
        total_agents: number;
        active_producers: number;
    };
    filters?: {
        search?: string;
        level_id?: string;
        status?: string;
        leader_id?: string;
        start_date?: string;
        end_date?: string;
        per_page?: number;
    };
}
