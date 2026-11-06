import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Calendar as CustomCalendar } from '@/components/ui/calendar';

export type FilterPeriod = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'last_3_months' | 'all_time' | 'custom';

interface TimeFilterBarProps {
    period: FilterPeriod;
    startDate: string;
    endDate: string;
    onPeriodChange: (period: FilterPeriod, start: string, end: string) => void;
}

export function computeDatesForPeriod(p: FilterPeriod): { start: string; end: string } {
    const today = new Date();
    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (p === 'this_week') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const monday = new Date(today);
        monday.setDate(diff);
        return { start: formatDate(monday), end: formatDate(today) };
    }

    if (p === 'last_week') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7;
        const lastMonday = new Date(today);
        lastMonday.setDate(diff);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        return { start: formatDate(lastMonday), end: formatDate(lastSunday) };
    }

    if (p === 'this_month') {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: formatDate(first), end: formatDate(today) };
    }

    if (p === 'last_month') {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start: formatDate(first), end: formatDate(last) };
    }

    if (p === 'last_3_months') {
        // Go back 3 full months
        const first = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        return { start: formatDate(first), end: formatDate(today) };
    }

    if (p === 'all_time') {
        return { start: '2020-01-01', end: formatDate(today) };
    }

    // Default to this month
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: formatDate(first), end: formatDate(today) };
}

export default function TimeFilterBar({ period, startDate, endDate, onPeriodChange }: TimeFilterBarProps) {
    const [showCustom, setShowCustom] = useState(period === 'custom');
    const [customStart, setCustomStart] = useState(startDate);
    const [customEnd, setCustomEnd] = useState(endDate);
    const [showCalendar, setShowCalendar] = useState(false);

    const options: { id: FilterPeriod; label: string }[] = [
        { id: 'this_week', label: 'This Week' },
        { id: 'last_week', label: 'Last Week' },
        { id: 'this_month', label: 'This Month' },
        { id: 'last_month', label: 'Last Month' },
        { id: 'last_3_months', label: 'Last 3 Months' },
        { id: 'all_time', label: 'All Time' },
        { id: 'custom', label: 'Custom' },
    ];

    const handleSelect = (p: FilterPeriod) => {
        if (p === 'custom') {
            setShowCustom(true);
            onPeriodChange('custom', customStart, customEnd);
        } else {
            setShowCustom(false);
            setShowCalendar(false);
            const { start, end } = computeDatesForPeriod(p);
            onPeriodChange(p, start, end);
        }
    };

    const formatDisplayRange = (s: string, e: string) => {
        try {
            const startD = new Date(s);
            const endD = new Date(e);
            const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
            return `${startD.toLocaleDateString(undefined, opts)} – ${endD.toLocaleDateString(undefined, opts)}`;
        } catch {
            return `${s} to ${e}`;
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 px-3.5 shadow-sm">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {options.map((opt) => {
                    const isActive = period === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelect(opt.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                                isActive
                                    ? 'bg-white text-black shadow-md font-bold'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            {/* Date Range Display & Custom Inputs */}
            <div className="relative flex items-center gap-2 text-xs text-gray-400 self-end md:self-auto">
                {showCustom ? (
                    <button
                        type="button"
                        onClick={() => setShowCalendar(p => !p)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            showCalendar ? 'bg-white/15 border-white/20 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDisplayRange(customStart || startDate, customEnd || endDate)}</span>
                        <span className="text-[10px] text-gray-400 underline decoration-dotted">Pick Dates</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowCalendar(p => !p)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-gray-300 font-medium transition-colors cursor-pointer ${showCalendar ? 'bg-white/15 border-white/20 text-white' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDisplayRange(startDate, endDate)}</span>
                        <span className="text-[10px] text-gray-400 ml-1 underline decoration-dotted">Show Calendar</span>
                    </button>
                )}

                {showCalendar && (
                    <div className="absolute right-0 top-full mt-2 z-50 p-3 bg-[#111113] border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs text-gray-300 font-semibold">
                            <span>Pick Date Range</span>
                            <button
                                type="button"
                                onClick={() => setShowCalendar(false)}
                                className="text-gray-400 hover:text-white px-1 text-sm leading-none"
                            >
                                ✕
                            </button>
                        </div>
                        <CustomCalendar
                            mode="range"
                            selected={{
                                from: customStart ? new Date(customStart + 'T00:00:00') : (startDate ? new Date(startDate + 'T00:00:00') : undefined),
                                to: customEnd ? new Date(customEnd + 'T00:00:00') : (endDate ? new Date(endDate + 'T00:00:00') : undefined),
                            }}
                            onSelect={(range) => {
                                if (range?.from) {
                                    const y = range.from.getFullYear();
                                    const m = String(range.from.getMonth() + 1).padStart(2, '0');
                                    const d = String(range.from.getDate()).padStart(2, '0');
                                    const startStr = `${y}-${m}-${d}`;
                                    setCustomStart(startStr);
                                    if (range.to) {
                                        const y2 = range.to.getFullYear();
                                        const m2 = String(range.to.getMonth() + 1).padStart(2, '0');
                                        const d2 = String(range.to.getDate()).padStart(2, '0');
                                        const endStr = `${y2}-${m2}-${d2}`;
                                        setCustomEnd(endStr);
                                        onPeriodChange('custom', startStr, endStr);
                                        setShowCalendar(false);
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
