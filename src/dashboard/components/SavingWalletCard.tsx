import { useState } from 'react';
import { PiggyBank, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { useDashboard } from '../DashboardLayout';

const LEVELS = [
    { key: 'easy', label: 'Easy', pct: '20%', xp: '+100 XP', color: 'border-teal-400 bg-teal-50 dark:bg-teal-900/20', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-800/30 dark:text-teal-300' },
    { key: 'medium', label: 'Medium', pct: '30%', xp: '+200 XP', color: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800/30 dark:text-indigo-300' },
    { key: 'hard', label: 'Hard', pct: '40%', xp: '+300 XP', color: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300' },
];

export default function SavingWalletCard() {
    const { refreshUser } = useDashboard();
    const [amount, setAmount] = useState('');
    const [level, setLevel] = useState('easy');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const cfg = LEVELS.find(l => l.key === level)!;
    const preview = amount && !isNaN(Number(amount)) && Number(amount) > 0
        ? {
            saved: Math.round(Number(amount) * (level === 'easy' ? 0.2 : level === 'medium' ? 0.3 : 0.4) * 100) / 100,
            remaining: Math.round(Number(amount) * (level === 'easy' ? 0.8 : level === 'medium' ? 0.7 : 0.6) * 100) / 100
        }
        : null;

    const handleSave = async () => {
        if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
        setError(''); setLoading(true); setResult(null);
        try {
            const data = await api.post('/api/add-saving', { amount: Number(amount), level });
            setResult(data);
            setAmount('');
            refreshUser();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Saving Wallet</h3>
                    <p className="text-xs text-gray-400">Save money & earn XP</p>
                </div>
            </div>

            {result ? (
                <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-bold text-xl text-gray-900 dark:text-white mb-1">₹{result.saved_amount} Saved! 🎉</p>
                    <p className="text-gray-500 text-sm mb-3">Remaining: ₹{result.remaining}</p>
                    <div className="flex justify-center gap-3 flex-wrap">
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold">+{result.xp_earned} XP</span>
                        {result.streak_bonus_xp > 0 && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-bold">+{result.streak_bonus_xp} Streak Bonus XP 🔥</span>}
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-bold">🔥 {result.current_streak} day streak</span>
                    </div>
                    <button onClick={() => setResult(null)} className="mt-4 text-sm text-indigo-500 hover:underline">Save again</button>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Enter Amount</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="1000"
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        {preview && (
                            <div className="mt-2 flex gap-3 text-xs">
                                <span className="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-lg font-medium">Saved: ₹{preview.saved}</span>
                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded-lg font-medium">Remaining: ₹{preview.remaining}</span>
                            </div>
                        )}
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Difficulty</label>
                        <div className="grid grid-cols-3 gap-2">
                            {LEVELS.map(l => (
                                <button
                                    key={l.key}
                                    onClick={() => setLevel(l.key)}
                                    className={`border-2 rounded-2xl p-3 text-center transition-all ${level === l.key ? l.color + ' border-opacity-100 scale-105 shadow-md' : 'border-gray-200 dark:border-gray-700 bg-transparent hover:border-gray-300'}`}
                                >
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{l.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Save {l.pct}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${l.badge}`}>{l.xp}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-500 px-3 py-2 rounded-xl text-sm mb-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full gradient-bg text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
                    >
                        {loading ? 'Saving…' : `Save Money (${cfg.pct})`}
                    </button>
                </>
            )}
        </div>
    );
}
