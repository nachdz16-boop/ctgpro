import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaLock, FaEnvelope, FaShieldAlt, FaStore } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const { login, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.identifier || !formData.password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      setLoading(false);
      return;
    }

    const result = await login(formData.identifier, formData.password);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin' || result.user?.role === 'super_admin') {
        navigate('/admin');
        toast.success('✅ مرحباً بعودتك مدير!');
      } else {
        toast.error('⚠️ غير مصرح لك بالوصول إلى لوحة التحكم');
        logout();
      }
    } else {
      setError(result.error || 'بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-black">CTG<span className="text-primary">PRO</span></div>
              <div className="text-xs text-[var(--text-muted)] tracking-widest uppercase">لوحة التحكم</div>
            </div>
          </div>
          <h1 className="text-xl font-bold">تسجيل الدخول</h1>
          <p className="text-sm text-[var(--text-secondary)]">أدخل بياناتك للوصول إلى لوحة التحكم</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="form-input w-full pr-10"
                  placeholder="admin@ctgpro.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                كلمة المرور
              </label>
              <div className="relative">
                <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input w-full pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="loader-spinner inline-block w-4 h-4 border-2"></span>
                  جاري التحقق...
                </>
              ) : (
                <>
                  <FaLock className="text-sm" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-center text-[var(--text-secondary)]">
            <p>🔐 هذه الصفحة محمية، فقط المديرين يمكنهم الوصول</p>
            <p className="mt-1 text-[var(--text-muted)]">استخدم حساب admin@ctgpro.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;