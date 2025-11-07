
import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDashboardInsights } from '../../services/geminiService';
import { TransactionType } from '../../types';

const Dashboard: React.FC = () => {
    const { appData, setActiveNav } = useApp();
    const [insights, setInsights] = useState('Loading insights...');
    const [isLoadingInsights, setIsLoadingInsights] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            if (appData) {
                setIsLoadingInsights(true);
                const result = await getDashboardInsights(appData);
                setInsights(result);
                setIsLoadingInsights(false);
            }
        };
        fetchInsights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appData]);

    const stats = useMemo(() => {
        if (!appData) return { income: 0, expenses: 0, netFlow: 0 };
        
        const thisMonthTransactions = appData.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
        });

        const income = thisMonthTransactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = thisMonthTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expenses,
            netFlow: income - expenses
        };
    }, [appData]);

    const recentTransactions = useMemo(() => {
        return appData?.transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5) || [];
    }, [appData]);

    if (!appData) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="This Month's Income" value={stats.income} color="text-success" />
                <StatCard title="This Month's Expenses" value={stats.expenses} color="text-danger" />
                <StatCard title="Net Cash Flow" value={stats.netFlow} color={stats.netFlow >= 0 ? 'text-success' : 'text-danger'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Aperçus de Hadj (AI Insights)</h2>
                    <div className="bg-card p-4 rounded-md min-h-[80px] flex items-center">
                        {isLoadingInsights ? (
                             <div className="w-full h-5 bg-gray-600 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-text-secondary italic">"{insights}"</p>
                        )}
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button onClick={() => setActiveNav('transactions')} className="w-full text-left p-3 bg-primary hover:bg-primary-focus rounded-md transition-colors">Add Transaction</button>
                        <button onClick={() => setActiveNav('investments')} className="w-full text-left p-3 bg-secondary hover:bg-card rounded-md transition-colors">Log Investment</button>
                        <button onClick={() => setActiveNav('zakat')} className="w-full text-left p-3 bg-secondary hover:bg-card rounded-md transition-colors">Calculate Zakat</button>
                    </div>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                <ul className="space-y-3">
                    {recentTransactions.length > 0 ? recentTransactions.map(t => (
                        <li key={t.id} className="flex justify-between items-center p-3 bg-card rounded-md">
                            <div>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-sm text-text-secondary">{t.category} - {new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-success' : 'text-danger'}`}>
                                {t.type === TransactionType.INCOME ? '+' : '-'} ${t.amount.toFixed(2)}
                            </span>
                        </li>
                    )) : (
                        <p className="text-text-secondary">No transactions yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number; color: string; }> = ({ title, value, color }) => (
    <div className="bg-surface p-6 rounded-lg shadow-lg">
        <h3 className="text-text-secondary text-sm font-medium uppercase">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>${value.toFixed(2)}</p>
    </div>
);


export default Dashboard;
