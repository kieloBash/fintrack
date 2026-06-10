'use client'
import { useCreateTransaction } from '@/hooks/mutations/useCreateTransaction';
import { useCategories } from '@/hooks/queries/useCategories';
import { useFrequentTransactions } from '@/hooks/queries/useFrequentTransactions';
import { useRecentTransactions } from '@/hooks/queries/useRecentTransactions';
import { getCategoryIcon } from '@/lib/icon-mapper';
import { format } from 'date-fns';
import {
    Car,
    Check,
    Coffee,
    Film,
    Heart,
    MoreHorizontal,
    Plus,
    Repeat,
    ShoppingBag, Smartphone,
    Trash2,
    Zap
} from 'lucide-react';
import { useState } from 'react';

// ─── Shared types ─────────────────────────────────────────────────────────────

interface Category {
    id: string;
    label: string;
    icon: React.ElementType;
    bg: string;
    color: string;
}

const CATEGORIES: Category[] = [
    { id: 'food', label: 'Food & Drink', icon: Coffee, bg: '#FEF3C7', color: '#D97706' },
    { id: 'transport', label: 'Transport', icon: Car, bg: '#DBEAFE', color: '#2563EB' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, bg: '#EDE9FE', color: '#7C3AED' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Smartphone, bg: '#D1FAE5', color: '#059669' },
    { id: 'utilities', label: 'Utilities', icon: Zap, bg: '#FEF9C3', color: '#CA8A04' },
    { id: 'health', label: 'Health', icon: Heart, bg: '#FFE4E6', color: '#E11D48' },
    { id: 'entertainment', label: 'Entertainment', icon: Film, bg: '#FCE7F3', color: '#DB2777' },
    { id: 'other', label: 'Other', icon: MoreHorizontal, bg: '#F3F4F6', color: '#6B7280' },
];

function getCat(id: string) { return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[7]; }

// ─── Small shared UI ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest px-1 mb-2">{children}</p>;
}

interface CategoryPickerProps {
    value: string;
    onChange: (id: string) => void;
}

function CategoryPicker({ value, onChange }: CategoryPickerProps) {
    const { data: categories, isLoading: isLoadingCategories } = useCategories();

    if (isLoadingCategories) {
        // TODO: add a loading
        return null;
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-1">
            {categories?.map((cat) => {
                const active = value === cat.id;
                const Icon = getCategoryIcon(cat.icon);

                return (
                    <button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 pt-3 pb-2.5 rounded-2xl border-2 transition-all ${active ? 'border-[#1D3D8F] bg-[#EEF2FB]' : 'border-transparent bg-[#F2F2F7] hover:bg-[#E8EDF8]'
                            }`}
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.bg }}>
                            <Icon className="w-4.5 h-4.5" style={{ color: cat.color }} strokeWidth={2} />
                        </div>
                        <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-[#1D3D8F]' : 'text-[#6C6C70]'}`}>
                            {cat.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── Quick Add ────────────────────────────────────────────────────────────────

interface ExpenseTemplate {
    id: string;
    label: string;
    category?: string;
    categoryId: string | null;
    amount: any;
    date?: string;
    count?: number;
}

interface QuickAddProps {
    onSaved: () => void;
}

function QuickAdd({ onSaved }: QuickAddProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [label, setLabel] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState('');
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<{ amount?: string; label?: string }>({});

    const onCreateTransaction = useCreateTransaction();
    const { data: recentTransactions, isLoading: isLoadingRecentTransactions } = useRecentTransactions();
    const { data: frequentTransactions, isLoading: isLoadingFrequentTransactions } = useFrequentTransactions();
    const { data: categories, isLoading: isLoadingCategories } = useCategories();

    function validate() {
        const e: typeof errors = {};
        if (!amount || isNaN(Number(amount.replace(/,/g, ''))) || Number(amount.replace(/,/g, '')) <= 0)
            e.amount = 'Enter a valid amount.';
        if (!label.trim()) e.label = 'Add a short label.';
        setErrors(e);
        return !e.amount && !e.label;
    }

    function handleSave() {
        if (!validate()) return;
        setSaved(true);
        onCreateTransaction.mutate({
            amount: Number(amount),
            categoryId: category,
            transactionDate: date,
            description: note,
            label: label,
            merchant: "",
            source: "MANUAL"
        })


        setTimeout(() => { setSaved(false); setAmount(''); setLabel(''); setNote(''); onSaved(); }, 800);
    }

    function applyTemplate(t: ExpenseTemplate) {
        setLabel(t.label);
        setCategory(t.categoryId);
        setAmount(t.amount);
        setErrors({});
        // scroll the amount input into view smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function getCategory(id: string | null) {
        return categories?.find((c) => c.id === id)
    }

    return (
        <div className="space-y-5">
            {/* Amount hero */}
            <div className="bg-[#1D3D8F] rounded-3xl px-6 py-7 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.06]" />
                <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wide">Amount spent</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white/70">₱</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9.]/g, '');
                            setAmount(v);
                        }}
                        className="flex-1 text-5xl font-extrabold text-white bg-transparent outline-none placeholder:text-white/30 tracking-tight min-w-0"
                    />
                </div>
                {errors.amount && <p className="text-xs text-[#FBBF24] mt-2">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div>
                <SectionLabel>Category</SectionLabel>
                <CategoryPicker value={category} onChange={setCategory} />
            </div>

            {/* Label + date row */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <SectionLabel>Label</SectionLabel>
                    <div className={`bg-white rounded-2xl border-2 px-3.5 py-3 transition-colors ${errors.label ? 'border-[#FF3B30]' : 'border-[#E5E5EA] focus-within:border-[#1D3D8F]'}`}>
                        <input
                            type="text"
                            placeholder="e.g. Lunch"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full text-sm font-semibold text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                        />
                    </div>
                    {errors.label && <p className="text-[11px] text-[#FF3B30] mt-1 px-1">{errors.label}</p>}
                </div>
                <div>
                    <SectionLabel>Date</SectionLabel>
                    <div className="bg-white rounded-2xl border-2 border-[#E5E5EA] focus-within:border-[#1D3D8F] px-3.5 py-3 transition-colors">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full text-sm font-semibold text-[#1C1C1E] bg-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Note */}
            <div>
                <SectionLabel>Note (optional)</SectionLabel>
                <div className="bg-white rounded-2xl border-2 border-[#E5E5EA] focus-within:border-[#1D3D8F] px-3.5 py-3 transition-colors">
                    <textarea
                        rows={2}
                        placeholder="Any extra details…"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full text-sm font-medium text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2] resize-none"
                    />
                </div>
            </div>

            {/* Frequent expenses */}
            <div>
                <SectionLabel>Frequent</SectionLabel>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {frequentTransactions?.map((t) => {
                        const cat = getCategory(t.categoryId);
                        const isSelected = label === t.label && category === t.categoryId;
                        const Icon = getCategoryIcon(cat!.icon);

                        return (
                            <button
                                key={`${t.label}-${t.categoryId}`}
                                onClick={() => applyTemplate(t)}
                                className={`flex-shrink-0 flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-2xl border-2 transition-all ${isSelected
                                    ? 'border-[#1D3D8F] bg-[#EEF2FB]'
                                    : 'border-[#E5E5EA] bg-white hover:border-[#1D3D8F]/40 hover:bg-[#F5F7FF]'
                                    }`}
                            >
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat!.bg }}>
                                    <Icon className="w-3.5 h-3.5" style={{ color: cat!.color }} strokeWidth={2} />
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#1D3D8F]' : 'text-[#1C1C1E]'}`}>{t.label}</p>
                                    <p className="text-[10px] text-[#AEAEB2] leading-tight">₱{Number(t.amount).toFixed(2)} · {t.count}×</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent expenses */}
            <div>
                <SectionLabel>Recent</SectionLabel>
                <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
                    {recentTransactions?.map((t, i) => {
                        const cat = getCategory(t.categoryId);
                        const isSelected = label === t.label && category === t.categoryId;
                        const Icon = getCategoryIcon(cat!.icon);

                        return (
                            <button
                                key={t.id}
                                onClick={() => applyTemplate(t)}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${i < recentTransactions.length - 1 ? 'border-b border-[#F2F2F7]' : ''
                                    } ${isSelected ? 'bg-[#EEF2FB]' : 'hover:bg-[#F9F9FB]'}`}
                            >
                                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat!.bg }}>
                                    <Icon className="w-4 h-4" style={{ color: cat!.color }} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#1D3D8F]' : 'text-[#1C1C1E]'}`}>{t.label}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[11px] text-[#AEAEB2]">{cat!.label}</span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-[#AEAEB2]" />
                                        <span className="text-[11px] text-[#AEAEB2]">{format(t.transactionDate, "MM/dd/yyyy")}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-sm font-bold ${isSelected ? 'text-[#1D3D8F]' : 'text-[#1C1C1E]'}`}>₱{Number(t.amount).toFixed(2)}</span>
                                    {isSelected && <Check className="w-4 h-4 text-[#1D3D8F]" strokeWidth={2.5} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <p className="text-[11px] text-[#AEAEB2] mt-2 px-1">Tap any expense to pre-fill the form above.</p>
            </div>

            {/* Save */}
            <button
                onClick={handleSave}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all shadow-sm ${saved ? 'bg-[#34D399] text-white' : 'bg-[#1D3D8F] text-white hover:bg-[#163074]'
                    }`}
            >
                {saved ? (
                    <><Check className="w-4 h-4" strokeWidth={2.5} /> Saved!</>
                ) : (
                    'Save Expense'
                )}
            </button>
        </div>
    );
}

// ─── Recurring Expenses ───────────────────────────────────────────────────────

interface RecurringExpense {
    id: number;
    label: string;
    category: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    active: boolean;
}

let recurringNextId = 3;

const FREQ_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
] as const;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface RecurringFormProps {
    onAdd: (item: Omit<RecurringExpense, 'id' | 'active'>) => void;
    onCancel: () => void;
}

function RecurringForm({ onAdd, onCancel }: RecurringFormProps) {
    const [label, setLabel] = useState('');
    const [category, setCategory] = useState('transport');
    const [amount, setAmount] = useState('');
    const [freq, setFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [day, setDay] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleAdd() {
        const e: Record<string, string> = {};
        if (!label.trim()) e.label = 'Required';
        if (!amount || Number(amount) <= 0) e.amount = 'Required';
        setErrors(e);
        if (Object.keys(e).length) return;
        onAdd({
            label: label.trim(),
            category,
            amount: Number(amount),
            frequency: freq,
            dayOfWeek: freq === 'weekly' ? day : undefined,
            dayOfMonth: freq === 'monthly' ? day : undefined,
        });
    }

    return (
        <div className="bg-[#EEF2FB] rounded-3xl p-4 border-2 border-[#1D3D8F]/20 space-y-4 mt-2">
            <p className="text-sm font-bold text-[#1D3D8F]">New recurring expense</p>

            <CategoryPicker value={category} onChange={setCategory} />

            <div className="grid grid-cols-2 gap-2.5">
                <div>
                    <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1">Label</p>
                    <input
                        type="text"
                        placeholder="Van fare"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className={`w-full bg-white rounded-xl border-2 px-3 py-2.5 text-sm font-semibold text-[#1C1C1E] outline-none placeholder:text-[#AEAEB2] ${errors.label ? 'border-[#FF3B30]' : 'border-[#E5E5EA] focus:border-[#1D3D8F]'}`}
                    />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1">Amount (₱)</p>
                    <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`w-full bg-white rounded-xl border-2 px-3 py-2.5 text-sm font-semibold text-[#1C1C1E] outline-none placeholder:text-[#AEAEB2] ${errors.amount ? 'border-[#FF3B30]' : 'border-[#E5E5EA] focus:border-[#1D3D8F]'}`}
                    />
                </div>
            </div>

            {/* Frequency */}
            <div>
                <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1.5">Repeats</p>
                <div className="flex gap-2">
                    {FREQ_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setFreq(opt.value); setDay(opt.value === 'monthly' ? 1 : 1); }}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${freq === opt.value ? 'bg-[#1D3D8F] text-white' : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Day picker */}
            {freq === 'weekly' && (
                <div>
                    <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1.5">Day of week</p>
                    <div className="flex gap-1.5">
                        {DAYS.map((d, i) => (
                            <button
                                key={d}
                                onClick={() => setDay(i)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-colors ${day === i ? 'bg-[#1D3D8F] text-white' : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {freq === 'monthly' && (
                <div>
                    <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1.5">Day of month</p>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                            <button
                                key={d}
                                onClick={() => setDay(d)}
                                className={`aspect-square rounded-lg text-[11px] font-bold transition-colors ${day === d ? 'bg-[#1D3D8F] text-white' : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 pt-1">
                <button onClick={handleAdd} className="flex-1 bg-[#1D3D8F] text-white text-sm font-bold py-3 rounded-2xl hover:bg-[#163074] transition-colors">
                    Add
                </button>
                <button onClick={onCancel} className="px-5 bg-white text-[#6C6C70] text-sm font-bold py-3 rounded-2xl border border-[#E5E5EA] hover:bg-[#F2F2F7] transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    );
}

function FreqBadge({ item }: { item: RecurringExpense }) {
    const text =
        item.frequency === 'daily' ? 'Every day'
            : item.frequency === 'weekly' ? `Every ${DAYS[item.dayOfWeek ?? 0]}`
                : `Monthly · ${item.dayOfMonth}${['th', 'st', 'nd', 'rd'][(item.dayOfMonth ?? 1) % 10 > 3 ? 0 : (item.dayOfMonth ?? 1) % 10]}`;
    return (
        <span className="text-[11px] font-medium text-[#AEAEB2]">{text}</span>
    );
}

function RecurringTab() {
    const [items, setItems] = useState<RecurringExpense[]>([
        { id: 1, label: 'Van Transport', category: 'transport', amount: 40, frequency: 'daily', active: true },
        { id: 2, label: 'Daily Commute (MRT)', category: 'transport', amount: 80, frequency: 'daily', active: true },
    ]);
    const [adding, setAdding] = useState(false);

    function handleAdd(data: Omit<RecurringExpense, 'id' | 'active'>) {
        setItems((prev) => [...prev, { ...data, id: recurringNextId++, active: true }]);
        setAdding(false);
    }

    function toggle(id: number) {
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, active: !i.active } : i));
    }

    function remove(id: number) {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }

    const monthlyTotal = items
        .filter((i) => i.active)
        .reduce((sum, i) => {
            if (i.frequency === 'daily') return sum + i.amount * 30;
            if (i.frequency === 'weekly') return sum + i.amount * 4.3;
            return sum + i.amount;
        }, 0);

    return (
        <div className="space-y-4">
            {/* Summary pill */}
            <div className="bg-[#1D3D8F] rounded-2xl px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Repeat className="w-4 h-4 text-white/60" strokeWidth={2} />
                    <span className="text-sm font-semibold text-white/80">Estimated monthly total</span>
                </div>
                <span className="text-base font-extrabold text-white">₱{monthlyTotal.toFixed(0)}</span>
            </div>

            <SectionLabel>Active recurring expenses</SectionLabel>
            <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
                {items.length === 0 && (
                    <p className="text-sm text-[#AEAEB2] text-center py-8">No recurring expenses yet.</p>
                )}
                {items.map((item, i) => {
                    const cat = getCat(item.category);
                    return (
                        <div key={item.id} className={`flex items-center gap-3.5 px-4 py-3.5 ${i < items.length - 1 ? 'border-b border-[#F2F2F7]' : ''}`}>
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.bg }}>
                                <cat.icon className="w-4.5 h-4.5" style={{ color: cat.color }} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#1C1C1E] truncate">{item.label}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <FreqBadge item={item} />
                                    <span className="w-0.5 h-0.5 rounded-full bg-[#AEAEB2]" />
                                    <span className="text-[11px] font-semibold text-[#1C1C1E]">₱{item.amount}</span>
                                </div>
                            </div>
                            {/* Toggle */}
                            <button
                                onClick={() => toggle(item.id)}
                                className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${item.active ? 'bg-[#1D3D8F]' : 'bg-[#D1D1D6]'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${item.active ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-xl bg-[#F2F2F7] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors group flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5 text-[#AEAEB2] group-hover:text-[#DC2626] transition-colors" strokeWidth={2} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {adding ? (
                <RecurringForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-[#D1D1D6] rounded-3xl py-4 text-sm font-semibold text-[#6C6C70] hover:border-[#1D3D8F] hover:text-[#1D3D8F] hover:bg-[#EEF2FB] transition-all"
                >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Add recurring expense
                </button>
            )}
        </div>
    );
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

interface Subscription {
    id: number;
    name: string;
    amount: number;
    billingDay: number;
    active: boolean;
    color: string;
    icon: string;
}

let subNextId = 5;

const SUB_COLORS = ['#2563EB', '#7C3AED', '#059669', '#DB2777', '#D97706', '#DC2626'];
const SUB_EMOJIS = ['📱', '🎵', '🎬', '☁️', '📰', '🎮', '💼', '🏋️'];

interface SubFormProps {
    onAdd: (s: Omit<Subscription, 'id' | 'active'>) => void;
    onCancel: () => void;
}

function SubForm({ onAdd, onCancel }: SubFormProps) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [day, setDay] = useState(1);
    const [color, setColor] = useState(SUB_COLORS[0]);
    const [emoji, setEmoji] = useState(SUB_EMOJIS[0]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleAdd() {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Required';
        if (!amount || Number(amount) <= 0) e.amount = 'Required';
        setErrors(e);
        if (Object.keys(e).length) return;
        onAdd({ name: name.trim(), amount: Number(amount), billingDay: day, color, icon: emoji });
    }

    return (
        <div className="bg-[#EEF2FB] rounded-3xl p-4 border-2 border-[#1D3D8F]/20 space-y-4 mt-2">
            <p className="text-sm font-bold text-[#1D3D8F]">New subscription</p>

            {/* Emoji row */}
            <div>
                <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1.5">Icon</p>
                <div className="flex gap-2">
                    {SUB_EMOJIS.map((e) => (
                        <button key={e} onClick={() => setEmoji(e)}
                            className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-colors ${emoji === e ? 'bg-[#1D3D8F] text-white' : 'bg-white border border-[#E5E5EA]'}`}>
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div>
                    <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1">Name</p>
                    <input type="text" placeholder="Netflix" value={name} onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-white rounded-xl border-2 px-3 py-2.5 text-sm font-semibold text-[#1C1C1E] outline-none placeholder:text-[#AEAEB2] ${errors.name ? 'border-[#FF3B30]' : 'border-[#E5E5EA] focus:border-[#1D3D8F]'}`} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1">Monthly (₱)</p>
                    <input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                        className={`w-full bg-white rounded-xl border-2 px-3 py-2.5 text-sm font-semibold text-[#1C1C1E] outline-none placeholder:text-[#AEAEB2] ${errors.amount ? 'border-[#FF3B30]' : 'border-[#E5E5EA] focus:border-[#1D3D8F]'}`} />
                </div>
            </div>

            <div>
                <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1.5">Billing day of month</p>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <button key={d} onClick={() => setDay(d)}
                            className={`aspect-square rounded-lg text-[11px] font-bold transition-colors ${day === d ? 'bg-[#1D3D8F] text-white' : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'}`}>
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div>
                <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1.5">Color</p>
                <div className="flex gap-2">
                    {SUB_COLORS.map((c) => (
                        <button key={c} onClick={() => setColor(c)}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            style={{ backgroundColor: c }}>
                            {color === c && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={handleAdd} className="flex-1 bg-[#1D3D8F] text-white text-sm font-bold py-3 rounded-2xl hover:bg-[#163074] transition-colors">Add</button>
                <button onClick={onCancel} className="px-5 bg-white text-[#6C6C70] text-sm font-bold py-3 rounded-2xl border border-[#E5E5EA] hover:bg-[#F2F2F7] transition-colors">Cancel</button>
            </div>
        </div>
    );
}

function SubscriptionsTab() {
    const [subs, setSubs] = useState<Subscription[]>([
        { id: 1, name: 'Netflix', amount: 549, billingDay: 15, active: true, color: '#DC2626', icon: '🎬' },
        { id: 2, name: 'Spotify', amount: 149, billingDay: 1, active: true, color: '#059669', icon: '🎵' },
        { id: 3, name: 'iCloud+', amount: 109, billingDay: 8, active: true, color: '#2563EB', icon: '☁️' },
        { id: 4, name: 'YouTube Premium', amount: 199, billingDay: 22, active: false, color: '#DB2777', icon: '📱' },
    ]);
    const [adding, setAdding] = useState(false);

    function toggle(id: number) { setSubs((p) => p.map((s) => s.id === id ? { ...s, active: !s.active } : s)); }
    function remove(id: number) { setSubs((p) => p.filter((s) => s.id !== id)); }
    function handleAdd(data: Omit<Subscription, 'id' | 'active'>) {
        setSubs((p) => [...p, { ...data, id: subNextId++, active: true }]);
        setAdding(false);
    }

    const totalActive = subs.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0);

    const today = new Date().getDate();
    const upcoming = subs
        .filter((s) => s.active)
        .map((s) => ({ ...s, daysUntil: ((s.billingDay - today + 31) % 31) || 31 }))
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 2);

    const ordinal = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][(n % 10 > 3 || Math.floor(n / 10) === 1) ? 0 : n % 10]}`;

    return (
        <div className="space-y-4">
            {/* Total */}
            <div className="bg-[#1D3D8F] rounded-2xl px-4 py-3.5 flex items-center justify-between">
                <div>
                    <p className="text-xs text-white/60 font-medium">Active subscriptions</p>
                    <p className="text-base font-extrabold text-white mt-0.5">₱{totalActive}/mo</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-white/60 font-medium">Next charge</p>
                    <p className="text-sm font-bold text-white mt-0.5">{upcoming[0] ? `${upcoming[0].name} in ${upcoming[0].daysUntil}d` : '—'}</p>
                </div>
            </div>

            {/* Upcoming */}
            {upcoming.length > 0 && (
                <div>
                    <SectionLabel>Upcoming this month</SectionLabel>
                    <div className="flex gap-3">
                        {upcoming.map((s) => (
                            <div key={s.id} className="flex-1 bg-white rounded-2xl border border-[#E5E5EA] p-3.5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{s.icon}</span>
                                    <span className="text-xs font-bold text-[#1C1C1E] truncate">{s.name}</span>
                                </div>
                                <p className="text-base font-extrabold text-[#1C1C1E]">₱{s.amount}</p>
                                <p className="text-[11px] text-[#AEAEB2] mt-0.5">
                                    {s.daysUntil === 1 ? 'Tomorrow' : s.daysUntil <= 3 ? `In ${s.daysUntil} days` : `${ordinal(s.billingDay)} of month`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* List */}
            <SectionLabel>All subscriptions</SectionLabel>
            <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
                {subs.length === 0 && (
                    <p className="text-sm text-[#AEAEB2] text-center py-8">No subscriptions yet.</p>
                )}
                {subs.map((sub, i) => (
                    <div key={sub.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < subs.length - 1 ? 'border-b border-[#F2F2F7]' : ''}`}>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                            style={{ backgroundColor: sub.color + '22' }}>
                            {sub.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${sub.active ? 'text-[#1C1C1E]' : 'text-[#AEAEB2]'}`}>{sub.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-semibold text-[#1C1C1E]">₱{sub.amount}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-[#AEAEB2]" />
                                <span className="text-[11px] text-[#AEAEB2]">Every {ordinal(sub.billingDay)}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => toggle(sub.id)}
                            className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${sub.active ? 'bg-[#1D3D8F]' : 'bg-[#D1D1D6]'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${sub.active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                        <button onClick={() => remove(sub.id)} className="w-8 h-8 rounded-xl bg-[#F2F2F7] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors group flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5 text-[#AEAEB2] group-hover:text-[#DC2626] transition-colors" strokeWidth={2} />
                        </button>
                    </div>
                ))}
            </div>

            {adding ? (
                <SubForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-[#D1D1D6] rounded-3xl py-4 text-sm font-semibold text-[#6C6C70] hover:border-[#1D3D8F] hover:text-[#1D3D8F] hover:bg-[#EEF2FB] transition-all"
                >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Add subscription
                </button>
            )}
        </div>
    );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

type Tab = 'quick' | 'recurring' | 'subscriptions';

const TABS: { id: Tab; label: string }[] = [
    { id: 'quick', label: 'Quick Add' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'subscriptions', label: 'Subscriptions' },
];

export default function AddExpensePage() {
    const [tab, setTab] = useState<Tab>('quick');

    return (
        <div className="px-4 pt-2 pb-6 space-y-5">
            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-1 flex gap-1 shadow-sm">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-[#1D3D8F] text-white shadow-sm' : 'text-[#6C6C70] hover:text-[#1C1C1E]'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'quick' && <QuickAdd onSaved={() => { }} />}
            {tab === 'recurring' && <RecurringTab />}
            {tab === 'subscriptions' && <SubscriptionsTab />}
        </div>
    );
}
