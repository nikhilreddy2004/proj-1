import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hello! My name is Sahay. How can I help you learn about our NGO today?" }] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Prepare history for the API
        const history = messages.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(part => ({ text: part.text })),
        }));

        try {
            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: history
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const botMessage = { role: 'model', parts: [{ text: data.reply }] };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Failed to get chat reply:", error);
            const errorMessage = { role: 'model', parts: [{ text: "I'm sorry, I'm having trouble connecting. Please try again later." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h2>Chat with Sahay</h2>
                        <button onClick={toggleChat} className="close-btn">&times;</button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                <p>{msg.parts[0].text}</p>
                            </div>
                        ))}
                        {isLoading && <div className="message model"><p>...</p></div>}
                    </div>
                    <form onSubmit={handleSendMessage} className="chat-input-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>Send</button>
                    </form>
                </div>
            )}
            <button onClick={toggleChat} className="chat-toggle-button">
                {isOpen ? 'Close' : 'Chat'}
            </button>
        </div>
    );
};

export default Chatbot; 