import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';

const TransactionForm: React.FC<{
    onSave: (transaction: Omit<Transaction, 'id'>) => void;
    onCancel: () => void;
    transaction?: Omit<Transaction, 'id'> | null;
}> = ({ onSave, onCancel, transaction }) => {
    const [amount, setAmount] = useState(transaction?.amount || '');
    const [category, setCategory] = useState(transaction?.category || '');
    const [date, setDate] = useState(transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(transaction?.description || '');
    const [type, setType] = useState<TransactionType>(transaction?.type || TransactionType.EXPENSE);
    const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category || !description) {
            alert("Please fill all fields.");
            return;
        }
        onSave({
            amount: parseFloat(String(amount)),
            category,
            date: new Date(date).toISOString(),
            description,
            type,
            isRecurring,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-md space-y-4">
                <h2 className="text-2xl font-bold">New Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 p-2 rounded-md ${type === TransactionType.EXPENSE ? 'bg-danger' : 'bg-card'}`}>Expense</button>
                        <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 p-2 rounded-md ${type === TransactionType.INCOME ? 'bg-success' : 'bg-card'}`}>Income</button>
                    </div>
                    <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" required />
                    <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" required />
                    <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" required />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" required />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
                        <label htmlFor="isRecurring" className="text-text-secondary">Is this a recurring transaction?</label>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-secondary rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


const TransactionsView: React.FC = () => {
    const { appData, updateAppData } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        if (!appData) return;
        const newTransaction = { ...transaction, id: new Date().toISOString() };
        const updatedData = { ...appData, transactions: [...appData.transactions, newTransaction] };
        await updateAppData(updatedData);
        setIsModalOpen(false);
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!appData || !window.confirm("Are you sure you want to delete this transaction?")) return;
        const updatedTransactions = appData.transactions.filter(t => t.id !== id);
        await updateAppData({ ...appData, transactions: updatedTransactions });
    };

    const sortedTransactions = useMemo(() => {
        return appData?.transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
    }, [appData]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Transactions</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary hover:bg-primary-focus rounded-md font-semibold">
                    Add Transaction
                </button>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-lg">
                <ul className="space-y-3">
                    {sortedTransactions.length > 0 ? sortedTransactions.map(t => (
                        <li key={t.id} className="flex justify-between items-center p-3 bg-card rounded-md">
                            <div className="flex-1">
                                <p className="font-medium">{t.description}</p>
                                <p className="text-sm text-text-secondary">{t.category} - {new Date(t.date).toLocaleDateString()}{t.isRecurring ? ' (Recurring)' : ''}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-success' : 'text-danger'}`}>
                                    {t.type === TransactionType.INCOME ? '+' : '-'} ${t.amount.toFixed(2)}
                                </span>
                                <button onClick={() => handleDeleteTransaction(t.id)} className="text-danger hover:text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </li>
                    )) : (
                        <p className="text-text-secondary text-center py-4">No transactions yet. Add one to get started!</p>
                    )}
                </ul>
            </div>

            {isModalOpen && <TransactionForm onSave={handleSaveTransaction} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default TransactionsView;