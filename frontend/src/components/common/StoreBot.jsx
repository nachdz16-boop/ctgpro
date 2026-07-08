import React, { useEffect, useMemo, useState } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';
import api from '../../services/api';

const StoreBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا مساعد المتجر الذكي. أستطيع مساعدتك في المنتجات والأسئلة الشائعة والدعم.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const storageKey = useMemo(() => 'ctgpro_storebot_session', []);

  useEffect(() => {
    const savedSession = localStorage.getItem(storageKey);
    if (savedSession) {
      setSessionId(savedSession);
    }
  }, [storageKey]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/store-bot/chat', { prompt: userMessage, sessionId });
      const botReply = response.data.message || 'لا توجد إجابة حالياً';
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
        localStorage.setItem(storageKey, response.data.sessionId);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: botReply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: error.response?.data?.message || 'حدث خطأ أثناء التواصل مع البوت' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-white shadow-lg shadow-primary/30 border border-white/10"
      >
        <FaRobot />
        <span className="text-sm font-semibold">مساعد المتجر</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FaRobot />
                </div>
                <div>
                  <h3 className="font-semibold">مساعد المتجر الذكي</h3>
                  <p className="text-xs text-[var(--text-secondary)]">متصل الآن</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <FaTimes />
              </button>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.role === 'user' ? 'bg-primary text-white' : 'bg-[var(--bg-input)] text-[var(--text-primary)]'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-secondary)]">يكتب...</div>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="border-t border-[var(--border-color)] p-4">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب سؤالك عن المنتجات أو الطلب..."
                  className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button type="submit" className="rounded-xl bg-primary p-3 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreBot;
