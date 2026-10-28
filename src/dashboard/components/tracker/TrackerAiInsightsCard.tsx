import MatrixLoader from '../../../components/ui/MatrixLoader';
import SoundWave from '../../../components/ui/SoundWave';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Sparkles, Send, RefreshCw, MessageSquare, ShieldCheck, ChevronRight, Mic } from 'lucide-react';
import { api } from '../../api';

interface TrackerAiInsightsCardProps {
    startDate: string;
    endDate: string;
}

export default function TrackerAiInsightsCard({ startDate, endDate }: TrackerAiInsightsCardProps) {
    const [insights, setInsights] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [question, setQuestion] = useState<string>('');
    const [isListening, setIsListening] = useState<boolean>(false);
    const recognitionRef = useRef<any>(null);
    const baseTextRef = useRef<string>('');

    const presetPrompts = [
        "Where did I spend the most this period?",
        "How can I reduce recurring subscriptions?",
        "Identify high-frequency spending habits",
        "Give me 3 tips to increase my monthly savings"
    ];

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                const prefix = baseTextRef.current ? baseTextRef.current + ' ' : '';
                setQuestion(prefix + transcript);
            };

            recognition.onerror = (event: any) => {
                console.warn('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch { }
            }
        };
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchInsights();
        }
    }, [startDate, endDate]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }
        if (isListening) {
            try {
                recognitionRef.current.stop();
            } catch { }
            setIsListening(false);
        } else {
            try {
                baseTextRef.current = question.trim();
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.warn('Could not start speech recognition:', err);
            }
        }
    };

    const fetchInsights = async (customPrompt?: string) => {
        if (isListening && recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { }
            setIsListening(false);
        }
        setLoading(true);
        try {
            const res = await api.tracker.getAiInsights(startDate, endDate, customPrompt);
            setInsights(res.analysis || '');
        } catch {
            setInsights("Unable to load AI insights right now. Please verify your network or try again shortly.");
        } finally {
            setLoading(false);
        }
    };

    const handleAskCustom = (e: FormEvent) => {
        e.preventDefault();
        if (!question.trim() || loading) return;
        const q = question.trim();
        setQuestion('');
        fetchInsights(q);
    };

    const formatMarkdown = (text: string) => {
        return text
            .replace(/### (.*?)\n/g, '<h4 class="text-sm font-bold text-white mt-3 mb-1">$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/- (.*?)\n/g, '<li class="ml-4 list-disc text-gray-300 mb-1">$1</li>')
            .replace(/\n\n/g, '<div class="h-2"></div>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-white shadow-md">
                        <Sparkles className="w-5 h-5 text-gray-200" />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                            Nickel AI Spending Insights
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                                Powered by Gemini
                            </span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Personalized spending diagnostics and savings optimization for this period
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => fetchInsights()}
                    disabled={loading}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Analysis</span>
                </button>
            </div>

            {/* Preset Prompt Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-5 relative z-10">
                {presetPrompts.map((p, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => fetchInsights(p)}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-gray-300 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50 text-left"
                    >
                        <span>{p}</span>
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                    </button>
                ))}
            </div>

            {/* AI Insights Content Display */}
            <div className="bg-[#141416] border border-white/5 rounded-xl p-5 mb-4 relative z-10 min-h-[120px]">
                {loading ? (
                    <div className="h-28 flex flex-col items-center justify-center text-gray-400 text-xs gap-3">
                        <MatrixLoader size="md" variant="orbit" rounded />
                        <span>Analyzing transactions & generating insights...</span>
                    </div>
                ) : insights ? (
                    <div
                        className="text-xs text-gray-300 leading-relaxed font-body"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(insights) }}
                    />
                ) : (
                    <div className="text-xs text-gray-500 text-center py-6">
                        No financial insights generated yet. Click any suggested prompt above.
                    </div>
                )}
            </div>

            {/* Custom Question Form */}
            <form onSubmit={handleAskCustom} className="flex items-center gap-2 relative z-10">
                <div className="relative flex-1">
                    <MessageSquare className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder={isListening ? "Listening..." : "Ask Nickel AI anything about your spending in this range..."}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className={`w-full bg-[#18181b] border text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none placeholder-gray-500 transition-all ${
                            isListening ? 'border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/10 focus:border-white/30'
                        }`}
                    />
                </div>

                {/* Voice Input Mic Button - in black and white with sound wave animation */}
                <button
                    type="button"
                    onClick={toggleListening}
                    disabled={loading}
                    title={isListening ? "Stop listening" : "Voice input (English)"}
                    aria-label={isListening ? "Stop listening" : "Voice input in English"}
                    className={`h-[38px] px-3 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                        isListening
                            ? 'bg-white/15 text-white border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
                    }`}
                >
                    {isListening ? (
                        <SoundWave color="#ffffff" barWidth={2.5} height={14} />
                    ) : (
                        <Mic className="w-4 h-4" />
                    )}
                </button>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="px-4 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ask AI</span>
                </button>
            </form>

            {/* Privacy Guarantee Note */}
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-500 relative z-10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
                <span>Financial privacy protected: calculations are processed authoritatively on-server and anonymized.</span>
            </div>
        </div>
    );
}
