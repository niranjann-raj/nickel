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
        { icon: Flame, label: 'Current Streak', value: `${user?.current_streak ?? 0} days`, color: 'text-gray-300', bg: 'bg-[#1a1a1a] dark:bg-[#111]' },
        { icon: Zap, label: 'Available Coins', value: (user?.coins ?? 0).toLocaleString(), color: 'text-gray-300', bg: 'bg-[#1a1a1a] dark:bg-[#111]' },
        { icon: IndianRupee, label: 'Total Saved', value: `₹${(user?.total_saved ?? 0).toLocaleString()}`, color: 'text-gray-300', bg: 'bg-[#1a1a1a] dark:bg-[#111]' },
        { icon: Star, label: 'Lifetime XP', value: getLifetimeXP().toLocaleString(), color: 'text-gray-300', bg: 'bg-[#1a1a1a] dark:bg-[#111]' },
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
            <div className="mb-8">
                <h2 className="font-heading font-bold text-4xl text-gray-900 dark:text-white tracking-tight">
                    Financial Overview
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                    Track your progress, streaks, and financial growth.
                </p>
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
