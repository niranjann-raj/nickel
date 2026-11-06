import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Upload, Repeat, Target, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import TimeFilterBar, { FilterPeriod, computeDatesForPeriod } from '../components/tracker/TimeFilterBar';
import TrackerOverviewCards, { TrackerSummaryData } from '../components/tracker/TrackerOverviewCards';
import SpendingCharts, { TrendItem, CategoryBreakdownItem, MerchantItem, BudgetItem } from '../components/tracker/SpendingCharts';
import TransactionTable, { TrackerTransactionItem } from '../components/tracker/TransactionTable';
import AddTransactionModal from '../components/tracker/AddTransactionModal';
import BillUploadModal from '../components/tracker/BillUploadModal';
import SubscriptionsModal from '../components/tracker/SubscriptionsModal';
import CategoryBudgetModal from '../components/tracker/CategoryBudgetModal';
import TrackerAiInsightsCard from '../components/tracker/TrackerAiInsightsCard';

export default function MoneyTrackerPage() {
    // Period filter state (defaults to this month)
    const initialDates = computeDatesForPeriod('this_month');
    const [period, setPeriod] = useState<FilterPeriod>('this_month');
    const [startDate, setStartDate] = useState<string>(initialDates.start);
    const [endDate, setEndDate] = useState<string>(initialDates.end);

    // Guard against stale response race conditions
    const summaryReqRef = useRef(0);
    const analyticsReqRef = useRef(0);
    const txReqRef = useRef(0);

    // Summary & Analytics data
    const [summary, setSummary] = useState<TrackerSummaryData | null>(null);
    const [trendData, setTrendData] = useState<TrendItem[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryBreakdownItem[]>([]);
    const [merchantData, setMerchantData] = useState<MerchantItem[]>([]);
    const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
    const [trendInterval, setTrendInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    // Transactions table state
    const [transactions, setTransactions] = useState<TrackerTransactionItem[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('date_desc');

    // Categories list
    const [categories, setCategories] = useState<{ id: number; name: string; type?: string; color?: string }[]>([]);

    // Loading states
    const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
    const [tableLoading, setTableLoading] = useState<boolean>(true);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const [isSubsModalOpen, setIsSubsModalOpen] = useState<boolean>(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
    const [editingTx, setEditingTx] = useState<TrackerTransactionItem | null>(null);

    // Fetch categories on mount
    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.tracker.getCategories();
            setCategories(res.categories || []);
        } catch (e) {
            console.error('Failed to load categories', e);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Fetch summary metrics
    const fetchSummary = useCallback(async () => {
        const reqId = ++summaryReqRef.current;
        setSummaryLoading(true);
        try {
            const res = await api.tracker.getSummary(startDate, endDate);
            if (reqId === summaryReqRef.current) {
                setSummary(res);
            }
        } catch (e) {
            console.error('Failed to load summary', e);
        } finally {
            if (reqId === summaryReqRef.current) {
                setSummaryLoading(false);
            }
        }
    }, [startDate, endDate]);

    // Fetch analytics and charts
    const fetchAnalytics = useCallback(async () => {
        const reqId = ++analyticsReqRef.current;
        try {
            const res = await api.tracker.getAnalytics(startDate, endDate, trendInterval);
            if (reqId === analyticsReqRef.current) {
                setTrendData(res.trend || []);
                setCategoryData(res.category_breakdown || []);
                setMerchantData(res.merchants || []);
                setBudgetData(res.budgets || []);
            }
        } catch (e) {
            console.error('Failed to load analytics', e);
        }
    }, [startDate, endDate, trendInterval]);

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        const reqId = ++txReqRef.current;
        setTableLoading(true);
        try {
            const res = await api.tracker.getTransactions({
                type: typeFilter !== 'ALL' ? typeFilter : undefined,
                category: categoryFilter !== 'All' ? categoryFilter : undefined,
                search: searchQuery.trim() || undefined,
                start_date: startDate,
                end_date: endDate,
                sort_by: sortBy,
                page: currentPage,
                limit: 15
            });
            if (reqId === txReqRef.current) {
                setTransactions(res.transactions || []);
                setTotalCount(res.total_count || 0);
                setTotalPages(res.total_pages || 1);
            }
        } catch (e) {
            console.error('Failed to load transactions', e);
        } finally {
            if (reqId === txReqRef.current) {
                setTableLoading(false);
            }
        }
    }, [startDate, endDate, typeFilter, categoryFilter, searchQuery, sortBy, currentPage]);

    // Alert notice for date adjustments
    const [notice, setNotice] = useState<string | null>(null);

    // Reload all data when period, filters, or interval change
    useEffect(() => {
        fetchSummary();
        fetchAnalytics();
        fetchTransactions();
    }, [fetchSummary, fetchAnalytics, fetchTransactions]);

    const handlePeriodChange = (p: FilterPeriod, start: string, end: string) => {
        setPeriod(p);
        setStartDate(start);
        setEndDate(end);
        setCurrentPage(1);
        setNotice(null);
    };

    const handleCategoryClick = (catName: string) => {
        setCategoryFilter(catName);
        // Scroll to transactions section smoothly
        const el = document.getElementById('transaction-history-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const handleMerchantClick = (merchantName: string) => {
        setSearchQuery(merchantName);
        const el = document.getElementById('transaction-history-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDataChanged = (savedDate?: string) => {
        if (savedDate) {
            if (savedDate < startDate) {
                setStartDate(savedDate);
                setPeriod('custom');
                setNotice(`Recorded transaction for ${savedDate}. Expanded your active date range so you can see it.`);
            } else if (savedDate > endDate) {
                setEndDate(savedDate);
                setPeriod('custom');
                setNotice(`Recorded transaction for ${savedDate}. Expanded your active date range so you can see it.`);
            }
        }
        fetchSummary();
        fetchAnalytics();
        fetchTransactions();
    };

    const handleOpenEdit = (tx: TrackerTransactionItem) => {
        setEditingTx(tx);
        setIsAddModalOpen(true);
    };

    const handleOpenAdd = () => {
        setEditingTx(null);
        setIsAddModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 pb-12 font-body max-w-7xl mx-auto">
            {/* Header with Title and Global Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2.5">
                        Expense Tracker
                    </h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                        Track expenses, upload receipts for automatic extraction, and optimize your cash flow
                    </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/10 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Transaction</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] border border-white/15 text-white font-semibold text-xs hover:bg-white/10 transition-all hover:border-white/30 active:scale-95"
                    >
                        <Upload className="w-4 h-4 text-sky-400" />
                        <span>Upload Bill</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSubsModalOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-white/10 text-gray-300 font-medium text-xs hover:text-white hover:bg-white/5 transition-colors"
                        title="Manage Subscriptions"
                    >
                        <Repeat className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden sm:inline">Subscriptions</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsBudgetModalOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-white/10 text-gray-300 font-medium text-xs hover:text-white hover:bg-white/5 transition-colors"
                        title="Manage Monthly Budgets"
                    >
                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Budgets</span>
                    </button>
                </div>
            </div>

            {/* Time Filter Bar */}
            <TimeFilterBar
                period={period}
                startDate={startDate}
                endDate={endDate}
                onPeriodChange={handlePeriodChange}
            />

            {/* Date Notice Banner */}
            {notice && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{notice}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        className="text-gray-400 hover:text-white text-xs underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Summary Overview Cards */}
            <TrackerOverviewCards data={summary} loading={summaryLoading} />

            {/* Spending Analytics & Interactive Charts */}
            <SpendingCharts
                trendData={trendData}
                categoryData={categoryData}
                merchantData={merchantData}
                budgetData={budgetData}
                trendInterval={trendInterval}
                onTrendIntervalChange={setTrendInterval}
                onSelectCategory={handleCategoryClick}
                onSelectMerchant={handleMerchantClick}
                onManageBudgets={() => setIsBudgetModalOpen(true)}
            />

            {/* AI Spending Insights Card */}
            <TrackerAiInsightsCard startDate={startDate} endDate={endDate} />

            {/* Transactions Table Section */}
            <div id="transaction-history-section" className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-heading font-bold text-lg text-white">Transaction History</h2>
                        <p className="text-xs text-gray-400">All income and expense records for the selected period</p>
                    </div>
                </div>

                <TransactionTable
                    transactions={transactions}
                    totalCount={totalCount}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    loading={tableLoading}
                    categories={categories}
                    typeFilter={typeFilter}
                    categoryFilter={categoryFilter}
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                    onTypeFilterChange={(t) => { setTypeFilter(t); setCurrentPage(1); }}
                    onCategoryFilterChange={(c) => { setCategoryFilter(c); setCurrentPage(1); }}
                    onSearchChange={(s) => { setSearchQuery(s); setCurrentPage(1); }}
                    onSortChange={(sb) => { setSortBy(sb); setCurrentPage(1); }}
                    onPageChange={setCurrentPage}
                    onEdit={handleOpenEdit}
                    onDelete={handleDataChanged}
                    onAddTransaction={handleOpenAdd}
                    onUploadBill={() => setIsUploadModalOpen(true)}
                />
            </div>

            {/* Modals */}
            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingTx(null); }}
                onSuccess={handleDataChanged}
                editingTransaction={editingTx}
                categories={categories}
                onCategoryCreated={fetchCategories}
            />

            <BillUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleDataChanged}
                categories={categories}
            />

            <SubscriptionsModal
                isOpen={isSubsModalOpen}
                onClose={() => setIsSubsModalOpen(false)}
                onSuccess={handleDataChanged}
                categories={categories}
            />

            <CategoryBudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSuccess={handleDataChanged}
                categories={categories}
                currentMonth={endDate.slice(0, 7)}
            />
        </div>
    );
}
