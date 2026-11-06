import { useState } from 'react';
import {
    X,
    Copy,
    Check,
    Search,
    Share2,
    ExternalLink,
    Send
} from 'lucide-react';

interface ShareRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: {
        id?: number;
        name: string;
        code: string;
        description?: string;
    } | null;
    inviterName?: string;
    userAvatar?: string;
}

export default function ShareRoomModal({
    isOpen,
    onClose,
    room,
    inviterName = 'Niranjan',
    userAvatar
}: ShareRoomModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [messageCopied, setMessageCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    if (!isOpen || !room) return null;

    const safeInviter = inviterName || 'Niranjan';
    const roomName = room.name || 'Group';
    const roomCode = room.code || '';
    const initials = (safeInviter.trim() || 'Niranjan').slice(0, 2).toUpperCase();

    // Default invitation message tailored to user request:
    // e.g. "Niranjan is inviting you to join their Goa trip room on Nickel, invite code: XXXXXX"
    const defaultMessage = `${safeInviter} is inviting you to join their "${roomName}" room on Nickel!

Invite Code: ${roomCode}

Sign in to Nickel, head over to Split Expense > Join Room, and enter the invite code to track and split expenses together.`;

    const handleCopyMessage = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(defaultMessage);
        }
        setMessageCopied(true);
        setTimeout(() => setMessageCopied(false), 2000);
    };

    const handleCopyCode = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(roomCode);
        }
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // Native Web Share API (Triggers native Windows Share sheet shown in user's image)
    const handleNativeShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `Join ${roomName} on Nickel`,
                    text: defaultMessage,
                    url: window.location.origin
                });
            } catch (err) {
                // User cancelled or share failed, fallback to copy
                console.log('Share dismissed', err);
            }
        } else {
            handleCopyMessage();
        }
    };

    // Direct app share handlers
    const handleShareWhatsApp = () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleShareTeams = () => {
        const url = `https://teams.microsoft.com/share?msgText=${encodeURIComponent(defaultMessage)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleShareOutlook = () => {
        const subject = `Invitation to join ${roomName} on Nickel`;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(defaultMessage)}`;
        window.location.href = url;
    };

    const handleShareTelegram = () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(defaultMessage)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Quick contacts (e.g. self and recent contacts matching user screenshot)
    const mockContacts = [
        {
            id: 'self',
            name: `${safeInviter} (You)`,
            initials: initials,
            badge: 'gmail',
            action: handleShareOutlook
        },
        {
            id: 'outlook',
            name: 'outlook_5D3FF...',
            initials: 'O',
            badge: 'outlook',
            action: handleShareOutlook
        }
    ];

    const filteredContacts = mockContacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog (Modeled after Windows Share / Modern Nickel Theme) */}
            <div className="relative w-full max-w-md bg-[#18181c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 text-white animate-in fade-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <Share2 className="w-5 h-5 text-zinc-300" />
                        <h2 className="text-base font-heading font-bold text-white tracking-wide">
                            Share
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt="User"
                                className="w-7 h-7 rounded-full object-cover border border-white/20"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {inviterName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for people or email"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>

                    {/* Quick Contacts Row (matching Windows Share screenshot) */}
                    {filteredContacts.length > 0 && (
                        <div className="flex items-center gap-4 pt-1">
                            {filteredContacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    type="button"
                                    onClick={contact.action}
                                    className="flex flex-col items-center gap-1.5 group cursor-pointer max-w-[80px] text-center"
                                >
                                    <div className="relative w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold text-zinc-200 group-hover:scale-105 group-hover:border-white/30 transition-all shadow-sm">
                                        <span>{contact.initials}</span>
                                        {/* App Badge on corner */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#18181c] flex items-center justify-center">
                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white ${contact.badge === 'gmail' ? 'bg-rose-500' : 'bg-sky-600'}`}>
                                                ✉
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-zinc-300 group-hover:text-white truncate w-full">
                                        {contact.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="h-[1px] bg-white/5" />

                    {/* "Share using" Section */}
                    <div className="space-y-3">
                        <span className="text-xs font-semibold text-zinc-400 block tracking-wide">
                            Share using
                        </span>

                        <div className="grid grid-cols-4 gap-3">
                            {/* 1. WhatsApp */}
                            <button
                                type="button"
                                onClick={handleShareWhatsApp}
                                className="flex flex-col items-center gap-2 p-2.5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#25D366]">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white">
                                    WhatsApp
                                </span>
                            </button>

                            {/* 2. Microsoft Teams */}
                            <button
                                type="button"
                                onClick={handleShareTeams}
                                className="flex flex-col items-center gap-2 p-2.5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#4B53BC]/15 border border-[#4B53BC]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#5059C9]">
                                        <path d="M19.5 7.5a2 2 0 11-4 0 2 2 0 014 0zM14.5 12c-1.8 0-3.5.7-4.7 1.8A5.5 5.5 0 0115 10h4a3 3 0 013 3v2.5a1.5 1.5 0 01-1.5 1.5h-3.6A6.5 6.5 0 0114.5 12zm-5-6a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM1 14.5A3.5 3.5 0 014.5 11h5A3.5 3.5 0 0113 14.5V17a2 2 0 01-2 2H3a2 2 0 01-2-2v-2.5z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate max-w-full">
                                    Teams
                                </span>
                            </button>

                            {/* 3. Outlook / Mail */}
                            <button
                                type="button"
                                onClick={handleShareOutlook}
                                className="flex flex-col items-center gap-2 p-2.5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#0078D4]/15 border border-[#0078D4]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#0078D4]">
                                        <path d="M1 5.5A2.5 2.5 0 013.5 3h17A2.5 2.5 0 0123 5.5v13a2.5 2.5 0 01-2.5 2.5h-17A2.5 2.5 0 011 18.5v-13zm2.5-.5a.5.5 0 00-.5.5v.85l9 5.4 9-5.4V5.5a.5.5 0 00-.5-.5h-17zm17.5 3.2L12.5 13.9a1 1 0 01-1 0L3 8.2v10.3a.5.5 0 00.5.5h17a.5.5 0 00.5-.5V8.2z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white">
                                    Outlook
                                </span>
                            </button>

                            {/* 4. Telegram */}
                            <button
                                type="button"
                                onClick={handleShareTelegram}
                                className="flex flex-col items-center gap-2 p-2.5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <Send className="w-5 h-5 text-[#229ED9]" />
                                </div>
                                <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white">
                                    Telegram
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Default Message Preview Box (Tailored to prompt requirement) */}
                    <div className="p-4 rounded-2xl bg-[#121215] border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                                Invitation Message
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400">
                                Code: <strong className="text-white">{room.code}</strong>
                            </span>
                        </div>

                        <p className="text-xs text-zinc-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed whitespace-pre-line font-sans">
                            {defaultMessage}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                            >
                                {codeCopied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Code Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Copy Code</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyMessage}
                                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                            >
                                {messageCopied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Message Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Copy Message</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Native Windows / System Share Trigger Button */}
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button
                            type="button"
                            onClick={handleNativeShare}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>More Apps (Windows System Share)</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
