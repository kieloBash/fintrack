import { queryKeys } from "@/constants/query-keys";
import { CategoryService } from "@/services/category.service";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
    return useQuery({
        queryKey: queryKeys.category.all,
        queryFn: CategoryService.getAll,
    })
}