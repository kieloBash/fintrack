import { queryKeys } from "@/constants/query-keys";
import { UserService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useGetUserProfile() {
    return useQuery({
        queryKey: queryKeys.user.profile,
        queryFn: UserService.getUserSettingsProfile,
    })
}