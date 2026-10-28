import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Calendar, Layers, Repeat } from 'lucide-react';

export interface TrackerSummaryData {
    period: {
        start_date: string;
        end_date: string;
        days_count: number;
    };
    totals: {
        total_income: number;
        total_expenses: number;
        net_cash_flow: number;
        average_daily_spending: number;
        transaction_count: number;
        monthly_subscription_cost: number;
    };
    largest_category: {
        name: string;
        amount: number;
        percentage: number;
    };
    comparison: {
        previous_expenses: number;
        previous_income: number;
        expense_change_amount: number;
        expense_change_percentage: number;
        income_change_amount: number;
        income_change_percentage: number;
    };
}

interface TrackerOverviewCardsProps {
    data: TrackerSummaryData | null;
    loading: boolean;
}

export default function TrackerOverviewCards({ data, loading }: TrackerOverviewCardsProps) {
    if (loading || !data) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-[#141416] border border-white/5 animate-pulse p-4 flex flex-col justify-between" />
                ))}
            </div>
        );
    }

    const formatINR = (val: number) => {
        return '₹' + Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const expChange = data.comparison.expense_change_percentage;
    const isExpUp = expChange > 0;
    const isCashFlowPositive = data.totals.net_cash_flow >= 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Total Income */}
            <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm group">
                <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Income</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4" />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-xl font-bold text-white tracking-tight">
                        {formatINR(data.totals.total_income)}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        <span>Period total</span>
                    </div>
                </div>
            </div>

            {/* 2. Total Expenses */}
            <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm group">
                <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Expenses</span>
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-xl font-bold text-white tracking-tight">
                        {formatINR(data.totals.total_expenses)}
                    </div>
                    <div className="text-[11px] mt-1 flex items-center gap-1">
                        {expChange !== 0 ? (
                            <>
                                <span className={isExpUp ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                                    {isExpUp ? `+${expChange}%` : `${expChange}%`}
                                </span>
                                <span className="text-gray-500">vs prev</span>
                            </>
                        ) : (
                            <span className="text-gray-500">Same as prev period</span>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Net Cash Flow */}
            <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm group">
                <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Net Cash Flow</span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCashFlowPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {isCashFlowPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                </div>
                <div className="mt-2">
                    <div className={`text-xl font-bold tracking-tight ${isCashFlowPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {data.totals.net_cash_flow < 0 && '-'}{formatINR(data.totals.net_cash_flow)}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                        {isCashFlowPositive ? 'Net surplus' : 'Net deficit'}
                    </div>
                </div>
            </div>

            {/* 4. Average Daily Spending */}
            <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm group">
                <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Daily Average</span>
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-xl font-bold text-white tracking-tight">
                        {formatINR(data.totals.average_daily_spending)}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                        Across {data.period.days_count} days
                    </div>
                </div>
            </div>

            {/* 5. Largest Category */}
            <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm group">
                <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Top Category</span>
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-sm font-bold text-white truncate" title={data.largest_category.name}>
                        {data.largest_category.name !== 'None' ? data.largest_category.name : '—'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-between">
                        <span>{data.largest_category.name !== 'None' ? formatINR(data.largest_category.amount) : '₹0.00'}</span>
                        {data.largest_category.percentage > 0 && (
                            <span className="text-[10px] text-amber-400 font-semibold">{data.largest_category.percentage}%</span>
                        )}
                    </div>
                </div>
            </div>

            {/* 6. Subscriptions Monthly Cost */}
            <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 flex flex-col justify-between hover:border-white/20 transition-all shadow-sm group">
                <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Subscriptions</span>
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <Repeat className="w-4 h-4" />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-xl font-bold text-white tracking-tight">
                        {formatINR(data.totals.monthly_subscription_cost)}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                        Est. monthly run-rate
                    </div>
                </div>
            </div>
        </div>
    );
}
