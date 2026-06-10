import { queryKeys } from "@/constants/query-keys";
import { TransactionService } from "@/services/transaction.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: TransactionService.createTransaction,

        onSuccess: () => {
            toast.success("Transaction created successfully!");

            queryClient.invalidateQueries({
                queryKey: queryKeys.transaction.all,
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.transaction.recent,
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.transaction.frequent,
            });
        },

        onError: () => {
            toast.error("Failed to create transaction.");
        },
    });
}