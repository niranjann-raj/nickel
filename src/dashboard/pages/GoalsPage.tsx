import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Plus, TrendingUp, CheckCircle, PiggyBank, Calendar } from 'lucide-react';
import { api } from '../api';
import GoalCard from '../components/goals/GoalCard';
import CreateGoalModal from '../components/goals/CreateGoalModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function GoalsPage() {
    const navigate = useNavigate();
    const [goals, setGoals] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/goals/');
            setGoals(data.goals);
            setSummary(data.summary);
        } catch (error) {
            console.error('Failed to fetch goals', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (goalData: any) => {
        try {
            await api.post('/api/goals/', goalData);
            fetchGoals();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteGoal = async (id: number) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        try {
            await api.delete(`/api/goals/${id}`);
            fetchGoals();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePauseGoal = async (goal: any) => {
        // Mock pause for now, would need a PUT endpoint to update status
        alert('Pause functionality coming soon. Need PUT endpoint for status update.');
    };

    const handleEditGoal = async (goal: any) => {
        alert('Edit functionality coming soon.');
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    const activeGoals = goals.filter(g => g.status !== 'COMPLETED');
    const completedGoals = goals.filter(g => g.status === 'COMPLETED');

    const chartData = activeGoals.map(g => ({
        name: g.name,
        Saved: g.saved_amount,
        Remaining: g.target_amount - g.saved_amount
    }));

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                        <Target className="w-8 h-8 text-indigo-500" />
                        Goal Based Saving
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Save money for what matters most.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white gradient-bg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                    <Plus className="w-5 h-5" /> Create Goal
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Goals</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_active}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_completed}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                            <PiggyBank className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Saved</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{summary.total_saved.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Saving</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{summary.monthly_saving_rate.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Goals List */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Goals */}
                    <div>
                        <h2 className="text-xl font-bold font-heading mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" /> Active Goals
                        </h2>
                        {activeGoals.length === 0 ? (
                            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎯</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active goals yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Start saving for your dreams today.</p>
                                <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                                    Create First Goal
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeGoals.map(goal => (
                                    <GoalCard 
                                        key={goal.id} 
                                        goal={goal} 
                                        onView={(id: any) => navigate(`/dashboard/goals/${id}`)}
                                        onEdit={handleEditGoal}
                                        onPause={handlePauseGoal}
                                        onDelete={handleDeleteGoal}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Goals */}
                    {completedGoals.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold font-heading mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Completed Goals
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {completedGoals.map(goal => (
                                    <GoalCard 
                                        key={goal.id} 
                                        goal={goal} 
                                        onView={(id: any) => navigate(`/dashboard/goals/${id}`)}
                                        onEdit={handleEditGoal}
                                        onPause={handlePauseGoal}
                                        onDelete={handleDeleteGoal}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Charts & Insights */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg font-heading mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" /> Progress Overview
                        </h3>
                        {activeGoals.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="Saved" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="Remaining" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                                No data to display
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateGoalModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateGoal}
            />
        </div>
    );
}
