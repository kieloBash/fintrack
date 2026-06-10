import React from 'react'

const ExpensesLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <div className="px-4 pt-14 pb-5">
                <h1 className="text-[26px] font-bold text-[#1C1C1E] tracking-tight">Add Expense</h1>
                <p className="text-sm font-medium text-[#6C6C70] mt-0.5">Log manually or set up recurring</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </>
    )
}

export default ExpensesLayout