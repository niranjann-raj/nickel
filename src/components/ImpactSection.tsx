import { StaggerTestimonials } from './ui/stagger-testimonials';

export default function ImpactSection() {
    return (
        <section id="about" className="py-20 md:py-32 bg-white dark:bg-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 observe-animate">
                    <span className="inline-block bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-green-100 dark:border-green-800/50">Real Impact</span>
                    <h2 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 dark:text-white mb-6">The Difference nickle<br /><span className="gradient-text">Makes in Your Life</span></h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">Real results for real people. Here's what happens when saving becomes a game you actually want to play.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-[24px] card-glow observe-animate border border-blue-100 dark:border-indigo-800/30 text-gray-900 dark:text-white">
                        <div className="text-5xl mb-6">📚</div>
                        <h3 className="font-heading font-bold text-xl mb-3">Financial Literacy</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Users report 3x improvement in financial knowledge after just 30 days.</p>
                        <div className="font-heading font-black text-4xl text-indigo-600 dark:text-indigo-400">3x</div>
                    </div>
                    <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-[24px] card-glow observe-animate border border-purple-100 dark:border-purple-800/30 text-gray-900 dark:text-white" style={{ transitionDelay: '0.1s' }}>
                        <div className="text-5xl mb-6">💰</div>
                        <h3 className="font-heading font-bold text-xl mb-3">Saving Habits</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Streak mechanics create lasting saving habits that stick beyond the app.</p>
                        <div className="font-heading font-black text-4xl text-purple-600 dark:text-purple-400">89%</div>
                    </div>
                    <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-[24px] card-glow observe-animate border border-teal-100 dark:border-teal-800/30 text-gray-900 dark:text-white" style={{ transitionDelay: '0.2s' }}>
                        <div className="text-5xl mb-6">🛑</div>
                        <h3 className="font-heading font-bold text-xl mb-3">Less Impulse Buys</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Goal visualization helps users make more intentional financial decisions.</p>
                        <div className="font-heading font-black text-4xl text-teal-600 dark:text-teal-400">-42%</div>
                    </div>
                    <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-[24px] card-glow observe-animate border border-yellow-100 dark:border-yellow-800/30 text-gray-900 dark:text-white" style={{ transitionDelay: '0.3s' }}>
                        <div className="text-5xl mb-6">💪</div>
                        <h3 className="font-heading font-bold text-xl mb-3">Confidence</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Achieving goals builds genuine confidence in managing personal finances.</p>
                        <div className="font-heading font-black text-4xl text-yellow-600 dark:text-yellow-400">94%</div>
                    </div>
                </div>
            </div>
            
            {/* Full-width Testimonials */}
            <div className="w-full mt-12">
                <StaggerTestimonials />
            </div>
        </section>
    );
}
