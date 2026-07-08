// src/components/admin/CodesManagement.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaKey, FaGift, FaPlus, FaTrash, FaEdit, FaSearch,
  FaFilter, FaDownload, FaCheck, FaTimes, FaClock,
  FaCopy, FaEye, FaSync, FaFileExport, FaUpload,
  FaQrcode, FaTag, FaCalendar, FaUser, FaPrint
} from 'react-icons/fa';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CodesManagement = () => {
  const { t, formatCurrency } = useLanguage();
  const [activeTab, setActiveTab] = useState('giftcards');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [promoCodes, setPromoCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [isProductCodeModalOpen, setIsProductCodeModalOpen] = useState(false);
  const [newProductCode, setNewProductCode] = useState({ productId: '', count: 1, expiresAt: '' });

  // بيانات بطاقات الهدايا
  const [giftCards, setGiftCards] = useState([]);

  // بيانات أكواد المنتجات
  const [productCodes, setProductCodes] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [giftCardsResponse, promoCodesResponse, productCodesResponse, productsResponse] = await Promise.all([
        api.get('/admin/gift-cards').catch(() => ({ data: { giftCards: [] } })),
        api.get('/admin/promo-codes').catch(() => ({ data: { promoCodes: [] } })),
        api.get('/admin/product-codes').catch(() => ({ data: { codes: [] } })),
        api.get('/admin/products').catch(() => ({ data: { products: [] } })),
      ]);

      setGiftCards(giftCardsResponse.data?.giftCards || []);
      setProductCodes(productCodesResponse.data?.codes || []);
      setProducts(productsResponse.data?.products || []);

      if (promoCodesResponse.data?.promoCodes) {
        setPromoCodes(promoCodesResponse.data.promoCodes);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
      toast.error('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const generateGiftCard = () => {
    api.post('/admin/gift-cards', {
      code: `GIFT-${Date.now().toString(36).toUpperCase()}`,
      value: 10,
      currency: 'USD',
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    })
      .then((response) => {
        setGiftCards((currentGiftCards) => [response.data?.giftCard, ...currentGiftCards]);
        toast.success(`✅ تم إنشاء بطاقة هدايا جديدة: ${response.data?.giftCard?.code || ''}`);
      })
      .catch((error) => {
        console.error('Error creating gift card:', error);
        toast.error('حدث خطأ في إنشاء بطاقة الهدايا');
      });
  };

  const generateProductCode = () => {
    if (products.length === 0) {
      toast.error('لا توجد منتجات متاحة لتوليد الأكواد');
      return;
    }

    setNewProductCode((current) => ({ ...current, productId: current.productId || products[0]._id }));
    setIsProductCodeModalOpen(true);
  };

  const submitProductCodeGeneration = async () => {
    try {
      const response = await api.post('/admin/product-codes', newProductCode);
      setProductCodes((currentProductCodes) => [...(response.data?.codes || []), ...currentProductCodes]);
      setIsProductCodeModalOpen(false);
      toast.success('✅ تم توليد الأكواد بنجاح');
    } catch (error) {
      console.error('Error generating product codes:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في توليد الأكواد');
    }
  };

  const deleteCode = async (id, type) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكود؟')) return;
    try {
      if (type === 'giftcard') {
        await api.delete(`/admin/gift-cards/${id}`);
        setGiftCards((currentGiftCards) => currentGiftCards.filter((card) => card._id !== id));
      } else {
        await api.delete(`/admin/product-codes/${id}`);
        setProductCodes((currentProductCodes) => currentProductCodes.filter((code) => code._id !== id));
      }
      toast.success('✅ تم حذف الكود بنجاح');
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.error('حدث خطأ في حذف الكود');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('✅ تم نسخ الكود إلى الحافظة');
  };

  const toggleUsedStatus = async (id, type) => {
    try {
      if (type === 'giftcard') {
        const card = giftCards.find((item) => item._id === id);
        await api.put(`/admin/gift-cards/${id}`, { isUsed: !card?.isUsed });
        setGiftCards((currentGiftCards) => currentGiftCards.map((cardItem) => (
          cardItem._id === id ? { ...cardItem, isUsed: !cardItem.isUsed } : cardItem
        )));
      } else {
        const code = productCodes.find((item) => item._id === id);
        await api.put(`/admin/product-codes/${id}`, { isUsed: !code?.isUsed });
        setProductCodes((currentProductCodes) => currentProductCodes.map((codeItem) => (
          codeItem._id === id ? { ...codeItem, isUsed: !codeItem.isUsed } : codeItem
        )));
      }
      toast.success('✅ تم تحديث حالة الكود');
    } catch (error) {
      console.error('Error updating code status:', error);
      toast.error('حدث خطأ في تحديث حالة الكود');
    }
  };

  const exportCodes = (type) => {
    const data = type === 'giftcard' ? giftCards : productCodes;
    const headers = type === 'giftcard' 
      ? ['الكود', 'القيمة', 'العملة', 'الحالة', 'المستخدم', 'تاريخ الانتهاء']
      : ['الكود', 'المنتج', 'الحالة', 'الطلب', 'تاريخ الإنشاء'];
    
    const rows = data.map(item => {
      if (type === 'giftcard') {
        return [
          item.code,
          item.value,
          item.currency,
          item.isUsed ? 'مستخدم' : 'نشط',
          item.usedBy?.name || '—',
          new Date(item.expiresAt).toLocaleDateString('ar-DZ')
        ];
      } else {
        return [
          item.code,
          item.productId?.name?.ar || 'غير معروف',
          item.isUsed ? 'مستخدم' : 'نشط',
          item.orderId?.orderNumber || '—',
          new Date(item.createdAt).toLocaleDateString('ar-DZ')
        ];
      }
    });

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(`✅ تم تصدير ${type === 'giftcard' ? 'بطاقات الهدايا' : 'أكواد المنتجات'} بنجاح`);
  };

  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = card.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !card.isUsed) ||
                         (filterStatus === 'used' && card.isUsed);
    return matchesSearch && matchesStatus;
  });

  const filteredProductCodes = productCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          code.productId?.name?.ar?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !code.isUsed) ||
                         (filterStatus === 'used' && code.isUsed);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الأكواد والبطاقات</h2>
          <p className="text-sm text-[var(--text-secondary)]">إدارة أكواد المنتجات وبطاقات الهدايا</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'giftcards' ? (
            <button 
              onClick={generateGiftCard}
              className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
            >
              <FaPlus /> إضافة بطاقة
            </button>
          ) : (
            <button 
              onClick={generateProductCode}
              className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
            >
              <FaPlus /> توليد كود
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaPrint /> طباعة
          </button>
          <button 
            onClick={() => exportCodes(activeTab)}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaDownload /> تصدير
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('giftcards')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'giftcards'
              ? 'border-primary text-primary'
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <FaGift className="inline ml-1" /> بطاقات الهدايا
        </button>
        <button
          onClick={() => setActiveTab('productcodes')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'productcodes'
              ? 'border-primary text-primary'
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <FaKey className="inline ml-1" /> أكواد المنتجات
        </button>
      </div>

      {activeTab === 'productcodes' && isProductCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">توليد أكواد منتجات</h3>
              <button onClick={() => setIsProductCodeModalOpen(false)}><FaTimes /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label text-xs">المنتج</label>
                <select
                  value={newProductCode.productId}
                  onChange={(e) => setNewProductCode((current) => ({ ...current, productId: e.target.value }))}
                  className="form-input w-full text-sm"
                >
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name?.ar || product.name?.en || product._id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label text-xs">العدد</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newProductCode.count}
                  onChange={(e) => setNewProductCode((current) => ({ ...current, count: Number(e.target.value) || 1 }))}
                  className="form-input w-full text-sm"
                />
              </div>
              <div>
                <label className="form-label text-xs">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={newProductCode.expiresAt}
                  onChange={(e) => setNewProductCode((current) => ({ ...current, expiresAt: e.target.value }))}
                  className="form-input w-full text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={submitProductCodeGeneration} className="flex-1 rounded-xl btn-primary text-white py-2 text-sm">
                  توليد
                </button>
                <button onClick={() => setIsProductCodeModalOpen(false)} className="flex-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] py-2 text-sm">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pr-9 text-sm"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input w-32 text-sm"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="used">مستخدم</option>
          </select>

          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              toast.success('تم إعادة ضبط الفلاتر');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaTimes /> إعادة ضبط
          </button>
        </div>
      </div>

      {activeTab === 'giftcards' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الكود</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">القيمة</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">المستخدم</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">تاريخ الانتهاء</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredGiftCards.map((card) => (
                  <tr key={card._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{card.code}</span>
                        <button
                          onClick={() => copyToClipboard(card.code)}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          <FaCopy className="text-[10px]" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{formatCurrency(card.value)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        card.isUsed ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {card.isUsed ? 'مستخدم' : 'نشط'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">
                      {card.usedBy?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">
                      {new Date(card.expiresAt).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleUsedStatus(card._id, 'giftcard')}
                          className={`w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center ${
                            card.isUsed ? 'text-emerald-500' : 'text-amber-500'
                          }`}
                          title={card.isUsed ? 'إعادة تفعيل' : 'تحديد كمستخدم'}
                        >
                          {card.isUsed ? <FaCheck className="text-xs" /> : <FaClock className="text-xs" />}
                        </button>
                        <button
                          onClick={() => deleteCode(card._id, 'giftcard')}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGiftCards.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <FaGift className="text-3xl mx-auto mb-2 opacity-30" />
              <p>لا توجد بطاقات هدايا مطابقة للبحث</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'productcodes' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الكود</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">المنتج</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الطلب</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">تاريخ الإنشاء</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductCodes.map((code) => (
                  <tr key={code._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{code.code}</span>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          <FaCopy className="text-[10px]" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">{code.productId?.name?.ar || 'غير معروف'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        code.isUsed ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {code.isUsed ? 'مستخدم' : 'نشط'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">
                      {code.orderId?.orderNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">
                      {new Date(code.createdAt).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleUsedStatus(code._id, 'productcode')}
                          className={`w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center ${
                            code.isUsed ? 'text-emerald-500' : 'text-amber-500'
                          }`}
                          title={code.isUsed ? 'إعادة تفعيل' : 'تحديد كمستخدم'}
                        >
                          {code.isUsed ? <FaCheck className="text-xs" /> : <FaClock className="text-xs" />}
                        </button>
                        <button
                          onClick={() => deleteCode(code._id, 'productcode')}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProductCodes.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <FaKey className="text-3xl mx-auto mb-2 opacity-30" />
              <p>لا توجد أكواد منتجات مطابقة للبحث</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodesManagement;