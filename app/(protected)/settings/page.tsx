"use client"
import { useClerk, useUser } from '@clerk/nextjs';
import {
    AlertCircle,
    Bell,
    BellOff,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    Edit3,
    LogOut,
    Mail,
    Plus,
    Shield,
    Trash2,
    TrendingUp,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface EditableFieldProps {
    label: string;
    value: string;
    prefix?: string;
    inputType?: string;
    onSave: (val: string) => void;
}

function EditableField({ label, value, prefix, inputType = 'text', onSave }: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleEdit() {
        setDraft(value);
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    function handleSave() {
        if (draft.trim()) onSave(draft.trim());
        setEditing(false);
    }

    function handleCancel() {
        setDraft(value);
        setEditing(false);
    }

    return (
        <div className="flex items-center justify-between py-3.5">
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wide mb-0.5">{label}</p>
                {editing ? (
                    <div className="flex items-center gap-1.5 mt-1">
                        {prefix && <span className="text-base font-semibold text-[#1C1C1E]">{prefix}</span>}
                        <input
                            ref={inputRef}
                            type={inputType}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                            className="flex-1 text-base font-semibold text-[#1C1C1E] bg-[#F2F2F7] rounded-lg px-2 py-1 outline-none border-2 border-[#1D3D8F] min-w-0"
                        />
                    </div>
                ) : (
                    <p className="text-base font-semibold text-[#1C1C1E] truncate">
                        {prefix}{value}
                    </p>
                )}
            </div>

            {editing ? (
                <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                    <button
                        onClick={handleSave}
                        className="w-8 h-8 rounded-xl bg-[#D1FAE5] flex items-center justify-center"
                    >
                        <Check className="w-4 h-4 text-[#059669]" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="w-8 h-8 rounded-xl bg-[#F2F2F7] flex items-center justify-center"
                    >
                        <X className="w-4 h-4 text-[#6C6C70]" strokeWidth={2.5} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleEdit}
                    className="ml-3 flex-shrink-0 w-8 h-8 rounded-xl bg-[#EEF2FB] flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
                >
                    <Edit3 className="w-3.5 h-3.5 text-[#1D3D8F]" strokeWidth={2} />
                </button>
            )}
        </div>
    );
}

interface ToggleProps {
    enabled: boolean;
    onChange: (v: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${enabled ? 'bg-[#1D3D8F]' : 'bg-[#D1D1D6]'
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

interface SectionCardProps {
    title: string;
    children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
    return (
        <div>
            <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest px-1 mb-2">{title}</p>
            <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm divide-y divide-[#F2F2F7] px-6 py-2">
                {children}
            </div>
        </div>
    );
}

interface ConnectedEmail {
    id: number;
    address: string;
    label: string;
    status: 'active' | 'error' | 'pending';
    lastSynced: string;
}

let nextId = 3;

export default function SettingsPage() {
    // CLERK
    const { signOut } = useClerk()
    const { user, isLoaded } = useUser();

    const [monthlyBudget, setMonthlyBudget] = useState('15,000');
    const [weeklyBudget, setWeeklyBudget] = useState('3,500');
    const [isEdittingPrimaryAccount, setIsEdittingPrimaryAccount] = useState(false)

    const connectedEmails =
        user?.emailAddresses.map((email) => ({
            id: email.id,
            address: email.emailAddress,
            verified:
                email.verification?.status === "verified",
        })) ?? [];

    const [addingEmail, setAddingEmail] = useState(false);
    const [newEmailDraft, setNewEmailDraft] = useState('');
    const [newLabelDraft, setNewLabelDraft] = useState('');
    const newEmailRef = useRef<HTMLInputElement>(null);

    function handleAddEmail() {
        setAddingEmail(true);
        setNewEmailDraft('');
        setNewLabelDraft('');
        setTimeout(() => newEmailRef.current?.focus(), 0);
    }

    function handleConfirmAdd() {
        const trimmed = newEmailDraft.trim();
        if (!trimmed || !trimmed.includes('@')) return;
        // setConnectedEmails((prev) => [
        //     ...prev,
        //     {
        //         id: nextId++,
        //         address: trimmed,
        //         label: newLabelDraft.trim() || 'Email',
        //         status: 'pending',
        //         lastSynced: 'Connecting…',
        //     },
        // ]);
        setAddingEmail(false);
        setNewEmailDraft('');
        setNewLabelDraft('');
    }

    function handleRemoveEmail(id: string) {
        // setConnectedEmails((prev) => prev.filter((e) => e.id !== id));
    }

    const [alerts, setAlerts] = useState({
        dailySummary: true,
        budgetWarning: true,
        unusualSpend: true,
        weeklyReport: false,
        largeTransaction: true,
        savingsReminder: false,
    });

    const [summaryTime, setSummaryTime] = useState('08:00');

    function toggleAlert(key: keyof typeof alerts) {
        setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    const alertItems = [
        {
            key: 'dailySummary' as const,
            label: 'Daily Morning Summary',
            description: 'Digest of yesterday\'s activity at your chosen time',
            icon: Calendar,
            iconBg: '#EEF2FB',
            iconColor: '#1D3D8F',
        },
        {
            key: 'budgetWarning' as const,
            label: 'Budget Alerts',
            description: 'Notified when you hit 80% and 100% of budget',
            icon: AlertCircle,
            iconBg: '#FFF7ED',
            iconColor: '#D97706',
        },
        {
            key: 'unusualSpend' as const,
            label: 'Unusual Spending',
            description: 'Flags charges that look out of pattern',
            icon: TrendingUp,
            iconBg: '#FFF5F5',
            iconColor: '#DC2626',
        },
        {
            key: 'largeTransaction' as const,
            label: 'Large Transactions',
            description: 'Alert for any single charge over ₱2,000',
            icon: CheckCircle2,
            iconBg: '#F0FDF4',
            iconColor: '#059669',
        },
        {
            key: 'weeklyReport' as const,
            label: 'Weekly Report',
            description: 'Full breakdown every Sunday morning',
            icon: Bell,
            iconBg: '#F5F3FF',
            iconColor: '#7C3AED',
        },
        {
            key: 'savingsReminder' as const,
            label: 'Savings Reminders',
            description: 'Motivational nudges when under budget',
            icon: CheckCircle2,
            iconBg: '#D1FAE5',
            iconColor: '#059669',
        },
    ];


    if (!isLoaded) return null;

    return (
        <div className="px-4 pt-2 pb-6 space-y-6">
            {/* Profile header */}
            <div className="bg-[#1D3D8F] rounded-3xl p-5 flex items-center gap-4 shadow-lg relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.06]" />
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    {user?.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt="Profile"
                            className="w-14 h-14 rounded-2xl object-cover"
                        />
                    ) : (
                        <span className="text-2xl font-bold text-white">
                            {user?.firstName?.[0] ?? user?.username?.[0] ?? "U"}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">
                        {user?.fullName ?? user?.username}
                    </p>
                    <p className="text-sm text-white/60 truncate">
                        {user?.primaryEmailAddress?.emailAddress}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsEdittingPrimaryAccount(true)
                    }}
                    className="z-[100] flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <Edit3 className="w-4 h-4 text-white/70" strokeWidth={2} />
                </button>
            </div>

            {/* Profile */}
            {isEdittingPrimaryAccount && (
                <SectionCard title="Profile">
                    <EditableField
                        label="Username"
                        value={user?.username ?? ""}
                        onSave={async (value) => {
                            // TODO:
                            await user?.update({
                                username: value,
                            });
                        }}
                    />
                    <EditableField
                        label="First Name"
                        value={user?.firstName ?? ""}
                        onSave={async (value) => {
                            // TODO:
                            await user?.update({
                                firstName: value,
                            });
                        }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];

                            if (!file || !user) return;

                            await user.setProfileImage({
                                file,
                            });
                        }}
                    />
                    <EditableField
                        label="Last Name"
                        value={user?.lastName ?? ""}
                        onSave={async (value) => {
                            // TODO:
                            await user?.update({
                                lastName: value,
                            });
                        }}
                    />
                </SectionCard>
            )}

            {/* Connected emails */}
            <div>
                <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-widest px-1 mb-2">Connected Emails</p>
                <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
                    {connectedEmails.map((email, i) => (
                        <div
                            key={email.id}
                            className={`flex items-center gap-3 px-5 py-4 ${i < connectedEmails.length - 1 || addingEmail ? 'border-b border-[#F2F2F7]' : ''}`}
                        >
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EEF2FB]`}>
                                <Mail className="w-4 h-4" style={{ color: '#1D3D8F' }} strokeWidth={2} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-[#1C1C1E] truncate">{email.address}</p>
                                </div>
                            </div>

                            {/* Remove */}
                            <button
                                onClick={() => handleRemoveEmail(email.id)}
                                className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#F2F2F7] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors group"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-[#AEAEB2] group-hover:text-[#DC2626] transition-colors" strokeWidth={2} />
                            </button>
                        </div>
                    ))}

                    {/* Add email form */}
                    {addingEmail && (
                        <div className="px-5 py-4 space-y-2.5 border-b border-[#F2F2F7]">
                            <p className="text-[11px] font-bold text-[#AEAEB2] uppercase tracking-wide">New email</p>
                            <input
                                ref={newEmailRef}
                                type="email"
                                placeholder="address@example.com"
                                value={newEmailDraft}
                                onChange={(e) => setNewEmailDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAdd(); if (e.key === 'Escape') setAddingEmail(false); }}
                                className="w-full text-sm font-medium text-[#1C1C1E] bg-[#F2F2F7] rounded-xl px-3.5 py-2.5 outline-none border-2 border-[#1D3D8F] placeholder:text-[#AEAEB2]"
                            />
                            <input
                                type="text"
                                placeholder="Label (e.g. Personal, Work)"
                                value={newLabelDraft}
                                onChange={(e) => setNewLabelDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAdd(); if (e.key === 'Escape') setAddingEmail(false); }}
                                className="w-full text-sm font-medium text-[#1C1C1E] bg-[#F2F2F7] rounded-xl px-3.5 py-2.5 outline-none border-2 border-transparent focus:border-[#1D3D8F] placeholder:text-[#AEAEB2]"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleConfirmAdd}
                                    className="flex-1 bg-[#1D3D8F] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#163074] transition-colors"
                                >
                                    Connect
                                </button>
                                <button
                                    onClick={() => setAddingEmail(false)}
                                    className="px-4 bg-[#F2F2F7] text-[#6C6C70] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#E5E5EA] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add button */}
                    {!addingEmail && (
                        <button
                            onClick={handleAddEmail}
                            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-[#F9F9FB] transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-[#EEF2FB] flex items-center justify-center group-hover:bg-[#DBEAFE] transition-colors">
                                <Plus className="w-4 h-4 text-[#1D3D8F]" strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-semibold text-[#1D3D8F]">Add another email</span>
                        </button>
                    )}
                </div>
                <p className="text-[11px] text-[#AEAEB2] mt-2 px-1">
                    Each email is scanned for transaction notifications from your bank and card providers.
                </p>
            </div>

            {/* Account */}
            <SectionCard title="Account">
                <button className="flex items-center justify-between w-full py-3.5 group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#EEF2FB] flex items-center justify-center">
                            <Shield className="w-4 h-4 text-[#1D3D8F]" strokeWidth={2} />
                        </div>
                        <p className="text-sm font-semibold text-[#1C1C1E]">Privacy & Permissions</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#AEAEB2] group-hover:text-[#1D3D8F] transition-colors" />
                </button>
            </SectionCard>

            {/* Budget */}
            <SectionCard title="Budget">
                <EditableField
                    label="Monthly Budget"
                    value={monthlyBudget}
                    prefix="₱"
                    inputType="text"
                    onSave={setMonthlyBudget}
                />
                <EditableField
                    label="Weekly Budget"
                    value={weeklyBudget}
                    prefix="₱"
                    inputType="text"
                    onSave={setWeeklyBudget}
                />
                <div className="py-3.5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wide">This month so far</p>
                        <span className="text-[11px] font-semibold text-[#DC2626]">62% used</span>
                    </div>
                    <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#34D399]" style={{ width: '62%' }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[11px] text-[#AEAEB2]">₱9,300 spent</span>
                        <span className="text-[11px] text-[#AEAEB2]">₱{monthlyBudget} limit</span>
                    </div>
                </div>
            </SectionCard>

            {/* Alerts */}
            <SectionCard title="Alerts & Notifications">
                {/* Summary time picker */}
                <div className="flex items-center justify-between py-3.5">
                    <div>
                        <p className="text-[11px] font-semibold text-[#AEAEB2] uppercase tracking-wide mb-0.5">Daily Summary Time</p>
                        <p className="text-sm font-semibold text-[#1C1C1E]">Send digest at</p>
                    </div>
                    <input
                        type="time"
                        value={summaryTime}
                        onChange={(e) => setSummaryTime(e.target.value)}
                        className="text-sm font-semibold text-[#1D3D8F] bg-[#EEF2FB] rounded-xl px-3 py-1.5 border-none outline-none cursor-pointer"
                    />
                </div>

                {alertItems.map((item) => (
                    <div key={item.key} className="flex items-start justify-between py-3.5 gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: item.iconBg }}
                            >
                                <item.icon className="w-4 h-4" style={{ color: item.iconColor }} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#1C1C1E] leading-tight">{item.label}</p>
                                <p className="text-[11px] text-[#AEAEB2] mt-0.5 leading-snug">{item.description}</p>
                            </div>
                        </div>
                        <Toggle enabled={alerts[item.key]} onChange={() => toggleAlert(item.key)} />
                    </div>
                ))}

                {/* Master mute */}
                <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F2F2F7] flex items-center justify-center">
                            <BellOff className="w-4 h-4 text-[#6C6C70]" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#1C1C1E]">Mute all notifications</p>
                            <p className="text-[11px] text-[#AEAEB2]">Override all alert settings</p>
                        </div>
                    </div>
                    <Toggle
                        enabled={Object.values(alerts).every((v) => !v)}
                        onChange={(v) => {
                            setAlerts({
                                dailySummary: !v,
                                budgetWarning: !v,
                                unusualSpend: !v,
                                weeklyReport: !v,
                                largeTransaction: !v,
                                savingsReminder: !v,
                            });
                        }}
                    />
                </div>
            </SectionCard>

            {/* Danger zone */}
            <SectionCard title="Account Actions">
                <button
                    onClick={() => {
                        signOut({ redirectUrl: "/" })
                    }}
                    className="flex items-center gap-3 w-full py-3.5 group"
                >
                    <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-[#DC2626]" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-[#DC2626]">Sign Out</span>
                </button>
            </SectionCard>

            <p className="text-center text-[11px] text-[#AEAEB2]">FinTrack v1.0.0 · Data encrypted in transit</p>
        </div>
    );
}
