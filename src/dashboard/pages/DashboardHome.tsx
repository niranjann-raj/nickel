import UserSummaryCard from '../components/UserSummaryCard';
import SavingWalletCard from '../components/SavingWalletCard';
import StreakCard from '../components/StreakCard';
import CoinsWalletCard from '../components/CoinsWalletCard';
import LeaderboardCard from '../components/LeaderboardCard';

export default function DashboardHome() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Full-width summary */}
            <UserSummaryCard />

            {/* 2-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SavingWalletCard />
                <StreakCard />
            </div>

            {/* 2-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeaderboardCard />
                <CoinsWalletCard />
            </div>
        </div>
    );
}
