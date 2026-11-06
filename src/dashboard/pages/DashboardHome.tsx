import MatrixLoader from '../../components/ui/MatrixLoader';
import UserSummaryCard from '../components/UserSummaryCard';
import NickelDebitCard from '../components/NickelDebitCard';
import LeaderboardCard from '../components/LeaderboardCard';
import SavingGraphCard from '../components/SavingGraphCard';
import { useDashboard } from '../DashboardLayout';

export default function DashboardHome() {
    const { loading } = useDashboard();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <MatrixLoader size="lg" variant="orbit" rounded />
                <span className="text-xs text-gray-500 tracking-wider uppercase font-medium">Loading Dashboard...</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <UserSummaryCard />
                        <NickelDebitCard />
                    </div>
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
