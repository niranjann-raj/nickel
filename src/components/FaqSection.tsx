import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
    question: string;
    answer: string;
}

export default function FaqSection() {
    const [activeCategory, setActiveCategory] = useState<'general' | 'goals' | 'tracker' | 'split'>('general');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const categories = [
        { id: 'general', label: 'General' },
        { id: 'goals', label: 'Goal Savings' },
        { id: 'tracker', label: 'Expense Tracker' },
        { id: 'split', label: 'Split Expense' },
    ] as const;

    const faqsByCategory: Record<'general' | 'goals' | 'tracker' | 'split', FaqItem[]> = {
        general: [
            {
                question: 'How does Nickel keep my financial data and account secure?',
                answer: 'Nickel enforces zero-knowledge architecture and bank-grade 256-bit AES encryption. We never store unmasked payment credentials or share transaction data with third parties. All your records remain strictly confidential and accessible only to you.',
            },
            {
                question: 'Is Nickel free to use for personal goals and group splitting?',
                answer: 'Yes! Core personal savings goals, budget tracking, OCR bill scanning, and group split rooms are completely free with zero hidden platform commissions or maintenance fees.',
            },
            {
                question: 'Can I export clean PDF summaries and audit records?',
                answer: 'Yes. Nickel includes one-click export for institutional-grade financial PDF summaries and CSV records for your goals, monthly category expenditures, and split room settlements.',
            },
            {
                question: 'How does streak tracking and avatar gamification work?',
                answer: 'Every day you maintain saving discipline or log transactions, your streak counter advances and unlocks XP coins. You can use earned coins to redeem streak shields, avatars, and spin-the-wheel perks in the Shop.',
            },
        ],
        goals: [
            {
                question: 'How does automated AutoPay goal saving work?',
                answer: 'You define the target amount, completion date, and frequency (daily, weekly, or monthly). Nickel calculates the exact required allocation and schedules automated contributions directly to your designated goal fund.',
            },
            {
                question: 'Can I pause, delay, or withdraw from my savings goals?',
                answer: 'Yes. You have complete flexibility. You can pause AutoPay schedules, extend deadlines, or withdraw accumulated savings without lock-in penalties or extra fees.',
            },
            {
                question: 'What happens if my bank balance is low on a deduction date?',
                answer: 'Our smart buffer safeguard detects low balances before execution to avoid overdraft charges. If insufficient funds are present, the deduction pauses and alerts you without breaking your streak.',
            },
        ],
        tracker: [
            {
                question: 'How does the OCR receipt and bill scanner work?',
                answer: 'Upload or drop any bill image or receipt photo. Nickel’s OCR pipeline extracts the merchant name, total amount, date, and suggested category in seconds, auto-logging it to your expense ledger.',
            },
            {
                question: 'Can I establish monthly budget limits per category?',
                answer: 'Yes. You can configure monthly caps for individual categories like Dining, Travel, or Subscriptions. Nickel alerts you when spending reaches 80% and 100% of your configured cap.',
            },
            {
                question: 'Can I log income and custom recurring transactions?',
                answer: 'Yes. You can track both expenses and income streams, filter by dynamic periods (This Week, Last Week, This Month, Last Month, Custom), and inspect visual spending graphs.',
            },
        ],
        split: [
            {
                question: 'How does the simplified settlement algorithm reduce transfers?',
                answer: 'Instead of having every member pay every other person back and forth, our greedy debtor-creditor algorithm calculates the net balance of all expenses and minimizes the total transactions required (e.g. condensing 15 group debts into 3 transfers).',
            },
            {
                question: 'Why can only the recipient confirm receipt or dispute a payment?',
                answer: 'To protect audit integrity and eliminate fraud, when a sender transfers money via UPI, only the designated recipient who received the money in their bank account gets the option to click "Confirm Receipt" or "Dispute".',
            },
            {
                question: 'How do room codes and member invites work?',
                answer: 'Every split room has a unique 6-character hex code (e.g. #MNL404). Members can enter the code to join instantly, view real-time expense ledgers, and settle pairwise debts.',
            },
        ],
    };

    const currentFaqs = faqsByCategory[activeCategory];

    const toggleAccordion = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section id="faq" className="py-24 md:py-32 bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 2-Column FAQ Layout (Image 4 style) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Title & Help Box */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-10">
                        <div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.15]">
                                Frequently Asked Questions
                            </h2>
                        </div>

                        {/* Contact Card (matching bottom left of Image 4) */}
                        <div className="rounded-3xl bg-[#0c0c0e] border border-zinc-800/80 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=160&h=160&fit=crop"
                                    alt="Nickel Support Team"
                                    className="w-full h-full object-cover grayscale"
                                />
                            </div>
                            <div className="space-y-3 flex-1">
                                <div>
                                    <div className="text-sm font-semibold text-white">Still have questions?</div>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        Reach out and our support engineering team will get back to you within 24 hours.
                                    </p>
                                </div>
                                <Link
                                    to="/signup"
                                    className="btn-white inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-white !text-black hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
                                >
                                    <span className="!text-black font-bold">Contact Us</span>
                                    <ArrowRight className="w-3.5 h-3.5 !text-black" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Category Tabs & Accordion */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Category Filter Tabs */}
                        <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto">
                            {categories.map((cat) => {
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setOpenIndex(0);
                                        }}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                                            isActive
                                                ? 'bg-zinc-900 text-white font-semibold border border-zinc-800'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Accordion Questions List */}
                        <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
                            {currentFaqs.map((faq, idx) => {
                                const isOpen = openIndex === idx;
                                return (
                                    <div key={idx} className="py-5">
                                        <button
                                            type="button"
                                            onClick={() => toggleAccordion(idx)}
                                            className="w-full text-left flex items-center justify-between gap-4 cursor-pointer group"
                                        >
                                            <span className={`text-sm sm:text-base font-normal transition-colors ${
                                                isOpen ? 'text-white font-medium' : 'text-zinc-300 group-hover:text-white'
                                            }`}>
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-zinc-500 transition-transform duration-200 flex-shrink-0 ${
                                                    isOpen ? 'transform rotate-180 text-white' : ''
                                                }`}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="pt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal pr-6 animate-fadeIn">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

