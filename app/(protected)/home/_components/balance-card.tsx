'use client'
import { Calendar, CalendarDays, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

function SpendPill({
    icon: Icon,
    label,
    spent,
    budget,
    accent,
}: {
    icon: React.ElementType;
    label: string;
    spent: number;
    budget: number;
    accent: string;
}) {
    const pct =
        budget > 0
            ? Math.min((spent / budget) * 100, 100)
            : 0;
    const remaining = budget - spent;
    const over = remaining < 0;

    return (
        <div className="flex-1 bg-white/[0.10] rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-white/50" strokeWidth={2} />
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-xl font-extrabold text-white tracking-tight leading-none">
                ₱{spent.toLocaleString()}
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
                of ₱{budget.toLocaleString()}
            </p>

            {/* Bar */}
            <div className="mt-2.5 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: over ? '#FCA5A5' : accent,
                    }}
                />
            </div>

            <p className={`text-[10px] font-semibold mt-1.5 ${over ? 'text-[#FCA5A5]' : 'text-white/60'}`}>
                {over
                    ? `₱${Math.abs(remaining).toLocaleString()} over`
                    : `₱${remaining.toLocaleString()} left`}
            </p>
        </div>
    );
}

export default function BalanceCard({ MONTHLY, WEEKLY }: { MONTHLY: { spent: number, budget: number }, WEEKLY: { spent: number, budget: number } }) {

    const [hidden, setHidden] = useState(false);

    return (
        <div className="bg-[#1D3D8F] rounded-3xl p-5 shadow-lg overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/[0.05]" />
            <div className="absolute bottom-0 right-6 w-32 h-32 rounded-full bg-white/[0.03]" />

            <div className="relative z-10 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wide mb-1">Total Balance</p>
                        {hidden ? (
                            <p className="text-4xl font-extrabold text-white/30 tracking-tight">••••••</p>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white/70">₱</span>
                                <span className="text-4xl font-extrabold text-white tracking-tight">38,450</span>
                                <span className="text-xl font-semibold text-white/50">.80</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setHidden((h) => !h)}
                        className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors mt-0.5"
                    >
                        {hidden
                            ? <Eye className="w-4 h-4 text-white/60" strokeWidth={2} />
                            : <EyeOff className="w-4 h-4 text-white/60" strokeWidth={2} />}
                    </button>
                </div>

                {/* Trend badge */}
                {/* <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                        <TrendIcon className="w-3 h-3" style={{ color: trendColor }} strokeWidth={2.5} />
                        <span className="text-[11px] font-bold" style={{ color: trendColor }}>
                            {monthTrending ? '+' : ''}{MONTHLY.trend}%
                        </span>
                    </div>
                    <span className="text-[11px] text-white/40">vs last month</span>
                </div> */}

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Monthly + Weekly spend pills */}
                <div className="flex gap-3">
                    <SpendPill
                        icon={Calendar}
                        label="This month"
                        spent={MONTHLY.spent}
                        budget={MONTHLY.budget}
                        accent="#60A5FA"
                    />
                    <SpendPill
                        icon={CalendarDays}
                        label="This week"
                        spent={WEEKLY.spent}
                        budget={WEEKLY.budget}
                        accent="#34D399"
                    />
                </div>
            </div>
        </div>
    );
}
