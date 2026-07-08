import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { FaPhone, FaEnvelope, FaWhatsapp, FaMapMarkerAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    subject: '', 
    message: '' 
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // محاكاة إرسال الرسالة
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSent(true);
      toast.success('✅ تم إرسال رسالتك، سنرد عليك قريباً');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      // إعادة تعيين حالة الإرسال بعد 5 ثواني
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold mb-2">تم إرسال رسالتك</h3>
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          شكراً لتواصلك معنا، سنرد عليك في أقرب وقت
        </p>
        <Link 
          to="/" 
          className="inline-block px-6 py-2.5 rounded-xl btn-primary text-white text-sm flex items-center gap-1.5 mx-auto"
        >
          <FaArrowLeft className="text-xs" /> العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="page-transition max-w-4xl mx-auto">
      {/* ===== رأس الصفحة ===== */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-[var(--text-secondary)] hover:text-primary transition-colors p-2 rounded-lg hover:bg-[var(--bg-input)]">
          <FaArrowLeft className="text-sm" />
        </Link>
        <h1 className="text-2xl font-bold">{t('contact.title') || 'اتصل بنا'}</h1>
      </div>

      <div className="text-center mb-8">
        <p className="text-[var(--text-secondary)]">{t('contact.desc') || 'نحن هنا لمساعدتك - تواصل معنا عبر أي من القنوات التالية'}</p>
      </div>

      {/* ===== معلومات الاتصال ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center hover:border-primary/50 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <FaPhone className="text-2xl text-primary" />
          </div>
          <h3 className="font-bold">{t('contact.phone') || 'الهاتف'}</h3>
          <p className="text-sm text-[var(--text-secondary)]">+213 55 123 4567</p>
          <p className="text-xs text-[var(--text-muted)]">متاح 24/7</p>
        </div>
        <div className="card text-center hover:border-primary/50 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <FaEnvelope className="text-2xl text-primary" />
          </div>
          <h3 className="font-bold">{t('contact.email') || 'البريد الإلكتروني'}</h3>
          <p className="text-sm text-[var(--text-secondary)]">support@ctgpro.com</p>
          <p className="text-xs text-[var(--text-muted)]">نرد خلال 24 ساعة</p>
        </div>
        <div className="card text-center hover:border-primary/50 transition-all hover:-translate-y-1">
          <div className="w-14 h-14 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <FaWhatsapp className="text-2xl text-primary" />
          </div>
          <h3 className="font-bold">{t('contact.whatsapp') || 'واتساب'}</h3>
          <p className="text-sm text-[var(--text-secondary)]">+213 55 123 4567</p>
          <p className="text-xs text-[var(--text-muted)]">رد فوري</p>
        </div>
      </div>

      {/* ===== نموذج الاتصال ===== */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-center">{t('contact.send_message') || 'أرسل لنا رسالة'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('auth.full_name') || 'الاسم الكامل'}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="أدخل اسمك الكامل"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">{t('contact.email') || 'البريد الإلكتروني'}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="أدخل بريدك الإلكتروني"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="form-label">الموضوع</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="form-input w-full"
              placeholder="أدخل موضوع رسالتك"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">{t('contact.message') || 'الرسالة'}</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="form-input w-full resize-none"
              placeholder="اكتب رسالتك هنا..."
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="loader-spinner inline-block w-4 h-4 border-2"></span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <FaCheck className="text-sm" />
                {t('contact.send') || 'إرسال'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;