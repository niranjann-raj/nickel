import { useDashboard } from '../DashboardLayout';
import { Zap, Flame, IndianRupee, Star } from 'lucide-react';

function XPBar({ xp, xpMax }: { xp: number; xpMax: number }) {
    const pct = Math.min(100, Math.round((xp / xpMax) * 100));
    return (
        <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                <span>{xp.toLocaleString()} XP</span>
                <span>{xpMax.toLocaleString()} XP</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full gradient-bg rounded-full transition-all duration-700 relative"
                    style={{ width: `${pct}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{pct}% to Level {0}</p>
        </div>
    );
}

export default function UserSummaryCard() {
    const { user, loading } = useDashboard();

    if (loading) return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 animate-pulse h-48" />
    );

    const stats = [
        { icon: Flame, label: 'Streak', value: `${user?.current_streak ?? 0} days`, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { icon: Zap, label: 'Coins', value: (user?.coins ?? 0).toLocaleString(), color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { icon: IndianRupee, label: 'Total Saved', value: `₹${(user?.total_saved ?? 0).toLocaleString()}`, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
        { icon: Star, label: 'Level', value: `Lv. ${user?.level ?? 1}`, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Player Profile</p>
                    <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-white">{user?.full_name}</h2>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-white font-heading font-black text-xl">
                        {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level {user?.level}</span>
                    <span className="text-xs font-bold text-indigo-500">Level {(user?.level ?? 1) + 1}</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full gradient-bg rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.round(((user?.xp ?? 0) / (user?.xp_to_next_level ?? 1000)) * 100))}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{user?.xp.toLocaleString()} XP</span>
                    <span>{user?.xp_to_next_level.toLocaleString()} XP</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center text-center`}>
                        <Icon className={`w-5 h-5 ${color} mb-1.5`} />
                        <p className={`font-bold text-base ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
