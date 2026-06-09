'use client'
import { Eye, TrendingUp } from 'lucide-react';

export default function BalanceCard() {
    return (
        <div className="bg-[#1D3D8F] rounded-3xl p-6 shadow-lg overflow-hidden relative">
            {/* Subtle geometric accent — a large soft circle, no blur, no glass */}
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/[0.06]" />
            <div className="absolute bottom-0 right-6 w-32 h-32 rounded-full bg-white/[0.04]" />

            <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-medium text-white/60 tracking-wide uppercase">Total Balance</p>
                    <button className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Hide</span>
                    </button>
                </div>

                {/* Balance */}
                <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-white/80">₱</span>
                        <span className="text-5xl font-bold text-white tracking-tight">38,450</span>
                        <span className="text-2xl font-semibold text-white/60">.80</span>
                    </div>
                </div>

                {/* Trend pill */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1.5 bg-white/[0.12] px-3 py-1.5 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5 text-[#34D399]" strokeWidth={2.5} />
                        <span className="text-xs font-semibold text-[#34D399]">+5.2%</span>
                    </div>
                    <span className="text-xs text-white/50">vs last month</span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/50 mb-0.5">Spent yesterday</p>
                            <p className="text-base font-semibold text-white">₱2,350.00</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-white/50 mb-0.5">Monthly limit</p>
                            <p className="text-base font-semibold text-white">₱15,000</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#60A5FA] to-[#34D399] rounded-full" style={{ width: '62%' }} />
                    </div>
                    <p className="text-[11px] text-white/40 mt-1.5">62% of monthly budget used</p>
                </div>
            </div>
        </div>
    );
}
