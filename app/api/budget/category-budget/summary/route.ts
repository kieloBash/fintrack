import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Budgets with category
    const budgets = await prisma.budget.findMany({
        where: {
            userId: dbUser.id,
            period: "MONTHLY",
        },
        include: {
            category: true,
        },
    });

    // 2. All transactions
    const transactions = await prisma.transaction.findMany({
        where: {
            userId: dbUser.id,
        },
        include: {
            category: true,
        },
    });

    // 3. Group spending by category
    const spendingMap = new Map<string, number>();

    for (const t of transactions) {
        if (!t.categoryId) continue;

        spendingMap.set(
            t.categoryId,
            (spendingMap.get(t.categoryId) ?? 0) + Number(t.amount)
        );
    }

    // 4. CATEGORY BUDGETS
    const categoryBudgets = budgets.map((b) => ({
        id: b.category.id,
        label: b.category.label,
        icon: b.category.icon, // string (IMPORTANT: not React.ElementType in API)
        bg: b.category.bg,
        color: b.category.color,

        spent: spendingMap.get(b.categoryId) ?? 0,
        budget: Number(b.amount),
    }));

    // 5. UNBUDGETED TRANSACTIONS
    const unbudgetedTransactions = transactions
        .filter((t) => !budgets.some((b) => b.categoryId === t.categoryId))
        .map((t) => ({
            id: t.id,
            label: t.label,
            amount: Number(t.amount),
            categoryGuess: t.category?.label ?? "Uncategorized",
        }));

    return NextResponse.json({
        categoryBudgets,
        unbudgetedTransactions,
    });
}