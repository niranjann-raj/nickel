import { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, Bell, Gift, CheckCircle, Trophy, Sparkles, Shield, Flame, Zap, IndianRupee, Star } from 'lucide-react';
import { useDashboard } from './DashboardLayout';

interface TopNavbarProps {
    onMenuClick?: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    userName?: string;
}

export default function TopNavbar({ onMenuClick, isDarkMode, onToggleTheme, userName }: TopNavbarProps) {
    const { user, notifications, clearNotifications } = useDashboard();
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const getLifetimeXP = () => {
        if (!user) return 0;
        let total = user.xp;
        for (let i = 1; i < user.level; i++) {
            total += 1000 + (i - 1) * 500;
        }
        return total;
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifs(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#050505]/40 backdrop-blur-2xl flex-shrink-0 z-10 relative">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="font-heading font-bold text-lg text-gray-900 dark:text-white leading-tight">
                        Welcome back, <span className="gradient-text">{userName?.split(' ')[0] || 'Saver'}</span> 👋
                    </h1>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Let's grow your savings today</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                
                {/* Stats Row */}
                {user && (
                    <div className="hidden md:flex items-center gap-2 mr-2 glass-panel p-1.5 rounded-2xl">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-sm border border-transparent dark:border-orange-500/20 shadow-sm" title="Current Streak">
                            <Flame className="w-4 h-4" />
                            <span>{user.current_streak || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold text-sm border border-transparent dark:border-yellow-500/20 shadow-sm" title="Available Coins">
                            <Zap className="w-4 h-4" />
                            <span>{(user.coins || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-sm border border-transparent dark:border-teal-500/20 shadow-sm" title="Total Saved">
                            <IndianRupee className="w-4 h-4" />
                            <span>{(user.total_saved || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-transparent dark:border-indigo-500/20 shadow-sm" title="Lifetime XP">
                            <Star className="w-4 h-4" />
                            <span>XP {getLifetimeXP().toLocaleString()}</span>
                        </div>
                        {user.streak_shields > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm border border-transparent dark:border-blue-500/20 shadow-sm" title="Streak Shields Available">
                                <Shield className="w-4 h-4" />
                                <span>{user.streak_shields}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setShowNotifs(!showNotifs)}
                        className={`p-2 rounded-xl transition-colors relative ${showNotifs ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifs && (
                        <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl shadow-fintech overflow-hidden z-50 transform origin-top-right transition-all">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-[#050505]/50">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notifications</h3>
                                {notifications.length > 0 && (
                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                        {notifications.length} New
                                    </span>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No new notifications 🎉
                                    </div>
                                ) : (
                                    notifications.map(notif => {
                                        let Icon = Gift;
                                        let color = 'text-blue-500';
                                        let bg = 'bg-blue-50 dark:bg-blue-900/20';
                                        
                                        if (notif.type === 'success') { Icon = CheckCircle; color = 'text-green-500'; bg = 'bg-green-50 dark:bg-green-900/20'; }
                                        if (notif.type === 'reward') { Icon = Trophy; color = 'text-yellow-500'; bg = 'bg-yellow-50 dark:bg-yellow-900/20'; }
                                        if (notif.type === 'info') { Icon = Sparkles; color = 'text-indigo-500'; bg = 'bg-indigo-50 dark:bg-indigo-900/20'; }

                                        return (
                                            <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0 cursor-pointer flex gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${bg}`}>
                                                    <Icon className={`w-4 h-4 ${color}`} />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                                                        <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap mt-0.5">{notif.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-2 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800">
                                    <button 
                                        onClick={clearNotifications}
                                        className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-fintech cursor-default overflow-hidden bg-gray-100 dark:bg-[#121214] border border-gray-200 dark:border-white/10 relative group">
                    <img src={user?.avatar || '/game_avatar.png'} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                </div>
            </div>
        </header>
    );
}
