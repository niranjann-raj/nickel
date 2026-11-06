import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState, useEffect, type FormEvent } from 'react';
import { X, Target, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../../api';

interface CategoryBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categories: { id: number; name: string }[];
    currentMonth: string; // YYYY-MM
}

export default function CategoryBudgetModal({
    isOpen,
    onClose,
    onSuccess,
    categories,
    currentMonth
}: CategoryBudgetModalProps) {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [categoryName, setCategoryName] = useState(categories[0]?.name || 'Food & Dining');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadBudgets();
        }
    }, [isOpen, currentMonth]);

    const loadBudgets = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.tracker.getBudgets(currentMonth);
            setBudgets(res.budgets || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch budgets');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSaveBudget = async (e: FormEvent) => {
        e.preventDefault();
        const numAmt = parseFloat(amount);
        if (isNaN(numAmt) || numAmt <= 0) {
            setError('Please enter a budget amount greater than ₹0');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await api.tracker.setBudget({
                category_name: categoryName,
                budget_amount: numAmt,
                month: currentMonth
            });
            setAmount('');
            loadBudgets();
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBudget = async (id: number) => {
        try {
            await api.tracker.deleteBudget(id);
            loadBudgets();
            onSuccess();
        } catch (err: any) {
            alert(err.message || 'Failed to delete budget');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18181b]">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                            <Target className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">Monthly Category Budgets</h3>
                            <p className="text-[11px] text-gray-400">Target period: {currentMonth}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto space-y-4 text-xs scrollbar-none flex-1">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Set New Budget Form */}
                    <form onSubmit={handleSaveBudget} className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
                        <h4 className="font-bold text-white text-xs">Set / Update Budget</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-gray-400 font-semibold mb-1 block">Category</label>
                                <select
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-400 font-semibold mb-1 block">Monthly Limit (₹)</label>
                                <input
                                    type="number"
                                    step="100"
                                    min="1"
                                    placeholder="e.g. 5000"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/30"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
                        >
                            {saving ? 'Saving...' : 'Set Budget Target'}
                        </button>
                    </form>

                    {/* Existing Budgets */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-300 text-xs">Current Limits for {currentMonth}</h4>
                        {loading ? (
                            <div className="p-6 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
                                <MatrixLoader size="sm" variant="orbit" rounded />
                                <span>Loading budgets...</span>
                            </div>
                        ) : budgets.length > 0 ? (
                            budgets.map((b) => (
                                <div
                                    key={b.id}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                                >
                                    <div>
                                        <span className="font-bold text-white text-xs">{b.category_name}</span>
                                        <span className="text-gray-400 block text-[11px]">
                                            Limit: ₹{Number(b.budget_amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteBudget(b.id)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No budgets active for this month.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
