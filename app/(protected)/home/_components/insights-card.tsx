"use client"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const insights = [
    {
        id: 1,
        text: 'Food expenses up 12% this week — mostly dining out.',
        type: 'warning',
        icon: TrendingUp,
        bg: '#FFF7ED',
        border: '#FED7AA',
        iconBg: '#FEF3C7',
        iconColor: '#D97706',
        label: 'Heads up',
        labelColor: '#D97706',
    },
    {
        id: 2,
        text: "At this rate you'll exceed your monthly budget by ₱3,200.",
        type: 'alert',
        icon: AlertCircle,
        bg: '#FFF5F5',
        border: '#FECACA',
        iconBg: '#FEE2E2',
        iconColor: '#DC2626',
        label: 'Alert',
        labelColor: '#DC2626',
    },
    {
        id: 3,
        text: 'You saved ₱1,200 compared to last week. Keep it up!',
        type: 'positive',
        icon: CheckCircle2,
        bg: '#F0FDF4',
        border: '#BBF7D0',
        iconBg: '#D1FAE5',
        iconColor: '#059669',
        label: 'Nice work',
        labelColor: '#059669',
    },
];

export default function InsightsCard() {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-[#1D3D8F]" strokeWidth={2} />
                <h3 className="text-base font-bold text-[#1C1C1E]">Smart Insights</h3>
            </div>

            <div className="space-y-2.5">
                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        className="rounded-2xl p-4 border"
                        style={{ backgroundColor: insight.bg, borderColor: insight.border }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: insight.iconBg }}
                            >
                                <insight.icon className="w-4 h-4" style={{ color: insight.iconColor }} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-[11px] font-semibold mb-0.5 uppercase tracking-wide"
                                    style={{ color: insight.labelColor }}
                                >
                                    {insight.label}
                                </p>
                                <p className="text-sm text-[#3A3A3C] leading-snug">{insight.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
