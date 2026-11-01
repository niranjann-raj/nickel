import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState, useEffect } from 'react';
import { X, SendHorizontal, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { api } from '../../api';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: number;
    currency: string;
    suggestedTransfer?: {
        from_user_id: number;
        from_user_name: string;
        from_user_avatar?: string;
        to_user_id: number;
        to_user_name: string;
        to_user_avatar?: string;
        amount: number;
    } | null;
    onPaymentRecorded?: (payment: any) => void;
}

export default function RecordPaymentModal({
    isOpen,
    onClose,
    roomId,
    currency,
    suggestedTransfer,
    onPaymentRecorded
}: RecordPaymentModalProps) {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (suggestedTransfer) {
            setNotes('');
            setError(null);
        }
    }, [suggestedTransfer, isOpen]);

    if (!isOpen || !suggestedTransfer) return null;

    const originalSuggested = suggestedTransfer.amount || 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (originalSuggested <= 0) {
            setError('Payment amount must be greater than zero.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.split.recordPayment(roomId, {
                payer_id: suggestedTransfer.from_user_id,
                recipient_id: suggestedTransfer.to_user_id,
                amount: originalSuggested,
                notes: notes.trim() || undefined
            });

            if (onPaymentRecorded) onPaymentRecorded(res.payment);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to record payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <SendHorizontal className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                                Record Settlement Payment
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Log a payment made to settle group balances
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Transfer Direction Banner */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                {suggestedTransfer.from_user_avatar ? (
                                    <img src={suggestedTransfer.from_user_avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    suggestedTransfer.from_user_name.charAt(0)
                                )}
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Payer</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[100px] block">
                                    {suggestedTransfer.from_user_name}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center px-2">
                            <ArrowRight className="w-4 h-4 text-emerald-400" />
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Recipient</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[100px] block">
                                    {suggestedTransfer.to_user_name}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                {suggestedTransfer.to_user_avatar ? (
                                    <img src={suggestedTransfer.to_user_avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    suggestedTransfer.to_user_name.charAt(0)
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Settlement Amount Display (Non-modifiable) */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Payment Amount ({currency})
                            </label>
                            <span className="text-[11px] font-semibold text-emerald-400">
                                Exact Settlement
                            </span>
                        </div>
                        <div className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 flex items-center justify-between select-none">
                            <span className="text-2xl font-mono font-black text-gray-900 dark:text-white">
                                {currency} {Number(originalSuggested).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Fixed
                            </span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                            Payment Reference / Notes
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. UPI / Google Pay / Cash / Bank transfer"
                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                        />
                    </div>

                    {/* Notice Disclaimer */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-400" />
                        <div>
                            <p className="font-semibold text-white">Trust & Settlement Workflow</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                This records an internal settlement in Nickel. The recipient ({suggestedTransfer.to_user_name}) will be prompted to confirm receipt.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || originalSuggested <= 0}
                        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <MatrixLoader size="sm" variant="orbit" rounded baseColor="#71717a" activeColor="#09090b" />
                        ) : (
                            <span>Record Payment of {currency} {Number(originalSuggested).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
