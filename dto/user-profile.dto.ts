import { ConnectedEmail, NotificationSettings, User } from "@/app/generated/prisma/client";

export type UserProfileDTO = User & {
    connectedEmails: ConnectedEmail[],
    notificationSettings: NotificationSettings
}