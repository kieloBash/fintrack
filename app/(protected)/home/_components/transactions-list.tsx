"use client"
import { useCategories } from '@/hooks/queries/useCategories';
import { useRecentTransactions } from '@/hooks/queries/useRecentTransactions';
import { getCategoryIcon } from '@/lib/icon-mapper';
import { toPriceFormat } from '@/lib/number.format';
import { getTimeAgo } from '@/lib/time.format';
import { Car, Coffee, Music, ShoppingBag, Smartphone, Utensils } from 'lucide-react';

const transactions = [
    { id: 1, merchant: 'Starbucks', category: 'Food & Drink', amount: -245, time: '2h ago', icon: Coffee, bg: '#FEF3C7', color: '#D97706' },
    { id: 2, merchant: 'Grab', category: 'Transport', amount: -380, time: '4h ago', icon: Car, bg: '#DBEAFE', color: '#2563EB' },
    { id: 3, merchant: 'Spotify', category: 'Subscription', amount: -149, time: 'Yesterday', icon: Music, bg: '#D1FAE5', color: '#059669' },
    { id: 4, merchant: 'Zara', category: 'Shopping', amount: -1850, time: 'Yesterday', icon: ShoppingBag, bg: '#EDE9FE', color: '#7C3AED' },
    { id: 5, merchant: "McDonald's", category: 'Food & Drink', amount: -285, time: 'Yesterday', icon: Utensils, bg: '#FEE2E2', color: '#DC2626' },
    { id: 6, merchant: 'Apple Store', category: 'Electronics', amount: -5499, time: '2 days ago', icon: Smartphone, bg: '#E0E7FF', color: '#4338CA' },
];

export default function TransactionsList() {
    const { data: recentTransactions } = useRecentTransactions();
    const { data: categories } = useCategories();

    function getCategory(id: string | null) {
        return categories?.find((c) => c.id === id)
    }


    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-[#1C1C1E]">Recent</h3>
                <button className="text-xs font-semibold text-[#1D3D8F] hover:text-[#163074] transition-colors">
                    View All
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
                {(recentTransactions ?? []).map((tx, i) => {
                    const cat = getCategory(tx.categoryId);
                    const Icon = getCategoryIcon(cat!.icon);
                    return (
                        <div
                            key={tx.id}
                            className={`flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#F9F9FB] transition-colors ${i < transactions.length - 1 ? 'border-b border-[#F2F2F7]' : ''
                                }`}
                        >
                            {/* Icon */}
                            <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: cat!.bg }}
                            >
                                <Icon className="w-4.5 h-4.5" style={{ color: cat!.color }} strokeWidth={2} />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#1C1C1E] truncate">{tx.label}</p>
                                <p className="text-xs text-[#AEAEB2] truncate">{tx.description}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[11px] font-medium text-[#AEAEB2]">{cat?.label}</span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-[#AEAEB2]" />
                                    <span className="text-[11px] text-[#AEAEB2]">{getTimeAgo(tx.transactionDate)}</span>
                                </div>
                            </div>

                            {/* Amount */}
                            <p className="text-sm font-semibold text-[#FF3B30] flex-shrink-0">
                                −₱{toPriceFormat(Number(tx.amount))}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
