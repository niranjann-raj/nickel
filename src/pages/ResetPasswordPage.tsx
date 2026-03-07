import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const API = 'http://localhost:5000';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const email = params.get('email') || '';
    const otp = params.get('otp') || '';

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, new_password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Password reset failed');
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Set new password 🔑" subtitle="Choose a strong password for your account">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type={showPw ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="Min. 6 characters"
                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type={showPw ? 'text' : 'password'}
                            required
                            value={form.confirm}
                            onChange={e => setForm({ ...form, confirm: e.target.value })}
                            placeholder="Re-enter password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                        />
                    </div>
                    {form.confirm && (
                        <div className={`flex items-center gap-1 mt-1.5 text-xs ${form.password === form.confirm ? 'text-green-500' : 'text-red-500'}`}>
                            {form.password === form.confirm ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {form.password === form.confirm ? 'Passwords match' : 'Passwords do not match'}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-bg text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
                >
                    {loading ? 'Resetting…' : 'Reset Password'}
                </button>
            </form>
        </AuthLayout>
    );
}
