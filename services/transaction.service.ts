import { Transaction } from "@/app/generated/prisma/client"
import { PaginatedResponse, PaginationParams } from "@/lib/api/types"
import { api } from "@/lib/axios"
import * as z from "zod"

export const CreateTransactionSchema = z.object({
    amount: z.number(),
    categoryId: z.string(),
    label: z.string(),
    transactionDate: z.string().date(),
    merchant: z.optional(z.string()),
    description: z.optional(z.string()),
    source: z.optional(z.string()),
})
export type CreateTransactionDTO = z.infer<typeof CreateTransactionSchema>
export type TransactionDTO = Transaction
export type FrequentTransactionDTO = Transaction & {
    count: number;
}

export interface GetTransactionParams extends PaginationParams {
    search?: string;
}

export const TransactionService = {
    async createTransaction(payload: CreateTransactionDTO) {
        const res = await api.post("/transaction",
            payload
        )
        return res.data
    },
    async getRecentTransaction(): Promise<TransactionDTO[]> {
        const res = await api.get("/transaction/recent",)
        return res.data
    },
    async getFrequentTransaction(): Promise<FrequentTransactionDTO[]> {
        const res = await api.get("/transaction/frequent",)
        return res.data
    },
    async getAllTransaction(): Promise<{ transactions: TransactionDTO[], totalExpenses: number }> {
        const res = await api.get("/transaction",)
        return res.data
    },
    async getPaginated(
        params: GetTransactionParams
    ): Promise<PaginatedResponse<TransactionDTO>> {
        const res = await api.get("/transaction/infinite", { params });
        return res.data; // expects { items: TransactionDTO[], nextCursor: number | null }
    },
    async deleteTransaction(id: string) {
        const res = await api.delete(`/transaction/${id}`,
        )
        return res.data
    },
}