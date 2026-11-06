import React from 'react';
import { AnimatedCounter } from './ui/AnimatedCounter';

export default function SolutionSection() {
    return (
        <section id="why-nickel" className="py-24 md:py-32 bg-black text-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-14 observe-animate">
                    <div className="inline-flex items-center px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-wider text-zinc-300 uppercase mb-6">
                        <span>Why Nickel</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white max-w-4xl leading-[1.15]">
                        Every rupee you save is measured against real financial outcomes —{' '}
                        <span className="text-zinc-500">
                            habits formed, impulse spending curbed and wealth compounded
                        </span>
                    </h2>
                </div>

                {/* Bento Grid with Scroll Animations */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Card 1: ₹2.4Cr+ / Metric with Visual Backdrop (4 cols) */}
                    <div 
                        className="lg:col-span-4 rounded-3xl bg-zinc-950 border border-zinc-800/80 p-8 flex flex-col justify-between relative overflow-hidden group min-h-[280px] observe-animate hover:border-zinc-700 transition-colors"
                        style={{ transitionDelay: '0.05s' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 via-zinc-900/40 to-black pointer-events-none" />
                        <div className="relative z-10">
                            <div className="text-6xl font-sans font-bold tracking-tight text-white mb-2">
                                <AnimatedCounter value={2.4} decimals={1} prefix="₹" suffix="Cr+" duration={2000} />
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">
                                Total automated wealth secured across user goals
                            </p>
                        </div>
                        <div className="relative z-10 pt-12 flex items-center justify-between text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                            <span>NICKEL VAULT</span>
                            <span className="text-zinc-600">01</span>
                        </div>
                    </div>

                    {/* Card 2: 94% Retention Rate (3 cols) */}
                    <div 
                        className="lg:col-span-3 rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-8 flex flex-col justify-between min-h-[280px] observe-animate hover:border-zinc-700 transition-colors"
                        style={{ transitionDelay: '0.1s' }}
                    >
                        <div>
                            <div className="text-6xl font-sans font-bold tracking-tight text-white mb-2">
                                <AnimatedCounter value={94} suffix="%" duration={1800} />
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">
                                Average goal completion & consistency rate
                            </p>
                        </div>
                        <div className="pt-12 text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                            AUTOPAY
                        </div>
                    </div>

                    {/* Card 3: Quote Card (5 cols) */}
                    <div 
                        className="lg:col-span-5 rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-8 flex flex-col justify-between min-h-[280px] observe-animate hover:border-zinc-700 transition-colors"
                        style={{ transitionDelay: '0.15s' }}
                    >
                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                            &ldquo;Within 6 weeks of using Nickel, our group split all trip expenses seamlessly and I automated ₹15,000 in monthly goal savings without even feeling it. What used to take hours of manual spreadsheets now runs on its own around the clock.&rdquo;
                        </p>
                        <div className="pt-8 flex items-center justify-between border-t border-zinc-900 mt-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face"
                                    alt="Sarah Mitchell"
                                    className="w-9 h-9 rounded-full object-cover grayscale border border-zinc-700"
                                />
                                <div>
                                    <div className="text-xs font-semibold text-white">Sarah Mitchell</div>
                                    <div className="text-[11px] text-zinc-500">Head of Operations, RetailNest</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                                VERIFIED
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Wide Quote Card (6 cols) */}
                    <div 
                        className="lg:col-span-6 rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-8 flex flex-col justify-between min-h-[260px] observe-animate hover:border-zinc-700 transition-colors"
                        style={{ transitionDelay: '0.2s' }}
                    >
                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                            &ldquo;We went from missing payments and awkward &apos;did you pay me back?&apos; texts to instant verified settlements. The pairwise settlement algorithm reduced 14 chaotic transfers to 3 clean payments. The ROI in peace of mind was visible in the first month.&rdquo;
                        </p>
                        <div className="pt-8 flex items-center justify-between border-t border-zinc-900 mt-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face"
                                    alt="Sheldon Cooper"
                                    className="w-9 h-9 rounded-full object-cover grayscale border border-zinc-700"
                                />
                                <div>
                                    <div className="text-xs font-semibold text-white">Sheldon Cooper</div>
                                    <div className="text-[11px] text-zinc-500">Founder, GrowthLane</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                                SPLIT ROOM
                            </span>
                        </div>
                    </div>

                    {/* Card 5: 60h Saved (3 cols) */}
                    <div 
                        className="lg:col-span-3 rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-8 flex flex-col justify-between min-h-[260px] observe-animate hover:border-zinc-700 transition-colors"
                        style={{ transitionDelay: '0.25s' }}
                    >
                        <div>
                            <div className="text-6xl font-sans font-bold tracking-tight text-white mb-2">
                                <AnimatedCounter value={60} suffix="h" duration={1800} />
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">
                                Average hours saved per year on manual budgeting & receipt logging
                            </p>
                        </div>
                        <div className="pt-8 text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                            TRACKER OCR
                        </div>
                    </div>

                    {/* Card 6: 4.9★ Rating (3 cols) */}
                    <div 
                        className="lg:col-span-3 rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-8 flex flex-col justify-between min-h-[260px] observe-animate hover:border-zinc-700 transition-colors"
                        style={{ transitionDelay: '0.3s' }}
                    >
                        <div>
                            <div className="text-6xl font-sans font-bold tracking-tight text-white mb-2">
                                <AnimatedCounter value={4.9} decimals={1} suffix="★" duration={1600} />
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">
                                Average client rating from 50,000+ active savers
                            </p>
                        </div>
                        <div className="pt-8 text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                            COMMUNITY
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
