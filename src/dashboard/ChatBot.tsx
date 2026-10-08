import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, RefreshCw, Plus, ArrowUp } from 'lucide-react';
import { api } from './api';
import { MovingBorder } from '@/components/ui/moving-border';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [userName, setUserName] = useState('there');

    useEffect(() => {
        const userStr = localStorage.getItem('nickle_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.full_name) {
                    setUserName(user.full_name.split(' ')[0]);
                }
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
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
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([]);
    };

    const formatText = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-body">
            {/* Chat window */}
            <div
                className={`transition-all duration-500 ease-in-out origin-bottom-right ${open ? 'scale-100 opacity-100 mb-0' : 'scale-90 opacity-0 pointer-events-none -mb-10 absolute'
                    }`}
            >
                <div className="w-[380px] bg-[#0b0b0b] rounded-[24px] shadow-2xl flex flex-col border border-[#222] relative overflow-hidden"
                    style={{ height: '600px' }}>

                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between bg-[#0b0b0b] z-10">
                        <div>
                            <h1 className="font-semibold text-white text-[18px]">nickel AI</h1>
                        </div>
                        <button
                            onClick={resetChat}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#333] hover:bg-[#1a1a1a] text-[#888] transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area / Empty State */}
                    <div className="flex-1 overflow-y-auto flex flex-col relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-[-1rem]">
                                <div className="w-12 h-12 rounded-[16px] bg-[#111] border-2 border-dashed border-[#333] flex items-center justify-center mb-5 overflow-hidden p-0.5">
                                    <img src="/ai.png" alt="AI" className="w-full h-full rounded-[12px] object-cover" />
                                </div>
                                <h2 className="text-white text-lg font-semibold mb-2 tracking-wide">Morning, <span className="bg-gradient-to-r from-gray-400 via-white to-gray-500 text-transparent bg-clip-text font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{userName}</span>!</h2>
                                <p className="text-[#888] text-[14px] leading-relaxed max-w-[240px] mb-8">
                                    What are we working on today? Press send to start a new conversation
                                </p>

                                <div className="w-full flex flex-col gap-2.5">
                                    {["How am I doing financially?", "Can I afford a ₹5,000 purchase?", "What did I spend the most on?", "How can I reach my goal faster?"].map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(s)}
                                            className="w-full text-left bg-[#111] border border-[#222] hover:bg-[#1c1c1c] hover:border-[#333] text-[#ccc] px-4 py-3 rounded-xl transition-all text-[13.5px]"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 space-y-6 pb-28">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-3 text-[14.5px] leading-relaxed ${msg.role === 'ai'
                                            ? 'text-white'
                                            : 'bg-[#1c1c1c] text-white rounded-2xl rounded-tr-sm border border-[#2a2a2a]'
                                            }`} dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="text-[#888] text-[14px] flex items-center gap-2 px-2">
                                            <Sparkles className="w-4 h-4 animate-pulse" /> Thinking...
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} className="h-4" />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b] to-transparent pt-8 pb-4 px-4 z-10">
                        <div className="relative flex items-center bg-[#1c1c1c] border border-[#2a2a2a] rounded-[20px] p-1.5 focus-within:border-[#444] transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask about your finances..."
                                className="w-full bg-transparent border-none px-4 py-2 text-[14.5px] text-white placeholder-[#666] focus:outline-none focus:ring-0"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="w-8 h-8 rounded-full bg-gray-200 bg-[#ffffff] text-[#000000] hover:bg-gray-300 dark:hover:bg-gray-200 flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-all active:scale-95 mr-1"
                            >
                                {loading ? <Loader2 className="w-4 h-4 text-black animate-spin" /> : <ArrowUp className="w-4 h-4 text-black stroke-[3]" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div 
                className="relative z-50 cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setOpen(o => !o)}
            >
                <MovingBorder
                    isCircle={true}
                    borderWidth={isHovered ? 4 : 2}
                    gradientWidth={isHovered ? 150 : 80}
                    duration={isHovered ? 2 : 4}
                    colors={isHovered ? ["#ffffff", "#888888", "#e5e5e5"] : ["#333", "#555", "#333"]}
                    outerClassName="rounded-full shadow-2xl transition-all duration-300"
                    className="bg-[#1c1c1c]"
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${open ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'}`}>
                        {open ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <img src="/ai.png" alt="AI" className="w-full h-full object-cover transition-transform duration-500" />
                        )}
                    </div>
                </MovingBorder>
            </div>
        </div>
    );
}
