import MatrixLoader from '../../components/ui/MatrixLoader';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, KeyRound, Search, Check, Copy,
    ShieldCheck, Clock, ChevronRight
} from 'lucide-react';
import { api } from '../api';
import CreateRoomModal from '../components/split/CreateRoomModal';
import JoinRoomModal from '../components/split/JoinRoomModal';

interface RoomItem {
    id: number;
    code: string;
    name: string;
    description?: string;
    currency: string;
    icon?: string;
    start_date?: string;
    end_date?: string;
    is_settled: boolean;
    member_count: number;
    total_spent: number;
    user_role: string;
    user_outstanding: number;
    user_status_label: string;
    user_status_type: 'OWES' | 'IS_OWED' | 'SETTLED';
    settlement_progress: number;
    is_fully_settled: boolean;
}

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

export default function SplitOverviewPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'settled'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.split.getRooms(filterStatus);
            setRooms(res.rooms || []);
        } catch (err) {
            console.error('Failed to load split rooms', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const handleCopyCode = (e: React.MouseEvent, code: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Filtered rooms by search query
    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const q = searchQuery.toLowerCase();
        return rooms.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.code.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q))
        );
    }, [rooms, searchQuery]);

    // Aggregate statistics across all user's rooms
    const stats = useMemo(() => {
        let totalRooms = rooms.length;
        let activeRooms = 0;
        let settledRooms = 0;
        let totalOwedToUser = 0;
        let totalUserOwes = 0;

        rooms.forEach(r => {
            if (r.is_fully_settled) {
                settledRooms++;
            } else {
                activeRooms++;
            }

            if (r.user_outstanding > 0) {
                totalOwedToUser += r.user_outstanding;
            } else if (r.user_outstanding < 0) {
                totalUserOwes += Math.abs(r.user_outstanding);
            }
        });

        return {
            totalRooms,
            activeRooms,
            settledRooms,
            totalOwedToUser: Math.round(totalOwedToUser * 100) / 100,
            totalUserOwes: Math.round(totalUserOwes * 100) / 100,
        };
    }, [rooms]);

    return (
        <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                            <Users className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Split Expense
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Create rooms for trips or shared living, record expenses, and settle balances effortlessly.
                    </p>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsJoinOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-300 dark:border-white/15 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 font-semibold text-sm shadow-sm transition-all cursor-pointer"
                    >
                        <KeyRound className="w-4 h-4 text-zinc-400" />
                        <span>Join Room</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm shadow-md transition-all cursor-pointer group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform text-zinc-950" />
                        <span>Create Room</span>
                    </button>
                </div>
            </div>

            {/* Overall Aggregate Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 space-y-1 shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                        Your Rooms
                    </span>
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white pt-1">
                        {stats.totalRooms}
                    </div>
                    <p className="text-xs text-gray-400">
                        {stats.activeRooms} active • {stats.settledRooms} settled
                    </p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 space-y-1 shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                        You Are Owed
                    </span>
                    <div className="text-2xl font-mono font-bold text-emerald-500 pt-1">
                        ₹ {stats.totalOwedToUser.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-emerald-500/80">Pending to receive across groups</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 space-y-1 shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                        You Owe
                    </span>
                    <div className="text-2xl font-mono font-bold text-rose-500 pt-1">
                        ₹ {stats.totalUserOwes.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-rose-500/80">Outstanding debts to settle</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 space-y-1 shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                        Settlement Status
                    </span>
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white pt-1">
                        {stats.totalRooms > 0 ? `${Math.round((stats.settledRooms / stats.totalRooms) * 100)}%` : '100%'}
                    </div>
                    <p className="text-xs text-gray-400">Groups fully settled</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Status Tabs */}
                <div className="flex items-center bg-gray-100 dark:bg-[#18181c] p-1 rounded-2xl border border-gray-200/60 dark:border-white/5">
                    {(['all', 'active', 'settled'] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilterStatus(tab)}
                            className={`py-2 px-4 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                                filterStatus === tab
                                    ? 'bg-white dark:bg-[#222227] text-gray-900 dark:text-white shadow-sm font-bold'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {tab === 'all' ? 'All Rooms' : tab === 'active' ? 'Active' : 'Settled'}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search rooms or code..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-white/30 shadow-sm transition-colors"
                    />
                </div>
            </div>

            {/* Rooms Grid / Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <MatrixLoader size="lg" variant="orbit" rounded />
                    <span className="text-xs text-gray-500 tracking-wider uppercase font-medium">Loading Rooms...</span>
                </div>
            ) : filteredRooms.length === 0 ? (
                /* Empty State */
                <div className="p-10 sm:p-16 rounded-3xl bg-white dark:bg-[#121215] border border-dashed border-gray-300 dark:border-white/10 text-center space-y-5 shadow-sm">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-3xl">
                        🏖️
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {searchQuery ? 'No matching rooms found' : 'No split expense rooms yet'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {searchQuery
                                ? 'Try searching for a different room name or check your filter.'
                                : 'Create a room for your next vacation, flatmates rent, or group dinner. Or join an existing room with a 6-character code.'}
                        </p>
                    </div>

                    {!searchQuery && (
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(true)}
                                className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Your First Room</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsJoinOpen(true)}
                                className="px-5 py-3 rounded-2xl border border-gray-300 dark:border-white/15 bg-transparent text-gray-700 dark:text-gray-200 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <KeyRound className="w-4 h-4 text-zinc-400" />
                                <span>Join With Code</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* Rooms Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRooms.map((room) => {
                        const emoji = ROOM_EMOJIS[room.icon || 'Plane'] || '👥';
                        return (
                            <div
                                key={room.id}
                                onClick={() => navigate(`/dashboard/split/${room.id}`)}
                                className="group relative p-6 rounded-3xl bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 hover:border-white/30 dark:hover:border-white/30 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    {/* Top Bar: Icon, Name & Code */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                                                {emoji}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors line-clamp-1">
                                                    {room.name}
                                                </h3>
                                                <p className="text-xs text-gray-400 line-clamp-1">
                                                    {room.description || 'Shared group ledger'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Six-Char Code Badge */}
                                        <button
                                            type="button"
                                            title="Click to copy code"
                                            onClick={(e) => handleCopyCode(e, room.code)}
                                            className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-gray-50 dark:bg-[#18181c] hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-mono font-bold text-gray-700 dark:text-gray-300 hover:text-white transition-all cursor-pointer"
                                        >
                                            {copiedCode === room.code ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-emerald-500 text-[11px]">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{room.code}</span>
                                                    <Copy className="w-3 h-3 text-gray-400" />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Key Room Metrics */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-white/5 text-xs">
                                        <div>
                                            <span className="text-gray-400 block text-[11px]">Total Expenses</span>
                                            <span className="font-mono font-bold text-gray-900 dark:text-white">
                                                {room.currency} {Number(room.total_spent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-gray-400 block text-[11px]">Members</span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                {room.member_count} {room.member_count === 1 ? 'member' : 'members'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User Balance Badge */}
                                    <div className="pt-2">
                                        <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-between ${
                                            room.user_status_type === 'OWES'
                                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                                : room.user_status_type === 'IS_OWED'
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                                : 'bg-gray-100/70 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/5'
                                        }`}>
                                            <span>Your Balance:</span>
                                            <span className="font-mono font-bold">
                                                {room.user_status_label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Progress & Navigation */}
                                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        {room.is_fully_settled && room.user_status_type === 'SETTLED' ? (
                                            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Settled
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-zinc-400">
                                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                {Math.min(99, Math.round(room.settlement_progress || 0))}% settled
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-zinc-300 group-hover:text-white font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-all">
                                        Open Room <ChevronRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <CreateRoomModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onRoomCreated={() => fetchRooms()}
            />

            <JoinRoomModal
                isOpen={isJoinOpen}
                onClose={() => setIsJoinOpen(false)}
                onJoined={() => fetchRooms()}
            />
        </div>
    );
}
