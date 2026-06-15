'use client'
import {
    Car,
    Check,
    Coffee,
    Film,
    Heart,
    MoreHorizontal,
    Music, Search,
    ShoppingBag,
    SlidersHorizontal,
    Smartphone,
    Trash2,
    Utensils,
    X,
    Zap
} from 'lucide-react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tx {
    id: number;
    merchant: string;
    category: string;
    amount: number;
    date: Date;
    timeLabel: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    note?: string;
}

interface DayGroup {
    dateKey: string;         // "2025-06-14"
    label: string;           // "Today", "Yesterday", "Mon, Jun 10"
    weekLabel: string;       // "This week", "Last week", "Jun 2–8"
    weekKey: string;         // "2025-W24"
    transactions: Tx[];
}

// ─── Mock data factory ────────────────────────────────────────────────────────

const MERCHANTS: Omit<Tx, 'id' | 'date' | 'timeLabel'>[] = [
    { merchant: 'Starbucks', category: 'food', amount: 245, icon: Coffee, iconBg: '#FEF3C7', iconColor: '#D97706' },
    { merchant: 'Grab', category: 'transport', amount: 380, icon: Car, iconBg: '#DBEAFE', iconColor: '#2563EB' },
    { merchant: "McDonald's", category: 'food', amount: 285, icon: Utensils, iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { merchant: 'Jollibee', category: 'food', amount: 195, icon: Utensils, iconBg: '#FEF3C7', iconColor: '#D97706' },
    { merchant: 'Spotify', category: 'subscriptions', amount: 149, icon: Music, iconBg: '#D1FAE5', iconColor: '#059669' },
    { merchant: 'Zara', category: 'shopping', amount: 1850, icon: ShoppingBag, iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { merchant: 'Apple Store', category: 'shopping', amount: 5499, icon: Smartphone, iconBg: '#E0E7FF', iconColor: '#4338CA' },
    { merchant: 'Mercury Drug', category: 'health', amount: 520, icon: Heart, iconBg: '#FFE4E6', iconColor: '#E11D48' },
    { merchant: 'Meralco', category: 'utilities', amount: 1200, icon: Zap, iconBg: '#FEF9C3', iconColor: '#CA8A04' },
    { merchant: 'Netflix', category: 'subscriptions', amount: 549, icon: Film, iconBg: '#FCE7F3', iconColor: '#DB2777' },
    { merchant: 'Van Fare', category: 'transport', amount: 40, icon: Car, iconBg: '#DBEAFE', iconColor: '#2563EB' },
    { merchant: 'MRT', category: 'transport', amount: 80, icon: Car, iconBg: '#DBEAFE', iconColor: '#2563EB' },
    { merchant: 'Grab Food', category: 'food', amount: 390, icon: Utensils, iconBg: '#FEF3C7', iconColor: '#D97706' },
    { merchant: 'Lazada', category: 'shopping', amount: 1280, icon: ShoppingBag, iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { merchant: 'National Bookstore', category: 'other', amount: 340, icon: MoreHorizontal, iconBg: '#F3F4F6', iconColor: '#6B7280' },
    { merchant: 'iCloud+', category: 'subscriptions', amount: 109, icon: Smartphone, iconBg: '#D1FAE5', iconColor: '#059669' },
    { merchant: 'Watsons', category: 'health', amount: 380, icon: Heart, iconBg: '#FFE4E6', iconColor: '#E11D48' },
    { merchant: 'IKEA', category: 'shopping', amount: 2340, icon: ShoppingBag, iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { merchant: 'Yellow Cab', category: 'food', amount: 620, icon: Utensils, iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { merchant: 'Globe Prepaid', category: 'utilities', amount: 300, icon: Zap, iconBg: '#FEF9C3', iconColor: '#CA8A04' },
];

const TIMES = ['7:15 AM', '8:02 AM', '9:30 AM', '11:45 AM', '12:20 PM', '1:05 PM', '3:30 PM', '5:15 PM', '6:48 PM', '8:10 PM'];

function seedInt(seed: number, min: number, max: number) {
    const x = Math.sin(seed) * 10000;
    return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}

function generateTxForDate(date: Date, dayOffset: number): Tx[] {
    const count = seedInt(dayOffset * 7, 1, 5);
    const used = new Set<number>();
    const txs: Tx[] = [];
    for (let i = 0; i < count; i++) {
        let mIdx = seedInt(dayOffset * 13 + i * 17, 0, MERCHANTS.length - 1);
        while (used.has(mIdx)) mIdx = (mIdx + 1) % MERCHANTS.length;
        used.add(mIdx);
        const m = MERCHANTS[mIdx];
        const timeIdx = seedInt(dayOffset * 5 + i * 11, 0, TIMES.length - 1);
        txs.push({ ...m, id: dayOffset * 100 + i, date, timeLabel: TIMES[timeIdx] });
    }
    return txs.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));
}

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

function weekLabel(d: Date, todayKey: string, yesterdayKey: string): string {
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

const ALL_DAYS_DATA: DayGroup[] = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = dateKey(today);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = dateKey(yesterday);

    const groups: DayGroup[] = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const txs = generateTxForDate(d, i);
        if (txs.length === 0) continue;
        groups.push({
            dateKey: dateKey(d),
            label: dayLabel(d, todayKey, yesterdayKey),
            weekLabel: weekLabel(d, todayKey, yesterdayKey),
            weekKey: isoWeek(d),
            transactions: txs,
        });
    }
    return groups;
})();

// ─── Category meta ────────────────────────────────────────────────────────────

const CAT_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    food: { label: 'Food & Drink', color: '#D97706', bg: '#FEF3C7', icon: Coffee },
    transport: { label: 'Transport', color: '#2563EB', bg: '#DBEAFE', icon: Car },
    shopping: { label: 'Shopping', color: '#7C3AED', bg: '#EDE9FE', icon: ShoppingBag },
    subscriptions: { label: 'Subscriptions', color: '#059669', bg: '#D1FAE5', icon: Smartphone },
    utilities: { label: 'Utilities', color: '#CA8A04', bg: '#FEF9C3', icon: Zap },
    health: { label: 'Health', color: '#E11D48', bg: '#FFE4E6', icon: Heart },
    entertainment: { label: 'Entertainment', color: '#DB2777', bg: '#FCE7F3', icon: Film },
    other: { label: 'Other', color: '#6B7280', bg: '#F3F4F6', icon: MoreHorizontal },
};

const ALL_CATS = Object.keys(CAT_META);

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

    // Delete button fades + scales in as the card slides open
    const deleteOpacity = useTransform(x, [-DELETE_WIDTH, -24], [1, 0]);
    const deleteScale = useTransform(x, [-DELETE_WIDTH, -24], [1, 0.7]);

    function snapTo(target: number, onComplete?: () => void) {
        animate(x, target, {
            type: 'spring',
            stiffness: 500,
            damping: 42,
            onComplete,
        });
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
        // Fly the card fully off-screen, then collapse its height to nothing
        animate(x, -420, { duration: 0.22, ease: [0.32, 0, 0.67, 0] });
        setTimeout(onDelete, 220);
    }

    return (
        <div className="relative overflow-hidden bg-[#FF3B30]">
            {/* Delete zone — revealed as card slides */}
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

            {/* Draggable card */}
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
                            style={{ backgroundColor: CAT_META[tx.category]?.bg ?? '#F3F4F6', color: CAT_META[tx.category]?.color ?? '#6B7280' }}
                        >
                            {CAT_META[tx.category]?.label ?? tx.category}
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#AEAEB2]" />
                        <span className="text-[11px] text-[#AEAEB2]">{tx.timeLabel}</span>
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

interface Filters {
    categories: Set<string>;
    sort: 'newest' | 'oldest' | 'highest' | 'lowest';
}

function FilterSheet({
    filters,
    onChange,
    onClose,
}: {
    filters: Filters;
    onChange: (f: Filters) => void;
    onClose: () => void;
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
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
                <div className="max-w-[430px] w-full bg-white rounded-t-[28px] shadow-2xl px-5 pt-5 pb-10">
                    {/* Handle */}
                    <div className="w-10 h-1 bg-[#D1D1D6] rounded-full mx-auto mb-5" />

                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-[#1C1C1E]">Filter & Sort</h3>
                        <button onClick={reset} className="text-xs font-bold text-[#FF3B30]">Reset</button>
                    </div>

                    {/* Sort */}
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

                    {/* Categories */}
                    <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest mb-2.5">Categories</p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {ALL_CATS.map((id) => {
                            const meta = CAT_META[id];
                            const active = local.categories.has(id);
                            return (
                                <button
                                    key={id}
                                    onClick={() => toggleCat(id)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 transition-all ${active ? 'border-[#1D3D8F] bg-[#EEF2FB]' : 'border-[#E5E5EA]'
                                        }`}
                                >
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
                                        <meta.icon className="w-3 h-3" style={{ color: meta.color }} strokeWidth={2} />
                                    </div>
                                    <span className={`text-xs font-semibold truncate ${active ? 'text-[#1D3D8F]' : 'text-[#6C6C70]'}`}>{meta.label}</span>
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

const PAGE_SIZE = 7; // days per page

export default function ActivityPage() {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Filters>({ categories: new Set(), sort: 'newest' });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [visibleDays, setVisibleDays] = useState(PAGE_SIZE);
    const [loadingMore, setLoadingMore] = useState(false);
    const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
    const sentinelRef = useRef<HTMLDivElement>(null);

    const handleDelete = useCallback((tx: Tx) => {
        setDeletedIds((prev) => new Set([...prev, tx.id]));
        toast(`Deleted "${tx.merchant}"`, {
            duration: 4000,
            action: {
                label: 'Undo',
                onClick: () => setDeletedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(tx.id);
                    return next;
                }),
            },
        });
    }, []);

    // Filter + search all transactions
    const filteredDays = useMemo<DayGroup[]>(() => {
        const q = search.toLowerCase();
        const hasCatFilter = filters.categories.size > 0;

        return ALL_DAYS_DATA.map((day) => {
            let txs = day.transactions.filter((t) => !deletedIds.has(t.id));

            if (q) txs = txs.filter((t) =>
                t.merchant.toLowerCase().includes(q) ||
                (CAT_META[t.category]?.label ?? '').toLowerCase().includes(q)
            );

            if (hasCatFilter) txs = txs.filter((t) => filters.categories.has(t.category));

            if (filters.sort === 'oldest') txs = [...txs].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));
            if (filters.sort === 'highest') txs = [...txs].sort((a, b) => b.amount - a.amount);
            if (filters.sort === 'lowest') txs = [...txs].sort((a, b) => a.amount - b.amount);

            return { ...day, transactions: txs };
        }).filter((day) => day.transactions.length > 0);
    }, [search, filters]);

    const visibleGroups = filteredDays.slice(0, visibleDays);
    const hasMore = visibleDays < filteredDays.length;

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    setLoadingMore(true);
                    setTimeout(() => {
                        setVisibleDays((v) => v + PAGE_SIZE);
                        setLoadingMore(false);
                    }, 600);
                }
            },
            { threshold: 0.1 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [hasMore, loadingMore]);

    // Reset visible count when filters change
    useEffect(() => { setVisibleDays(PAGE_SIZE); }, [search, filters]);

    // Build week-grouped structure for rendering
    type RenderItem =
        | { type: 'week'; key: string; label: string; total: number; count: number }
        | { type: 'day'; group: DayGroup }

    const renderItems = useMemo<RenderItem[]>(() => {
        const items: RenderItem[] = [];
        let lastWeek = '';
        const weekTotals: Record<string, { total: number; count: number }> = {};

        // Pre-calc week totals from visible groups
        visibleGroups.forEach((g) => {
            if (!weekTotals[g.weekKey]) weekTotals[g.weekKey] = { total: 0, count: 0 };
            g.transactions.forEach((t) => { weekTotals[g.weekKey].total += t.amount; });
            weekTotals[g.weekKey].count += g.transactions.length;
        });

        visibleGroups.forEach((g) => {
            if (g.weekKey !== lastWeek) {
                const wt = weekTotals[g.weekKey];
                items.push({ type: 'week', key: g.weekKey, label: g.weekLabel, total: wt.total, count: wt.count });
                lastWeek = g.weekKey;
            }
            items.push({ type: 'day', group: g });
        });

        return items;
    }, [visibleGroups]);

    const totalFiltered = useMemo(
        () => filteredDays.reduce((s, d) => s + d.transactions.reduce((ss, t) => ss + t.amount, 0), 0),
        [filteredDays]
    );

    const activeFilterCount = filters.categories.size + (filters.sort !== 'newest' ? 1 : 0);

    return (
        <div className="flex flex-col h-full">
            {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-[#F2F2F7] px-4 pt-3 pb-3 space-y-2.5 border-b border-[#E5E5EA]">
                {/* Search */}
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#E5E5EA] px-3.5 h-11">
                    <Search className="w-4 h-4 text-[#AEAEB2] flex-shrink-0" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Search transactions…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 text-sm font-medium text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                    />
                    {search && (
                        <button onClick={() => setSearch('')}>
                            <X className="w-4 h-4 text-[#AEAEB2]" strokeWidth={2} />
                        </button>
                    )}
                </div>

                {/* Category chip strip + filter button */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-2 overflow-x-auto flex-1 pb-0.5 scrollbar-none">
                        {/* "All" chip */}
                        <button
                            onClick={() => setFilters((p) => ({ ...p, categories: new Set() }))}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${filters.categories.size === 0
                                ? 'bg-[#1D3D8F] text-white'
                                : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
                                }`}
                        >
                            All
                        </button>

                        {ALL_CATS.map((id) => {
                            const meta = CAT_META[id];
                            const active = filters.categories.has(id);
                            return (
                                <button
                                    key={id}
                                    onClick={() => setFilters((p) => {
                                        const next = new Set(p.categories);
                                        active ? next.delete(id) : next.add(id);
                                        return { ...p, categories: next };
                                    })}
                                    className={`flex-shrink-0 flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${active
                                        ? 'border-transparent text-white'
                                        : 'bg-white text-[#6C6C70] border-[#E5E5EA]'
                                        }`}
                                    style={active ? { backgroundColor: meta.color } : {}}
                                >
                                    <meta.icon className="w-3 h-3" strokeWidth={2} />
                                    {meta.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort/filter button */}
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
                        {filteredDays.reduce((s, d) => s + d.transactions.length, 0)} results
                    </p>
                    <p className="text-xs font-bold text-[#1D3D8F]">₱{totalFiltered.toLocaleString()} total</p>
                </div>
            )}

            {/* ── Feed ──────────────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
                {renderItems.length === 0 ? (
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

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-4" />

                {loadingMore && (
                    <div className="flex items-center justify-center py-5 gap-2">
                        <span className="w-4 h-4 border-2 border-[#D1D1D6] border-t-[#1D3D8F] rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-[#AEAEB2]">Loading more…</span>
                    </div>
                )}

                {!hasMore && renderItems.length > 0 && (
                    <p className="text-center text-[11px] text-[#AEAEB2] py-5">
                        You've reached the beginning of your history.
                    </p>
                )}
            </div>

            {/* ── Filter sheet ──────────────────────────────────────────────────── */}
            {sheetOpen && (
                <FilterSheet
                    filters={filters}
                    onChange={setFilters}
                    onClose={() => setSheetOpen(false)}
                />
            )}
        </div>
    );
}
