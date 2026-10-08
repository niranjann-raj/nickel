import { useDashboard } from '../DashboardLayout';

export default function UserSummaryCard() {
    const { user, loading } = useDashboard();

    if (loading) return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 animate-pulse h-48" />
    );

    return (
        <div className="glass-panel card-glow rounded-[24px] p-8 border border-gray-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#111] rounded-full blur-[60px]" />
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1">Player Profile</p>
                    <h2 className="font-heading font-black text-3xl tracking-tight bg-gradient-to-r from-gray-400 via-white to-gray-500 text-transparent bg-clip-text drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">{user?.full_name}</h2>
                </div>
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-fintech ring-1 ring-white/10 bg-gray-100 dark:bg-[#121214]">
                        <img
                            src={user?.avatar || '/game_avatar.png'}
                            alt="Player Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#151515] border border-[#222] rounded-lg px-2 py-0.5 text-white text-[11px] font-black shadow-glow border border-white/20">
                        Lv.{user?.level}
                    </div>
                </div>
            </div>

            <div className="mb-2 relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level {user?.level}</span>
                    <span className="text-sm font-bold text-white">Level {(user?.level ?? 1) + 1}</span>
                </div>
                <div
                    className="h-2.5 bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden cursor-pointer border border-transparent dark:border-white/5 shadow-inner"
                    title={`${(user?.xp ?? 0).toLocaleString()} / ${(user?.xp_to_next_level ?? 1000).toLocaleString()} XP`}
                >
                    <div
                        className="h-full bg-black bg-white rounded-full transition-all duration-1000 relative"
                        style={{ width: `${Math.min(100, Math.round(((user?.xp ?? 0) / (user?.xp_to_next_level ?? 1000)) * 100))}%` }}
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>{user?.xp.toLocaleString()} XP</span>
                    <span>{user?.xp_to_next_level.toLocaleString()} XP</span>
                </div>
            </div>
        </div>
    );
}
