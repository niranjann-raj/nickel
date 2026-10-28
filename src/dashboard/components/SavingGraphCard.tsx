import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, IndianRupee } from 'lucide-react';
import { api } from '../api';

export default function SavingGraphCard() {
    const [data, setData] = useState<{ date: string; label: string; amount: number; cumulative: number }[]>([]);
    const [totalGoalSaved, setTotalGoalSaved] = useState<number>(0);
    const [totalMonthSaved, setTotalMonthSaved] = useState<number>(0);
    const [viewMode, setViewMode] = useState<'cumulative' | 'daily'>('cumulative');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/savings-history')
            .then((res) => {
                setData(res.history || []);
                setTotalGoalSaved(res.total_goal_saved ?? 0);
                setTotalMonthSaved(res.total_month_saved ?? 0);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="h-[420px] bg-white dark:bg-gray-900 rounded-[24px] animate-pulse border border-gray-100 dark:border-gray-800" />;
    }

    const currentTotal = totalGoalSaved > 0 ? totalGoalSaved : data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const monthTotal = totalMonthSaved > 0 ? totalMonthSaved : data.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return (
        <div className="glass-panel card-glow rounded-[24px] p-8 border border-gray-100 dark:border-white/5 flex flex-col h-[420px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#111] rounded-full blur-[80px]" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
                <div>
                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-white" />
                        Savings Trend (Goal Savings)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {viewMode === 'cumulative' ? (
                            <>
                                Total saved in goals: <span className="text-white font-bold">₹{currentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                {monthTotal > 0 && <span className="text-zinc-500 ml-1.5">(+₹{monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month)</span>}
                            </>
                        ) : (
                            <>
                                You saved <span className="text-white font-bold">₹{monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> towards goals this month
                            </>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {/* View mode toggle */}
                    <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('cumulative')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                viewMode === 'cumulative'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Total Saved
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('daily')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                viewMode === 'daily'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Daily Saved
                        </button>
                    </div>

                    <div className="w-10 h-10 bg-[#1a1a1a] dark:bg-[#111] rounded-xl flex items-center justify-center border border-[#333] shadow-sm shrink-0">
                        <IndianRupee className="w-5 h-5 text-gray-300 dark:text-white" />
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 mt-2 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 12, fill: '#71717a' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={20}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#71717a' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 15, 15, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                color: '#fff',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                            }}
                            itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                            formatter={(value: any) => [
                                `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                viewMode === 'cumulative' ? 'Total Saved in Goals' : 'Daily Goal Savings'
                            ]}
                            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={viewMode === 'cumulative' ? 'cumulative' : 'amount'}
                            stroke="#ffffff"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
