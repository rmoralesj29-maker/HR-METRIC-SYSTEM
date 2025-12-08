import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CalculatedEmployeeStats } from '../types';
import { Sparkles, Send, X, MessageSquare, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BirkirBotProps {
  employees: CalculatedEmployeeStats[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const BirkirBot: React.FC<BirkirBotProps> = ({ employees }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi, I\'m Birkir! I can help you analyze employee data, check raise status, and more. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !process.env.API_KEY) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare context safely removing circular refs if any (none here)
      // Minimizing context to essential fields to save tokens if list is huge, but usually fine for <1000 employees
      const contextData = employees.map(e => ({
        name: e.name,
        role: e.role,
        age: e.age,
        tenureMonths: e.totalMonthsExperience,
        vrRate: e.vrRate,
        inRaiseWindow: e.inRaiseWindow,
        monthsToNextRaise: e.monthsUntilNextRate,
        country: e.country,
        languages: e.languages,
        gender: e.gender
      }));

      const systemInstruction = `
        You are Birkir, an HR AI assistant for the 'E.Track' system.
        You have access to the current employee dataset provided in JSON format below.
        
        Your capabilities:
        1. Answer questions about specific employees (e.g., "When is Alina's next raise?", "How old is Ben?").
        2. Provide aggregate statistics (e.g., "How many people speak Spanish?", "What is the gender ratio?").
        3. Analyze the "Raise Window". If 'inRaiseWindow' is true, they need a review immediately.
        4. Be helpful, professional, yet friendly.
        
        Data: ${JSON.stringify(contextData)}
      `;

      const model = ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Using powerful model for reasoning
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: { thinkingBudget: 1024 } // Enable thinking for better analysis
        },
        contents: userMsg
      });

      const response = await model;
      const text = response.text || "I'm having trouble thinking right now.";
      
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to my brain." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-50 animate-fade-in-up">
          {/* Header */}
          <div className="bg-indigo-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold">Birkir AI</h3>
                <p className="text-xs text-indigo-200">HR Analytics Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex gap-2 items-center">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about employees..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
             {!process.env.API_KEY && (
              <p className="text-[10px] text-red-500 mt-2 text-center">API Key missing in env.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
