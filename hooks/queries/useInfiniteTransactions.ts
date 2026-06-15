import { queryKeys } from "@/constants/query-keys";
import { TransactionService } from "@/services/transaction.service";
import { usePaginatedQuery } from "./usePaginatedQueries";

export function useInfiniteTransactions({ search }: { search?: string }) {
    return usePaginatedQuery({
        queryKey: queryKeys.transaction.infinite,
        queryFn: TransactionService.getPaginated,
        params: { search },
        limit: 5,
    });
}