"use client"
export default function YesterdaySummary() {
    const categories = [
        { name: 'Food & Drink', amount: 980, color: '#F97316', percentage: 42 },
        { name: 'Transport', amount: 520, color: '#2563EB', percentage: 22 },
        { name: 'Shopping', amount: 650, color: '#8B5CF6', percentage: 28 },
        { name: 'Other', amount: 200, color: '#9CA3AF', percentage: 8 },
    ];

    const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0);
    const circumference = 2 * Math.PI * 38;

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E5E5EA]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#1C1C1E]">Yesterday</h3>
                <span className="text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] px-2.5 py-1 rounded-lg">
                    −12% vs avg
                </span>
            </div>

            <div className="flex items-center gap-5">
                {/* Donut chart */}
                <div className="relative flex-shrink-0 w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
                        <circle cx="42" cy="42" r="38" fill="none" stroke="#F2F2F7" strokeWidth="7" />
                        {categories.reduce<{ elements: React.ReactNode[]; offset: number }>(
                            (acc, category, index) => {
                                const length = circumference * (category.percentage / 100);
                                acc.elements.push(
                                    <circle
                                        key={category.name}
                                        cx="42"
                                        cy="42"
                                        r="38"
                                        fill="none"
                                        stroke={category.color}
                                        strokeWidth="7"
                                        strokeDasharray={`${length} ${circumference}`}
                                        strokeDashoffset={-acc.offset}
                                        strokeLinecap="butt"
                                        className="transition-all duration-700"
                                    />
                                );
                                acc.offset += length;
                                return acc;
                            },
                            { elements: [], offset: 0 }
                        ).elements}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-medium text-[#6C6C70]">Total</p>
                        <p className="text-base font-bold text-[#1C1C1E] leading-tight">₱{(totalSpent / 1000).toFixed(1)}k</p>
                    </div>
                </div>

                {/* Category list */}
                <div className="flex-1 space-y-2.5">
                    {categories.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                                <span className="text-xs font-medium text-[#6C6C70]">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#AEAEB2]">{category.percentage}%</span>
                                <span className="text-xs font-semibold text-[#1C1C1E]">₱{category.amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mini spend bars */}
            <div className="mt-4 pt-4 border-t border-[#F2F2F7]">
                <p className="text-[11px] font-medium text-[#AEAEB2] mb-3 uppercase tracking-wide">Breakdown</p>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-2.5">
                            <div className="flex-1 h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                />
                            </div>
                            <span className="text-[11px] font-medium text-[#6C6C70] w-8 text-right">{cat.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
