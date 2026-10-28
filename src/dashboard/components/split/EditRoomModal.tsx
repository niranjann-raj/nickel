import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState, useEffect } from 'react';
import { X, Settings, AlertCircle } from 'lucide-react';
import { api } from '../../api';

interface EditRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: any;
    onRoomUpdated: (updatedRoom: any) => void;
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

export default function EditRoomModal({
    isOpen,
    onClose,
    room,
    onRoomUpdated
}: EditRoomModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Plane');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (room && isOpen) {
            setName(room.name || '');
            setDescription(room.description || '');
            setSelectedIcon(room.icon || 'Plane');
            setStartDate(room.start_date || '');
            setEndDate(room.end_date || '');
            setError(null);
        }
    }, [room, isOpen]);

    if (!isOpen || !room) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Room name cannot be empty.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.split.updateRoom(room.id, {
                name: name.trim(),
                description: description.trim(),
                icon: selectedIcon,
                start_date: startDate || null,
                end_date: endDate || null
            });

            onRoomUpdated(res.room);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update room.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                                Edit Room Settings
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Update room details and dates
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

                {/* Form */}
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                            Room Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                            Icon
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {ROOM_ICONS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedIcon(item.id)}
                                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                        selectedIcon === item.id
                                            ? 'bg-white text-zinc-950 border-white font-semibold shadow-sm'
                                            : 'bg-gray-50/50 dark:bg-[#18181c]/50 border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <span className="text-xl">{item.emoji}</span>
                                    <span className="text-[10px] truncate w-full text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || undefined}
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 pt-2"
                    >
                        {loading ? (
                            <MatrixLoader size="sm" variant="orbit" rounded baseColor="#71717a" activeColor="#09090b" />
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
