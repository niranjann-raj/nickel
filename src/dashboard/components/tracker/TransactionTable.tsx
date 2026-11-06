import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState } from 'react';
import {
    Search, Trash2, Edit2, FileText, ChevronLeft, ChevronRight,
    ArrowDownLeft, ArrowUpRight, AlertTriangle, Eye, X, Download, ExternalLink
} from 'lucide-react';
import { api } from '../../api';

export interface TrackerTransactionItem {
    id: number;
    user_id: number;
    type: 'EXPENSE' | 'INCOME';
    amount: number;
    currency: string;
    category_name: string;
    merchant: string;
    transaction_date: string;
    payment_method: string;
    description: string;
    tags: string[];
    receipt_filename?: string;
    bill_upload_id?: number;
    is_subscription: boolean;
    created_at: string;
}

interface TransactionTableProps {
    transactions: TrackerTransactionItem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    loading: boolean;
    categories: { id: number; name: string }[];
    typeFilter: string;
    categoryFilter: string;
    searchQuery: string;
    sortBy: string;
    onTypeFilterChange: (type: string) => void;
    onCategoryFilterChange: (cat: string) => void;
    onSearchChange: (search: string) => void;
    onSortChange: (sort: string) => void;
    onPageChange: (page: number) => void;
    onEdit: (tx: TrackerTransactionItem) => void;
    onDelete: (id: number) => void;
    onAddTransaction: () => void;
    onUploadBill: () => void;
}

export default function TransactionTable({
    transactions,
    totalCount,
    currentPage,
    totalPages,
    loading,
    categories,
    typeFilter,
    categoryFilter,
    searchQuery,
    sortBy,
    onTypeFilterChange,
    onCategoryFilterChange,
    onSearchChange,
    onSortChange,
    onPageChange,
    onEdit,
    onDelete,
    onAddTransaction,
    onUploadBill,
}: TransactionTableProps) {
    const [txToDelete, setTxToDelete] = useState<TrackerTransactionItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [previewTx, setPreviewTx] = useState<TrackerTransactionItem | null>(null);

    const formatINR = (val: number) => {
        return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const confirmDelete = async () => {
        if (!txToDelete) return;
        setDeleting(true);
        try {
            await api.tracker.deleteTransaction(txToDelete.id);
            onDelete(txToDelete.id);
            setTxToDelete(null);
        } catch (err: any) {
            alert(err.message || 'Failed to delete transaction');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="bg-[#111113] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            {/* Filter & Search Header */}
            <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141416]/50">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search merchant, notes, tags..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 text-white rounded-xl pl-10 pr-3.5 py-2 text-xs focus:outline-none focus:border-white/30 placeholder-gray-500 transition-colors"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Type Pills */}
                    <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-white/10">
                        {['ALL', 'EXPENSE', 'INCOME'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => onTypeFilterChange(t)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                    typeFilter === t
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {t === 'ALL' ? 'All' : t === 'EXPENSE' ? 'Expenses' : 'Income'}
                            </button>
                        ))}
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => onCategoryFilterChange(e.target.value)}
                            aria-label="Filter transactions by category"
                            className="bg-[#18181b] border border-white/10 text-gray-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-white/30 cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value)}
                            aria-label="Sort transactions"
                            className="bg-[#18181b] border border-white/10 text-gray-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-white/30 cursor-pointer"
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="amount_desc">Highest Amount</option>
                            <option value="amount_asc">Lowest Amount</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions Table Content */}
            <div className="overflow-x-auto min-h-[300px]">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center text-gray-500 text-xs gap-3">
                        <MatrixLoader size="md" variant="orbit" rounded />
                        <span>Loading transactions...</span>
                    </div>
                ) : transactions.length > 0 ? (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#141416] text-gray-400 font-semibold border-b border-white/5 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Merchant / Payee</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Method</th>
                                <th className="py-3 px-4">Notes & Tags</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((tx) => {
                                const isIncome = tx.type === 'INCOME';

                                return (
                                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                        {/* Date */}
                                        <td className="py-3.5 px-4 text-gray-300 whitespace-nowrap font-medium">
                                            {formatDate(tx.transaction_date)}
                                        </td>

                                        {/* Merchant & Type Badge */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                    }`}
                                                >
                                                    {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-white block truncate max-w-[150px]">
                                                        {tx.merchant || (isIncome ? 'Income Source' : 'General Expense')}
                                                    </span>
                                                    {tx.bill_upload_id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewTx(tx)}
                                                            className="text-[10px] text-sky-400 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                                                            title="Click to view attached bill receipt"
                                                        >
                                                            <FileText className="w-2.5 h-2.5" /> Bill Verified
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category Badge */}
                                        <td className="py-3.5 px-4">
                                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium whitespace-nowrap">
                                                {tx.category_name}
                                            </span>
                                        </td>

                                        {/* Payment Method */}
                                        <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                                            {tx.payment_method || 'UPI'}
                                        </td>

                                        {/* Notes & Tags */}
                                        <td className="py-3.5 px-4 max-w-[200px]">
                                            <div className="text-gray-400 truncate text-[11px]" title={tx.description}>
                                                {tx.description || '—'}
                                            </div>
                                            {tx.tags && tx.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {tx.tags.map((t, idx) => (
                                                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>

                                        {/* Amount */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <span className={`font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-white'}`}>
                                                {isIncome ? '+' : '-'}{formatINR(tx.amount)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {tx.bill_upload_id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewTx(tx)}
                                                        title="View attached bill receipt"
                                                        className="p-1.5 rounded-lg text-sky-400 hover:text-white hover:bg-sky-500/20 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onEdit(tx)}
                                                    title="Edit transaction"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setTxToDelete(tx)}
                                                    title="Delete transaction"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    /* Empty State */
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">No transactions recorded yet</h4>
                        <p className="text-xs text-gray-500 max-w-sm mb-5">
                            {searchQuery || categoryFilter !== 'All' || typeFilter !== 'ALL'
                                ? 'No transactions match your current search or filters. Try resetting them.'
                                : 'Start keeping track of your daily expenses, salary, and utility bills.'}
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onAddTransaction}
                                className="px-3.5 py-2 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-200 transition-colors"
                            >
                                Add Transaction
                            </button>
                            <button
                                type="button"
                                onClick={onUploadBill}
                                className="px-3.5 py-2 bg-[#18181b] border border-white/10 text-white font-semibold rounded-xl text-xs hover:bg-white/10 transition-colors"
                            >
                                Upload Bill / Receipt
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 bg-[#141416]/50">
                    <div>
                        Showing page <span className="text-white font-semibold">{currentPage}</span> of{' '}
                        <span className="text-white font-semibold">{totalPages}</span> ({totalCount} total)
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="p-1.5 rounded-lg border border-white/10 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="p-1.5 rounded-lg border border-white/10 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {txToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 text-rose-400 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-white text-base">Delete Transaction?</h4>
                        </div>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Are you sure you want to delete this <strong className="text-white">{txToDelete.type}</strong> of{' '}
                            <strong className="text-white">{formatINR(txToDelete.amount)}</strong>
                            {txToDelete.merchant ? ` for "${txToDelete.merchant}"` : ''}? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setTxToDelete(null)}
                                disabled={deleting}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Preview Modal */}
            {previewTx && previewTx.bill_upload_id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                    <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#18181b]">
                            <div>
                                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-sky-400" />
                                    <span>{previewTx.merchant || 'Attached Receipt'}</span>
                                    <span className="text-xs font-semibold text-emerald-400 ml-1">
                                        ₹{formatINR(previewTx.amount)}
                                    </span>
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    Date: {previewTx.transaction_date} • {previewTx.category_name}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={api.tracker.getBillFileUrl(previewTx.bill_upload_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
                                    title="Open file in new tab"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => setPreviewTx(null)}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Image / Document Display */}
                        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-black/50 min-h-[350px]">
                            {previewTx.receipt_filename?.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={api.tracker.getBillFileUrl(previewTx.bill_upload_id)}
                                    title="PDF Document"
                                    className="w-full h-[500px] rounded-lg border border-white/10 bg-white"
                                />
                            ) : (
                                <img
                                    src={api.tracker.getBillFileUrl(previewTx.bill_upload_id)}
                                    alt="Bill Receipt"
                                    className="max-h-[550px] w-auto object-contain rounded-xl shadow-lg border border-white/10"
                                />
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-white/10 bg-[#18181b] flex items-center justify-between text-xs text-gray-400">
                            <span className="truncate max-w-sm">{previewTx.receipt_filename || 'Receipt Image'}</span>
                            <button
                                type="button"
                                onClick={() => setPreviewTx(null)}
                                className="px-4 py-1.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
