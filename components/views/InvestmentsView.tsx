
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Investment } from '../../types';
import { analyzeInvestment } from '../../services/geminiService';

const InvestmentsView: React.FC = () => {
    const { appData, updateAppData } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newInvestment, setNewInvestment] = useState<Omit<Investment, 'id'>>({
        name: '', country: '', sector: '', riskLevel: 'Medium', amount: 0, shariaComplianceNotes: ''
    });

    const handleAddInvestment = async () => {
        if (!appData || !newInvestment.name || newInvestment.amount <= 0) {
            alert("Please fill in all required fields.");
            return;
        }
        const updatedInvestments = [...appData.investments, { ...newInvestment, id: new Date().toISOString() }];
        await updateAppData({ ...appData, investments: updatedInvestments });
        setIsModalOpen(false);
        setNewInvestment({ name: '', country: '', sector: '', riskLevel: 'Medium', amount: 0, shariaComplianceNotes: '' });
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Investments</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary hover:bg-primary-focus rounded-md font-semibold">
                    Add Investment
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appData?.investments.map(inv => <InvestmentCard key={inv.id} investment={inv} />)}
            </div>
             {appData?.investments.length === 0 && <p className="text-text-secondary text-center py-10">You have not logged any investments yet.</p>}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-md space-y-4">
                        <h2 className="text-2xl font-bold">New Investment</h2>
                        <input type="text" placeholder="Investment Name (e.g., SPUS ETF)" value={newInvestment.name} onChange={e => setNewInvestment({...newInvestment, name: e.target.value})} className="w-full p-2 bg-background border border-card rounded-md" />
                        <input type="number" placeholder="Amount ($)" value={newInvestment.amount || ''} onChange={e => setNewInvestment({...newInvestment, amount: parseFloat(e.target.value)})} className="w-full p-2 bg-background border border-card rounded-md" />
                        <input type="text" placeholder="Country (e.g., Canada)" value={newInvestment.country} onChange={e => setNewInvestment({...newInvestment, country: e.target.value})} className="w-full p-2 bg-background border border-card rounded-md" />
                        <input type="text" placeholder="Sector (e.g., Technology)" value={newInvestment.sector} onChange={e => setNewInvestment({...newInvestment, sector: e.target.value})} className="w-full p-2 bg-background border border-card rounded-md" />
                        <select value={newInvestment.riskLevel} onChange={e => setNewInvestment({...newInvestment, riskLevel: e.target.value as Investment['riskLevel']})} className="w-full p-2 bg-background border border-card rounded-md">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                        <textarea placeholder="Notes on Sharia Compliance..." value={newInvestment.shariaComplianceNotes} onChange={e => setNewInvestment({...newInvestment, shariaComplianceNotes: e.target.value})} className="w-full p-2 bg-background border border-card rounded-md min-h-[100px]"></textarea>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary rounded-md">Cancel</button>
                            <button onClick={handleAddInvestment} className="px-4 py-2 bg-primary rounded-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InvestmentCard: React.FC<{ investment: Investment }> = ({ investment }) => {
    const { appData } = useApp();
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAnalyze = async () => {
        if (!appData) return;
        setIsLoading(true);
        const result = await analyzeInvestment(investment, appData);
        setAnalysis(result);
        setIsLoading(false);
    };

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg flex flex-col">
            <div className="flex-1">
                <h3 className="text-xl font-bold text-text-primary">{investment.name}</h3>
                <p className="text-text-secondary text-sm">{investment.sector} - {investment.country}</p>
                <p className="text-2xl font-semibold my-4">${investment.amount.toLocaleString()}</p>
                <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Risk Level</span>
                    <span className={`font-semibold px-2 py-1 rounded-full text-xs ${investment.riskLevel === 'Low' ? 'bg-success/20 text-success' : investment.riskLevel === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>{investment.riskLevel}</span>
                </div>
                <p className="text-xs text-text-secondary mt-4 italic">Notes: {investment.shariaComplianceNotes || 'N/A'}</p>
            </div>
            
            {analysis && (
                <div className="mt-4 p-4 bg-background rounded-md text-sm prose prose-invert max-w-none">
                    <h4 className="font-bold">Hadj's Analysis:</h4>
                    <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
                </div>
            )}

            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full mt-6 p-2 bg-accent/20 text-accent hover:bg-accent/30 rounded-md font-semibold text-sm disabled:opacity-50"
            >
                {isLoading ? 'Analyzing...' : "Analyze with Hadj AI"}
            </button>
        </div>
    );
};


export default InvestmentsView;
