import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import ChatBot from './ChatBot';
import { api } from './api';

interface UserProfile {
    id: number;
    full_name: string;
    email: string;
    xp: number;
    level: number;
    xp_to_next_level: number;
    coins: number;
    current_streak: number;
    total_saved: number;
    avatar?: string;
}

export interface AppNotification {
    id: number;
    title: string;
    desc: string;
    time: string;
    type: 'success' | 'info' | 'reward';
}

interface DashboardContextType {
    user: UserProfile | null;
    refreshUser: () => void;
    loading: boolean;
    notifications: AppNotification[];
    addNotification: (title: string, desc: string, type: AppNotification['type']) => void;
    clearNotifications: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
    user: null,
    refreshUser: () => { },
    loading: true,
    notifications: [],
    addNotification: () => { },
    clearNotifications: () => { },
});

export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<AppNotification[]>([
        { id: Date.now(), title: 'Welcome to Nickle!', desc: 'Start saving to earn XP.', time: 'Just now', type: 'info' }
    ]);

    const addNotification = (title: string, desc: string, type: AppNotification['type']) => {
        setNotifications(prev => [{ id: Date.now(), title, desc, time: 'Just now', type }, ...prev]);
    };

    const clearNotifications = async () => {
        setNotifications([]);
        try {
            await api.post('/api/notifications/read', {});
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark';
        setIsDarkMode(isDark);
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const data = await api.get('/api/user-profile');
            setUser(data);
            localStorage.setItem('nickle_user', JSON.stringify(data));
            
            const notifs = await api.get('/api/notifications');
            if (notifs.notifications) {
                const mappedNotifs = notifs.notifications.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    desc: n.message,
                    time: new Date(n.created_at).toLocaleDateString(),
                    type: n.type || 'info',
                    is_read: n.is_read
                }));
                setNotifications(mappedNotifs.filter((n: any) => !n.is_read));
            }
        } catch {
            // token expired or invalid — let ProtectedRoute handle redirect
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        if (newDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
        else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    };

    return (
        <DashboardContext.Provider value={{ user, refreshUser: fetchUser, loading, notifications, addNotification, clearNotifications }}>
            <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-body">
                <Sidebar />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavbar
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                        userName={user?.full_name}
                    />
                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </div>
                <ChatBot />
            </div>
        </DashboardContext.Provider>
    );
}
