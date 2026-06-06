'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, supabase } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { chatbotMessage } from '../../services/api';
import Icon from '../../components/Icon';

const AdvisorPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { locale, t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // 1. Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading]);

  // 2. Fetch Chat History on mount
  useEffect(() => {
    if (!user) return;
    const fetchChatHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data);
        } else if (error) {
          console.error("Error fetching chat logs:", error);
        }
      } catch (err) {
        console.error("Database connection exception:", err);
      }
    };
    fetchChatHistory();
  }, [user]);

  // 3. Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputText(text);
          sendMessageDirectly(text);
        }
      };

      recognitionRef.current = rec;
    }
  }, [user]);

  // 4. Auto scroll message box
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Stop TTS voice output
  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speaks response text out loud in the correct language voice
  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled) return;

    window.speechSynthesis.cancel();
    
    // Clean up text format (remove asterisks and markdown symbols)
    const cleanText = text.replace(/[\*\#\_\`\-\+]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set appropriate language voice properties
    if (locale === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (locale === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(locale));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  };

  // 5. Send Message Handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const msg = inputText;
    setInputText('');
    await sendMessageDirectly(msg);
  };

  const sendMessageDirectly = async (text) => {
    if (!text.trim() || loading) return;
    setLoading(true);

    // Optimistically add user message to list
    const userMsg = { id: Math.random().toString(), sender: 'user', text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await chatbotMessage(user.id, text);
      const botResponse = res.data.response;

      const botMsg = { id: Math.random().toString(), sender: 'bot', text: botResponse, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, botMsg]);

      // Speak response out loud
      speakText(botResponse);
    } catch (err) {
      console.error(err);
      const errorMsg = { 
        id: Math.random().toString(), 
        sender: 'bot', 
        text: 'Failed to sync with advisor engine. Please check your API keys or database connections.', 
        created_at: new Date().toISOString() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle voice speaking recording state
  const handleMicToggle = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Set language according to translation context
      if (locale === 'hi') {
        recognitionRef.current.lang = 'hi-IN';
      } else if (locale === 'mr') {
        recognitionRef.current.lang = 'mr-IN';
      } else {
        recognitionRef.current.lang = 'en-US';
      }
      recognitionRef.current.start();
    }
  };

  const prefillQuestions = [
    t('q1'),
    t('q2'),
    t('q3'),
    t('q4'),
    t('q5')
  ];

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Icon name="refresh-cw" className="w-12 h-12 text-primary animate-spin" />
        <span className="text-sm text-slate-500">Connecting AI Advisor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto h-[80vh] min-h-[500px]">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Icon name="message-square" className="text-primary w-8 h-8" /> {t('chatbot')}
          </h1>
          <p className="text-xs text-slate-500">Ask agronomic queries in English, Hindi, or Marathi.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button 
              onClick={handleStopSpeech} 
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-xs px-3 py-1.5 rounded-lg border border-rose-500/25 cursor-pointer transition-all"
            >
              <Icon name="x" className="w-3.5 h-3.5" /> Stop Speaking
            </button>
          )}
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)} 
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${voiceEnabled ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-200/20 border-slate-350 text-slate-400'}`}
          >
            <Icon name={voiceEnabled ? 'volume-2' : 'volume-x'} className="w-3.5 h-3.5" />
            {voiceEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
          </button>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 glass border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden flex flex-col relative bg-white/40 dark:bg-slate-950/40 shadow-xl">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto my-auto gap-4">
              <div className="bg-primary/10 p-4 rounded-full text-primary">
                <Icon name="bot" className="w-10 h-10 stroke-1" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Welcome to Agrovision Advisor</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  How can I help you today? You can select a quick question below, write your query, or click the microphone to speak.
                </p>
              </div>

              {/* Prefill Questions Grid */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {prefillQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessageDirectly(q)}
                    className="text-[10px] bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl transition-all text-slate-600 dark:text-slate-300 cursor-pointer font-semibold"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-slate-800 text-white'}`}>
                <Icon name={msg.sender === 'user' ? 'user' : 'bot'} className="w-4 h-4" />
              </div>
              
              {/* Message Bubble */}
              <div className="flex flex-col gap-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'glass border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-slate-300 rounded-tl-none bg-white dark:bg-slate-900'}`}>
                  {/* Process simple markdown like bold text and bullets */}
                  <span className="whitespace-pre-line">
                    {msg.text.split('\n').map((line, lidx) => {
                      // Process bullet lines
                      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                        const content = line.replace(/^[\*\-]\s*/, '');
                        return <li key={lidx} className="ml-4 list-disc">{content}</li>;
                      }
                      
                      // Process bold text tags
                      const parts = line.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <p key={lidx} className={lidx > 0 ? "mt-2" : ""}>
                          {parts.map((part, pidx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={pidx}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </span>
                </div>
                
                {/* Voice play trigger */}
                {msg.sender === 'bot' && (
                  <button 
                    onClick={() => speakText(msg.text)} 
                    className="self-start text-[10px] text-slate-400 hover:text-primary bg-transparent border-0 cursor-pointer flex items-center gap-1 mt-0.5"
                  >
                    <Icon name="volume-2" className="w-3 h-3" /> Speak Out Loud
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 text-white flex-shrink-0">
                <Icon name="bot" className="w-4 h-4" />
              </div>
              <div className="p-4 glass border border-slate-200/50 dark:border-slate-800/30 text-slate-400 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Listening soundwave animation overlay */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center gap-6"
            >
              <div className="flex items-center gap-1.5 h-16">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <span 
                    key={i} 
                    className="w-1 bg-primary rounded-full animate-pulse" 
                    style={{ 
                      height: `${Math.random() * 50 + 20}px`,
                      animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                      animationIterationCount: 'infinite'
                    }}
                  ></span>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Listening...</h3>
                <p className="text-xs text-slate-400 mt-1">Speak clearly in {locale === 'hi' ? 'Hindi' : locale === 'mr' ? 'Marathi' : 'English'}</p>
              </div>
              <button 
                onClick={handleMicToggle} 
                className="bg-rose-500 text-white font-bold p-4 rounded-full border-0 cursor-pointer shadow-lg hover:scale-105 transition-all"
              >
                <Icon name="x" className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3 bg-slate-100/30 dark:bg-slate-900/30">
          {speechSupported && (
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${isListening ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-900 text-primary hover:bg-slate-50'}`}
            >
              <Icon name="mic" className="w-5 h-5" />
            </button>
          )}
          
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t('chatbot_placeholder') || "Ask me anything about farming..."}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
          />

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-primary hover:bg-primary-dark text-white p-3 rounded-xl flex items-center justify-center border-0 cursor-pointer disabled:opacity-50 hover:scale-105 transition-all shadow-md"
          >
            <Icon name="send" className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdvisorPage;
