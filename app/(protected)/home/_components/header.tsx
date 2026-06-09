'use client'
import { useUser } from '@clerk/nextjs';
import { Bell } from 'lucide-react';

export default function HomeHeader() {
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    const { user, isLoaded } = useUser();

    return (
        <header className="px-4 pt-14 pb-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-[#6C6C70] mb-0.5">{today}</p>
                    <h1 className="text-[26px] font-bold text-[#1C1C1E] tracking-tight leading-tight">
                        {greeting}, <span className="text-[#1D3D8F]">{user?.firstName}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2.5 mt-1">
                    <button className="relative w-10 h-10 rounded-2xl bg-white border border-[#E5E5EA] flex items-center justify-center shadow-sm hover:bg-[#F2F2F7] transition-colors">
                        <Bell className="w-4.5 h-4.5 text-[#1C1C1E]" strokeWidth={2} />
                        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#FF3B30] rounded-full text-[10px] text-white font-semibold flex items-center justify-center leading-none">
                            3
                        </span>
                    </button>

                    <button className="w-10 h-10 rounded-2xl bg-[#1D3D8F] flex items-center justify-center shadow-sm hover:bg-[#163074] transition-colors">
                        {user?.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt="Profile"
                                className="w-10 h-10 rounded-2xl object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-white">
                                {user?.firstName?.[0] ?? user?.username?.[0] ?? "U"}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
