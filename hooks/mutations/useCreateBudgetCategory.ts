import { queryKeys } from "@/constants/query-keys";
import { BudgetCategoryService } from "@/services/budget-category.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateBudgetCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: BudgetCategoryService.createBudgetCategory,

        onSuccess: () => {
            toast.success("Budget created successfully!");

            queryClient.invalidateQueries({
                queryKey: queryKeys.user.budget,
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.user.profile,
            });
        },

        onError: () => {
            toast.error("Failed to create budget.");
        },
    });
}