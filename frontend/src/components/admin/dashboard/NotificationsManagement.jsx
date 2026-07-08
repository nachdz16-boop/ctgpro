// src/components/admin/NotificationsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaBell, FaPlus, FaEdit, FaTrash, FaEye, FaSync,
  FaToggleOn, FaToggleOff, FaSave, FaTimes, FaSearch,
  FaFilter, FaClock, FaCheckCircle, FaExclamationCircle,
  FaUser, FaUsers, FaEnvelope, FaMobile, FaGlobe,
  FaBullhorn, FaMailBulk, FaSms, FaPaperPlane,
  FaTelegram, FaWhatsapp, FaFacebook, FaTwitter,
  FaCalendar, FaTag, FaHistory, FaChartLine
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const NotificationsManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    channels: ['push', 'email'],
    targetUsers: 'all',
    specificUsers: [],
    roles: [],
    scheduledDate: '',
    isActive: true,
    priority: 'normal'
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchNotifications();
      fetchTemplates();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/notifications');
      const normalizedNotifications = (response.data?.notifications || []).map((notification) => ({
        _id: notification._id,
        title: notification.title?.ar || notification.title?.en || notification.title || 'إشعار',
        message: notification.message?.ar || notification.message?.en || notification.message || '',
        type: notification.type || 'system',
        channels: ['push'],
        targetUsers: notification.userId ? 'specific' : 'all',
        specificUsers: notification.userId ? [notification.userId] : [],
        roles: [],
        isActive: !notification.isRead,
        priority: notification.type === 'error' ? 'urgent' : notification.type === 'warning' ? 'high' : 'normal',
        sent: true,
        sentAt: notification.createdAt,
        scheduledDate: null,
        userId: notification.userId,
        createdAt: notification.createdAt,
      }));
      setNotifications(normalizedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('حدث خطأ في جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/admin/notifications');
      const recentNotifications = response.data?.notifications || [];
      setTemplates(recentNotifications.slice(0, 4).map((notification, index) => ({
        _id: notification._id || index + 1,
        name: notification.type || `قالب ${index + 1}`,
        subject: notification.title?.ar || notification.title?.en || notification.title || '',
        body: notification.message?.ar || notification.message?.en || notification.message || '',
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetUsers: formData.targetUsers,
        specificUsers: formData.specificUsers,
        roles: formData.roles,
        priority: formData.priority,
        icon: '',
        link: '',
      };

      if (selectedNotification?.userId) {
        payload.userId = selectedNotification.userId;
      }

      if (selectedNotification) {
        await api.put(`/admin/notifications/${selectedNotification._id}`, payload);
      } else {
        await api.post('/admin/notifications', payload);
      }
      await fetchNotifications();
      toast.success(selectedNotification ? 'تم تحديث الإشعار بنجاح' : 'تم إنشاء الإشعار بنجاح');
      closeModal();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error('حدث خطأ في حفظ الإشعار');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('تم حذف الإشعار بنجاح');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('حدث خطأ في حذف الإشعار');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setNotifications(notifications.map(n => 
      n._id === id ? { ...n, isActive: !currentStatus } : n
    ));
    toast.success(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} الإشعار بنجاح`);
  };

  const sendNow = async (id) => {
    setSending(true);
    try {
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, sent: true, sentAt: new Date().toISOString() } : n
      ));
      toast.success('تم إرسال الإشعار بنجاح');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('حدث خطأ في إرسال الإشعار');
    } finally {
      setSending(false);
    }
  };

  const openModal = (notification = null) => {
    if (notification) {
      setSelectedNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        channels: notification.channels || ['push', 'email'],
        targetUsers: notification.targetUsers || 'all',
        specificUsers: notification.specificUsers || [],
        roles: notification.roles || [],
        scheduledDate: notification.scheduledDate || '',
        isActive: notification.isActive,
        priority: notification.priority || 'normal'
      });
    } else {
      setSelectedNotification(null);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        channels: ['push', 'email'],
        targetUsers: 'all',
        specificUsers: [],
        roles: [],
        scheduledDate: '',
        isActive: true,
        priority: 'normal'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'sent' && notification.sent) ||
                         (filterStatus === 'pending' && !notification.sent && notification.isActive) ||
                         (filterStatus === 'draft' && !notification.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: notifications.length,
    active: notifications.filter(n => n.isActive).length,
    sent: notifications.filter(n => n.sent).length,
    pending: notifications.filter(n => !n.sent && n.isActive).length,
    draft: notifications.filter(n => !n.isActive).length
  };

  const notificationTypes = [
    { value: 'info', label: 'معلومات', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { value: 'success', label: 'نجاح', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { value: 'warning', label: 'تحذير', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { value: 'error', label: 'خطأ', color: 'text-red-500', bg: 'bg-red-500/10' },
    { value: 'promotion', label: 'ترويج', color: 'text-primary', bg: 'bg-primary/10' }
  ];

  const channels = [
    { value: 'push', label: 'إشعار تطبيق', icon: <FaMobile /> },
    { value: 'email', label: 'بريد إلكتروني', icon: <FaEnvelope /> },
    { value: 'sms', label: 'رسالة نصية', icon: <FaSms /> },
    { value: 'telegram', label: 'تيليجرام', icon: <FaTelegram /> },
    { value: 'whatsapp', label: 'واتساب', icon: <FaWhatsapp /> }
  ];

  const priorities = [
    { value: 'low', label: 'منخفضة', color: 'text-blue-500' },
    { value: 'normal', label: 'عادية', color: 'text-emerald-500' },
    { value: 'high', label: 'عالية', color: 'text-amber-500' },
    { value: 'urgent', label: 'عاجلة', color: 'text-red-500' }
  ];

  const targetOptions = [
    { value: 'all', label: 'جميع المستخدمين' },
    { value: 'specific', label: 'مستخدمين محددين' },
    { value: 'roles', label: 'أدوار محددة' }
  ];

  const roleOptions = [
    { value: 'admin', label: 'مدير' },
    { value: 'seller', label: 'بائع' },
    { value: 'user', label: 'مستخدم' }
  ];

  const getTypeStyle = (type) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.value === priority)?.color || 'text-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaBell className="text-primary text-3xl" />
            إدارة الإشعارات
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            إدارة وإرسال الإشعارات للمستخدمين عبر قنوات متعددة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors font-semibold flex items-center gap-2"
          >
            <FaChartLine /> إحصائيات
          </button>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors font-semibold flex items-center gap-2"
          >
            <FaMailBulk /> قوالب
          </button>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <FaPlus /> إشعار جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaBell /></div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي الإشعارات</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-emerald-500 mb-1"><FaCheckCircle /></div>
          <div className="text-2xl font-bold">{stats.sent}</div>
          <div className="text-xs text-[var(--text-secondary)]">مرسلة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-amber-500 mb-1"><FaClock /></div>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <div className="text-xs text-[var(--text-secondary)]">معلقة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-blue-500 mb-1"><FaUsers /></div>
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-[var(--text-secondary)]">نشطة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-gray-500 mb-1"><FaEdit /></div>
          <div className="text-2xl font-bold">{stats.draft}</div>
          <div className="text-xs text-[var(--text-secondary)]">مسودات</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="بحث عن إشعار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">جميع الأنواع</option>
          {notificationTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">جميع الحالات</option>
          <option value="sent">مرسلة</option>
          <option value="pending">معلقة</option>
          <option value="draft">مسودات</option>
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterType('all');
            setFilterStatus('all');
            toast.success('تم إعادة ضبط الفلاتر');
          }}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaTimes /> إعادة ضبط
        </button>
        <button
          onClick={fetchNotifications}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const typeStyle = getTypeStyle(notification.type);
          const priorityColor = getPriorityColor(notification.priority);
          return (
            <div key={notification._id} className="card hover:border-primary/30 transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${typeStyle.bg} ${typeStyle.color}`}>
                  {notification.type === 'info' ? <FaBell /> :
                   notification.type === 'success' ? <FaCheckCircle /> :
                   notification.type === 'warning' ? <FaExclamationCircle /> :
                   notification.type === 'error' ? <FaExclamationCircle /> :
                   <FaBullhorn />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor} bg-opacity-10`}>
                      {priorities.find(p => p.value === notification.priority)?.label || 'عادي'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyle.color} ${typeStyle.bg}`}>
                      {typeStyle.label}
                    </span>
                    {notification.sent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                        <FaCheckCircle className="inline ml-1 text-[10px]" /> مرسل
                      </span>
                    )}
                    {notification.scheduledDate && !notification.sent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                        <FaClock className="inline ml-1 text-[10px]" /> مجدول
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{notification.message}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {notification.channels?.map(channel => (
                      <span key={channel} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-secondary)] flex items-center gap-1">
                        {channels.find(c => c.value === channel)?.icon}
                        {channels.find(c => c.value === channel)?.label || channel}
                      </span>
                    ))}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-secondary)]">
                      {notification.targetUsers === 'all' ? 'جميع المستخدمين' :
                       notification.targetUsers === 'specific' ? 'مستخدمين محددين' :
                       'أدوار محددة'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => toggleStatus(notification._id, notification.isActive)}
                    className={`text-lg ${notification.isActive ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {notification.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <div className="flex items-center gap-1">
                    {!notification.sent && notification.isActive && (
                      <button
                        onClick={() => sendNow(notification._id)}
                        disabled={sending}
                        className="w-8 h-8 rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center justify-center text-emerald-500 disabled:opacity-50"
                        title="إرسال الآن"
                      >
                        <FaPaperPlane className="text-xs" />
                      </button>
                    )}
                    <button
                      onClick={() => openModal(notification)}
                      className="w-8 h-8 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center text-primary"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                  {notification.scheduledDate && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      <FaClock className="inline ml-1" />
                      {new Date(notification.scheduledDate).toLocaleString('ar-DZ')}
                    </span>
                  )}
                  {notification.sentAt && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      <FaHistory className="inline ml-1" />
                      {new Date(notification.sentAt).toLocaleString('ar-DZ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaBell className="text-6xl text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد إشعارات</h3>
          <p className="text-[var(--text-secondary)]">لم يتم العثور على أي إشعارات</p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaBell className="text-primary" />
                {selectedNotification ? 'تعديل الإشعار' : 'إشعار جديد'}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">العنوان *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input w-full"
                  required
                />
              </div>

              <div>
                <label className="form-label">الرسالة *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-input w-full"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">النوع</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input w-full"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
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

              <div>
                <label className="form-label">القنوات</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {channels.map(channel => (
                    <label key={channel.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(channel.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, channels: [...formData.channels, channel.value] });
                          } else {
                            setFormData({ ...formData, channels: formData.channels.filter(c => c !== channel.value) });
                          }
                        }}
                        className="form-checkbox"
                      />
                      <span className="text-sm flex items-center gap-1">
                        {channel.icon} {channel.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">المستهدفين</label>
                <select
                  value={formData.targetUsers}
                  onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                  className="form-input w-full mb-2"
                >
                  {targetOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {formData.targetUsers === 'specific' && (
                  <input
                    type="text"
                    placeholder="أدخل معرفات المستخدمين مفصولة بفواصل"
                    value={formData.specificUsers.join(', ')}
                    onChange={(e) => setFormData({ ...formData, specificUsers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="form-input w-full"
                  />
                )}

                {formData.targetUsers === 'roles' && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {roleOptions.map(role => (
                      <label key={role.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, roles: [...formData.roles, role.value] });
                            } else {
                              setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.value) });
                            }
                          }}
                          className="form-checkbox"
                        />
                        <span className="text-sm">{role.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">تاريخ الجدولة (اختياري)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="form-input w-full"
                />
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
                  <FaSave /> {selectedNotification ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsTemplateModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaMailBulk className="text-primary" />
                قوالب الإشعارات
              </h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div key={template._id} className="card hover:border-primary/30 transition-all">
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{template.subject}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-3">{template.body}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              title: template.subject || template.name,
                              message: template.body || template.message || ''
                            });
                            setIsTemplateModalOpen(false);
                            openModal();
                          }}
                          className="flex-1 px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                        >
                          استخدام القالب
                        </button>
                        <button
                          onClick={() => {
                            toast.info(`فتح نموذج تعديل القالب ${template.name}`);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] text-sm hover:bg-[var(--bg-input)]/70 transition-colors"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-secondary)]">لا توجد قوالب متاحة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsStatsModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaChartLine className="text-primary" />
                إحصائيات الإشعارات
              </h3>
              <button onClick={() => setIsStatsModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-[var(--text-secondary)]">إجمالي</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-2xl font-bold text-emerald-500">{stats.sent}</div>
                  <div className="text-xs text-[var(--text-secondary)]">مرسلة</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
                  <div className="text-xs text-[var(--text-secondary)]">معلقة</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
                  <div className="text-xs text-[var(--text-secondary)]">مسودات</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">توزيع حسب النوع</h4>
                {notificationTypes.map(type => {
                  const count = notifications.filter(n => n.type === type.value).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={type.value}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={type.color}>{type.label}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${type.bg}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">توزيع حسب القنوات</h4>
                {channels.map(channel => {
                  const count = notifications.filter(n => n.channels?.includes(channel.value)).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={channel.value}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">{channel.icon} {channel.label}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;