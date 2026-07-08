import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaBolt,
  FaChevronLeft,
  FaClock,
  FaGamepad,
  FaMobileAlt,
  FaShieldAlt,
  FaTrophy,
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const gameBrands = [
  { id: 'pubg', name: 'PUBG Mobile', icon: <FaGamepad />, search: 'pubg', hint: 'UC فوري خلال دقائق' },
  { id: 'freefire', name: 'Free Fire', icon: <FaBolt />, search: 'free fire', hint: 'Diamonds instant top-up' },
  { id: 'mlbb', name: 'Mobile Legends', icon: <FaGamepad />, search: 'mobile legends', hint: 'شحن موجه بحسب ID' },
];

const mobileBrands = [
  { id: 'inwi', name: 'Inwi', icon: <FaMobileAlt />, search: 'inwi', hint: 'تعبئة مباشرة' },
  { id: 'orange', name: 'Orange', icon: <FaMobileAlt />, search: 'orange', hint: 'رصيد فوري' },
  { id: 'iam', name: 'Maroc Telecom', icon: <FaMobileAlt />, search: 'maroc telecom', hint: 'Topup سريع' },
];

const serviceRules = {
  pubg: {
    playerIdLabel: 'Player ID',
    playerIdPlaceholder: 'مثال: 123456789',
    playerIdRequired: true,
    serverRequired: false,
    serverLabel: 'Server ID (اختياري)',
    serverPlaceholder: 'اختياري',
    idPattern: /^\d{6,20}$/,
    idError: 'Player ID يجب أن يكون أرقام فقط (6 إلى 20 رقم)',
  },
  freefire: {
    playerIdLabel: 'Player ID',
    playerIdPlaceholder: 'مثال: 987654321',
    playerIdRequired: true,
    serverRequired: false,
    serverLabel: 'Server ID (اختياري)',
    serverPlaceholder: 'اختياري',
    idPattern: /^\d{6,20}$/,
    idError: 'Player ID يجب أن يكون أرقام فقط (6 إلى 20 رقم)',
  },
  mlbb: {
    playerIdLabel: 'Game ID',
    playerIdPlaceholder: 'مثال: 12345678',
    playerIdRequired: true,
    serverRequired: true,
    serverLabel: 'Server ID',
    serverPlaceholder: 'مثال: 2101',
    idPattern: /^\d{6,20}$/,
    idError: 'Game ID يجب أن يكون أرقام فقط (6 إلى 20 رقم)',
  },
  inwi: {
    playerIdLabel: 'رقم الهاتف المراد شحنه',
    playerIdPlaceholder: 'مثال: 06XXXXXXXX',
    playerIdRequired: true,
    serverRequired: false,
    serverLabel: 'مرجع إضافي (اختياري)',
    serverPlaceholder: 'اختياري',
    idPattern: /^\d{10,15}$/,
    idError: 'رقم الشحن يجب أن يكون أرقام فقط (10 إلى 15 رقم)',
  },
  orange: {
    playerIdLabel: 'رقم الهاتف المراد شحنه',
    playerIdPlaceholder: 'مثال: 06XXXXXXXX',
    playerIdRequired: true,
    serverRequired: false,
    serverLabel: 'مرجع إضافي (اختياري)',
    serverPlaceholder: 'اختياري',
    idPattern: /^\d{10,15}$/,
    idError: 'رقم الشحن يجب أن يكون أرقام فقط (10 إلى 15 رقم)',
  },
  iam: {
    playerIdLabel: 'رقم الهاتف المراد شحنه',
    playerIdPlaceholder: 'مثال: 06XXXXXXXX',
    playerIdRequired: true,
    serverRequired: false,
    serverLabel: 'مرجع إضافي (اختياري)',
    serverPlaceholder: 'اختياري',
    idPattern: /^\d{10,15}$/,
    idError: 'رقم الشحن يجب أن يكون أرقام فقط (10 إلى 15 رقم)',
  },
};

const getDeliveryEstimate = (product, brandId) => {
  const name = `${product?.name?.en || ''} ${product?.name?.ar || ''}`.toLowerCase();
  if (name.includes('instant') || name.includes('فوري')) return '5 - 15 دقيقة';
  if (brandId === 'mlbb') return '10 - 25 دقيقة';
  if (brandId === 'inwi' || brandId === 'orange' || brandId === 'iam') return '1 - 10 دقائق';
  return '5 - 30 دقيقة';
};

const Recharge = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('games');
  const [topupProducts, setTopupProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('pubg');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    playerId: '',
    serverId: '',
    email: '',
    phone: '',
    quantity: 1,
    note: '',
  });

  const activeBrands = activeTab === 'games' ? gameBrands : mobileBrands;
  const selectedRule = serviceRules[selectedBrand] || serviceRules.pubg;

  useEffect(() => {
    setSelectedBrand(activeTab === 'games' ? 'pubg' : 'inwi');
    setSelectedPackageId('');
    setFieldErrors({});
    setFormData((prev) => ({ ...prev, serverId: '' }));
  }, [activeTab]);

  useEffect(() => {
    const fetchTopupProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get('/products', {
          params: {
            category: 'topup',
            limit: 50,
            sort: 'newest',
          },
        });
        setTopupProducts(res.data.products || []);
      } catch (error) {
        console.error('Failed to load topup products:', error);
        toast.error('تعذر تحميل باقات الشحن');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchTopupProducts();
  }, []);

  const filteredPackages = useMemo(() => {
    const selectedMeta = activeBrands.find((item) => item.id === selectedBrand);
    if (!selectedMeta) return topupProducts;

    const bySearch = topupProducts.filter((product) => {
      const nameEn = product?.name?.en || '';
      const nameAr = product?.name?.ar || '';
      const key = selectedMeta.search.toLowerCase();
      return nameEn.toLowerCase().includes(key) || nameAr.toLowerCase().includes(key);
    });

    return bySearch.length > 0 ? bySearch : topupProducts;
  }, [activeBrands, selectedBrand, topupProducts]);

  useEffect(() => {
    if (!filteredPackages.length) {
      setSelectedPackageId('');
      return;
    }

    setSelectedPackageId((prev) => {
      if (prev && filteredPackages.some((item) => item._id === prev)) {
        return prev;
      }
      return filteredPackages[0]._id;
    });
  }, [filteredPackages]);

  const selectedPackage = filteredPackages.find((item) => item._id === selectedPackageId) || null;
  const deliveryEta = selectedPackage ? getDeliveryEstimate(selectedPackage, selectedBrand) : '-';
  const quantity = Number(formData.quantity) || 1;
  const totalPrice = selectedPackage ? (selectedPackage.price || 0) * quantity : 0;

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateBeforeCheckout = () => {
    const errors = {};

    if (selectedRule.playerIdRequired) {
      if (!formData.playerId.trim()) {
        errors.playerId = 'هذا الحقل مطلوب';
      } else if (selectedRule.idPattern && !selectedRule.idPattern.test(formData.playerId.trim())) {
        errors.playerId = selectedRule.idError;
      }
    }

    if (selectedRule.serverRequired && !formData.serverId.trim()) {
      errors.serverId = 'Server ID مطلوب لهذه الخدمة';
    }

    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\d{8,15}$/.test(formData.phone.trim())) {
      errors.phone = 'رقم الهاتف يجب أن يكون أرقام فقط (8 إلى 15 رقم)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openTopupShop = () => {
    const params = new URLSearchParams({ category: 'topup' });
    const brand = activeBrands.find((item) => item.id === selectedBrand);
    if (brand?.search) params.set('search', brand.search);
    navigate(`/shop?${params.toString()}`);
  };

  const handleContinueToCheckout = async () => {
    if (!selectedPackage) {
      toast.error('اختر باقة شحن أولاً');
      return;
    }
    if (!validateBeforeCheckout()) {
      toast.error('تحقق من البيانات المدخلة قبل المتابعة');
      return;
    }

    setSubmitting(true);
    let validatedPayload = null;
    try {
      const validationResponse = await api.post('/orders/validate-recharge', {
        serviceId: selectedBrand,
        serviceType: activeTab,
        playerId: formData.playerId.trim(),
        serverId: formData.serverId.trim(),
      });
      validatedPayload = validationResponse.data?.data || null;
    } catch (validationError) {
      setSubmitting(false);
      toast.error(validationError.response?.data?.message || 'تعذر التحقق من بيانات الحساب');
      return;
    }

    const result = await addToCart(selectedPackage._id, quantity);
    setSubmitting(false);

    if (result?.success) {
      toast.success('تمت إضافة باقة الشحن، أكمل الدفع الآن');
      navigate('/checkout', {
        state: {
          rechargeMeta: {
            serviceId: selectedBrand,
            serviceType: activeTab,
            service: activeBrands.find((item) => item.id === selectedBrand)?.name,
            playerId: formData.playerId,
            serverId: formData.serverId,
            email: formData.email,
            phone: formData.phone,
            note: formData.note,
            validatedAt: validatedPayload?.validatedAt || new Date().toISOString(),
          },
        },
      });
    }
  };

  return (
    <div className="page-transition max-w-7xl mx-auto">
      <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-5 md:px-7">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <FaBolt className="text-primary" />
          {t('recharge.title')}
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          {t('recharge.desc')} - أدخل بيانات الحساب، اختر الباقة، ثم أكمل الدفع فورا.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
            <p className="text-xs font-bold text-primary mb-1">STEP 1</p>
            <h2 className="text-lg font-bold mb-4">اختر نوع الشحن والخدمة</h2>

            <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab('games')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'games'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary/50'
                }`}
              >
                <FaGamepad /> شحن ألعاب
              </button>
              <button
                onClick={() => setActiveTab('mobile')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'mobile'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary/50'
                }`}
              >
                <FaMobileAlt /> شحن رصيد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`text-right rounded-xl border px-4 py-4 transition-all ${
                    selectedBrand === brand.id
                      ? 'border-primary bg-primary/10'
                      : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg text-primary">{brand.icon}</span>
                    {selectedBrand === brand.id && <span className="text-xs font-bold text-primary">محدد</span>}
                  </div>
                  <p className="font-bold text-sm">{brand.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{brand.hint}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
            <p className="text-xs font-bold text-primary mb-1">STEP 2</p>
            <h2 className="text-lg font-bold mb-4">بيانات اللاعب والمستلم</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-semibold mb-1 block">{selectedRule.playerIdLabel}</span>
                <input
                  type="text"
                  value={formData.playerId}
                  onChange={(e) => updateField('playerId', e.target.value)}
                  className={`form-input w-full ${fieldErrors.playerId ? 'border-red-500' : ''}`}
                  placeholder={selectedRule.playerIdPlaceholder}
                />
                {fieldErrors.playerId && <p className="text-xs text-red-500 mt-1">{fieldErrors.playerId}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold mb-1 block">
                  {selectedRule.serverLabel}
                  {selectedRule.serverRequired && <span className="text-red-500 mr-1">*</span>}
                </span>
                <input
                  type="text"
                  value={formData.serverId}
                  onChange={(e) => updateField('serverId', e.target.value)}
                  className={`form-input w-full ${fieldErrors.serverId ? 'border-red-500' : ''}`}
                  placeholder={selectedRule.serverPlaceholder}
                />
                {fieldErrors.serverId && <p className="text-xs text-red-500 mt-1">{fieldErrors.serverId}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold mb-1 block">البريد الإلكتروني</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`form-input w-full ${fieldErrors.email ? 'border-red-500' : ''}`}
                  placeholder="name@email.com"
                />
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold mb-1 block">رقم الهاتف</span>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`form-input w-full ${fieldErrors.phone ? 'border-red-500' : ''}`}
                  placeholder="05XXXXXXXX"
                />
                {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary mb-1">STEP 3</p>
                <h2 className="text-lg font-bold">اختر الباقة</h2>
              </div>
              <button
                onClick={openTopupShop}
                className="text-sm font-semibold text-primary inline-flex items-center gap-1"
              >
                عرض كل الباقات
                <FaChevronLeft className="text-xs" />
              </button>
            </div>

            {loadingProducts ? (
              <div className="py-6 text-center text-[var(--text-secondary)]">جاري تحميل باقات الشحن...</div>
            ) : filteredPackages.length === 0 ? (
              <div className="py-6 text-center text-[var(--text-secondary)]">لا توجد باقات شحن متاحة حاليا.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPackages.map((pkg) => {
                  const active = selectedPackageId === pkg._id;
                  return (
                    <button
                      key={pkg._id}
                      onClick={() => setSelectedPackageId(pkg._id)}
                      className={`text-right rounded-xl border p-4 transition-all ${
                        active
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                          : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-primary/40'
                      }`}
                    >
                      <p className="font-bold text-sm mb-1">{pkg.name?.ar || pkg.name?.en || 'Recharge Package'}</p>
                      <p className="text-xs text-[var(--text-secondary)] mb-3">
                        {pkg.description?.ar || pkg.description?.en || 'شحن رقمي فوري'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mb-2">التسليم المتوقع: {getDeliveryEstimate(pkg, selectedBrand)}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-black text-lg">${Number(pkg.price || 0).toFixed(2)}</span>
                        {active && <span className="text-xs font-bold text-primary">مختار</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="xl:sticky xl:top-20 h-fit space-y-4">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
            <h3 className="text-lg font-black mb-4">ملخص الطلب</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-secondary)]">الخدمة</span>
                <span className="font-semibold">{activeBrands.find((item) => item.id === selectedBrand)?.name || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-secondary)]">الباقة</span>
                <span className="font-semibold text-left">{selectedPackage?.name?.ar || selectedPackage?.name?.en || '-'}</span>
              </div>
              <div className="flex justify-between gap-4 items-center">
                <span className="text-[var(--text-secondary)]">الكمية</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.quantity}
                  onChange={(e) => updateField('quantity', Math.max(1, Number(e.target.value) || 1))}
                  className="form-input w-20 text-center"
                />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-secondary)]">التسليم المتوقع</span>
                <span className="font-semibold">{deliveryEta}</span>
              </div>
              <div className="border-t border-[var(--border-color)] pt-3 flex justify-between items-center">
                <span className="font-bold">الإجمالي</span>
                <span className="text-2xl font-black text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <label className="block mt-4">
              <span className="text-xs text-[var(--text-secondary)] mb-1 block">ملاحظات الطلب (اختياري)</span>
              <textarea
                rows={3}
                value={formData.note}
                onChange={(e) => updateField('note', e.target.value)}
                className="form-input w-full"
                placeholder="أي معلومات إضافية تساعدنا في تسريع الشحن"
              />
            </label>

            <button
              onClick={handleContinueToCheckout}
              disabled={submitting || !selectedPackage}
              className="w-full mt-4 py-3 rounded-xl btn-primary text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? 'جاري إضافة الطلب...' : 'إضافة للسلة وإكمال الدفع'}
              <FaChevronLeft className="text-xs" />
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] px-3 py-2 text-center">
                <FaBolt className="mx-auto text-primary mb-1" />
                <p className="text-[11px] font-semibold">Instant Delivery</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] px-3 py-2 text-center">
                <FaShieldAlt className="mx-auto text-emerald-500 mb-1" />
                <p className="text-[11px] font-semibold">Secure Payment</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
            <div className="card text-center">
              <FaClock className="text-xl text-amber-500 mx-auto mb-1" />
              <p className="text-xs font-semibold">خدمة سريعة 24/7</p>
            </div>
            <div className="card text-center">
              <FaTrophy className="text-xl text-primary mx-auto mb-1" />
              <p className="text-xs font-semibold">أسعار تنافسية</p>
            </div>
            <div className="card text-center">
              <FaShieldAlt className="text-xl text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-semibold">حماية كاملة</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Recharge;
