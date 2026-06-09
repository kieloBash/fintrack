"use client"

import BalanceCard from "./_components/balance-card"
import InsightsCard from "./_components/insights-card"
import TransactionsList from "./_components/transactions-list"
import YesterdaySummary from "./_components/yesterday-summary"

const HomePage = () => {

    return (
        <>
            <BalanceCard />
            <YesterdaySummary />
            <TransactionsList />
            <InsightsCard />
        </>
    )
}

export default HomePage