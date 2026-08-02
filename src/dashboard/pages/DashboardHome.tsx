import UserSummaryCard from '../components/UserSummaryCard';
import LeaderboardCard from '../components/LeaderboardCard';
import SavingGraphCard from '../components/SavingGraphCard';
import { useDashboard } from '../DashboardLayout';
import { Zap, Flame, IndianRupee, Star, Activity } from 'lucide-react';

export default function DashboardHome() {
    const { user, loading } = useDashboard();

    const getLifetimeXP = () => {
        if (!user) return 0;
        let total = user.xp;
        for (let i = 1; i < user.level; i++) {
            total += 1000 + (i - 1) * 500;
        }
        return total;
    };

    const stats = [
        { icon: Flame, label: 'Current Streak', value: `${user?.current_streak ?? 0} days`, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { icon: Zap, label: 'Available Coins', value: (user?.coins ?? 0).toLocaleString(), color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { icon: IndianRupee, label: 'Total Saved', value: `₹${(user?.total_saved ?? 0).toLocaleString()}`, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
        { icon: Star, label: 'Lifetime XP', value: getLifetimeXP().toLocaleString(), color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    ];

    if (loading) {
        return (
            <div className="space-y-6 max-w-[1400px] mx-auto animate-pulse">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-[24px]" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-800 rounded-[24px]" />
                    <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-[24px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-8">
            {/* Header Area */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                    <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-white leading-tight">Dashboard Overview</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress, streaks, and financial growth</p>
                </div>
            </div>

            {/* Top KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-gray-900 rounded-[24px] p-5 border border-gray-100 dark:border-gray-800 flex flex-col justify-center gap-3 card-glow transition-transform hover:-translate-y-1 relative overflow-hidden group">
                        {/* Decorative background circle */}
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 transition-transform group-hover:scale-110 ${bg}`} />
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl ${bg}`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wider">{label}</p>
                                <p className="font-heading font-black text-2xl text-gray-900 dark:text-white leading-none">{value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid: 60/40 Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column (takes 2 of 3 col span) */}
                <div className="lg:col-span-2 space-y-6">
                    <UserSummaryCard />
                    <SavingGraphCard />
                </div>

                {/* Right Column (takes 1 of 3 col span) */}
                <div className="space-y-6">
                    <div className="sticky top-6">
                        <LeaderboardCard />
                    </div>
                </div>

            </div>
        </div>
    );
}
