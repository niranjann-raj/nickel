import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedCounter } from './ui/AnimatedCounter';

export default function HowItWorksSection() {
    return (
        <section id="spotlight" className="py-24 md:py-32 bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-14 observe-animate">
                    <div className="inline-flex items-center px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-wider text-zinc-300 uppercase mb-6">
                        <span>Spotlight</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white max-w-3xl leading-[1.15]">
                            We&apos;ve helped 50,000+ modern savers replace manual chaos with automated financial clarity
                        </h2>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-400 hover:text-white uppercase transition-colors flex-shrink-0"
                        >
                            <span>Start Exploring Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* 2-Column Spotlight Grid with Scroll Animations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left Card: Case Study Overview */}
                    <div 
                        className="lg:col-span-6 rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-8 flex flex-col justify-between hover:border-zinc-700 transition-colors observe-animate"
                        style={{ transitionDelay: '0.08s' }}
                    >
                        <div>
                            <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-zinc-500 uppercase mb-6">
                                <span>NICKEL SPLIT</span>
                                <span>2026 · GROUP VAULT</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-medium text-white mb-4 leading-snug">
                                How a 6-friend group completely eliminated split debt awkwardness
                            </h3>

                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal mb-8">
                                A pairwise greedy debtor-creditor matching algorithm handles what used to take days of awkward reminder texts, missing UPI screenshots, and fragmented calculations. 18 debts resolved in 3 clean transfers.
                            </p>

                            <Link
                                to="/dashboard/split"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-zinc-300 transition-colors mb-8"
                            >
                                <span>Experience Split Rooms</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Bottom Metric Tiles */}
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900">
                            <div>
                                <div className="text-4xl font-sans font-bold text-white mb-1">
                                    <AnimatedCounter value={78} suffix="%" duration={1600} />
                                </div>
                                <div className="text-xs text-zinc-500 leading-snug">
                                    Reduction in unpaid group debt duration
                                </div>
                            </div>
                            <div>
                                <div className="text-4xl font-sans font-bold text-white mb-1">
                                    <AnimatedCounter value={100} suffix="%" duration={1800} />
                                </div>
                                <div className="text-xs text-zinc-500 leading-snug">
                                    Recipient-only verification audit transparency
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Card: High-Fidelity UI Showcase + Quote */}
                    <div 
                        className="lg:col-span-6 flex flex-col gap-6 observe-animate"
                        style={{ transitionDelay: '0.16s' }}
                    >
                        {/* Upper Mockup Card */}
                        <div className="rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-6 sm:p-7 flex-1 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                            <div className="p-4 rounded-2xl bg-[#141418] border border-zinc-800 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        <span className="font-semibold text-white">Settlement Verified</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500">10:42 AM</span>
                                </div>

                                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-white">
                                            Ayush transferred <AnimatedCounter value={1600} formatNumber prefix="₹" suffix=".00" duration={1500} /> to Niranjan
                                        </div>
                                        <div className="text-[11px] text-zinc-400 mt-0.5">Payment Method: Google Pay UPI</div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                        Confirmed
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Confirmed exclusively by recipient · Zero dispute flag</span>
                                </div>
                            </div>

                            {/* Quote Card (matching bottom right of Image 3) */}
                            <div className="pt-6 mt-4 border-t border-zinc-900">
                                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal mb-4">
                                    &ldquo;We went from drowning in repetitive reminder messages to having an automated ledger that handles it all. Our friends now focus on closing deals and enjoying trips, not answering the same payment questions over and over.&rdquo;
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face"
                                            alt="James Whitfield"
                                            className="w-9 h-9 rounded-full object-cover grayscale border border-zinc-700"
                                        />
                                        <div>
                                            <div className="text-xs font-semibold text-white">James Whitfield</div>
                                            <div className="text-[11px] text-zinc-500">Head of Growth, RetailNest</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                                        NICKEL
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
