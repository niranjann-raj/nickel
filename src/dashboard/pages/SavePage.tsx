import SavingWalletCard from '../components/SavingWalletCard';
import StreakCard from '../components/StreakCard';
import { useDashboard } from '../DashboardLayout';
import { IndianRupee, TrendingUp } from 'lucide-react';

export default function SavePage() {
    const { user } = useDashboard();
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                    <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Save Money</h2>
                    <p className="text-sm text-gray-400">Total saved: ₹{(user?.total_saved ?? 0).toLocaleString()}</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Saved', value: `₹${(user?.total_saved ?? 0).toLocaleString()}`, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
                    { label: 'Current Streak', value: `🔥 ${user?.current_streak ?? 0} days`, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'XP Earned', value: `⚡ ${user?.xp ?? 0}`, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
                        <p className={`font-heading font-black text-2xl ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <SavingWalletCard />
            <StreakCard />
        </div>
    );
}
