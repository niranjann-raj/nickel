import { Zap, PlayCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
    const [tiltStyle, setTiltStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        });
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: 'perspective(1000px) rotateX(0) rotateY(0)'
        });
    };

    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 min-h-[90vh] flex items-center">
            {/* Background Elements */}
            <div className="absolute inset-0 grid-pattern z-0 dark:opacity-20"></div>
            <div className="hero-orb w-[800px] h-[800px] bg-blue-400/20 dark:bg-blue-600/10 -top-40 -right-40 animate-pulse-slow"></div>
            <div className="hero-orb w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-600/10 bottom-0 -left-20" style={{ animationDelay: '2s' }}></div>
            <div className="hero-orb w-[400px] h-[400px] bg-pink-400/20 dark:bg-pink-600/10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '4s' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left animate-slide-up">
                        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/50 rounded-full px-5 py-2 mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
                            <span className="animate-bounce-soft text-xl">🎮</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase">Level Up Your Finances</span>
                        </div>

                        <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] mb-8 tracking-tight text-gray-900 dark:text-white">
                            Turn Saving<br />
                            <span className="gradient-text relative inline-block">
                                Money Into
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-200 dark:text-indigo-900/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span><br />
                            a Game
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-medium">
                            Stop boring banking. Start your financial adventure with streaks, rewards, and a community that cheers you on.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <a href="/signup" className="gradient-bg text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-3 group">
                                <Zap className="w-6 h-6 group-hover:fill-white transition-colors" />
                                Start Saving Now
                            </a>
                            <a href="#features" className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-10 py-4 rounded-full font-bold text-lg hover:border-indigo-200 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg transition-all flex items-center justify-center gap-3">
                                <PlayCircle className="w-6 h-6" />
                                How It Works
                            </a>
                        </div>

                        <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start opacity-80">
                            <div className="flex -space-x-3">
                                <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face" alt="User" />
                                <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face" alt="User" />
                                <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face" alt="User" />
                                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">+50k</div>
                            </div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Join <span className="text-gray-900 dark:text-white font-bold">50,000+</span> savers
                            </div>
                        </div>
                    </div>

                    {/* 3D Interactive Visuals */}
                    <div
                        className="flex-1 w-full max-w-lg lg:max-w-xl relative perspective-1000"
                        id="hero-visual"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Main Dashboard Card */}
                        <div
                            className="tilt-card bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 relative z-20 animate-float"
                            style={tiltStyle}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30">🦊</div>
                                    <div>
                                        <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Level 12 Saver</div>
                                        <h3 className="font-heading font-bold text-gray-900 dark:text-white text-xl">Alex's Dashboard</h3>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Online</span>
                                </div>
                            </div>

                            {/* Balance Section */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-900 dark:to-black rounded-2xl p-6 mb-6 text-white shadow-xl relative overflow-hidden group border border-gray-800">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-1">Total Savings</div>
                                    <div className="font-heading font-black text-4xl mb-4 tracking-tight">$2,847.50</div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> +12%
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-600 text-xs">vs last month</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800/30">
                                    <div className="text-indigo-600 dark:text-indigo-400 font-heading font-black text-2xl mb-1 flex items-center gap-2">
                                        🔥 14
                                    </div>
                                    <div className="text-indigo-400 dark:text-indigo-500 text-xs font-bold uppercase tracking-wide">Day Streak</div>
                                </div>
                                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-2xl p-4 border border-pink-100 dark:border-pink-800/30">
                                    <div className="text-pink-600 dark:text-pink-400 font-heading font-black text-2xl mb-1 flex items-center gap-2">
                                        🏆 8
                                    </div>
                                    <div className="text-pink-400 dark:text-pink-500 text-xs font-bold uppercase tracking-wide">Badges Earned</div>
                                </div>
                            </div>

                            {/* XP Progress */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                                    <span>Level Progress</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">2,840 / 4,000 XP</span>
                                </div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-1">
                                    <div className="xp-bar h-full rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements (Decorations) */}
                        {/* 1. Success Notification */}
                        <div className="absolute -top-12 -right-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float-delayed z-30 border border-gray-100 dark:border-gray-700 max-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">🎉</div>
                            <div>
                                <div className="text-xs font-bold text-gray-900 dark:text-white">Goal Reached!</div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">New Laptop Fund</div>
                            </div>
                        </div>

                        {/* 2. Floating Coin */}
                        <div className="absolute top-1/2 -right-16 w-20 h-20 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-4xl border-4 border-yellow-300 dark:border-yellow-400 animate-float-fast z-30 transform rotate-12">
                            💰
                        </div>

                        {/* 3. Leaderboard Card */}
                        <div className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-gray-700 animate-float z-30 w-48">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-3">Top Savers</div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-900 dark:text-white">Sarah J.</div>
                                    <div className="ml-auto text-xs font-bold text-green-600 dark:text-green-400">#1</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-900 dark:text-white">Mike T.</div>
                                    <div className="ml-auto text-xs font-bold text-gray-400 dark:text-gray-500">#2</div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Background Blur Glow behind card */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[40px] blur-3xl opacity-20 dark:opacity-40 -z-10 transform scale-90 translate-y-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
