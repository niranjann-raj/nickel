import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const API = 'http://localhost:5000';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setSuccess(true);
            setTimeout(() => {
                navigate(`/verify-otp?email=${encodeURIComponent(email)}&mode=reset`);
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Reset your password 🔐" subtitle="Enter your email and we'll send you a recovery code">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        OTP sent! Redirecting…
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full gradient-bg text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
                >
                    {loading ? 'Sending OTP…' : 'Send Recovery Code'}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Remembered it?{' '}
                    <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Back to Login</Link>
                </p>
            </form>
        </AuthLayout>
    );
}
