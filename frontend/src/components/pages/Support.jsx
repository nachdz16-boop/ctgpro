import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FaCommentDots, FaEnvelope, FaWhatsapp, FaHeadset } from 'react-icons/fa';

const Support = () => {
  const { t } = useLanguage();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { text: 'مرحباً! كيف يمكنني مساعدتك؟', sender: 'support', time: new Date().toLocaleTimeString() },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { text: chatInput, sender: 'user', time: new Date().toLocaleTimeString() }]);
    setChatInput('');
    setTimeout(() => {
      const replies = ['شكراً لتواصلك! سأرد عليك خلال دقائق.', 'نعم، هذا المنتج متوفر الآن.', 'يمكنك إتمام الشراء مباشرة من خلال المتجر.'];
      setMessages(prev => [...prev, { text: replies[Math.floor(Math.random() * replies.length)], sender: 'support', time: new Date().toLocaleTimeString() }]);
    }, 1000);
  };

  return (
    <div className="page-transition max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">{t('nav.support')}</h1>
        <p className="text-[var(--text-secondary)]">{t('support.title')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center hover:border-primary transition-all hover:-translate-y-1">
          <FaCommentDots className="text-2xl text-primary mx-auto mb-2" />
          <h3 className="font-bold">{t('support.live_chat')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('support.chat_desc')}</p>
        </div>
        <div className="card text-center hover:border-primary transition-all hover:-translate-y-1">
          <FaEnvelope className="text-2xl text-primary mx-auto mb-2" />
          <h3 className="font-bold">{t('contact.email')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">support@ctgpro.com</p>
        </div>
        <div className="card text-center hover:border-primary transition-all hover:-translate-y-1">
          <FaWhatsapp className="text-2xl text-primary mx-auto mb-2" />
          <h3 className="font-bold">{t('contact.whatsapp')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">+213 55 123 4567</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4"><FaHeadset className="text-primary text-xl" /><h2 className="text-xl font-bold">{t('support.live_chat')}</h2></div>
        <div className="bg-[var(--bg-primary)] rounded-xl p-4 h-[300px] overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, index) => (
            <div key={index} className={`max-w-[75%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'self-end bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-none' : 'self-start bg-[var(--bg-input)] text-[var(--text-primary)] rounded-bl-none'}`}>
              {msg.text}
              <span className="block text-[10px] opacity-60 mt-1">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 form-input" placeholder="اكتب رسالتك..." />
          <button onClick={handleSendMessage} className="px-4 py-2 rounded-xl btn-primary text-white"><FaCommentDots /></button>
        </div>
      </div>
    </div>
  );
};

export default Support;