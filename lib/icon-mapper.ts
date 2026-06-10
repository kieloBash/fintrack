import {
    UtensilsCrossed,
    ShoppingCart,
    Car,
    Fuel,
    ShoppingBag,
    Receipt,
    Home,
    HeartPulse,
    Pill,
    GraduationCap,
    Film,
    Plane,
    Repeat,
    Shield,
    PiggyBank,
    TrendingUp,
    Wallet,
    Briefcase,
    Banknote,
    ArrowRightLeft,
    Gift,
    PawPrint,
    Sparkles,
    Users,
    Landmark,
    CircleHelp,
} from "lucide-react";

export const categoryIconMap = {
    UtensilsCrossed,
    ShoppingCart,
    Car,
    Fuel,
    ShoppingBag,
    Receipt,
    House: Home, // 👈 important alias fix (Lucide uses Home not House)
    HeartPulse,
    Pill,
    GraduationCap,
    Film,
    Plane,
    Repeat,
    Shield,
    PiggyBank,
    TrendingUp,
    Wallet,
    Briefcase,
    Banknote,
    ArrowRightLeft,
    Gift,
    PawPrint,
    Sparkles,
    Users,
    Landmark,
    CircleHelp,
} as const;

export type CategoryIconName = keyof typeof categoryIconMap;

export function getCategoryIcon(iconName: string) {
    return categoryIconMap[iconName as CategoryIconName] ?? CircleHelp;
}