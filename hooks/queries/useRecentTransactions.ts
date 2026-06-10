import { queryKeys } from "@/constants/query-keys";
import { TransactionService } from "@/services/transaction.service";
import { useQuery } from "@tanstack/react-query";

export function useRecentTransactions() {
    return useQuery({
        queryKey: queryKeys.transaction.recent,
        queryFn: TransactionService.getRecentTransaction,
    })
}