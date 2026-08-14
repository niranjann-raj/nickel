import { useState, useEffect } from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../api';

export default function TransactionHistoryCard() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const data = await api.bank.getTransactions(1);
            setTransactions(data.transactions || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        // Polling to keep it updated when simulations happen
        const interval = setInterval(fetchTransactions, 3000);
        return () => clearInterval(interval);
    }, []);

    if (loading && transactions.length === 0) return <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 h-64 animate-pulse border border-gray-100 dark:border-gray-800 mt-6" />;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Transaction History</h3>
                    <p className="text-xs text-gray-500">Your recent bank and autopay activity</p>
                </div>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No transactions yet.</div>
            ) : (
                <div className="space-y-4">
                    {transactions.slice(0, 10).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                    {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div className="max-w-[200px] sm:max-w-xs">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{tx.description}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold">{new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className={`font-black tracking-tight ${tx.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
