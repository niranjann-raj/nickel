import { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, Bell, Gift, CheckCircle, Trophy, Sparkles } from 'lucide-react';
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
        <header className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
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
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-indigo-500/10 border border-gray-100 dark:border-gray-800 overflow-hidden z-50 transform origin-top-right transition-all">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notifications</h3>
                                {notifications.length > 0 && (
                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
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
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/20 cursor-default ring-2 ring-indigo-500/20 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={user?.avatar || '/game_avatar.png'} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>
    );
}
