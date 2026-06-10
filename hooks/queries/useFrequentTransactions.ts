import { queryKeys } from "@/constants/query-keys";
import { TransactionService } from "@/services/transaction.service";
import { useQuery } from "@tanstack/react-query";

export function useFrequentTransactions() {
    return useQuery({
        queryKey: queryKeys.transaction.frequent,
        queryFn: TransactionService.getFrequentTransaction,
    })
}