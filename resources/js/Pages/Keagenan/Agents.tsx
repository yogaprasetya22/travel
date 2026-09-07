import * as React from 'react';
import { router } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
    Agent,
    AgentJamaahItem,
    AgentsProps,
} from './AgentsPartials/types';
import { AgentMetricsCards } from './AgentsPartials/AgentMetricsCards';
import { AgentTable } from './AgentsPartials/AgentTable';
import { AgentJamaahDrawer } from './AgentsPartials/AgentJamaahDrawer';
import { AddAgentSheet, EditAgentSheet } from './AgentsPartials/AgentFormSheet';

export default function Agents({
    agents,
    hierarchyLevels = [],
    leaders = [],
    metrics,
    filters,
}: AgentsProps) {
    const isMounted = useMounted();
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isJamaahDrawerOpen, setIsJamaahDrawerOpen] = React.useState(false);

    const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
    const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = React.useState(filters?.search || '');
    const [levelFilter, setLevelFilter] = React.useState(filters?.level_id || 'ALL');
    const [statusFilter, setStatusFilter] = React.useState(filters?.status || 'ALL');
    const [leaderFilter, setLeaderFilter] = React.useState(filters?.leader_id || 'ALL');
    const [startDate, setStartDate] = React.useState(filters?.start_date || '');
    const [endDate, setEndDate] = React.useState(filters?.end_date || '');

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
        if (filters?.start_date) {
            return {
                from: new Date(filters.start_date),
                to: filters.end_date ? new Date(filters.end_date) : undefined,
            };
        }
        return undefined;
    });

    const debouncedSearchQuery = useDebounce(searchQuery, 350);
    const isInitialMount = React.useRef(true);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        const startStr = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
        const endStr = range?.to
            ? format(range.to, 'yyyy-MM-dd')
            : range?.from
            ? format(range.from, 'yyyy-MM-dd')
            : '';
        setStartDate(startStr);
        setEndDate(endStr);
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setLevelFilter('ALL');
        setStatusFilter('ALL');
        setLeaderFilter('ALL');
        setStartDate('');
        setEndDate('');
        setDateRange(undefined);
        router.get(
            route('keagenan.agents.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Trigger router update when filter states change
    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const params: Record<string, any> = {};
        if (debouncedSearchQuery) params.search = debouncedSearchQuery;
        if (levelFilter && levelFilter !== 'ALL') params.level_id = levelFilter;
        if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
        if (leaderFilter && leaderFilter !== 'ALL') params.leader_id = leaderFilter;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (agents.per_page) params.per_page = agents.per_page;

        router.get(route('keagenan.agents.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [
        debouncedSearchQuery,
        levelFilter,
        statusFilter,
        leaderFilter,
        startDate,
        endDate,
    ]);

    const hasActiveFilters =
        Boolean(searchQuery) ||
        levelFilter !== 'ALL' ||
        statusFilter !== 'ALL' ||
        leaderFilter !== 'ALL' ||
        Boolean(startDate) ||
        Boolean(endDate);

    // State for Infinite Scroll in Jamaah Drawer
    const [jamaahList, setJamaahList] = React.useState<AgentJamaahItem[]>([]);
    const [drawerSearch, setDrawerSearch] = React.useState('');
    const debouncedDrawerSearch = useDebounce(drawerSearch, 350);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(false);
    const [totalJamaahCount, setTotalJamaahCount] = React.useState(0);
    const [isLoadingInitial, setIsLoadingInitial] = React.useState(false);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const [drawerAgentStats, setDrawerAgentStats] = React.useState<{
        total_jamaah: number;
        total_omzet: number;
    } | null>(null);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Fetch initial page 1 for the drawer
    const fetchDrawerJamaahPage1 = async (agentId: number, search: string = '') => {
        setIsLoadingInitial(true);
        setCurrentPage(1);

        try {
            const url = new URL(route('keagenan.agents.jamaah', agentId), window.location.origin);
            url.searchParams.set('page', '1');
            if (search) url.searchParams.set('search', search);

            const res = await fetch(url.toString(), {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!res.ok) throw new Error('Gagal mengambil data nasabah');
            const data = await res.json();

            const items: AgentJamaahItem[] = Array.isArray(data.jamaah)
                ? data.jamaah
                : (data.jamaah?.data || []);
            const hasMorePages = Boolean(data.has_more || data.jamaah?.has_more || data.jamaah?.next_page_url);
            const totalCount = data.total ?? data.jamaah?.total ?? data.agent?.total_jamaah ?? 0;
            const stats = data.agent_stats || data.agent || null;

            setJamaahList(items);
            setHasMore(hasMorePages);
            setTotalJamaahCount(totalCount);
            if (stats) {
                setDrawerAgentStats({
                    total_jamaah: stats.total_jamaah ?? totalCount,
                    total_omzet: stats.total_omzet ?? 0,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingInitial(false);
        }
    };

    // Load next page for infinite scroll
    const loadNextPage = async () => {
        if (!selectedAgent || isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        const nextPage = currentPage + 1;
        try {
            const url = new URL(route('keagenan.agents.jamaah', selectedAgent.id), window.location.origin);
            url.searchParams.set('page', String(nextPage));
            if (drawerSearch) url.searchParams.set('search', drawerSearch);

            const res = await fetch(url.toString(), {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!res.ok) throw new Error('Gagal memuat halaman berikutnya');
            const data = await res.json();

            const newItems: AgentJamaahItem[] = Array.isArray(data.jamaah)
                ? data.jamaah
                : (data.jamaah?.data || []);
            const hasMorePages = Boolean(data.has_more || data.jamaah?.has_more || data.jamaah?.next_page_url);

            setJamaahList((prev) => [...prev, ...newItems]);
            setCurrentPage(nextPage);
            setHasMore(hasMorePages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Auto debounce search inside Drawer
    React.useEffect(() => {
        if (!selectedAgent || !isJamaahDrawerOpen) return;
        fetchDrawerJamaahPage1(selectedAgent.id, debouncedDrawerSearch);
    }, [debouncedDrawerSearch]);

    const handleDrawerScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 80;
        if (reachedBottom && hasMore && !isLoadingMore && !isLoadingInitial) {
            loadNextPage();
        }
    };

    const openJamaahDrawer = (agent: Agent) => {
        setSelectedAgent(agent);
        setJamaahList([]);
        setDrawerSearch('');
        setDrawerAgentStats({
            total_jamaah: agent.jamaah_count || 0,
            total_omzet: 0,
        });
        setIsJamaahDrawerOpen(true);
        fetchDrawerJamaahPage1(agent.id, '');
    };

    const openEditDrawer = (agent: Agent) => {
        setEditingAgent(agent);
        setIsEditOpen(true);
    };

    const handleDeleteAgent = (agent: Agent) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun agen ${agent.name}?`)) {
            router.delete(route('keagenan.agents.destroy', agent.id));
        }
    };

    if (!isMounted) return null;

    return (
        <PageLayout
            title="Database Mitra Agen &amp; Konsultan"
            breadcrumbParent="Manajemen Keagenan"
            breadcrumbPage="Data Agen Lengkap"
            contentClass="p-6 md:p-8 flex flex-col gap-6"
        >
            {/* Summary Metrics Cards */}
            <AgentMetricsCards
                totalAgents={metrics?.total_agents}
                activeProducers={metrics?.active_producers}
            />

            {/* Comprehensive Table Card with DatePicker & Multi-Filters */}
            <AgentTable
                agents={agents}
                hierarchyLevels={hierarchyLevels}
                leaders={leaders}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                levelFilter={levelFilter}
                setLevelFilter={setLevelFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                leaderFilter={leaderFilter}
                setLeaderFilter={setLeaderFilter}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                onOpenCreate={() => setIsCreateOpen(true)}
                onOpenEdit={openEditDrawer}
                onOpenJamaah={openJamaahDrawer}
                onDeleteAgent={handleDeleteAgent}
            />

            {/* DRAWER: RINCIAN NASABAH JAMAAH PER AGENT */}
            <AgentJamaahDrawer
                isOpen={isJamaahDrawerOpen}
                onClose={() => {
                    setIsJamaahDrawerOpen(false);
                    setSelectedAgent(null);
                }}
                selectedAgent={selectedAgent}
                jamaahList={jamaahList}
                totalJamaahCount={totalJamaahCount}
                drawerAgentStats={drawerAgentStats}
                drawerSearch={drawerSearch}
                setDrawerSearch={setDrawerSearch}
                isLoadingInitial={isLoadingInitial}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onScroll={handleDrawerScroll}
                scrollContainerRef={scrollContainerRef}
            />

            {/* DRAWER: TAMBAH MITRA AGEN BARU */}
            <AddAgentSheet
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                hierarchyLevels={hierarchyLevels}
                leaders={leaders}
            />

            {/* DRAWER: EDIT DATA MITRA AGEN */}
            <EditAgentSheet
                editingAgent={editingAgent}
                onClose={() => {
                    setIsEditOpen(false);
                    setEditingAgent(null);
                }}
                hierarchyLevels={hierarchyLevels}
                leaders={leaders}
            />
        </PageLayout>
    );
}
