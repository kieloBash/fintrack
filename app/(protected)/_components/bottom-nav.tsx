'use client'
import { CreditCard, Home, Plus, Receipt, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const LEFT_ITEMS = [
    { id: '/home', icon: Home, label: 'Home' },
    { id: '/transactions', icon: Receipt, label: 'Activity' },
];
const RIGHT_ITEMS = [
    { id: '/cards', icon: CreditCard, label: 'Cards' },
    { id: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const activeTab = pathname;

    const onTabChange = (tab: string) => {
        router.push(`${tab}`)
    }
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-5">
            <div className="max-w-[430px] w-full">
                <nav className="bg-white rounded-[26px] border border-[#E5E5EA] shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
                    <div className="flex items-center justify-around px-2 py-2.5">
                        {/* Left items */}
                        {LEFT_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className="relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all"
                                >
                                    {isActive && <div className="absolute inset-0 bg-[#EEF2FB] rounded-2xl" />}
                                    <item.icon
                                        className="w-5 h-5 relative transition-colors"
                                        style={{ color: isActive ? '#1D3D8F' : '#AEAEB2' }}
                                        strokeWidth={isActive ? 2.5 : 1.75}
                                    />
                                    <span
                                        className="relative text-[10px] font-semibold transition-colors"
                                        style={{ color: isActive ? '#1D3D8F' : '#AEAEB2' }}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Center + button */}
                        <button
                            onClick={() => onTabChange('expenses')}
                            className={`relative -mt-5 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${activeTab === 'add'
                                ? 'bg-[#163074] shadow-[#1D3D8F]/40'
                                : 'bg-[#1D3D8F] shadow-[#1D3D8F]/30'
                                }`}
                            style={{ boxShadow: '0 6px 20px rgba(29,61,143,0.40)' }}
                        >
                            <Plus
                                className="w-6 h-6 text-white transition-transform"
                                style={{ transform: activeTab === '/expenses' ? 'rotate(45deg)' : 'rotate(0deg)' }}
                                strokeWidth={2.5}
                            />
                        </button>

                        {/* Right items */}
                        {RIGHT_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className="relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all"
                                >
                                    {isActive && <div className="absolute inset-0 bg-[#EEF2FB] rounded-2xl" />}
                                    <item.icon
                                        className="w-5 h-5 relative transition-colors"
                                        style={{ color: isActive ? '#1D3D8F' : '#AEAEB2' }}
                                        strokeWidth={isActive ? 2.5 : 1.75}
                                    />
                                    <span
                                        className="relative text-[10px] font-semibold transition-colors"
                                        style={{ color: isActive ? '#1D3D8F' : '#AEAEB2' }}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}
