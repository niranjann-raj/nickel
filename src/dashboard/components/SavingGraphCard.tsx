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
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="h-[400px] bg-white dark:bg-gray-900 rounded-[24px] animate-pulse border border-gray-100 dark:border-gray-800" />;
    }

    const totalSaved30Days = data.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Savings Trend (30 Days)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        You saved <span className="text-teal-500 font-bold">₹{totalSaved30Days.toLocaleString()}</span> this month
                    </p>
                </div>
                <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-teal-500" />
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={20}
                        />
                        <YAxis 
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }}
                            formatter={(value: number) => [`₹${value}`, 'Saved']}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#14b8a6" 
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
