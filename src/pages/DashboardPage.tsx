import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, TrendingUp, Target, Flame, Trophy, Moon, Sun } from 'lucide-react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark';
        setIsDarkMode(isDark);
        if (isDark) document.documentElement.classList.add('dark');
        const stored = localStorage.getItem('nickle_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const toggleTheme = () => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        if (newDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
        else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    };

    const logout = () => {
        localStorage.removeItem('nickle_token');
        localStorage.removeItem('nickle_user');
        navigate('/login');
    };

    const firstName = user?.full_name?.split(' ')[0] || 'Saver';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-body">
            {/* Nav */}
            <nav className="nav-blur fixed top-0 left-0 right-0 z-50 border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 gradient-bg rounded-small flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="text-white font-heading font-black text-lg">N</span>
                            </div>
                            <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white tracking-tight">nickle</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{user?.email}</span>
                            <button onClick={logout} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 w-full">
                {/* Hero greeting */}
                <div className="mb-10 observe-animate visible">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-full px-4 py-1.5 mb-4">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">Dashboard</span>
                    </div>
                    <h1 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 dark:text-white mb-2">
                        Welcome back, <span className="gradient-text">{firstName}!</span> 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Ready to level up your savings today?</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { icon: TrendingUp, label: 'Total Saved', value: '$0.00', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                        { icon: Target, label: 'Active Goals', value: '0', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
                        { icon: Flame, label: 'Day Streak', value: '0', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                        { icon: Trophy, label: 'Badges Earned', value: '0', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="bg-white dark:bg-gray-800 rounded-[24px] p-6 border border-gray-100 dark:border-gray-700 card-glow">
                            <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <div className={`font-heading font-black text-3xl ${color} mb-1`}>{value}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Getting started panel */}
                <div className="bg-white dark:bg-gray-800 rounded-[28px] p-8 border border-gray-100 dark:border-gray-700 card-glow text-center">
                    <div className="text-5xl mb-4">🚀</div>
                    <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-3">Your journey starts now</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Set your first savings goal and begin earning XP. Your financial adventure awaits!</p>
                    <button className="gradient-bg text-white px-8 py-3.5 rounded-full font-bold text-base hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all">
                        Set First Goal 🎯
                    </button>
                </div>
            </main>
        </div>
    );
}
