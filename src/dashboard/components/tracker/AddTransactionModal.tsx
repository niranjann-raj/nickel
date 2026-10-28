import { useState, useEffect, type FormEvent } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { api } from '../../api';
import { TrackerTransactionItem } from './TransactionTable';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (savedDate?: string) => void;
    editingTransaction?: TrackerTransactionItem | null;
    categories: { id: number; name: string; type?: string; color?: string }[];
    onCategoryCreated?: () => void;
}

export default function AddTransactionModal({
    isOpen,
    onClose,
    onSuccess,
    editingTransaction,
    categories,
    onCategoryCreated
}: AddTransactionModalProps) {
    const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
    const [amount, setAmount] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [merchant, setMerchant] = useState('');
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isSubscription, setIsSubscription] = useState(false);

    // Inline custom category creation state
    const [showNewCatInput, setShowNewCatInput] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#888888');
    const [creatingCat, setCreatingCat] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingTransaction) {
            setType(editingTransaction.type);
            setAmount(String(editingTransaction.amount));
            setCategoryName(editingTransaction.category_name);
            setMerchant(editingTransaction.merchant || '');
            setTxDate(editingTransaction.transaction_date);
            setPaymentMethod(editingTransaction.payment_method || 'UPI');
            setDescription(editingTransaction.description || '');
            setTags(editingTransaction.tags ? editingTransaction.tags.join(', ') : '');
            setIsSubscription(editingTransaction.is_subscription || false);
        } else {
            resetForm();
        }
    }, [editingTransaction, isOpen]);

    const resetForm = () => {
        setType('EXPENSE');
        setAmount('');
        setCategoryName(categories[0]?.name || 'Food & Dining');
        setMerchant('');
        setTxDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('UPI');
        setDescription('');
        setTags('');
        setIsSubscription(false);
        setError('');
        setShowNewCatInput(false);
    };

    if (!isOpen) return null;

    const handleCreateCustomCategory = async () => {
        if (!newCatName.trim()) return;
        setCreatingCat(true);
        setError('');
        try {
            await api.tracker.createCategory({
                name: newCatName.trim(),
                type: type,
                color: newCatColor
            });
            if (onCategoryCreated) onCategoryCreated();
            setCategoryName(newCatName.trim());
            setNewCatName('');
            setShowNewCatInput(false);
        } catch (err: any) {
            setError(err.message || 'Failed to create category');
        } finally {
            setCreatingCat(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount greater than ₹0');
            return;
        }

        if (!categoryName) {
            setError('Please select or specify a category');
            return;
        }

        if (!txDate) {
            setError('Please select a transaction date');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                type,
                amount: numericAmount,
                currency: 'INR',
                category_name: categoryName,
                merchant: merchant.trim(),
                transaction_date: txDate,
                payment_method: paymentMethod,
                description: description.trim(),
                tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                is_subscription: isSubscription
            };

            if (editingTransaction) {
                await api.tracker.updateTransaction(editingTransaction.id, payload);
            } else {
                await api.tracker.createTransaction(payload);
            }

            onSuccess(txDate);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter((c) => {
        if (!c.type || c.type === 'BOTH') return true;
        return c.type === type;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18181b]">
                    <h3 className="font-bold text-white text-base">
                        {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs scrollbar-none">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Type Selector (Expense vs Income) */}
                    <div>
                        <label className="text-gray-400 font-semibold mb-1.5 block">Transaction Type</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-[#18181b] rounded-xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setType('EXPENSE')}
                                className={`py-2 rounded-lg font-bold transition-all ${
                                    type === 'EXPENSE'
                                        ? 'bg-rose-500 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('INCOME')}
                                className={`py-2 rounded-lg font-bold transition-all ${
                                    type === 'INCOME'
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    {/* Amount & Currency */}
                    <div>
                        <label className="text-gray-400 font-semibold mb-1.5 block">Amount (INR)</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                ₹
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white font-bold text-base focus:outline-none focus:border-white/30 placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-gray-400 font-semibold">Category</label>
                            <button
                                type="button"
                                onClick={() => setShowNewCatInput(!showNewCatInput)}
                                className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 font-medium"
                            >
                                <Plus className="w-3 h-3" />
                                {showNewCatInput ? 'Cancel Custom' : 'Add Custom'}
                            </button>
                        </div>

                        {showNewCatInput ? (
                            <div className="p-3 rounded-xl bg-[#18181b] border border-white/10 space-y-2.5 mb-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Custom Category Name..."
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        className="flex-1 bg-[#141416] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/30"
                                    />
                                    <input
                                        type="color"
                                        value={newCatColor}
                                        onChange={(e) => setNewCatColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        title="Choose color"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCreateCustomCategory}
                                    disabled={creatingCat || !newCatName.trim()}
                                    className="w-full py-1.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {creatingCat ? 'Saving Category...' : 'Save Category'}
                                </button>
                            </div>
                        ) : (
                            <select
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                            >
                                {filteredCategories.map((c) => (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Merchant & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-gray-400 font-semibold mb-1.5 block">
                                {type === 'EXPENSE' ? 'Merchant / Vendor' : 'Source / Employer'}
                            </label>
                            <input
                                type="text"
                                placeholder={type === 'EXPENSE' ? 'e.g. Swiggy, Amazon, Uber' : 'e.g. Acme Corp, Freelance'}
                                value={merchant}
                                onChange={(e) => setMerchant(e.target.value)}
                                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 placeholder-gray-600"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 font-semibold mb-1.5 block">Date</label>
                            <input
                                type="date"
                                required
                                value={txDate}
                                onChange={(e) => setTxDate(e.target.value)}
                                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Payment Method & Recurring toggle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-gray-400 font-semibold mb-1.5 block">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                            >
                                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                                <option value="Net Banking">Net Banking</option>
                                <option value="Cash">Cash</option>
                                <option value="Auto-Debit">Auto-Debit</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isSubscription}
                                    onChange={(e) => setIsSubscription(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-white focus:ring-0 bg-[#18181b]"
                                />
                                <span className="text-gray-300 font-medium">Recurring Subscription</span>
                            </label>
                        </div>
                    </div>

                    {/* Notes & Tags */}
                    <div>
                        <label className="text-gray-400 font-semibold mb-1.5 block">Description / Notes</label>
                        <input
                            type="text"
                            placeholder="Optional notes or details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 placeholder-gray-600"
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 font-semibold mb-1.5 block">Tags (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. dinner, project, travel, tax-deductible"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 placeholder-gray-600"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Record Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
