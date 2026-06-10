import { Transaction } from "@/app/generated/prisma/client"
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
}