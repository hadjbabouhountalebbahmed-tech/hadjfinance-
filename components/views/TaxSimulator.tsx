import React, { useState } from 'react';

interface TaxResult {
    grossIncome: number;
    taxableIncome: number;
    federalTax: number;
    provincialTax: number;
    totalTax: number;
    netIncome: number;
    taxesPaid: number;
    balance: number; // Positive for refund, negative for owing
    taxSavingsFromCredits: number;
}

// Simplified 2023 tax constants for educational purposes
const FEDERAL_BPA = 15000; // Basic Personal Amount
const QC_BPA = 17183;
const OTHER_PROVINCE_BPA = 11445; // Simplified average for other provinces

const TaxSimulator: React.FC = () => {
    const [income, setIncome] = useState<number | ''>('');
    const [deductions, setDeductions] = useState<number | ''>('');
    const [taxesPaid, setTaxesPaid] = useState<number | ''>('');
    const [province, setProvince] = useState<'qc' | 'other'>('other');
    const [hasSpouse, setHasSpouse] = useState(false);
    const [spouseIncome, setSpouseIncome] = useState<number | ''>('');
    const [result, setResult] = useState<TaxResult | null>(null);

    const calculateProgressiveTax = (income: number, brackets: [number, number][]): number => {
        let totalTax = 0;
        let incomeRemaining = income;
        let previousBracketLimit = 0;
    
        for (const [limit, rate] of brackets) {
            if (incomeRemaining <= 0) break;
    
            const bracketSize = limit - previousBracketLimit;
            const taxableInThisBracket = Math.min(incomeRemaining, bracketSize);
            totalTax += taxableInThisBracket * rate;
            incomeRemaining -= taxableInThisBracket;
            previousBracketLimit = limit;
        }
        return totalTax;
    };

    const federalBrackets: [number, number][] = [
        [53359, 0.15], [106717, 0.205], [165430, 0.26], [235675, 0.29], [Infinity, 0.33]
    ];
    const provincialBrackets: { [key: string]: [number, number][] } = {
        other: [[49231, 0.0505], [98463, 0.0915], [150000, 0.1116], [220000, 0.1216], [Infinity, 0.1316]],
        qc: [[49275, 0.15], [98540, 0.20], [119910, 0.24], [Infinity, 0.2575]]
    };

    const handleCalculate = () => {
        const gross = Number(income);
        const ded = Number(deductions);
        const paid = Number(taxesPaid);
        if (gross <= 0) {
            alert("Veuillez entrer un revenu brut valide.");
            return;
        }
        const taxableIncome = Math.max(0, gross - ded);
        
        // Calculate credits
        let federalCreditBase = FEDERAL_BPA;
        const provincialBpa = province === 'qc' ? QC_BPA : OTHER_PROVINCE_BPA;
        let provincialCreditBase = provincialBpa;

        if (hasSpouse) {
            const spousalNetIncome = Math.max(0, Number(spouseIncome));
            if (spousalNetIncome < FEDERAL_BPA) {
                federalCreditBase += (FEDERAL_BPA - spousalNetIncome);
            }
            if (spousalNetIncome < provincialBpa) {
                 provincialCreditBase += (provincialBpa - spousalNetIncome);
            }
        }
        
        const federalTaxCreditValue = federalCreditBase * federalBrackets[0][1]; // Value is at the lowest tax rate
        const provincialTaxCreditValue = provincialCreditBase * provincialBrackets[province][0][1];

        const grossFederalTax = calculateProgressiveTax(taxableIncome, federalBrackets);
        const grossProvincialTax = calculateProgressiveTax(taxableIncome, provincialBrackets[province]);

        const federalTax = Math.max(0, grossFederalTax - federalTaxCreditValue);
        const provincialTax = Math.max(0, grossProvincialTax - provincialTaxCreditValue);
        
        const totalTax = federalTax + provincialTax;
        const netIncome = gross - totalTax;
        const balance = paid - totalTax;
        const totalGrossTax = grossFederalTax + grossProvincialTax;
        const taxSavingsFromCredits = totalGrossTax - totalTax;

        setResult({ grossIncome: gross, taxableIncome, federalTax, provincialTax, totalTax, netIncome, taxesPaid: paid, balance, taxSavingsFromCredits });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Simulateur d'Impôts (Canada/Québec)</h1>

            <div className="bg-surface p-6 rounded-lg shadow-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Revenu Annuel Brut ($)</label>
                        <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} className="w-full p-2 bg-background border border-card rounded-md" placeholder="ex: 75000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Déductions (REER, etc.) ($)</label>
                        <input type="number" value={deductions} onChange={e => setDeductions(Number(e.target.value))} className="w-full p-2 bg-background border border-card rounded-md" placeholder="ex: 5000" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Impôts déjà payés à la source ($)</label>
                        <input type="number" value={taxesPaid} onChange={e => setTaxesPaid(Number(e.target.value))} className="w-full p-2 bg-background border border-card rounded-md" placeholder="ex: 12000" />
                        <p className="text-xs text-text-secondary mt-1">Total déduit de vos fiches de paie.</p>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Province de résidence</label>
                    <select value={province} onChange={e => setProvince(e.target.value as 'qc' | 'other')} className="w-full p-2 bg-background border border-card rounded-md">
                        <option value="other">Canada (hors Québec)</option>
                        <option value="qc">Québec</option>
                    </select>
                </div>

                <div className="bg-card p-4 rounded-lg space-y-4">
                     <h3 className="font-semibold">Situation Familiale</h3>
                     <div className="flex items-start gap-3">
                        <input id="spouse-checkbox" type="checkbox" checked={hasSpouse} onChange={e => setHasSpouse(e.target.checked)} className="mt-1 h-4 w-4 rounded accent-primary" />
                        <label htmlFor="spouse-checkbox" className="text-sm font-medium text-text-secondary">Mon conjoint(e) a un faible revenu ou aucun revenu.</label>
                     </div>
                     {hasSpouse && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Revenu net du conjoint ($)</label>
                             <input type="number" value={spouseIncome} onChange={e => setSpouseIncome(Number(e.target.value))} className="w-full p-2 bg-background border border-card rounded-md" placeholder="ex: 4000" />
                        </div>
                     )}
                </div>

                <button onClick={handleCalculate} className="w-full mt-4 p-3 bg-primary hover:bg-primary-focus rounded-md font-semibold transition-colors">
                    Calculer l'estimation
                </button>
            </div>
            
            {result && (
                <div className="bg-surface p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Résultats Estimés</h2>
                    <div className="space-y-3">
                        <InfoRow label="Revenu Brut" value={result.grossIncome} />
                        <InfoRow label="Revenu Imposable" value={result.taxableIncome} />
                        <hr className="border-card" />
                        <InfoRow label="Économie d'impôt (Crédits personnel + conjoint)" value={result.taxSavingsFromCredits} color="text-accent" />
                        <hr className="border-card" />
                        <InfoRow label="Impôt Fédéral" value={result.federalTax} color="text-warning" />
                        <InfoRow label="Impôt Provincial" value={result.provincialTax} color="text-warning" />
                        <hr className="border-card" />
                        <InfoRow label="Total des Impôts Estimés" value={result.totalTax} color="text-danger" bold />
                        <InfoRow label="Impôts Déjà Payés" value={result.taxesPaid} />
                    </div>

                    <div className={`mt-6 p-6 rounded-lg text-center ${result.balance >= 0 ? 'bg-success/20' : 'bg-danger/20'}`}>
                        <p className="text-text-secondary uppercase text-sm">Votre position fiscale estimée</p>
                        <p className={`text-4xl font-bold mt-2 ${result.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            ${Math.abs(result.balance).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={`font-semibold mt-1 text-lg ${result.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            {result.balance >= 0 ? 'Refund' : 'Amount Owing'}
                        </p>
                         <p className="text-sm text-text-secondary mt-2">
                            {result.balance >= 0
                                ? "Vous avez payé plus d'impôts à la source que votre total estimé."
                                : "Les impôts retenus à la source étaient insuffisants pour couvrir votre total estimé."
                            }
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-card p-4 rounded-lg text-sm text-text-secondary">
                <p><span className="font-bold">Avertissement :</span> Ceci est un simulateur simplifié à des fins éducatives. Il ne tient pas compte de tous les crédits d'impôt (comme le montant pour conjoint qui est ici simplifié), déductions ou règles provinciales spécifiques. Consultez un professionnel pour des conseils fiscaux précis.</p>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ label: string; value: number; color?: string; bold?: boolean }> = ({ label, value, color, bold }) => (
    <div className="flex justify-between items-center">
        <span className="text-text-secondary">{label}</span>
        <span className={`${color || 'text-text-primary'} ${bold ? 'font-bold text-lg' : 'font-semibold'}`}>
            ${value.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    </div>
);

export default TaxSimulator;