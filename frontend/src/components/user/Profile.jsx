import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaAddressCard } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { t, language, setLanguage, currency, setCurrency } = useLanguage();
  const { setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'الجزائر',
    },
    preferences: {
      language: user?.preferences?.language || language || 'ar',
      currency: user?.preferences?.currency || currency || 'USD',
      theme: user?.preferences?.theme || 'dark',
      notifications: user?.preferences?.notifications ?? true,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      const updatedUser = res.data.user;
      updateUser(updatedUser);
      if (updatedUser.preferences?.language) {
        setLanguage(updatedUser.preferences.language);
      }
      if (updatedUser.preferences?.currency) {
        setCurrency(updatedUser.preferences.currency);
      }
      if (updatedUser.preferences?.theme) {
        setTheme(updatedUser.preferences.theme);
      }
      toast.success(t('profile.updated_success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('profile.save_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-secondary)]">يرجى تسجيل الدخول لعرض الملف الشخصي</p>
      </div>
    );
  }

  return (
    <div className="page-transition max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-3xl font-bold text-white">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-[var(--text-secondary)] text-sm">{user.email}</p>
            <p className="text-[var(--text-secondary)] text-sm">{t('profile.role')}: {user.role === 'admin' ? t('profile.role_admin') : user.role === 'seller' ? t('profile.role_seller') : t('profile.role_user')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><FaUser className="text-primary" /> {t('profile.personal_info')}</h3>

          <div>
            <label className="form-label">{t('profile.full_name')}</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input w-full" required />
          </div>

          <div>
            <label className="form-label">{t('profile.phone')}</label>
            <div className="relative">
              <FaPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input w-full pr-10" placeholder="05XXXXXXXX" />
            </div>
          </div>

          <div>
            <label className="form-label">{t('profile.email')}</label>
            <div className="relative">
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input type="email" value={user.email} className="form-input w-full pr-10 bg-[var(--bg-input)]" disabled />
            </div>
          </div>

          <h3 className="text-lg font-semibold flex items-center gap-2 pt-4"><FaAddressCard className="text-primary" /> {t('profile.address')}</h3>

          <div>
            <label className="form-label">{t('profile.street')}</label>
            <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="form-input w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('profile.city')}</label>
              <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="form-input w-full" />
            </div>
            <div>
              <label className="form-label">{t('profile.state')}</label>
              <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className="form-input w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('profile.zip_code')}</label>
              <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} className="form-input w-full" />
            </div>
            <div>
              <label className="form-label">{t('profile.country')}</label>
              <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="form-input w-full" placeholder="الجزائر" />
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-lg font-semibold mb-4">{t('profile.account_preferences')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">{t('profile.language')}</label>
                <select name="preferences.language" value={formData.preferences.language} onChange={handleChange} className="form-input w-full">
                  {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">{t('profile.currency')}</label>
                <select name="preferences.currency" value={formData.preferences.currency} onChange={handleChange} className="form-input w-full">
                  {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">{t('profile.theme')}</label>
                <select name="preferences.theme" value={formData.preferences.theme} onChange={handleChange} className="form-input w-full">
                  <option value="dark">الوضع الليلي</option>
                  <option value="light">الوضع النهاري</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="notifications"
                name="preferences.notifications"
                checked={formData.preferences.notifications}
                onChange={handleChange}
                className="form-checkbox h-4 w-4 text-primary"
              />
              <label htmlFor="notifications" className="text-sm text-[var(--text-secondary)]">
                {t('profile.notifications')}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50">
            <FaSave className="inline ml-2" /> {loading ? t('profile.saving') : t('profile.save_changes')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;