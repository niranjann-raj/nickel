import { useState, useEffect } from 'react';
import { Eye, EyeOff, Wifi } from 'lucide-react';
import { useDashboard } from '../DashboardLayout';
import { api } from '../api';

interface BalanceData {
    current_balance: number;
    total_balance: number;
    total_income: number;
    total_expenses: number;
    initial_balance: number;
    currency: string;
    currency_symbol: string;
}

export default function NickelDebitCard() {
    const { user } = useDashboard();
    const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    // Hidden by default as requested
    const [showBalance, setShowBalance] = useState(false);

    const fetchBalance = async () => {
        try {
            const res = await api.tracker.getBalance();
            setBalanceData(res);
        } catch (err) {
            console.error('Failed to fetch tracker balance for debit card:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();

        // Automatically update balance when any transaction is added, edited, or deleted in Expense Tracker
        const handleTrackerUpdate = () => {
            fetchBalance();
        };

        window.addEventListener('nickel:tracker-updated', handleTrackerUpdate);
        window.addEventListener('focus', handleTrackerUpdate);

        return () => {
            window.removeEventListener('nickel:tracker-updated', handleTrackerUpdate);
            window.removeEventListener('focus', handleTrackerUpdate);
        };
    }, []);

    const formatAmount = (val: number) => {
        return Math.abs(val).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const currencySymbol = balanceData?.currency_symbol || '₹';
    const totalBalance = balanceData?.current_balance ?? balanceData?.total_balance ?? 0;
    const isNegative = totalBalance < 0;

    return (
        <div className="relative w-full h-full min-h-[220px] rounded-[24px] p-6 sm:p-7 overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-black/70 group select-none bg-gradient-to-br from-[#242429] via-[#161619] to-[#0d0d0f]">
            {/* Subtle Metallic Specular Sheen */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-80" />
            <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-white/[0.03] rounded-full blur-[60px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-48 h-48 bg-black/60 rounded-full blur-[50px]" />

            {/* Top Bar: "Debit Card" and "NICKEL" */}
            <div className="flex items-center justify-between relative z-10">
                <span className="text-xs sm:text-sm font-medium tracking-wider text-gray-300 font-sans">
                    Debit Card
                </span>
                <div className="flex flex-col items-end">
                    <span className="font-heading font-black tracking-[0.24em] text-base sm:text-lg text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                        NICKEL
                    </span>
                    <div className="w-10 h-[2px] bg-white/70 rounded-full mt-0.5" />
                </div>
            </div>

            {/* Middle Section: Balance Display + Eye Toggle */}
            <div className="my-auto py-2 relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Account Balance
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowBalance(!showBalance)}
                        aria-label={showBalance ? 'Hide account balance' : 'Show account balance'}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 text-[11px]"
                    >
                        {showBalance ? (
                            <>
                                <EyeOff className="w-3.5 h-3.5 text-gray-300" />
                                <span className="hidden sm:inline text-[10px] text-gray-300 font-medium">Hide</span>
                            </>
                        ) : (
                            <>
                                <Eye className="w-3.5 h-3.5 text-gray-300" />
                                <span className="hidden sm:inline text-[10px] text-gray-300 font-medium">Show</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-baseline gap-2">
                    {loading ? (
                        <div className="h-9 w-40 bg-white/10 rounded-lg animate-pulse" />
                    ) : showBalance ? (
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                                {isNegative && '-'}{currencySymbol} {formatAmount(totalBalance)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-2xl sm:text-3xl font-mono font-black text-gray-300 tracking-[0.3em] select-none">
                            {currencySymbol} ••••••••
                        </span>
                    )}
                </div>
            </div>

            {/* Bottom Bar: User Name & Contactless Symbol */}
            <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/5">
                <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-0.5">
                        Cardholder
                    </p>
                    <span className="font-mono font-bold text-xs sm:text-sm tracking-[0.16em] text-gray-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] block truncate max-w-[220px]">
                        {user?.full_name || 'VALUED CUSTOMER'}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    <Wifi className="w-5 h-5 rotate-90 text-gray-400/80" />
                </div>
            </div>
        </div>
    );
}
