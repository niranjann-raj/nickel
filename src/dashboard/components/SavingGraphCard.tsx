import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, IndianRupee } from 'lucide-react';
import { api } from '../api';

export default function SavingGraphCard() {
    const [data, setData] = useState<{ date: string; label: string; amount: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/savings-history')
            .then((res) => {
                setData(res.history || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="h-[400px] bg-white dark:bg-gray-900 rounded-[24px] animate-pulse border border-gray-100 dark:border-gray-800" />;
    }

    const totalSaved30Days = data.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="glass-panel card-glow rounded-[24px] p-8 border border-gray-100 dark:border-white/5 flex flex-col h-[420px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#111] rounded-full blur-[80px]" />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-white" />
                        Savings Trend (30 Days)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        You saved <span className="text-gray-300 font-bold">₹{totalSaved30Days.toLocaleString()}</span> this month
                    </p>
                </div>
                <div className="w-12 h-12 bg-[#1a1a1a] dark:bg-[#111] rounded-2xl flex items-center justify-center border border-[#333] dark:border-[#333] shadow-sm">
                    <IndianRupee className="w-6 h-6 text-gray-300 dark:text-white" />
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 mt-2 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
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
                            tickFormatter={(value) => `₹${value}`}
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
                            formatter={(value: number) => [`₹${value}`, 'Saved']}
                            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
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
