import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaAd, FaPlus, FaEdit, FaTrash, FaEye, FaSync,
  FaToggleOn, FaToggleOff, FaSave, FaTimes, FaSearch,
  FaFilter, FaClock, FaCheckCircle, FaExclamationCircle,
  FaChartLine, FaDollarSign, FaBullseye,
  FaUsers, FaEye as FaEyeIcon, FaMousePointer, FaCalendar,
  FaImage, FaVideo, FaLink, FaCode, FaMobile,
  FaDesktop, FaTablet, FaGlobe, FaBan, FaPlay
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const AdsBotManagement = () => {
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'banner',
    platform: 'website',
    position: 'top',
    imageUrl: '',
    videoUrl: '',
    linkUrl: '',
    targetUrl: '',
    budget: 100,
    dailyBudget: 20,
    startDate: '',
    endDate: '',
    targetAudience: {
      ageRange: [18, 65],
      locations: [],
      interests: [],
      devices: ['all']
    },
    isActive: true,
    status: 'pending',
    priority: 'normal'
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAds();
      fetchCampaigns();
    }
  }, [user]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/ads');
      setAds(response.data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('حدث خطأ في جلب الإعلانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/admin/ads/campaigns');
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAd) {
        await api.put(`/admin/ads/${selectedAd._id}`, formData);
        toast.success('تم تحديث الإعلان بنجاح');
      } else {
        await api.post('/admin/ads', formData);
        toast.success('تم إنشاء الإعلان بنجاح');
      }
      fetchAds();
      closeModal();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('حدث خطأ في حفظ الإعلان');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    try {
      await api.delete(`/admin/ads/${id}`);
      toast.success('تم حذف الإعلان بنجاح');
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('حدث خطأ في حذف الإعلان');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/ads/${id}/toggle`, { isActive: !currentStatus });
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} الإعلان بنجاح`);
      fetchAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
      toast.error('حدث خطأ في تغيير حالة الإعلان');
    }
  };

  const updateStats = async (id, action) => {
    try {
      await api.post(`/admin/ads/${id}/stats`, { action });
      fetchAds();
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const openModal = (ad = null) => {
    if (ad) {
      setSelectedAd(ad);
      setFormData({
        name: ad.name,
        description: ad.description || '',
        type: ad.type || 'banner',
        platform: ad.platform || 'website',
        position: ad.position || 'top',
        imageUrl: ad.imageUrl || '',
        videoUrl: ad.videoUrl || '',
        linkUrl: ad.linkUrl || '',
        targetUrl: ad.targetUrl || '',
        budget: ad.budget || 100,
        dailyBudget: ad.dailyBudget || 20,
        startDate: ad.startDate || '',
        endDate: ad.endDate || '',
        targetAudience: ad.targetAudience || { ageRange: [18, 65], locations: [], interests: [], devices: ['all'] },
        isActive: ad.isActive,
        status: ad.status || 'pending',
        priority: ad.priority || 'normal'
      });
    } else {
      setSelectedAd(null);
      setFormData({
        name: '',
        description: '',
        type: 'banner',
        platform: 'website',
        position: 'top',
        imageUrl: '',
        videoUrl: '',
        linkUrl: '',
        targetUrl: '',
        budget: 100,
        dailyBudget: 20,
        startDate: '',
        endDate: '',
        targetAudience: { ageRange: [18, 65], locations: [], interests: [], devices: ['all'] },
        isActive: true,
        status: 'pending',
        priority: 'normal'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && ad.isActive) ||
                         (filterStatus === 'inactive' && !ad.isActive) ||
                         (filterStatus === 'pending' && ad.status === 'pending') ||
                         (filterStatus === 'approved' && ad.status === 'approved') ||
                         (filterStatus === 'rejected' && ad.status === 'rejected');
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: ads.length,
    active: ads.filter(a => a.isActive).length,
    inactive: ads.filter(a => !a.isActive).length,
    pending: ads.filter(a => a.status === 'pending').length,
    approved: ads.filter(a => a.status === 'approved').length,
    totalViews: ads.reduce((acc, a) => acc + (a.views || 0), 0),
    totalClicks: ads.reduce((acc, a) => acc + (a.clicks || 0), 0),
    totalSpent: ads.reduce((acc, a) => acc + (a.spent || 0), 0)
  };

  const adTypes = [
    { value: 'banner', label: 'بانر' },
    { value: 'video', label: 'فيديو' },
    { value: 'native', label: 'إعلان مدمج' },
    { value: 'popup', label: 'نافذة منبثقة' },
    { value: 'interstitial', label: 'إعلان بيني' }
  ];

  const platforms = [
    { value: 'website', label: 'الموقع' },
    { value: 'mobile', label: 'التطبيق' },
    { value: 'social', label: 'وسائل التواصل' },
    { value: 'search', label: 'محركات البحث' }
  ];

  const positions = [
    { value: 'top', label: 'أعلى' },
    { value: 'bottom', label: 'أسفل' },
    { value: 'sidebar', label: 'جانبي' },
    { value: 'popup', label: 'منبثق' },
    { value: 'interstitial', label: 'بيني' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'قيد المراجعة', color: 'bg-amber-500/20 text-amber-500' },
    { value: 'approved', label: 'موافق عليه', color: 'bg-emerald-500/20 text-emerald-500' },
    { value: 'rejected', label: 'مرفوض', color: 'bg-red-500/20 text-red-500' },
    { value: 'paused', label: 'موقف', color: 'bg-blue-500/20 text-blue-500' }
  ];

  const priorities = [
    { value: 'low', label: 'منخفضة' },
    { value: 'normal', label: 'عادية' },
    { value: 'high', label: 'عالية' },
    { value: 'urgent', label: 'عاجلة' }
  ];

  const deviceOptions = [
    { value: 'all', label: 'جميع الأجهزة' },
    { value: 'mobile', label: 'جوال' },
    { value: 'tablet', label: 'تابلت' },
    { value: 'desktop', label: 'كمبيوتر' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaAd className="text-primary text-3xl" />
            إدارة الإعلانات
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            إدارة حملات الإعلانات ومراقبة الأداء
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors font-semibold flex items-center gap-2"
          >
            <FaBullseye /> حملات
          </button>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <FaPlus /> إعلان جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaAd /></div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي الإعلانات</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-emerald-500 mb-1"><FaCheckCircle /></div>
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-[var(--text-secondary)]">نشطة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-amber-500 mb-1"><FaEyeIcon /></div>
          <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)]">مشاهدات</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaDollarSign /></div>
          <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
          <div className="text-xs text-[var(--text-secondary)]">المصاريف</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="بحث عن إعلان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشطة</option>
          <option value="inactive">غير نشطة</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">موافق عليها</option>
          <option value="rejected">مرفوضة</option>
        </select>
        <button
          onClick={fetchAds}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAds.map((ad) => (
          <div key={ad._id} className="card hover:border-primary/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-input)] flex-shrink-0">
                {ad.imageUrl ? (
                  <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" />
                ) : ad.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl">
                    <FaPlay />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--bg-input)] text-[var(--text-muted)]">
                    <FaAd className="text-2xl" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold truncate">{ad.name}</h4>
                  <button
                    onClick={() => toggleStatus(ad._id, ad.isActive)}
                    className={`text-base ${ad.isActive ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {ad.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{ad.description}</p>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {adTypes.find(t => t.value === ad.type)?.label || ad.type}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {platforms.find(p => p.value === ad.platform)?.label || ad.platform}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                    statusOptions.find(s => s.value === ad.status)?.color || 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {statusOptions.find(s => s.value === ad.status)?.label || ad.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">مشاهدات</div>
                <div className="text-sm font-semibold">{ad.views || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">نقرات</div>
                <div className="text-sm font-semibold">{ad.clicks || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">المصاريف</div>
                <div className="text-sm font-semibold text-primary">${(ad.spent || 0).toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => openModal(ad)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary text-sm flex items-center justify-center gap-2"
              >
                <FaEdit /> تعديل
              </button>
              <button
                onClick={() => window.open(ad.targetUrl || ad.linkUrl, '_blank')}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors text-emerald-500 text-sm flex items-center justify-center gap-2"
                disabled={!ad.targetUrl && !ad.linkUrl}
              >
                <FaLink /> زيارة
              </button>
              <button
                onClick={() => handleDelete(ad._id)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-500 text-sm flex items-center justify-center gap-2"
              >
                <FaTrash /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAds.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaAd className="text-6xl text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد إعلانات</h3>
          <p className="text-[var(--text-secondary)]">لم يتم العثور على أي إعلانات</p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaAd className="text-primary" />
                {selectedAd ? 'تعديل الإعلان' : 'إعلان جديد'}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">اسم الإعلان *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">النوع</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input w-full"
                  >
                    {adTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input w-full"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">المنصة</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="form-input w-full"
                  >
                    {platforms.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">الموقع</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="form-input w-full"
                  >
                    {positions.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input w-full"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">رابط الصورة</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="form-input w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="form-label">رابط الفيديو</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="form-input w-full"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">رابط الهدف</label>
                  <input
                    type="url"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="form-input w-full"
                    placeholder="https://example.com/landing"
                  />
                </div>
                <div>
                  <label className="form-label">الأولوية</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-input w-full"
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">الميزانية الإجمالية ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">الميزانية اليومية ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.dailyBudget}
                    onChange={(e) => setFormData({ ...formData, dailyBudget: parseFloat(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">تاريخ البدء</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">تاريخ الانتهاء</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">الأجهزة المستهدفة</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {deviceOptions.map(device => (
                    <label key={device.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.targetAudience.devices.includes(device.value)}
                        onChange={(e) => {
                          let devices = [...formData.targetAudience.devices];
                          if (e.target.checked) {
                            devices.push(device.value);
                          } else {
                            devices = devices.filter(d => d !== device.value);
                          }
                          setFormData({
                            ...formData,
                            targetAudience: { ...formData.targetAudience, devices }
                          });
                        }}
                        className="form-checkbox"
                      />
                      <span className="text-sm">{device.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-color)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="form-checkbox"
                  />
                  <span className="text-sm">مفعل</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  <FaSave /> {selectedAd ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaigns Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsCampaignModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaBullseye className="text-primary" />
                حملات الإعلانات
              </h3>
              <button onClick={() => setIsCampaignModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign._id} className="card">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-[var(--text-secondary)]">{campaign.description}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs text-[var(--text-secondary)]">
                              الميزانية: ${campaign.budget}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">
                              المصاريف: ${campaign.spent || 0}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">
                              إعلانات: {campaign.adCount || 0}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' :
                          campaign.status === 'paused' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {campaign.status === 'active' ? 'نشطة' :
                           campaign.status === 'paused' ? 'موقفة' : 'مكتملة'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-secondary)]">لا توجد حملات إعلانية</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsBotManagement;