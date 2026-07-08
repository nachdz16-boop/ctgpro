import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCheckCircle } from 'react-icons/fa';

const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true);
    setError('');
    const result = await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error || 'حدث خطأ');
  };

  return (
    <div className="max-w-sm mx-auto page-transition">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3"><FaUser className="text-2xl text-primary" /></div>
          <h2 className="text-2xl font-bold">{t('auth.register_title')}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{t('auth.register_desc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{t('auth.full_name')}</label><div className="relative"><FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input w-full pr-10" placeholder={t('auth.full_name')} disabled={loading} required /></div></div>
          <div><label className="block text-sm font-medium mb-1">{t('contact.email')}</label><div className="relative"><FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full pr-10" placeholder={t('contact.email')} disabled={loading} required /></div></div>
          <div><label className="block text-sm font-medium mb-1">{t('auth.phone')}</label><div className="relative"><FaPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input w-full pr-10" placeholder={t('auth.phone')} disabled={loading} /></div></div>
          <div><label className="block text-sm font-medium mb-1">{t('auth.password')}</label><div className="relative"><FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input w-full pr-10" placeholder={t('auth.password')} disabled={loading} required minLength="6" /></div></div>
          <div><label className="block text-sm font-medium mb-1">{t('auth.confirm_password')}</label><div className="relative"><FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input w-full pr-10" placeholder={t('auth.confirm_password')} disabled={loading} required minLength="6" /></div></div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50">{loading ? 'جاري إنشاء الحساب...' : t('nav.register')}</button>
        </form>

        <div className="text-center mt-6 text-sm text-[var(--text-secondary)]">{t('auth.have_account')} <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-medium">{t('nav.login')}</Link></div>
      </div>
    </div>
  );
};

export default Register;