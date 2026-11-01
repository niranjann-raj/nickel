import MatrixLoader from '../../components/ui/MatrixLoader';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Calendar, Clock, History, CreditCard, ShoppingCart, Zap, CheckCircle2, XCircle, Download, Flame } from 'lucide-react';
import { api } from '../api';
import { useDashboard } from '../DashboardLayout';
import { generateGoalSummaryPDF } from '../../utils/pdfGenerator';
import FutureImpactSimulator from '../components/goals/FutureImpactSimulator';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getGoalCompletionCoins } from '../../utils/goalRewards';

export default function GoalDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useDashboard();
    const [goalData, setGoalData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [netCashFlow, setNetCashFlow] = useState<number | null>(null);
    const [runningAutopay, setRunningAutopay] = useState(false);
    const [autopayFeedback, setAutopayFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [chartMode, setChartMode] = useState<'cumulative' | 'daily'>('cumulative');

    const handleExport = () => {
        setIsExporting(true);
        setExportMessage(null);
        setTimeout(() => {
            try {
                generateGoalSummaryPDF(goalData);
                setExportMessage({ type: 'success', text: 'Goal summary exported successfully.' });
            } catch (err) {
                console.error(err);
                setExportMessage({ type: 'error', text: 'Unable to generate the goal summary. Please try again.' });
            } finally {
                setIsExporting(false);
                setTimeout(() => setExportMessage(null), 3000);
            }
        }, 300);
    };

    const fetchGoal = async () => {
        try {
            const [data, ncfData] = await Promise.all([
                api.get(`/api/goals/${id}`),
                api.goals.getNetCashFlow().catch(() => ({ net_cash_flow: 0 }))
            ]);
            setGoalData(data);
            if (ncfData && typeof ncfData.net_cash_flow === 'number') {
                setNetCashFlow(ncfData.net_cash_flow);
            }
            refreshUser();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRunAutopay = async () => {
        if (!goalData?.id || runningAutopay) return;
        setRunningAutopay(true);
        setAutopayFeedback(null);
        try {
            const res = await api.goals.runAutopay(goalData.id);
            setAutopayFeedback({ type: 'success', text: res.message || 'AutoPay executed successfully! Debited from Main Account Balance.' });
            await fetchGoal();
            refreshUser();
        } catch (err: any) {
            const errMsg = err?.message || 'Failed to run AutoPay';
            setAutopayFeedback({ type: 'error', text: errMsg });
            await fetchGoal();
            refreshUser();
        } finally {
            setRunningAutopay(false);
            setTimeout(() => setAutopayFeedback(null), 7000);
        }
    };

    useEffect(() => {
        fetchGoal();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <MatrixLoader size="lg" variant="orbit" rounded />
                <span className="text-xs text-gray-500 tracking-wider uppercase font-medium">Loading Goal...</span>
            </div>
        );
    }

    if (!goalData) {
        return <div className="text-center p-10 text-gray-500">Goal not found.</div>;
    }

    const { auto_saving, transactions, delay_history, ...goal } = goalData;
    const progress = goal.target_amount > 0 ? (goal.saved_amount / goal.target_amount) * 100 : 0;
    const progressCapped = Math.min(progress, 100).toFixed(0);
    const rewardCoins = goal.completion_reward_coins || getGoalCompletionCoins(goal.target_amount);

    // ── Build comprehensive chart data for savings trend across previous days ──
    // Include both AutoPay (successful) and Manual credits (e.g. skipped purchases)
    const validTxs = (transactions || []).filter((t: any) =>
        (t.type === 'GOAL_AUTOPAY' && (t.status === 'SUCCESS' || !t.status)) ||
        (t.type === 'CREDIT')
    );

    // Group valid deposits by local date string YYYY-MM-DD
    const dailyMap: Record<string, number> = {};
    validTxs.forEach((t: any) => {
        const d = new Date(t.created_at);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${day}`;
        dailyMap[key] = (dailyMap[key] || 0) + Number(t.amount || 0);
    });

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Earliest date from goal.created_at or earliest tx
    let startD = goal.created_at ? new Date(goal.created_at) : todayMidnight;
    validTxs.forEach((t: any) => {
        const d = new Date(t.created_at);
        if (d < startD) startD = d;
    });
    let startMidnight = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate());

    const totalTxSavings = Object.values(dailyMap).reduce((acc, curr) => acc + curr, 0);
    const baseSavings = Math.max(0, (goal.saved_amount || 0) - totalTxSavings);

    const chartData: Array<{
        date: string;
        label: string;
        fullDate: string;
        Saved: number;
        Daily: number;
    }> = [];

    const daySpan = Math.round((todayMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24));
    let curDate = new Date(startMidnight);
    let runningSaved = baseSavings;

    // If span > 60 days, advance start to 60 days ago and aggregate prior savings
    if (daySpan > 60) {
        const cutoff = new Date(todayMidnight.getTime() - 60 * 24 * 60 * 60 * 1000);
        while (curDate < cutoff) {
            const y = curDate.getFullYear();
            const m = String(curDate.getMonth() + 1).padStart(2, '0');
            const day = String(curDate.getDate()).padStart(2, '0');
            const key = `${y}-${m}-${day}`;
            if (dailyMap[key]) {
                runningSaved += dailyMap[key];
            }
            curDate.setDate(curDate.getDate() + 1);
        }
    }

    // Prepend baseline Start point so chart always has an initial anchor
    const startLabel = curDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    chartData.push({
        date: 'Start',
        label: `Start (${startLabel})`,
        fullDate: 'start',
        Saved: runningSaved,
        Daily: 0
    });

    while (curDate <= todayMidnight) {
        const y = curDate.getFullYear();
        const m = String(curDate.getMonth() + 1).padStart(2, '0');
        const day = String(curDate.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${day}`;
        const dailyAmt = dailyMap[key] || 0;
        runningSaved += dailyAmt;

        const isToday = key === todayKey;
        const dateLabel = curDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        chartData.push({
            date: dateLabel,
            label: isToday ? `${dateLabel} (Today)` : dateLabel,
            fullDate: key,
            Saved: runningSaved,
            Daily: dailyAmt
        });

        curDate.setDate(curDate.getDate() + 1);
    }

    // Ensure final point matches goal.saved_amount exactly
    if (chartData.length > 1 && Math.abs(chartData[chartData.length - 1].Saved - (goal.saved_amount || 0)) > 0.01) {
        chartData[chartData.length - 1].Saved = goal.saved_amount || 0;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header / Back */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-300 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                        Goal Details
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {exportMessage && (
                        <span className={`text-sm font-semibold ${exportMessage.type === 'success' ? 'text-gray-300' : 'text-red-500'}`}>
                            {exportMessage.text}
                        </span>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isExporting ? (
                            <MatrixLoader size="sm" variant="orbit" rounded />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isExporting ? 'Generating PDF...' : 'Export Goal Summary'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details & Timeline */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Goal Header Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                        {goal.status === 'COMPLETED' && <div className="absolute top-0 left-0 right-0 h-2 bg-[#111]" />}

                        <div className="w-24 h-24 rounded-3xl bg-[#1a1a1a] dark:bg-[#111] flex items-center justify-center text-5xl shadow-inner flex-shrink-0">
                            {goal.icon}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold font-heading text-gray-900 dark:text-white mb-2">{goal.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{goal.description || 'Saving for your dreams.'}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-8">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Target</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹{goal.target_amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Saved</p>
                                    <p className="text-xl font-bold text-gray-300">₹{goal.saved_amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Est. Completion</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{new Date(goal.current_completion_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        {goal.status === 'COMPLETED' ? 'Reward Won' : 'Completion Reward'}
                                    </p>
                                    <p className="text-xl font-bold text-amber-400 flex items-center gap-1.5">
                                        <span>🪙</span> +{rewardCoins.toLocaleString()} Coins
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-gray-900 dark:text-white">{progressCapped}% Completed</span>
                                    <span className="text-gray-500">₹{(goal.target_amount - goal.saved_amount).toLocaleString()} left</span>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 bg-[#ffffff]"
                                        style={{ width: `${progressCapped}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart & Auto Saving */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                        <Target className="w-4.5 h-4.5 text-emerald-400" />
                                    </div>
                                    <h3 className="font-bold text-lg font-heading text-gray-900 dark:text-white">
                                        Saving Trend
                                    </h3>
                                </div>

                                <div className="flex items-center bg-gray-100 dark:bg-[#0e0e0e] p-1 rounded-xl border border-gray-200 dark:border-[#262626] self-start sm:self-auto shadow-inner">
                                    <button
                                        onClick={() => setChartMode('cumulative')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                            chartMode === 'cumulative'
                                                ? 'bg-white dark:bg-[#262626] text-gray-900 dark:text-white border border-gray-200 dark:border-[#3e3e3e] shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Cumulative
                                    </button>
                                    <button
                                        onClick={() => setChartMode('daily')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                            chartMode === 'daily'
                                                ? 'bg-white dark:bg-[#262626] text-gray-900 dark:text-white border border-gray-200 dark:border-[#3e3e3e] shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Daily Saved
                                    </button>
                                </div>
                            </div>

                            <div className="h-56 w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="goalSavingGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartMode === 'cumulative' ? '#10b981' : '#38bdf8'} stopOpacity={0.28} />
                                                <stop offset="95%" stopColor={chartMode === 'cumulative' ? '#10b981' : '#38bdf8'} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.35} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={6}
                                            minTickGap={20}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => {
                                                if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                                                if (val >= 1000) return `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
                                                return `₹${val}`;
                                            }}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload || !payload.length) return null;
                                                const pt = payload[0].payload;
                                                const isDaily = chartMode === 'daily';
                                                const val = isDaily ? pt.Daily : pt.Saved;
                                                return (
                                                    <div className="bg-[#18181b]/95 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md">
                                                        <p className="text-xs font-bold text-gray-400 mb-1">{pt.label || pt.date}</p>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-base font-black text-white">
                                                                ₹{Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                            <span className={`text-[11px] font-semibold ${isDaily ? 'text-sky-400' : 'text-emerald-400'}`}>
                                                                {isDaily ? 'saved on this day' : 'cumulative saved'}
                                                            </span>
                                                        </div>
                                                        {!isDaily && pt.Daily > 0 && (
                                                            <p className="text-[11px] text-emerald-400/90 font-medium mt-1">
                                                                +₹{pt.Daily.toLocaleString('en-IN')} added on this day
                                                            </p>
                                                        )}
                                                        {!isDaily && goal.target_amount > 0 && (
                                                            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 gap-4">
                                                                <span>Target: ₹{goal.target_amount.toLocaleString('en-IN')}</span>
                                                                <span className="font-bold text-emerald-400">
                                                                    {Math.min(100, (pt.Saved / goal.target_amount) * 100).toFixed(1)}% reached
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey={chartMode === 'cumulative' ? 'Saved' : 'Daily'}
                                            stroke={chartMode === 'cumulative' ? '#10b981' : '#38bdf8'}
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#goalSavingGrad)"
                                            dot={{
                                                r: 3.5,
                                                fill: chartMode === 'cumulative' ? '#10b981' : '#38bdf8',
                                                stroke: '#09090b',
                                                strokeWidth: 2
                                            }}
                                            activeDot={{
                                                r: 6,
                                                fill: chartMode === 'cumulative' ? '#10b981' : '#38bdf8',
                                                stroke: '#ffffff',
                                                strokeWidth: 2
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg font-heading text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-300" /> Auto Saving Info
                                </h3>
                                {auto_saving && goal.status !== 'COMPLETED' && (
                                    <button
                                        onClick={handleRunAutopay}
                                        disabled={runningAutopay}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
                                        title="Debits directly from Main Account Balance"
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                        {runningAutopay ? 'Running...' : 'Run AutoPay'}
                                    </button>
                                )}
                            </div>

                            {autopayFeedback && (
                                <div className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                                    autopayFeedback.type === 'success'
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                }`}>
                                    {autopayFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                                    <div>
                                        <p className="font-semibold">{autopayFeedback.type === 'success' ? 'AutoPay Debited' : 'AutoPay Error'}</p>
                                        <p className="mt-0.5">{autopayFeedback.text}</p>
                                    </div>
                                </div>
                            )}

                            {auto_saving ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <span className="text-sm text-gray-500">Frequency</span>
                                        <span className="font-bold">{auto_saving.frequency}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <span className="text-sm text-gray-500">Daily Streak</span>
                                        {auto_saving.frequency === 'DAILY' ? (
                                            <span className="inline-flex items-center gap-1 font-bold text-xs text-orange-400">
                                                <Flame className="w-3.5 h-3.5" /> Active (+50 XP/day)
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Inactive (Requires Daily frequency)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <span className="text-sm text-gray-500">Amount</span>
                                        <span className="font-bold text-gray-300">₹{auto_saving.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <span className="text-sm text-gray-500">Funding Source</span>
                                        <span className="font-bold text-xs text-gray-900 dark:text-white">Main Account Balance</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <span className="text-sm text-gray-500">Available Balance</span>
                                        <span className={`font-bold ${netCashFlow != null && netCashFlow >= (auto_saving.amount || 0) ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {netCashFlow != null ? `₹${netCashFlow.toLocaleString()}` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <span className="text-sm text-gray-500">Next Run</span>
                                        <span className="font-bold">{auto_saving.next_run_date ? new Date(auto_saving.next_run_date).toLocaleDateString() : 'TBD'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-6">No auto-saving configured.</p>
                            )}
                        </div>
                    </div>

                    {/* Timeline / Goal Delay History */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg font-heading mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-300" /> Completion Timeline
                        </h3>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">

                            {/* Original */}
                            <div className="relative">
                                <div className="absolute -left-[31px] bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 w-4 h-4 rounded-full"></div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Original Target</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(goal.original_completion_date).toLocaleDateString()}</p>
                            </div>

                            {/* Delays */}
                            {delay_history.map((dh: any) => (
                                <div key={dh.id} className="relative">
                                    <div className="absolute -left-[31px] bg-white dark:bg-gray-900 border-2 border-red-400 w-4 h-4 rounded-full"></div>
                                    <p className="text-sm font-bold text-red-500 uppercase tracking-wide">Delayed by {dh.delay_days} days</p>
                                    <p className="text-sm text-gray-500">Bought {dh.purchase_name} for ₹{dh.purchase_amount}</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white line-through opacity-50">{new Date(dh.previous_completion_date).toLocaleDateString()}</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(dh.new_completion_date).toLocaleDateString()}</p>
                                </div>
                            ))}

                            {/* Current */}
                            <div className="relative">
                                <div className="absolute -left-[31px] bg-white dark:bg-gray-900 border-2 border-[#333] w-4 h-4 rounded-full"></div>
                                <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">Current Target</p>
                                <p className="text-lg font-bold text-gray-400 dark:text-white">{new Date(goal.current_completion_date).toLocaleDateString()}</p>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Right Column - Simulator & History */}
                <div className="space-y-6">

                    {goal.status !== 'COMPLETED' && (
                        <FutureImpactSimulator goal={goal} onDecision={fetchGoal} />
                    )}

                    {/* Transaction History */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg font-heading mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-300" /> Recent Activity
                        </h3>

                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No activity yet.</p>
                            ) : (
                                transactions.slice(0, 5).map((t: any) => {
                                    const isAutoPay = t.type === 'GOAL_AUTOPAY';
                                    const isCredit = t.type === 'CREDIT';
                                    const isSplurge = t.type === 'SPLURGE';
                                    const isSuccess = t.status === 'SUCCESS' || !t.status;

                                    let iconNode = <CreditCard className="w-4 h-4" />;
                                    let iconBg = 'bg-[#111] text-gray-400 dark:bg-[#111]';
                                    let amountSign = '+';
                                    let amountClass = 'text-gray-300 dark:text-white';

                                    if (isAutoPay) {
                                        if (isSuccess) {
                                            iconNode = <Zap className="w-4 h-4 text-emerald-400" />;
                                            iconBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                                            amountSign = '+';
                                            amountClass = 'text-emerald-400';
                                        } else {
                                            iconNode = <XCircle className="w-4 h-4 text-red-400" />;
                                            iconBg = 'bg-red-500/10 text-red-400 border border-red-500/20';
                                            amountSign = '';
                                            amountClass = 'text-red-400';
                                        }
                                    } else if (isCredit) {
                                        iconNode = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                                        iconBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                                        amountSign = '+';
                                        amountClass = 'text-emerald-400';
                                    } else if (isSplurge) {
                                        iconNode = <ShoppingCart className="w-4 h-4 text-amber-400" />;
                                        iconBg = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                                        amountSign = '-';
                                        amountClass = 'text-amber-400';
                                    }

                                    return (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${iconBg}`}>
                                                    {iconNode}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{t.description || (isAutoPay ? 'Goal AutoPay' : t.type)}</p>
                                                    <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className={`font-bold text-sm ${amountClass}`}>
                                                {amountSign}₹{Number(t.amount || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>
            {/* Goal AutoPay Transaction History (Full Width) */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg font-heading text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-gray-300" /> Goal AutoPay History
                    </h3>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Last 30 transactions</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                                <th className="pb-4 font-semibold px-4">Date & Time</th>
                                <th className="pb-4 font-semibold px-4">Goal Name</th>
                                <th className="pb-4 font-semibold px-4 text-right">Amount</th>
                                <th className="pb-4 font-semibold px-4 text-center">Status</th>
                                <th className="pb-4 font-semibold px-4">Source</th>
                                <th className="pb-4 font-semibold px-4 text-right">Remaining Goal</th>
                                <th className="pb-4 font-semibold px-4 text-right">Total Saved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.filter((t: any) => t.type === 'GOAL_AUTOPAY').slice(0, 30).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">No AutoPay transactions yet.</td>
                                </tr>
                            ) : (
                                transactions.filter((t: any) => t.type === 'GOAL_AUTOPAY').slice(0, 30).map((t: any) => (
                                    <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-300">
                                            <div>{new Date(t.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-400">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">{goal.name}</td>
                                        <td className="py-4 px-4 text-sm font-bold text-right text-gray-900 dark:text-white">₹{t.amount.toLocaleString()}</td>
                                        <td className="py-4 px-4 text-center">
                                            {t.status === 'SUCCESS' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#111] text-gray-500 dark:bg-[#111] dark:text-white">
                                                    <CheckCircle2 className="w-3 h-3" /> Success
                                                </span>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        <XCircle className="w-3 h-3" /> Failed
                                                    </span>
                                                    <span className="text-[10px] text-red-500 max-w-[120px] truncate" title={t.reason}>{t.reason}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">{t.source || 'Net Cash Flow'}</td>
                                        <td className="py-4 px-4 text-sm font-medium text-right text-gray-500">
                                            {t.remaining_balance != null ? `₹${t.remaining_balance.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="py-4 px-4 text-sm font-bold text-right text-gray-300">
                                            {t.current_balance != null ? `₹${t.current_balance.toLocaleString()}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
