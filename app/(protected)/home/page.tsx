"use client"

import { useAllTransactions } from "@/hooks/queries/useAllTransactions"
import { useUserBudgets } from "@/hooks/queries/useUserBudgets"
import { useMemo } from "react"
import BalanceCard from "./_components/balance-card"
import InsightsCard from "./_components/insights-card"
import TransactionsList from "./_components/transactions-list"
import YesterdaySummary from "./_components/yesterday-summary"

const HomePage = () => {
    const { data: budgets } = useUserBudgets();
    const { data: monthlyTransactions } = useAllTransactions();

    const { MONTHLY, WEEKLY } = useMemo(() => {
        const MONTHLY = {
            spent: 0,
            budget: 0,
        };

        const WEEKLY = {
            spent: 0,
            budget: 0,
        };

        if (!monthlyTransactions || !budgets) {
            return { MONTHLY, WEEKLY };
        }

        // Budgets
        MONTHLY.budget = budgets.reduce(
            (total, budget) => total + Number(budget.amount),
            0
        );

        WEEKLY.budget = MONTHLY.budget / 4;

        // Monthly spent
        MONTHLY.spent = Number(monthlyTransactions.totalExpenses ?? 0);

        // Weekly spent
        const now = new Date();

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        WEEKLY.spent = monthlyTransactions.transactions.reduce(
            (total, transaction) => {
                const transactionDate = new Date(
                    transaction.transactionDate
                );

                if (transactionDate >= startOfWeek) {
                    return total + Number(transaction.amount);
                }

                return total;
            },
            0
        );

        return { MONTHLY, WEEKLY };
    }, [monthlyTransactions, budgets]);

    return (
        <>
            <BalanceCard WEEKLY={WEEKLY} MONTHLY={MONTHLY} />
            <YesterdaySummary WEEKLY={WEEKLY} MONTHLY={MONTHLY} />
            <TransactionsList />
            <InsightsCard />
        </>
    )
}

export default HomePage