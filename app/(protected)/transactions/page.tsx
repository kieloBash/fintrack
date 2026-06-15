'use client'
import { queryKeys } from '@/constants/query-keys';
import { useCategories } from '@/hooks/queries/useCategories';
import { flattenPages } from '@/hooks/queries/useFlattenedPages';
import { useInfiniteTransactions } from '@/hooks/queries/useInfiniteTransactions';
import { getCategoryIcon } from '@/lib/icon-mapper';
import { CategoryDTO } from '@/services/category.service';
import { TransactionDTO, TransactionService } from '@/services/transaction.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Check,
    MoreHorizontal,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from 'lucide-react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryMeta {
    id: string;
    label: string;
    color: string;
    bg: string;
    icon: React.ElementType;
}

interface Tx {
    id: string;
    merchant: string;
    categoryId: string;
    categoryLabel: string;
    amount: number;
    date: Date;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
}

interface DayGroup {
    dateKey: string;
    label: string;
    weekLabel: string;
    weekKey: string;
    transactions: Tx[];
}

interface Filters {
    categories: Set<string>;
    sort: 'newest' | 'oldest' | 'highest' | 'lowest';
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function dateKey(d: Date) {
    return d.toISOString().slice(0, 10);
}

function isoWeek(d: Date): string {
    const tmp = new Date(d);
    tmp.setHours(0, 0, 0, 0);
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
    const week1 = new Date(tmp.getFullYear(), 0, 4);
    const wn = 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${tmp.getFullYear()}-W${String(wn).padStart(2, '0')}`;
}

function weekLabel(d: Date, todayKey: string): string {
    const now = new Date(todayKey);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    if (d >= startOfWeek) return 'This week';
    if (d >= startOfLastWeek) return 'Last week';
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const ws = new Date(d);
    ws.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    return `${ws.toLocaleDateString('en-US', opts)} – ${we.toLocaleDateString('en-US', opts)}`;
}

function dayLabel(d: Date, todayKey: string, yesterdayKey: string) {
    const k = dateKey(d);
    if (k === todayKey) return 'Today';
    if (k === yesterdayKey) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── Data transforms ──────────────────────────────────────────────────────────

function buildCategoryMeta(categories: CategoryDTO[]): Record<string, CategoryMeta> {
    const map: Record<string, CategoryMeta> = {};
    categories.forEach((c) => {
        const color = (c as any).color ?? '#6B7280'; // ⚠️ verify Category model has `color`
        map[c.id] = {
            id: c.id,
            label: (c as any).name ?? 'Other', // ⚠️ verify Category model has `name`
            color,
            bg: `${color}1A`,
            icon: getCategoryIcon(c.icon) ?? MoreHorizontal,
        };
    });
    return map;
}

function toTx(t: TransactionDTO, categoryMeta: Record<string, CategoryMeta>): Tx {
    const date = new Date(t.transactionDate as unknown as string);
    const meta = categoryMeta[t.categoryId as unknown as string];
    return {
        id: t.id as unknown as string,
        merchant: (t.merchant as string) || (t.label as string),
        categoryId: t.categoryId as unknown as string,
        categoryLabel: meta?.label ?? 'Other',
        amount: Number(t.amount),
        date,
        icon: meta?.icon ?? MoreHorizontal,
        iconBg: meta?.bg ?? '#F3F4F6',
        iconColor: meta?.color ?? '#6B7280',
    };
}

function groupByDay(transactions: Tx[]): DayGroup[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = dateKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = dateKey(yesterday);

    const map = new Map<string, Tx[]>();
    transactions.forEach((tx) => {
        const key = dateKey(tx.date);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(tx);
    });

    const groups: DayGroup[] = [];
    for (const [key, txs] of map) {
        const d = txs[0].date;
        groups.push({
            dateKey: key,
            label: dayLabel(d, todayKey, yesterdayKey),
            weekLabel: weekLabel(d, todayKey),
            weekKey: isoWeek(d),
            transactions: txs,
        });
    }

    return groups.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WeekBanner({ label, total, count }: { label: string; total: number; count: number }) {
    return (
        <div className="flex items-center justify-between px-1 pt-5 pb-2">
            <div className="flex items-center gap-2">
                <div className="h-px flex-1 w-5 bg-[#E5E5EA]" />
                <span className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest">{label}</span>
                <div className="h-px flex-1 w-5 bg-[#E5E5EA]" />
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <span className="text-[11px] font-semibold text-[#6C6C70]">{count} transactions</span>
                <span className="text-xs font-bold text-[#1C1C1E]">₱{total.toLocaleString()}</span>
            </div>
        </div>
    );
}

function DayHeader({ label, total }: { label: string; total: number }) {
    return (
        <div className="flex items-center justify-between pt-3 pb-2 px-1 sticky top-0 bg-[#F2F2F7] z-10">
            <span className="text-sm font-bold text-[#1C1C1E]">{label}</span>
            <span className="text-sm font-semibold text-[#6C6C70]">₱{total.toLocaleString()}</span>
        </div>
    );
}

const DELETE_WIDTH = 80;

function TxCard({ tx, onDelete }: { tx: Tx; onDelete: () => void }) {
    const x = useMotionValue(0);
    const revealed = useRef(false);

    const deleteOpacity = useTransform(x, [-DELETE_WIDTH, -24], [1, 0]);
    const deleteScale = useTransform(x, [-DELETE_WIDTH, -24], [1, 0.7]);

    function snapTo(target: number, onComplete?: () => void) {
        animate(x, target, { type: 'spring', stiffness: 500, damping: 42, onComplete });
    }

    function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
        const movedEnough = info.offset.x < -40;
        const fastEnough = info.velocity.x < -200;
        const shouldReveal = movedEnough || fastEnough;

        if (shouldReveal) {
            snapTo(-DELETE_WIDTH);
            revealed.current = true;
        } else {
            snapTo(0);
            revealed.current = false;
        }
    }

    function handleCardTap() {
        if (revealed.current) {
            snapTo(0);
            revealed.current = false;
        }
    }

    function handleDelete() {
        animate(x, -420, { duration: 0.22, ease: [0.32, 0, 0.67, 0] });
        setTimeout(onDelete, 220);
    }

    return (
        <div className="relative overflow-hidden bg-[#FF3B30]">
            <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center">
                <motion.button
                    onClick={handleDelete}
                    style={{ opacity: deleteOpacity, scale: deleteScale }}
                    className="flex flex-col items-center gap-1 w-full h-full justify-center active:brightness-90"
                >
                    <Trash2 className="w-5 h-5 text-white" strokeWidth={2} />
                    <span className="text-[10px] font-bold text-white tracking-wide">Delete</span>
                </motion.button>
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -DELETE_WIDTH, right: 0 }}
                dragElastic={{ left: 0.08, right: 0.15 }}
                dragMomentum={false}
                style={{ x, touchAction: 'pan-y' }}
                onDragEnd={handleDragEnd}
                onTap={handleCardTap}
                className="relative bg-white flex items-center gap-3.5 px-4 py-3.5 cursor-grab active:cursor-grabbing"
            >
                <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: tx.iconBg }}
                >
                    <tx.icon className="w-5 h-5" style={{ color: tx.iconColor }} strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1C1C1E] truncate">{tx.merchant}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ backgroundColor: tx.iconBg, color: tx.iconColor }}
                        >
                            {tx.categoryLabel}
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#AEAEB2]" />
                        <span className="text-[11px] text-[#AEAEB2]">{format(tx.date, 'h:mm a')}</span>
                    </div>
                </div>

                <p className="text-sm font-bold text-[#FF3B30] flex-shrink-0">
                    −₱{tx.amount.toLocaleString()}
                </p>
            </motion.div>
        </div>
    );
}

// ─── Filter sheet ─────────────────────────────────────────────────────────────

function FilterSheet({
    filters,
    onChange,
    onClose,
    categories,
    categoryMeta,
}: {
    filters: Filters;
    onChange: (f: Filters) => void;
    onClose: () => void;
    categories: CategoryDTO[];
    categoryMeta: Record<string, CategoryMeta>;
}) {
    const [local, setLocal] = useState<Filters>({
        categories: new Set(filters.categories),
        sort: filters.sort,
    });

    function toggleCat(id: string) {
        setLocal((prev) => {
            const next = new Set(prev.categories);
            next.has(id) ? next.delete(id) : next.add(id);
            return { ...prev, categories: next };
        });
    }

    function apply() { onChange(local); onClose(); }
    function reset() { setLocal({ categories: new Set(), sort: 'newest' }); }

    const SORT_OPTIONS: { value: Filters['sort']; label: string }[] = [
        { value: 'newest', label: 'Newest first' },
        { value: 'oldest', label: 'Oldest first' },
        { value: 'highest', label: 'Highest amount' },
        { value: 'lowest', label: 'Lowest amount' },
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
                <div className="max-w-[430px] w-full bg-white rounded-t-[28px] shadow-2xl px-5 pt-5 pb-10">
                    <div className="w-10 h-1 bg-[#D1D1D6] rounded-full mx-auto mb-5" />

                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-[#1C1C1E]">Filter & Sort</h3>
                        <button onClick={reset} className="text-xs font-bold text-[#FF3B30]">Reset</button>
                    </div>

                    <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest mb-2.5">Sort by</p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setLocal((p) => ({ ...p, sort: opt.value }))}
                                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl border-2 transition-all text-sm font-semibold ${local.sort === opt.value
                                    ? 'border-[#1D3D8F] bg-[#EEF2FB] text-[#1D3D8F]'
                                    : 'border-[#E5E5EA] text-[#6C6C70]'
                                    }`}
                            >
                                {opt.label}
                                {local.sort === opt.value && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                            </button>
                        ))}
                    </div>

                    <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest mb-2.5">Categories</p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {categories.map((c) => {
                            const meta = categoryMeta[c.id];
                            const active = local.categories.has(c.id);
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => toggleCat(c.id)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 transition-all ${active ? 'border-[#1D3D8F] bg-[#EEF2FB]' : 'border-[#E5E5EA]'
                                        }`}
                                >
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta?.bg }}>
                                        <meta.icon className="w-3 h-3" style={{ color: meta?.color }} strokeWidth={2} />
                                    </div>
                                    <span className={`text-xs font-semibold truncate ${active ? 'text-[#1D3D8F]' : 'text-[#6C6C70]'}`}>{meta?.label}</span>
                                    {active && <Check className="w-3 h-3 text-[#1D3D8F] ml-auto flex-shrink-0" strokeWidth={2.5} />}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={apply}
                        className="w-full bg-[#1D3D8F] text-white font-bold text-sm py-4 rounded-2xl hover:bg-[#163074] transition-colors"
                    >
                        Apply Filters
                        {local.categories.size > 0 && ` (${local.categories.size} categories)`}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ActivityPage() {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Filters>({ categories: new Set(), sort: 'newest' });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
    const sentinelRef = useRef<HTMLDivElement>(null);
    const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Debounce search → query param
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data: categories } = useCategories();
    const categoryMeta = useMemo(() => buildCategoryMeta(categories ?? []), [categories]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
        useInfiniteTransactions({ search });

    const rawTransactions = flattenPages<TransactionDTO>(data);

    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => TransactionService.deleteTransaction(id),
        onError: (_err, id) => {
            setHiddenIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            toast.error('Failed to delete transaction');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transaction.infinite });
        },
    });

    const handleDelete = useCallback((tx: Tx) => {
        setHiddenIds((prev) => new Set(prev).add(tx.id));

        const timer = setTimeout(() => {
            deleteMutation.mutate(tx.id);
            deleteTimers.current.delete(tx.id);
        }, 4000);
        deleteTimers.current.set(tx.id, timer);

        toast(`Deleted "${tx.merchant}"`, {
            duration: 4000,
            action: {
                label: 'Undo',
                onClick: () => {
                    const t = deleteTimers.current.get(tx.id);
                    if (t) {
                        clearTimeout(t);
                        deleteTimers.current.delete(tx.id);
                    }
                    setHiddenIds((prev) => {
                        const next = new Set(prev);
                        next.delete(tx.id);
                        return next;
                    });
                },
            },
        });
    }, [deleteMutation]);

    // Transform + client-side category filter + sort
    const visibleTransactions = useMemo(() => {
        let txs = rawTransactions
            .filter((t) => !hiddenIds.has(t.id as unknown as string))
            .map((t) => toTx(t, categoryMeta));

        if (filters.categories.size > 0) {
            txs = txs.filter((t) => filters.categories.has(t.categoryId));
        }

        if (filters.sort === 'oldest') txs.sort((a, b) => a.date.getTime() - b.date.getTime());
        else if (filters.sort === 'highest') txs.sort((a, b) => b.amount - a.amount);
        else if (filters.sort === 'lowest') txs.sort((a, b) => a.amount - b.amount);
        else txs.sort((a, b) => b.date.getTime() - a.date.getTime());

        return txs;
    }, [rawTransactions, hiddenIds, categoryMeta, filters]);

    const dayGroups = useMemo(() => groupByDay(visibleTransactions), [visibleTransactions]);

    const totalFiltered = useMemo(
        () => visibleTransactions.reduce((s, t) => s + t.amount, 0),
        [visibleTransactions]
    );

    type RenderItem =
        | { type: 'week'; key: string; label: string; total: number; count: number }
        | { type: 'day'; group: DayGroup };

    const renderItems = useMemo<RenderItem[]>(() => {
        const items: RenderItem[] = [];
        let lastWeek = '';
        const weekTotals: Record<string, { total: number; count: number }> = {};

        dayGroups.forEach((g) => {
            if (!weekTotals[g.weekKey]) weekTotals[g.weekKey] = { total: 0, count: 0 };
            g.transactions.forEach((t) => { weekTotals[g.weekKey].total += t.amount; });
            weekTotals[g.weekKey].count += g.transactions.length;
        });

        dayGroups.forEach((g) => {
            if (g.weekKey !== lastWeek) {
                const wt = weekTotals[g.weekKey];
                items.push({ type: 'week', key: g.weekKey, label: g.weekLabel, total: wt.total, count: wt.count });
                lastWeek = g.weekKey;
            }
            items.push({ type: 'day', group: g });
        });

        return items;
    }, [dayGroups]);

    // Infinite scroll → fetchNextPage
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const activeFilterCount = filters.categories.size + (filters.sort !== 'newest' ? 1 : 0);

    return (
        <div className="flex flex-col h-full">
            {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-[#F2F2F7] px-4 pt-3 pb-3 space-y-2.5 border-b border-[#E5E5EA]">
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#E5E5EA] px-3.5 h-11">
                    <Search className="w-4 h-4 text-[#AEAEB2] flex-shrink-0" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Search transactions…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-1 text-sm font-medium text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                    />
                    {searchInput && (
                        <button onClick={() => setSearchInput('')}>
                            <X className="w-4 h-4 text-[#AEAEB2]" strokeWidth={2} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-2 overflow-x-auto flex-1 pb-0.5 scrollbar-none">
                        <button
                            onClick={() => setFilters((p) => ({ ...p, categories: new Set() }))}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${filters.categories.size === 0
                                ? 'bg-[#1D3D8F] text-white'
                                : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
                                }`}
                        >
                            All
                        </button>

                        {(categories ?? []).map((c) => {
                            const meta = categoryMeta[c.id];
                            const active = filters.categories.has(c.id);
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setFilters((p) => {
                                        const next = new Set(p.categories);
                                        active ? next.delete(c.id) : next.add(c.id);
                                        return { ...p, categories: next };
                                    })}
                                    className={`flex-shrink-0 flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${active
                                        ? 'border-transparent text-white'
                                        : 'bg-white text-[#6C6C70] border-[#E5E5EA]'
                                        }`}
                                    style={active ? { backgroundColor: meta?.color } : {}}
                                >
                                    <meta.icon className="w-3 h-3" strokeWidth={2} />
                                    {meta?.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setSheetOpen(true)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all ${activeFilterCount > 0
                            ? 'bg-[#1D3D8F] text-white border-transparent'
                            : 'bg-white text-[#6C6C70] border-[#E5E5EA]'
                            }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
                        {activeFilterCount > 0 ? activeFilterCount : 'Sort'}
                    </button>
                </div>
            </div>

            {/* ── Summary bar ───────────────────────────────────────────────────── */}
            {(search || filters.categories.size > 0) && (
                <div className="px-4 py-2.5 bg-[#EEF2FB] border-b border-[#DBEAFE] flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[#1D3D8F]">
                        {visibleTransactions.length} results
                    </p>
                    <p className="text-xs font-bold text-[#1D3D8F]">₱{totalFiltered.toLocaleString()} total</p>
                </div>
            )}

            {/* ── Feed ──────────────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
                {status === 'pending' ? (
                    <div className="flex items-center justify-center py-20 gap-2">
                        <span className="w-4 h-4 border-2 border-[#D1D1D6] border-t-[#1D3D8F] rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-[#AEAEB2]">Loading transactions…</span>
                    </div>
                ) : status === 'error' ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-sm font-semibold text-[#FF3B30]">Failed to load transactions</p>
                    </div>
                ) : renderItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-[#F2F2F7] rounded-full flex items-center justify-center mb-4">
                            <Search className="w-7 h-7 text-[#AEAEB2]" strokeWidth={1.5} />
                        </div>
                        <p className="text-base font-bold text-[#3A3A3C]">No transactions found</p>
                        <p className="text-sm text-[#AEAEB2] mt-1">Try a different search or filter</p>
                    </div>
                ) : (
                    renderItems.map((item) => {
                        if (item.type === 'week') {
                            return (
                                <WeekBanner
                                    key={`week-${item.key}`}
                                    label={item.label}
                                    total={item.total}
                                    count={item.count}
                                />
                            );
                        }

                        const { group } = item;
                        const dayTotal = group.transactions.reduce((s, t) => s + t.amount, 0);

                        return (
                            <div key={group.dateKey}>
                                <DayHeader label={group.label} total={dayTotal} />
                                <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden mb-1">
                                    <AnimatePresence initial={false}>
                                        {group.transactions.map((tx, i) => (
                                            <motion.div
                                                key={tx.id}
                                                initial={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                                transition={{ duration: 0.26, ease: [0.32, 0, 0.67, 0] }}
                                                className={i < group.transactions.length - 1 ? 'border-b border-[#F2F2F7]' : ''}
                                            >
                                                <TxCard tx={tx} onDelete={() => handleDelete(tx)} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })
                )}

                <div ref={sentinelRef} className="h-4" />

                {isFetchingNextPage && (
                    <div className="flex items-center justify-center py-5 gap-2">
                        <span className="w-4 h-4 border-2 border-[#D1D1D6] border-t-[#1D3D8F] rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-[#AEAEB2]">Loading more…</span>
                    </div>
                )}

                {!hasNextPage && renderItems.length > 0 && (
                    <p className="text-center text-[11px] text-[#AEAEB2] py-5">
                        You've reached the beginning of your history.
                    </p>
                )}
            </div>

            {sheetOpen && (
                <FilterSheet
                    filters={filters}
                    onChange={setFilters}
                    onClose={() => setSheetOpen(false)}
                    categories={categories ?? []}
                    categoryMeta={categoryMeta}
                />
            )}
        </div>
    );
}