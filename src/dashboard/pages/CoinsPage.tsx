import CoinsWalletCard from '../components/CoinsWalletCard';
import { useDashboard } from '../DashboardLayout';
import { Coins, Brain, Flame } from 'lucide-react';

export default function CoinsPage() {
    const { user } = useDashboard();
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center">
                    <Coins className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                    <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Coins Wallet</h2>
                    <p className="text-sm text-gray-400">Earn and redeem coins</p>
                </div>
            </div>

            {/* Balance */}
            <div className="gradient-bg rounded-[24px] p-8 text-center text-white shadow-xl shadow-indigo-500/20">
                <p className="text-white/70 text-sm font-medium mb-1">Total Balance</p>
                <p className="font-heading font-black text-6xl">🪙 {(user?.coins ?? 0).toLocaleString()}</p>
                <p className="text-white/70 text-sm mt-2">coins</p>
            </div>

            {/* How to earn */}
            <div className="bg-white dark:bg-gray-900 rounded-[24px] p-5 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">💡 How to Earn Coins</h3>
                <div className="space-y-2">
                    {[
                        { icon: Brain, text: '1 correct quiz answer', coins: '+20' },
                        { icon: Brain, text: '3 correct answers', coins: '+60' },
                        { icon: Brain, text: '5 correct answers', coins: '+120' },
                        { icon: Brain, text: 'Perfect score (5/5)', coins: '+200' },
                        { icon: Flame, text: '5-day streak milestone', coins: '+100 XP' },
                    ].map(e => (
                        <div key={e.text} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2.5">
                                <e.icon className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{e.text}</span>
                            </div>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{e.coins}</span>
                        </div>
                    ))}
                </div>
            </div>

            <CoinsWalletCard />
        </div>
    );
}
