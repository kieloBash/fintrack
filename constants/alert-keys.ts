import {
    AlertCircle,
    Bell,
    Calendar,
    CheckCircle2,
    TrendingUp,
} from "lucide-react";

export type NotificationAlertType =
    | "dailySummary"
    | "budgetWarning"
    | "unusualSpend"
    | "largeTransaction"
    | "weeklyReport"
    | "savingsReminder";

export const NotificationAlertItems: {
    key: NotificationAlertType;
    label: string;
    description: string;
    icon: any;
    iconBg: string;
    iconColor: string;
}[] = [
        {
            key: "dailySummary",
            label: "Daily Morning Summary",
            description: "Digest of yesterday's activity at your chosen time",
            icon: Calendar,
            iconBg: "#EEF2FB",
            iconColor: "#1D3D8F",
        },
        {
            key: "budgetWarning",
            label: "Budget Alerts",
            description: "Notified when you hit 80% and 100% of budget",
            icon: AlertCircle,
            iconBg: "#FFF7ED",
            iconColor: "#D97706",
        },
        {
            key: "unusualSpend",
            label: "Unusual Spending",
            description: "Flags charges that look out of pattern",
            icon: TrendingUp,
            iconBg: "#FFF5F5",
            iconColor: "#DC2626",
        },
        {
            key: "largeTransaction",
            label: "Large Transactions",
            description: "Alert for any single charge over ₱2,000",
            icon: CheckCircle2,
            iconBg: "#F0FDF4",
            iconColor: "#059669",
        },
        {
            key: "weeklyReport",
            label: "Weekly Report",
            description: "Full breakdown every Sunday morning",
            icon: Bell,
            iconBg: "#F5F3FF",
            iconColor: "#7C3AED",
        },
        {
            key: "savingsReminder",
            label: "Savings Reminders",
            description: "Motivational nudges when under budget",
            icon: CheckCircle2,
            iconBg: "#D1FAE5",
            iconColor: "#059669",
        },
    ];