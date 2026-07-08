// src/components/admin/SocialManagement.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaWhatsapp,
  FaTelegram, FaDiscord, FaTiktok, FaSnapchat, FaLinkedin,
  FaSave, FaEdit, FaTrash, FaPlus, FaLink, FaShareAlt,
  FaCheck, FaTimes, FaSync, FaEye, FaClock
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const SocialManagement = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '', color: '' });
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/social-settings');
      const settings = response.data?.settings || {};
      setSettingsId(settings._id || null);
      setSocialLinks([
        { id: 'facebookUrl', name: 'فيسبوك', icon: <FaFacebook />, url: settings.facebookUrl || '', color: '#1877f2', active: Boolean(settings.facebookUrl), followers: 0 },
        { id: 'twitterUrl', name: 'تويتر', icon: <FaTwitter />, url: settings.twitterUrl || '', color: '#1da1f2', active: Boolean(settings.twitterUrl), followers: 0 },
        { id: 'instagramUrl', name: 'انستغرام', icon: <FaInstagram />, url: settings.instagramUrl || '', color: '#e4405f', active: Boolean(settings.instagramUrl), followers: 0 },
        { id: 'youtubeUrl', name: 'يوتيوب', icon: <FaYoutube />, url: settings.youtubeUrl || '', color: '#ff0000', active: Boolean(settings.youtubeUrl), followers: 0 },
        { id: 'discordUrl', name: 'ديسكورد', icon: <FaDiscord />, url: settings.discordUrl || '', color: '#5865f2', active: Boolean(settings.discordUrl), followers: 0 },
        { id: 'telegramUrl', name: 'تيليجرام', icon: <FaTelegram />, url: settings.telegramUrl || '', color: '#0088cc', active: Boolean(settings.telegramUrl), followers: 0 },
        { id: 'tiktokUrl', name: 'تيك توك', icon: <FaTiktok />, url: settings.tiktokUrl || '', color: '#000000', active: Boolean(settings.tiktokUrl), followers: 0 },
        { id: 'linkedinUrl', name: 'لينكد إن', icon: <FaLinkedin />, url: settings.linkedinUrl || '', color: '#0a66c2', active: Boolean(settings.linkedinUrl), followers: 0 },
      ]);
    } catch (error) {
      console.error('Error loading social settings:', error);
      toast.error('حدث خطأ في جلب إعدادات التواصل');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (social) => {
    setEditingId(social.id);
    setFormData({ name: social.name, url: social.url, color: social.color });
  };

  const handleSave = () => {
    if (!formData.name || !formData.url) {
      toast.error('الرجاء إدخال اسم المنصة والرابط');
      return;
    }
    const nextLinks = socialLinks.map((item) => (item.id === editingId ? { ...item, ...formData } : item));
    setSocialLinks(nextLinks);
    persistSettings(nextLinks).then(() => {
      setEditingId(null);
      setFormData({ name: '', url: '', color: '' });
      toast.success('✅ تم تحديث المنصة بنجاح');
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', url: '', color: '' });
  };

  const toggleActive = (id) => {
    const nextLinks = socialLinks.map((item) => item.id === id ? { ...item, active: !item.active } : item);
    setSocialLinks(nextLinks);
    persistSettings(nextLinks);
    const item = socialLinks.find((s) => s.id === id);
    toast.success(`✅ تم ${item?.active ? 'تعطيل' : 'تفعيل'} ${item?.name} بنجاح`);
  };

  const handleDelete = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المنصة؟')) return;
    const nextLinks = socialLinks.filter((item) => item.id !== id);
    setSocialLinks(nextLinks);
    persistSettings(nextLinks);
    toast.success('✅ تم حذف المنصة بنجاح');
  };

  const addNewPlatform = () => {
    const newId = Math.max(...socialLinks.map(s => s.id)) + 1;
    const nextLinks = [
      ...socialLinks,
      { id: newId, name: 'منصة جديدة', icon: <FaLink />, url: '', color: '#00dc82', active: true, followers: 0 }
    ];
    setSocialLinks(nextLinks);
    persistSettings(nextLinks);
    handleEdit({ id: newId, name: 'منصة جديدة', url: '', color: '#00dc82' });
    toast.info('قم بتعديل بيانات المنصة الجديدة');
  };

  const persistSettings = async (links) => {
    const payload = links.reduce((accumulator, item) => {
      accumulator[item.id] = item.active && item.url ? item.url : '';
      return accumulator;
    }, {});

    try {
      await api.put('/admin/social-settings', payload);
    } catch (error) {
      console.error('Error saving social settings:', error);
    }
  };

  const refreshData = async () => {
    await fetchData();
    toast.success('تم تحديث البيانات بنجاح');
  };

  const getPlatformIcon = (name) => {
    const icons = {
      'فيسبوك': <FaFacebook />,
      'تويتر': <FaTwitter />,
      'انستغرام': <FaInstagram />,
      'يوتيوب': <FaYoutube />,
      'واتساب': <FaWhatsapp />,
      'تيليجرام': <FaTelegram />,
      'ديسكورد': <FaDiscord />,
      'تيك توك': <FaTiktok />,
      'سناب شات': <FaSnapchat />,
      'لينكد إن': <FaLinkedin />,
    };
    return icons[name] || <FaLink />;
  };

  const getPlatformColor = (name) => {
    const colors = {
      'فيسبوك': '#1877f2',
      'تويتر': '#1da1f2',
      'انستغرام': '#e4405f',
      'يوتيوب': '#ff0000',
      'واتساب': '#25d366',
      'تيليجرام': '#0088cc',
      'ديسكورد': '#5865f2',
      'تيك توك': '#000000',
      'سناب شات': '#fffc00',
      'لينكد إن': '#0a66c2',
    };
    return colors[name] || '#00dc82';
  };

  const displayedLinks = showInactive ? socialLinks : socialLinks.filter(s => s.active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">وسائل التواصل الاجتماعي</h2>
          <p className="text-sm text-[var(--text-secondary)]">إدارة روابط وسائل التواصل الاجتماعي</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={refreshData}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button 
            onClick={addNewPlatform}
            className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
          >
            <FaPlus /> إضافة منصة
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="form-checkbox"
          />
          عرض المنصات غير النشطة
        </label>
        <span className="text-xs text-[var(--text-secondary)]">
          ({socialLinks.filter(s => s.active).length} نشطة / {socialLinks.filter(s => !s.active).length} غير نشطة)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedLinks.map((social) => (
          <div key={social.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/30 transition-all">
            {editingId === social.id ? (
              <div className="space-y-3">
                <div>
                  <label className="form-label text-xs">اسم المنصة</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input w-full text-sm"
                    placeholder="اسم المنصة"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">الرابط</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="form-input w-full text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="form-label text-xs">اللون (hex)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-[var(--border-color)] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="form-input w-full text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <FaSave className="text-[10px]" /> حفظ
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <FaTimes className="text-[10px]" /> إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: `${social.color || getPlatformColor(social.name)}20`, color: social.color || getPlatformColor(social.name) }}
                  >
                    {social.icon || getPlatformIcon(social.name)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(social)}
                      className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-primary"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDelete(social.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-sm">{social.name}</h4>
                {social.url ? (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block truncate"
                  >
                    {social.url}
                  </a>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">لا يوجد رابط</span>
                )}
                {social.followers > 0 && (
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    <FaEye className="inline ml-1 text-[10px]" /> {social.followers.toLocaleString()} متابع
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    social.active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {social.active ? 'نشط' : 'غير نشط'}
                  </span>
                  <button
                    onClick={() => toggleActive(social.id)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      social.active
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {social.active ? 'تعطيل' : 'تفعيل'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {displayedLinks.length === 0 && (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <FaShareAlt className="text-3xl mx-auto mb-2 opacity-30" />
          <p>لا توجد منصات تواصل اجتماعي</p>
        </div>
      )}
    </div>
  );
};

export default SocialManagement;