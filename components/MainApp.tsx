
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavItem } from '../types';
import Dashboard from './views/Dashboard';
import TransactionsView from './views/TransactionsView';
import DebtsView from './views/DebtsView';
import InvestmentsView from './views/InvestmentsView';
import ZakatCalculator from './views/ZakatCalculator';
import TaxSimulator from './views/TaxSimulator';
import AiSpace from './views/AiSpace';
import Settings from './views/Settings';

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:bg-card hover:text-text-primary'
        }`}
    >
        {icon}
        <span className="ml-4">{label}</span>
    </button>
);

const MainApp: React.FC = () => {
    const { activeNav, setActiveNav, logout } = useApp();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems: { id: NavItem, label: string, icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <IconHome /> },
        { id: 'transactions', label: 'Transactions', icon: <IconList /> },
        { id: 'debts', label: 'Debts & Loans', icon: <IconTrendingDown /> },
        { id: 'investments', label: 'Investments', icon: <IconTrendingUp /> },
        { id: 'zakat', label: 'Zakat', icon: <IconHeart /> },
        { id: 'taxes', label: 'Tax Simulator', icon: <IconPercent /> },
        { id: 'ai_space', label: 'AI Space', icon: <IconSparkles /> },
        { id: 'settings', label: 'Settings', icon: <IconSettings /> },
    ];
    
    const renderContent = () => {
        switch (activeNav) {
            case 'dashboard': return <Dashboard />;
            case 'transactions': return <TransactionsView />;
            case 'debts': return <DebtsView />;
            case 'investments': return <InvestmentsView />;
            case 'zakat': return <ZakatCalculator />;
            case 'taxes': return <TaxSimulator />;
            case 'ai_space': return <AiSpace />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    }

    return (
        <div className="flex h-screen bg-background">
            <aside className={`flex-shrink-0 bg-surface transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between mb-8">
                        {isSidebarOpen && <span className="text-2xl font-bold text-white">Hadj<span className="text-primary">Finance</span></span>}
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-text-secondary hover:bg-card">
                            <IconMenu />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                       {navItems.map(item => (
                         <button
                           key={item.id}
                           onClick={() => setActiveNav(item.id)}
                           title={item.label}
                           className={`flex items-center w-full p-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                             activeNav === item.id ? 'bg-primary text-white' : 'text-text-secondary hover:bg-card hover:text-text-primary'
                           } ${!isSidebarOpen && 'justify-center'}`}
                         >
                           {item.icon}
                           {isSidebarOpen && <span className="ml-4">{item.label}</span>}
                         </button>
                       ))}
                    </nav>

                    <div>
                      <button
                        onClick={logout}
                        className={`flex items-center w-full p-3 text-sm font-medium rounded-lg transition-colors duration-200 text-text-secondary hover:bg-card hover:text-text-primary ${!isSidebarOpen && 'justify-center'}`}
                      >
                         <IconLogout />
                         {isSidebarOpen && <span className="ml-4">Lock & Logout</span>}
                      </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 bg-background">
                {renderContent()}
            </main>
        </div>
    );
};

// SVG Icons
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconTrendingDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const IconHeart = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconPercent = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;

export default MainApp;
