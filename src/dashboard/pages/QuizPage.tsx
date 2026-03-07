import { useEffect, useState } from 'react';
import { Brain, CheckCircle, XCircle, Coins, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { useDashboard } from '../DashboardLayout';

const TOPICS: Record<string, string> = {
    Saving: '💰', Budgeting: '📊', Interest: '📈', Investing: '🏦',
};

export default function QuizPage() {
    const { user, refreshUser } = useDashboard();
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [seeding, setSeeding] = useState(false);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/weekly-quiz');
            setQuestions(data.questions || []);
            setAlreadyDone(data.already_attempted);
            if (data.already_attempted) setResult({ coins_earned: data.coins_earned_this_week });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuiz(); }, []);

    const seedAndFetch = async () => {
        setSeeding(true);
        try {
            await fetch('http://localhost:5000/api/seed-quiz', { method: 'POST' });
            await fetchQuiz();
        } finally {
            setSeeding(false);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            setError('Please answer all questions before submitting.');
            return;
        }
        setError(''); setSubmitting(true);
        const payload: Record<string, string> = {};
        Object.entries(answers).forEach(([k, v]) => { payload[k] = v; });
        try {
            const data = await api.post('/api/submit-quiz', { answers: payload });
            setResult(data); setSubmitted(true);
            refreshUser();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (alreadyDone && !submitted) return (
        <div className="max-w-2xl mx-auto text-center py-20">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-heading font-black text-3xl text-gray-900 dark:text-white mb-2">Quiz Completed ✅</h2>
            <p className="text-gray-500 mb-2">You've already completed this week's quiz.</p>
            <p className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">🪙 {result?.coins_earned ?? 0} coins earned this week</p>
            <p className="text-gray-400 text-sm mt-4">Come back next Monday for a new quiz!</p>
        </div>
    );

    if (submitted && result) return (
        <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-6xl mb-6">{result.score === result.total ? '🏆' : result.score >= 3 ? '🎉' : '💪'}</div>
            <h2 className="font-heading font-black text-3xl text-gray-900 dark:text-white mb-2">
                {result.score}/{result.total} Correct!
            </h2>
            <p className="text-gray-500 mb-6">
                {result.score === result.total ? 'Perfect score! Outstanding!' : result.score >= 3 ? 'Great job! Keep learning!' : 'Keep practicing — you\'ll get better!'}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl px-6 py-4">
                    <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">🪙 {result.coins_earned}</p>
                    <p className="text-sm text-gray-500 mt-1">Coins Earned</p>
                </div>
            </div>

            {/* Answer review */}
            <div className="mt-8 text-left space-y-4">
                {questions.map((q: any) => {
                    const userAns = answers[q.id];
                    const correct = result?.correct_answers?.[q.id];
                    return (
                        <div key={q.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">{q.question}</p>
                            {['a', 'b', 'c', 'd'].map(opt => {
                                const text = q[`option_${opt}`];
                                return (
                                    <div key={opt} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl mb-1 ${userAns === opt ? 'bg-indigo-50 dark:bg-indigo-900/20 font-semibold' : ''}`}>
                                        <span className="opacity-60 w-4">{opt.toUpperCase()}.</span>
                                        {text}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Weekly Quiz</h2>
                    <p className="text-sm text-gray-400">Answer all 5 questions · Resets every Monday</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-xl">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">Up to 200 coins</span>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800">
                    <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No quiz questions available yet.</p>
                    <button onClick={seedAndFetch} disabled={seeding} className="gradient-bg text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60">
                        {seeding ? 'Loading…' : '🪄 Load Questions'}
                    </button>
                </div>
            ) : (
                <>
                    {/* Progress */}
                    <div className="flex gap-2">
                        {questions.map((_: any, i: number) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${answers[questions[i].id] ? 'gradient-bg' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        ))}
                    </div>

                    {questions.map((q: any, qi: number) => (
                        <div key={q.id} className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                    {TOPICS[q.topic] || '📚'} {q.topic}
                                </span>
                                <span className="text-xs text-gray-400">Q{qi + 1} of {questions.length}</span>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-4">{q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {['a', 'b', 'c', 'd'].map(opt => {
                                    const selected = answers[q.id] === opt;
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                            className={`text-left px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all ${selected
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-md scale-[1.02]'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className="font-bold mr-2 text-indigo-500">{opt.toUpperCase()}.</span>
                                            {q[`option_${opt}`]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full gradient-bg text-white py-4 rounded-2xl font-bold text-base hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
                    >
                        {submitting ? 'Submitting…' : `Submit Quiz · ${Object.keys(answers).length}/${questions.length} answered`}
                    </button>
                </>
            )}
        </div>
    );
}
