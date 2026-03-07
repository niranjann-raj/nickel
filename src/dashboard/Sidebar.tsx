import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PiggyBank, Brain, Trophy, Coins, LogOut, X } from 'lucide-react';

const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/save', icon: PiggyBank, label: 'Save Money' },
    { to: '/dashboard/quiz', icon: Brain, label: 'Quiz' },
    { to: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/dashboard/coins', icon: Coins, label: 'Coins Wallet' },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('nickle_token');
        localStorage.removeItem('nickle_user');
        navigate('/login');
    };

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-64 z-40 flex flex-col
                bg-white dark:bg-gray-900
                border-r border-gray-100 dark:border-gray-800
                shadow-xl transition-transform duration-300 ease-in-out
                ${open ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:shadow-none md:z-auto
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between px-6 h-20 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-heading font-black text-base">N</span>
                        </div>
                        <span className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight">nickle</span>
                    </div>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {links.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                    ? 'gradient-bg text-white shadow-md shadow-indigo-500/25'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
