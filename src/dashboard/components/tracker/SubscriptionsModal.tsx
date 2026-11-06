import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState, useEffect, type FormEvent } from 'react';
import { X, Plus, Trash2, Edit2, Repeat, AlertCircle } from 'lucide-react';
import { api } from '../../api';

interface SubscriptionItem {
    id: number;
    name: string;
    category_name: string;
    amount: number;
    currency: string;
    billing_cycle: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY';
    next_renewal_date?: string;
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
    notes?: string;
}

interface SubscriptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categories: { id: number; name: string }[];
}

export default function SubscriptionsModal({ isOpen, onClose, onSuccess, categories }: SubscriptionsModalProps) {
    const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
    const [totalMonthly, setTotalMonthly] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add / Edit form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [categoryName, setCategoryName] = useState('Subscriptions');
    const [billingCycle, setBillingCycle] = useState('MONTHLY');
    const [renewalDate, setRenewalDate] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSubscriptions();
        }
    }, [isOpen]);

    const loadSubscriptions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.tracker.getSubscriptions();
            setSubscriptions(res.subscriptions || []);
            setTotalMonthly(res.total_monthly_cost || 0);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleOpenAdd = () => {
        setEditingSub(null);
        setName('');
        setAmount('');
        setCategoryName('Subscriptions');
        setBillingCycle('MONTHLY');
        setRenewalDate('');
        setNotes('');
        setIsFormOpen(true);
    };

    const handleOpenEdit = (sub: SubscriptionItem) => {
        setEditingSub(sub);
        setName(sub.name);
        setAmount(String(sub.amount));
        setCategoryName(sub.category_name || 'Subscriptions');
        setBillingCycle(sub.billing_cycle);
        setRenewalDate(sub.next_renewal_date || '');
        setNotes(sub.notes || '');
        setIsFormOpen(true);
    };

    const handleSaveSubscription = async (e: FormEvent) => {
        e.preventDefault();
        const numAmt = parseFloat(amount);
        if (isNaN(numAmt) || numAmt <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const payload = {
                name: name.trim(),
                amount: numAmt,
                category_name: categoryName,
                billing_cycle: billingCycle,
                next_renewal_date: renewalDate || undefined,
                notes: notes.trim(),
                status: editingSub ? editingSub.status : 'ACTIVE'
            };

            if (editingSub) {
                await api.tracker.updateSubscription(editingSub.id, payload);
            } else {
                await api.tracker.createSubscription(payload);
            }

            setIsFormOpen(false);
            loadSubscriptions();
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to save subscription');
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (sub: SubscriptionItem) => {
        const newStatus = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        try {
            await api.tracker.updateSubscription(sub.id, { status: newStatus });
            loadSubscriptions();
            onSuccess();
        } catch (err: any) {
            alert(err.message || 'Failed to update subscription status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this subscription?')) return;
        try {
            await api.tracker.deleteSubscription(id);
            loadSubscriptions();
            onSuccess();
        } catch (err: any) {
            alert(err.message || 'Failed to delete subscription');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18181b]">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                            <Repeat className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">Recurring Subscriptions</h3>
                            <p className="text-[11px] text-gray-400">
                                Total estimated run-rate: <strong className="text-white">₹{totalMonthly.toLocaleString()}/mo</strong>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 text-xs scrollbar-none flex-1">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Add / Edit Form Panel */}
                    {isFormOpen ? (
                        <form onSubmit={handleSaveSubscription} className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h4 className="font-bold text-white text-xs">
                                    {editingSub ? 'Edit Subscription' : 'Add Subscription'}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-gray-400 font-semibold mb-1 block">Service Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Netflix, Spotify, AWS"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 font-semibold mb-1 block">Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="649"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/30"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-gray-400 font-semibold mb-1 block">Billing Cycle</label>
                                    <select
                                        value={billingCycle}
                                        onChange={(e) => setBillingCycle(e.target.value)}
                                        className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                                    >
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="YEARLY">Yearly</option>
                                        <option value="QUARTERLY">Quarterly</option>
                                        <option value="WEEKLY">Weekly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-400 font-semibold mb-1 block">Next Renewal</label>
                                    <input
                                        type="date"
                                        value={renewalDate}
                                        onChange={(e) => setRenewalDate(e.target.value)}
                                        className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                                    />
                                </div>
                            </div>

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

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
                            >
                                {saving ? 'Saving...' : editingSub ? 'Update Subscription' : 'Add Subscription'}
                            </button>
                        </form>
                    ) : (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleOpenAdd}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-gray-200 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Subscription</span>
                            </button>
                        </div>
                    )}

                    {/* Subscriptions List */}
                    {loading ? (
                        <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
                            <MatrixLoader size="sm" variant="orbit" rounded />
                            <span>Loading subscriptions...</span>
                        </div>
                    ) : subscriptions.length > 0 ? (
                        <div className="space-y-2.5">
                            {subscriptions.map((s) => {
                                const isPaused = s.status === 'PAUSED';

                                return (
                                    <div
                                        key={s.id}
                                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                                            isPaused
                                                ? 'bg-white/[0.02] border-white/5 opacity-60'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                                                {s.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-xs">{s.name}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 capitalize">
                                                        {s.billing_cycle.toLowerCase()}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-500 mt-0.5">
                                                    {s.next_renewal_date ? `Renews on ${s.next_renewal_date}` : s.category_name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="font-bold text-white text-xs">
                                                    ₹{s.amount.toLocaleString()}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(s)}
                                                    className={`text-[10px] font-semibold underline ${
                                                        isPaused ? 'text-amber-400' : 'text-emerald-400'
                                                    }`}
                                                >
                                                    {isPaused ? 'Paused' : 'Active'}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleOpenEdit(s)}
                                                    className="p-1 rounded text-gray-400 hover:text-white"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    className="p-1 rounded text-gray-400 hover:text-rose-400"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No active subscriptions tracked. Add services like Netflix, Spotify, or Gym to monitor your monthly commitments.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
