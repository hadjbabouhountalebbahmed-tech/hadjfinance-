
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { STORAGE_KEY } from '../constants';

const LockScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, isLoading, error } = useApp();
  
  useEffect(() => {
    const hasData = !!localStorage.getItem(STORAGE_KEY);
    setIsRegistering(!hasData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }
      await register(password);
    } else {
      await login(password);
    }
  };

  const title = isRegistering ? "Set Your Master Password" : "Welcome Back";
  const subtitle = isRegistering 
    ? "Create a strong password to encrypt your financial data. This password is never stored and cannot be recovered." 
    : "Enter your password to decrypt your data.";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-lg shadow-lg">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h1 className="text-3xl font-bold text-text-primary mt-4">{title}</h1>
            <p className="text-text-secondary mt-2">{subtitle}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-secondary">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-text-primary bg-background border border-card rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {isRegistering && (
            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-text-secondary">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-text-primary bg-background border border-card rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isRegistering ? 'Create & Encrypt' : 'Unlock')}
          </button>
        </form>
         <div className="text-center">
            <p className="text-xs text-text-secondary mt-4">
                {!isRegistering && "Forgot your password? "} 
                <button onClick={() => isRegistering ? setIsRegistering(false) : alert('To reset, you must delete all data. Go to settings after logging in, or clear your browser data for this site.')} className="font-medium text-primary hover:underline">
                    {isRegistering ? "Already have an account?" : "Reset options"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
