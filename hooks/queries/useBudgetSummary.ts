import { queryKeys } from "@/constants/query-keys";
import { BudgetCategoryService } from "@/services/budget-category.service";
import { useQuery } from "@tanstack/react-query";

export function useBudgetSummary() {
    return useQuery({
        queryKey: queryKeys.budget.summary,
        queryFn: BudgetCategoryService.getBudgetSummary,
    })
}