import { X, Receipt, Calendar, Tag, FileText } from 'lucide-react';

interface ExpenseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: any | null;
    currency: string;
}

export default function ExpenseDetailsModal({
    isOpen,
    onClose,
    expense,
    currency
}: ExpenseDetailsModalProps) {
    if (!isOpen || !expense) return null;

    const splitMethodExplanation = (method: string) => {
        switch (method) {
            case 'EQUAL':
                return 'The total bill was split equally among all selected participants, with any single-paisa rounding distributed deterministically.';
            case 'EXACT':
            case 'UNEQUAL':
                return 'Custom exact amounts were manually assigned to each participant.';
            case 'PERCENTAGE':
                return 'The expense was divided according to specific percentage shares assigned to each member.';
            case 'SHARES':
            case 'RATIO':
                return 'The expense was split proportionally according to custom ratio share units assigned to each member.';
            default:
                return 'Calculated using group split rules.';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white truncate max-w-xs">
                                {expense.title}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Detailed expense breakdown
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

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Big Amount Card */}
                    <div className="p-5 rounded-2xl bg-[#18181c] border border-white/10 text-center">
                        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase block mb-1">
                            Total Expense Amount
                        </span>
                        <div className="text-3xl font-mono font-black text-rose-400">
                            {currency} {Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5" />
                                {expense.category}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {expense.expense_date}
                            </span>
                        </div>
                    </div>

                    {/* Notes if available */}
                    {expense.notes && (
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span>{expense.notes}</span>
                        </div>
                    )}

                    {/* Paid By Breakdown */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white block">
                            Paid By ({expense.payers?.length || 1} {expense.payers?.length === 1 ? 'person' : 'people'})
                        </span>
                        <div className="space-y-1.5">
                            {expense.payers?.map((p: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/5"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                            {p.user_avatar ? (
                                                <img src={p.user_avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                p.user_name?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {p.user_name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-emerald-400">
                                        {currency} {Number(p.amount_paid).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Split Details Breakdown */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white block">
                                Who Owes How Much ({expense.shares?.length || 0} participants)
                            </span>
                            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                                {expense.split_method}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {splitMethodExplanation(expense.split_method)}
                        </p>

                        <div className="space-y-1.5 pt-1">
                            {expense.shares?.map((s: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/5"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                            {s.user_avatar ? (
                                                <img src={s.user_avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                s.user_name?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {s.user_name}
                                        </span>
                                        {s.raw_value !== null && s.raw_value !== undefined && (
                                            <span className="text-[11px] text-gray-400">
                                                ({expense.split_method === 'PERCENTAGE' ? `${s.raw_value}%` : `${s.raw_value} pts`})
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-mono font-bold text-rose-500">
                                        {currency} {Number(s.share_amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Created by {expense.creator?.full_name || 'Member'}</span>
                        <span>{expense.created_at ? new Date(expense.created_at).toLocaleDateString() : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
