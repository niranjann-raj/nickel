import { useEffect, useState } from 'react';
import { Flame, Zap } from 'lucide-react';
import { api } from '../api';

const MILESTONES: Record<number, number> = { 3: 50, 5: 100, 7: 150, 14: 300, 30: 700 };

export default function StreakCard() {
    const [streak, setStreak] = useState<any>(null);

    useEffect(() => {
        api.get('/api/streak').then(setStreak).catch(() => { });
    }, []);

    const current = streak?.current_streak ?? 0;
    const next = streak?.next_milestone;
    const progress = next ? Math.round((current / next) * 100) : 100;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Daily Streak</h3>
                        <p className="text-xs text-gray-400">Save every day to grow</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-heading font-black text-4xl text-orange-500">{current}</p>
                    <p className="text-xs text-gray-400">days</p>
                </div>
            </div>

            {next && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>{current} days</span>
                        <span>🎯 {next} days → +{streak?.next_milestone_bonus} XP</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-5 gap-1.5">
                {Object.entries(MILESTONES).map(([days, bonus]) => {
                    const reached = current >= Number(days);
                    return (
                        <div key={days} className={`rounded-xl p-2 text-center transition-all ${reached ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                            <p className={`text-xs font-bold ${reached ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>{days}d</p>
                            <div className="flex items-center justify-center gap-0.5 mt-0.5">
                                <Zap className={`w-3 h-3 ${reached ? 'text-orange-500' : 'text-gray-300'}`} />
                                <p className={`text-xs font-bold ${reached ? 'text-orange-500' : 'text-gray-300'}`}>{bonus}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
