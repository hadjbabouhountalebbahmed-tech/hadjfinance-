
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NISSAB_GOLD_GRAMS, ZAKAT_PERCENTAGE } from '../../constants';
import { ZakatAssets } from '../../types';

const ZakatCalculator: React.FC = () => {
    const { appData, updateAppData } = useApp();
    const [assets, setAssets] = useState<ZakatAssets>({ cash: 0, goldInGrams: 0 });
    const [goldPrice, setGoldPrice] = useState(65);
    
    useEffect(() => {
        if (appData) {
            setAssets(appData.zakatAssets);
            setGoldPrice(appData.settings.goldPricePerGram);
        }
    }, [appData]);
    
    const nissabValue = useMemo(() => NISSAB_GOLD_GRAMS * goldPrice, [goldPrice]);
    const totalAssetValue = useMemo(() => assets.cash + (assets.goldInGrams * goldPrice), [assets, goldPrice]);
    const isZakatDue = useMemo(() => totalAssetValue >= nissabValue, [totalAssetValue, nissabValue]);
    const zakatAmount = useMemo(() => isZakatDue ? totalAssetValue * ZAKAT_PERCENTAGE : 0, [isZakatDue, totalAssetValue]);

    const handleAssetChange = (field: keyof ZakatAssets, value: string) => {
        const numValue = parseFloat(value) || 0;
        setAssets(prev => ({...prev, [field]: numValue}));
    };

    const handleGoldPriceChange = (value: string) => {
        setGoldPrice(parseFloat(value) || 0);
    };

    const handleSaveChanges = async () => {
        if (!appData) return;
        const newData = {
            ...appData,
            zakatAssets: assets,
            settings: { ...appData.settings, goldPricePerGram: goldPrice },
        };
        await updateAppData(newData);
        alert("Zakat data saved successfully!");
    };
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary">Zakat Calculator</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-surface p-6 rounded-lg shadow-lg space-y-6">
                    <h2 className="text-xl font-semibold">Your Assets</h2>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Cash & Savings ($)</label>
                        <input
                            type="number"
                            value={assets.cash}
                            onChange={(e) => handleAssetChange('cash', e.target.value)}
                            className="w-full p-2 bg-background border border-card rounded-md"
                            placeholder="e.g., 5000"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Gold (grams)</label>
                        <input
                            type="number"
                            value={assets.goldInGrams}
                            onChange={(e) => handleAssetChange('goldInGrams', e.target.value)}
                            className="w-full p-2 bg-background border border-card rounded-md"
                            placeholder="e.g., 100"
                        />
                    </div>
                    
                    <h2 className="text-xl font-semibold mt-4">Market Value</h2>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Price of Gold per Gram ($)</label>
                        <input
                            type="number"
                            value={goldPrice}
                            onChange={(e) => handleGoldPriceChange(e.target.value)}
                            className="w-full p-2 bg-background border border-card rounded-md"
                            placeholder="e.g., 65"
                        />
                        <p className="text-xs text-text-secondary mt-1">Check current market price for accuracy.</p>
                    </div>
                    <button
                        onClick={handleSaveChanges}
                        className="w-full mt-4 p-3 bg-primary hover:bg-primary-focus rounded-md font-semibold transition-colors"
                    >
                        Save Data
                    </button>
                </div>

                {/* Calculation Output Section */}
                <div className="bg-surface p-6 rounded-lg shadow-lg flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Zakat Calculation</h2>
                      <div className="space-y-4">
                          <InfoRow label="Total Asset Value" value={`$${totalAssetValue.toFixed(2)}`} />
                          <InfoRow label="Nissab Threshold" value={`$${nissabValue.toFixed(2)}`} />
                          <hr className="border-card my-4" />
                          <div className={`p-4 rounded-md ${isZakatDue ? 'bg-success/20' : 'bg-warning/20'}`}>
                              <p className={`font-bold text-lg ${isZakatDue ? 'text-success' : 'text-warning'}`}>
                                  {isZakatDue ? "Zakat is due" : "Zakat is not due"}
                              </p>
                              <p className="text-sm text-text-secondary">
                                  {isZakatDue ? "Your total assets are above the Nissab threshold." : "Your total assets are below the Nissab threshold."}
                              </p>
                          </div>
                      </div>
                    </div>
                    <div className="mt-8 text-center bg-primary/20 p-6 rounded-lg">
                        <p className="text-text-secondary uppercase text-sm">Amount of Zakat to be Paid</p>
                        <p className="text-4xl font-bold text-primary mt-2">${zakatAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold text-text-primary">{value}</span>
    </div>
);

export default ZakatCalculator;
