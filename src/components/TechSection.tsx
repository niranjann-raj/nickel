import { Layout, Server, Database, Bell } from 'lucide-react';

export default function TechSection() {
    return (
        <section id="tech" className="py-20 md:py-32 gradient-bg-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 observe-animate">
                    <span className="inline-block bg-white/10 text-blue-300 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-white/10">Tech Stack</span>
                    <h2 className="font-heading font-black text-4xl sm:text-5xl text-white mb-6">Built with Modern<br /><span className="gradient-text">Technology</span></h2>
                    <p className="text-blue-200 text-xl max-w-2xl mx-auto">Powered by a robust, scalable tech stack designed for real-time performance and seamless user experience.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="tech-card rounded-[24px] p-8 observe-animate hover:bg-white/10 transition-colors">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Layout className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="font-heading font-bold text-white mb-3 text-xl">Frontend</h3>
                        <p className="text-blue-200 text-sm mb-6 leading-relaxed">Modern, responsive UI built for performance and accessibility.</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">React</span>
                            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">TailwindCSS</span>
                            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">TypeScript</span>
                        </div>
                    </div>
                    <div className="tech-card rounded-[24px] p-8 observe-animate hover:bg-white/10 transition-colors" style={{ transitionDelay: '0.1s' }}>
                        <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Server className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="font-heading font-bold text-white mb-3 text-xl">Backend</h3>
                        <p className="text-purple-200 text-sm mb-6 leading-relaxed">Scalable server-side logic with RESTful API architecture.</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/20">Python</span>
                            <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/20">Flask</span>
                        </div>
                    </div>
                    <div className="tech-card rounded-[24px] p-8 observe-animate hover:bg-white/10 transition-colors" style={{ transitionDelay: '0.2s' }}>
                        <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Database className="w-7 h-7 text-teal-400" />
                        </div>
                        <h3 className="font-heading font-bold text-white mb-3 text-xl">Database</h3>
                        <p className="text-teal-200 text-sm mb-6 leading-relaxed">Flexible NoSQL storage for user data, goals, and gamification state.</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/20">MongoDB</span>
                            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/20">Firebase</span>
                        </div>
                    </div>
                    <div className="tech-card rounded-[24px] p-8 observe-animate hover:bg-white/10 transition-colors" style={{ transitionDelay: '0.3s' }}>
                        <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Bell className="w-7 h-7 text-pink-400" />
                        </div>
                        <h3 className="font-heading font-bold text-white mb-3 text-xl">Real-Time</h3>
                        <p className="text-pink-200 text-sm mb-6 leading-relaxed">Instant notifications, live progress tracking, and real-time updates.</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-pink-500/20 text-pink-300 text-xs font-bold px-3 py-1 rounded-full border border-pink-500/20">WebSockets</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
