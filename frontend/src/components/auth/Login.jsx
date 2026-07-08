import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.identifier, formData.password);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error || 'حدث خطأ');
  };

  return (
    <div className="max-w-sm mx-auto page-transition">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3"><FaUser className="text-2xl text-primary" /></div>
          <h2 className="text-2xl font-bold">{t('auth.login_title')}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{t('auth.login_desc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{t('auth.email_or_phone')}</label><div className="relative"><FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" name="identifier" value={formData.identifier} onChange={handleChange} className="form-input w-full pr-10" placeholder={t('auth.email_or_phone')} disabled={loading} required /></div></div>
          <div><label className="block text-sm font-medium mb-1">{t('auth.password')}</label><div className="relative"><FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input w-full pr-10" placeholder={t('auth.password')} disabled={loading} required /></div></div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer"><input type="checkbox" className="accent-primary" /> {t('auth.remember_me')}</label>
            <Link to="/forgot-password" className="text-primary hover:text-primary-light transition-colors">{t('auth.forgot_password')}</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50">{loading ? 'جاري تسجيل الدخول...' : t('nav.login')}</button>
        </form>

        <div className="text-center mt-6 text-sm text-[var(--text-secondary)]">{t('auth.no_account')} <Link to="/register" className="text-primary hover:text-primary-light transition-colors font-medium">{t('nav.register')}</Link></div>
        <div className="mt-4 p-3 bg-primary/10 rounded-xl text-xs text-center text-[var(--text-secondary)]">🔑 حساب تجريبي: admin@ctgpro.com / admin123</div>
      </div>
    </div>
  );
};

export default Login;