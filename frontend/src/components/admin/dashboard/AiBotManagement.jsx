import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaRobot, FaPlus, FaEdit, FaTrash, FaEye, FaSync, 
  FaToggleOn, FaToggleOff, FaCog, FaBrain, FaMicrochip,
  FaLanguage, FaSave, FaTimes, FaSearch, FaFilter,
  FaCheckCircle, FaExclamationCircle, FaClock, FaChartLine,
  FaDatabase, FaCloudUploadAlt, FaDownload, FaCode,
  FaNetworkWired, FaShieldAlt, FaBolt, FaStar, FaPaperPlane,
  FaImage
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const AiBotManagement = () => {
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: 'gpt-4',
    provider: 'openai',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    isActive: true,
    allowedFor: ['admin', 'seller', 'user'],
    dailyLimit: 100,
    monthlyLimit: 3000,
    costPerRequest: 0.01
  });
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeChatBot, setActiveChatBot] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '1000',
    stock: '20',
    category: 'topup',
    productType: 'digital',
  });
  const [productCreating, setProductCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchBots();
    }
  }, [user]);

  const fetchBots = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/ai-bots');
      setBots(response.data.bots || []);
    } catch (error) {
      console.error('Error fetching AI bots:', error);
      toast.error('حدث خطأ في جلب بيانات البوتات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBot) {
        await api.put(`/admin/ai-bots/${selectedBot._id}`, formData);
        toast.success('تم تحديث البوت بنجاح');
      } else {
        await api.post('/admin/ai-bots', formData);
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
      await api.delete(`/admin/ai-bots/${id}`);
      toast.success('تم حذف البوت بنجاح');
      fetchBots();
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast.error('حدث خطأ في حذف البوت');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/ai-bots/${id}/toggle`, { isActive: !currentStatus });
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} البوت بنجاح`);
      fetchBots();
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast.error('حدث خطأ في تغيير حالة البوت');
    }
  };

  const updateAvailability = async (id, status) => {
    try {
      const response = await api.patch(`/admin/ai-bots/${id}/availability`, { status });
      toast.success(status === 'online' ? 'تم توصيل البوت على الإنترنت' : 'تم تبديل البوت إلى وضع غير متصل');
      setBots((prev) => prev.map((bot) => bot._id === id ? response.data.bot : bot));
    } catch (error) {
      console.error('Error updating bot availability:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في تحديث حالة الاتصال');
    }
  };

  const openModal = (bot = null) => {
    if (bot) {
      setSelectedBot(bot);
      setFormData({
        name: bot.name,
        description: bot.description,
        model: bot.model,
        provider: bot.provider,
        apiKey: bot.apiKey || '',
        temperature: bot.temperature,
        maxTokens: bot.maxTokens,
        systemPrompt: bot.systemPrompt || '',
        isActive: bot.isActive,
        status: bot.status || 'offline',
        allowedFor: bot.allowedFor || ['admin', 'seller', 'user'],
        dailyLimit: bot.dailyLimit || 100,
        monthlyLimit: bot.monthlyLimit || 3000,
        costPerRequest: bot.costPerRequest || 0.01
      });
    } else {
      setSelectedBot(null);
      setFormData({
        name: '',
        description: '',
        model: 'gpt-4',
        provider: 'openai',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: '',
        isActive: true,
        status: 'offline',
        allowedFor: ['admin', 'seller', 'user'],
        dailyLimit: 100,
        monthlyLimit: 3000,
        costPerRequest: 0.01
      });
    }
    setChatPrompt('');
    setChatResponse('');
    setActiveChatBot(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBot(null);
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
    totalRequests: bots.reduce((acc, b) => acc + (b.totalRequests || 0), 0)
  };

  const openChatModal = (bot) => {
    if (!bot?.isActive) {
      toast.error('هذا البوت غير مفعل');
      return;
    }
    setActiveChatBot(bot);
    setChatPrompt('');
    setChatResponse('');
    setIsChatModalOpen(true);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setActiveChatBot(null);
    setChatPrompt('');
    setChatResponse('');
  };

  const submitChat = async (e) => {
    e.preventDefault();
    if (!activeChatBot) return;
    if (!chatPrompt.trim()) {
      toast.error('الرجاء إدخال نص الاستعلام');
      return;
    }

    setChatLoading(true);
    setChatResponse('');
    try {
      const response = await api.post(`/admin/ai-bots/${activeChatBot._id}/chat`, { prompt: chatPrompt });
      setChatResponse(response.data.message || 'لا توجد نتائج');
    } catch (error) {
      console.error('Error chatting with bot:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التحدث مع البوت');
    } finally {
      setChatLoading(false);
    }
  };

  const generateImage = async (e) => {
    e.preventDefault();
    if (!imagePrompt.trim()) {
      toast.error('الرجاء إدخال وصف الصورة');
      return;
    }

    setImageLoading(true);
    setGeneratedImageUrl('');
    try {
      const response = await api.post('/admin/ai-bots/image/generate', { prompt: imagePrompt });
      setGeneratedImageUrl(response.data.imageUrl || '');
      setProductForm((prev) => ({ ...prev, name: prev.name || imagePrompt.slice(0, 40) }));
      toast.success('تم توليد الصورة بنجاح');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء توليد الصورة');
    } finally {
      setImageLoading(false);
    }
  };

  const uploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/admin/ai-bots/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGeneratedImageUrl(response.data.imageUrl || '');
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const createProductFromGeneratedImage = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.error('الرجاء إدخال اسم المنتج');
      return;
    }

    setProductCreating(true);
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description || `منتج تم إنشاؤه عبر الذكاء الاصطناعي - ${productForm.name}`,
        price: Number(productForm.price || 1000),
        stock: Number(productForm.stock || 20),
        category: productForm.category,
        productType: productForm.productType,
        imageUrl: generatedImageUrl,
      };

      const response = await api.post('/admin/ai-bots/active/product', payload);
      toast.success('تم إنشاء المنتج بنجاح');
      setProductForm({ name: '', description: '', price: '1000', stock: '20', category: 'topup', productType: 'digital' });
      setGeneratedImageUrl('');
      setImagePrompt('');
    } catch (error) {
      console.error('Error creating generated product:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء المنتج');
    } finally {
      setProductCreating(false);
    }
  };

  const models = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3', label: 'Claude 3' },
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'llama-2', label: 'Llama 2' },
    { value: 'mistral', label: 'Mistral' }
  ];

  const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google' },
    { value: 'meta', label: 'Meta' },
    { value: 'mistral', label: 'Mistral AI' }
  ];

  const roleOptions = [
    { value: 'admin', label: 'مدير' },
    { value: 'seller', label: 'بائع' },
    { value: 'user', label: 'مستخدم' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaRobot className="text-primary text-3xl" />
            إدارة البوتات الذكية
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            إدارة البوتات الذكية المدعومة بالذكاء الاصطناعي للمنصة
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
          <div className="text-2xl text-primary mb-1"><FaRobot /></div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي البوتات</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-emerald-500 mb-1"><FaCheckCircle /></div>
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-[var(--text-secondary)]">نشطة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-red-500 mb-1"><FaExclamationCircle /></div>
          <div className="text-2xl font-bold">{stats.inactive}</div>
          <div className="text-xs text-[var(--text-secondary)]">غير نشطة</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-2xl text-amber-500 mb-1"><FaChartLine /></div>
          <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي الطلبات</div>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <FaImage /> مولد الصور بالذكاء الاصطناعي
        </div>
        <form onSubmit={generateImage} className="space-y-3">
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            className="form-input w-full min-h-[100px]"
            placeholder="اكتب وصفًا للصورة مثل: صورة منتج رقمي عصري لبطاقة شحن بالألوان الزرقاء..."
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={imageLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              <FaImage /> {imageLoading ? 'جاري التوليد...' : 'توليد الصورة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setImagePrompt('');
                setGeneratedImageUrl('');
              }}
              className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]"
            >
              مسح
            </button>
          </div>
        </form>
        {generatedImageUrl && (
          <div className="space-y-3">
            <div className="text-sm text-[var(--text-secondary)]">معاينة الصورة</div>
            <img src={generatedImageUrl} alt="Generated preview" className="w-full max-h-72 object-cover rounded-2xl border border-[var(--border-color)]" />
            <div className="flex flex-wrap gap-3">
              <a href={generatedImageUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                فتح الصورة في نافذة جديدة
              </a>
              <button
                type="button"
                onClick={() => {
                  setProductForm((prev) => ({ ...prev, name: prev.name || imagePrompt.slice(0, 40) }));
                  toast.success('تم اعتماد الصورة الحالية كصورة افتراضية للمنتج');
                }}
                className="text-sm text-emerald-600 underline"
              >
                استخدام هذه الصورة كصورة افتراضية
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-[var(--border-color)] pt-4 space-y-2">
          <label className="form-label">أو ارفع صورة من جهازك</label>
          <input
            type="file"
            accept="image/*"
            onChange={uploadImageFile}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {uploadingImage && <div className="text-sm text-[var(--text-secondary)]">جاري رفع الصورة...</div>}
        </div>

        <form onSubmit={createProductFromGeneratedImage} className="space-y-3 border-t border-[var(--border-color)] pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">اسم المنتج</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="form-input w-full"
                placeholder="مثال: شحن جوال 1000"
              />
            </div>
            <div>
              <label className="form-label">السعر</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="form-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">المخزون</label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="form-label">التصنيف</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="form-input w-full"
              >
                <option value="topup">شحن</option>
                <option value="giftcards">بطاقات</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">الوصف</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="form-input w-full min-h-[90px]"
              placeholder="أدخل وصف المنتج"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={productCreating || !generatedImageUrl}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              <FaPlus /> {productCreating ? 'جاري الإنشاء...' : 'إنشاء المنتج'}
            </button>
            <span className="text-sm text-[var(--text-secondary)]">
              {generatedImageUrl ? 'الصورة جاهزة للاستخدام' : 'يجب توليد صورة أولاً'}
            </span>
          </div>
        </form>
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
          onClick={fetchBots}
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
                  <FaBrain className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{bot.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{bot.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {bot.model}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {bot.provider}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => toggleStatus(bot._id, bot.isActive)}
                  className={`text-lg ${bot.isActive ? 'text-emerald-500' : 'text-red-500'}`}
                  title={bot.isActive ? 'مفعل' : 'غير مفعل'}
                >
                  {bot.isActive ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${bot.status === 'online' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                  {bot.status === 'online' ? 'متصل' : 'غير متصل'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">الحد اليومي</div>
                <div className="text-sm font-semibold">{bot.dailyLimit || 100}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">الحد الشهري</div>
                <div className="text-sm font-semibold">{bot.monthlyLimit || 3000}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)]">التكلفة</div>
                <div className="text-sm font-semibold text-primary">${bot.costPerRequest || 0.01}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateAvailability(bot._id, 'online')}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm flex items-center justify-center gap-2"
                >
                  <FaNetworkWired /> متصل
                </button>
                <button
                  onClick={() => updateAvailability(bot._id, 'offline')}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-sm flex items-center justify-center gap-2"
                >
                  <FaShieldAlt /> غير متصل
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(bot)}
                  className="flex-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary text-sm flex items-center justify-center gap-2"
                >
                  <FaEdit /> تعديل
                </button>
              <button
                onClick={() => openChatModal(bot)}
                className="flex-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-sky-600 text-sm flex items-center justify-center gap-2"
              >
                <FaPaperPlane /> تجربة
              </button>
                <button
                  onClick={() => handleDelete(bot._id)}
                  className="flex-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-500 text-sm flex items-center justify-center gap-2"
                >
                  <FaTrash /> حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBots.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaRobot className="text-6xl text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد بوتات</h3>
          <p className="text-[var(--text-secondary)]">لم يتم العثور على أي بوتات ذكية</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaRobot className="text-primary" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">النموذج</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="form-input w-full"
                  >
                    {models.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">مفتاح API</label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="form-input w-full"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">درجة الحرارة</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">الحد الأقصى للرموز</label>
                  <input
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">التكلفة لكل طلب ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.costPerRequest}
                    onChange={(e) => setFormData({ ...formData, costPerRequest: parseFloat(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">التعليمات النظامية</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="form-input w-full"
                  rows="3"
                  placeholder="أنت مساعد ذكي متخصص في ..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">الحد اليومي</label>
                  <input
                    type="number"
                    value={formData.dailyLimit}
                    onChange={(e) => setFormData({ ...formData, dailyLimit: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">الحد الشهري</label>
                  <input
                    type="number"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">الأدوار المسموح لها</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {roleOptions.map(role => (
                    <label key={role.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.allowedFor.includes(role.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, allowedFor: [...formData.allowedFor, role.value] });
                          } else {
                            setFormData({ ...formData, allowedFor: formData.allowedFor.filter(r => r !== role.value) });
                          }
                        }}
                        className="form-checkbox"
                      />
                      <span className="text-sm">{role.label}</span>
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

      {isChatModalOpen && activeChatBot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeChatModal}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaPaperPlane className="text-primary" />
                دردشة مع {activeChatBot.name}
              </h3>
              <button onClick={closeChatModal} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="card p-4 bg-[var(--bg-input)] rounded-2xl">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">أرسل سؤالاً إلى البوت الذكي الخاص بك، وسيتم عرض الاستجابة هنا.</p>
                  <form onSubmit={submitChat} className="space-y-4">
                    <textarea
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      className="form-input w-full min-h-[120px]"
                      placeholder="اكتب استفسارك هنا..."
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaPaperPlane /> {chatLoading ? 'جاري الإرسال...' : 'إرسال'}
                    </button>
                  </form>
                </div>

                <div className="card p-4 bg-[var(--bg-input)] rounded-2xl">
                  <h4 className="font-semibold mb-2">استجابة البوت</h4>
                  <div className="min-h-[120px] rounded-2xl border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                    {chatLoading ? 'انتظر لحظة...' : chatResponse || 'ستظهر الاستجابة هنا بعد إرسال الاستعلام.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiBotManagement;