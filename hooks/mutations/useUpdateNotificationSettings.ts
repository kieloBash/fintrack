// hooks/mutations/useUpdateNotificationSettings.ts

import { queryKeys } from "@/constants/query-keys";
import { NotificationService } from "@/services/notification.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateNotificationSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: NotificationService.updateUserNotificationAlerts,

        onMutate: async (updates) => {
            await queryClient.cancelQueries({
                queryKey: queryKeys.user.profile,
            });

            const previous =
                queryClient.getQueryData(queryKeys.user.profile);

            queryClient.setQueryData(
                queryKeys.user.profile,
                (old: any) => ({
                    ...old,
                    notificationSettings: {
                        ...old.notificationSettings,
                        ...updates,
                    },
                })
            );

            return { previous };
        },

        onSuccess: (data, variables, onMutateResult, context) => {
            toast(`Alert notifications updated successfully!`)
        },

        onError: (_, __, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    queryKeys.user.profile,
                    context.previous
                );
            }
        },
    });
}