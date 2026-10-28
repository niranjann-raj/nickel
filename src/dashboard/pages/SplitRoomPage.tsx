import MatrixLoader from '../../components/ui/MatrixLoader';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, Plus, Copy, Check, Share2, Download, Settings,
    Users, Receipt, Scale, BarChart2, Calendar, ShieldCheck,
    Search, Trash2, Edit3, CheckCircle2,
    Clock, DollarSign, Eye
} from 'lucide-react';
import { api } from '../api';
import { useDashboard } from '../DashboardLayout';
import { generateSplitRoomPDF } from '../../utils/splitPdfGenerator';

import AddExpenseModal from '../components/split/AddExpenseModal';
import ExpenseDetailsModal from '../components/split/ExpenseDetailsModal';
import RecordPaymentModal from '../components/split/RecordPaymentModal';
import EditRoomModal from '../components/split/EditRoomModal';
import ConfirmDialog from '../components/split/ConfirmDialog';
import SplitAnalyticsTab from '../components/split/SplitAnalyticsTab';
import ShareRoomModal from '../components/split/ShareRoomModal';

const ROOM_EMOJIS: Record<string, string> = {
    Plane: '✈️',
    Home: '🏠',
    Utensils: '🍽️',
    Car: '🚗',
    Palmtree: '🏖️',
    PartyPopper: '🎉',
    Briefcase: '💼',
    Users: '👥',
};

type TabType = 'overview' | 'expenses' | 'settlement' | 'members' | 'analytics';

export default function SplitRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user, addNotification } = useDashboard();

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [room, setRoom] = useState<any | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [financials, setFinancials] = useState<any | null>(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters for expenses tab
    const [expenseSearch, setExpenseSearch] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('All');
    const [expensePayer, setExpensePayer] = useState<string>('All');
    const [expenseSort, setExpenseSort] = useState<string>('newest');

    // Modals
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any | null>(null);
    const [detailsExpense, setDetailsExpense] = useState<any | null>(null);
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);
    const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Confirm dialog state
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        isDestructive?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const [codeCopied, setCodeCopied] = useState(false);

    const rId = parseInt(roomId || '0', 10);

    const fetchRoomData = useCallback(async () => {
        if (!rId) return;
        setLoading(true);
        try {
            const [roomRes, expRes, actRes] = await Promise.all([
                api.split.getRoom(rId),
                api.split.getExpenses(rId, {
                    search: expenseSearch.trim() || undefined,
                    category: expenseCategory !== 'All' ? expenseCategory : undefined,
                    payer_id: expensePayer !== 'All' ? parseInt(expensePayer) : undefined,
                    sort_by: expenseSort
                }),
                api.split.getActivities(rId, 20)
            ]);

            setRoom(roomRes.room);
            setMembers(roomRes.members || []);
            setFinancials(roomRes.financials || null);
            setExpenses(expRes.expenses || []);
            setActivities(actRes.activities || []);
        } catch (err: any) {
            console.error('Failed to load room details', err);
            addNotification('Error', err.message || 'Failed to load room details', 'info');
        } finally {
            setLoading(false);
        }
    }, [rId, expenseSearch, expenseCategory, expensePayer, expenseSort, addNotification]);

    useEffect(() => {
        fetchRoomData();
    }, [fetchRoomData]);

    const handleCopyCode = () => {
        if (!room) return;
        navigator.clipboard.writeText(room.code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };



    const handleExportPDF = () => {
        if (!room || !financials) return;
        generateSplitRoomPDF({
            room,
            financials,
            expenses
        });
        addNotification('Export Complete', 'Downloaded Split Expense PDF report.', 'success');
    };

    // Expense Actions
    const handleDeleteExpense = (exp: any) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Expense?',
            message: `Are you sure you want to delete "${exp.title}" (${room.currency} ${exp.amount})? This will recalculate all group balances.`,
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.split.deleteExpense(rId, exp.id);
                    addNotification('Expense Deleted', `Deleted "${exp.title}"`, 'info');
                    fetchRoomData();
                } catch (err: any) {
                    addNotification('Error', err.message || 'Failed to delete expense', 'info');
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Payment Confirm / Dispute
    const handleConfirmPayment = async (paymentId: number) => {
        try {
            await api.split.confirmPayment(rId, paymentId);
            addNotification('Payment Confirmed', 'Settlement receipt confirmed successfully.', 'success');
            fetchRoomData();
        } catch (err: any) {
            addNotification('Error', err.message || 'Failed to confirm payment', 'info');
        }
    };

    const handleDisputePayment = (payment: any) => {
        setConfirmState({
            isOpen: true,
            title: 'Dispute Settlement Payment?',
            message: `Are you sure you want to dispute this payment of ${room?.currency || '₹'} ${payment.amount} from ${payment.payer?.full_name}? It will be marked as disputed and will not count towards debt settlement.`,
            confirmText: 'Dispute Payment',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.split.disputePayment(rId, payment.id);
                    addNotification('Payment Disputed', 'Settlement payment marked as disputed.', 'info');
                    fetchRoomData();
                } catch (err: any) {
                    addNotification('Error', err.message || 'Failed to dispute payment', 'info');
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Remove Member Action (Owner only)
    const handleRemoveMember = (targetUser: any) => {
        setConfirmState({
            isOpen: true,
            title: 'Remove Member?',
            message: `Are you sure you want to remove ${targetUser.user?.full_name || 'this member'} from the room? Members can only be removed if their balance is completely settled.`,
            confirmText: 'Remove Member',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.split.removeMember(rId, targetUser.user_id);
                    addNotification('Member Removed', 'Member removed from room.', 'info');
                    fetchRoomData();
                } catch (err: any) {
                    addNotification('Error', err.message || 'Failed to remove member', 'info');
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Leave Room Action
    const handleLeaveRoom = () => {
        setConfirmState({
            isOpen: true,
            title: 'Leave Room?',
            message: 'Are you sure you want to leave this room? You can only leave if you have zero outstanding debt or credit.',
            confirmText: 'Leave Room',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.split.leaveRoom(rId);
                    addNotification('Left Room', 'You have left the split room.', 'info');
                    navigate('/dashboard/split');
                } catch (err: any) {
                    addNotification('Error', err.message || 'Failed to leave room', 'info');
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Delete Room Action (Owner only)
    const handleDeleteRoom = () => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Room Permanently?',
            message: 'Are you sure you want to delete this room? All expenses, recorded payments, and history will be permanently deleted.',
            confirmText: 'Delete Room',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.split.deleteRoom(rId);
                    addNotification('Room Deleted', 'Room deleted permanently.', 'info');
                    navigate('/dashboard/split');
                } catch (err: any) {
                    addNotification('Error', err.message || 'Failed to delete room', 'info');
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    if (loading && !room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <MatrixLoader size="lg" variant="orbit" rounded />
                <span className="text-xs text-gray-500 tracking-wider uppercase font-medium">Loading Room...</span>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-gray-500">Room not found or you don't have access.</p>
                <button
                    onClick={() => navigate('/dashboard/split')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-sm"
                >
                    Back to Split Overview
                </button>
            </div>
        );
    }

    const isOwner = room.user_role === 'owner';
    const currency = room.currency || 'INR';
    const emoji = ROOM_EMOJIS[room.icon || 'Plane'] || '👥';

    // Unique categories from expenses
    const categoriesList = ['All', ...new Set(expenses.map(e => e.category))];

    return (
        <div className="space-y-6 p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Top Navigation Bar: Back Button */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/split')}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to All Rooms</span>
                </button>

                <div className="flex items-center gap-2">
                    {/* PDF Export */}
                    <button
                        type="button"
                        onClick={handleExportPDF}
                        title="Download PDF Report"
                        className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-zinc-300" />
                        <span className="hidden sm:inline">Export PDF</span>
                    </button>

                    {/* Room Settings (Owner) */}
                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => setIsEditRoomOpen(true)}
                            title="Edit Room Settings"
                            className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all cursor-pointer"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Room Header Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                            {emoji}
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                                    {room.name}
                                </h1>
                                {room.is_settled ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Settled
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5" />
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                                {room.description || 'Shared expense ledger for your group activity'}
                            </p>

                            {(room.start_date || room.end_date) && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {room.start_date || 'Start'} to {room.end_date || 'Ongoing'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Room Code & Add Expense Action */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* 6-Char Hex Code Card */}
                        <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                                    Room Code
                                </span>
                                <span className="font-mono font-bold text-sm text-white tracking-wider">
                                    {room.code}
                                </span>
                            </div>

                            <button
                                type="button"
                                title="Copy room code"
                                onClick={handleCopyCode}
                                className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
                            >
                                {codeCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>

                            <button
                                type="button"
                                title="Share room invitation"
                                onClick={() => setIsShareModalOpen(true)}
                                className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Expense Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setEditingExpense(null);
                                setIsAddExpenseOpen(true);
                            }}
                            className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-sm transition-all cursor-pointer group"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            <span>Add Expense</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: 'overview', label: 'Overview', icon: Receipt },
                        { id: 'expenses', label: `Expenses (${expenses.length})`, icon: DollarSign },
                        { id: 'settlement', label: 'Balances & Settlement', icon: Scale },
                        { id: 'members', label: `Members (${members.length})`, icon: Users },
                        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id as TabType)}
                            className={`flex items-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                activeTab === id
                                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT */}

            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && financials && (
                <div className="space-y-6">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                                Group Spending
                            </span>
                            <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white pt-1">
                                {currency} {Number(financials.total_spent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400">{expenses.length} recorded expenses</p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                                Outstanding Debt
                            </span>
                            <div className="text-2xl font-mono font-bold text-amber-500 pt-1">
                                {currency} {Number(financials.total_outstanding_debt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400">Total remaining to settle</p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                                Total Settled
                            </span>
                            <div className="text-2xl font-mono font-bold text-emerald-500 pt-1">
                                {currency} {Number(financials.total_settled_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-emerald-500/80">Confirmed transfers</p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-1">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                                Settlement Progress
                            </span>
                            <div className="text-2xl font-mono font-bold text-emerald-400 pt-1">
                                {financials.settlement_progress_percentage}%
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${financials.settlement_progress_percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settlement Highlights Alert */}
                    {financials.is_fully_settled ? (
                        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">All Group Expenses Are Settled!</h4>
                                    <p className="text-xs text-emerald-400/80">
                                        No outstanding balances remaining. Every member has settled their share.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('settlement')}
                                className="text-xs font-semibold underline text-white cursor-pointer"
                            >
                                View Balances
                            </button>
                        </div>
                    ) : financials.settlement_plan.length > 0 ? (
                        <div className="p-5 rounded-3xl bg-[#18181c] border border-white/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white flex-shrink-0">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">
                                        Simplified Settlement: {financials.settlement_plan.length} Payment{financials.settlement_plan.length > 1 ? 's' : ''} Needed
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Nickel optimized your group balances to minimize total transactions.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTab('settlement')}
                                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                            >
                                Settle Now
                            </button>
                        </div>
                    ) : null}

                    {/* Member Balances Summary Table */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">
                                Members Balance Standing
                            </h3>
                            <button
                                type="button"
                                onClick={() => setActiveTab('settlement')}
                                className="text-xs text-white font-semibold hover:underline cursor-pointer"
                            >
                                View Detailed Settlement
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5 text-gray-400 font-semibold">
                                        <th className="pb-3">Member</th>
                                        <th className="pb-3 text-right">Total Paid</th>
                                        <th className="pb-3 text-right">Calculated Share</th>
                                        <th className="pb-3 text-right">Net Balance</th>
                                        <th className="pb-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {financials.members_balances?.map((mb: any) => (
                                        <tr key={mb.user_id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                            <td className="py-3 flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                                    {mb.user_avatar ? (
                                                        <img src={mb.user_avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        mb.user_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {mb.user_name}
                                                </span>
                                                {mb.role === 'owner' && (
                                                    <span className="text-[10px] uppercase font-bold text-white bg-white/10 border border-white/15 px-1.5 py-0.5 rounded-md">
                                                        Owner
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-right font-mono font-medium text-gray-700 dark:text-gray-300">
                                                {currency} {Number(mb.total_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 text-right font-mono font-medium text-gray-700 dark:text-gray-300">
                                                {currency} {Number(mb.total_share).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 text-right font-mono font-bold">
                                                <span className={mb.outstanding_balance > 0 ? 'text-emerald-400' : mb.outstanding_balance < 0 ? 'text-rose-400' : 'text-gray-400'}>
                                                    {mb.outstanding_balance > 0 ? '+' : ''}{currency} {Number(mb.outstanding_balance).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <span className={`px-2 py-1 rounded-full font-semibold text-[11px] ${
                                                    mb.status_type === 'IS_OWED'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : mb.status_type === 'OWES'
                                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                        : 'bg-white/5 text-gray-400'
                                                }`}>
                                                    {mb.status_label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Room Activity Timeline */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                        <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">
                            Recent Room Activity
                        </h3>

                        {activities.length === 0 ? (
                            <p className="text-xs text-gray-400">No activity logged yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {activities.slice(0, 8).map((act: any) => (
                                    <div key={act.id} className="flex items-start gap-3 text-xs">
                                        <div className="w-2 h-2 rounded-full bg-white mt-1.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-gray-700 dark:text-gray-300 font-medium">
                                                {act.description}
                                            </p>
                                            <span className="text-[10px] text-gray-400">
                                                {act.created_at ? new Date(act.created_at).toLocaleString() : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. EXPENSES TAB */}
            {activeTab === 'expenses' && (
                <div className="space-y-6">
                    {/* Filters & Search */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex flex-1 items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={expenseSearch}
                                    onChange={(e) => setExpenseSearch(e.target.value)}
                                    placeholder="Search expenses..."
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={expenseCategory}
                                onChange={(e) => setExpenseCategory(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 cursor-pointer"
                            >
                                {categoriesList.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* Payer Filter */}
                            <select
                                value={expensePayer}
                                onChange={(e) => setExpensePayer(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 cursor-pointer"
                            >
                                <option value="All">All Payers</option>
                                {members.map(m => (
                                    <option key={m.user_id} value={m.user_id}>
                                        {m.user?.full_name}
                                    </option>
                                ))}
                            </select>

                            {/* Sort */}
                            <select
                                value={expenseSort}
                                onChange={(e) => setExpenseSort(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount_desc">Amount: High to Low</option>
                                <option value="amount_asc">Amount: Low to High</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingExpense(null);
                                setIsAddExpenseOpen(true);
                            }}
                            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap self-end md:self-auto"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Expense</span>
                        </button>
                    </div>

                    {/* Expenses List */}
                    {expenses.length === 0 ? (
                        <div className="p-12 rounded-3xl bg-white dark:bg-[#121215] border border-dashed border-gray-300 dark:border-white/10 text-center space-y-3">
                            <Receipt className="w-12 h-12 text-gray-400 mx-auto" />
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">No expenses recorded yet</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Record your first shared hotel bill, dinner, or travel ticket.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingExpense(null);
                                    setIsAddExpenseOpen(true);
                                }}
                                className="py-2 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs inline-block cursor-pointer shadow-sm"
                            >
                                + Add Expense
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map((exp) => {
                                const canEdit = exp.created_by === user?.id || isOwner;
                                return (
                                    <div
                                        key={exp.id}
                                        className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-3.5 flex-1">
                                            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-lg flex-shrink-0">
                                                🧾
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {exp.title}
                                                    </h4>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-medium">
                                                        {exp.category}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Paid by{' '}
                                                    <strong className="text-gray-800 dark:text-gray-200">
                                                        {exp.payers?.map((p: any) => p.user_name).join(', ') || 'N/A'}
                                                    </strong>{' '}
                                                    • Split {exp.split_method.toLowerCase()} among {exp.shares?.length || 0} members
                                                </p>

                                                <span className="text-[11px] text-gray-400 block">
                                                    {exp.expense_date}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount & Actions */}
                                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-white/5">
                                            <div className="text-left sm:text-right">
                                                <span className="text-base font-mono font-bold text-rose-400 block">
                                                    {currency} {Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                    Total Bill
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    title="View Details"
                                                    onClick={() => setDetailsExpense(exp)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {canEdit && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            title="Edit Expense"
                                                            onClick={() => {
                                                                setEditingExpense(exp);
                                                                setIsAddExpenseOpen(true);
                                                            }}
                                                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete Expense"
                                                            onClick={() => handleDeleteExpense(exp)}
                                                            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* 3. BALANCES & SETTLEMENT TAB */}
            {activeTab === 'settlement' && financials && (
                <div className="space-y-8">
                    {/* Simplified Suggested Transfers */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-white" />
                                    Suggested Settlement Plan
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Greedy debtor-creditor matching algorithm minimizes the total number of transfers needed
                                </p>
                            </div>

                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
                                {financials.settlement_plan.length} transfer{financials.settlement_plan.length !== 1 ? 's' : ''} suggested
                            </span>
                        </div>

                        {financials.settlement_plan.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 space-y-2">
                                <CheckCircle2 className="w-8 h-8 mx-auto" />
                                <p className="font-bold text-sm">Everyone is settled up!</p>
                                <p className="text-xs text-gray-400">
                                    No outstanding settlement payments required for this group.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                {financials.settlement_plan.map((item: any, idx: number) => {
                                    return (
                                        <div
                                            key={idx}
                                            className="p-5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    item.status === 'REPORTED'
                                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                        : item.status === 'PARTIALLY_PAID'
                                                        ? 'bg-white/10 text-white border border-white/15'
                                                        : 'bg-white/5 text-gray-400'
                                                }`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>

                                                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                                                    {currency} {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            {/* Transfer Flow */}
                                            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5">
                                                <div className="flex items-center gap-2 truncate">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                                        {item.from_user_avatar ? (
                                                            <img src={item.from_user_avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            item.from_user_name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] uppercase text-gray-400 block font-semibold">Payer</span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                                                            {item.from_user_name}
                                                        </span>
                                                    </div>
                                                </div>

                                                <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />

                                                <div className="flex items-center gap-2 truncate text-right">
                                                    <div>
                                                        <span className="text-[10px] uppercase text-gray-400 block font-semibold">Recipient</span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                                                            {item.to_user_name}
                                                        </span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                                        {item.to_user_avatar ? (
                                                            <img src={item.to_user_avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            item.to_user_name.charAt(0)
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button: Mark as Paid */}
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTransfer(item);
                                                        setIsRecordPaymentOpen(true);
                                                    }}
                                                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                                                >
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    <span>Record Payment</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Detailed Individual Balances Table */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                        <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                            Individual Member Ledger
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5 text-gray-400 font-semibold">
                                        <th className="pb-3">Member</th>
                                        <th className="pb-3 text-right">Total Paid</th>
                                        <th className="pb-3 text-right">Expense Share</th>
                                        <th className="pb-3 text-right">Net Expense</th>
                                        <th className="pb-3 text-right">Settled Paid</th>
                                        <th className="pb-3 text-right">Settled Received</th>
                                        <th className="pb-3 text-right">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {financials.members_balances?.map((mb: any) => (
                                        <tr key={mb.user_id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                            <td className="py-3 flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                                    {mb.user_avatar ? (
                                                        <img src={mb.user_avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        mb.user_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {mb.user_name}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                                {currency} {mb.total_paid.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                                {currency} {mb.total_share.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-right font-mono font-medium">
                                                <span className={mb.net_expense_balance > 0 ? 'text-emerald-400' : mb.net_expense_balance < 0 ? 'text-rose-400' : 'text-gray-400'}>
                                                    {mb.net_expense_balance > 0 ? '+' : ''}{currency} {mb.net_expense_balance.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-mono text-emerald-400">
                                                {currency} {mb.confirmed_sent.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-right font-mono text-emerald-400">
                                                {currency} {mb.confirmed_received.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-right font-mono font-bold">
                                                <span className={mb.outstanding_balance > 0 ? 'text-emerald-400' : mb.outstanding_balance < 0 ? 'text-rose-400' : 'text-gray-400'}>
                                                    {mb.outstanding_balance > 0 ? 'Owed' : mb.outstanding_balance < 0 ? 'Owes' : 'Settled'} {currency} {Math.abs(mb.outstanding_balance).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Settlement Payments Audit History */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                        <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                            Settlement Payment Records & History
                        </h3>

                        {financials.payments.length === 0 ? (
                            <p className="text-xs text-gray-400">No settlement transfers recorded yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {financials.payments.map((p: any) => {
                                    const isRecipient = user?.id === p.recipient_id;
                                    const canVerify = isRecipient;
                                    return (
                                        <div
                                            key={p.id}
                                            className="p-4 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                                                        {p.payer?.full_name} transferred {currency} {p.amount.toFixed(2)} to {p.recipient?.full_name}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        p.status === 'CONFIRMED'
                                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                            : p.status === 'DISPUTED'
                                                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                                    }`}>
                                                        {p.status === 'REPORTED' ? 'Pending Confirmation' : p.status}
                                                    </span>
                                                </div>
                                                {p.notes && <p className="text-xs text-gray-400">Note: {p.notes}</p>}
                                                <span className="text-[10px] text-gray-400 block">
                                                    {p.created_at ? new Date(p.created_at).toLocaleString() : ''}
                                                </span>
                                            </div>

                                            {/* Recipient Confirmation Action */}
                                            {p.status === 'REPORTED' && canVerify && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirmPayment(p.id)}
                                                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                                                    >
                                                        Confirm Receipt
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDisputePayment(p)}
                                                        className="py-1.5 px-3 rounded-xl border border-rose-300 dark:border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold text-xs transition-all cursor-pointer"
                                                    >
                                                        Dispute
                                                    </button>
                                                </div>
                                            )}
                                            {p.status === 'REPORTED' && !canVerify && (
                                                <div className="text-xs text-amber-500/90 font-medium">
                                                    Awaiting recipient confirmation
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. MEMBERS TAB */}
            {activeTab === 'members' && (
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                                    Room Members ({members.length})
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Members participating in group expenses
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center gap-2 py-2 px-3.5 rounded-xl border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all cursor-pointer"
                            >
                                <Share2 className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Invite Friend</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                            {members.map((m) => {
                                const mb = financials?.members_balances?.find((b: any) => b.user_id === m.user_id);
                                const isSelf = m.user_id === user?.id;
                                const isMemberOwner = m.role === 'owner';
                                return (
                                    <div
                                        key={m.id}
                                        className="p-5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm overflow-hidden">
                                                    {m.user?.avatar ? (
                                                        <img src={m.user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        m.user?.full_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                                                        {m.user?.full_name} {isSelf && '(You)'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">
                                                        {m.user?.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                                isMemberOwner
                                                    ? 'bg-white/10 text-white border border-white/15'
                                                    : 'bg-white/5 text-gray-400'
                                            }`}>
                                                {m.role}
                                            </span>
                                        </div>

                                        {mb && (
                                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200 dark:border-white/5">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">Total Paid</span>
                                                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                                        {currency} {mb.total_paid.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">Balance</span>
                                                    <span className={`font-mono font-bold ${
                                                        mb.outstanding_balance > 0
                                                            ? 'text-emerald-400'
                                                            : mb.outstanding_balance < 0
                                                            ? 'text-rose-400'
                                                            : 'text-gray-400'
                                                    }`}>
                                                        {mb.status_label}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Remove Action (Owner only, not for owner themselves) */}
                                        {isOwner && !isMemberOwner && (
                                            <div className="pt-1 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(m)}
                                                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                                                >
                                                    Remove Member
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Danger Zone: Leave Room or Delete Room */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-rose-500/20 space-y-4">
                        <h4 className="text-sm font-bold text-rose-400">Room Management</h4>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                    {isOwner ? 'Delete this room permanently' : 'Leave this group room'}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {isOwner
                                        ? 'Deleting removes all expenses, calculations, and settlement logs for everyone.'
                                        : 'You can only leave if you have no outstanding debt or credit.'}
                                </p>
                            </div>

                            {isOwner ? (
                                <button
                                    type="button"
                                    onClick={handleDeleteRoom}
                                    className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                                >
                                    Delete Room
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleLeaveRoom}
                                    className="py-2 px-4 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-all cursor-pointer"
                                >
                                    Leave Room
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. ANALYTICS TAB */}
            {activeTab === 'analytics' && (
                <SplitAnalyticsTab roomId={rId} currency={currency} />
            )}

            {/* MODALS */}
            <AddExpenseModal
                isOpen={isAddExpenseOpen}
                onClose={() => {
                    setIsAddExpenseOpen(false);
                    setEditingExpense(null);
                }}
                roomId={rId}
                currency={currency}
                members={members}
                editingExpense={editingExpense}
                onExpenseSaved={() => {
                    addNotification('Expense Saved', 'Group expense recorded and balances updated.', 'success');
                    fetchRoomData();
                }}
            />

            <ExpenseDetailsModal
                isOpen={!!detailsExpense}
                onClose={() => setDetailsExpense(null)}
                expense={detailsExpense}
                currency={currency}
            />

            <RecordPaymentModal
                isOpen={isRecordPaymentOpen}
                onClose={() => {
                    setIsRecordPaymentOpen(false);
                    setSelectedTransfer(null);
                }}
                roomId={rId}
                currency={currency}
                suggestedTransfer={selectedTransfer}
                onPaymentRecorded={() => {
                    addNotification('Payment Recorded', 'Settlement payment logged successfully.', 'success');
                    fetchRoomData();
                }}
            />

            <EditRoomModal
                isOpen={isEditRoomOpen}
                onClose={() => setIsEditRoomOpen(false)}
                room={room}
                onRoomUpdated={() => {
                    addNotification('Settings Updated', 'Room details updated.', 'success');
                    fetchRoomData();
                }}
            />

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                isDestructive={confirmState.isDestructive}
            />

            {isShareModalOpen && room && (
                <ShareRoomModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    room={room}
                    inviterName={user?.full_name || 'Niranjan'}
                    userAvatar={user?.avatar}
                />
            )}
        </div>
    );
}
