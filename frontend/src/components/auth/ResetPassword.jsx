import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { FaLock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (!token) navigate('/login'); }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('كلمتا المرور غير متطابقتين'); return; }
    if (password.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('✅ تم تغيير كلمة المرور بنجاح');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-sm mx-auto page-transition">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4"><FaCheckCircle className="text-2xl text-emerald-500" /></div>
          <h2 className="text-xl font-bold mb-2">تم تغيير كلمة المرور</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-4">تم تغيير كلمة المرور بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول...</p>
          <Link to="/login" className="text-primary hover:text-primary-light transition-colors flex items-center justify-center gap-2"><FaArrowRight /> الذهاب إلى تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto page-transition">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3"><FaLock className="text-2xl text-primary" /></div>
          <h2 className="text-2xl font-bold">{t('auth.reset_password')}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{t('auth.reset_password_desc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{t('auth.password')}</label><div className="relative"><FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input w-full pr-10" placeholder={t('auth.password')} disabled={loading} required minLength="6" /></div></div>
          <div><label className="block text-sm font-medium mb-1">{t('auth.confirm_password')}</label><div className="relative"><FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input w-full pr-10" placeholder={t('auth.confirm_password')} disabled={loading} required minLength="6" /></div></div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50">{loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;