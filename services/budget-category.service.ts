import { api } from "@/lib/axios";
import * as z from "zod";

export const CreateBudgetCategorySchema = z.object({
    categoryId: z.string(),
    amount: z.number(),
})
export type CreateBudgetCategoryDTO = z.infer<typeof CreateBudgetCategorySchema>

export const UpdateBudgetCategorySchema = z.array(z.object({
    budgetId: z.string(),
    amount: z.number(),
}))
export type UpdateBudgetCategoryDTO = z.infer<typeof UpdateBudgetCategorySchema>

export interface CategoryBudget {
    id: string;
    label: string;
    icon: React.ElementType;
    bg: string;
    color: string;
    spent: number;
    budget: number;
}

export interface UnbudgetedTransaction {
    id: number;
    label: string;
    amount: number;
    categoryGuess: string;
}

export const BudgetCategoryService = {
    async createBudgetCategory(payload: CreateBudgetCategoryDTO) {
        const res = await api.post("/budget/category-budget",
            payload
        )
        return res.data
    },
    async updateBudgetCategory(payload: UpdateBudgetCategoryDTO) {
        const res = await api.patch("/budget/category-budget",
            payload
        )
        return res.data
    },
    async deleteBudgetCategory(id: string) {
        const res = await api.delete(`/budget/category-budget/${id}`)
        return res.data
    },
    async getBudgetSummary(): Promise<{ categoryBudgets: CategoryBudget[], unbudgetedTransactions: UnbudgetedTransaction[] }> {
        const res = await api.get(`/budget/category-budget/summary`)
        return res.data
    },
}