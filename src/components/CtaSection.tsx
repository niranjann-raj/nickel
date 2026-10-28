import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CtaSection() {
    return (
        <section id="cta" className="py-24 md:py-32 bg-black text-white border-t border-zinc-900 relative overflow-hidden">
            {/* Subtle monochrome ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-zinc-800/20 blur-[140px] rounded-full"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                {/* Big Headline */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-6 leading-tight max-w-3xl mx-auto">
                    Ready to Take Control of Your Wealth Strategy?
                </h2>

                <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
                    Join over 50,000+ modern savers who save faster, eliminate group debt friction, and track spending without anxiety.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Link
                        to="/signup"
                        className="btn-white w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white !text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
                    >
                        <span className="!text-black font-bold">Get Started Free</span>
                        <ArrowRight className="w-4 h-4 !text-black" />
                    </Link>

                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Login to Account</span>
                    </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-500 font-normal">
                    <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Bank-Grade 256-bit AES</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Setup in Under 2 Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Zero Hidden Commissions</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
