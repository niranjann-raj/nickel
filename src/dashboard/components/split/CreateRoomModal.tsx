import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, Sparkles, DollarSign, ArrowRight, Share2 } from 'lucide-react';
import { api } from '../../api';
import { useDashboard } from '../../DashboardLayout';
import ShareRoomModal from './ShareRoomModal';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoomCreated?: (room: any) => void;
}

const ROOM_ICONS = [
    { id: 'Plane', label: 'Trip / Travel', emoji: '✈️' },
    { id: 'Home', label: 'Flatmates / Rent', emoji: '🏠' },
    { id: 'Utensils', label: 'Dinner / Food', emoji: '🍽️' },
    { id: 'Car', label: 'Road Trip', emoji: '🚗' },
    { id: 'Palmtree', label: 'Vacation', emoji: '🏖️' },
    { id: 'PartyPopper', label: 'Party / Event', emoji: '🎉' },
    { id: 'Briefcase', label: 'Project / Work', emoji: '💼' },
    { id: 'Users', label: 'Friends / General', emoji: '👥' },
];

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
    const navigate = useNavigate();
    const { user } = useDashboard();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Plane');
    const [currency, setCurrency] = useState('INR');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Created room state (success screen)
    const [createdRoom, setCreatedRoom] = useState<any | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    if (!isOpen) return null;

    const handleReset = () => {
        setName('');
        setDescription('');
        setSelectedIcon('Plane');
        setCurrency('INR');
        setStartDate('');
        setEndDate('');
        setError(null);
        setCreatedRoom(null);
        setCodeCopied(false);
        setIsShareModalOpen(false);
        onClose();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please provide a room name.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.split.createRoom({
                name: name.trim(),
                description: description.trim() || undefined,
                icon: selectedIcon,
                currency,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            });

            setCreatedRoom(res.room);
            if (onRoomCreated) onRoomCreated(res.room);
        } catch (err: any) {
            setError(err.message || 'Failed to create room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (!createdRoom) return;
        navigator.clipboard.writeText(createdRoom.code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2500);
    };



    const handleGoToRoom = () => {
        if (!createdRoom) return;
        const id = createdRoom.id;
        handleReset();
        navigate(`/dashboard/split/${id}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={handleReset} />

            <div className="relative w-full max-w-lg bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                                {createdRoom ? 'Room Created!' : 'Create Split Room'}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {createdRoom ? 'Share the unique code with friends to start splitting' : 'Set up a group for a trip, flatmates, or shared activity'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {createdRoom ? (
                        /* Success View */
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl shadow-sm">
                                🎉
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    "{createdRoom.name}" is ready!
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Give this 6-character room code to your friends so they can join.
                                </p>
                            </div>

                            {/* Big Room Code Box */}
                            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-dashed border-gray-300 dark:border-white/15">
                                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase block mb-1">
                                    Room Invitation Code
                                </span>
                                <div className="text-4xl font-mono font-black tracking-widest text-white py-1">
                                    {createdRoom.code}
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Hexadecimal • Cryptographically Unique
                                </p>
                            </div>

                            {/* Share Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                                >
                                    {codeCopied ? (
                                        <>
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            <span className="text-emerald-500">Copied Code</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy Code</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share Invite</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoToRoom}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm shadow-sm transition-all cursor-pointer group"
                            >
                                <span>Go to Room</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        /* Creation Form */
                        <form onSubmit={handleCreate} className="space-y-5">
                            {error && (
                                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Room Name */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                    Room Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Manali Trip, Flatmates Expenses, Weekend Dinner"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors text-sm"
                                />
                            </div>

                            {/* Icon / Category Selector */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                    Category Icon
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ROOM_ICONS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedIcon(item.id)}
                                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                                selectedIcon === item.id
                                                    ? 'bg-white text-zinc-950 border-white shadow-sm font-semibold'
                                                    : 'bg-gray-50/50 dark:bg-[#18181c]/50 border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-xl">{item.emoji}</span>
                                            <span className="text-[10px] font-medium truncate w-full text-center">
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add trip details, guidelines, or group notes..."
                                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors text-sm resize-none"
                                />
                            </div>

                            {/* Currency & Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                        Currency
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                        <DollarSign className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                        Start Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || undefined}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm cursor-pointer"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <MatrixLoader size="sm" variant="orbit" rounded baseColor="#71717a" activeColor="#09090b" />
                                    ) : (
                                        <>
                                            <span>Create Room</span>
                                            <Sparkles className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {isShareModalOpen && createdRoom && (
                <ShareRoomModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    room={createdRoom}
                    inviterName={user?.full_name || 'Niranjan'}
                    userAvatar={user?.avatar}
                />
            )}
        </div>
    );
}
