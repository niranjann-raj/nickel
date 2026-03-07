import { useEffect, useState } from 'react';
import { Coins, ShoppingBag, Gift } from 'lucide-react';
import { useDashboard } from '../DashboardLayout';

export default function CoinsWalletCard() {
    const { user } = useDashboard();
    const coins = user?.coins ?? 0;

    const rewards = [
        { icon: ShoppingBag, label: 'Shopping Coupon', cost: 500, desc: '₹50 off on any purchase' },
        { icon: Gift, label: 'Gift Card', cost: 1000, desc: '₹100 gift card' },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center">
                        <Coins className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Coins Wallet</h3>
                        <p className="text-xs text-gray-400">Redeem for rewards</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-heading font-black text-4xl text-yellow-500">{coins.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">coins</p>
                </div>
            </div>

            <div className="space-y-3">
                {rewards.map(({ icon: Icon, label, cost, desc }) => {
                    const canRedeem = coins >= cost;
                    return (
                        <div key={label} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                                    <p className="text-xs text-gray-400">{desc}</p>
                                </div>
                            </div>
                            <button
                                disabled={!canRedeem}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${canRedeem
                                        ? 'gradient-bg text-white hover:shadow-md hover:scale-105'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {cost} 🪙
                            </button>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-center text-gray-400 mt-4">Earn coins by completing quizzes and maintaining streaks</p>
        </div>
    );
}
