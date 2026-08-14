import { useEffect, useState } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { api } from '../api';
import { useDashboard } from '../DashboardLayout';

export default function LeaderboardCard() {
    const { user } = useDashboard();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        api.get('/api/leaderboard').then(setData).catch(() => { });
    }, [user]);

    const top3 = data?.leaderboard?.slice(0, 3) ?? [];
    const rest = data?.leaderboard?.slice(3, 10) ?? [];

    const rankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-gray-500 text-sm font-bold w-5 text-center">#{rank}</span>;
    };

    return (
        <div className="glass-panel card-glow rounded-[24px] p-8 border border-gray-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-[60px]" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-100 dark:border-yellow-500/20 shadow-sm">
                    <Trophy className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight">Season Leaderboard</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 dark:bg-[#121214] px-2.5 py-0.5 rounded-full border border-transparent dark:border-white/5">Season {data?.season || 1} • Resets Sunday</p>
                        {data?.your_rank && <p className="text-xs text-gray-500 font-medium">Rank: <span className="text-indigo-400 font-bold">#{data.your_rank}</span></p>}
                    </div>
                </div>
            </div>

            {/* Top 3 podium */}
            {top3.length >= 3 && (
                <div className="flex items-end justify-center gap-3 mb-5 h-24">
                    {[top3[1], top3[0], top3[2]].map((entry: any, idx: number) => {
                        const heights = ['h-16', 'h-24', 'h-12'];
                        const colors = ['bg-gray-200 dark:bg-gray-700', 'bg-gradient-to-b from-yellow-400 to-amber-500', 'bg-amber-200 dark:bg-amber-900/40'];
                        const textColors = ['text-gray-600', 'text-white', 'text-amber-700 dark:text-amber-400'];
                        const ranks = [2, 1, 3];
                        return (
                            <div key={entry.name} className={`flex-1 ${colors[idx]} ${heights[idx]} rounded-t-2xl flex flex-col items-center justify-end pb-2 ${entry.is_current_user ? 'ring-2 ring-indigo-500' : ''}`}>
                                <p className={`text-xs font-bold ${textColors[idx]} truncate px-1`}>{entry.name.split(' ')[0]}</p>
                                <p className={`text-xs ${textColors[idx]} opacity-80`}>#{ranks[idx]}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rank list */}
            <div className="space-y-2 relative z-10">
                {[...top3, ...rest].map((entry: any) => (
                    <div
                        key={entry.rank}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${entry.is_current_user
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]'
                                : 'border border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                    >
                        <div className="w-6 flex justify-center">{rankIcon(entry.rank)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {entry.name} {entry.is_current_user && <span className="text-xs text-indigo-500 ml-1">(you)</span>}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400">{entry.xp.toLocaleString()} XP</p>
                        </div>
                    </div>
                ))}
                {data?.leaderboard?.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">No data yet. Be the first!</p>
                )}
            </div>
        </div>
    );
}
