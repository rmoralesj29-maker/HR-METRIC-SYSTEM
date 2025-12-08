import React, { useState, useRef, useEffect } from 'react';
import { Employee } from '../types';
import { Sparkles, Send, X, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatEmployeeName } from '../utils/experience';

interface BirkirBotProps {
  employees: Employee[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const buildLocalReply = (employees: Employee[], question: string): string => {
  const total = employees.length;
  const raiseDue = employees.filter((e) => e.inRaiseWindow).map((e) => formatEmployeeName(e));
  const topPerformers = [...employees]
    .sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0))
    .slice(0, 3)
    .map((e) => `${formatEmployeeName(e)} (${e.performanceRating}/5)`);

  return [
    `You asked: **${question.trim()}**`,
    `Here is what I can share from live data:`,
    `• Total employees: **${total}**`,
    `• Raise window: ${raiseDue.length ? raiseDue.join(', ') : 'none at the moment'}`,
    `• Top performers: ${topPerformers.length ? topPerformers.join(', ') : 'no data yet'}`,
    `Ask about specific people (e.g. "When is ${employees[0]?.firstName || 'someone'}'s next raise?") and I'll reference the latest records.`,
  ].join('\n');
};

export const BirkirBot: React.FC<BirkirBotProps> = ({ employees }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi, I'm Birkir! I can help you analyze employee data, check raise status, and more. Ask me anything!" },
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
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    setTimeout(() => {
      const reply = buildLocalReply(employees, userMsg);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
      setLoading(false);
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50 ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <Sparkles size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-50 animate-fade-in-up">
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
            <p className="text-[10px] text-slate-400 mt-2 text-center">Responses generated locally from current dashboard data.</p>
          </div>
        </div>
      )}
    </>
  );
};
