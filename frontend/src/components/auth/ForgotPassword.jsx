import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { FaEnvelope, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('📧 تم إرسال رابط الاستعادة إلى بريدك الإلكتروني');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto page-transition">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4"><FaEnvelope className="text-2xl text-emerald-500" /></div>
          <h2 className="text-xl font-bold mb-2">تم إرسال رابط الاستعادة</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-4">تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني <span className="text-primary font-medium">{email}</span></p>
          <Link to="/login" className="text-primary hover:text-primary-light transition-colors flex items-center justify-center gap-2"><FaArrowRight /> العودة إلى تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto page-transition">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3"><FaEnvelope className="text-2xl text-primary" /></div>
          <h2 className="text-2xl font-bold">{t('auth.forgot_password')}</h2>
          <p className="text-[var(--text-secondary)] text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{t('contact.email')}</label><div className="relative"><FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input w-full pr-10" placeholder={t('contact.email')} disabled={loading} required /></div></div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50">{loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}</button>
        </form>

        <div className="text-center mt-6"><Link to="/login" className="text-primary hover:text-primary-light transition-colors text-sm flex items-center justify-center gap-2"><FaArrowRight /> العودة إلى تسجيل الدخول</Link></div>
      </div>
    </div>
  );
};

export default ForgotPassword;