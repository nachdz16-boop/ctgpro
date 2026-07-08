import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaCode, FaPlus, FaEdit, FaTrash, FaEye, FaSync, 
  FaToggleOn, FaToggleOff, FaSave, FaTimes, FaSearch,
  FaFilter, FaClock, FaCheckCircle, FaExclamationCircle,
  FaKey, FaLock, FaUnlock, FaShieldAlt, FaDatabase,
  FaCloud, FaServer, FaNetworkWired, FaBolt,
  FaChartLine, FaDollarSign, FaUsers, FaGlobe,
  FaCopy, FaRegCopy, FaCheckDouble, FaBan, FaSyncAlt,
  FaTerminal, FaFileCode, FaLockOpen, FaShieldVirus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const ApisManagement = () => {
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [apis, setApis] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'internal',
    baseUrl: '',
    version: 'v1',
    authType: 'api_key',
    apiKey: '',
    secretKey: '',
    rateLimit: 100,
    rateLimitPerMinute: 60,
    timeout: 30,
    retryCount: 3,
    isActive: true,
    isPublic: false,
    documentation: '',
    endpoints: [
      { path: '/', method: 'GET', description: 'Root endpoint' }
    ],
    allowedIPs: [],
    webhookUrl: '',
    tier: 'free',
    monthlyLimit: 1000,
    costPerRequest: 0.001
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchApis();
      fetchApiKeys();
    }
  }, [user]);

  const fetchApis = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/apis');
      setApis(response.data.apis || []);
    } catch (error) {
      console.error('Error fetching APIs:', error);
      toast.error('حدث خطأ في جلب بيانات الـ API');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/admin/apis/keys');
      setApiKeys(response.data.keys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const fetchLogs = async (apiId) => {
    try {
      const response = await api.get(`/admin/apis/${apiId}/logs`);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('حدث خطأ في جلب السجلات');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedApi) {
        await api.put(`/admin/apis/${selectedApi._id}`, formData);
        toast.success('تم تحديث الـ API بنجاح');
      } else {
        await api.post('/admin/apis', formData);
        toast.success('تم إنشاء الـ API بنجاح');
      }
      fetchApis();
      closeModal();
    } catch (error) {
      console.error('Error saving API:', error);
      toast.error('حدث خطأ في حفظ الـ API');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الـ API؟')) return;
    try {
      await api.delete(`/admin/apis/${id}`);
      toast.success('تم حذف الـ API بنجاح');
      fetchApis();
    } catch (error) {
      console.error('Error deleting API:', error);
      toast.error('حدث خطأ في حذف الـ API');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/apis/${id}/toggle`, { isActive: !currentStatus });
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} الـ API بنجاح`);
      fetchApis();
    } catch (error) {
      console.error('Error toggling API:', error);
      toast.error('حدث خطأ في تغيير حالة الـ API');
    }
  };

  const regenerateKey = async (id) => {
    try {
      const response = await api.post(`/admin/apis/${id}/regenerate-key`);
      toast.success('تم إعادة توليد المفتاح بنجاح');
      setApis(apis.map(api => 
        api._id === id ? { ...api, apiKey: response.data.apiKey } : api
      ));
    } catch (error) {
      console.error('Error regenerating key:', error);
      toast.error('حدث خطأ في إعادة توليد المفتاح');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ إلى الحافظة');
  };

  const openModal = (api = null) => {
    if (api) {
      setSelectedApi(api);
      setFormData({
        name: api.name,
        description: api.description || '',
        provider: api.provider || 'internal',
        baseUrl: api.baseUrl || '',
        version: api.version || 'v1',
        authType: api.authType || 'api_key',
        apiKey: api.apiKey || '',
        secretKey: api.secretKey || '',
        rateLimit: api.rateLimit || 100,
        rateLimitPerMinute: api.rateLimitPerMinute || 60,
        timeout: api.timeout || 30,
        retryCount: api.retryCount || 3,
        isActive: api.isActive,
        isPublic: api.isPublic || false,
        documentation: api.documentation || '',
        endpoints: api.endpoints || [{ path: '/', method: 'GET', description: 'Root endpoint' }],
        allowedIPs: api.allowedIPs || [],
        webhookUrl: api.webhookUrl || '',
        tier: api.tier || 'free',
        monthlyLimit: api.monthlyLimit || 1000,
        costPerRequest: api.costPerRequest || 0.001
      });
    } else {
      setSelectedApi(null);
      setFormData({
        name: '',
        description: '',
        provider: 'internal',
        baseUrl: '',
        version: 'v1',
        authType: 'api_key',
        apiKey: '',
        secretKey: '',
        rateLimit: 100,
        rateLimitPerMinute: 60,
        timeout: 30,
        retryCount: 3,
        isActive: true,
        isPublic: false,
        documentation: '',
        endpoints: [{ path: '/', method: 'GET', description: 'Root endpoint' }],
        allowedIPs: [],
        webhookUrl: '',
        tier: 'free',
        monthlyLimit: 1000,
        costPerRequest: 0.001
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApi(null);
  };

  const viewLogs = async (apiId) => {
    await fetchLogs(apiId);
    setIsLogsModalOpen(true);
  };

  const addEndpoint = () => {
    setFormData({
      ...formData,
      endpoints: [...formData.endpoints, { path: '', method: 'GET', description: '' }]
    });
  };

  const removeEndpoint = (index) => {
    const endpoints = [...formData.endpoints];
    endpoints.splice(index, 1);
    setFormData({ ...formData, endpoints });
  };

  const updateEndpoint = (index, field, value) => {
    const endpoints = [...formData.endpoints];
    endpoints[index][field] = value;
    setFormData({ ...formData, endpoints });
  };

  const filteredApis = apis.filter(api => {
    const matchesSearch = api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && api.isActive) ||
                         (filterStatus === 'inactive' && !api.isActive);
    const matchesType = filterType === 'all' || api.tier === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: apis.length,
    active: apis.filter(a => a.isActive).length,
    inactive: apis.filter(a => !a.isActive).length,
    public: apis.filter(a => a.isPublic).length,
    private: apis.filter(a => !a.isPublic).length,
    totalRequests: apis.reduce((acc, a) => acc + (a.totalRequests || 0), 0),
    totalKeys: apiKeys.length
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const tiers = [
    { value: 'free', label: 'مجاني' },
    { value: 'basic', label: 'أساسي' },
    { value: 'pro', label: 'احترافي' },
    { value: 'enterprise', label: 'مؤسسات' }
  ];
  const providers = [
    { value: 'internal', label: 'داخلي' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'twilio', label: 'Twilio' },
    { value: 'sendgrid', label: 'SendGrid' },
    { value: 'aws', label: 'AWS' },
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'custom', label: 'مخصص' }
  ];
  const authTypes = [
    { value: 'api_key', label: 'مفتاح API' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'jwt', label: 'JWT' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaCode className="text-primary text-3xl" />
            إدارة الـ APIs
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            إدارة واجهات برمجة التطبيقات والمفاتيح والخدمات المتكاملة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors font-semibold flex items-center gap-2"
          >
            <FaKey /> مفاتيح API
          </button>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <FaPlus /> API جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaCode /></div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي الـ APIs</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-emerald-500 mb-1"><FaCheckCircle /></div>
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-[var(--text-secondary)]">نشطة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-amber-500 mb-1"><FaKey /></div>
          <div className="text-2xl font-bold">{stats.totalKeys}</div>
          <div className="text-xs text-[var(--text-secondary)]">المفاتيح</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaChartLine /></div>
          <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي الطلبات</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="بحث عن API..."
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
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">جميع المستويات</option>
          {tiers.map(tier => (
            <option key={tier.value} value={tier.value}>{tier.label}</option>
          ))}
        </select>
        <button
          onClick={fetchApis}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>

      {/* APIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApis.map((api) => (
          <div key={api._id} className="card hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
                  <FaCode className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{api.name}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {api.version}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{api.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                      {providers.find(p => p.value === api.provider)?.label || api.provider}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                      {tiers.find(t => t.value === api.tier)?.label || api.tier}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(api._id, api.isActive)}
                className={`text-lg ${api.isActive ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {api.isActive ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">الطلبات</div>
                <div className="text-sm font-semibold">{(api.totalRequests || 0).toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">النهاية</div>
                <div className="text-sm font-semibold text-primary truncate">{api.endpoints?.length || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">التكلفة</div>
                <div className="text-sm font-semibold">${api.costPerRequest || 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => openModal(api)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary text-sm flex items-center justify-center gap-2"
              >
                <FaEdit /> تعديل
              </button>
              <button
                onClick={() => viewLogs(api._id)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors text-amber-500 text-sm flex items-center justify-center gap-2"
              >
                <FaEye /> سجلات
              </button>
              <button
                onClick={() => handleDelete(api._id)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-500 text-sm flex items-center justify-center gap-2"
              >
                <FaTrash /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredApis.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaCode className="text-6xl text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد APIs</h3>
          <p className="text-[var(--text-secondary)]">لم يتم العثور على أي واجهات برمجة تطبيقات</p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaCode className="text-primary" />
                {selectedApi ? 'تعديل الـ API' : 'API جديد'}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">اسم الـ API *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">المزود</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="form-input w-full"
                  >
                    {providers.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
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
                  <label className="form-label">الإصدار</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="form-input w-full"
                    placeholder="v1"
                  />
                </div>
                <div>
                  <label className="form-label">نوع المصادقة</label>
                  <select
                    value={formData.authType}
                    onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
                    className="form-input w-full"
                  >
                    {authTypes.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">المستوى</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="form-input w-full"
                  >
                    {tiers.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">الرابط الأساسي</label>
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    className="form-input w-full"
                    placeholder="https://api.example.com"
                  />
                </div>
                <div>
                  <label className="form-label">مفتاح API</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="form-input flex-1"
                      placeholder="••••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        setFormData({ ...formData, apiKey: newKey });
                      }}
                      className="px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="توليد مفتاح جديد"
                    >
                      <FaSync />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">حد الطلب (في الدقيقة)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rateLimitPerMinute}
                    onChange={(e) => setFormData({ ...formData, rateLimitPerMinute: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">الحد الشهري</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">التكلفة لكل طلب ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.costPerRequest}
                    onChange={(e) => setFormData({ ...formData, costPerRequest: parseFloat(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">مهلة الاتصال (ثانية)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.timeout}
                    onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">عدد محاولات إعادة المحاولة</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.retryCount}
                    onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">عنوان Webhook</label>
                <input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  className="form-input w-full"
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div>
                <label className="form-label">عنوان IP المسموح بها</label>
                <input
                  type="text"
                  value={formData.allowedIPs.join(', ')}
                  onChange={(e) => setFormData({ ...formData, allowedIPs: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean) })}
                  className="form-input w-full"
                  placeholder="192.168.1.1, 10.0.0.1"
                />
              </div>

              <div>
                <label className="form-label">التوثيق</label>
                <textarea
                  value={formData.documentation}
                  onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                  className="form-input w-full"
                  rows="3"
                  placeholder="رابط التوثيق أو الوصف التفصيلي"
                />
              </div>

              {/* Endpoints */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0">النقاط النهائية (Endpoints)</label>
                  <button
                    type="button"
                    onClick={addEndpoint}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors flex items-center gap-1"
                  >
                    <FaPlus className="text-xs" /> إضافة نقطة
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={endpoint.method}
                        onChange={(e) => updateEndpoint(index, 'method', e.target.value)}
                        className="form-input w-24"
                      >
                        {methods.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={endpoint.path}
                        onChange={(e) => updateEndpoint(index, 'path', e.target.value)}
                        className="form-input flex-1"
                        placeholder="/path"
                      />
                      <input
                        type="text"
                        value={endpoint.description}
                        onChange={(e) => updateEndpoint(index, 'description', e.target.value)}
                        className="form-input flex-1"
                        placeholder="الوصف"
                      />
                      <button
                        type="button"
                        onClick={() => removeEndpoint(index)}
                        className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-color)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="form-checkbox"
                  />
                  <span className="text-sm">مفعل</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="form-checkbox"
                  />
                  <span className="text-sm">عام</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  <FaSave /> {selectedApi ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Keys Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsKeyModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaKey className="text-primary" />
                مفاتيح API
              </h3>
              <button onClick={() => setIsKeyModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {apiKeys.length > 0 ? (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key._id} className="card">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{key.name}</h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                              key.isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                              {key.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]">{key.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-[var(--bg-input)] px-2 py-1 rounded font-mono">
                              {key.apiKey || '••••••••••••••••'}
                            </code>
                            <button
                              onClick={() => copyToClipboard(key.apiKey)}
                              className="text-primary hover:text-primary-dark transition-colors"
                            >
                              <FaCopy className="text-xs" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-[var(--text-secondary)]">
                            آخر استخدام: {key.lastUsed ? new Date(key.lastUsed).toLocaleString('ar-DZ') : 'لم يستخدم بعد'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => regenerateKey(key._id)}
                              className="w-8 h-8 rounded-lg hover:bg-amber-500/10 transition-colors flex items-center justify-center text-amber-500"
                              title="إعادة توليد"
                            >
                              <FaSync className="text-xs" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('هل أنت متأكد من حذف هذا المفتاح؟')) {
                                  // حذف المفتاح
                                }
                              }}
                              className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaKey className="text-4xl text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)]">لا توجد مفاتيح API</p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                  >
                    <FaPlus className="inline ml-1" /> إضافة مفتاح جديد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsLogsModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaTerminal className="text-primary" />
                سجلات الطلبات
              </h3>
              <button onClick={() => setIsLogsModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-input)]">
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        log.statusCode < 400 ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-primary">{log.method}</span>
                          <span className="text-xs font-mono text-[var(--text-secondary)]">{log.path}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.statusCode < 400 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {log.statusCode}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">{log.duration}ms</span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                          {log.ip} • {new Date(log.timestamp).toLocaleString('ar-DZ')}
                        </div>
                        {log.error && (
                          <p className="text-xs text-red-500 mt-1">{log.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaTerminal className="text-4xl text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)]">لا توجد سجلات لهذا API</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApisManagement;