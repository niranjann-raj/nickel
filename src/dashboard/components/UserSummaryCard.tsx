import { useDashboard } from '../DashboardLayout';

export default function UserSummaryCard() {
    const { user, loading } = useDashboard();

    if (loading) return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 animate-pulse h-48" />
    );

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Player Profile</p>
                    <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-white">{user?.full_name}</h2>
                </div>
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/50 bg-gray-100 dark:bg-gray-800">
                        <img
                            src={user?.avatar || '/game_avatar.png'}
                            alt="Player Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 gradient-bg rounded-full px-1.5 py-0.5 text-white text-[10px] font-black shadow-md">
                        Lv.{user?.level}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level {user?.level}</span>
                    <span className="text-xs font-bold text-indigo-500">Level {(user?.level ?? 1) + 1}</span>
                </div>
                <div 
                    className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer"
                    title={`${(user?.xp ?? 0).toLocaleString()} / ${(user?.xp_to_next_level ?? 1000).toLocaleString()} XP`}
                >
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
        </div>
    );
}
