import { Menu, Moon, Sun, Bell } from 'lucide-react';

interface TopNavbarProps {
    onMenuClick: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    userName?: string;
}

export default function TopNavbar({ onMenuClick, isDarkMode, onToggleTheme, userName }: TopNavbarProps) {
    const initials = userName
        ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

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

            <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
                </button>
                <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/20 cursor-default">
                    {initials}
                </div>
            </div>
        </header>
    );
}
