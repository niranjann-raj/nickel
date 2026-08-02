import { Menu, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Init theme from localStorage or system preference
        const isDark = localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newThemeIsDark = !isDarkMode;
        setIsDarkMode(newThemeIsDark);
        if (newThemeIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <>
            <nav className="nav-blur fixed top-0 left-0 right-0 z-50 border-b border-gray-100/50 dark:border-gray-800/50 dark:bg-gray-900/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Nickle Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/10 object-cover" />
                            <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white tracking-tight">nickle</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">How It Works</a>
                            <a href="#impact" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Impact</a>
                            <a href="#tech" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Tech</a>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Log In</Link>
                            <Link to="/signup" className="gradient-bg text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5">Get Started</Link>
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-small text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-4 py-6 flex flex-col gap-4">
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium text-lg">Features</a>
                        <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium text-lg">How It Works</a>
                        <a href="#impact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium text-lg">Impact</a>
                        <a href="#tech" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium text-lg">Tech</a>
                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="gradient-bg text-white px-5 py-3 rounded-small font-semibold text-lg text-center shadow-lg hover:shadow-xl transition-all">Get Started</Link>
                    </div>
                </div>
            </nav>
        </>
    );
}
