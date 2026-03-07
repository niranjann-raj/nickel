import { Gamepad2, Rocket, Share2 } from 'lucide-react';

export default function SolutionSection() {
    return (
        <section className="py-20 md:py-32 gradient-bg-soft dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 observe-animate">
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-indigo-100 dark:border-indigo-800/50">The Solution</span>
                    <h2 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 dark:text-white mb-6">Enter <span className="gradient-text">nickle</span></h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">We use proven psychology and game mechanics to make building wealth as addictive as scrolling social media.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 lg:p-10 shadow-lg relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 observe-animate border border-gray-100 dark:border-gray-700">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/30">
                            <Gamepad2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-4">Play to Save</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Turn every deposit into XP. Level up your avatar, complete daily quests, and unlock exclusive digital and physical rewards.</p>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 lg:p-10 shadow-lg relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 observe-animate border border-gray-100 dark:border-gray-700" style={{ transitionDelay: '0.1s' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-pink-500/30">
                            <Rocket className="w-8 h-8" />
                        </div>
                        <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-4">Auto-Pilot Wealth</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Set your goals and let nickle auto-save for you based on your spending habits. We do the math so you don't have to.</p>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 lg:p-10 shadow-lg relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 observe-animate border border-gray-100 dark:border-gray-700" style={{ transitionDelay: '0.2s' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-teal-500/30">
                            <Share2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-4">Social Accountability</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Join squads with friends. Cheer each other on, compete on leaderboards, and achieve financial freedom together.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
