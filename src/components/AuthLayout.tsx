import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(isDark);
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const toggleTheme = () => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        if (newDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-body">
            {/* Navbar */}
            <nav className="nav-blur fixed top-0 left-0 right-0 z-50 border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 gradient-bg rounded-small flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="text-white font-heading font-black text-lg">N</span>
                            </div>
                            <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white tracking-tight">nickle</span>
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Background orbs */}
            <div className="hero-orb w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/10 -top-40 -right-40 animate-pulse-slow"></div>
            <div className="hero-orb w-[400px] h-[400px] bg-purple-400/20 dark:bg-purple-600/10 bottom-0 -left-20" style={{ animationDelay: '2s' }}></div>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 dark:text-white mb-2">{title}</h1>
                        {subtitle && <p className="text-gray-500 dark:text-gray-400 text-base">{subtitle}</p>}
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[28px] shadow-xl p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
