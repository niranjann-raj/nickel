import { Zap, PlayCircle, CheckCircle } from 'lucide-react';

export default function CtaSection() {
    return (
        <section id="cta" className="py-24 md:py-32 gradient-bg relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 dark:opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="observe-animate">
                    <div className="text-7xl mb-8 animate-bounce-soft">🚀</div>
                    <h2 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-8 leading-tight">Start Your Financial<br />Journey Today</h2>
                    <p className="text-blue-100 text-2xl mb-12 max-w-2xl mx-auto leading-relaxed">Join 50,000+ Gen Z users who are already leveling up their finances. It's free to start — and actually fun.</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                        <a href="#" className="bg-white dark:bg-gray-100 text-indigo-700 px-12 py-5 rounded-full font-bold text-xl hover:bg-blue-50 dark:hover:bg-white transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-3">
                            <Zap className="w-6 h-6" />
                            Get Started — It's Free
                        </a>
                        <a href="#features" className="bg-white/10 border-2 border-white/30 text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                            <PlayCircle className="w-6 h-6" />
                            Watch Demo
                        </a>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-blue-100 text-base font-medium">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-teal-300 dark:text-teal-400" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-teal-300 dark:text-teal-400" />
                            <span>Free forever plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-teal-300 dark:text-teal-400" />
                            <span>Set up in 2 minutes</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
