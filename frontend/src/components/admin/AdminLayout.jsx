// src/components/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import AdminHeader from './AdminHeader';
import { 
  FaTachometerAlt, FaUsers, FaBox, FaKey, FaWallet, 
  FaShareAlt, FaStore, FaUserTie, FaSignOutAlt, FaCog,
  FaChevronLeft, FaChevronRight, FaBars, FaTimes,
  FaShoppingCart, FaBell, FaUserCircle, FaSearch,
  FaBullhorn, FaBrain, FaCode, FaComments, FaRobot,
  FaBalanceScale, FaHome, FaSignInAlt, FaFileInvoiceDollar,
  FaMemory, FaDatabase, FaNetworkWired, FaPaperPlane
} from 'react-icons/fa';

const AdminLayout = () => {
  const { user, logout, refreshUser } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [botOpen, setBotOpen] = useState(false);
  const [botPrompt, setBotPrompt] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '1000',
    stock: '20',
    category: 'topup',
    imageQuery: '',
  });
  const [productCreating, setProductCreating] = useState(false);
  const [productResult, setProductResult] = useState('');
  const [systemInfo, setSystemInfo] = useState({
    ip: 'غير متوفر',
    ram: '0 MB',
    db: 'غير متصل',
    userCount: 0,
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      navigate('/admin/login');
      return;
    }

    const loadBalance = async () => {
      try {
        const [walletRes, refreshedUser] = await Promise.all([
          api.get('/wallet').catch(() => null),
          refreshUser(),
        ]);
        const nextBalance = walletRes?.data?.wallet?.availableBalance ?? walletRes?.data?.wallet?.balance ?? refreshedUser?.walletBalance ?? user?.walletBalance ?? 0;
        setBalance(Number(nextBalance) || 0);
      } catch (error) {
        console.error('Error loading balance', error);
        setBalance(Number(user?.walletBalance) || 0);
      }
    };

    const loadSystemInfo = async () => {
      try {
        const res = await api.get('/admin/system-status');
        const nextStatus = res.data?.systemStatus || {};
        const ramUsed = nextStatus.ram?.usedMb ?? 0;
        const ramTotal = nextStatus.ram?.totalMb ?? 0;

        setSystemInfo({
          ip: nextStatus.ip || 'غير متوفر',
          ram: ramTotal ? `${ramUsed} / ${ramTotal} MB` : 'غير متوفر',
          db: nextStatus.db?.connected ? 'متصل' : 'غير متصل',
          userCount: nextStatus.userCount ?? 0,
        });
      } catch (error) {
        console.error('Error loading system info', error);
      }
    };

    loadBalance();
    loadSystemInfo();
  }, [user?.role, user?.walletBalance, navigate, refreshUser]);

  const menuItems = [
    { id: 'overview', label: 'نظرة عامة', icon: <FaTachometerAlt />, path: '/admin' },
    { id: 'users', label: 'إدارة المستخدمين', icon: <FaUsers />, path: '/admin/users' },
    { id: 'sellers', label: 'إدارة الباعة', icon: <FaUserTie />, path: '/admin/sellers' },
    { id: 'products', label: 'إدارة المنتجات', icon: <FaBox />, path: '/admin/products' },
    { id: 'orders', label: 'الطلبات', icon: <FaShoppingCart />, path: '/admin/orders' },
    { id: 'finance', label: 'الفواتير والمخزون وال zakat', icon: <FaFileInvoiceDollar />, path: '/admin/finance' },
    { id: 'codes', label: 'الأكواد والبطاقات', icon: <FaKey />, path: '/admin/codes' },
    { id: 'payment', label: 'بوابات الدفع والمحفظة', icon: <FaWallet />, path: '/admin/payment' },
    { id: 'social', label: 'وسائل التواصل', icon: <FaShareAlt />, path: '/admin/social' },
    { id: 'store', label: 'إدارة المتجر', icon: <FaStore />, path: '/admin/store' },
    { id: 'ads', label: 'إدارة الإعلانات', icon: <FaBullhorn />, path: '/admin/ads' },
    { id: 'ai', label: 'البوتات الذكية', icon: <FaRobot />, path: '/admin/ai-bots' },
    { id: 'chatbots', label: 'الدردشة الذكية', icon: <FaComments />, path: '/admin/chatbots' },
    { id: 'apis', label: 'واجهات API', icon: <FaCode />, path: '/admin/apis' },
    { id: 'disputes', label: 'النزاعات', icon: <FaBalanceScale />, path: '/admin/disputes' },
    { id: 'notifications', label: 'الإشعارات', icon: <FaBell />, path: '/admin/notifications' },
    { id: 'settings', label: 'الإعدادات', icon: <FaCog />, path: '/admin/settings' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleBotAsk = async (e) => {
    e.preventDefault();
    if (!botPrompt.trim()) {
      toast.error('اكتب سؤالًا للبوت أولاً');
      return;
    }

    setBotLoading(true);
    setBotResponse('');
    try {
      const res = await api.post('/admin/ai-bots/active/chat', { prompt: botPrompt });
      setBotResponse(res.data?.message || 'لا توجد إجابة');
    } catch (error) {
      console.error('Error chatting with CTGPRO bot', error);
      setBotResponse(error.response?.data?.message || 'تعذر الاتصال بالبوت');
    } finally {
      setBotLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.error('أدخل اسم المنتج أولاً');
      return;
    }

    setProductCreating(true);
    setProductResult('');
    try {
      const res = await api.post('/admin/ai-bots/active/product', {
        ...productForm,
        price: Number(productForm.price) || 1000,
        stock: Number(productForm.stock) || 20,
      });
      setProductResult(res.data?.message || 'تمت إضافة المنتج');
      toast.success('تمت إضافة المنتج بنجاح');
      setProductForm({ name: '', description: '', price: '1000', stock: '20', category: 'topup', imageQuery: '' });
    } catch (error) {
      console.error('Error creating product with CTGPRO bot', error);
      setProductResult(error.response?.data?.message || 'تعذر إضافة المنتج');
      toast.error(error.response?.data?.message || 'تعذر إضافة المنتج');
    } finally {
      setProductCreating(false);
    }
  };

  const mobileNavLinks = [
    { id: 'home', label: 'الرئيسية', icon: <FaHome />, path: '/' },
    { id: 'login', label: 'دخول', icon: <FaSignInAlt />, path: '/admin/login' },
    { id: 'cart', label: 'السلة', icon: <FaShoppingCart />, path: '/cart' },
    { id: 'account', label: 'حسابي', icon: <FaUserCircle />, path: '/admin/profile' },
  ];

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="min-h-screen flex admin-layout" style={{ background: 'var(--bg-primary)' }}>
      {/* ===== الشريط الجانبي ===== */}
      <aside 
        className={`admin-sidebar fixed top-0 right-0 h-full z-50 transition-all duration-300 bg-[var(--bg-secondary)] border-l border-[var(--border-color)] ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
      >
        {/* الشعار */}
        <div className={`flex items-center h-16 px-4 border-b border-[var(--border-color)] ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <>
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <FaStore className="text-white text-sm" />
                </div>
                <span className="font-bold text-lg">CTG<span className="text-primary">PRO</span></span>
                <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
              >
                <FaChevronLeft className="text-sm text-[var(--text-secondary)]" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
            >
              <FaChevronRight className="text-sm text-[var(--text-secondary)]" />
            </button>
          )}
        </div>

        {/* قائمة التبويبات */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-64px)]">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-primary'} ${!sidebarOpen && 'justify-center'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}

          <div className="border-t border-[var(--border-color)] my-3"></div>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-red-500 hover:bg-red-500/10 ${!sidebarOpen && 'justify-center'}`}
          >
            <FaSignOutAlt className="text-lg" />
            {sidebarOpen && <span className="text-sm font-medium">خروج</span>}
          </button>

          {sidebarOpen && (
            <div className="mt-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/90 to-primary-dark/90 p-4 text-white shadow-xl">
              <div className="text-xs uppercase tracking-[0.3em] opacity-80">Balance</div>
              <div className="mt-2 text-3xl font-black leading-tight">
                {formatCurrency(balance)}
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* ===== المحتوى الرئيسي ===== */}
      <div className={`flex-1 transition-all duration-300 admin-main ${sidebarOpen ? 'lg:mr-64' : 'lg:mr-20'}`}>
        {/* ===== الهيدر ===== */}
        <div className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <AdminHeader />
        </div>

        {/* ===== المحتوى ===== */}
        <main className="p-4 admin-content min-h-[calc(100vh-200px)]">
          <Outlet />
        </main>

        <button
          onClick={() => setBotOpen(true)}
          className="fixed bottom-20 left-4 z-50 rounded-full bg-gradient-to-r from-primary to-primary-dark p-4 text-white shadow-xl hover:scale-105 transition-transform"
          title="مساعد CTGPRO"
        >
          <FaRobot className="text-xl" />
        </button>

        {botOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setBotOpen(false)}>
            <div className="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">مساعد CTGPRO</h3>
                  <p className="text-sm text-[var(--text-secondary)]">اسأل عن الطلبات، المخزون، الزكاة، والإعدادات</p>
                </div>
                <button onClick={() => setBotOpen(false)} className="rounded-lg p-2 hover:bg-[var(--bg-input)]">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleBotAsk} className="space-y-3">
                <textarea
                  value={botPrompt}
                  onChange={(e) => setBotPrompt(e.target.value)}
                  rows="4"
                  className="form-input w-full"
                  placeholder="مثال: ما هي أفضل طريقة لإدارة المخزون اليوم؟"
                />
                <button
                  type="submit"
                  disabled={botLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  <FaPaperPlane /> {botLoading ? 'جاري المعالجة...' : 'إرسال إلى CTGPRO'}
                </button>
              </form>

              <div className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4 text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {botLoading ? 'جارٍ إعداد الإجابة...' : botResponse || 'ستظهر إجابة البوت هنا بعد إرسال سؤالك.'}
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4">
                <h4 className="mb-3 font-semibold">إضافة منتج بالذكاء الاصطناعي</h4>
                <form onSubmit={handleCreateProduct} className="space-y-3">
                  <input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="form-input w-full"
                    placeholder="اسم المنتج"
                  />
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows="3"
                    className="form-input w-full"
                    placeholder="وصف المنتج"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="form-input w-full"
                      placeholder="السعر"
                    />
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="form-input w-full"
                      placeholder="المخزون"
                    />
                  </div>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="form-input w-full"
                  >
                    <option value="topup">Topup</option>
                    <option value="giftcards">Gift Cards</option>
                    <option value="cdkeys">CD Keys</option>
                    <option value="gamecards">Game Cards</option>
                    <option value="recharge">Recharge</option>
                  </select>
                  <input
                    value={productForm.imageQuery}
                    onChange={(e) => setProductForm({ ...productForm, imageQuery: e.target.value })}
                    className="form-input w-full"
                    placeholder="مثال: صورة منتج شحن أو كرت هدايا"
                  />
                  <button
                    type="submit"
                    disabled={productCreating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {productCreating ? 'جاري الإضافة...' : 'إضافة المنتج بالذكاء الاصطناعي'}
                  </button>
                </form>
                {productResult && (
                  <div className="mt-3 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                    {productResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Footer ===== */}
        <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] p-4">
          <div className="container-fluid flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
            <span>© 2026 CTGPRO. جميع الحقوق محفوظة.</span>
            <div className="flex flex-wrap items-center justify-end gap-3 text-right">
              <span className="flex items-center gap-1"><FaNetworkWired /> IP: <strong>{systemInfo.ip}</strong></span>
              <span className="flex items-center gap-1"><FaMemory /> RAM: <strong>{systemInfo.ram}</strong></span>
              <span className={`flex items-center gap-1 ${systemInfo.db === 'متصل' ? 'text-emerald-500' : 'text-amber-500'}`}><FaDatabase /> DB: <strong>{systemInfo.db}</strong></span>
              <span className="flex items-center gap-1"><FaUsers /> المستخدمون: <strong>{systemInfo.userCount}</strong></span>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== قائمة الجوال ===== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <FaStore className="text-white text-sm" />
                </div>
                <span className="font-bold">CTG<span className="text-primary">PRO</span></span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors">
                <FaTimes />
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-primary'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-[var(--border-color)] my-3"></div>

              <button
                onClick={() => {
                  logout();
                  navigate('/admin/login');
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-red-500 hover:bg-red-500/10"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="text-sm font-medium">خروج</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* ===== شريط التنقل السفلي للجوال ===== */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] shadow-t lg:hidden">
        <div className="flex items-center justify-between px-3 py-2">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${isActive(link.path) ? 'text-primary' : 'text-[var(--text-secondary)] hover:text-primary'}`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;