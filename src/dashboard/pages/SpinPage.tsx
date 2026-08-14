import { useState, useEffect } from 'react';
import { api } from '../api';
import { useDashboard } from '../DashboardLayout';
import { Info, PartyPopper, Shield, Star, Coins as CoinsIcon, Sparkles } from 'lucide-react';

const wheelSegments = [
    { id: 1, text: '😅 Try Again' },
    { id: 2, text: '🪙 1 Coin' },
    { id: 3, text: '🪙 10 Coins' },
    { id: 4, text: '🪙 100 Coins' },
    { id: 5, text: '💰 1K Coins' },
    { id: 6, text: '⭐ 100 XP' },
    { id: 7, text: '🛡️ Shield' },
    { id: 8, text: '👑 Phantom' }
];
const colors = ['#991b1b', '#fbbf24', '#991b1b', '#fbbf24', '#991b1b', '#fbbf24', '#991b1b', '#fbbf24']; // Red-800 and Amber-400
const textColors = ['#ffffff', '#78350f', '#ffffff', '#78350f', '#ffffff', '#78350f', '#ffffff', '#78350f'];

const probabilities = [
    { name: 'Better Luck Next Time', prob: '30%' },
    { name: '1 Coin', prob: '25%' },
    { name: '10 Coins', prob: '20%' },
    { name: '100 Coins', prob: '10%' },
    { name: '1,000 Coins', prob: '1%' },
    { name: '+100 XP', prob: '8%' },
    { name: 'Streak Shield', prob: '5%' },
    { name: 'Legendary Avatar', prob: '1%' },
];

export default function SpinPage() {
    const { refreshUser, addNotification } = useDashboard();

    const [canSpin, setCanSpin] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [reward, setReward] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [spinError, setSpinError] = useState('');

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.gamification.spinStatus();
            setCanSpin(res.can_spin);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStatus(false);
        }
    };

    const gradient = wheelSegments.map((_, i) => `${colors[i]} ${i * 45}deg ${(i + 1) * 45}deg`).join(', ');

    const handleSpin = async () => {
        if (!canSpin || isSpinning) return;
        setSpinError('');
        setCanSpin(false); // disable immediately

        try {
            // First, get result from backend
            const res = await api.gamification.spinWheel();
            if (res.success && res.reward) {
                const targetId = res.reward.id;
                const targetIndex = wheelSegments.findIndex(s => s.id === targetId);

                if (targetIndex !== -1) {
                    setIsSpinning(true);

                    // Center of target segment is (targetIndex * 45) + 22.5
                    // We need to rotate such that the target segment is at the top (0deg).
                    // This means rotation = 360*5 (spins) - ((targetIndex * 45) + 22.5)
                    const extraSpins = 360 * 5;
                    const finalRotation = extraSpins - (targetIndex * 45 + 22.5);

                    // We need to accumulate rotation if they spin again tomorrow without refresh, 
                    // but they can only spin once a day. Just set absolute rotation.
                    setRotation(finalRotation);

                    // Wait for animation to complete
                    setTimeout(() => {
                        setIsSpinning(false);
                        setReward(res.reward);
                        setShowModal(true);
                        refreshUser();
                    }, 5500); // 5s animation + 500ms buffer
                }
            } else {
                setSpinError(res.error || 'Failed to spin. Try again.');
                setCanSpin(true); // Re-enable if error
            }
        } catch (e: any) {
            setSpinError(e.message || 'Unable to complete your spin. Please try again.');
            setCanSpin(true);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="font-heading font-black text-4xl text-gray-900 dark:text-white mb-2 tracking-tight">🎡 DAILY SPIN</h1>
                <p className="text-gray-500 dark:text-gray-400">Your daily reward awaits!</p>
            </div>

            {spinError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center mb-6 max-w-sm mx-auto font-medium">
                    {spinError}
                </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-12 mb-8 mt-4">
                {/* Wheel Container */}
                <div className="relative">
                    {/* Pointer */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_6px_6px_rgba(0,0,0,0.6)]">
                        {/* Metallic triangular pointer */}
                        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-amber-500 relative">
                            <div className="absolute -top-[42px] -left-[14px] w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-yellow-300" />
                        </div>
                    </div>

                    {/* Outer Frame with Lights */}
                    <div className="relative p-6 sm:p-8 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border-[6px] border-amber-600 shadow-[0_10px_40px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(0,0,0,0.9)]">
                        {/* Edge Lights */}
                        {Array.from({ length: 24 }).map((_, i) => {
                            const angle = i * 15;
                            const radius = 48; // % from center
                            return (
                                <div
                                    key={i}
                                    className={`absolute w-3 sm:w-4 h-3 sm:h-4 rounded-full shadow-[0_0_12px_rgba(253,224,71,0.8)] z-10 ${i % 2 === 0 ? 'bg-yellow-100 animate-pulse' : 'bg-yellow-300'}`}
                                    style={{
                                        top: `calc(50% - ${Math.cos(angle * Math.PI / 180) * radius}% - 6px)`,
                                        left: `calc(50% + ${Math.sin(angle * Math.PI / 180) * radius}% - 6px)`,
                                    }}
                                />
                            );
                        })}

                        {/* Wheel Itself */}
                        <div
                            className="w-72 h-72 sm:w-[400px] sm:h-[400px] rounded-full relative overflow-hidden border-4 border-amber-500 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
                            style={{
                                background: `conic-gradient(${gradient})`,
                                transform: `rotate(${rotation}deg)`,
                                transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.1, 1)' : 'none',
                            }}
                        >
                            {/* Inner Circle / Metallic Hub */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 border-[4px] sm:border-[6px] border-amber-500 z-10 shadow-[0_0_30px_rgba(0,0,0,0.7)] flex items-center justify-center">
                                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-400 shadow-inner flex items-center justify-center">
                                    <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-gray-200 shadow-sm" />
                                </div>
                            </div>

                            {/* Segments Text */}
                            {wheelSegments.map((seg, i) => (
                                <div
                                    key={seg.id}
                                    className="absolute top-1/2 left-1/2 origin-[0_0]"
                                    style={{
                                        // -90deg offsets CSS rotate 0deg (right) to conic-gradient 0deg (top)
                                        transform: `rotate(${i * 45 + 22.5 - 90}deg)`
                                    }}
                                >
                                    <div
                                        className="absolute -translate-y-1/2 font-bold text-xs sm:text-sm text-center w-28 sm:w-36 left-10 sm:left-14 -rotate-90 flex items-center justify-center"
                                        style={{ color: textColors[i] }}
                                    >
                                        <span className="drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{seg.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Spin Button & Info */}
                <div className="flex flex-col items-center space-y-4">
                    {!loadingStatus && (
                        <button
                            onClick={handleSpin}
                            disabled={!canSpin || isSpinning}
                            className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50 ${canSpin && !isSpinning
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 active:scale-95 shadow-indigo-500/30'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {isSpinning ? 'SPINNING...' : canSpin ? '🎡 SPIN NOW' : '✓ DAILY SPIN COMPLETE'}
                        </button>
                    )}

                    <div className="text-center space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {canSpin ? '1 spin available today' : 'Come back tomorrow for another reward.'}
                        </p>
                        <button
                            onClick={() => setShowInfo(true)}
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full font-medium"
                        >
                            <Info className="w-3.5 h-3.5" />
                            Reward probabilities
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
                        <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Reward Probabilities</h3>
                        <div className="space-y-2 mb-6">
                            {probabilities.map(p => (
                                <div key={p.name} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                    <span className="text-gray-600 dark:text-gray-300">{p.name}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{p.prob}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowInfo(false)}
                            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showModal && reward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] max-w-sm w-full p-8 shadow-2xl text-center relative overflow-hidden border border-gray-100 dark:border-gray-800">
                        {reward.type !== 'LOSS' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
                        )}

                        <div className="relative z-10">
                            {reward.type === 'COINS' && (
                                <>
                                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <CoinsIcon className="w-10 h-10 text-yellow-500" />
                                    </div>
                                    <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-2">🎉 YOU WON!</h3>
                                    <p className="text-3xl font-bold text-yellow-500 mb-2">+{reward.value} Coins</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Reward added to your Nickel account.</p>
                                </>
                            )}

                            {reward.type === 'XP' && (
                                <>
                                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <Star className="w-10 h-10 text-purple-500" />
                                    </div>
                                    <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-2">⭐ YOU WON!</h3>
                                    <p className="text-3xl font-bold text-purple-500 mb-2">+100 XP</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">For your next level-up!</p>
                                </>
                            )}

                            {reward.type === 'SHIELD' && (
                                <>
                                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-2">🛡️ YOU WON!</h3>
                                    <p className="text-2xl font-bold text-blue-500 mb-2">Streak Shield</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">One shield has been added to your account.</p>
                                </>
                            )}

                            {reward.type === 'AVATAR' && (
                                <>
                                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)] relative">
                                        <Sparkles className="absolute top-1 right-1 w-5 h-5 text-yellow-300 animate-spin-slow" />
                                        <span className="text-4xl">👑</span>
                                    </div>
                                    <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-1">1% Legendary Drop</p>
                                    <h3 className="font-heading font-black text-3xl text-gray-900 dark:text-white mb-2">NICKEL PHANTOM</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Your legendary avatar has been unlocked.</p>
                                </>
                            )}

                            {reward.type === 'LOSS' && (
                                <>
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-4xl">😅</span>
                                    </div>
                                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-2">BETTER LUCK NEXT TIME</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Your daily spin is complete. Come back tomorrow!</p>
                                </>
                            )}

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25"
                            >
                                CONTINUE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
