import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const API = 'http://localhost:5000';

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const email = params.get('email') || '';
    const mode = params.get('mode') || 'register'; // 'register' | 'reset'

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(300); // 5 min
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const handleChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const code = otp.join('');
        if (code.length < 6) { setError('Please enter the full 6-digit OTP.'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code, mode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'OTP verification failed');
            if (mode === 'reset') {
                navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${code}`);
            } else {
                localStorage.setItem('nickle_token', data.token);
                localStorage.setItem('nickle_user', JSON.stringify(data.user));
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setResending(true);
        try {
            const endpoint = mode === 'reset' ? '/api/auth/forgot-password' : '/api/auth/resend-otp';
            await fetch(`${API}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setCountdown(300);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthLayout title="Check your email 📬" subtitle={`We sent a 6-digit code to ${email}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    ))}
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    Expires in <span className={`font-bold ml-1 ${countdown < 60 ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>{formatTime(countdown)}</span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-bg text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
                >
                    {loading ? 'Verifying…' : 'Verify Code'}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={resendOtp}
                        disabled={resending || countdown > 240}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1 mx-auto"
                    >
                        <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                        {countdown > 240 ? `Resend in ${formatTime(countdown - 240)}` : 'Resend code'}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
