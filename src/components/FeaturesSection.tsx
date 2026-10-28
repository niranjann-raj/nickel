import React, { useState } from 'react';
import { Target, PieChart, Users2, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, Receipt, Mic } from 'lucide-react';
import { AnimatedCounter } from './ui/AnimatedCounter';

export default function FeaturesSection() {
    const [activeTab, setActiveTab] = useState<'goals' | 'tracker' | 'split' | 'ai'>('goals');

    const tabs = [
        { id: 'goals', label: 'Goal-Based Savings', icon: Target },
        { id: 'tracker', label: 'Smart Expense Tracker', icon: PieChart },
        { id: 'split', label: 'Room Split Expenses', icon: Users2 },
        { id: 'ai', label: 'Nickel AI Assistant', icon: Sparkles },
    ] as const;

    return (
        <section id="features" className="py-24 md:py-32 bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-14 observe-animate">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.15]">
                                What we engineer and automate for your wealth
                            </h2>
                        </div>
                        <div className="lg:col-span-5">
                            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                                We don&apos;t build boring spreadsheets. We build autonomous tools and visual intelligence designed around how modern savers actually live and spend.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabbed Interactive Feature Showcase (Image 2 style) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Navigation Tabs */}
                    <div className="lg:col-span-4 flex flex-col space-y-1 observe-animate" style={{ transitionDelay: '0.05s' }}>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center justify-between text-sm cursor-pointer ${
                                        isActive
                                            ? 'bg-zinc-900 text-white font-semibold border-l-2 border-white shadow-sm'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-l-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                                        <span>{tab.label}</span>
                                    </div>
                                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Large Feature Card Showcase */}
                    <div 
                        className="lg:col-span-8 rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-6 sm:p-8 min-h-[500px] flex flex-col justify-between observe-animate hover:border-zinc-700 transition-colors"
                        style={{ transitionDelay: '0.1s' }}
                    >
                        {/* Tab 1: Goal-Based Savings */}
                        {activeTab === 'goals' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                                        Goal-Based Savings & AutoPay Engine
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                        Set financial milestones with visual progress tracking. Auto-save micro-amounts on your schedule, protect savings streaks, and compound wealth on auto-pilot.
                                    </p>
                                </div>

                                {/* Mockup Container */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    {/* Mockup Card 1: Goal Overview */}
                                    <div className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold px-2 py-0.5 rounded-full bg-zinc-800/60">
                                                Active Goal
                                            </span>
                                            <span className="text-xs font-mono font-bold text-white">
                                                <AnimatedCounter value={78} suffix="% Complete" duration={1500} />
                                            </span>
                                        </div>

                                        <div>
                                            <div className="text-base font-bold text-white">MacBook Pro M3 Fund</div>
                                            <div className="text-xs text-zinc-400 mt-0.5">
                                                Target: ₹1,50,000 · Saved: <AnimatedCounter value={117000} formatNumber prefix="₹" duration={1600} />
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                            <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: '78%' }} />
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                                            <span>AutoPay: ₹12,500/mo</span>
                                            <span className="text-emerald-400 font-medium">On Track</span>
                                        </div>
                                    </div>

                                    {/* Mockup Card 2: AutoPay Settings */}
                                    <div className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-3">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                                            AutoPay Configuration
                                        </span>

                                        <div className="space-y-2 text-xs">
                                            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-between">
                                                <span className="text-zinc-400">Frequency</span>
                                                <span className="font-semibold text-white">1st of Month</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-between">
                                                <span className="text-zinc-400">Round-up Savings</span>
                                                <span className="font-semibold text-emerald-400">Enabled (₹10s)</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-between">
                                                <span className="text-zinc-400">Streak Defense</span>
                                                <span className="font-semibold text-white">Shield Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Smart Expense Tracker */}
                        {activeTab === 'tracker' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                                        Smart Expense Tracker & OCR Receipt Scanner
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                        Never wonder where your paycheck vanished. Auto-categorize spending, set hard budget caps, and scan paper bills with instant AI extraction.
                                    </p>
                                </div>

                                {/* Mockup Container */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    {/* Mockup Card 1: Budget Cap */}
                                    <div className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold px-2 py-0.5 rounded-full bg-zinc-800/60">
                                                Monthly Budget Cap
                                            </span>
                                            <span className="text-xs font-mono font-bold text-white">
                                                <AnimatedCounter value={69} suffix="% Spent" duration={1500} />
                                            </span>
                                        </div>

                                        <div>
                                            <div className="text-2xl font-mono font-bold text-white">
                                                <AnimatedCounter value={34500} formatNumber prefix="₹" suffix=".00" duration={1600} />
                                            </div>
                                            <div className="text-xs text-zinc-400 mt-0.5">Budget limit: ₹50,000.00 · Remaining: ₹15,500.00</div>
                                        </div>

                                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                            <div className="bg-zinc-300 h-full rounded-full transition-all duration-1000" style={{ width: '69%' }} />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-zinc-400">
                                            <div className="p-2 rounded-lg bg-zinc-900 text-center">
                                                <span className="block text-[10px] text-zinc-500">Dining</span>
                                                <span className="font-semibold text-white">₹14.2k</span>
                                            </div>
                                            <div className="p-2 rounded-lg bg-zinc-900 text-center">
                                                <span className="block text-[10px] text-zinc-500">Travel</span>
                                                <span className="font-semibold text-white">₹8.4k</span>
                                            </div>
                                            <div className="p-2 rounded-lg bg-zinc-900 text-center">
                                                <span className="block text-[10px] text-zinc-500">Subs</span>
                                                <span className="font-semibold text-white">₹2.8k</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mockup Card 2: OCR Scanner */}
                                    <div className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-3">
                                        <div className="flex items-center gap-2 text-white font-semibold text-xs">
                                            <Receipt className="w-4 h-4 text-zinc-400" />
                                            <span>Instant Bill OCR Extraction</span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Merchant</span>
                                                <span className="text-white font-semibold">Blue Tokai Coffee</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Extracted Amount</span>
                                                <span className="font-mono text-emerald-400 font-bold">₹640.00</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Category Tag</span>
                                                <span className="text-zinc-300">Food & Dining</span>
                                            </div>
                                            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Auto-logged to Monthly Ledger</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Room Split Expenses */}
                        {activeTab === 'split' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                                        Room Split Expenses & Pairwise Debt Minimizer
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                        Create shared rooms with secure 6-character room codes. Our greedy debtor-creditor algorithm simplifies chaotic group debts into the minimum transfers needed.
                                    </p>
                                </div>

                                {/* Mockup Container */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    {/* Mockup Card 1: Room Overview */}
                                    <div className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">Manali Trip 2026</span>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                                                #MNL404
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Total Group Spent</span>
                                                <span className="font-mono text-white font-bold">
                                                    <AnimatedCounter value={11700} formatNumber prefix="₹" suffix=".00" duration={1600} />
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Outstanding Debt</span>
                                                <span className="font-mono text-rose-400 font-semibold">
                                                    <AnimatedCounter value={1600} formatNumber prefix="₹" suffix=".00" duration={1500} />
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Settlement Progress</span>
                                                <span className="text-zinc-300 font-mono font-semibold">
                                                    <AnimatedCounter value={73} suffix="% Settled" duration={1600} />
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-[11px] text-zinc-400">
                                            <span>3 Verified Members · 4 Shared Expenses</span>
                                        </div>
                                    </div>

                                    {/* Mockup Card 2: Settlement Action */}
                                    <div className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-3">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                                            Simplified Suggested Transfer
                                        </span>

                                        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5 text-xs">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">N</div>
                                                    <span className="text-zinc-300 font-semibold">Niranjan</span>
                                                </div>
                                                <span className="text-zinc-500 font-mono text-[10px] uppercase">pays</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">A</div>
                                                    <span className="text-zinc-300 font-semibold">Ayush</span>
                                                </div>
                                            </div>

                                            <div className="text-center font-mono font-bold text-lg text-white pt-1">
                                                <AnimatedCounter value={1600} formatNumber prefix="₹" suffix=".00" duration={1500} />
                                            </div>

                                            <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[11px]">
                                                <span className="text-zinc-500">Recipient Verification</span>
                                                <span className="text-emerald-400 font-medium flex items-center gap-1">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    UPI Protected
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Nickel AI Intelligence */}
                        {activeTab === 'ai' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                                        Nickel AI Financial Intelligence & Voice Queries
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                        Ask natural questions in plain English or speak with voice input. Receive instant spending insights, budget feasibility checks, and smart saving recommendations.
                                    </p>
                                </div>

                                {/* Mockup Container */}
                                <div className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-3">
                                    {/* User message */}
                                    <div className="flex items-start gap-3 justify-end">
                                        <div className="p-3 rounded-2xl rounded-tr-sm bg-zinc-800 text-white text-xs max-w-md">
                                            Can I afford a weekend trip to Goa without breaking my Vacation savings goal?
                                        </div>
                                    </div>

                                    {/* AI Response */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-black font-bold text-xs">
                                            N
                                        </div>
                                        <div className="p-3.5 rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs max-w-lg space-y-2">
                                            <p>
                                                Yes! Based on your remaining monthly budget of <strong className="text-white">₹15,500</strong> and your scheduled <strong className="text-white">₹12,500</strong> AutoPay already secured:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                                                <li>Your disposable spending surplus is <strong className="text-emerald-400">₹8,200</strong>.</li>
                                                <li>Keeping weekend trip costs under ₹7,500 protects your 14-day saving streak intact.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Voice Input pill bar */}
                                    <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-800">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Mic className="w-3.5 h-3.5 text-zinc-300" />
                                            <span>Voice Input active · English detection</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                            GEMINI FLASH 2.5
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bottom Feature Navigation Footer */}
                        <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                            <span>Engineered with zero-knowledge encryption & local privacy</span>
                            <span className="font-mono text-zinc-400">NICKEL OS 2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
