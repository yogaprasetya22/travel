import * as React from 'react';
import { router } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
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
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isJamaahDrawerOpen, setIsJamaahDrawerOpen] = React.useState(false);

    const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
    const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);
    const [searchQuery, setSearchQuery] = React.useState(filters?.search || '');

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('keagenan.agents.index'),
            { search: searchQuery || undefined },
            { preserveState: true, replace: true }
        );
    };

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
            if (debouncedDrawerSearch) url.searchParams.set('search', debouncedDrawerSearch);

            const res = await fetch(url.toString(), {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!res.ok) throw new Error('Gagal mengambil data nasabah berikutnya');
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

    const handleDrawerScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 120) {
            if (hasMore && !isLoadingMore && !isLoadingInitial) {
                loadNextPage();
            }
        }
    };

    React.useEffect(() => {
        if (selectedAgent && isJamaahDrawerOpen) {
            fetchDrawerJamaahPage1(selectedAgent.id, debouncedDrawerSearch);
        }
    }, [debouncedDrawerSearch]);

    const openJamaahDrawer = (agent: Agent) => {
        setSelectedAgent(agent);
        setDrawerSearch('');
        setDrawerAgentStats({
            total_jamaah: agent.jamaah_count ?? 0,
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

            {/* Comprehensive Table Card */}
            <AgentTable
                agents={agents}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearchSubmit={handleSearch}
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
