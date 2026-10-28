import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState, useEffect, useMemo } from 'react';
import { X, Receipt, Users, Calculator, AlertCircle, Check, Percent, PieChart, DollarSign } from 'lucide-react';
import { api } from '../../api';

interface Member {
    id: number;
    room_id: number;
    user_id: number;
    role: string;
    user: {
        id: number;
        full_name: string;
        email: string;
        avatar?: string;
    };
}

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: number;
    currency: string;
    members: Member[];
    editingExpense?: any | null;
    onExpenseSaved?: (expense: any) => void;
}

const CATEGORIES = [
    { name: 'Accommodation', emoji: '🏨' },
    { name: 'Food & Drinks', emoji: '🍽️' },
    { name: 'Transport', emoji: '🚕' },
    { name: 'Fuel', emoji: '⛽' },
    { name: 'Shopping', emoji: '🛍️' },
    { name: 'Activities & Tickets', emoji: '🎟️' },
    { name: 'Groceries', emoji: '🛒' },
    { name: 'Bills', emoji: '⚡' },
    { name: 'Other', emoji: '📦' },
];

export default function AddExpenseModal({
    isOpen,
    onClose,
    roomId,
    currency,
    members,
    editingExpense,
    onExpenseSaved
}: AddExpenseModalProps) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food & Drinks');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // Payer selection: 'single' | 'multiple'
    const [payerMode, setPayerMode] = useState<'single' | 'multiple'>('single');
    const [singlePayerId, setSinglePayerId] = useState<number>(members[0]?.user_id || 0);
    // Multiple payers: { [userId]: string_amount }
    const [multiplePayers, setMultiplePayers] = useState<Record<number, string>>({});

    // Split method: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'
    const [splitMethod, setSplitMethod] = useState<'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'>('EQUAL');

    // Selected participants for split: Set of userIds
    const [selectedParticipants, setSelectedParticipants] = useState<Set<number>>(
        new Set(members.map(m => m.user_id))
    );

    // Custom split allocations: { [userId]: string_value }
    const [customValues, setCustomValues] = useState<Record<number, string>>({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize or load edit data
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setAmount('');
            setCategory('Food & Drinks');
            setExpenseDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            setPayerMode('single');
            setSinglePayerId(members[0]?.user_id || 0);
            setMultiplePayers({});
            setSplitMethod('EQUAL');
            setSelectedParticipants(new Set(members.map(m => m.user_id)));
            setCustomValues({});
            setError(null);
            return;
        }

        if (editingExpense) {
            setTitle(editingExpense.title || '');
            setAmount(String(editingExpense.amount || ''));
            setCategory(editingExpense.category || 'Food & Drinks');
            setExpenseDate(editingExpense.expense_date || new Date().toISOString().split('T')[0]);
            setNotes(editingExpense.notes || '');
            setSplitMethod(editingExpense.split_method || 'EQUAL');

            // Payers
            if (editingExpense.payers && editingExpense.payers.length > 1) {
                setPayerMode('multiple');
                const mpMap: Record<number, string> = {};
                editingExpense.payers.forEach((p: any) => {
                    mpMap[p.user_id] = String(p.amount_paid);
                });
                setMultiplePayers(mpMap);
            } else if (editingExpense.payers && editingExpense.payers.length === 1) {
                setPayerMode('single');
                setSinglePayerId(editingExpense.payers[0].user_id);
            }

            // Participants
            if (editingExpense.shares && editingExpense.shares.length > 0) {
                const pSet = new Set<number>(editingExpense.shares.map((s: any) => s.user_id));
                setSelectedParticipants(pSet);

                const cvMap: Record<number, string> = {};
                editingExpense.shares.forEach((s: any) => {
                    if (editingExpense.split_method === 'EXACT') {
                        cvMap[s.user_id] = String(s.share_amount);
                    } else if (editingExpense.split_method === 'PERCENTAGE' || editingExpense.split_method === 'SHARES') {
                        cvMap[s.user_id] = String(s.raw_value !== null ? s.raw_value : s.share_amount);
                    }
                });
                setCustomValues(cvMap);
            }
        } else {
            setSelectedParticipants(new Set(members.map(m => m.user_id)));
            if (members.length > 0) {
                setSinglePayerId(members[0].user_id);
            }
        }
    }, [isOpen, editingExpense, members]);

    // Parse total amount
    const parsedAmount = useMemo(() => {
        const val = parseFloat(amount);
        return isNaN(val) || val <= 0 ? 0 : Math.round(val * 100) / 100;
    }, [amount]);

    // Multiple payers sum & difference
    const multiplePayersTotal = useMemo(() => {
        let sum = 0;
        Object.values(multiplePayers).forEach(val => {
            const num = parseFloat(val);
            if (!isNaN(num) && num > 0) sum += num;
        });
        return Math.round(sum * 100) / 100;
    }, [multiplePayers]);

    const payerDifference = useMemo(() => {
        return Math.round((parsedAmount - multiplePayersTotal) * 100) / 100;
    }, [parsedAmount, multiplePayersTotal]);

    // Toggle participant selection
    const toggleParticipant = (userId: number) => {
        setSelectedParticipants(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                if (next.size <= 1) return prev; // Keep at least 1 participant
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    // Calculate live split preview
    const splitPreview = useMemo(() => {
        const participantIds = Array.from(selectedParticipants);
        const n = participantIds.length;
        if (n === 0 || parsedAmount <= 0) return [];

        if (splitMethod === 'EQUAL') {
            const baseCents = Math.floor((parsedAmount * 100) / n);
            const remainder = Math.round(parsedAmount * 100) - (baseCents * n);

            return participantIds.map((uid, idx) => {
                const shareCents = baseCents + (idx < remainder ? 1 : 0);
                return {
                    user_id: uid,
                    share: shareCents / 100,
                    label: `${currency} ${(shareCents / 100).toFixed(2)}`
                };
            });
        }

        if (splitMethod === 'EXACT') {
            return participantIds.map(uid => {
                const entered = parseFloat(customValues[uid] || '0') || 0;
                return {
                    user_id: uid,
                    share: entered,
                    label: `${currency} ${entered.toFixed(2)}`
                };
            });
        }

        if (splitMethod === 'PERCENTAGE') {
            return participantIds.map(uid => {
                const pct = parseFloat(customValues[uid] || '0') || 0;
                const calculated = (parsedAmount * pct) / 100;
                return {
                    user_id: uid,
                    share: calculated,
                    percentage: pct,
                    label: `${pct}% (${currency} ${calculated.toFixed(2)})`
                };
            });
        }

        if (splitMethod === 'SHARES') {
            let totalShares = 0;
            participantIds.forEach(uid => {
                const s = parseFloat(customValues[uid] || '1') || 1;
                totalShares += s;
            });

            return participantIds.map(uid => {
                const s = parseFloat(customValues[uid] || '1') || 1;
                const calculated = totalShares > 0 ? (parsedAmount * s) / totalShares : 0;
                return {
                    user_id: uid,
                    share: calculated,
                    shares: s,
                    label: `${s} share${s !== 1 ? 's' : ''} (${currency} ${calculated.toFixed(2)})`
                };
            });
        }

        return [];
    }, [selectedParticipants, parsedAmount, splitMethod, customValues, currency]);

    // Validation for custom splits
    const customSplitValidation = useMemo(() => {
        const participantIds = Array.from(selectedParticipants);
        if (parsedAmount <= 0) return { valid: false, error: 'Enter a valid expense amount.' };
        if (participantIds.length === 0) return { valid: false, error: 'Select at least one participant.' };

        if (splitMethod === 'EXACT') {
            let sum = 0;
            participantIds.forEach(uid => {
                sum += parseFloat(customValues[uid] || '0') || 0;
            });
            const diff = Math.round((parsedAmount - sum) * 100) / 100;
            if (Math.abs(diff) > 0.01) {
                return {
                    valid: false,
                    error: `Custom shares total (${currency} ${sum.toFixed(2)}) doesn't match total (${currency} ${parsedAmount.toFixed(2)}). Difference: ${diff > 0 ? '+' : ''}${currency} ${diff.toFixed(2)}`
                };
            }
        }

        if (splitMethod === 'PERCENTAGE') {
            let totalPct = 0;
            participantIds.forEach(uid => {
                totalPct += parseFloat(customValues[uid] || '0') || 0;
            });
            const diffPct = Math.round((100 - totalPct) * 10) / 10;
            if (Math.abs(diffPct) > 0.05) {
                return {
                    valid: false,
                    error: `Percentages must add up to 100%. Current sum: ${totalPct.toFixed(1)}% (remaining: ${diffPct}%)`
                };
            }
        }

        if (splitMethod === 'SHARES') {
            let totalShares = 0;
            for (const uid of participantIds) {
                const s = parseFloat(customValues[uid] || '1');
                if (isNaN(s) || s <= 0) {
                    return { valid: false, error: 'All share values must be greater than zero.' };
                }
                totalShares += s;
            }
            if (totalShares <= 0) {
                return { valid: false, error: 'Total shares must be greater than zero.' };
            }
        }

        return { valid: true, error: null };
    }, [selectedParticipants, parsedAmount, splitMethod, customValues, currency]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Please enter an expense title.');
            return;
        }

        if (parsedAmount <= 0) {
            setError('Please enter an amount greater than 0.');
            return;
        }

        // Validate Payers
        let payersPayload: Array<{ user_id: number; amount_paid: number }> = [];
        if (payerMode === 'single') {
            payersPayload = [{ user_id: singlePayerId, amount_paid: parsedAmount }];
        } else {
            if (Math.abs(payerDifference) > 0.01) {
                setError(`Payer amounts must sum exactly to ${currency} ${parsedAmount.toFixed(2)}. Current total is ${currency} ${multiplePayersTotal.toFixed(2)}.`);
                return;
            }
            payersPayload = Object.entries(multiplePayers)
                .map(([uid, val]) => ({ user_id: parseInt(uid), amount_paid: parseFloat(val) || 0 }))
                .filter(p => p.amount_paid > 0);

            if (payersPayload.length === 0) {
                setError('Please assign payments to at least one payer.');
                return;
            }
        }

        // Validate Split Allocations
        if (!customSplitValidation.valid) {
            setError(customSplitValidation.error);
            return;
        }

        const participantIds = Array.from(selectedParticipants);
        const participantsPayload = participantIds.map(uid => {
            const item: any = { user_id: uid };
            if (splitMethod === 'EXACT') {
                item.amount = parseFloat(customValues[uid] || '0') || 0;
            } else if (splitMethod === 'PERCENTAGE') {
                item.percentage = parseFloat(customValues[uid] || '0') || 0;
            } else if (splitMethod === 'SHARES') {
                item.shares = parseFloat(customValues[uid] || '1') || 1;
            }
            return item;
        });

        setLoading(true);

        try {
            const payload = {
                title: title.trim(),
                amount: parsedAmount,
                category,
                expense_date: expenseDate,
                notes: notes.trim() || undefined,
                split_method: splitMethod,
                payers: payersPayload,
                participants: participantsPayload
            };

            let saved;
            if (editingExpense) {
                saved = await api.split.updateExpense(roomId, editingExpense.id, payload);
            } else {
                saved = await api.split.addExpense(roomId, payload);
            }

            if (onExpenseSaved) onExpenseSaved(saved.expense);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save expense.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                                {editingExpense ? 'Edit Expense' : 'Add Shared Expense'}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Record group spending and choose how to divide it
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

                {/* Form Body */}
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Title & Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                Expense Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Resort Booking, Dinner at Cafe, Highway Toll"
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                Total Amount ({currency}) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm font-medium cursor-pointer"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.name} value={c.name}>
                                        {c.emoji} {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                Expense Date
                            </label>
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                            Notes / Details (Optional)
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add invoice info, receipt notes, or reminders..."
                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                        />
                    </div>

                    {/* ========================================================================= */}
                    {/* SECTION 1: WHO PAID? */}
                    {/* ========================================================================= */}
                    <div className="p-4 rounded-2xl bg-gray-50/75 dark:bg-[#18181c]/75 border border-gray-200/80 dark:border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-white" />
                                Who Paid?
                            </span>
                            <div className="flex items-center bg-gray-200/60 dark:bg-white/5 rounded-xl p-1 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setPayerMode('single')}
                                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                        payerMode === 'single'
                                            ? 'bg-white text-zinc-950 shadow-sm font-bold'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Single Payer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayerMode('multiple');
                                        if (Object.keys(multiplePayers).length === 0 && parsedAmount > 0) {
                                            setMultiplePayers({ [singlePayerId]: String(parsedAmount) });
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                        payerMode === 'multiple'
                                            ? 'bg-white text-zinc-950 shadow-sm font-bold'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Multiple Payers
                                </button>
                            </div>
                        </div>

                        {payerMode === 'single' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {members.map((m) => (
                                     <button
                                         key={m.user_id}
                                         type="button"
                                         onClick={() => setSinglePayerId(m.user_id)}
                                         className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                             singlePayerId === m.user_id
                                                 ? 'bg-white text-zinc-950 border-white font-bold shadow-sm'
                                                 : 'bg-white dark:bg-[#121215] border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                                         }`}
                                     >
                                         <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs overflow-hidden">
                                             {m.user?.avatar ? (
                                                 <img src={m.user.avatar} alt="" className="w-full h-full object-cover" />
                                             ) : (
                                                 m.user?.full_name?.charAt(0) || 'U'
                                             )}
                                         </div>
                                         <span className="text-xs truncate flex-1">{m.user?.full_name}</span>
                                         {singlePayerId === m.user_id && <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />}
                                     </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2 pt-1">
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                                    <span>Enter the amount each person contributed:</span>
                                    <span className={payerDifference === 0 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                                        {payerDifference === 0 ? 'Exact sum matched' : `Remaining: ${currency} ${payerDifference.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {members.map((m) => (
                                        <div
                                            key={m.user_id}
                                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-[10px] overflow-hidden">
                                                    {m.user?.avatar ? (
                                                        <img src={m.user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        m.user?.full_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                                    {m.user?.full_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 w-28">
                                                <span className="text-xs text-gray-400">{currency}</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={multiplePayers[m.user_id] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setMultiplePayers(prev => ({ ...prev, [m.user_id]: val }));
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-full px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs font-mono font-semibold text-gray-900 dark:text-white text-right focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========================================================================= */}
                    {/* SECTION 2: SPLIT METHOD & PARTICIPANTS */}
                    {/* ========================================================================= */}
                    <div className="p-4 rounded-2xl bg-gray-50/75 dark:bg-[#18181c]/75 border border-gray-200/80 dark:border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                                <PieChart className="w-4 h-4 text-white" />
                                Split Method
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setSelectedParticipants(new Set(members.map(m => m.user_id)))}
                                    className="text-[11px] text-zinc-400 hover:text-white hover:underline cursor-pointer"
                                >
                                    Select All
                                </button>
                            </div>
                        </div>

                        {/* Split Method Tabs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'EQUAL', label: 'Equally', icon: Calculator },
                                { id: 'EXACT', label: 'Custom Amount', icon: DollarSign },
                                { id: 'PERCENTAGE', label: 'By Percentage', icon: Percent },
                                { id: 'SHARES', label: 'By Shares/Ratio', icon: Users },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSplitMethod(id as any)}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        splitMethod === id
                                            ? 'bg-white text-zinc-950 border-white font-bold shadow-sm'
                                            : 'bg-white dark:bg-[#121215] border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Participants List */}
                        <div className="space-y-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                Who shares this expense? ({selectedParticipants.size} selected)
                            </span>

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {members.map((m) => {
                                    const isSelected = selectedParticipants.has(m.user_id);
                                    return (
                                        <div
                                            key={m.user_id}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                                isSelected
                                                    ? 'bg-white dark:bg-[#121215] border-gray-200 dark:border-white/10'
                                                    : 'bg-gray-100/40 dark:bg-white/[0.02] border-transparent opacity-60'
                                            }`}
                                        >
                                            <div
                                                onClick={() => toggleParticipant(m.user_id)}
                                                className="flex items-center gap-3 cursor-pointer flex-1 truncate select-none"
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? 'bg-white border-white text-zinc-950 font-bold shadow-sm'
                                                            : 'border-gray-300 dark:border-white/20'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs overflow-hidden">
                                                    {m.user?.avatar ? (
                                                        <img src={m.user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        m.user?.full_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                    {m.user?.full_name}
                                                </span>
                                            </div>

                                            {/* Dynamic input according to split method */}
                                            {isSelected && (
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    {splitMethod === 'EQUAL' && (
                                                        <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                                                            {splitPreview.find(p => p.user_id === m.user_id)?.label || '-'}
                                                        </span>
                                                    )}

                                                    {splitMethod === 'EXACT' && (
                                                        <div className="flex items-center gap-1 w-28">
                                                            <span className="text-xs text-gray-400">{currency}</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={customValues[m.user_id] || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setCustomValues(prev => ({ ...prev, [m.user_id]: val }));
                                                                }}
                                                                placeholder="0.00"
                                                                className="w-full px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs font-mono font-semibold text-right focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
                                                            />
                                                        </div>
                                                    )}

                                                    {splitMethod === 'PERCENTAGE' && (
                                                        <div className="flex items-center gap-1 w-24">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="100"
                                                                value={customValues[m.user_id] || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setCustomValues(prev => ({ ...prev, [m.user_id]: val }));
                                                                }}
                                                                placeholder="0"
                                                                className="w-full px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs font-mono font-semibold text-right focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
                                                            />
                                                            <span className="text-xs text-gray-400">%</span>
                                                        </div>
                                                    )}

                                                    {splitMethod === 'SHARES' && (
                                                        <div className="flex items-center gap-1 w-24">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                min="1"
                                                                value={customValues[m.user_id] || '1'}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setCustomValues(prev => ({ ...prev, [m.user_id]: val }));
                                                                }}
                                                                placeholder="1"
                                                                className="w-full px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs font-mono font-semibold text-right focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
                                                            />
                                                            <span className="text-xs text-gray-400">pts</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Live Split Preview Box */}
                        {parsedAmount > 0 && selectedParticipants.size > 0 && (
                            <div className="p-3 rounded-xl bg-[#18181c] border border-white/10 text-xs space-y-1.5">
                                <div className="flex items-center justify-between font-semibold text-white">
                                    <span>Live Calculation Preview</span>
                                    <span>Total: {currency} {parsedAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {splitPreview.map((item) => {
                                        const mem = members.find(m => m.user_id === item.user_id);
                                        return (
                                            <span
                                                key={item.user_id}
                                                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300"
                                            >
                                                {mem?.user?.full_name?.split(' ')[0]}: <strong className="text-white">{item.label}</strong>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || parsedAmount <= 0}
                            className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <MatrixLoader size="sm" variant="orbit" rounded baseColor="#71717a" activeColor="#09090b" />
                            ) : (
                                <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
