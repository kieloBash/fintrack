import React from 'react'
import BottomNav from './_components/bottom-nav'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-[#F2F2F7]">
            <div className="max-w-[430px] mx-auto min-h-screen relative">
                <main className="flex flex-col min-h-screen pb-28 gap-4">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    )
}

export default ProtectedLayout