
import React from 'react';
import { useApp } from '../../context/AppContext';

const Settings: React.FC = () => {
    const { appData, resetApp } = useApp();

    const handleExport = () => {
        if (!appData) {
            alert("No data to export.");
            return;
        }
        const dataStr = JSON.stringify(appData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hadj-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="bg-surface p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold">Data Management</h2>
                <p className="text-text-secondary mt-2 mb-6">You are in full control of your data. Export a copy for your records or reset the application to start fresh.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex-1 px-4 py-3 bg-primary hover:bg-primary-focus rounded-md font-semibold transition-colors"
                    >
                        Export Data (JSON)
                    </button>
                    <button 
                        onClick={resetApp}
                        className="flex-1 px-4 py-3 bg-danger hover:bg-red-500 rounded-md font-semibold transition-colors"
                    >
                        Reset Application
                    </button>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-lg border border-warning/50">
                <h2 className="text-xl font-semibold text-warning">Security Warning</h2>
                <p className="text-text-secondary mt-2">
                    Resetting the application will permanently delete all your encrypted data from this browser. This action cannot be undone.
                    Your master password is never stored and cannot be recovered. If you forget it, you will have to reset the application to use it again.
                </p>
            </div>
        </div>
    );
};

export default Settings;
