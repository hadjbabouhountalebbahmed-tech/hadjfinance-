
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LockScreen from './components/LockScreen';
import MainApp from './components/MainApp';

const AppContainer: React.FC = () => {
    const { isAuthenticated } = useApp();

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            {isAuthenticated ? <MainApp /> : <LockScreen />}
        </div>
    );
};

const App: React.FC = () => (
    <AppProvider>
        <AppContainer />
    </AppProvider>
);

export default App;
