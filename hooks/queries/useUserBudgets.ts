import { queryKeys } from "@/constants/query-keys";
import { UserService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useUserBudgets() {
    return useQuery({
        queryKey: queryKeys.user.budget,
        queryFn: UserService.getUserBudgets,
    })
}