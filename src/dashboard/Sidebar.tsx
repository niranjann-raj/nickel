import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PiggyBank, Brain, Trophy, LogOut, Settings, PanelLeftOpen, PanelLeftClose, ShoppingBag, Target, Gift } from 'lucide-react';

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
            border-r-0 border-transparent
            shadow-none dark:shadow-none transition-all duration-300 ease-in-out z-20
            ${collapsed ? 'w-20' : 'w-64'}
        `}>
            {/* Logo / Header */}
            <div className={`flex items-center h-20 border-b-0 border-transparent flex-shrink-0 transition-all duration-300 relative ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
                {collapsed ? (
                    /* Compact mode: Hovering over Nickel logo swaps it with PanelLeftOpen icon + "Open sidebar" pill */
                    <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        className="relative group p-2 rounded-2xl flex items-center justify-center focus:outline-none cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        {/* Normal Nickel Logo: visible by default */}
                        <div className="w-10 h-10 rounded-xl shadow-glow flex-shrink-0 bg-transparent transition-all duration-200 group-hover:opacity-0 group-hover:scale-90">
                            <img src="/logo.png" alt="Nickel Logo" className="w-full h-full rounded-xl object-cover" />
                        </div>

                        {/* Hover Logo Icon (Image 2 style): PanelLeftOpen in dark circular container */}
                        <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#18181b] border border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-sm">
                                <PanelLeftOpen className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Hover Tooltip Pill (Image 2 style): "Open sidebar" */}
                        <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-all duration-200 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0">
                            <div className="bg-[#ececec] text-[#0d0d0d] text-sm font-medium px-4 py-2 rounded-full shadow-2xl whitespace-nowrap flex items-center tracking-normal border border-black/5 select-none">
                                Open sidebar
                            </div>
                        </div>
                    </button>
                ) : (
                    /* Expanded mode: Logo + "nickel" title + Collapse button */
                    <>
                        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl shadow-glow flex-shrink-0 bg-transparent group-hover:scale-105 transition-transform">
                                <img src="/logo.png" alt="Nickel Logo" className="w-full h-full rounded-xl object-cover" />
                            </div>
                            <span className="font-heading font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight whitespace-nowrap">
                                nickel
                            </span>
                        </NavLink>

                        {/* Collapse sidebar button */}
                        <div className="relative group">
                            <button
                                type="button"
                                onClick={() => setCollapsed(true)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
                                aria-label="Close sidebar"
                            >
                                <PanelLeftClose className="w-5 h-5" />
                            </button>
                            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center pointer-events-none z-50">
                                <div className="bg-[#ececec] text-[#0d0d0d] text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap border border-black/5">
                                    Close sidebar
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Nav Links */}
            <nav className={`flex-1 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden bg-transparent border-0 border-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${collapsed ? 'px-3' : 'px-4'}`}>
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
                                ? 'bg-[#ffffff] text-[#000000] border border-[#ffffff] shadow-md font-bold'
                                : 'text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 !text-[#000000]' : 'group-hover:scale-110'}`} />
                                {!collapsed && <span className={`whitespace-nowrap tracking-wide ${isActive ? '!text-[#000000]' : ''}`}>{label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className={`py-4 bg-transparent border-0 border-transparent ${collapsed ? 'px-3' : 'px-4'}`}>
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
