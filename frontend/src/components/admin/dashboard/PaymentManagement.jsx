// src/components/admin/PaymentManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { getSocket } from '../../../services/socket';
import { 
  FaWallet, FaCreditCard, FaBitcoin, FaPaypal, FaCheck,
  FaTimes, FaPlus, FaTrash, FaEdit, FaEye, FaMoneyBillWave,
  FaCreditCard as FaCard, FaUniversity, FaMobileAlt,
  FaSync, FaSearch, FaFilter, FaDownload, FaUpload,
  FaHistory, FaClock, FaArrowUp, FaArrowDown,
  FaFileInvoiceDollar, FaShoppingCart, FaChartLine, FaBalanceScale,
  FaPrint
} from 'react-icons/fa';
import { SiRazorpay, SiStripe, SiPayoneer } from 'react-icons/si';
import toast from 'react-hot-toast';

const PaymentManagement = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [activeTab, setActiveTab] = useState('gateways');
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState([]);

  const getGatewayIcon = (gateway) => {
    const name = `${gateway?.name || ''} ${gateway?.slug || ''} ${gateway?.icon || ''}`.toLowerCase();
    if (name.includes('paypal')) return <FaPaypal />;
    if (name.includes('stripe')) return <SiStripe />;
    if (name.includes('razorpay')) return <SiRazorpay />;
    if (name.includes('payoneer')) return <SiPayoneer />;
    if (name.includes('bank')) return <FaUniversity />;
    if (name.includes('wallet')) return <FaWallet />;
    if (name.includes('mobile') || name.includes('mobi')) return <FaMobileAlt />;
    if (name.includes('credit') || name.includes('card')) return <FaCreditCard />;
    return <FaCard />;
  };

  const fetchGateways = async () => {
    try {
      const api = (await import('../../../services/api')).default;
      const res = await api.get('/admin/payment-gateways');
      if (res.data?.success) {
        setGateways(res.data.gateways.map((g) => ({
          id: g._id,
          name: g.name,
          slug: g.slug || '',
          icon: g.icon || '',
          iconElement: getGatewayIcon(g),
          color: g.color || '#635bff',
          status: g.status || 'inactive',
          config: g.config || {},
        })));
      }
    } catch (e) {
      console.error('fetch gateways error', e);
    }
  };

  const fetchStoreCurrencies = async () => {
    try {
      const res = await api.get('/admin/store');
      const nextCurrencies = res.data?.settings?.payment?.currencies;
      if (Array.isArray(nextCurrencies) && nextCurrencies.length > 0) {
        setCurrencies(nextCurrencies);
      }
    } catch (error) {
      console.error('fetch store currencies error', error);
    }
  };

  const [currencies, setCurrencies] = useState([
    { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 1, status: 'active' },
    { code: 'EUR', name: 'يورو', symbol: '€', rate: 0.92, status: 'active' },
    { code: 'GBP', name: 'جنيه إسترليني', symbol: '£', rate: 0.79, status: 'active' },
    { code: 'DZD', name: 'دينار جزائري', symbol: 'دج', rate: 135, status: 'active' },
    { code: 'BTC', name: 'بيتكوين', symbol: '₿', rate: 0.000015, status: 'active' },
  ]);

  const [transactions, setTransactions] = useState([]);

  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [gatewayFormData, setGatewayFormData] = useState(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isWalletDepositOpen, setIsWalletDepositOpen] = useState(false);
  const [isWalletWithdrawOpen, setIsWalletWithdrawOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletMethod, setWalletMethod] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletActionType, setWalletActionType] = useState('deposit');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const openGatewayModal = (gateway) => {
    setSelectedGateway(gateway);
    setGatewayFormData({
      name: gateway?.name || '',
      slug: gateway?.slug || '',
      icon: gateway?.icon || '',
      color: gateway?.color || '#635bff',
      status: gateway?.status || 'inactive',
      config: { ...(gateway?.config || {}) },
    });
    setIsGatewayModalOpen(true);
  };

  const toggleGatewayStatus = async (gatewayId) => {
    const gateway = gateways.find((g) => g.id === gatewayId);
    if (!gateway) return;

    try {
      const payload = {
        name: gateway.name,
        slug: gateway.slug,
        icon: gateway.icon,
        color: gateway.color,
        status: gateway.status === 'active' ? 'inactive' : 'active',
        config: gateway.config || {},
      };
      const res = await api.put(`/admin/payment-gateways/${gatewayId}`, payload);
      if (res.data?.success) {
        await fetchGateways();
        toast.success(`✅ تم ${payload.status === 'active' ? 'تفعيل' : 'تعطيل'} البوابة بنجاح`);
      }
    } catch (error) {
      console.error('toggle gateway status error', error);
      toast.error('حدث خطأ أثناء تحديث حالة البوابة');
    }
  };

  const handleGatewayFieldChange = (field, value) => {
    setGatewayFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGatewayConfigChange = (key, value) => {
    setGatewayFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const saveGatewaySettings = async () => {
    if (!gatewayFormData) return;

    const payload = {
      name: gatewayFormData.name?.trim() || '',
      slug: gatewayFormData.slug?.trim() || '',
      icon: gatewayFormData.icon?.trim() || '',
      color: gatewayFormData.color?.trim() || '#635bff',
      status: gatewayFormData.status || 'inactive',
      config: gatewayFormData.config || {},
    };

    if (!payload.name) {
      toast.error('الرجاء إدخال اسم البوابة');
      return;
    }

    try {
      if (selectedGateway) {
        const res = await api.put(`/admin/payment-gateways/${selectedGateway.id}`, payload);
        if (res.data?.success) {
          await fetchGateways();
          toast.success(`✅ تم حفظ إعدادات ${payload.name} بنجاح`);
          setIsGatewayModalOpen(false);
          return;
        }
      } else {
        const res = await api.post('/admin/payment-gateways', payload);
        if (res.data?.success) {
          await fetchGateways();
          toast.success(`✅ تم إضافة وسيلة الدفع ${payload.name} بنجاح`);
          setIsGatewayModalOpen(false);
          return;
        }
      }
    } catch (err) {
      console.error('gateway save error', err);
      toast.error('خطأ أثناء حفظ إعدادات بوابة الدفع');
    }
  };

  const deleteGateway = async (gatewayId) => {
    if (!window.confirm('هل تريد حذف هذه البوابة من قاعدة البيانات؟')) return;

    try {
      const res = await api.delete(`/admin/payment-gateways/${gatewayId}`);
      if (res.data?.success) {
        await fetchGateways();
        toast.success('✅ تم حذف البوابة بنجاح');
      }
    } catch (error) {
      console.error('delete gateway error', error);
      toast.error('حدث خطأ أثناء حذف البوابة');
    }
  };

  useEffect(() => {
    if (activeTab === 'gateways') fetchGateways();
    if (activeTab === 'gateways') fetchStoreCurrencies();
    if (activeTab === 'wallet') loadWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    fetchStoreCurrencies();
    loadWalletData();
  }, []);

  const updateCurrencyRate = (code, newRate) => {
    const nextCurrencies = currencies.map((currency) => (
      currency.code === code ? { ...currency, rate: parseFloat(newRate) } : currency
    ));
    setCurrencies(nextCurrencies);
    api.put('/admin/store', { payment: { currencies: nextCurrencies } })
      .then(() => toast.success(`✅ تم تحديث سعر صرف ${code} بنجاح`))
      .catch((error) => {
        console.error('update currency error', error);
        toast.error('حدث خطأ أثناء حفظ أسعار الصرف');
      });
  };

  const toggleCurrencyStatus = (code) => {
    const nextCurrencies = currencies.map((currency) => (
      currency.code === code ? { ...currency, status: currency.status === 'active' ? 'inactive' : 'active' } : currency
    ));
    setCurrencies(nextCurrencies);
    api.put('/admin/store', { payment: { currencies: nextCurrencies } })
      .then(() => toast.success(`✅ تم ${currencies.find(c => c.code === code)?.status === 'active' ? 'تعطيل' : 'تفعيل'} العملة بنجاح`))
      .catch((error) => {
        console.error('toggle currency error', error);
        toast.error('حدث خطأ أثناء حفظ حالة العملة');
      });
  };

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const openWalletModal = (type) => {
    setWalletActionType(type);
    setWalletAmount('');
    setWalletMethod(type === 'deposit' ? 'Visa' : 'PayPal');
    setWalletAddress('');
    setIsWalletDepositOpen(type === 'deposit');
    setIsWalletWithdrawOpen(type === 'withdrawal');
  };

  const loadWalletData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/wallet').catch(() => null),
        api.get('/wallet/transactions').catch(() => null),
      ]);

      const nextBalance = walletRes?.data?.wallet?.availableBalance ?? walletRes?.data?.wallet?.balance ?? 0;
      setWalletBalance(Number(nextBalance) || 0);
      setTransactions((transactionsRes?.data?.transactions || []).map((tx) => ({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        currency: 'USD',
        status: tx.status,
        user: tx.description || 'المنصة',
        date: tx.createdAt,
        method: tx.metadata?.method || 'محفظة',
      })));
    } catch (error) {
      console.error('wallet data load error', error);
    }
  };

  const handleWalletSubmit = async () => {
    const amount = parseFloat(walletAmount);
    if (!amount || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (walletActionType === 'withdrawal' && amount > walletBalance) {
      toast.error('الرصيد غير كافٍ');
      return;
    }

    try {
      if (walletActionType === 'deposit') {
        await api.post('/wallet/deposit', {
          amount,
          method: walletMethod || 'Visa',
          address: walletAddress || '',
        });
      } else {
        await api.post('/wallet/withdraw', {
          amount,
          method: walletMethod || 'PayPal',
          address: walletAddress || '',
        });
      }

      await refreshUser();
      await loadWalletData();
      toast.success(`✅ تم ${walletActionType === 'deposit' ? 'إضافة' : 'طلب'} ${walletActionType === 'deposit' ? 'الإيداع' : 'السحب'} بنجاح`);
      setIsWalletDepositOpen(false);
      setIsWalletWithdrawOpen(false);
    } catch (error) {
      console.error('wallet submit error', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء معالجة العملية');
    }
  };

  const updateTransactionStatus = (transactionId, newStatus) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId ? { ...t, status: newStatus } : t
    ));
    toast.success(`✅ تم تحديث حالة المعاملة بنجاح`);
  };

  const refreshData = () => {
    Promise.all([fetchGateways(), loadWalletData()])
      .then(() => toast.success('تم تحديث البيانات بنجاح'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSocketConnect = () => {
      refreshData();
      toast.success('🔄 تم استعادة الاتصال بلوحة الدفع');
    };

    const handleSocketReconnect = () => {
      refreshData();
      toast.success('🔄 تم إعادة الاتصال بلوحة الدفع');
    };

    socket.on('connect', handleSocketConnect);
    socket.on('reconnect', handleSocketReconnect);

    return () => {
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect', handleSocketReconnect);
    };
  }, []);

  const exportTransactions = () => {
    const filtered = filteredTransactions;
    const csv = [
      ['النوع', 'المبلغ', 'العملة', 'الحالة', 'المستخدم', 'الطريقة', 'التاريخ'],
      ...filtered.map(t => [t.type === 'deposit' ? 'إيداع' : t.type === 'withdrawal' ? 'سحب' : 'دفع', t.amount, t.currency, t.status, t.user, t.method, new Date(t.date).toLocaleString('ar-DZ')])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('تم تصدير المعاملات بنجاح');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.method?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'مكتمل', className: 'bg-emerald-500/20 text-emerald-500' },
      pending: { label: 'قيد المعالجة', className: 'bg-amber-500/20 text-amber-500' },
      failed: { label: 'فشل', className: 'bg-red-500/20 text-red-500' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">بوابات الدفع والمحفظة</h2>
          <p className="text-sm text-[var(--text-secondary)]">إدارة طرق الدفع والمحفظة الرقمية</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={refreshData}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button
            onClick={() => openGatewayModal(null)}
            className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
          >
            <FaPlus /> إضافة وسيلة دفع
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate('/admin/finance')}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaFileInvoiceDollar /> الفواتير والمخزون
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaShoppingCart /> الطلبات
        </button>
        <button
          onClick={() => navigate('/admin/reports')}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaChartLine /> التقارير
        </button>
        <button
          onClick={() => navigate('/admin/disputes')}
          className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
        >
          <FaBalanceScale /> النزاعات
        </button>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'gateways'
              ? 'border-primary text-primary'
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <FaCreditCard className="inline ml-1" /> بوابات الدفع
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'wallet'
              ? 'border-primary text-primary'
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <FaWallet className="inline ml-1" /> المحفظة والرصيد
        </button>
        <button
          onClick={() => setActiveTab('currencies')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'currencies'
              ? 'border-primary text-primary'
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <FaMoneyBillWave className="inline ml-1" /> العملات
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'transactions'
              ? 'border-primary text-primary'
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <FaHistory className="inline ml-1" /> المعاملات
        </button>
      </div>

      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((gateway) => (
            <div key={gateway.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ color: gateway.color, background: `${gateway.color}15` }}>
                    {gateway.iconElement || getGatewayIcon(gateway)}
                  </div>
                  <div>
                    <h4 className="font-bold">{gateway.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      gateway.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {gateway.status === 'active' ? 'مفعل' : 'غير مفعل'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => openGatewayModal(gateway)}
                    className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-primary"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={() => deleteGateway(gateway.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                    title="حذف البوابة"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                  <button
                    onClick={() => toggleGatewayStatus(gateway.id)}
                    className={`w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center ${
                      gateway.status === 'active' ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {gateway.status === 'active' ? <FaTimes className="text-xs" /> : <FaCheck className="text-xs" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaWallet className="text-3xl text-primary" />
              <div>
                <h3 className="text-lg font-bold">رصيد المحفظة</h3>
                <p className="text-sm text-[var(--text-secondary)]">الرصيد الإجمالي للمحفظة الرقمية</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-primary">{formatCurrency(walletBalance)}</div>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => openWalletModal('deposit')}
                className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
              >
                <FaPlus /> إيداع
              </button>
              <button 
                onClick={() => openWalletModal('withdrawal')}
                className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
              >
                سحب
              </button>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
              >
                <FaHistory /> عرض المعاملات
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <h3 className="font-bold p-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <span>آخر المعاملات</span>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-primary hover:underline"
              >
                عرض الكل
              </button>
            </h3>
            <div className="divide-y divide-[var(--border-color)] max-h-80 overflow-y-auto">
              {transactions.slice(0, 5).map((transaction) => {
                const status = getStatusBadge(transaction.status);
                const isDeposit = transaction.type === 'deposit';
                const isWithdrawal = transaction.type === 'withdrawal';
                return (
                  <div 
                    key={transaction.id} 
                    className="p-4 flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                    onClick={() => viewTransactionDetails(transaction)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDeposit ? 'bg-emerald-500/10 text-emerald-500' :
                        isWithdrawal ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {isDeposit ? <FaArrowUp /> : isWithdrawal ? <FaArrowDown /> : <FaCreditCard />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {isDeposit ? 'إيداع' : isWithdrawal ? 'سحب' : 'دفع'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {transaction.user} • {transaction.method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${isDeposit ? 'text-emerald-500' : isWithdrawal ? 'text-red-500' : 'text-primary'}`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {new Date(transaction.date).toLocaleString('ar-DZ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'currencies' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">العملة</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الرمز</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">سعر الصرف</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency) => (
                  <tr key={currency.code} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currency.symbol}</span>
                        <span>{currency.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{currency.code}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={currency.rate}
                          onChange={(e) => updateCurrencyRate(currency.code, e.target.value)}
                          className="w-24 px-2 py-1 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
                        />
                        <button 
                          onClick={() => updateCurrencyRate(currency.code, currency.rate)}
                          className="px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs"
                        >
                          تحديث
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        currency.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {currency.status === 'active' ? 'مفعل' : 'غير مفعل'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCurrencyStatus(currency.code)}
                          className={`w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center ${
                            currency.status === 'active' ? 'text-red-500' : 'text-emerald-500'
                          }`}
                        >
                          {currency.status === 'active' ? <FaTimes className="text-xs" /> : <FaCheck className="text-xs" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="بحث عن معاملة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input w-full pr-9 text-sm"
                  />
                </div>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-input w-32 text-sm"
              >
                <option value="all">جميع الأنواع</option>
                <option value="deposit">إيداع</option>
                <option value="withdrawal">سحب</option>
                <option value="payment">دفع</option>
              </select>

              <button 
                onClick={exportTransactions}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors text-sm flex items-center gap-2"
              >
                <FaDownload /> تصدير
              </button>

              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  toast.success('تم إعادة ضبط الفلاتر');
                }}
                className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
              >
                <FaTimes /> إعادة ضبط
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">النوع</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">المستخدم</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">المبلغ</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الطريقة</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">التاريخ</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const status = getStatusBadge(transaction.status);
                    const isDeposit = transaction.type === 'deposit';
                    const isWithdrawal = transaction.type === 'withdrawal';
                    return (
                      <tr key={transaction.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isDeposit ? 'bg-emerald-500/20 text-emerald-500' :
                            isWithdrawal ? 'bg-red-500/20 text-red-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {isDeposit ? 'إيداع' : isWithdrawal ? 'سحب' : 'دفع'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{transaction.user}</td>
                        <td className="py-3 px-4 font-bold">{formatCurrency(transaction.amount)}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{transaction.method}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">
                          {new Date(transaction.date).toLocaleString('ar-DZ')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => viewTransactionDetails(transaction)}
                              className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-blue-500"
                            >
                              <FaEye className="text-xs" />
                            </button>
                            {transaction.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                                  className="w-8 h-8 rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center justify-center text-emerald-500"
                                >
                                  <FaCheck className="text-xs" />
                                </button>
                                <button
                                  onClick={() => updateTransactionStatus(transaction.id, 'failed')}
                                  className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                                >
                                  <FaTimes className="text-xs" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <FaHistory className="text-3xl mx-auto mb-2 opacity-30" />
                <p>لا توجد معاملات مطابقة للبحث</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal تعديل بوابة الدفع */}
      {isGatewayModalOpen && gatewayFormData && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--bg-primary) 72%, transparent)' }} onClick={() => setIsGatewayModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {selectedGateway ? (
                  <>{selectedGateway.icon} تعديل {selectedGateway.name}</>
                ) : (
                  <><FaCard /> إضافة وسيلة دفع جديدة</>
                )}
              </h3>
              <button onClick={() => setIsGatewayModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ color: gatewayFormData.color || '#635bff', background: `${(gatewayFormData.color || '#635bff')}15` }}>
                  {selectedGateway?.iconElement || getGatewayIcon(gatewayFormData)}
                </div>
                <div>
                  <h4 className="font-bold">{gatewayFormData.name || 'جديد'}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    (gatewayFormData.status === 'active') ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {gatewayFormData.status === 'active' ? 'مفعل' : 'غير مفعل'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="form-label text-sm">اسم البوابة</label>
                  <input
                    type="text"
                    value={gatewayFormData.name || ''}
                    className="form-input w-full"
                    placeholder="مثال: Stripe"
                    onChange={(e) => handleGatewayFieldChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label text-sm">الاسم المختصر</label>
                  <input
                    type="text"
                    value={gatewayFormData.slug || ''}
                    className="form-input w-full"
                    placeholder="stripe"
                    onChange={(e) => handleGatewayFieldChange('slug', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="form-label text-sm">الأيقونة</label>
                  <input
                    type="text"
                    value={gatewayFormData.icon || ''}
                    className="form-input w-full"
                    placeholder="paypal"
                    onChange={(e) => handleGatewayFieldChange('icon', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label text-sm">اللون</label>
                  <input
                    type="color"
                    value={gatewayFormData.color || '#635bff'}
                    className="h-12 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]"
                    onChange={(e) => handleGatewayFieldChange('color', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label text-sm">الحالة</label>
                <select
                  value={gatewayFormData.status || 'inactive'}
                  className="form-input w-full"
                  onChange={(e) => handleGatewayFieldChange('status', e.target.value)}
                >
                  <option value="active">مفعل</option>
                  <option value="inactive">غير مفعل</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="form-label text-sm">مفتاح API</label>
                <input
                  type="text"
                  value={gatewayFormData?.config?.apiKey || ''}
                  className="form-input w-full"
                  placeholder="أدخل مفتاح API"
                  onChange={(e) => handleGatewayConfigChange('apiKey', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="form-label text-sm">المفتاح السري</label>
                <input
                  type="password"
                  value={gatewayFormData?.config?.secretKey || ''}
                  className="form-input w-full"
                  placeholder="أدخل المفتاح السري"
                  onChange={(e) => handleGatewayConfigChange('secretKey', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={saveGatewaySettings}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                >
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setIsGatewayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal عرض تفاصيل المعاملة */}
      {isTransactionModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--bg-primary) 72%, transparent)' }} onClick={() => setIsTransactionModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaHistory className="text-primary" />
                تفاصيل المعاملة
              </h3>
              <button onClick={() => setIsTransactionModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">النوع</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedTransaction.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-500' :
                  selectedTransaction.type === 'withdrawal' ? 'bg-red-500/20 text-red-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {selectedTransaction.type === 'deposit' ? 'إيداع' : 
                   selectedTransaction.type === 'withdrawal' ? 'سحب' : 'دفع'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">المبلغ</span>
                <span className="font-bold text-primary">{formatCurrency(selectedTransaction.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">العملة</span>
                <span>{selectedTransaction.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">المستخدم</span>
                <span>{selectedTransaction.user}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">طريقة الدفع</span>
                <span>{selectedTransaction.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">الحالة</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedTransaction.status).className}`}>
                  {getStatusBadge(selectedTransaction.status).label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">التاريخ</span>
                <span className="text-xs">{new Date(selectedTransaction.date).toLocaleString('ar-DZ')}</span>
              </div>

              {selectedTransaction.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      updateTransactionStatus(selectedTransaction.id, 'completed');
                      setIsTransactionModalOpen(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <FaCheck /> قبول
                  </button>
                  <button
                    onClick={() => {
                      updateTransactionStatus(selectedTransaction.id, 'failed');
                      setIsTransactionModalOpen(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <FaTimes /> رفض
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(isWalletDepositOpen || isWalletWithdrawOpen) && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--bg-primary) 72%, transparent)' }} onClick={() => { setIsWalletDepositOpen(false); setIsWalletWithdrawOpen(false); }}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {walletActionType === 'deposit' ? 'إيداع إلى المحفظة' : 'طلب سحب من المحفظة'}
              </h3>
              <button onClick={() => { setIsWalletDepositOpen(false); setIsWalletWithdrawOpen(false); }} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="form-label text-sm">المبلغ</label>
                <input
                  type="number"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="form-label text-sm">طريقة الدفع</label>
                <select
                  value={walletMethod}
                  onChange={(e) => setWalletMethod(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bitcoin">Bitcoin</option>
                </select>
              </div>

              {walletActionType === 'withdrawal' && (
                <div>
                  <label className="form-label text-sm">عنوان المحفظة</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="form-input w-full"
                    placeholder="أدخل عنوان المحفظة"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={handleWalletSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                >
                  {walletActionType === 'deposit' ? 'تنفيذ الإيداع' : 'طلب السحب'}
                </button>
                <button
                  onClick={() => { setIsWalletDepositOpen(false); setIsWalletWithdrawOpen(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;