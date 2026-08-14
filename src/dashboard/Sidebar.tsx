import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PiggyBank, Brain, Trophy, Coins, LogOut, Settings, ChevronLeft, ChevronRight, ShoppingBag, Target, Gift } from 'lucide-react';

const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home', end: true },
    { to: '/dashboard/save', icon: PiggyBank, label: 'Save Money' },
    { to: '/dashboard/goals', icon: Target, label: 'Goal Based Saving' },
    { to: '/dashboard/quiz', icon: Brain, label: 'Quiz' },
    { to: '/dashboard/spin', icon: Gift, label: 'Daily Spin' },
    { to: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/dashboard/shop', icon: ShoppingBag, label: 'Shop' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const logout = () => {
        localStorage.removeItem('nickle_token');
        localStorage.removeItem('nickle_user');
        navigate('/login');
    };

    return (
        <aside className={`
            relative h-full flex flex-col flex-shrink-0
            bg-white dark:bg-[#050505]/60 dark:backdrop-blur-2xl
            border-r border-gray-100 dark:border-white/5
            shadow-2xl transition-all duration-300 ease-in-out z-20
            ${collapsed ? 'w-20' : 'w-64'}
        `}>
            {/* Logo */}
            <div className={`flex items-center h-20 border-b border-gray-100 dark:border-white/5 flex-shrink-0 overflow-hidden transition-all duration-300 ${collapsed ? 'justify-center px-2' : 'px-6 gap-3'}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-glow flex-shrink-0">
                    <img src="/logo.png" alt="Nickle Logo" className="w-full h-full rounded-xl object-cover" />
                </div>
                {!collapsed && (
                    <span className="font-heading font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight whitespace-nowrap">
                        nickel
                    </span>
                )}
            </div>

            {/* Collapse Toggle Button */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="absolute -right-3.5 top-[72px] z-50 w-7 h-7 bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-md dark:shadow-black hover:shadow-indigo-500/30 hover:border-indigo-500/50 transition-all"
            >
                {collapsed
                    ? <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    : <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                }
            </button>

            {/* Nav Links */}
            <nav className={`flex-1 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-3' : 'px-4'}`}>
                {links.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        title={collapsed ? label : undefined}
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group
                            ${collapsed ? 'justify-center px-0' : 'px-4'}
                            ${isActive
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]'
                                : 'text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && !collapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                )}
                                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {!collapsed && <span className="whitespace-nowrap tracking-wide">{label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className={`py-4 border-t border-gray-100 dark:border-white/5 ${collapsed ? 'px-3' : 'px-4'}`}>
                <button
                    onClick={logout}
                    title={collapsed ? 'Logout' : undefined}
                    className={`flex items-center gap-3 w-full py-3 rounded-xl text-sm font-medium text-red-500/80 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'px-4'}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="tracking-wide">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
