export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-20 md:py-32 gradient-bg-soft dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 observe-animate">
                    <span className="inline-block bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-purple-100 dark:border-purple-800/50">How It Works</span>
                    <h2 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 dark:text-white mb-6">Your Journey to<br /><span className="gradient-text">Financial Freedom</span></h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">Five simple steps to transform your relationship with money — and actually enjoy the process.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 card-glow observe-animate relative h-full flex flex-col items-center border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-heading font-black text-2xl shadow-lg shadow-indigo-500/30">1</div>
                        <div className="text-4xl mb-4">👤</div>
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-3 text-lg">Sign Up</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center">Set up your account and choose your financial avatar in under 2 minutes.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 card-glow observe-animate relative h-full flex flex-col items-center border border-gray-100 dark:border-gray-700" style={{ transitionDelay: '0.1s' }}>
                        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-heading font-black text-2xl shadow-lg shadow-indigo-500/30">2</div>
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-3 text-lg">Set Goals</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center">Pick from preset goals or create your own. nickle builds your personalized plan.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 card-glow observe-animate relative h-full flex flex-col items-center border border-gray-100 dark:border-gray-700" style={{ transitionDelay: '0.2s' }}>
                        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-heading font-black text-2xl shadow-lg shadow-indigo-500/30">3</div>
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-3 text-lg">Daily Challenges</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center">Save small amounts daily and complete micro-challenges to build momentum.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 card-glow observe-animate relative h-full flex flex-col items-center border border-gray-100 dark:border-gray-700" style={{ transitionDelay: '0.3s' }}>
                        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-heading font-black text-2xl shadow-lg shadow-indigo-500/30">4</div>
                        <div className="text-4xl mb-4">🏆</div>
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-3 text-lg">Earn Rewards</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center">Every action earns XP. Level up and unlock exclusive badges and real rewards.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 card-glow observe-animate relative h-full flex flex-col items-center border border-gray-100 dark:border-gray-700" style={{ transitionDelay: '0.4s' }}>
                        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-heading font-black text-2xl shadow-lg shadow-indigo-500/30">5</div>
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-3 text-lg">Track Progress</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center">Watch your financial health grow on your personalized dashboard in real time.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
