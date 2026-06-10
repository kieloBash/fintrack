import { Budget, Category, ConnectedEmail, NotificationSettings } from "@/app/generated/prisma/client";
import { api } from "@/lib/axios";
import { User } from "@clerk/nextjs/server";

export type CategoryBudget = Budget & {
    category: Category,
}

export type UserProfileDTO = User & {
    connectedEmails: ConnectedEmail[],
    notificationSettings: NotificationSettings,
    budgets: CategoryBudget[]
}

export const UserService = {
    async createUserAfterSignIn() {
        const res = await api.post("/user/create", {})
        return res.data;
    },
    async getUserSettingsProfile(): Promise<UserProfileDTO> {
        const res = await api.get("/user/profile")
        return res.data;
    },
    async getUserBudgets(): Promise<CategoryBudget[]> {
        const res = await api.get("/user/budget")
        return res.data ?? [];
    },
}