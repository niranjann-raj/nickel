import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../api';

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoined?: (room: any) => void;
}

export default function JoinRoomModal({ isOpen, onClose, onJoined }: JoinRoomModalProps) {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Filter and uppercase to allow only 0-9 and A-F
        const val = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
        setCode(val);
        setError(null);
    };

    const handleClose = () => {
        setCode('');
        setError(null);
        onClose();
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();

        if (trimmed.length !== 6) {
            setError('Room code must be exactly 6 hexadecimal characters (0-9, A-F).');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.split.joinRoom(trimmed);
            if (onJoined) onJoined(res.room);
            handleClose();
            navigate(`/dashboard/split/${res.room.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to join room. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    const isValid = code.length === 6;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={handleClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                                Join Split Room
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Enter the 6-character room code shared with you
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleJoin} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Six-Character Hex Code
                            </label>
                            <span className={`text-xs font-mono font-medium ${code.length === 6 ? 'text-white font-bold' : 'text-gray-400'}`}>
                                {code.length} / 6
                            </span>
                        </div>

                        {/* Monospace Code Input */}
                        <div className="relative">
                            <input
                                type="text"
                                maxLength={6}
                                autoFocus
                                value={code}
                                onChange={handleInputChange}
                                placeholder="e.g. A3F91C"
                                className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-[#18181c] border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 uppercase transition-all shadow-inner"
                            />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                            Hexadecimal characters: numbers 0-9 and letters A-F
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid || loading}
                        className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <MatrixLoader size="sm" variant="orbit" rounded baseColor="#71717a" activeColor="#09090b" />
                        ) : (
                            <>
                                <span>Join Room</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
