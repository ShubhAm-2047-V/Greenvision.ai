'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../context/TranslationContext';
import { chatbotMessage } from '../../services/api';
import Icon from '../../components/Icon';

const AdvisorPage = () => {
  const router = useRouter();
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

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', 'guest')
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Database connection exception:", err);
      }
    };
    fetchChatHistory();
  }, []);

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

      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputText(text);
          sendMessageDirectly(text);
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleStopSpeech = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\*\#\_\`\-\+]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (locale === 'hi') utterance.lang = 'hi-IN';
    else if (locale === 'mr') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(locale));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  };

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

    const userMsg = { id: Math.random().toString(), sender: 'user', text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await chatbotMessage('guest', text, locale);
      const botResponse = res.data.response;

      const botMsg = { id: Math.random().toString(), sender: 'bot', text: botResponse, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, botMsg]);
      speakText(botResponse);
    } catch (err) {
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

  const handleMicToggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (locale === 'hi') recognitionRef.current.lang = 'hi-IN';
      else if (locale === 'mr') recognitionRef.current.lang = 'mr-IN';
      else recognitionRef.current.lang = 'en-US';
      recognitionRef.current.start();
    }
  };

  const prefillQuestions = [t('q1'), t('q2'), t('q3'), t('q4'), t('q5')];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-dark)' }}>
            <Icon name="message-square" style={{ color: 'var(--primary)' }} /> {t('advisor_title')}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('advisor_desc')}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {isSpeaking && (
            <button onClick={handleStopSpeech} style={{ padding: '8px 12px', background: '#ffe4e6', color: '#e11d48', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              <Icon name="x" style={{ width: '16px', height: '16px' }} /> {t('advisor_btn_stop')}
            </button>
          )}
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="sk-button" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
            <Icon name={voiceEnabled ? 'volume-2' : 'volume-x'} style={{ width: '16px', height: '16px', color: voiceEnabled ? 'var(--primary)' : 'inherit' }} />
            {voiceEnabled ? t('advisor_btn_voice_on') : t('advisor_btn_voice_off')}
          </button>
        </div>
      </div>

      <div className="sk-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '400px' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                <Icon name="bot" style={{ width: '32px', height: '32px' }} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--primary-dark)' }}>{t('advisor_welcome')}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('advisor_welcome_desc')}</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {prefillQuestions.map((q, idx) => (
                  <button key={idx} onClick={() => sendMessageDirectly(q)} className="sk-button" style={{ fontSize: '12px', padding: '8px 12px' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '12px', maxWidth: '80%', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-color)', boxShadow: msg.sender === 'bot' ? 'var(--shadow-in)' : 'none', color: msg.sender === 'user' ? 'white' : 'var(--primary)' }}>
                <Icon name={msg.sender === 'user' ? 'user' : 'bot'} style={{ width: '16px', height: '16px' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ 
                  padding: '12px 16px', borderRadius: '16px', fontSize: '14px', lineHeight: 1.5,
                  background: msg.sender === 'user' ? 'var(--grad-primary)' : 'var(--bg-color)',
                  color: msg.sender === 'user' ? 'white' : 'inherit',
                  boxShadow: msg.sender === 'user' ? 'none' : 'var(--shadow-in)',
                  borderTopRightRadius: msg.sender === 'user' ? 0 : '16px',
                  borderTopLeftRadius: msg.sender === 'bot' ? 0 : '16px'
                }}>
                  {msg.text}
                </div>
                {msg.sender === 'bot' && (
                  <button onClick={() => speakText(msg.text)} style={{ alignSelf: 'flex-start', fontSize: '10px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="volume-2" style={{ width: '12px', height: '12px' }} /> {t('advisor_btn_speak')}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div style={{ alignSelf: 'flex-start', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '12px' }}>{t('advisor_thinking')}</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {isListening && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <h3 style={{ color: 'var(--primary-dark)' }}>{t('advisor_listening')}</h3>
            <button onClick={handleMicToggle} className="sk-button" style={{ background: '#e11d48', color: 'white', border: 'none', marginTop: '16px' }}>{t('advisor_btn_stop')}</button>
          </div>
        )}

        <form onSubmit={handleSend} style={{ padding: '16px', display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
          {speechSupported && (
            <button type="button" onClick={handleMicToggle} className="sk-card" style={{ padding: '12px', cursor: 'pointer', border: 'none', background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', color: 'var(--primary)' }}>
              <Icon name="mic" />
            </button>
          )}
          
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t('advisor_placeholder')}
            className="sk-card"
            style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 16px', background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)' }}
          />

          <button type="submit" disabled={loading || !inputText.trim()} className="sk-button-primary sk-button" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdvisorPage;
