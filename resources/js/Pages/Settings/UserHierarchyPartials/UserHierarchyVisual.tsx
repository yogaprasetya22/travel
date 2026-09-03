import React from 'react';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    Edit2,
    Trash2,
} from 'lucide-react';
import { HierarchyLevelItem } from './types';

interface UserHierarchyVisualProps {
    hierarchyTree: HierarchyLevelItem[];
    allLevels: HierarchyLevelItem[];
    levelCounts: Record<number, number>;
    activeDrawerLevel: HierarchyLevelItem | null;
    expandedNodeIds: Record<number, boolean>;
    toggleNode: (nodeId: number) => void;
    onOpenRoleDrawer: (level: HierarchyLevelItem) => void;
    onOpenCreateLevel: (parentLevel?: HierarchyLevelItem) => void;
    onOpenEditLevel: (level: HierarchyLevelItem) => void;
    onOpenDeleteLevel: (level: HierarchyLevelItem) => void;
}

export function UserHierarchyVisual({
    hierarchyTree,
    allLevels,
    levelCounts,
    activeDrawerLevel,
    expandedNodeIds,
    toggleNode,
    onOpenRoleDrawer,
    onOpenCreateLevel,
    onOpenEditLevel,
    onOpenDeleteLevel,
}: UserHierarchyVisualProps) {
    const renderTreeNode = (node: HierarchyLevelItem, depth = 0) => {
        const isExpanded = !!expandedNodeIds[node.id];
        const count = levelCounts[node.id] || 0;
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = activeDrawerLevel?.id === node.id;

        return (
            <div key={node.id} className="relative flex flex-col">
                {/* Node Row */}
                <div
                    className="flex items-center gap-3 relative py-3 select-none group/node"
                    style={{ paddingLeft: `${depth * 52}px` }}
                >
                    {/* Stepped Connector Lines */}
                    {depth > 0 && (
                        <div
                            className="absolute border-l-2 border-b-2 border-border/80 rounded-bl-2xl transition-all pointer-events-none"
                            style={{
                                left: `${(depth - 1) * 52 + 22}px`,
                                top: '-12px',
                                width: '30px',
                                height: '36px',
                            }}
                        />
                    )}

                    {/* Expand / Collapse Toggle Button */}
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node.id);
                            }}
                            className="w-7 h-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer shrink-0 z-10"
                            title={isExpanded ? 'Tutup cabang' : 'Buka cabang'}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                            )}
                        </button>
                    ) : (
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 z-10">
                            <div className="w-2 h-2 rounded-full bg-border" />
                        </div>
                    )}

                    {/* Pill Capsule Button */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => onOpenRoleDrawer(node)}
                            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-xs transition-all cursor-pointer text-left ${
                                isSelected
                                    ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 scale-102'
                                    : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted/40'
                            }`}
                        >
                            <span className="text-xs font-bold tracking-tight">{node.nama_level}</span>
                            <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    isSelected
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {count}
                            </span>
                        </button>

                        {/* Node Action Tools */}
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenCreateLevel(node);
                                }}
                                className="p-1.5 rounded-lg border border-border/60 bg-card/80 hover:bg-muted text-muted-foreground hover:text-primary transition cursor-pointer shadow-2xs"
                                title={`Tambah sub-level di bawah ${node.nama_level}`}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenEditLevel(node);
                                }}
                                className="p-1.5 rounded-lg border border-border/60 bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                title={`Edit level ${node.nama_level}`}
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {allLevels.length > 1 && node.nama_level !== 'Owner' && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenDeleteLevel(node);
                                    }}
                                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-600 dark:text-red-400 transition cursor-pointer shadow-2xs"
                                    title={`Hapus level ${node.nama_level}`}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recursive Children Rows */}
                {hasChildren && isExpanded && (
                    <div className="flex flex-col">
                        {node.children!.map((child) => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="relative w-full rounded-3xl border border-border/80 p-8 md:p-12 overflow-x-auto min-h-[480px] shadow-xs transition-all"
            style={{
                backgroundColor: 'hsl(var(--card))',
                backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--border) / 0.45) 0, hsl(var(--border) / 0.45) 1.5px, transparent 0, transparent 18px)`,
            }}
        >
            <div className="inline-block min-w-full">
                {hierarchyTree.length > 0 ? (
                    hierarchyTree.map((rootNode) => renderTreeNode(rootNode, 0))
                ) : (
                    <div className="py-24 text-center">
                        <p className="text-sm text-muted-foreground">Belum ada struktur hierarki di tenant ini.</p>
                        <button
                            onClick={() => onOpenCreateLevel()}
                            className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
                        >
                            Buat Level Pertama
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
