import React from 'react'
import HomeHeader from "./_components/header"

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <HomeHeader />
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-6">
                {children}
            </div>
        </>
    )
}

export default HomeLayout