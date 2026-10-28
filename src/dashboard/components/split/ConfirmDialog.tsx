import MatrixLoader from '../../../components/ui/MatrixLoader';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    loading = false
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 space-y-4 my-8">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isDestructive
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-white/10 text-white border border-white/15'
                    }`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {message}
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`py-2.5 px-5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isDestructive
                                ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 text-white font-bold'
                                : 'bg-white hover:bg-zinc-200 text-zinc-950 font-bold shadow-sm'
                        }`}
                    >
                        {loading && <MatrixLoader size="sm" variant="orbit" rounded className="mr-1.5" baseColor="#777" activeColor="#fff" />}
                        <span>{confirmText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
