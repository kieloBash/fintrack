import { queryKeys } from "@/constants/query-keys";
import { TransactionService } from "@/services/transaction.service";
import { useQuery } from "@tanstack/react-query";

export function useAllTransactions() {
    return useQuery({
        queryKey: queryKeys.transaction.all,
        queryFn: TransactionService.getAllTransaction,
    })
}