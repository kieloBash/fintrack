'use client'
import { useBudgetSummary } from '@/hooks/queries/useBudgetSummary';
import { getCategoryIcon } from '@/lib/icon-mapper';
import { CategoryBudget, UnbudgetedTransaction } from '@/services/budget-category.service';
import { Car, ChevronRight, CircleHelp, Coffee, Film, Heart, MoreHorizontal, ShoppingBag, Smartphone, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const CATEGORY_BUDGETS: CategoryBudget[] = [
    { id: 'food', label: 'Food & Drink', icon: Coffee, bg: '#FEF3C7', color: '#D97706', spent: 3240, budget: 4000 },
    { id: 'transport', label: 'Transport', icon: Car, bg: '#DBEAFE', color: '#2563EB', spent: 1800, budget: 2000 },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, bg: '#EDE9FE', color: '#7C3AED', spent: 2700, budget: 2500 },
    { id: 'subscriptions', label: 'Subscriptions', icon: Smartphone, bg: '#D1FAE5', color: '#059669', spent: 997, budget: 1000 },
    { id: 'utilities', label: 'Utilities', icon: Zap, bg: '#FEF9C3', color: '#CA8A04', spent: 420, budget: 1500 },
    { id: 'health', label: 'Health', icon: Heart, bg: '#FFE4E6', color: '#E11D48', spent: 0, budget: 800 },
    { id: 'entertainment', label: 'Entertainment', icon: Film, bg: '#FCE7F3', color: '#DB2777', spent: 149, budget: 500 },
    { id: 'other', label: 'Other', icon: MoreHorizontal, bg: '#F3F4F6', color: '#6B7280', spent: 0, budget: 700 },
];

// Transactions that came in from email but don't map to any budget category
const UNBUDGETED: UnbudgetedTransaction[] = [
    { id: 1, label: 'Apple Store', amount: 5499, categoryGuess: 'Electronics' },
    { id: 2, label: 'National Book Store', amount: 340, categoryGuess: 'Education' },
    { id: 3, label: 'Lazada', amount: 1280, categoryGuess: 'Online shopping' },
    { id: 4, label: 'Jollibee', amount: 195, categoryGuess: 'Food & Drink' },
];

function pct(spent: number, budget: number) {
    return Math.min((spent / budget) * 100, 100);
}

function barColor(spent: number, budget: number): string | undefined {
    const p = spent / budget;
    if (p >= 1) return '#EF4444';
    if (p >= 0.8) return '#F97316';
    return undefined;
}

function StatusBadge({ spent, budget }: { spent: number; budget: number }) {
    const remaining = budget - spent;
    const over = remaining < 0;
    const p = spent / budget;

    if (over) return (
        <span className="text-[10px] font-bold text-[#EF4444]">
            ₱{Math.abs(remaining).toLocaleString()} over
        </span>
    );
    if (p >= 0.8) return (
        <span className="text-[10px] font-bold text-[#F97316]">
            ₱{remaining.toLocaleString()} left
        </span>
    );
    return (
        <span className="text-[10px] font-semibold text-[#AEAEB2]">
            ₱{remaining.toLocaleString()} left
        </span>
    );
}

export default function YesterdaySummary({ MONTHLY, WEEKLY }: { MONTHLY: { spent: number, budget: number }, WEEKLY: { spent: number, budget: number } }) {
    const { data } = useBudgetSummary();
    const [expanded, setExpanded] = useState(false);
    const [unbudgetedOpen, setUnbudgetedOpen] = useState(false);

    const budgetedSpend = (data?.categoryBudgets ?? []).reduce((s, c) => s + c.spent, 0);
    const totalBudget = MONTHLY.budget
    const unbudgetedSpend = (data?.unbudgetedTransactions ?? []).reduce((s, t) => s + t.amount, 0);
    const totalSpent = budgetedSpend + unbudgetedSpend;
    const overCount = (data?.categoryBudgets ?? []).filter((c) => c.spent > c.budget).length;

    const visible = expanded ? data?.categoryBudgets ?? [] : (data?.categoryBudgets ?? []).slice(0, 4);

    return (
        <div className="space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-[#1C1C1E]">Category Budgets</h3>
                {overCount > 0 && (
                    <span className="text-[11px] font-bold bg-[#FEE2E2] text-[#DC2626] px-2.5 py-1 rounded-lg">
                        {overCount} over limit
                    </span>
                )}
            </div>

            {/* ── Overall summary card ─────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm px-5 py-4">
                <div className="flex items-end justify-between mb-2.5">
                    <div>
                        <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wide mb-0.5">
                            Total spent this month
                        </p>
                        <p className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">
                            ₱{totalSpent.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] text-[#AEAEB2] mb-0.5">budget ₱{totalBudget.toLocaleString()}</p>
                        <p className={`text-sm font-bold ${budgetedSpend + unbudgetedSpend > totalBudget ? 'text-[#EF4444]' : 'text-[#6C6C70]'}`}>
                            {Math.round(pct(budgetedSpend + unbudgetedSpend, totalBudget))}% used
                        </p>
                    </div>
                </div>

                {/* Segmented bar — budgeted categories + unbudgeted stripe */}
                <div className="h-2.5 bg-[#F2F2F7] rounded-full overflow-hidden flex">
                    {data?.categoryBudgets?.filter((c) => c.spent > 0).map((c) => (
                        <div
                            key={c.id}
                            className="h-full transition-all duration-700"
                            style={{
                                width: `${(c.spent / totalSpent) * 100}%`,
                                backgroundColor: barColor(c.spent, c.budget) ?? c.color,
                            }}
                        />
                    ))}
                    {/* Unbudgeted segment — always last, hatched gray */}
                    {unbudgetedSpend > 0 && (
                        <div
                            className="h-full flex-shrink-0"
                            style={{
                                width: `${(unbudgetedSpend / totalSpent) * 100}%`,
                                backgroundImage: 'repeating-linear-gradient(45deg, #9CA3AF 0px, #9CA3AF 2px, #D1D5DB 2px, #D1D5DB 6px)',
                            }}
                        />
                    )}
                </div>

                {/* Legend row */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#6B7280]" />
                        <span className="text-[10px] text-[#AEAEB2]">Budgeted ₱{budgetedSpend.toLocaleString()}</span>
                    </div>
                    {unbudgetedSpend > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-2 rounded-sm flex-shrink-0"
                                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #9CA3AF 0px, #9CA3AF 2px, #D1D5DB 2px, #D1D5DB 6px)' }}
                            />
                            <span className="text-[10px] text-[#AEAEB2]">Unbudgeted ₱{unbudgetedSpend.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Per-category rows ────────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
                {visible.map((cat, i) => {
                    const p = pct(cat.spent, cat.budget);
                    const fill = barColor(cat.spent, cat.budget) ?? cat.color;
                    const over = cat.spent > cat.budget;
                    const isLast = i === visible.length - 1;
                    const Icon = getCategoryIcon(cat.icon as any);

                    return (
                        <div key={cat.id} className={`px-4 py-3.5 ${!isLast ? 'border-b border-[#F2F2F7]' : ''}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: cat.bg }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: cat.color }} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-sm font-semibold text-[#1C1C1E] truncate">{cat.label}</p>
                                        <p className={`text-sm font-bold flex-shrink-0 ml-2 ${over ? 'text-[#EF4444]' : 'text-[#1C1C1E]'}`}>
                                            ₱{cat.spent.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <StatusBadge spent={cat.spent} budget={cat.budget} />
                                        <span className="text-[10px] text-[#AEAEB2]">/ ₱{cat.budget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden ml-12">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${p}%`, backgroundColor: fill }}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Show more / less toggle */}
                {(data?.categoryBudgets ?? []).length > 4 && (
                    <button
                        onClick={() => setExpanded((e) => !e)}
                        className="w-full flex items-center justify-center gap-1.5 py-3.5 border-t border-[#F2F2F7] hover:bg-[#F9F9FB] transition-colors"
                    >
                        <span className="text-xs font-bold text-[#1D3D8F]">
                            {expanded ? 'Show less' : `Show ${(data?.categoryBudgets ?? []).length - 4} more`}
                        </span>
                        <ChevronRight
                            className="w-3.5 h-3.5 text-[#1D3D8F] transition-transform duration-200"
                            style={{ transform: expanded ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                            strokeWidth={2.5}
                        />
                    </button>
                )}
            </div>

            {/* ── Unbudgeted transactions ──────────────────────────────────────── */}
            {(data?.unbudgetedTransactions ?? []).length > 0 && (
                <div>
                    <button
                        onClick={() => setUnbudgetedOpen((o) => !o)}
                        className="w-full flex items-center justify-between px-1 mb-2 group"
                    >
                        <div className="flex items-center gap-2">
                            <CircleHelp className="w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
                            <span className="text-sm font-bold text-[#3A3A3C]">Unbudgeted</span>
                            <span className="text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-md">
                                {(data?.unbudgetedTransactions ?? []).length} transactions
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#3A3A3C]">₱{unbudgetedSpend.toLocaleString()}</span>
                            <ChevronRight
                                className="w-3.5 h-3.5 text-[#AEAEB2] transition-transform duration-200"
                                style={{ transform: unbudgetedOpen ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                                strokeWidth={2.5}
                            />
                        </div>
                    </button>

                    {/* Explanation pill */}
                    {!unbudgetedOpen && (
                        <div className="flex items-start gap-2 bg-[#FAFAFA] border border-dashed border-[#D1D5DB] rounded-2xl px-4 py-3">
                            <CircleHelp className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <p className="text-[11px] text-[#6B7280] leading-relaxed">
                                These transactions were read from your email but don't match any budget category you've set. Consider adding a budget for them.
                            </p>
                        </div>
                    )}

                    {unbudgetedOpen && (
                        <div className="bg-white rounded-3xl border border-dashed border-[#D1D5DB] shadow-sm overflow-hidden">
                            {(data?.unbudgetedTransactions ?? []).map((tx, i) => (
                                <div
                                    key={tx.id}
                                    className={`flex items-center gap-3 px-4 py-3.5 ${i < UNBUDGETED.length - 1 ? 'border-b border-[#F2F2F7]' : ''}`}
                                >
                                    {/* Placeholder icon */}
                                    <div className="w-9 h-9 rounded-2xl bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                                        <CircleHelp className="w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1C1C1E] truncate">{tx.label}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-medium text-[#AEAEB2]">Likely: {tx.categoryGuess}</span>
                                            <span className="text-[10px] font-semibold bg-[#FEF9C3] text-[#92400E] px-1.5 py-0.5 rounded-md">No budget</span>
                                        </div>
                                    </div>

                                    <p className="text-sm font-bold text-[#6B7280] flex-shrink-0">
                                        ₱{tx.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}

                            {/* CTA footer */}
                            <div className="px-4 py-3.5 border-t border-[#F2F2F7] bg-[#FAFAFA] flex items-center justify-between">
                                <p className="text-[11px] text-[#6B7280]">Set budgets for these in Settings</p>
                                <Link href={"/settings"}>
                                    <button className="text-xs font-bold text-[#1D3D8F] hover:text-[#163074] transition-colors">
                                        Go to Settings →
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
