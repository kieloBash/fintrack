import { api } from "@/lib/axios";

export type UpdateNotificationSettingsDto = Partial<{
    dailySummary: boolean;
    budgetWarning: boolean;
    unusualSpend: boolean;
    weeklyReport: boolean;
    largeTransaction: boolean;
    savingsReminder: boolean;
    summaryTime: string;
}>;

export const NotificationService = {
    async updateUserNotificationAlerts(payload: UpdateNotificationSettingsDto) {
        const res = await api.patch("/user/notification-settings",
            payload,
        )
        return res.data;
    }
}