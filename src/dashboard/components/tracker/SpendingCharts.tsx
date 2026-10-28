import { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Store, Target, Plus, AlertCircle } from 'lucide-react';

export interface TrendItem {
    date: string;
    label: string;
    expense: number;
    income: number;
    net: number;
}

export interface CategoryBreakdownItem {
    name: string;
    amount: number;
    percentage: number;
    count: number;
    color: string;
}

export interface MerchantItem {
    merchant: string;
    amount: number;
    percentage: number;
    count: number;
}

export interface BudgetItem {
    id: number;
    category_name: string;
    month: string;
    budget_amount: number;
    actual_spent: number;
    remaining_amount: number;
    overspent_amount: number;
    percentage: number;
    is_overspent: boolean;
}

interface SpendingChartsProps {
    trendData: TrendItem[];
    categoryData: CategoryBreakdownItem[];
    merchantData: MerchantItem[];
    budgetData: BudgetItem[];
    trendInterval: 'daily' | 'weekly' | 'monthly';
    onTrendIntervalChange: (interval: 'daily' | 'weekly' | 'monthly') => void;
    onSelectCategory?: (category: string) => void;
    onSelectMerchant?: (merchant: string) => void;
    onManageBudgets?: () => void;
}

export default function SpendingCharts({
    trendData,
    categoryData,
    merchantData,
    budgetData,
    trendInterval,
    onTrendIntervalChange,
    onSelectCategory,
    onSelectMerchant,
    onManageBudgets
}: SpendingChartsProps) {
    const [chartTab, setChartTab] = useState<'overview' | 'merchants' | 'budgets'>('overview');

    const formatINR = (val: number) => {
        return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    };

    const hasExpenses = categoryData.length > 0;
    const totalExpenses = categoryData.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Chart Sub-navigation */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setChartTab('overview')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            chartTab === 'overview'
                                ? 'bg-white text-black shadow-md'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Trend & Categories</span>
                    </button>
                    <button
                        onClick={() => setChartTab('merchants')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            chartTab === 'merchants'
                                ? 'bg-white text-black shadow-md'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Store className="w-3.5 h-3.5" />
                        <span>Top Merchants</span>
                    </button>
                    <button
                        onClick={() => setChartTab('budgets')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            chartTab === 'budgets'
                                ? 'bg-white text-black shadow-md'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Target className="w-3.5 h-3.5" />
                        <span>Budgets vs Actual</span>
                        {budgetData.some(b => b.is_overspent) && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                    </button>
                </div>

                {chartTab === 'overview' && (
                    <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-xl border border-white/5">
                        {(['daily', 'weekly', 'monthly'] as const).map((interval) => (
                            <button
                                key={interval}
                                onClick={() => onTrendIntervalChange(interval)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                                    trendInterval === interval
                                        ? 'bg-white/15 text-white font-semibold'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {interval}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* TAB 1: OVERVIEW (Trend + Donut Breakdown) */}
            {chartTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Spending Trend Area Chart */}
                    <div className="lg:col-span-7 bg-[#111113] border border-white/10 rounded-2xl p-5 flex flex-col h-[380px] relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-gray-400" />
                                    Cash Flow & Spending Trend
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Compare income inflows with daily/weekly spending
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                    <span className="text-gray-400">Expense</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    <span className="text-gray-400">Income</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={8}
                                            minTickGap={25}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `₹${val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '12px',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                                            }}
                                            formatter={(value: any, name: any) => [formatINR(Number(value)), name === 'expense' ? 'Expense' : 'Income']}
                                            labelStyle={{ color: '#a1a1aa', fontWeight: 600, marginBottom: '4px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expense"
                                            stroke="#f43f5e"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorExpense)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorIncome)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                                    No transaction activity in this range
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Breakdown Donut Chart */}
                    <div className="lg:col-span-5 bg-[#111113] border border-white/10 rounded-2xl p-5 flex flex-col h-[380px]">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <PieIcon className="w-4 h-4 text-gray-400" />
                                    Category Breakdown
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Total: {formatINR(totalExpenses)}
                                </p>
                            </div>
                        </div>

                        {hasExpenses ? (
                            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 min-h-0">
                                {/* Donut */}
                                <div className="w-full md:w-1/2 h-[180px] md:h-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                dataKey="amount"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                paddingAngle={2}
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color || '#888888'}
                                                        stroke="#111113"
                                                        strokeWidth={2}
                                                        className="cursor-pointer transition-opacity hover:opacity-80"
                                                        onClick={() => onSelectCategory && onSelectCategory(entry.name)}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#18181b',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    fontSize: '12px',
                                                }}
                                                formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Custom Legend / List */}
                                <div className="w-full md:w-1/2 flex-1 overflow-y-auto max-h-[260px] pr-1 space-y-2 scrollbar-none text-xs">
                                    {categoryData.map((cat) => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                                            className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-gray-300 font-medium truncate group-hover:text-white">
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-2">
                                                <div className="text-white font-semibold">{formatINR(cat.amount)}</div>
                                                <div className="text-[10px] text-gray-500">{cat.percentage}%</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center p-4">
                                <p>No categorized expenses recorded for this timeframe.</p>
                                <p className="text-[11px] text-gray-600 mt-1">Add transactions or scan bills to populate breakdown.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: MERCHANTS (Ranked Bar Chart) */}
            {chartTab === 'merchants' && (
                <div className="bg-[#111113] border border-white/10 rounded-2xl p-5 flex flex-col min-h-[380px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Store className="w-4 h-4 text-gray-400" />
                                Top Merchants by Spending
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Identify vendors and shops with the largest financial share
                            </p>
                        </div>
                    </div>

                    {merchantData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            {/* Horizontal Bar Chart */}
                            <div className="lg:col-span-8 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={merchantData.slice(0, 7)}
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `₹${val}`}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="merchant"
                                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={110}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '12px'
                                            }}
                                            formatter={(val: any) => [formatINR(Number(val)), 'Spent']}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="#e4e4e7"
                                            radius={[0, 8, 8, 0]}
                                            className="cursor-pointer hover:opacity-80"
                                            onClick={(entry: any) => onSelectMerchant && onSelectMerchant(entry?.merchant || entry?.payload?.merchant || '')}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Merchant Ranking Cards */}
                            <div className="lg:col-span-4 flex flex-col gap-2.5">
                                {merchantData.slice(0, 5).map((m, idx) => (
                                    <div
                                        key={m.merchant}
                                        onClick={() => onSelectMerchant && onSelectMerchant(m.merchant)}
                                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-white/10 text-gray-300 font-bold text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                                                    {m.merchant}
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    {m.count} transaction{m.count > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-white">{formatINR(m.amount)}</div>
                                            <div className="text-[10px] text-gray-400">{m.percentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs py-12">
                            No merchant data recorded in this period.
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: BUDGETS VS ACTUAL */}
            {chartTab === 'budgets' && (
                <div className="bg-[#111113] border border-white/10 rounded-2xl p-5 flex flex-col min-h-[380px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-400" />
                                Category Budgets vs Actual Spend
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Monitor monthly budget ceilings and prevent category overspending
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onManageBudgets}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Set Budget</span>
                        </button>
                    </div>

                    {budgetData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {budgetData.map((b) => {
                                const isOver = b.is_overspent;
                                const progressPct = Math.min(100, b.percentage);

                                return (
                                    <div
                                        key={b.id}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">{b.category_name}</span>
                                            {isOver ? (
                                                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Over by {formatINR(b.overspent_amount)}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    {formatINR(b.remaining_amount)} left
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="my-3">
                                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isOver
                                                            ? 'bg-rose-500'
                                                            : b.percentage > 80
                                                            ? 'bg-amber-400'
                                                            : 'bg-emerald-400'
                                                    }`}
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>Spent: <strong className="text-white">{formatINR(b.actual_spent)}</strong></span>
                                            <span>Budget: <strong className="text-white">{formatINR(b.budget_amount)}</strong></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                            <Target className="w-10 h-10 text-gray-600 mb-3" />
                            <p className="text-sm font-semibold text-gray-300">No monthly budgets configured yet</p>
                            <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                                Set spending targets for your key categories (e.g. Dining, Shopping) to track your limits effortlessly.
                            </p>
                            <button
                                type="button"
                                onClick={onManageBudgets}
                                className="px-4 py-2 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-200 transition-colors"
                            >
                                Create Your First Budget
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
