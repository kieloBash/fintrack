import { queryKeys } from "@/constants/query-keys";
import { BudgetCategoryService } from "@/services/budget-category.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateBudgetCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: BudgetCategoryService.updateBudgetCategory,

        onSuccess: () => {
            toast.success("Updated budgets successfully!");

            queryClient.invalidateQueries({
                queryKey: queryKeys.user.budget,
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.user.profile,
            });
        },

        onError: () => {
            toast.error("Failed to update budgets.");
        },
    });
}