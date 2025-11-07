
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { chatWithHadj } from '../../services/geminiService';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const AiSpace: React.FC = () => {
    const { appData } = useApp();
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [history]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !appData || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: message };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        // This is a simplified history for the service call, a real app might send more context
        const geminiHistory = history.map(h => ({
            role: h.role,
            parts: [{text: h.text}]
        }));
        
        try {
            const responseText = await chatWithHadj(geminiHistory, message, appData);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Chat with Hadj</h1>
            <p className="text-text-secondary mb-6">Ask for personalized financial advice. Hadj has the context of your financial situation to help you better.</p>
            
            <div ref={chatContainerRef} className="flex-1 bg-surface p-6 rounded-lg overflow-y-auto space-y-6">
                {history.length === 0 && (
                    <div className="text-center text-text-secondary">
                        <p>Start the conversation!</p>
                        <p className="text-sm">e.g., "Am I saving enough?" or "Suggest some Halal investment ideas."</p>
                    </div>
                )}
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-card text-text-primary'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xl p-4 rounded-xl bg-card text-text-primary">
                           <div className="flex items-center space-x-2">
                               <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-6 flex gap-4">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 bg-card border border-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                />
                <button type="submit" className="px-6 py-3 bg-primary rounded-lg font-semibold hover:bg-primary-focus disabled:opacity-50" disabled={isLoading}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default AiSpace;
