import { Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 dark:bg-black py-16 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="/logo.png" alt="Nickle Logo" className="w-8 h-8 rounded-md object-cover" />
                            <span className="font-heading font-bold text-xl text-white tracking-tight">nickle</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                            Making saving money as addictive as spending it. Join the waitlist and secure your financial future through gamified banking.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all transform hover:scale-110">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all transform hover:scale-110">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all transform hover:scale-110">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a5.84 5.84 0 0 0-1.56-.22 5.8 5.8 0 1 0 5.8 5.8V9.86a8.21 8.21 0 0 0 5 1.57v-3.05a4.74 4.74 0 0 1-2.9-.81z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
                        <ul className="space-y-4">
                            <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
                            <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</a></li>
                            <li><a href="#tech" className="text-gray-400 hover:text-white transition-colors text-sm">Technology</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal & Support</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 mb-16 md:mb-24">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} nickle Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm">Made with ❤️ for Gen Z</span>
                    </div>
                </div>
            </div>

            {/* Watermark text at the very bottom */}
            <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none select-none overflow-hidden translate-y-[20%] md:translate-y-[25%] opacity-50 dark:opacity-100">
                <span className="font-heading font-black text-[25vw] md:text-[22vw] text-gray-800 dark:text-white/[0.03] leading-none tracking-tighter whitespace-nowrap">
                    nickel
                </span>
            </div>
        </footer>
    );
}
