import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader } from 'lucide-react';
import { chatbotAPI } from '../services/api';
import { useTranslation } from '../context/TranslationContext';

const ChatbotWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your Agrovision AI assistant. Ask me about soil NPK, crop selection, organic composting, drip irrigation, or leaf diseases!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "How to select crops?",
    "NPK fertilizer splits?",
    "Smart watering frequency?",
    "Treat leaf rust?"
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await chatbotAPI.sendMessage(text);
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I failed to fetch an answer. Please check connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all scale-100 hover:scale-110 duration-200 border border-primary/20"
          title="Open Agrovision Chatbot"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat window panel */}
      {isOpen && (
        <div className="glass w-[360px] h-[500px] rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col overflow-hidden text-left animate-fade-in">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-primary-dark/20">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="font-bold text-sm">Agrovision Assistant</h4>
                <span className="text-[10px] text-white/80">Active AI Agronomist</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-slate-500/5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] ${m.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white ${m.sender === 'user' ? 'bg-indigo-600' : 'bg-primary'}`}>
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 max-w-[85%] self-start">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader className="w-3.5 h-3.5 animate-spin" /> Drafting farming tips...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp)}
                  className="text-[10px] font-semibold bg-primary/10 text-primary-dark dark:text-primary-light hover:bg-primary hover:text-white px-2 py-1.5 rounded-lg border border-primary/10 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chatbot_placeholder')}
              className="flex-1 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-transparent dark:border-slate-800"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="bg-primary hover:bg-primary-dark text-white p-2.5 rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
