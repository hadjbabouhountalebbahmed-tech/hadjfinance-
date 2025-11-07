import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Debt, DebtType } from '../../types';

const DebtForm: React.FC<{
    onSave: (debt: Omit<Debt, 'id'>) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [type, setType] = useState<DebtType>(DebtType.BORROWED);
    const [person, setPerson] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!person || !amount || !description) {
            alert("Please fill person, amount, and description.");
            return;
        }
        onSave({
            type,
            person,
            amount: parseFloat(amount),
            dueDate: dueDate || undefined,
            description,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-md space-y-4">
                <h2 className="text-2xl font-bold">New Debt / Loan</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setType(DebtType.BORROWED)} className={`flex-1 p-2 rounded-md ${type === DebtType.BORROWED ? 'bg-danger' : 'bg-card'}`}>I Borrowed</button>
                        <button type="button" onClick={() => setType(DebtType.LENT)} className={`flex-1 p-2 rounded-md ${type === DebtType.LENT ? 'bg-success' : 'bg-card'}`}>I Lent</button>
                    </div>
                    <input type="text" placeholder="Person / Entity" value={person} onChange={e => setPerson(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" required />
                    <input type="number" placeholder="Amount ($)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" required />
                    <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" required />
                    <div>
                        <label htmlFor="dueDate" className="text-sm text-text-secondary">Due Date (Optional)</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 bg-background border border-card rounded-md" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-secondary rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DebtsView: React.FC = () => {
    const { appData, updateAppData } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { lent, borrowed } = useMemo(() => {
        const lent = appData?.debts.filter(d => d.type === DebtType.LENT) || [];
        const borrowed = appData?.debts.filter(d => d.type === DebtType.BORROWED) || [];
        return { lent, borrowed };
    }, [appData]);

    const handleSaveDebt = async (debt: Omit<Debt, 'id'>) => {
        if (!appData) return;
        const newDebt = { ...debt, id: new Date().toISOString() };
        await updateAppData({ ...appData, debts: [...appData.debts, newDebt] });
        setIsModalOpen(false);
    };

    const handleDeleteDebt = async (id: string) => {
        if (!appData || !window.confirm("Are you sure you want to delete this item?")) return;
        await updateAppData({ ...appData, debts: appData.debts.filter(d => d.id !== id) });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Debts & Loans</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary hover:bg-primary-focus rounded-md font-semibold">
                    Add Item
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DebtList title="Money I've Lent" debts={lent} onDelete={handleDeleteDebt} />
                <DebtList title="Money I've Borrowed" debts={borrowed} onDelete={handleDeleteDebt} />
            </div>

            {isModalOpen && <DebtForm onSave={handleSaveDebt} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

const DebtList: React.FC<{ title: string; debts: Debt[]; onDelete: (id: string) => void; }> = ({ title, debts, onDelete }) => (
    <div className="bg-surface p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <ul className="space-y-3">
            {debts.length > 0 ? debts.map(debt => (
                <li key={debt.id} className="p-3 bg-card rounded-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold">{debt.person}</p>
                            <p className="text-sm text-text-secondary">{debt.description}</p>
                            {debt.dueDate && <p className="text-xs text-warning mt-1">Due: {new Date(debt.dueDate).toLocaleDateString()}</p>}
                        </div>
                        <div className="text-right">
                           <p className={`font-semibold text-lg ${debt.type === DebtType.LENT ? 'text-success' : 'text-danger'}`}>
                               ${debt.amount.toFixed(2)}
                           </p>
                           <button onClick={() => onDelete(debt.id)} className="text-gray-500 hover:text-danger text-xs mt-1">
                               Delete
                           </button>
                        </div>
                    </div>
                </li>
            )) : (
                <p className="text-text-secondary text-center py-4">No items in this category.</p>
            )}
        </ul>
    </div>
);

export default DebtsView;