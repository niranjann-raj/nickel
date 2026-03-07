import { HeartCrack, TrendingDown, Clock } from 'lucide-react';

export default function ProblemSection() {
    return (
        <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 observe-animate">
                    <span className="inline-block bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-red-100 dark:border-red-800/50">The Problem</span>
                    <h2 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 dark:text-white mb-6">Saving Money Feels Like a<br /><span className="gradient-text">Chore</span></h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">Traditional banking apps were designed for your parents. They're boring, confusing, and punish you for spending.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 shadow-sm hover:shadow-xl transition-all observe-animate border border-transparent hover:border-red-100 dark:border-gray-700 dark:hover:border-red-900/50 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <HeartCrack className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-3">No Motivation</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Staring at numbers on a screen doesn't give you the dopamine hit that spending does. Saving feels like a sacrifice.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 shadow-sm hover:shadow-xl transition-all observe-animate border border-transparent hover:border-orange-100 dark:border-gray-700 dark:hover:border-orange-900/50 transform hover:-translate-y-1" style={{ transitionDelay: '0.1s' }}>
                        <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <TrendingDown className="w-7 h-7 text-orange-500" />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-3">Goal Abandonment</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">It's easy to set a goal, but hard to stick to it when progress is slow and invisible. Most give up after week two.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-8 shadow-sm hover:shadow-xl transition-all observe-animate border border-transparent hover:border-purple-100 dark:border-gray-700 dark:hover:border-purple-900/50 transform hover:-translate-y-1" style={{ transitionDelay: '0.2s' }}>
                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Clock className="w-7 h-7 text-purple-500" />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-3">Financial Anxiety</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Not knowing how to invest or build credit causes stress. Traditional apps don't teach you; they just show you a balance.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
