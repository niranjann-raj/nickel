import LeaderboardCard from '../components/LeaderboardCard';
import { Trophy } from 'lucide-react';

const TIERS = [
    { rank: 'Rank 1', coins: '5,000 🪙' }, { rank: 'Rank 2', coins: '2,500 🪙' },
    { rank: 'Rank 3', coins: '1,000 🪙' }, { rank: 'Rank 4–10', coins: '750 🪙' },
    { rank: 'Rank 11–50', coins: '500 🪙' }, { rank: 'Rank 51–100', coins: '250 🪙' },
    { rank: 'Rank 101+', coins: '25 🪙' },
];

export default function LeaderboardPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-[#1a1a1a] dark:bg-[#111] rounded-2xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                    <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Leaderboard</h2>
                    <p className="text-sm text-gray-400">Top savers earn coin bonuses</p>
                </div>
            </div>

            {/* Tier table */}
            <div className="bg-white dark:bg-gray-900 rounded-[24px] p-5 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">🏆 Season Rewards</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TIERS.map(t => (
                        <div key={t.rank} className="bg-gray-50 dark:bg-[#151515] rounded-xl p-3 text-center border border-gray-200 dark:border-[#333]">
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{t.rank}</p>
                            <p className="text-sm font-black text-gray-400 dark:text-white mt-0.5">{t.coins}</p>
                        </div>
                    ))}
                </div>
            </div>

            <LeaderboardCard />
        </div>
    );
}
