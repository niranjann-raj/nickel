import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, CheckCircle2, Clock, Wallet, ShieldCheck } from 'lucide-react';
import { api } from '../../api';

interface SplitAnalyticsTabProps {
    roomId: number;
    currency: string;
}

const DEFAULT_COLORS = ['#FFFFFF', '#10B981', '#F43F5E', '#E4E4E7', '#A1A1AA', '#71717A', '#52525B', '#3F3F46'];

export default function SplitAnalyticsTab({ roomId, currency }: SplitAnalyticsTabProps) {
    const [analytics, setAnalytics] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const data = await api.split.getAnalytics(roomId);
                if (mounted) setAnalytics(data);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchAnalytics();
        return () => { mounted = false; };
    }, [roomId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <MatrixLoader size="md" variant="orbit" rounded />
                <span className="text-xs text-gray-500 tracking-wider uppercase font-medium">Loading Analytics...</span>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Failed to load analytics for this room.
            </div>
        );
    }

    const {
        spending_by_member = [],
        shares_by_member = [],
        spending_by_category = [],
        spending_over_time = [],
        settlement_overview = {}
    } = analytics;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-3 rounded-xl bg-[#18181c] border border-white/10 text-white text-xs shadow-xl space-y-1">
                    <p className="font-semibold text-gray-300">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="font-mono text-white">
                            {entry.name}: {currency} {Number(entry.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                        <span>Total Spending</span>
                        <Wallet className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white pt-1">
                        {currency} {Number(settlement_overview.total_spent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-gray-400">Recorded group expenses</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                        <span>Settled Amount</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                        {currency} {Number(settlement_overview.total_settled_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-gray-400">{settlement_overview.completed_payments_count || 0} transfers confirmed</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                        <span>Outstanding</span>
                        <Clock className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-rose-500 dark:text-rose-400 pt-1">
                        {currency} {Number(settlement_overview.total_outstanding_debt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-gray-400">{settlement_overview.pending_payments_count || 0} transfers pending</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                        <span>Progress</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-emerald-500 dark:text-emerald-400 pt-1">
                        {settlement_overview.settlement_progress_percentage || 0}%
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${settlement_overview.settlement_progress_percentage || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Charts Grid: 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Spending by Member (Paid) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                                Spending by Member (Amount Paid)
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total upfront money contributed by each member</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        {spending_by_member.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                No spending records yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={spending_by_member} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#888', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                        angle={-15}
                                        textAnchor="end"
                                    />
                                    <YAxis
                                        tick={{ fill: '#888', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                    <Bar dataKey="amount" name="Paid" fill="#10B981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 2. Expense Share by Member (Owed) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-rose-400" />
                                Expense Share by Member (Cost Incurred)
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total allocated share responsibility per member</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        {shares_by_member.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                No allocated shares yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={shares_by_member} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#888', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                        angle={-15}
                                        textAnchor="end"
                                    />
                                    <YAxis
                                        tick={{ fill: '#888', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                    <Bar dataKey="share" name="Share" fill="#F43F5E" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 3. Spending by Category (Donut Pie) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <PieIcon className="w-4 h-4 text-zinc-400" />
                                Spending by Category
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Distribution across accommodation, food, travel, etc.</p>
                        </div>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center">
                        {spending_by_category.length === 0 ? (
                            <div className="text-xs text-gray-400">No categorized expenses</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={spending_by_category}
                                        dataKey="amount"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                    >
                                        {spending_by_category.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconSize={8}
                                        iconType="circle"
                                        formatter={(val) => <span className="text-xs text-gray-600 dark:text-gray-400">{val}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 4. Spending Over Time (Cumulative Line Chart) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-white" />
                                Spending Over Time
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cumulative group expenditure progression</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        {spending_over_time.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                No spending history yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={spending_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#888', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(d) => d.slice(5)}
                                    />
                                    <YAxis
                                        tick={{ fill: '#888', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="cumulative"
                                        name="Cumulative Total"
                                        stroke="#FFFFFF"
                                        strokeWidth={2.5}
                                        dot={{ fill: '#FFFFFF', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
