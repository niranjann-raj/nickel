/**
 * Helper to calculate Gold Coins rewarded upon successfully completing a savings goal.
 * Tiers:
 * - Below 1,000: 25 coins
 * - 1,000 to < 2,500: 50 coins
 * - 2,500 to < 5,000: 100 coins
 * - 5,000 to < 10,000: 200 coins
 * - 10,000 to < 25,000: 500 coins
 * - 25,000 to < 50,000: 1,000 coins
 * - 50,000 to < 1,00,000 (1L): 2,000 coins
 * - 1,00,000 to < 2,50,000 (2.5L): 5,000 coins
 * - 2,50,000 to < 5,00,000 (5L): 10,000 coins
 * - 5,00,000+ (5L+): 20,000 coins
 */
export function getGoalCompletionCoins(targetAmount: number | string): number {
    const target = Number(targetAmount || 0);
    if (target < 1000) return 25;
    if (target < 2500) return 50;
    if (target < 5000) return 100;
    if (target < 10000) return 200;
    if (target < 25000) return 500;
    if (target < 50000) return 1000;
    if (target < 100000) return 2000;
    if (target < 250000) return 5000;
    if (target < 500000) return 10000;
    return 20000;
}

export const GOAL_REWARD_TIERS = [
    { range: 'Below ₹1,000', coins: 25 },
    { range: '₹1,000 – ₹2,500', coins: 50 },
    { range: '₹2,500 – ₹5,000', coins: 100 },
    { range: '₹5,000 – ₹10,000', coins: 200 },
    { range: '₹10,000 – ₹25,000', coins: 500 },
    { range: '₹25,000 – ₹50,000', coins: 1000 },
    { range: '₹50,000 – ₹1,00,000', coins: 2000 },
    { range: '₹1,00,000 – ₹2,50,000', coins: 5000 },
    { range: '₹2,50,000 – ₹5,00,000', coins: 10000 },
    { range: '₹5,00,000+', coins: 20000 },
];

