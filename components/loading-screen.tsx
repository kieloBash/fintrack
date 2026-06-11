"use client"
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const MESSAGES = [
    'Reading your emails…',
    'Extracting transactions…',
    'Calculating your balance…',
    'Analysing spending patterns…',
    'Generating insights…',
    'Almost ready…',
];

const FLOATING_STATS = [
    { label: 'Food & Drink', value: '₱2,340', x: '8%', y: '18%', delay: '0s' },
    { label: 'Transport', value: '₱890', x: '62%', y: '12%', delay: '0.3s' },
    { label: 'Shopping', value: '₱4,120', x: '72%', y: '72%', delay: '0.6s' },
    { label: 'Savings', value: '+12%', x: '5%', y: '70%', delay: '0.9s' },
    { label: 'Balance', value: '₱38k', x: '55%', y: '84%', delay: '1.2s' },
];

export function LoadingScreen() {
    const [msgIdx, setMsgIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);

    const fetching = useIsFetching();
    const mutating = useIsMutating();

    // Cycle messages
    useEffect(() => {
        const iv = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 520);
        return () => clearInterval(iv);
    }, []);

    // Drive progress bar
    useEffect(() => {
        const start = performance.now();
        const duration = 2600;
        let raf: number;

        function tick(now: number) {
            const elapsed = now - start;
            const pct = Math.min(elapsed / duration, 1);
            // ease-out cubic
            setProgress(1 - Math.pow(1 - pct, 3));
            if (pct < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                setExiting(true);
            }
        }

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    const loading =
        fetching > 0 ||
        mutating > 0;

    if (!loading) return null;

    return (
        <>
            <style>{`
        @keyframes ring-expand {
          0%   { transform: scale(0.6); opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes float-in {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-idle {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes logo-in {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin-ring {
          to { transform: rotate(360deg); }
        }
        @keyframes msg-fade {
          0%   { opacity: 0; transform: translateY(4px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes screen-exit {
          to { opacity: 0; transform: scale(1.04); }
        }
        .ring { animation: ring-expand 2s ease-out infinite; }
        .ring-2 { animation-delay: 0.65s; }
        .ring-3 { animation-delay: 1.3s; }
        .logo-wrap { animation: logo-in 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .spin-ring { animation: spin-ring 1.8s linear infinite; }
        .msg-text  { animation: msg-fade 520ms ease-in-out; }
        .stat-chip { animation: float-in 0.5s ease forwards, float-idle 3.5s ease-in-out infinite 0.5s; }
        .screen-exit { animation: screen-exit 0.5s ease forwards; }
      `}</style>

            <div
                className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#0F1F5C] ${exiting ? 'screen-exit' : ''}`}
            >
                {/* ── Grid lines (subtle) ── */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* ── Floating stat chips ── */}
                {FLOATING_STATS.map((s) => (
                    <div
                        key={s.label}
                        className="stat-chip absolute pointer-events-none"
                        style={{ left: s.x, top: s.y, animationDelay: s.delay }}
                    >
                        <div className="bg-white/[0.07] border border-white/10 rounded-2xl px-3 py-2">
                            <p className="text-[10px] font-medium text-white/40 leading-none mb-1">{s.label}</p>
                            <p className="text-sm font-bold text-white/80 leading-none">{s.value}</p>
                        </div>
                    </div>
                ))}

                {/* ── Center stage ── */}
                <div className="relative flex flex-col items-center">

                    {/* Expanding rings */}
                    {['ring', 'ring ring-2', 'ring ring-3'].map((cls, i) => (
                        <div
                            key={i}
                            className={`${cls} absolute w-28 h-28 rounded-full border border-white/20`}
                        />
                    ))}

                    {/* Spinning dashed arc */}
                    <div className="spin-ring absolute w-[7.5rem] h-[7.5rem]">
                        <svg viewBox="0 0 120 120" className="w-full h-full">
                            <circle
                                cx="60" cy="60" r="54"
                                fill="none"
                                stroke="rgba(255,255,255,0.25)"
                                strokeWidth="2"
                                strokeDasharray="80 260"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Logo mark */}
                    <div className="logo-wrap w-24 h-24 bg-white rounded-[28px] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1D3D8F] to-[#0F1F5C] opacity-0 rounded-[28px]" />
                        {/* FT monogram */}
                        <div className="flex items-end leading-none select-none">
                            <span className="text-4xl font-extrabold text-[#1D3D8F] tracking-tighter">F</span>
                            <span className="text-4xl font-extrabold text-[#2563EB] tracking-tighter">T</span>
                        </div>
                    </div>
                </div>

                {/* ── App name ── */}
                <div className="mt-9 text-center" style={{ animation: 'float-in 0.6s 0.4s ease both' }}>
                    <p className="text-2xl font-extrabold text-white tracking-tight">FinTrack</p>
                    <p className="text-xs font-medium text-white/40 mt-1 tracking-wide">Your money, always in view</p>
                </div>

                {/* ── Cycling status message ── */}
                <div className="mt-6 h-5 overflow-hidden">
                    <p key={msgIdx} className="msg-text text-[11px] font-semibold text-white/50 text-center">
                        {MESSAGES[msgIdx]}
                    </p>
                </div>

                {/* ── Progress bar ── */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48">
                    <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-none"
                            style={{
                                width: `${progress * 100}%`,
                                background: 'linear-gradient(90deg, #60A5FA, #34D399)',
                            }}
                        />
                    </div>
                    <p className="text-center text-[10px] text-white/20 mt-2 font-medium">
                        {Math.round(progress * 100)}%
                    </p>
                </div>
            </div>
        </>
    );
}
