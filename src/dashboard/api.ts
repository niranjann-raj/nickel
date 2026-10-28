const BASE = 'http://localhost:5000';

function authHeaders(isJson = true) {
    const token = localStorage.getItem('nickle_token');
    const headers: Record<string, string> = {};
    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function apiFetch(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers: { ...authHeaders(true), ...(opts.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

async function apiUpload(path: string, formData: FormData) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: authHeaders(false),
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
}

export const api = {
    get: (path: string) => apiFetch(path, { method: 'GET' }),
    post: (path: string, body?: object) =>
        apiFetch(path, { method: 'POST', ...(body ? { body: JSON.stringify(body) } : {}) }),
    put: (path: string, body?: object) =>
        apiFetch(path, { method: 'PUT', ...(body ? { body: JSON.stringify(body) } : {}) }),
    delete: (path: string, body?: object) =>
        apiFetch(path, { method: 'DELETE', ...(body ? { body: JSON.stringify(body) } : {}) }),
    upload: (path: string, formData: FormData) => apiUpload(path, formData),
        
    // Bank & Autopay endpoints
    bank: {
        getBalance: () => apiFetch('/api/bank/balance', { method: 'GET' }),
        getTransactions: (page = 1) => apiFetch(`/api/bank/transactions?page=${page}`, { method: 'GET' }),
        deposit: (amount: number, description?: string) => apiFetch('/api/bank/deposit', { method: 'POST', body: JSON.stringify({ amount, description }) }),
        edit: (balance: number) => apiFetch('/api/bank/edit', { method: 'POST', body: JSON.stringify({ balance }) }),
    },
    autopay: {
        start: (level: string) => apiFetch('/api/autopay/start', { method: 'POST', body: JSON.stringify({ level }) }),
        pause: () => apiFetch('/api/autopay/pause', { method: 'POST' }),
        resume: () => apiFetch('/api/autopay/resume', { method: 'POST' }),
        stop: () => apiFetch('/api/autopay/stop', { method: 'POST' }),
        getStatus: () => apiFetch('/api/autopay/status', { method: 'GET' }),
        getWallet: () => apiFetch('/api/autopay/wallet', { method: 'GET' }),
        simulateDay: () => apiFetch('/api/autopay/simulate-day', { method: 'POST' }),
    },
    goals: {
        runAutopay: (goalId: number) => apiFetch(`/api/goals/${goalId}/autopay/run`, { method: 'POST' }),
    },
    gamification: {
        spinStatus: () => apiFetch('/api/gamification/spin/status', { method: 'GET' }),
        spinWheel: () => apiFetch('/api/gamification/spin', { method: 'POST' }),
    },

    // Expense Tracker endpoints
    tracker: {
        getTransactions: (params?: {
            type?: string;
            category?: string;
            search?: string;
            start_date?: string;
            end_date?: string;
            sort_by?: string;
            page?: number;
            limit?: number;
        }) => {
            const query = new URLSearchParams();
            if (params?.type) query.set('type', params.type);
            if (params?.category) query.set('category', params.category);
            if (params?.search) query.set('search', params.search);
            if (params?.start_date) query.set('start_date', params.start_date);
            if (params?.end_date) query.set('end_date', params.end_date);
            if (params?.sort_by) query.set('sort_by', params.sort_by);
            if (params?.page) query.set('page', String(params.page));
            if (params?.limit) query.set('limit', String(params.limit));
            return apiFetch(`/api/tracker/transactions?${query.toString()}`, { method: 'GET' });
        },
        createTransaction: (data: {
            type: 'EXPENSE' | 'INCOME';
            amount: number;
            currency?: string;
            category_name: string;
            merchant?: string;
            transaction_date: string;
            payment_method?: string;
            description?: string;
            tags?: string | string[];
            bill_upload_id?: number | null;
            is_subscription?: boolean;
        }) => apiFetch('/api/tracker/transactions', { method: 'POST', body: JSON.stringify(data) }),
        getTransaction: (id: number) => apiFetch(`/api/tracker/transactions/${id}`, { method: 'GET' }),
        updateTransaction: (id: number, data: object) =>
            apiFetch(`/api/tracker/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteTransaction: (id: number) =>
            apiFetch(`/api/tracker/transactions/${id}`, { method: 'DELETE' }),

        getCategories: () => apiFetch('/api/tracker/categories', { method: 'GET' }),
        createCategory: (data: { name: string; type?: string; icon?: string; color?: string }) =>
            apiFetch('/api/tracker/categories', { method: 'POST', body: JSON.stringify(data) }),
        deleteCategory: (id: number) =>
            apiFetch(`/api/tracker/categories/${id}`, { method: 'DELETE' }),

        getSummary: (startDate?: string, endDate?: string) => {
            const q = new URLSearchParams();
            if (startDate) q.set('start_date', startDate);
            if (endDate) q.set('end_date', endDate);
            return apiFetch(`/api/tracker/summary?${q.toString()}`, { method: 'GET' });
        },
        getAnalytics: (startDate?: string, endDate?: string, trendInterval: 'daily' | 'weekly' | 'monthly' = 'daily') => {
            const q = new URLSearchParams();
            if (startDate) q.set('start_date', startDate);
            if (endDate) q.set('end_date', endDate);
            q.set('trend_interval', trendInterval);
            return apiFetch(`/api/tracker/analytics?${q.toString()}`, { method: 'GET' });
        },

        getSubscriptions: () => apiFetch('/api/tracker/subscriptions', { method: 'GET' }),
        createSubscription: (data: {
            name: string;
            category_name?: string;
            amount: number;
            billing_cycle?: string;
            next_renewal_date?: string;
            status?: string;
            notes?: string;
        }) => apiFetch('/api/tracker/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
        updateSubscription: (id: number, data: object) =>
            apiFetch(`/api/tracker/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteSubscription: (id: number) =>
            apiFetch(`/api/tracker/subscriptions/${id}`, { method: 'DELETE' }),

        getBudgets: (month?: string) => {
            const q = month ? `?month=${month}` : '';
            return apiFetch(`/api/tracker/budgets${q}`, { method: 'GET' });
        },
        setBudget: (data: { category_name: string; budget_amount: number; month?: string }) =>
            apiFetch('/api/tracker/budgets', { method: 'POST', body: JSON.stringify(data) }),
        deleteBudget: (id: number) =>
            apiFetch(`/api/tracker/budgets/${id}`, { method: 'DELETE' }),

        uploadBill: (file: File) => {
            const fd = new FormData();
            fd.append('file', file);
            return apiUpload('/api/tracker/bills/upload', fd);
        },
        confirmBill: (uploadId: number, data: {
            amount: number;
            category_name: string;
            merchant?: string;
            transaction_date: string;
            payment_method?: string;
            description?: string;
            tags?: string | string[];
            is_subscription?: boolean;
        }) => apiFetch(`/api/tracker/bills/${uploadId}/confirm`, { method: 'POST', body: JSON.stringify(data) }),
        getBillFileUrl: (uploadId: number) => {
            const token = localStorage.getItem('nickle_token') || '';
            return `${BASE}/api/tracker/bills/${uploadId}/file${token ? `?token=${encodeURIComponent(token)}` : ''}`;
        },

        getAiInsights: (startDate: string, endDate: string, question?: string) =>
            apiFetch('/api/tracker/ai/insights', {
                method: 'POST',
                body: JSON.stringify({ start_date: startDate, end_date: endDate, question }),
            }),
    },

    // Split Expense endpoints
    split: {
        getRooms: (status?: 'all' | 'active' | 'settled') => {
            const q = status ? `?status=${status}` : '';
            return apiFetch(`/api/split/rooms${q}`, { method: 'GET' });
        },
        createRoom: (data: {
            name: string;
            description?: string;
            currency?: string;
            icon?: string;
            start_date?: string;
            end_date?: string;
        }) => apiFetch('/api/split/rooms', { method: 'POST', body: JSON.stringify(data) }),
        joinRoom: (code: string) =>
            apiFetch('/api/split/rooms/join', { method: 'POST', body: JSON.stringify({ code }) }),
        getRoom: (roomId: number) =>
            apiFetch(`/api/split/rooms/${roomId}`, { method: 'GET' }),
        updateRoom: (roomId: number, data: object) =>
            apiFetch(`/api/split/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteRoom: (roomId: number) =>
            apiFetch(`/api/split/rooms/${roomId}`, { method: 'DELETE' }),
        leaveRoom: (roomId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/leave`, { method: 'POST' }),

        getMembers: (roomId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/members`, { method: 'GET' }),
        removeMember: (roomId: number, userId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/members/${userId}`, { method: 'DELETE' }),

        getExpenses: (roomId: number, params?: {
            category?: string;
            payer_id?: number;
            search?: string;
            start_date?: string;
            end_date?: string;
            sort_by?: string;
        }) => {
            const query = new URLSearchParams();
            if (params?.category) query.set('category', params.category);
            if (params?.payer_id) query.set('payer_id', String(params.payer_id));
            if (params?.search) query.set('search', params.search);
            if (params?.start_date) query.set('start_date', params.start_date);
            if (params?.end_date) query.set('end_date', params.end_date);
            if (params?.sort_by) query.set('sort_by', params.sort_by);
            return apiFetch(`/api/split/rooms/${roomId}/expenses?${query.toString()}`, { method: 'GET' });
        },
        addExpense: (roomId: number, data: {
            title: string;
            amount: number;
            category?: string;
            expense_date?: string;
            notes?: string;
            split_method: string;
            payers: Array<{ user_id: number; amount_paid: number }>;
            participants: Array<{ user_id: number; amount?: number; percentage?: number; shares?: number }>;
        }) => apiFetch(`/api/split/rooms/${roomId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
        getExpense: (roomId: number, expenseId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/expenses/${expenseId}`, { method: 'GET' }),
        updateExpense: (roomId: number, expenseId: number, data: object) =>
            apiFetch(`/api/split/rooms/${roomId}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteExpense: (roomId: number, expenseId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/expenses/${expenseId}`, { method: 'DELETE' }),

        getBalances: (roomId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/balances`, { method: 'GET' }),
        recordPayment: (roomId: number, data: {
            payer_id: number;
            recipient_id: number;
            amount: number;
            notes?: string;
        }) => apiFetch(`/api/split/rooms/${roomId}/payments`, { method: 'POST', body: JSON.stringify(data) }),
        confirmPayment: (roomId: number, paymentId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/payments/${paymentId}/confirm`, { method: 'POST' }),
        disputePayment: (roomId: number, paymentId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/payments/${paymentId}/dispute`, { method: 'POST' }),
        getPayments: (roomId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/payments`, { method: 'GET' }),

        getAnalytics: (roomId: number) =>
            apiFetch(`/api/split/rooms/${roomId}/analytics`, { method: 'GET' }),
        getActivities: (roomId: number, limit = 30) =>
            apiFetch(`/api/split/rooms/${roomId}/activities?limit=${limit}`, { method: 'GET' }),
    }
};
