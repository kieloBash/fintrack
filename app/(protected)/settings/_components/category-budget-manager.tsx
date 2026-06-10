"use client"

import { useCreateBudgetCategory } from "@/hooks/mutations/useCreateBudgetCategory";
import { useDeleteBudgetCategory } from "@/hooks/mutations/useDeleteBudgetCategory";
import { useUpdateBudgetCategory } from "@/hooks/mutations/useUpdateBudgetCategory";
import { useCategories } from "@/hooks/queries/useCategories";
import { useUserBudgets } from "@/hooks/queries/useUserBudgets";
import { getCategoryIcon } from "@/lib/icon-mapper";
import { CategoryBudget } from "@/services/user.service";
import { Check, Edit3, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

// const BUDGET_CATEGORIES = [
//     { id: 'food', label: 'Food & Drink', icon: Coffee, bg: '#FEF3C7', color: '#D97706' },
//     { id: 'transport', label: 'Transport', icon: Car, bg: '#DBEAFE', color: '#2563EB' },
//     { id: 'shopping', label: 'Shopping', icon: ShoppingBag, bg: '#EDE9FE', color: '#7C3AED' },
//     { id: 'subscriptions', label: 'Subscriptions', icon: Smartphone, bg: '#D1FAE5', color: '#059669' },
//     { id: 'utilities', label: 'Utilities', icon: Zap, bg: '#FEF9C3', color: '#CA8A04' },
//     { id: 'health', label: 'Health', icon: Heart, bg: '#FFE4E6', color: '#E11D48' },
//     { id: 'entertainment', label: 'Entertainment', icon: Film, bg: '#FCE7F3', color: '#DB2777' },
//     { id: 'other', label: 'Other', icon: MoreHorizontal, bg: '#F3F4F6', color: '#6B7280' },
// ] as const;

// type CategoryId = typeof BUDGET_CATEGORIES[number]['id'];

// interface CategoryBudget {
//     id: number;
//     categoryId: CategoryId;
//     amount: string;
// }

// let catBudgetNextId = 1;


export default function CategoryBudgetManager() {
    const [adding, setAdding] = useState(false);
    const [selectedCat, setSelectedCat] = useState<string>("");
    const [amountDraft, setAmountDraft] = useState('');
    const [amountError, setAmountError] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<string | null>(null);
    const amountRef = useRef<HTMLInputElement>(null);

    const { data: budgets, isLoading: isLoadingBudgets } = useUserBudgets();
    const { data: categories, isLoading: isLoadingCategories } = useCategories();
    const usedCategoryIds = new Set(budgets?.map((b) => b.categoryId));
    const availableCategories = categories?.filter((c) => !usedCategoryIds.has(c.id)) ?? [];

    const mutateCreateBudgetCategory = useCreateBudgetCategory()
    const mutateUpdateBudgetCategory = useUpdateBudgetCategory()
    const mutateDeleteBudgetCategory = useDeleteBudgetCategory()

    function openAdd() {
        const first = availableCategories[0];
        if (!first) return;
        setSelectedCat(first.id);
        setAmountDraft('');
        setAmountError('');
        setAdding(true);
        setTimeout(() => amountRef.current?.focus(), 0);
    }

    function handleConfirmAdd() {
        const num = Number(amountDraft.replace(/,/g, ''));
        if (!amountDraft || isNaN(num) || num <= 0) {
            setAmountError('Enter a valid amount.');
            return;
        }

        mutateCreateBudgetCategory.mutate({
            categoryId: selectedCat,
            amount: num
        })
        setAdding(false);
        setAmountDraft('');
        setAmountError('');
    }

    function handleDelete(id: string) {
        mutateDeleteBudgetCategory.mutate(id)
    }

    function openEdit(budget: CategoryBudget) {
        setEditingId(budget.id);
        setEditDraft(budget.amount?.toString());
    }

    function handleSaveEdit(id: string) {
        const num = Number(editDraft?.replace(/,/g, ''));
        if (!editDraft || isNaN(num) || num <= 0) return;
        mutateUpdateBudgetCategory.mutate([{ budgetId: id, amount: num }])
        setEditingId(null);
    }

    if (isLoadingBudgets || isLoadingCategories) return null

    return (
        <div className="py-3.5 space-y-3">
            {/* Sub-header */}
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wide">Category Budgets</p>
                {(budgets?.length ?? 0) > 0 && !adding && availableCategories.length > 0 && (
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#1D3D8F] hover:text-[#163074] transition-colors"
                    >
                        <Plus className="w-3 h-3" strokeWidth={3} />
                        Add
                    </button>
                )}
            </div>

            {/* Existing budgets */}
            {(budgets?.length ?? 0) > 0 && (
                <div className="space-y-2">
                    {budgets?.map((budget) => {
                        const cat = categories?.find((c) => c.id === budget.categoryId)!;
                        const isEditing = editingId === budget.id;
                        const Icon = getCategoryIcon(cat.icon);

                        return (
                            <div
                                key={budget.id}
                                className="flex items-center gap-3 bg-[#F9F9FB] rounded-2xl px-3.5 py-3 border border-[#E5E5EA]"
                            >
                                {/* Icon */}
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: cat.bg }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: cat.color }} strokeWidth={2} />
                                </div>

                                {/* Label + amount */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#6C6C70]">{cat.label}</p>
                                    {isEditing ? (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-sm font-bold text-[#1C1C1E]">₱</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={editDraft?.toLocaleString()}
                                                onChange={(e) => setEditDraft(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(budget.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                autoFocus
                                                className="w-24 text-sm font-bold text-[#1C1C1E] bg-white rounded-lg px-2 py-0.5 outline-none border-2 border-[#1D3D8F]"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-[#1C1C1E]">₱{parseFloat(budget.amount.toString())}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                {isEditing ? (
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => handleSaveEdit(budget.id)}
                                            className="w-7 h-7 rounded-lg bg-[#D1FAE5] flex items-center justify-center"
                                        >
                                            <Check className="w-3.5 h-3.5 text-[#059669]" strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="w-7 h-7 rounded-lg bg-[#F2F2F7] flex items-center justify-center"
                                        >
                                            <X className="w-3.5 h-3.5 text-[#6C6C70]" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => openEdit(budget)}
                                            className="w-7 h-7 rounded-lg bg-[#EEF2FB] flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
                                        >
                                            <Edit3 className="w-3 h-3 text-[#1D3D8F]" strokeWidth={2} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget.id)}
                                            className="w-7 h-7 rounded-lg bg-[#F2F2F7] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors group"
                                        >
                                            <Trash2 className="w-3 h-3 text-[#AEAEB2] group-hover:text-[#DC2626] transition-colors" strokeWidth={2} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {budgets?.length === 0 && !adding && (
                <p className="text-[11px] text-[#AEAEB2] leading-relaxed">
                    No category budgets set. Add one to track spending limits per category.
                </p>
            )}

            {/* Inline add form */}
            {adding ? (
                <div className="bg-[#EEF2FB] rounded-2xl p-4 border-2 border-[#1D3D8F]/20 space-y-3">
                    <p className="text-xs font-bold text-[#1D3D8F]">New category budget</p>

                    {/* Category chips */}
                    <div>
                        <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-2">Category</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {availableCategories.map((cat) => {
                                const active = selectedCat === cat.id;
                                const Icon = getCategoryIcon(cat.icon);
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCat(cat.id)}
                                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all ${active ? 'border-[#1D3D8F] bg-white' : 'border-transparent bg-white/60 hover:bg-white'
                                            }`}
                                    >
                                        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: cat.bg }}>
                                            <Icon className="w-3 h-3" style={{ color: cat.color }} strokeWidth={2} />
                                        </div>
                                        <span className={`text-[11px] font-semibold whitespace-nowrap ${active ? 'text-[#1D3D8F]' : 'text-[#6C6C70]'}`}>
                                            {cat.label}
                                        </span>
                                        {active && <Check className="w-3 h-3 text-[#1D3D8F]" strokeWidth={3} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Amount input */}
                    <div>
                        <p className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wide mb-1.5">Monthly limit</p>
                        <div className={`flex items-center bg-white rounded-xl border-2 px-3.5 py-2.5 transition-colors ${amountError ? 'border-[#FF3B30]' : 'border-[#E5E5EA] focus-within:border-[#1D3D8F]'
                            }`}>
                            <span className="text-sm font-bold text-[#6C6C70] mr-1">₱</span>
                            <input
                                ref={amountRef}
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amountDraft}
                                onChange={(e) => { setAmountDraft(e.target.value); setAmountError(''); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAdd(); if (e.key === 'Escape') setAdding(false); }}
                                className="flex-1 text-sm font-bold text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                            />
                        </div>
                        {amountError && <p className="text-[11px] text-[#FF3B30] mt-1 px-0.5">{amountError}</p>}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleConfirmAdd}
                            className="flex-1 bg-[#1D3D8F] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#163074] transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => { setAdding(false); setAmountError(''); }}
                            className="px-4 bg-white text-[#6C6C70] text-sm font-bold py-2.5 rounded-xl border border-[#E5E5EA] hover:bg-[#F2F2F7] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                availableCategories.length > 0 && budgets?.length === 0 && (
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-3 w-full hover:bg-[#F9F9FB] transition-colors group py-1"
                    >
                        <div className="w-9 h-9 rounded-xl bg-[#EEF2FB] flex items-center justify-center group-hover:bg-[#DBEAFE] transition-colors">
                            <Plus className="w-4 h-4 text-[#1D3D8F]" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-semibold text-[#1D3D8F]">Add category budget</span>
                    </button>
                )
            )}
        </div>
    );
}