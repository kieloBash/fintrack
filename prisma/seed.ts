import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Prisma, PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

const categoryData: Prisma.CategoryCreateInput[] = [
    {
        label: 'Food & Dining',
        icon: 'UtensilsCrossed',
        color: '#EA580C',
        bg: '#FFF7ED',
    },
    {
        label: 'Groceries',
        icon: 'ShoppingCart',
        color: '#16A34A',
        bg: '#F0FDF4',
    },
    {
        label: 'Transportation',
        icon: 'Car',
        color: '#2563EB',
        bg: '#EFF6FF',
    },
    {
        label: 'Fuel',
        icon: 'Fuel',
        color: '#DC2626',
        bg: '#FEF2F2',
    },
    {
        label: 'Shopping',
        icon: 'ShoppingBag',
        color: '#9333EA',
        bg: '#FAF5FF',
    },
    {
        label: 'Bills & Utilities',
        icon: 'Receipt',
        color: '#D97706',
        bg: '#FFFBEB',
    },
    {
        label: 'Rent & Housing',
        icon: 'House',
        color: '#0891B2',
        bg: '#ECFEFF',
    },
    {
        label: 'Healthcare',
        icon: 'HeartPulse',
        color: '#E11D48',
        bg: '#FFF1F2',
    },
    {
        label: 'Pharmacy',
        icon: 'Pill',
        color: '#0D9488',
        bg: '#F0FDFA',
    },
    {
        label: 'Education',
        icon: 'GraduationCap',
        color: '#4F46E5',
        bg: '#EEF2FF',
    },
    {
        label: 'Entertainment',
        icon: 'Film',
        color: '#DB2777',
        bg: '#FDF2F8',
    },
    {
        label: 'Travel',
        icon: 'Plane',
        color: '#0284C7',
        bg: '#F0F9FF',
    },
    {
        label: 'Subscriptions',
        icon: 'Repeat',
        color: '#7C3AED',
        bg: '#F5F3FF',
    },
    {
        label: 'Insurance',
        icon: 'Shield',
        color: '#475569',
        bg: '#F8FAFC',
    },
    {
        label: 'Savings',
        icon: 'PiggyBank',
        color: '#059669',
        bg: '#ECFDF5',
    },
    {
        label: 'Investments',
        icon: 'TrendingUp',
        color: '#0F766E',
        bg: '#F0FDFA',
    },
    {
        label: 'Income',
        icon: 'Wallet',
        color: '#15803D',
        bg: '#F0FDF4',
    },
    {
        label: 'Salary',
        icon: 'Briefcase',
        color: '#166534',
        bg: '#DCFCE7',
    },
    {
        label: 'Cash Withdrawal',
        icon: 'Banknote',
        color: '#854D0E',
        bg: '#FEFCE8',
    },
    {
        label: 'Transfer',
        icon: 'ArrowRightLeft',
        color: '#334155',
        bg: '#F8FAFC',
    },
    {
        label: 'Gifts & Donations',
        icon: 'Gift',
        color: '#C026D3',
        bg: '#FAF5FF',
    },
    {
        label: 'Pets',
        icon: 'PawPrint',
        color: '#B45309',
        bg: '#FFFBEB',
    },
    {
        label: 'Personal Care',
        icon: 'Sparkles',
        color: '#EC4899',
        bg: '#FDF2F8',
    },
    {
        label: 'Family',
        icon: 'Users',
        color: '#1D4ED8',
        bg: '#EFF6FF',
    },
    {
        label: 'Taxes & Government',
        icon: 'Landmark',
        color: '#7C2D12',
        bg: '#FFF7ED',
    },
    {
        label: 'Miscellaneous',
        icon: 'CircleHelp',
        color: '#6B7280',
        bg: '#F9FAFB',
    },
];

export async function main() {
    for (const c of categoryData) {
        await prisma.category.create({ data: c });
    }
}

main();