import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../../context/LanguageContext';
import {
  FaStore, FaPlus, FaEdit, FaTrash, FaEye, FaSync,
  FaToggleOn, FaToggleOff, FaSave, FaTimes, FaSearch,
  FaFilter, FaClock, FaCheckCircle, FaExclamationCircle,
  FaShieldAlt, FaDatabase, FaServer, FaCloud, FaLock,
  FaUnlock, FaKey, FaQrcode, FaMobile, FaEnvelope,
  FaPhone, FaGlobe, FaMapMarker, FaImage, FaFile,
  FaFileImage, FaFilePdf, FaFileWord, FaFileExcel,
  FaFileArchive, FaUpload, FaDownload, FaFolder,
  FaFolderOpen, FaTrashAlt, FaChartLine, FaTachometerAlt,
  FaMicrochip, FaMemory, FaHdd, FaNetworkWired,
  FaUserSecret, FaWifi, FaSignal, FaBolt,
  FaBackward, FaForward, FaPlay, FaPause,
  FaPalette, FaThLarge, FaFileAlt, FaLayerGroup, FaPencilAlt, FaCopy
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const StoreManagement = () => {
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState(null);
  const [settings, setSettings] = useState({});
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [pages, setPages] = useState([]);
  const [homepageSections, setHomepageSections] = useState([]);
  const [pageForm, setPageForm] = useState({
    title: { ar: '', en: '' },
    content: { ar: '', en: '' },
    metaDescription: { ar: '', en: '' },
    metaKeywords: { ar: '', en: '' },
    published: true,
    featuredImage: ''
  });
  const [sectionForm, setSectionForm] = useState({
    sectionType: 'hero',
    title: { ar: '', en: '' },
    subtitle: { ar: '', en: '' },
    content: { ar: '', en: '' },
    imageUrl: '',
    ctaText: { ar: '', en: '' },
    ctaUrl: '',
    ctaColor: '#1d4ed8',
    order: 0,
    active: true
  });
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    logo: '',
    favicon: '',
    currency: 'USD',
    language: 'ar',
    timezone: 'Africa/Algiers',
    maintenance: false,
    maintenanceMessage: '',
    registrationEnabled: true,
    emailVerification: true,
    appearance: {
      theme: 'dark',
      productGridColumns: 4,
      cardStyle: 'standard',
      primaryColor: '#1d4ed8',
      pageLayout: 'default'
    },
    twoFactorAuth: {
      enabled: false,
      method: 'app',
      phoneNumber: '',
      backupCodes: []
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      ipWhitelist: [],
      ipBlacklist: []
    },
    database: {
      host: 'localhost',
      port: 27017,
      name: 'ctgpro',
      user: '',
      password: '',
      replicaSet: false,
      backupEnabled: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      retentionDays: 30,
      compressionEnabled: true
    },
    performance: {
      cacheEnabled: true,
      cacheDuration: 3600,
      compressionEnabled: true,
      lazyLoading: true,
      imageOptimization: true,
      minifyAssets: true,
      cdnEnabled: true,
      cdnUrl: '',
      dbPoolSize: 10,
      queryOptimization: true,
      indexingEnabled: true
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      telegram: '',
      whatsapp: '',
      facebookPixelId: '',
      tiktokPixelId: '',
      googleAnalyticsId: ''
    },
    payment: {
      methods: ['credit_card', 'paypal', 'crypto'],
      currency: 'USD',
      taxRate: 0.05,
      shippingCost: 5.00,
      freeShippingThreshold: 50
    }
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStoreData();
      fetchFiles();
      fetchLogs();
      fetchBackups();
      fetchPages();
      fetchHomepageSections();
    }
  }, [user]);

  const openModal = (tab = 'general') => {
    setSelectedTab(tab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/store');
      setStore(response.data.store);
      setSettings(response.data.settings || {});
      if (response.data.settings) {
        setFormData(prev => ({
          ...prev,
          ...response.data.settings,
          twoFactorAuth: response.data.settings.twoFactorAuth || prev.twoFactorAuth,
          security: response.data.settings.security || prev.security,
          database: response.data.settings.database || prev.database,
          performance: response.data.settings.performance || prev.performance
        }));
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('حدث خطأ في جلب بيانات المتجر');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await api.get('/admin/store/files');
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/store/logs');
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await api.get('/admin/store/backups');
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await api.get('/admin/pages');
      setPages(response.data.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('حدث خطأ في جلب الصفحات');
    }
  };

  const fetchHomepageSections = async () => {
    try {
      const response = await api.get('/admin/homepage-sections');
      setHomepageSections(response.data.sections || []);
    } catch (error) {
      console.error('Error fetching homepage sections:', error);
      toast.error('حدث خطأ في جلب أقسام الصفحة الرئيسية');
    }
  };

  const resetPageForm = () => {
    setPageForm({
      title: { ar: '', en: '' },
      content: { ar: '', en: '' },
      metaDescription: { ar: '', en: '' },
      metaKeywords: { ar: '', en: '' },
      published: true,
      featuredImage: ''
    });
    setEditingPageId(null);
  };

  const resetSectionForm = () => {
    setSectionForm({
      sectionType: 'hero',
      title: { ar: '', en: '' },
      subtitle: { ar: '', en: '' },
      content: { ar: '', en: '' },
      imageUrl: '',
      ctaText: { ar: '', en: '' },
      ctaUrl: '',
      ctaColor: '#1d4ed8',
      order: 0,
      active: true
    });
    setEditingSectionId(null);
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPageId) {
        await api.put(`/admin/pages/${editingPageId}`, pageForm);
        toast.success('تم تحديث الصفحة بنجاح');
      } else {
        await api.post('/admin/pages', pageForm);
        toast.success('تم إنشاء الصفحة بنجاح');
      }
      resetPageForm();
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('حدث خطأ في حفظ الصفحة');
    }
  };

  const handlePageEdit = (page) => {
    setEditingPageId(page._id);
    setPageForm({
      title: { ar: page.title?.ar || '', en: page.title?.en || '' },
      content: { ar: page.content?.ar || '', en: page.content?.en || '' },
      metaDescription: { ar: page.metaDescription?.ar || '', en: page.metaDescription?.en || '' },
      metaKeywords: { ar: page.metaKeywords?.ar || '', en: page.metaKeywords?.en || '' },
      published: page.published,
      featuredImage: page.featuredImage || ''
    });
  };

  const handlePageDelete = async (pageId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return;
    try {
      await api.delete(`/admin/pages/${pageId}`);
      toast.success('تم حذف الصفحة بنجاح');
      fetchPages();
      if (editingPageId === pageId) resetPageForm();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('حدث خطأ في حذف الصفحة');
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSectionId) {
        await api.put(`/admin/homepage-sections/${editingSectionId}`, sectionForm);
        toast.success('تم تحديث القسم بنجاح');
      } else {
        await api.post('/admin/homepage-sections', sectionForm);
        toast.success('تم إنشاء القسم بنجاح');
      }
      resetSectionForm();
      fetchHomepageSections();
    } catch (error) {
      console.error('Error saving homepage section:', error);
      toast.error('حدث خطأ في حفظ القسم');
    }
  };

  const handleSectionEdit = (section) => {
    setEditingSectionId(section._id);
    setSectionForm({
      sectionType: section.sectionType || 'hero',
      title: { ar: section.title?.ar || '', en: section.title?.en || '' },
      subtitle: { ar: section.subtitle?.ar || '', en: section.subtitle?.en || '' },
      content: { ar: section.content?.ar || '', en: section.content?.en || '' },
      imageUrl: section.imageUrl || '',
      ctaText: { ar: section.ctaText?.ar || '', en: section.ctaText?.en || '' },
      ctaUrl: section.ctaUrl || '',
      ctaColor: section.ctaColor || '#1d4ed8',
      order: section.order || 0,
      active: section.active !== false
    });
  };

  const handleSectionDelete = async (sectionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      await api.delete(`/admin/homepage-sections/${sectionId}`);
      toast.success('تم حذف القسم بنجاح');
      fetchHomepageSections();
      if (editingSectionId === sectionId) resetSectionForm();
    } catch (error) {
      console.error('Error deleting homepage section:', error);
      toast.error('حدث خطأ في حذف القسم');
    }
  };

  const handleSectionOrderChange = async (sectionId, direction) => {
    const current = homepageSections.find((section) => section._id === sectionId);
    if (!current) return;
    const nextOrder = direction === 'up' ? current.order - 1 : current.order + 1;
    try {
      await api.put(`/admin/homepage-sections/${sectionId}`, { ...current, order: nextOrder });
      fetchHomepageSections();
    } catch (error) {
      console.error('Error changing section order:', error);
      toast.error('حدث خطأ في تحديث ترتيب القسم');
    }
  };
  const getFileIconFor = (type) => {
    if (type?.includes('image')) return <FaFileImage />;
    if (type?.includes('pdf')) return <FaFilePdf />;
    if (type?.includes('word')) return <FaFileWord />;
    if (type?.includes('excel')) return <FaFileExcel />;
    if (type?.includes('zip') || type?.includes('rar')) return <FaFileArchive />;
    return <FaFile />;
  };

  const persistStoreSettings = async (payload, successMessage = 'تم تحديث إعدادات المتجر بنجاح') => {
    setSaving(true);
    try {
      const response = await api.put('/admin/store', payload);
      const nextSettings = response.data?.settings || response.data?.store || payload;
      setSettings(nextSettings);
      setFormData((prev) => ({ ...prev, ...payload, ...nextSettings }));
      toast.success(successMessage);
      await fetchStoreData();
      return true;
    } catch (error) {
      console.error('Error saving store settings:', error);
      toast.error('حدث خطأ في حفظ الإعدادات');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await persistStoreSettings(formData, 'تم حفظ الإعدادات بنجاح');
    closeModal();
  };

  const saveGeneralSettings = async () => {
    await persistStoreSettings({
      name: formData.name,
      description: formData.description,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      currency: formData.currency,
      language: formData.language,
      timezone: formData.timezone,
      maintenance: formData.maintenance,
      maintenanceMessage: formData.maintenanceMessage,
      registrationEnabled: formData.registrationEnabled,
      emailVerification: formData.emailVerification,
      appearance: formData.appearance,
      social: formData.social,
    }, 'تم تطبيق الإعدادات العامة بنجاح');
  };

  const saveSecuritySettings = async () => {
    await persistStoreSettings({ security: formData.security }, 'تم تطبيق إعدادات الأمان بنجاح');
  };

  const saveDatabaseSettings = async () => {
    await persistStoreSettings({ database: formData.database }, 'تم تطبيق إعدادات قاعدة البيانات بنجاح');
  };

  const savePerformanceSettings = async () => {
    await persistStoreSettings({ performance: formData.performance }, 'تم تطبيق إعدادات الأداء بنجاح');
  };

  const saveAppearanceSettings = async () => {
    await persistStoreSettings({ appearance: formData.appearance }, 'تم تطبيق إعدادات المظهر بنجاح');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم النسخ');
    } catch (error) {
      console.error('Error copying text:', error);
      toast.error('فشل النسخ');
    }
  };

  const handle2FAUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/store/2fa', formData.twoFactorAuth);
      toast.success('تم تحديث إعدادات المصادقة الثنائية بنجاح');
      fetchStoreData();
      setIs2FAModalOpen(false);
    } catch (error) {
      console.error('Error updating 2FA:', error);
      toast.error('حدث خطأ في تحديث المصادقة الثنائية');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);
    formDataFile.append('type', e.target.dataset.type || 'image');

    const loadingToast = toast.loading('جارٍ رفع الملف...');
    try {
      await api.post('/admin/store/files/upload', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.dismiss(loadingToast);
      toast.success('تم رفع الملف بنجاح');
      fetchFiles();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error uploading file:', error);
      toast.error('حدث خطأ في رفع الملف');
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    try {
      await api.delete(`/admin/store/files/${fileId}`);
      toast.success('تم حذف الملف بنجاح');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('حدث خطأ في حذف الملف');
    }
  };

  const handleBackupCreate = async () => {
    const loadingToast = toast.loading('جارٍ إنشاء النسخة الاحتياطية...');
    try {
      await api.post('/admin/store/backups');
      toast.dismiss(loadingToast);
      toast.success('تم إنشاء نسخة احتياطية بنجاح');
      fetchBackups();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error creating backup:', error);
      toast.error('حدث خطأ في إنشاء النسخة الاحتياطية');
    }
  };

  const handleBackupRestore = async (backupId) => {
    if (!window.confirm('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) return;
    const loadingToast = toast.loading('جارٍ استعادة النسخة الاحتياطية...');
    try {
      await api.post(`/admin/store/backups/${backupId}/restore`);
      toast.dismiss(loadingToast);
      toast.success('تم استعادة النسخة الاحتياطية بنجاح');
      fetchBackups();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error restoring backup:', error);
      toast.error('حدث خطأ في استعادة النسخة الاحتياطية');
    }
  };

  const handleBackupDelete = async (backupId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) return;
    try {
      await api.delete(`/admin/store/backups/${backupId}`);
      toast.success('تم حذف النسخة الاحتياطية بنجاح');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('حدث خطأ في حذف النسخة الاحتياطية');
    }
  };

  const downloadBackup = async (backupId) => {
    try {
      const response = await api.get(`/admin/store/backups/${backupId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backupId}.sql.gz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تحميل النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('حدث خطأ في تحميل النسخة الاحتياطية');
    }
  };


  const getFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: <FaStore /> },
    { id: 'appearance', label: 'المظهر', icon: <FaPalette /> },
    { id: 'pages', label: 'الصفحات', icon: <FaFileAlt /> },
    { id: 'sections', label: 'أقسام الصفحة الرئيسية', icon: <FaLayerGroup /> },
    { id: 'security', label: 'الأمان', icon: <FaShieldAlt /> },
    { id: '2fa', label: 'المصادقة الثنائية', icon: <FaQrcode /> },
    { id: 'database', label: 'قاعدة البيانات', icon: <FaDatabase /> },
    { id: 'performance', label: 'الأداء', icon: <FaChartLine /> },
    { id: 'files', label: 'الملفات', icon: <FaFolder /> },
    { id: 'logs', label: 'السجلات', icon: <FaServer /> },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: <FaCloud /> }
  ];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(files.length / itemsPerPage);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip?.includes(searchTerm);
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const logTypes = [
    { value: 'all', label: 'الكل' },
    { value: 'info', label: 'معلومات' },
    { value: 'warning', label: 'تحذير' },
    { value: 'error', label: 'خطأ' },
    { value: 'security', label: 'أمني' },
    { value: 'performance', label: 'أداء' },
    { value: 'database', label: 'قاعدة بيانات' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaStore className="text-primary text-3xl" />
            إدارة المتجر
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            إدارة إعدادات المتجر والأمان وقاعدة البيانات والأداء
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('general')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <FaEdit /> تعديل الإعدادات
          </button>
          <button
            onClick={fetchStoreData}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaStore /></div>
          <div className="text-xl font-bold">{store?.name || 'CTGPRO'}</div>
          <div className="text-xs text-[var(--text-secondary)]">اسم المتجر</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-emerald-500 mb-1"><FaShieldAlt /></div>
          <div className="text-xl font-bold">{formData.twoFactorAuth?.enabled ? 'مفعلة' : 'غير مفعلة'}</div>
          <div className="text-xs text-[var(--text-secondary)]">المصادقة الثنائية</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-amber-500 mb-1"><FaDatabase /></div>
          <div className="text-xl font-bold">{formData.database?.name || 'ctgpro'}</div>
          <div className="text-xs text-[var(--text-secondary)]">قاعدة البيانات</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaChartLine /></div>
          <div className="text-xl font-bold">{formData.performance?.cacheEnabled ? 'مفعل' : 'معطل'}</div>
          <div className="text-xs text-[var(--text-secondary)]">ذاكرة التخزين المؤقت</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-blue-500 mb-1"><FaServer /></div>
          <div className="text-xl font-bold">{backups.length}</div>
          <div className="text-xs text-[var(--text-secondary)]">النسخ الاحتياطية</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button onClick={() => setSelectedTab('pages')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-right hover:border-primary transition-colors">
          <div className="text-sm font-semibold">إدارة الصفحات</div>
          <div className="text-xs text-[var(--text-secondary)]">إنشاء وتعديل الصفحات</div>
        </button>
        <button onClick={() => setSelectedTab('sections')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-right hover:border-primary transition-colors">
          <div className="text-sm font-semibold">أقسام الصفحة</div>
          <div className="text-xs text-[var(--text-secondary)]">تنظيم المحتوى الرئيسي</div>
        </button>
        <button onClick={() => setSelectedTab('files')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-right hover:border-primary transition-colors">
          <div className="text-sm font-semibold">إدارة الملفات</div>
          <div className="text-xs text-[var(--text-secondary)]">رفع وحذف الوسائط</div>
        </button>
        <button onClick={() => setSelectedTab('backup')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-right hover:border-primary transition-colors">
          <div className="text-sm font-semibold">النسخ الاحتياطي</div>
          <div className="text-xs text-[var(--text-secondary)]">النسخ والعودة</div>
        </button>
        <button onClick={() => setSelectedTab('2fa')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-right hover:border-primary transition-colors">
          <div className="text-sm font-semibold">2FA</div>
          <div className="text-xs text-[var(--text-secondary)]">الأمان الثنائي</div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-sm ${
              selectedTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 text-[var(--text-secondary)]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* General Tab */}
        {selectedTab === 'general' && (
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaStore className="text-primary" /> معلومات المتجر
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">اسم المتجر</label>
                <div className="text-lg font-semibold">{store?.name || 'CTGPRO'}</div>
              </div>
              <div>
                <label className="form-label">البريد الإلكتروني</label>
                <div className="text-lg">{store?.email || 'info@ctgpro.com'}</div>
              </div>
              <div>
                <label className="form-label">الهاتف</label>
                <div className="text-lg">{store?.phone || '+213 5 55 55 55 55'}</div>
              </div>
              <div>
                <label className="form-label">العملة</label>
                <div className="text-lg">{formData.currency || 'USD'}</div>
              </div>
              <div>
                <label className="form-label">اللغة</label>
                <div className="text-lg">
                  {SUPPORTED_LANGUAGES[formData.language]?.flag} {SUPPORTED_LANGUAGES[formData.language]?.name || formData.language}
                </div>
              </div>
              <div>
                <label className="form-label">المنطقة الزمنية</label>
                <div className="text-lg">{formData.timezone || 'Africa/Algiers'}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-2">
              <button
                onClick={() => openModal('general')}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaEdit className="inline ml-1" /> تعديل الإعدادات
              </button>
              <button
                onClick={saveGeneralSettings}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
              >
                <FaSave className="inline ml-1" /> {saving ? 'جارٍ الحفظ...' : 'تطبيق الآن'}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {selectedTab === 'security' && (
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-primary" /> إعدادات الأمان
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">مدة الجلسة (دقيقة)</label>
                <div className="text-lg">{formData.security?.sessionTimeout || 30}</div>
              </div>
              <div>
                <label className="form-label">حد محاولات تسجيل الدخول</label>
                <div className="text-lg">{formData.security?.maxLoginAttempts || 5}</div>
              </div>
              <div className="col-span-2">
                <label className="form-label">سياسة كلمة المرور</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className={`px-3 py-2 rounded-lg ${formData.security?.passwordPolicy?.minLength >= 8 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    طول 8 أحرف على الأقل
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${formData.security?.passwordPolicy?.requireUppercase ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    حرف كبير
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${formData.security?.passwordPolicy?.requireLowercase ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    حرف صغير
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${formData.security?.passwordPolicy?.requireNumbers ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    أرقام
                  </div>
                  <div className={`px-3 py-2 rounded-lg col-span-2 ${formData.security?.passwordPolicy?.requireSpecialChars ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    أحرف خاصة
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <label className="form-label">قائمة IP المسموح بها</label>
                <div className="flex flex-wrap gap-2">
                  {formData.security?.ipWhitelist?.length > 0 ? (
                    formData.security.ipWhitelist.map((ip, index) => (
                      <span key={index} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm">
                        <FaNetworkWired className="inline ml-1" /> {ip}
                      </span>
                    ))
                  ) : (
                    <span className="text-[var(--text-secondary)] text-sm">لا توجد عناوين IP مسموح بها</span>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className="form-label">قائمة IP المحظورة</label>
                <div className="flex flex-wrap gap-2">
                  {formData.security?.ipBlacklist?.length > 0 ? (
                    formData.security.ipBlacklist.map((ip, index) => (
                      <span key={index} className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-sm">
                        <FaNetworkWired className="inline ml-1" /> {ip}
                      </span>
                    ))
                  ) : (
                    <span className="text-[var(--text-secondary)] text-sm">لا توجد عناوين IP محظورة</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-2">
              <button
                onClick={() => openModal('security')}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaEdit className="inline ml-1" /> تعديل إعدادات الأمان
              </button>
              <button
                onClick={saveSecuritySettings}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
              >
                <FaSave className="inline ml-1" /> {saving ? 'جارٍ الحفظ...' : 'تطبيق الآن'}
              </button>
            </div>
          </div>
        )}

        {/* 2FA Tab */}
        {selectedTab === '2fa' && (
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaQrcode className="text-primary" /> المصادقة الثنائية (2FA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">الحالة</label>
                <div className={`text-lg font-semibold ${formData.twoFactorAuth?.enabled ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formData.twoFactorAuth?.enabled ? '✅ مفعلة' : '❌ غير مفعلة'}
                </div>
              </div>
              <div>
                <label className="form-label">طريقة المصادقة</label>
                <div className="text-lg">
                  {formData.twoFactorAuth?.method === 'app' ? 'تطبيق المصادقة' :
                   formData.twoFactorAuth?.method === 'sms' ? 'رسالة نصية' :
                   formData.twoFactorAuth?.method === 'email' ? 'بريد إلكتروني' : 'غير محدد'}
                </div>
              </div>
              {formData.twoFactorAuth?.method === 'sms' && (
                <div>
                  <label className="form-label">رقم الهاتف</label>
                  <div className="text-lg">{formData.twoFactorAuth?.phoneNumber || 'غير محدد'}</div>
                </div>
              )}
              <div className="col-span-2">
                <label className="form-label">رموز النسخ الاحتياطي</label>
                <div className="flex flex-wrap gap-2">
                  {formData.twoFactorAuth?.backupCodes?.length > 0 ? (
                    formData.twoFactorAuth.backupCodes.map((code, index) => (
                      <span key={index} className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-mono text-sm">
                        {code}
                      </span>
                    ))
                  ) : (
                    <span className="text-[var(--text-secondary)] text-sm">لا توجد رموز نسخ احتياطي</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => setIs2FAModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaQrcode className="inline ml-1" /> إدارة المصادقة الثنائية
              </button>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {selectedTab === 'database' && (
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaDatabase className="text-primary" /> إدارة قاعدة البيانات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">المضيف</label>
                <div className="text-lg">{formData.database?.host || 'localhost'}</div>
              </div>
              <div>
                <label className="form-label">المنفذ</label>
                <div className="text-lg">{formData.database?.port || 27017}</div>
              </div>
              <div>
                <label className="form-label">اسم قاعدة البيانات</label>
                <div className="text-lg font-semibold">{formData.database?.name || 'ctgpro'}</div>
              </div>
              <div>
                <label className="form-label">المستخدم</label>
                <div className="text-lg">{formData.database?.user || 'admin'}</div>
              </div>
              <div>
                <label className="form-label">Replica Set</label>
                <div className="text-lg">{formData.database?.replicaSet ? 'مفعل' : 'معطل'}</div>
              </div>
              <div>
                <label className="form-label">النسخ الاحتياطي التلقائي</label>
                <div className="text-lg">{formData.database?.backupEnabled ? 'مفعل' : 'معطل'}</div>
              </div>
              <div>
                <label className="form-label">تواتر النسخ الاحتياطي</label>
                <div className="text-lg">
                  {formData.database?.backupFrequency === 'daily' ? 'يومي' :
                   formData.database?.backupFrequency === 'weekly' ? 'أسبوعي' :
                   formData.database?.backupFrequency === 'monthly' ? 'شهري' : 'غير محدد'}
                </div>
              </div>
              <div>
                <label className="form-label">وقت النسخ الاحتياطي</label>
                <div className="text-lg">{formData.database?.backupTime || '02:00'}</div>
              </div>
              <div>
                <label className="form-label">فترة الاحتفاظ (أيام)</label>
                <div className="text-lg">{formData.database?.retentionDays || 30}</div>
              </div>
              <div>
                <label className="form-label">الضغط</label>
                <div className="text-lg">{formData.database?.compressionEnabled ? 'مفعل' : 'معطل'}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-2">
              <button
                onClick={() => openModal('database')}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaEdit className="inline ml-1" /> تعديل إعدادات قاعدة البيانات
              </button>
              <button
                onClick={saveDatabaseSettings}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
              >
                <FaSave className="inline ml-1" /> {saving ? 'جارٍ الحفظ...' : 'تطبيق الآن'}
              </button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {selectedTab === 'appearance' && (
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaPalette className="text-primary" /> إعدادات المظهر
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">الثيم</label>
                <div className="text-lg font-semibold">{formData.appearance?.theme || 'dark'}</div>
              </div>
              <div>
                <label className="form-label">عرض بطاقة المنتج</label>
                <div className="text-lg">{formData.appearance?.cardStyle || 'standard'}</div>
              </div>
              <div>
                <label className="form-label">عمود شبكة المنتجات</label>
                <div className="text-lg">{formData.appearance?.productGridColumns || 4}</div>
              </div>
              <div>
                <label className="form-label">رابط اللون الأساسي</label>
                <div className="text-lg break-all">{formData.appearance?.primaryColor || '#1d4ed8'}</div>
              </div>
              <div>
                <label className="form-label">تخطيط الصفحة</label>
                <div className="text-lg">{formData.appearance?.pageLayout || 'default'}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-2">
              <button
                onClick={() => openModal('appearance')}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaEdit className="inline ml-1" /> تعديل إعدادات المظهر
              </button>
              <button
                onClick={saveAppearanceSettings}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
              >
                <FaSave className="inline ml-1" /> {saving ? 'جارٍ الحفظ...' : 'تطبيق الآن'}
              </button>
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {selectedTab === 'pages' && (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold flex items-center gap-2"><FaFileAlt className="text-primary" /> إدارة الصفحات</h3>
                <p className="text-[var(--text-secondary)] text-sm">أنشئ وعدّل وحذف صفحات المحتوى العامة.</p>
              </div>
              <button
                onClick={resetPageForm}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaPlus className="inline ml-1" /> صفحة جديدة
              </button>
            </div>

            <form onSubmit={handlePageSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">عنوان الصفحة (AR)</label>
                  <input
                    type="text"
                    value={pageForm.title.ar}
                    onChange={(e) => setPageForm({ ...pageForm, title: { ...pageForm.title, ar: e.target.value } })}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">عنوان الصفحة (EN)</label>
                  <input
                    type="text"
                    value={pageForm.title.en}
                    onChange={(e) => setPageForm({ ...pageForm, title: { ...pageForm.title, en: e.target.value } })}
                    className="form-input w-full"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">محتوى الصفحة (AR)</label>
                  <textarea
                    value={pageForm.content.ar}
                    onChange={(e) => setPageForm({ ...pageForm, content: { ...pageForm.content, ar: e.target.value } })}
                    className="form-input w-full"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">محتوى الصفحة (EN)</label>
                  <textarea
                    value={pageForm.content.en}
                    onChange={(e) => setPageForm({ ...pageForm, content: { ...pageForm.content, en: e.target.value } })}
                    className="form-input w-full"
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">وصف الميتا (AR)</label>
                  <input
                    type="text"
                    value={pageForm.metaDescription.ar}
                    onChange={(e) => setPageForm({ ...pageForm, metaDescription: { ...pageForm.metaDescription, ar: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">وصف الميتا (EN)</label>
                  <input
                    type="text"
                    value={pageForm.metaDescription.en}
                    onChange={(e) => setPageForm({ ...pageForm, metaDescription: { ...pageForm.metaDescription, en: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pageForm.published}
                    onChange={(e) => setPageForm({ ...pageForm, published: e.target.checked })}
                    className="form-checkbox"
                  />
                  نشط
                </label>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg transition-all">
                  <FaSave className="inline ml-1" /> {editingPageId ? 'تحديث الصفحة' : 'حفظ الصفحة'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {pages.map((page) => (
                <div key={page._id} className="bg-[var(--bg-input)] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold">{page.title.ar || page.title.en}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{page.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handlePageEdit(page)} className="px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <FaEdit /> تعديل
                    </button>
                    <button onClick={() => handlePageDelete(page._id)} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                      <FaTrash /> حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Homepage Sections Tab */}
        {selectedTab === 'sections' && (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold flex items-center gap-2"><FaLayerGroup className="text-primary" /> أقسام الصفحة الرئيسية</h3>
                <p className="text-[var(--text-secondary)] text-sm">أنشئ وعدّل الأقسام التي تظهر في الصفحة الرئيسية.</p>
              </div>
              <button
                onClick={resetSectionForm}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaPlus className="inline ml-1" /> قسم جديد
              </button>
            </div>

            <form onSubmit={handleSectionSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">نوع القسم</label>
                  <select
                    value={sectionForm.sectionType}
                    onChange={(e) => setSectionForm({ ...sectionForm, sectionType: e.target.value })}
                    className="form-input w-full"
                  >
                    <option value="hero">Hero</option>
                    <option value="features">Features</option>
                    <option value="categories">Categories</option>
                    <option value="products">Products</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="stats">Stats</option>
                    <option value="cta">CTA</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">الترتيب</label>
                  <input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">العنوان (AR)</label>
                  <input
                    type="text"
                    value={sectionForm.title.ar}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: { ...sectionForm.title, ar: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">العنوان (EN)</label>
                  <input
                    type="text"
                    value={sectionForm.title.en}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: { ...sectionForm.title, en: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">النص الفرعي (AR)</label>
                  <input
                    type="text"
                    value={sectionForm.subtitle.ar}
                    onChange={(e) => setSectionForm({ ...sectionForm, subtitle: { ...sectionForm.subtitle, ar: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">النص الفرعي (EN)</label>
                  <input
                    type="text"
                    value={sectionForm.subtitle.en}
                    onChange={(e) => setSectionForm({ ...sectionForm, subtitle: { ...sectionForm.subtitle, en: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">رابط الصورة</label>
                  <input
                    type="url"
                    value={sectionForm.imageUrl}
                    onChange={(e) => setSectionForm({ ...sectionForm, imageUrl: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">رابط الزر</label>
                  <input
                    type="url"
                    value={sectionForm.ctaUrl}
                    onChange={(e) => setSectionForm({ ...sectionForm, ctaUrl: e.target.value })}
                    className="form-input w.full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">النص الزر (AR)</label>
                  <input
                    type="text"
                    value={sectionForm.ctaText.ar}
                    onChange={(e) => setSectionForm({ ...sectionForm, ctaText: { ...sectionForm.ctaText, ar: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">النص الزر (EN)</label>
                  <input
                    type="text"
                    value={sectionForm.ctaText.en}
                    onChange={(e) => setSectionForm({ ...sectionForm, ctaText: { ...sectionForm.ctaText, en: e.target.value } })}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sectionForm.active}
                    onChange={(e) => setSectionForm({ ...sectionForm, active: e.target.checked })}
                    className="form-checkbox"
                  />
                  نشط
                </label>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg transition-all">
                  <FaSave className="inline ml-1" /> {editingSectionId ? 'تحديث القسم' : 'حفظ القسم'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {homepageSections.map((section) => (
                <div key={section._id} className="bg-[var(--bg-input)] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold">{section.title.ar || section.title.en || section.sectionType}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{section.sectionType} • ترتيب {section.order}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleSectionEdit(section)} className="px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <FaEdit /> تعديل
                    </button>
                    <button onClick={() => handleSectionDelete(section._id)} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                      <FaTrash /> حذف
                    </button>
                    <button onClick={() => handleSectionOrderChange(section._id, 'up')} className="px-3 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-primary/10 transition-colors">
                      ▲
                    </button>
                    <button onClick={() => handleSectionOrderChange(section._id, 'down')} className="px-3 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-primary/10 transition-colors">
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {selectedTab === 'performance' && (
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaChartLine className="text-primary" /> إعدادات الأداء
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">ذاكرة التخزين المؤقت</label>
                <div className="text-lg">{formData.performance?.cacheEnabled ? '✅ مفعلة' : '❌ معطلة'}</div>
              </div>
              <div>
                <label className="form-label">مدة التخزين المؤقت (ثانية)</label>
                <div className="text-lg">{formData.performance?.cacheDuration || 3600}</div>
              </div>
              <div>
                <label className="form-label">الضغط</label>
                <div className="text-lg">{formData.performance?.compressionEnabled ? '✅ مفعل' : '❌ معطل'}</div>
              </div>
              <div>
                <label className="form-label">تحميل كسول</label>
                <div className="text-lg">{formData.performance?.lazyLoading ? '✅ مفعل' : '❌ معطل'}</div>
              </div>
              <div>
                <label className="form-label">تحسين الصور</label>
                <div className="text-lg">{formData.performance?.imageOptimization ? '✅ مفعل' : '❌ معطل'}</div>
              </div>
              <div>
                <label className="form-label">تصغير الملفات</label>
                <div className="text-lg">{formData.performance?.minifyAssets ? '✅ مفعل' : '❌ معطل'}</div>
              </div>
              <div>
                <label className="form-label">شبكة CDN</label>
                <div className="text-lg">{formData.performance?.cdnEnabled ? '✅ مفعلة' : '❌ معطلة'}</div>
              </div>
              <div>
                <label className="form-label">حجم تجمع قاعدة البيانات</label>
                <div className="text-lg">{formData.performance?.dbPoolSize || 10}</div>
              </div>
              <div>
                <label className="form-label">تحسين الاستعلامات</label>
                <div className="text-lg">{formData.performance?.queryOptimization ? '✅ مفعل' : '❌ معطل'}</div>
              </div>
              <div>
                <label className="form-label">الفهرسة</label>
                <div className="text-lg">{formData.performance?.indexingEnabled ? '✅ مفعلة' : '❌ معطلة'}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-2">
              <button
                onClick={() => openModal('performance')}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaEdit className="inline ml-1" /> تعديل إعدادات الأداء
              </button>
              <button
                onClick={savePerformanceSettings}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
              >
                <FaSave className="inline ml-1" /> {saving ? 'جارٍ الحفظ...' : 'تطبيق الآن'}
              </button>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {selectedTab === 'files' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <FaFolder className="text-primary" /> إدارة الملفات والصور
              </h3>
              <label className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                <FaUpload className="inline ml-1" /> رفع ملف
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  data-type="all"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.map((file) => (
                <div key={file._id} className="bg-[var(--bg-input)] rounded-xl p-3 hover:border-primary transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl text-primary">
                      {getFileIconFor(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {getFileSize(file.size)}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {new Date(file.uploadedAt).toLocaleDateString('ar-DZ')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="w-7 h-7 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center text-primary"
                      >
                        <FaEye className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleFileDelete(file._id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {files.length === 0 && (
              <div className="text-center py-8">
                <FaFolderOpen className="text-5xl text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">لا توجد ملفات</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors disabled:opacity-50"
                >
                  <FaBackward />
                </button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors disabled:opacity-50"
                >
                  <FaForward />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {selectedTab === 'logs' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <FaServer className="text-primary" /> سجلات النظام
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
                >
                  {logTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredLogs.slice(0, 50).map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-input)]">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    log.type === 'error' ? 'bg-red-500' :
                    log.type === 'warning' ? 'bg-amber-500' :
                    log.type === 'security' ? 'bg-primary' :
                    log.type === 'performance' ? 'bg-blue-500' :
                    log.type === 'database' ? 'bg-emerald-500' :
                    'bg-emerald-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        log.type === 'error' ? 'bg-red-500/20 text-red-500' :
                        log.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                        log.type === 'security' ? 'bg-primary/20 text-primary' :
                        log.type === 'performance' ? 'bg-blue-500/20 text-blue-500' :
                        log.type === 'database' ? 'bg-emerald-500/20 text-emerald-500' :
                        'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {logTypes.find(t => t.value === log.type)?.label || log.type}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        <FaNetworkWired className="inline ml-1" /> {log.ip || '0.0.0.0'}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        <FaClock className="inline ml-1" />
                        {new Date(log.timestamp).toLocaleString('ar-DZ')}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{log.message}</p>
                    {log.user && (
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        <FaUserSecret className="inline ml-1" /> المستخدم: {log.user}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <FaServer className="text-5xl text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">لا توجد سجلات</p>
              </div>
            )}
          </div>
        )}

        {/* Backup Tab */}
        {selectedTab === 'backup' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <FaCloud className="text-primary" /> النسخ الاحتياطية
              </h3>
              <button
                onClick={handleBackupCreate}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <FaPlus className="inline ml-1" /> إنشاء نسخة احتياطية
              </button>
            </div>

            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup._id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-input)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <FaCloud />
                    </div>
                    <div>
                      <div className="font-semibold">{backup.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {getFileSize(backup.size)} • {new Date(backup.createdAt).toLocaleString('ar-DZ')}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          backup.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                          backup.status === 'processing' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {backup.status === 'completed' ? 'مكتمل' :
                           backup.status === 'processing' ? 'قيد المعالجة' : 'فشل'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">
                          {backup.type || 'كامل'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadBackup(backup._id)}
                      className="w-8 h-8 rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center justify-center text-emerald-500"
                      disabled={backup.status !== 'completed'}
                    >
                      <FaDownload className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleBackupRestore(backup._id)}
                      className="w-8 h-8 rounded-lg hover:bg-amber-500/10 transition-colors flex items-center justify-center text-amber-500"
                      disabled={backup.status !== 'completed'}
                    >
                      <FaPlay className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleBackupDelete(backup._id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {backups.length === 0 && (
              <div className="text-center py-8">
                <FaCloud className="text-5xl text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">لا توجد نسخ احتياطية</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaStore className="text-primary" />
                تعديل الإعدادات
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* General Settings */}
              {(selectedTab === 'general' || selectedTab === 'all') && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">اسم المتجر *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">الهاتف</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">العملة</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="form-input w-full"
                      >
                        <option value="USD">USD - دولار أمريكي</option>
                        <option value="EUR">EUR - يورو</option>
                        <option value="GBP">GBP - جنيه استرليني</option>
                        <option value="DZD">DZD - دينار جزائري</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">اللغة</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="form-input w-full"
                      >
                        {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name} {lang.flag}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">المنطقة الزمنية</label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="form-input w-full"
                      >
                        <option value="Africa/Algiers">الجزائر (UTC+1)</option>
                        <option value="Africa/Cairo">القاهرة (UTC+2)</option>
                        <option value="Asia/Dubai">دبي (UTC+4)</option>
                        <option value="Europe/London">لندن (UTC+0)</option>
                        <option value="America/New_York">نيويورك (UTC-5)</option>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">العنوان</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">المدينة</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="form-input w-full"
                      />
                    </div>
                  </div>
                  <div className="border-t border-[var(--border-color)] pt-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FaPalette className="text-primary" /> إعدادات المظهر
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">الثيم</label>
                        <select
                          value={formData.appearance?.theme || 'dark'}
                          onChange={(e) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, theme: e.target.value }
                          })}
                          className="form-input w-full"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">عرض بطاقة المنتج</label>
                        <select
                          value={formData.appearance?.cardStyle || 'standard'}
                          onChange={(e) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, cardStyle: e.target.value }
                          })}
                          className="form-input w-full"
                        >
                          <option value="standard">Standard</option>
                          <option value="compact">Compact</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">عمود شبكة المنتجات</label>
                        <input
                          type="number"
                          min="1"
                          max="6"
                          value={formData.appearance?.productGridColumns || 4}
                          onChange={(e) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, productGridColumns: parseInt(e.target.value) }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">اللون الأساسي</label>
                        <input
                          type="color"
                          value={formData.appearance?.primaryColor || '#1d4ed8'}
                          onChange={(e) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, primaryColor: e.target.value }
                          })}
                          className="form-input w-full h-12 px-2"
                        />
                      </div>
                      <div>
                        <label className="form-label">تخطيط الصفحة</label>
                        <select
                          value={formData.appearance?.pageLayout || 'default'}
                          onChange={(e) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, pageLayout: e.target.value }
                          })}
                          className="form-input w-full"
                        >
                          <option value="default">Default</option>
                          <option value="full_width">Full Width</option>
                          <option value="boxed">Boxed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Security Settings */}
              {(selectedTab === 'security' || selectedTab === 'all') && (
                <>
                  <div className="border-t border-[var(--border-color)] pt-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FaShieldAlt className="text-primary" /> إعدادات الأمان
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">مدة الجلسة (دقيقة)</label>
                        <input
                          type="number"
                          min="5"
                          max="480"
                          value={formData.security?.sessionTimeout || 30}
                          onChange={(e) => setFormData({
                            ...formData,
                            security: { ...formData.security, sessionTimeout: parseInt(e.target.value) }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">حد محاولات تسجيل الدخول</label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={formData.security?.maxLoginAttempts || 5}
                          onChange={(e) => setFormData({
                            ...formData,
                            security: { ...formData.security, maxLoginAttempts: parseInt(e.target.value) }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="form-label">سياسة كلمة المرور</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.security?.passwordPolicy?.requireUppercase}
                            onChange={(e) => setFormData({
                              ...formData,
                              security: {
                                ...formData.security,
                                passwordPolicy: {
                                  ...formData.security?.passwordPolicy,
                                  requireUppercase: e.target.checked
                                }
                              }
                            })}
                            className="form-checkbox"
                          />
                          <span className="text-sm">حرف كبير</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.security?.passwordPolicy?.requireLowercase}
                            onChange={(e) => setFormData({
                              ...formData,
                              security: {
                                ...formData.security,
                                passwordPolicy: {
                                  ...formData.security?.passwordPolicy,
                                  requireLowercase: e.target.checked
                                }
                              }
                            })}
                            className="form-checkbox"
                          />
                          <span className="text-sm">حرف صغير</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.security?.passwordPolicy?.requireNumbers}
                            onChange={(e) => setFormData({
                              ...formData,
                              security: {
                                ...formData.security,
                                passwordPolicy: {
                                  ...formData.security?.passwordPolicy,
                                  requireNumbers: e.target.checked
                                }
                              }
                            })}
                            className="form-checkbox"
                          />
                          <span className="text-sm">أرقام</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.security?.passwordPolicy?.requireSpecialChars}
                            onChange={(e) => setFormData({
                              ...formData,
                              security: {
                                ...formData.security,
                                passwordPolicy: {
                                  ...formData.security?.passwordPolicy,
                                  requireSpecialChars: e.target.checked
                                }
                              }
                            })}
                            className="form-checkbox"
                          />
                          <span className="text-sm">أحرف خاصة</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="form-label">قائمة IP المسموح بها</label>
                        <input
                          type="text"
                          value={formData.security?.ipWhitelist?.join(', ') || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            security: {
                              ...formData.security,
                              ipWhitelist: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean)
                            }
                          })}
                          className="form-input w-full"
                          placeholder="192.168.1.1, 10.0.0.1"
                        />
                      </div>
                      <div>
                        <label className="form-label">قائمة IP المحظورة</label>
                        <input
                          type="text"
                          value={formData.security?.ipBlacklist?.join(', ') || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            security: {
                              ...formData.security,
                              ipBlacklist: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean)
                            }
                          })}
                          className="form-input w-full"
                          placeholder="192.168.1.100, 10.0.0.100"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Database Settings */}
              {(selectedTab === 'database' || selectedTab === 'all') && (
                <>
                  <div className="border-t border-[var(--border-color)] pt-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FaDatabase className="text-primary" /> إعدادات قاعدة البيانات
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">المضيف</label>
                        <input
                          type="text"
                          value={formData.database?.host || 'localhost'}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, host: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">المنفذ</label>
                        <input
                          type="number"
                          value={formData.database?.port || 27017}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, port: parseInt(e.target.value) }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">اسم قاعدة البيانات</label>
                        <input
                          type="text"
                          value={formData.database?.name || 'ctgpro'}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, name: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">المستخدم</label>
                        <input
                          type="text"
                          value={formData.database?.user || 'admin'}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, user: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">كلمة المرور</label>
                        <input
                          type="password"
                          value={formData.database?.password || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, password: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">تواتر النسخ الاحتياطي</label>
                        <select
                          value={formData.database?.backupFrequency || 'daily'}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, backupFrequency: e.target.value }
                          })}
                          className="form-input w-full"
                        >
                          <option value="daily">يومي</option>
                          <option value="weekly">أسبوعي</option>
                          <option value="monthly">شهري</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">وقت النسخ الاحتياطي</label>
                        <input
                          type="time"
                          value={formData.database?.backupTime || '02:00'}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, backupTime: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">فترة الاحتفاظ (أيام)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={formData.database?.retentionDays || 30}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, retentionDays: parseInt(e.target.value) }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.database?.backupEnabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, backupEnabled: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">تفعيل النسخ الاحتياطي التلقائي</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.database?.compressionEnabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, compressionEnabled: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">تفعيل الضغط</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.database?.replicaSet}
                          onChange={(e) => setFormData({
                            ...formData,
                            database: { ...formData.database, replicaSet: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">Replica Set</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Performance Settings */}
              {(selectedTab === 'performance' || selectedTab === 'all') && (
                <>
                  <div className="border-t border-[var(--border-color)] pt-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FaChartLine className="text-primary" /> إعدادات الأداء
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">مدة التخزين المؤقت (ثانية)</label>
                        <input
                          type="number"
                          min="60"
                          max="86400"
                          value={formData.performance?.cacheDuration || 3600}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, cacheDuration: parseInt(e.target.value) }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">حجم تجمع قاعدة البيانات</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.performance?.dbPoolSize || 10}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, dbPoolSize: parseInt(e.target.value) }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="form-label">رابط CDN</label>
                        <input
                          type="url"
                          value={formData.performance?.cdnUrl || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, cdnUrl: e.target.value }
                          })}
                          className="form-input w-full"
                          placeholder="https://cdn.ctgpro.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.cacheEnabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, cacheEnabled: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">التخزين المؤقت</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.compressionEnabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, compressionEnabled: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">الضغط</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.lazyLoading}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, lazyLoading: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">تحميل كسول</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.imageOptimization}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, imageOptimization: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">تحسين الصور</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.minifyAssets}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, minifyAssets: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">تصغير الملفات</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.cdnEnabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, cdnEnabled: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">شبكة CDN</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.queryOptimization}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, queryOptimization: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">تحسين الاستعلامات</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.performance?.indexingEnabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            performance: { ...formData.performance, indexingEnabled: e.target.checked }
                          })}
                          className="form-checkbox"
                        />
                        <span className="text-sm">الفهرسة</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Social Media Settings */}
              {(selectedTab === 'general' || selectedTab === 'all') && (
                <>
                  <div className="border-t border-[var(--border-color)] pt-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FaGlobe className="text-primary" /> وسائل التواصل الاجتماعي
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">فيسبوك</label>
                        <input
                          type="url"
                          value={formData.social?.facebook || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, facebook: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">انستغرام</label>
                        <input
                          type="url"
                          value={formData.social?.instagram || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, instagram: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">تويتر</label>
                        <input
                          type="url"
                          value={formData.social?.twitter || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, twitter: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">يوتيوب</label>
                        <input
                          type="url"
                          value={formData.social?.youtube || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, youtube: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">تيك توك</label>
                        <input
                          type="url"
                          value={formData.social?.tiktok || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, tiktok: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">تيليجرام</label>
                        <input
                          type="url"
                          value={formData.social?.telegram || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, telegram: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">واتساب</label>
                        <input
                          type="url"
                          value={formData.social?.whatsapp || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, whatsapp: e.target.value }
                          })}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="form-label">معرف فيسبوك بيكسل</label>
                        <input
                          type="text"
                          value={formData.social?.facebookPixelId || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, facebookPixelId: e.target.value }
                          })}
                          className="form-input w-full"
                          placeholder="123456789012345"
                        />
                      </div>
                      <div>
                        <label className="form-label">تيك توك بيكسل</label>
                        <input
                          type="text"
                          value={formData.social?.tiktokPixelId || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, tiktokPixelId: e.target.value }
                          })}
                          className="form-input w-full"
                          placeholder="XXXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="form-label">Google Analytics ID</label>
                        <input
                          type="text"
                          value={formData.social?.googleAnalyticsId || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            social: { ...formData.social, googleAnalyticsId: e.target.value }
                          })}
                          className="form-input w-full"
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  <FaSave /> حفظ الإعدادات
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIs2FAModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaQrcode className="text-primary" />
                المصادقة الثنائية (2FA)
              </h3>
              <button onClick={() => setIs2FAModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handle2FAUpdate} className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.twoFactorAuth?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      twoFactorAuth: { ...formData.twoFactorAuth, enabled: e.target.checked }
                    })}
                    className="form-checkbox"
                  />
                  <span className="font-semibold">تفعيل المصادقة الثنائية</span>
                </label>
              </div>

              <div>
                <label className="form-label">طريقة المصادقة</label>
                <select
                  value={formData.twoFactorAuth?.method || 'app'}
                  onChange={(e) => setFormData({
                    ...formData,
                    twoFactorAuth: { ...formData.twoFactorAuth, method: e.target.value }
                  })}
                  className="form-input w-full"
                >
                  <option value="app">تطبيق المصادقة (Google Authenticator)</option>
                  <option value="sms">رسالة نصية (SMS)</option>
                  <option value="email">بريد إلكتروني</option>
                </select>
              </div>

              {formData.twoFactorAuth?.method === 'sms' && (
                <div>
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.twoFactorAuth?.phoneNumber || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      twoFactorAuth: { ...formData.twoFactorAuth, phoneNumber: e.target.value }
                    })}
                    className="form-input w-full"
                    placeholder="+213 5 XX XX XX XX"
                  />
                </div>
              )}

              {formData.twoFactorAuth?.method === 'app' && (
                <div className="text-center p-6 bg-[var(--bg-input)] rounded-xl">
                  <div className="w-40 h-40 mx-auto bg-white rounded-lg flex items-center justify-center">
                    <FaQrcode className="text-6xl text-black" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-3">
                    امسح رمز QR باستخدام تطبيق المصادقة الخاص بك
                  </p>
                  <div className="mt-2">
                    <code className="text-xs bg-[var(--bg-secondary)] px-3 py-1 rounded font-mono">
                      CTGPRO:1234567890
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('CTGPRO:1234567890')}
                      className="mr-2 text-primary hover:text-primary-dark transition-colors"
                    >
                      <FaCopy className="inline" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">رموز النسخ الاحتياطي</label>
                <div className="flex flex-wrap gap-2">
                  {formData.twoFactorAuth?.backupCodes?.map((code, index) => (
                    <span key={index} className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-mono text-sm">
                      {code}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newCodes = Array.from({ length: 10 }, () => 
                      Math.random().toString(36).substring(2, 8).toUpperCase()
                    );
                    setFormData({
                      ...formData,
                      twoFactorAuth: { ...formData.twoFactorAuth, backupCodes: newCodes }
                    });
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
                >
                  <FaSync className="inline ml-1" /> توليد رموز جديدة
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  <FaSave /> حفظ الإعدادات
                </button>
                <button type="button" onClick={() => setIs2FAModalOpen(false)} className="px-6 py-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;