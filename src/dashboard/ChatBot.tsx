import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { api } from './api';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

const SUGGESTIONS = [
    "How can I improve my savings?",
    "How to start investing in India?",
    "What is the 50/30/20 rule?",
    "How do I build an emergency fund?",
    "Tips to reduce daily expenses?",
];

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: "Hi! I'm **Nickel AI** 💰 Your personal finance advisor. Ask me anything about saving, budgeting, or investing!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const showSuggestions = messages.length === 1;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const sendMessage = async (overrideText?: string) => {
        const text = (overrideText ?? input).trim();
        if (!text || loading) return;

        const userMsg: Message = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text }));
            const data = await api.post('/api/chat', { message: text, history });
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setLoading(false);
        }
    };

    const formatText = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Chat window */}
            {open && (
                <div className="w-[360px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col"
                    style={{ height: '500px' }}>
                    {/* Header */}
                    <div className="gradient-bg px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Nickel AI</p>
                            <p className="text-white/70 text-xs">Personal Finance Advisor</p>
                        </div>
                        <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all">
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'ai' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    {msg.role === 'ai' ? <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <User className="w-4 h-4 text-gray-500" />}
                                </div>
                                <div className={`max-w-[240px] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'ai'
                                        ? 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                                        : 'gradient-bg text-white rounded-tr-sm'
                                }`} dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                            </div>
                        ))}

                        {/* Suggestion chips — only show before first user message */}
                        {showSuggestions && !loading && (
                            <div className="flex flex-col gap-2 mt-2">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(s)}
                                        className="text-left text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 px-3 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask about saving, investing..."
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex-shrink-0"
                        >
                            {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Floating button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-14 h-14 gradient-bg rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center hover:scale-110 hover:shadow-indigo-500/50 transition-all relative"
            >
                {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
                {!open && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
                )}
            </button>
        </div>
    );
}
