import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../../context/LanguageContext';
import { 
  FaComments, FaPlus, FaEdit, FaTrash, FaEye, FaSync,
  FaToggleOn, FaToggleOff, FaCog, FaReply,
  FaSave, FaTimes, FaSearch, FaFilter, FaClock,
  FaCheckCircle, FaExclamationCircle, FaUser, FaRobot,
  FaChartLine, FaDatabase, FaShieldAlt, FaBolt,
  FaStar, FaRegSmile, FaRegFrown, FaRegMeh, FaRegLaugh
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const ChatBotManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    greeting: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
    fallbackMessage: 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟',
    isActive: true,
    autoReply: true,
    language: 'ar',
    responseTime: 5,
    maxMessagesPerSession: 50,
    allowedChannels: ['website', 'mobile', 'whatsapp'],
    categories: ['general', 'support', 'sales']
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBots();
      fetchConversations();
    }
  }, [user]);

  const fetchBots = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/chat-bots');
      setBots(response.data.bots || []);
    } catch (error) {
      console.error('Error fetching chat bots:', error);
      toast.error('حدث خطأ في جلب بيانات البوتات');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/admin/chat-bots/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBot) {
        await api.put(`/admin/chat-bots/${selectedBot._id}`, formData);
        toast.success('تم تحديث البوت بنجاح');
      } else {
        await api.post('/admin/chat-bots', formData);
        toast.success('تم إنشاء البوت بنجاح');
      }
      fetchBots();
      closeModal();
    } catch (error) {
      console.error('Error saving bot:', error);
      toast.error('حدث خطأ في حفظ البوت');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البوت؟')) return;
    try {
      await api.delete(`/admin/chat-bots/${id}`);
      toast.success('تم حذف البوت بنجاح');
      fetchBots();
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast.error('حدث خطأ في حذف البوت');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/chat-bots/${id}/toggle`, { isActive: !currentStatus });
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} البوت بنجاح`);
      fetchBots();
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast.error('حدث خطأ في تغيير حالة البوت');
    }
  };

  const openModal = (bot = null) => {
    if (bot) {
      setSelectedBot(bot);
      setFormData({
        name: bot.name,
        description: bot.description,
        greeting: bot.greeting || 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        fallbackMessage: bot.fallbackMessage || 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟',
        isActive: bot.isActive,
        autoReply: bot.autoReply || true,
        language: bot.language || 'ar',
        responseTime: bot.responseTime || 5,
        maxMessagesPerSession: bot.maxMessagesPerSession || 50,
        allowedChannels: bot.allowedChannels || ['website', 'mobile', 'whatsapp'],
        categories: bot.categories || ['general', 'support', 'sales']
      });
    } else {
      setSelectedBot(null);
      setFormData({
        name: '',
        description: '',
        greeting: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        fallbackMessage: 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟',
        isActive: true,
        autoReply: true,
        language: 'ar',
        responseTime: 5,
        maxMessagesPerSession: 50,
        allowedChannels: ['website', 'mobile', 'whatsapp'],
        categories: ['general', 'support', 'sales']
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBot(null);
  };

  const viewConversations = (botId) => {
    const botConversations = conversations.filter(c => c.botId === botId);
    setSelectedBot(bots.find(b => b._id === botId));
    setIsConversationModalOpen(true);
  };

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && bot.isActive) ||
                         (filterStatus === 'inactive' && !bot.isActive);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: bots.length,
    active: bots.filter(b => b.isActive).length,
    inactive: bots.filter(b => !b.isActive).length,
    totalConversations: conversations.length,
    resolved: conversations.filter(c => c.resolved).length
  };

  const getLanguageLabel = (code) => {
    const lang = SUPPORTED_LANGUAGES[code];
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const channels = [
    { value: 'website', label: 'الموقع' },
    { value: 'mobile', label: 'التطبيق' },
    { value: 'whatsapp', label: 'واتساب' },
    { value: 'telegram', label: 'تيليجرام' },
    { value: 'facebook', label: 'فيسبوك' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'عام' },
    { value: 'support', label: 'دعم' },
    { value: 'sales', label: 'مبيعات' },
    { value: 'technical', label: 'تقني' },
    { value: 'billing', label: 'فواتير' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaComments className="text-primary text-3xl" />
            إدارة بوتات المحادثة
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            إدارة بوتات المحادثة التفاعلية للخدمة والدعم
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <FaPlus /> بوت جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaComments /></div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي البوتات</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-emerald-500 mb-1"><FaCheckCircle /></div>
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-[var(--text-secondary)]">نشطة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-amber-500 mb-1"><FaComments /></div>
          <div className="text-2xl font-bold">{stats.totalConversations}</div>
          <div className="text-xs text-[var(--text-secondary)]">المحادثات</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-primary mb-1"><FaCheckCircle /></div>
          <div className="text-2xl font-bold">{stats.resolved}</div>
          <div className="text-xs text-[var(--text-secondary)]">محلولة</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="بحث عن بوت..."
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
        <button
          onClick={() => { fetchBots(); fetchConversations(); }}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBots.map((bot) => (
          <div key={bot._id} className="card hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
                  <FaRobot className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{bot.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{bot.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                      {getLanguageLabel(bot.language)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {bot.responseTime}s
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(bot._id, bot.isActive)}
                className={`text-lg ${bot.isActive ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {bot.isActive ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {bot.categories?.map(cat => (
                <span key={cat} className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-secondary)]">
                  {categoryOptions.find(o => o.value === cat)?.label || cat}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => openModal(bot)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary text-sm flex items-center justify-center gap-2"
              >
                <FaEdit /> تعديل
              </button>
              <button
                onClick={() => viewConversations(bot._id)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors text-amber-500 text-sm flex items-center justify-center gap-2"
              >
                <FaEye /> محادثات
              </button>
              <button
                onClick={() => handleDelete(bot._id)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-500 text-sm flex items-center justify-center gap-2"
              >
                <FaTrash /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBots.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaComments className="text-6xl text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد بوتات</h3>
          <p className="text-[var(--text-secondary)]">لم يتم العثور على أي بوتات محادثة</p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaComments className="text-primary" />
                {selectedBot ? 'تعديل البوت' : 'إضافة بوت جديد'}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">اسم البوت *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input w-full"
                    required
                  />
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
                        {`${lang.flag} ${lang.name}`}
                      </option>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">رسالة الترحيب</label>
                  <input
                    type="text"
                    value={formData.greeting}
                    onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">رسالة الخطأ</label>
                  <input
                    type="text"
                    value={formData.fallbackMessage}
                    onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">وقت الاستجابة (ثانية)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.responseTime}
                    onChange={(e) => setFormData({ ...formData, responseTime: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">الحد الأقصى للرسائل</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={formData.maxMessagesPerSession}
                    onChange={(e) => setFormData({ ...formData, maxMessagesPerSession: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">الفئات</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {categoryOptions.map(cat => (
                      <label key={cat.value} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-input)] text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, categories: [...formData.categories, cat.value] });
                            } else {
                              setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat.value) });
                            }
                          }}
                          className="form-checkbox"
                        />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">القنوات المسموح بها</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {channels.map(channel => (
                    <label key={channel.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.allowedChannels.includes(channel.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, allowedChannels: [...formData.allowedChannels, channel.value] });
                          } else {
                            setFormData({ ...formData, allowedChannels: formData.allowedChannels.filter(c => c !== channel.value) });
                          }
                        }}
                        className="form-checkbox"
                      />
                      <span className="text-sm">{channel.label}</span>
                    </label>
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
                    checked={formData.autoReply}
                    onChange={(e) => setFormData({ ...formData, autoReply: e.target.checked })}
                    className="form-checkbox"
                  />
                  <span className="text-sm">رد تلقائي</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  <FaSave /> {selectedBot ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conversations Modal */}
      {isConversationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsConversationModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaComments className="text-primary" />
                محادثات {selectedBot?.name}
              </h3>
              <button onClick={() => setIsConversationModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {conversations.filter(c => c.botId === selectedBot?._id).map((conv) => (
                <div key={conv._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaUser className="text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{conv.userName || 'مستخدم'}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {new Date(conv.createdAt).toLocaleString('ar-DZ')}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      conv.resolved ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {conv.resolved ? 'محلولة' : 'قيد المعالجة'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <FaUser className="text-xs text-[var(--text-secondary)] mt-1" />
                      <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-input)] p-2 rounded-lg flex-1">
                        {conv.messages?.[0]?.content || 'لا توجد رسائل'}
                      </p>
                    </div>
                    {conv.messages?.length > 1 && (
                      <div className="flex items-start gap-2">
                        <FaRobot className="text-xs text-primary mt-1" />
                        <p className="text-sm bg-primary/5 p-2 rounded-lg flex-1">
                          {conv.messages[conv.messages.length - 1]?.content || 'رد البوت'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotManagement;