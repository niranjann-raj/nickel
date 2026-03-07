import { Trophy, Users, Star, Flame, Brain, RefreshCw, BarChart2, UserCircle } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section id="features" className="py-20 md:py-32 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 observe-animate">
                    <span className="inline-block bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-teal-100 dark:border-teal-800/50">Core Features</span>
                    <h2 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 dark:text-white mb-6">Everything You Need to<br /><span className="gradient-text">Win at Saving</span></h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">Packed with tools designed specifically for how Gen Z thinks, learns, and gets motivated.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800/50">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <Trophy className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Gamified Savings Goals</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Transform boring savings targets into exciting quests with progress bars, milestones, and XP rewards.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-purple-100 dark:hover:border-purple-800/50" style={{ transitionDelay: '0.05s' }}>
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Leaderboards & Social</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Compete with friends and the community. See who's saving the most and get inspired by top savers.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-yellow-100 dark:hover:border-yellow-800/50" style={{ transitionDelay: '0.1s' }}>
                            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/40 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <Star className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Rewards & Achievements</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Unlock real-world rewards, gift cards, and exclusive digital badges for reaching financial milestones.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-red-100 dark:hover:border-red-800/50" style={{ transitionDelay: '0.15s' }}>
                            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 group-hover:bg-red-200 dark:group-hover:bg-red-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <Flame className="w-7 h-7 text-red-500 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Daily Streak Tracking</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Build unstoppable saving habits with daily streak tracking. Protect your streak with streak shields.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <Brain className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Financial Education Quizzes</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Daily micro-lessons on budgeting, investing, taxes, and credit scores — all in 2-minute quiz format.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-teal-100 dark:hover:border-teal-800/50" style={{ transitionDelay: '0.05s' }}>
                            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/40 group-hover:bg-teal-200 dark:group-hover:bg-teal-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <RefreshCw className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Automatic Savings</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Set it and forget it. Automatic round-ups and scheduled transfers make saving effortless and consistent.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-green-100 dark:hover:border-green-800/50" style={{ transitionDelay: '0.1s' }}>
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <BarChart2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Personalized Insights</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">AI-powered spending analysis and personalized tips to help you save smarter based on your habits.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-[20px] hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors cursor-pointer group observe-animate border border-transparent hover:border-pink-100 dark:hover:border-pink-800/50" style={{ transitionDelay: '0.15s' }}>
                            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/40 group-hover:bg-pink-200 dark:group-hover:bg-pink-800/60 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                <UserCircle className="w-7 h-7 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">Custom Financial Avatar</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Create and evolve your unique financial avatar. Unlock new looks and accessories as your savings grow.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
