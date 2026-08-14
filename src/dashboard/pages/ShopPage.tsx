import { useState } from 'react';
import { ShoppingBag, Smartphone, Tag, Headphones, Speaker, CheckCircle, Coins, Zap } from 'lucide-react';
import { useDashboard } from '../DashboardLayout';
import { api } from '../api';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    icon: React.ElementType;
    color: string;
    bg: string;
    badge?: string;
}

const PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'NicklePhone Pro',
        description: 'Latest flagship smartphone with 6.7" display, 108MP camera, and 5000mAh battery.',
        price: 8000,
        icon: Smartphone,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        badge: '🔥 Hot',
    },
    {
        id: 2,
        name: 'Shopping Voucher ₹500',
        description: 'Redeem a ₹500 voucher on any partner store purchase — food, fashion, or groceries.',
        price: 1200,
        icon: Tag,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        badge: '⭐ Popular',
    },
    {
        id: 3,
        name: 'NickleBeats Earbuds',
        description: 'True wireless earbuds with ANC, 30hr battery life, and IPX5 water resistance.',
        price: 3500,
        icon: Headphones,
        color: 'text-pink-600 dark:text-pink-400',
        bg: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
        id: 4,
        name: 'StudioPro Headphones',
        description: 'Premium over-ear headphones with Hi-Res audio, foldable design & 40hr playback.',
        price: 5000,
        icon: Headphones,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
        id: 5,
        name: 'BoomBox Speaker',
        description: 'Portable 360° Bluetooth speaker with deep bass, LED lights, and 20hr battery.',
        price: 4200,
        icon: Speaker,
        color: 'text-violet-600 dark:text-violet-400',
        badge: '✨ New',
    },
];

const PREMIUM_AVATARS = [
    {
        id: 'ninja',
        name: 'Shadow Ninja',
        description: 'A master of stealth. Equip this avatar to show off your disciplined saving habits.',
        price: 2000,
        image: '/ninja.jpg',
    },
    {
        id: 'alien',
        name: 'Extraterrestrial',
        description: 'Out of this world! Perfect for those whose savings goals are astronomical.',
        price: 5000,
        image: '/alien.jpg',
    },
    {
        id: 'spartan',
        name: 'Spartan Warrior',
        description: 'Unbreakable resolve. Show the world your fierce dedication to your financial goals.',
        price: 7000,
        image: '/spartan.jpg',
    },
    {
        id: 'god_of_war',
        name: 'God of War',
        description: 'The ultimate conqueror. For those who dominate their savings targets.',
        price: 10000,
        image: '/god_of_war.jpg',
        badge: '🔥 Legendary',
    }
];

export default function ShopPage() {
    const { user, refreshUser, addNotification } = useDashboard();
    const [bought, setBought] = useState<number[]>([]);
    const [loading, setLoading] = useState<number | null>(null);
    const [msg, setMsg] = useState<{ id: number; text: string; success: boolean } | null>(null);

    const handleBuy = async (product: Product) => {
        if (!user || user.coins < product.price) {
            setMsg({ id: product.id, text: `Not enough coins! You need ${product.price - (user?.coins || 0)} more coins.`, success: false });
            setTimeout(() => setMsg(null), 3000);
            return;
        }
        setLoading(product.id);
        try {
            await api.post('/api/spend-coins', { amount: product.price, reason: `Bought ${product.name}` });
            await refreshUser();
            setBought(prev => [...prev, product.id]);
            setMsg({ id: product.id, text: `🎉 ${product.name} redeemed!`, success: true });
            addNotification('Item Redeemed!', `You got ${product.name} for ${product.price} coins.`, 'reward');
            setTimeout(() => setMsg(null), 3000);
        } catch (e: any) {
            setMsg({ id: product.id, text: e.message || 'Purchase failed.', success: false });
            setTimeout(() => setMsg(null), 3000);
        } finally {
            setLoading(null);
        }
    };

    const handleBuyAvatar = async (avatar: typeof PREMIUM_AVATARS[0]) => {
        if (!user || user.coins < avatar.price) {
            setMsg({ id: avatar.id as any, text: `Not enough coins! You need ${avatar.price - (user?.coins || 0)} more coins.`, success: false });
            setTimeout(() => setMsg(null), 3000);
            return;
        }
        setLoading(avatar.id as any);
        try {
            await api.post('/api/buy-avatar', { avatar_id: avatar.id, price: avatar.price });
            await refreshUser();
            setMsg({ id: avatar.id as any, text: `🎉 ${avatar.name} unlocked!`, success: true });
            addNotification('Avatar Unlocked!', `You can now equip ${avatar.name} in Settings!`, 'success');
            setTimeout(() => setMsg(null), 3000);
        } catch (e: any) {
            setMsg({ id: avatar.id as any, text: e.message || 'Purchase failed.', success: false });
            setTimeout(() => setMsg(null), 3000);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Coin Shop</h2>
                        <p className="text-sm text-gray-400">Redeem your coins for awesome rewards</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/40 px-4 py-2 rounded-2xl">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-black text-yellow-600 dark:text-yellow-400">{(user?.coins || 0).toLocaleString()}</span>
                    <span className="text-xs text-yellow-500">coins</span>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRODUCTS.map(product => {
                    const Icon = product.icon;
                    const canAfford = (user?.coins || 0) >= product.price;
                    const isBought = bought.includes(product.id);
                    const isLoading = loading === product.id;
                    const feedback = msg?.id === product.id ? msg : null;

                    return (
                        <div key={product.id} className={`bg-white dark:bg-gray-900 rounded-[24px] p-5 border border-gray-100 dark:border-gray-800 card-glow flex flex-col gap-4 transition-all ${isBought ? 'opacity-80' : ''}`}>
                            {/* Icon + Badge */}
                            <div className="flex items-start justify-between">
                                <div className={`w-14 h-14 ${product.bg} rounded-2xl flex items-center justify-center`}>
                                    <Icon className={`w-7 h-7 ${product.color}`} />
                                </div>
                                {product.badge && (
                                    <span className="text-xs font-bold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                                        {product.badge}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Price + CTA */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                    <span className="font-black text-lg text-yellow-600 dark:text-yellow-400">{product.price.toLocaleString()}</span>
                                    <span className="text-xs text-gray-400">coins</span>
                                </div>

                                {feedback && (
                                    <p className={`text-xs font-semibold ${feedback.success ? 'text-green-500' : 'text-red-500'}`}>
                                        {feedback.text}
                                    </p>
                                )}

                                <button
                                    onClick={() => handleBuy(product)}
                                    disabled={isBought || isLoading}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                                        ${isBought
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/40 cursor-default'
                                            : canAfford
                                                ? 'gradient-bg text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02]'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isBought ? (
                                        <><CheckCircle className="w-4 h-4" /> Redeemed</>
                                    ) : isLoading ? (
                                        'Processing...'
                                    ) : canAfford ? (
                                        <><ShoppingBag className="w-4 h-4" /> Redeem Now</>
                                    ) : (
                                        `Need ${(product.price - (user?.coins || 0)).toLocaleString()} more coins`
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Premium Avatars Section */}
            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                        <span className="text-xl">🎭</span>
                    </div>
                    <div>
                        <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Premium Avatars</h2>
                        <p className="text-sm text-gray-400">Unlock exclusive avatars to show off on your profile</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {PREMIUM_AVATARS.map(avatar => {
                        const canAfford = (user?.coins || 0) >= avatar.price;
                        const isBought = user?.unlocked_avatars?.includes(avatar.id);
                        const isLoading = loading === (avatar.id as any);
                        const feedback = msg?.id === (avatar.id as any) ? msg : null;

                        return (
                            <div key={avatar.id} className={`bg-white dark:bg-gray-900 rounded-[24px] p-5 border border-gray-100 dark:border-gray-800 card-glow flex flex-col gap-4 transition-all ${isBought ? 'opacity-80' : ''}`}>
                                {/* Image + Badge */}
                                <div className="flex items-start justify-between relative">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-purple-100 dark:ring-purple-900/30 flex-shrink-0 bg-gray-100 dark:bg-gray-800 shadow-lg">
                                        <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                                    </div>
                                    {avatar.badge && (
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800/50 absolute -top-2 -right-2 shadow-sm">
                                            {avatar.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 mt-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{avatar.name}</h3>
                                    <p className="text-xs text-gray-400 leading-relaxed">{avatar.description}</p>
                                </div>

                                {/* Price + CTA */}
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl py-2 border border-gray-100 dark:border-gray-800">
                                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                        <span className="font-black text-lg text-yellow-600 dark:text-yellow-400">{avatar.price.toLocaleString()}</span>
                                        <span className="text-xs font-semibold text-gray-400">coins</span>
                                    </div>

                                    {feedback && (
                                        <p className={`text-xs font-semibold text-center ${feedback.success ? 'text-green-500' : 'text-red-500'}`}>
                                            {feedback.text}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => handleBuyAvatar(avatar)}
                                        disabled={isBought || isLoading}
                                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                                            ${isBought
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/40 cursor-default'
                                                : canAfford
                                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02]'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isBought ? (
                                            <><CheckCircle className="w-4 h-4" /> Owned</>
                                        ) : isLoading ? (
                                            'Processing...'
                                        ) : canAfford ? (
                                            'Unlock Avatar'
                                        ) : (
                                            `Need ${(avatar.price - (user?.coins || 0)).toLocaleString()} more coins`
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
