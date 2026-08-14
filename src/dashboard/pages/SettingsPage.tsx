import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Phone, MapPin, Save, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { useDashboard } from '../DashboardLayout';

const AVATAR_PRESETS = [
    '/game_avatar.png',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Abby&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=c0aede'
];

const PHANTOM_AVATAR = '/phantom.jpg';


export default function SettingsPage() {
    const { user, refreshUser, addNotification } = useDashboard();
    const [form, setForm] = useState({ full_name: '', age: '', phone: '', city: '' });
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [showPw, setShowPw] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingPw, setSavingPw] = useState(false);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setForm({
                full_name: user.full_name || '',
                age: (user as any).age || '',
                phone: (user as any).phone || '',
                city: (user as any).city || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true); setSuccess(''); setError('');
        try {
            await api.put('/api/auth/update-profile', form);
            await refreshUser();
            setSuccess('Profile updated successfully!');
            addNotification('Profile Updated', 'Your settings have been saved.', 'info');
        } catch (e: any) {
            setError(e.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSelect = async (avatarUrl: string) => {
        if (avatarUrl === (user as any)?.avatar || savingAvatar) return;
        setSavingAvatar(true); setSuccess(''); setError('');
        try {
            await api.put('/api/auth/update-profile', { avatar: avatarUrl });
            await refreshUser();
            setSuccess('Avatar equipped successfully!');
            addNotification('Avatar Updated', 'Your new character has been equipped!', 'success');
        } catch (e: any) {
            setError(e.message || 'Failed to update avatar.');
        } finally {
            setSavingAvatar(false);
        }
    };

    const handlePasswordChange = async () => {
        if (pwForm.new_password !== pwForm.confirm_password) {
            setError('New passwords do not match.'); return;
        }
        if (pwForm.new_password.length < 8) {
            setError('New password must be at least 8 characters.'); return;
        }
        setSavingPw(true); setSuccess(''); setError('');
        try {
            await api.put('/api/auth/change-password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
            setPwForm({ current_password: '', new_password: '', confirm_password: '' });
            setSuccess('Password changed successfully!');
            addNotification('Security Updated', 'Your password was changed successfully.', 'success');
        } catch (e: any) {
            setError(e.message || 'Failed to change password.');
        } finally {
            setSavingPw(false);
        }
    };

    const fields = [
        { key: 'full_name', label: 'Full Name', icon: User, placeholder: 'Enter your full name', type: 'text' },
        { key: 'age', label: 'Age', icon: Calendar, placeholder: 'Your age', type: 'number' },
        { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+91 9876543210', type: 'tel' },
        { key: 'city', label: 'City', icon: MapPin, placeholder: 'Your city', type: 'text' },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Settings</h2>
                    <p className="text-sm text-gray-400">Manage your profile and account</p>
                </div>
            </div>

            {/* Feedback */}
            {success && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm border border-green-100 dark:border-green-900/40">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {success}
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-500 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/40">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-indigo-400/40 bg-gray-100 dark:bg-gray-800">
                        <img src={user?.avatar || '/game_avatar.png'} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user?.full_name}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                            <div className="relative">
                                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={type}
                                    value={(form as any)[key]}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder={placeholder}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-5 flex items-center gap-2 gradient-bg text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all disabled:opacity-60 mb-6"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>

                {/* Avatar Selection Grid */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Choose Your Avatar</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {(() => {
                            const availableAvatars = [...AVATAR_PRESETS];
                            const premiumMap: Record<string, string> = {
                                'NICKEL_PHANTOM': '/phantom.jpg',
                                'ninja': '/ninja.jpg',
                                'alien': '/alien.jpg',
                                'spartan': '/spartan.jpg',
                                'god_of_war': '/god_of_war.jpg'
                            };
                            
                            if (user?.unlocked_avatars) {
                                const unlockedList = user.unlocked_avatars.split(',');
                                unlockedList.forEach(id => {
                                    if (premiumMap[id]) availableAvatars.push(premiumMap[id]);
                                });
                            }
                            return availableAvatars.map((preset, idx) => {
                                const isSelected = preset === (user?.avatar || '/game_avatar.png');
                                const isLegendary = preset === PHANTOM_AVATAR || preset === '/god_of_war.jpg';
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={savingAvatar}
                                        onClick={() => handleAvatarSelect(preset)}
                                        className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-gray-50 dark:bg-gray-800/50 hover:scale-105 ${
                                            isSelected 
                                                ? (isLegendary ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]') 
                                                : (isLegendary ? 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-transparent hover:border-indigo-300 dark:hover:border-indigo-700')
                                        }`}
                                    >
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 relative flex items-center justify-center">
                                            <img src={preset} alt="preset" className="w-full h-full object-cover" />
                                            {isLegendary && !isSelected && (
                                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-1 rounded-bl-lg">
                                                    LEGENDARY
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className={`absolute inset-x-0 bottom-0 text-[9px] text-white font-black uppercase py-0.5 z-10 text-center ${isLegendary ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                                                    Eqpd
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 card-glow">
                <div className="flex items-center gap-2 mb-5">
                    <Lock className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
                </div>

                <div className="space-y-3">
                    {[
                        { key: 'current_password', label: 'Current Password' },
                        { key: 'new_password', label: 'New Password' },
                        { key: 'confirm_password', label: 'Confirm New Password' },
                    ].map(({ key, label }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={(pwForm as any)[key]}
                                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                                />
                                {key === 'confirm_password' && (
                                    <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handlePasswordChange}
                    disabled={savingPw || !pwForm.current_password || !pwForm.new_password}
                    className="mt-5 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all disabled:opacity-60"
                >
                    <Lock className="w-4 h-4" />
                    {savingPw ? 'Changing...' : 'Change Password'}
                </button>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Account Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                        { label: 'Level', value: user?.level },
                        { label: 'Total XP', value: (user?.xp || 0).toLocaleString() },
                        { label: 'Coins', value: (user?.coins || 0).toLocaleString() },
                        { label: 'Streak', value: `${user?.current_streak || 0} days` },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                            <p className="font-black text-lg text-indigo-600 dark:text-indigo-400">{value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
