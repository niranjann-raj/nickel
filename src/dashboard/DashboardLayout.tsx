import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
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
}

interface DashboardContextType {
    user: UserProfile | null;
    refreshUser: () => void;
    loading: boolean;
}

const DashboardContext = createContext<DashboardContextType>({
    user: null,
    refreshUser: () => { },
    loading: true,
});

export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
        <DashboardContext.Provider value={{ user, refreshUser: fetchUser, loading }}>
            <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-body">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavbar
                        onMenuClick={() => setSidebarOpen(true)}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                        userName={user?.full_name}
                    />
                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </DashboardContext.Provider>
    );
}
