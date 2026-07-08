import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { getSocket } from '../../services/socket';
import PageLayout from '../layout/PageLayout';
import { 
  FaWallet, FaBitcoin, FaEthereum, FaMoneyBillWave, 
  FaArrowUp, FaArrowDown, FaCopy, FaCheck, FaClock,
  FaCreditCard, FaPaypal, FaQrcode, FaExchangeAlt, FaTimes
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Wallet = () => {
  const { user } = useAuth();
  const { t, formatCurrency, getCurrencySymbol } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({
    balance: 0,
    cryptoBalances: { BTC: 0, ETH: 0, USDT: 0 },
    totalDeposits: 0,
    totalWithdrawals: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [copied, setCopied] = useState(false);

  const walletAddresses = {
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?._id) return;

    const handleWalletUpdated = (payload) => {
      if (payload.userId !== user._id) return;
      fetchWalletData();
      toast.success('💰 تم تحديث رصيد المحفظة تلقائياً');
    };

    const handleSocketConnect = () => {
      fetchWalletData();
      toast.success('🔄 تم استعادة الاتصال بالمحفظة');
    };

    const handleSocketReconnect = () => {
      fetchWalletData();
      toast.success('🔄 تم إعادة الاتصال بالمحفظة');
    };

    socket.on('wallet_updated', handleWalletUpdated);
    socket.on('connect', handleSocketConnect);
    socket.on('reconnect', handleSocketReconnect);

    return () => {
      socket.off('wallet_updated', handleWalletUpdated);
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect', handleSocketReconnect);
    };
  }, [user?._id]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
      ]);
      setWallet(walletRes.data.wallet || { balance: 0, cryptoBalances: { BTC: 0, ETH: 0, USDT: 0 } });
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // بيانات تجريبية
      setWallet({
        balance: 1250.50,
        cryptoBalances: { BTC: 0.045, ETH: 1.2, USDT: 500 },
        totalDeposits: 2500,
        totalWithdrawals: 1249.50,
      });
      setTransactions([
        { id: 1, type: 'deposit', amount: 500, method: 'BTC', status: 'completed', date: new Date().toISOString() },
        { id: 2, type: 'withdrawal', amount: 250, method: 'USDT', status: 'completed', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, type: 'payment', amount: 89.99, method: 'wallet', status: 'completed', date: new Date(Date.now() - 172800000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    try {
      await api.post('/wallet/deposit', { amount: parseFloat(depositAmount), method: selectedCrypto });
      toast.success('✅ تم إيداع المبلغ بنجاح');
      setShowDeposit(false);
      setDepositAmount('');
      fetchWalletData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (parseFloat(withdrawAmount) > wallet.balance) {
      toast.error('الرصيد غير كاف');
      return;
    }
    if (!withdrawAddress) {
      toast.error('الرجاء إدخال عنوان المحفظة');
      return;
    }
    try {
      await api.post('/wallet/withdraw', { 
        amount: parseFloat(withdrawAmount), 
        method: selectedCrypto,
        address: withdrawAddress 
      });
      toast.success('✅ تم طلب السحب بنجاح');
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      fetchWalletData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('✅ تم نسخ العنوان');
    setTimeout(() => setCopied(false), 3000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-500/20 text-amber-500',
      completed: 'bg-emerald-500/20 text-emerald-500',
      failed: 'bg-red-500/20 text-red-500',
    };
    return styles[status] || styles.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      deposit: <FaArrowDown className="text-emerald-500" />,
      withdrawal: <FaArrowUp className="text-red-500" />,
      payment: <FaMoneyBillWave className="text-blue-500" />,
    };
    return icons[type] || <FaExchangeAlt className="text-emerald-500" />;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="loader-spinner"></div></div>;
  }

  return (
    <PageLayout title={t('wallet.title')} subtitle="إدارة محفظتك الرقمية والعملات">
      <div className="space-y-6">
        {/* الرصيد الإجمالي */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center hover:border-primary transition-all">
            <FaWallet className="text-3xl text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{formatCurrency(wallet.balance)}</div>
            <div className="text-xs text-[var(--text-secondary)]">{t('wallet.balance')}</div>
          </div>
          <div className="card text-center hover:border-primary transition-all">
            <FaBitcoin className="text-3xl text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{wallet.cryptoBalances?.BTC || 0} BTC</div>
            <div className="text-xs text-[var(--text-secondary)]">بيتكوين</div>
          </div>
          <div className="card text-center hover:border-primary transition-all">
            <FaEthereum className="text-3xl text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{wallet.cryptoBalances?.ETH || 0} ETH</div>
            <div className="text-xs text-[var(--text-secondary)]">إيثريوم</div>
          </div>
          <div className="card text-center hover:border-primary transition-all">
            <FaMoneyBillWave className="text-3xl text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{wallet.cryptoBalances?.USDT || 0} USDT</div>
            <div className="text-xs text-[var(--text-secondary)]">Tether</div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowDeposit(true)}
            className="px-6 py-2.5 rounded-xl btn-primary text-white flex items-center gap-2"
          >
            <FaArrowDown /> {t('wallet.deposit')}
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="px-6 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors flex items-center gap-2"
          >
            <FaArrowUp /> {t('wallet.withdraw')}
          </button>
        </div>

        {/* عنوان المحفظة */}
        <div className="card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaQrcode className="text-primary" /> عنوان محفظتك
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(walletAddresses).map(([crypto, address]) => (
              <div key={crypto} className="bg-[var(--bg-primary)] p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{crypto}</span>
                  <button
                    onClick={() => copyAddress(address)}
                    className="px-2 py-1 rounded-lg bg-[var(--bg-input)] hover:bg-primary/20 transition-colors text-xs flex items-center gap-1"
                  >
                    {copied ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                    {copied ? t('common.copied') : t('wallet.copy_address')}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 break-all font-mono">{address}</p>
              </div>
            ))}
          </div>
        </div>

        {/* سجل المعاملات */}
        <div className="card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaClock className="text-primary" /> {t('wallet.transactions')}
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
                لا توجد معاملات
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl hover:bg-[var(--bg-input)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm capitalize">{tx.type}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{tx.method}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-500' : tx.type === 'withdrawal' ? 'text-red-500' : 'text-primary'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(tx.date).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal الإيداع */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--bg-primary) 72%, transparent)' }}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full p-6 border border-[var(--border-color)] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{t('wallet.deposit')}</h3>
              <button onClick={() => setShowDeposit(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">العملة</label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="BTC">بيتكوين (BTC)</option>
                  <option value="ETH">إيثريوم (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                </select>
              </div>
              <div>
                <label className="form-label">المبلغ</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="bg-[var(--bg-primary)] p-3 rounded-xl">
                <p className="text-sm text-[var(--text-secondary)]">عنوان الإيداع:</p>
                <p className="text-xs font-mono break-all">{walletAddresses[selectedCrypto]}</p>
                <button
                  onClick={() => copyAddress(walletAddresses[selectedCrypto])}
                  className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FaCopy /> {t('wallet.copy_address')}
                </button>
              </div>
              <button onClick={handleDeposit} className="w-full py-3 rounded-xl btn-primary text-white font-semibold">
                {t('wallet.deposit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal السحب */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--bg-primary) 72%, transparent)' }}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full p-6 border border-[var(--border-color)] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{t('wallet.withdraw')}</h3>
              <button onClick={() => setShowWithdraw(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">العملة</label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="BTC">بيتكوين (BTC)</option>
                  <option value="ETH">إيثريوم (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                </select>
              </div>
              <div>
                <label className="form-label">عنوان المحفظة</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="form-input w-full"
                  placeholder="أدخل عنوان المحفظة"
                />
              </div>
              <div>
                <label className="form-label">المبلغ</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">الرصيد المتاح: {formatCurrency(wallet.balance)}</p>
              </div>
              <button onClick={handleWithdraw} className="w-full py-3 rounded-xl btn-primary text-white font-semibold">
                {t('wallet.withdraw')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Wallet;