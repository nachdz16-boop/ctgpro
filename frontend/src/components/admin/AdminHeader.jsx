// src/components/admin/AdminHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  FaUserCircle, FaCog, FaSignOutAlt, FaWallet, FaChartLine,
  FaSearch, FaBell, FaEnvelope, FaMoon, FaSun, FaGlobe,
  FaChevronDown, FaUser, FaShoppingCart, FaStore,
  FaHistory, FaCreditCard, FaShieldAlt, FaFileAlt, FaHome, FaSignInAlt
} from 'react-icons/fa';
import { IoMdNotifications, IoMdMail } from 'react-icons/io';
import toast from 'react-hot-toast';

const AdminHeader = () => {
  const { user, logout, refreshUser } = useAuth();
  const { t, language, setLanguage, formatCurrency } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  const quickLinks = [
    { label: 'الرئيسية', icon: <FaHome />, path: '/' },
    { label: 'دخول', icon: <FaSignInAlt />, path: '/admin/login' },
    { label: 'السلة', icon: <FaShoppingCart />, path: '/cart' },
    { label: 'حسابي', icon: <FaUserCircle />, path: '/admin/profile' },
  ];

  // جلب الرصيد
  useEffect(() => {
    fetchBalance();
    fetchNotifications();
    fetchMessages();
  }, [user?.walletBalance, language]);

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const [walletRes, userRes] = await Promise.all([
        api.get('/wallet').catch(() => null),
        refreshUser(),
      ]);
      const fromWallet = walletRes?.data?.wallet?.availableBalance ?? walletRes?.data?.wallet?.balance;
      const nextBalance = fromWallet ?? userRes?.walletBalance ?? user?.walletBalance ?? 0;
      setBalance(Number(nextBalance) || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(Number(user?.walletBalance) || 0);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/admin/notifications');
      const items = (response.data?.notifications || []).slice(0, 4).map((notification) => ({
        id: notification._id,
        title: notification.title?.[language] || notification.title?.ar || notification.title || 'إشعار',
        message: notification.message?.[language] || notification.message?.ar || notification.message || '',
        time: notification.createdAt ? new Date(notification.createdAt).toLocaleString('ar-DZ', { dateStyle: 'short', timeStyle: 'short' }) : '',
        read: Boolean(notification.isRead),
      }));
      setNotifications(items);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get('/admin/orders/recent');
      const items = (response.data?.orders || []).slice(0, 3).map((order) => ({
        id: order._id,
        from: order.userId?.name || 'طلب جديد',
        message: `طلب #${String(order._id).slice(-6)} بحالة ${order.status || 'unknown'}`,
        time: order.createdAt ? new Date(order.createdAt).toLocaleString('ar-DZ', { dateStyle: 'short', timeStyle: 'short' }) : '',
        read: order.status !== 'pending',
      }));
      setMessages(items);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setShowMessages(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // معالج البحث
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`جاري البحث عن: ${searchQuery}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.put('/admin/notifications/read-all');
      setNotifications((currentNotifications) => currentNotifications.map((notification) => ({ ...notification, read: true })));
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('تعذر تحديث الإشعارات');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/admin/notifications/${notificationId}/read`);
      setNotifications((currentNotifications) => currentNotifications.map((notification) => (
        notification.id === notificationId ? { ...notification, read: true } : notification
      )));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // معالج تغيير اللغة
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setIsLangDropdownOpen(false);
    const nextLanguage = SUPPORTED_LANGUAGES[newLang];
    toast.success(`تم تغيير اللغة إلى ${nextLanguage?.name || newLang}`);
  };

  // معالج الخروج
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  // علامة عدم القراءة
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <header className="sticky top-0 z-50 admin-header bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-2 flex items-center justify-between">
      {/* القسم الأيسر - البحث */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div ref={searchRef} className="relative flex-1">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
              <input
                type="text"
                placeholder={t('search') || 'بحث...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-4 pr-10 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </form>
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full right-0 left-0 mt-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-2">
                <div className="text-xs text-[var(--text-muted)] px-2 py-1">نتائج البحث</div>
                <div className="text-sm px-2 py-1.5 hover:bg-[var(--bg-input)] rounded-lg cursor-pointer">
                  🎮 PUBG Mobile 1050 UC
                </div>
                <div className="text-sm px-2 py-1.5 hover:bg-[var(--bg-input)] rounded-lg cursor-pointer">
                  🎮 Free Fire 500 Diamonds
                </div>
                <div className="text-sm px-2 py-1.5 hover:bg-[var(--bg-input)] rounded-lg cursor-pointer">
                  🎮 Fortnite 2800 V-Bucks
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* القسم الأيمن - الأزرار */}
      <div className="hidden md:flex items-center gap-2 pr-2">
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)] text-xs"
          >
            <span className="text-sm">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* زر تبديل الوضع */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-[var(--text-secondary)]"
          title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {theme === 'dark' ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
        </button>
        {/* زر اختيار اللغة */}
        <div ref={langDropdownRef} className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="min-w-[120px] h-9 rounded-lg px-3 hover:bg-[var(--bg-input)] transition-colors flex items-center justify-between text-[var(--text-secondary)] gap-2"
            title={SUPPORTED_LANGUAGES[language]?.name || language}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">{SUPPORTED_LANGUAGES[language]?.flag || '🌐'}</span>
              <span className="text-[11px] font-semibold leading-none">
                {SUPPORTED_LANGUAGES[language]?.name || language}
              </span>
            </span>
            <FaChevronDown className="text-[10px]" />
          </button>
          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-2 min-w-[170px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-lg z-40 overflow-hidden">
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-start px-3 py-2 hover:bg-[var(--bg-input)] transition-colors flex items-center gap-2 ${language === lang.code ? 'font-semibold text-primary' : 'text-[var(--text-secondary)]'}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* زر الإشعارات */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-[var(--text-secondary)] relative"
            title="الإشعارات"
          >
            <IoMdNotifications className="text-xl" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50">
              <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                <span className="font-bold text-sm">الإشعارات</span>
                <button 
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  تحديد الكل كمقروء
                </button>
              </div>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-3 border-b border-[var(--border-color)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-[var(--text-muted)]'}`} />
                      <div>
                        <div className="text-sm font-semibold">{n.title}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{n.message}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-1">{n.time}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[var(--text-secondary)] text-sm">
                  لا توجد إشعارات
                </div>
              )}
              <div className="p-2 border-t border-[var(--border-color)] text-center">
                <Link to="/admin/notifications" className="text-xs text-primary hover:underline">
                  عرض جميع الإشعارات
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* زر الرسائل */}
        <div ref={messagesRef} className="relative">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="w-9 h-9 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-[var(--text-secondary)] relative"
            title="الرسائل"
          >
            <IoMdMail className="text-xl" />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">
                {unreadMessages}
              </span>
            )}
          </button>

          {showMessages && (
            <div className="absolute left-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50">
              <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                <span className="font-bold text-sm">الرسائل</span>
                <Link to="/admin/orders" className="text-xs text-primary hover:underline">
                  عرض الكل
                </Link>
              </div>
              {messages.length > 0 ? (
                messages.map((m) => (
                  <div key={m.id} className={`p-3 border-b border-[var(--border-color)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer ${!m.read ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!m.read ? 'bg-primary' : 'bg-[var(--text-muted)]'}`} />
                      <div>
                        <div className="text-sm font-semibold">{m.from}</div>
                        <div className="text-xs text-[var(--text-secondary)] line-clamp-1">{m.message}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-1">{m.time}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[var(--text-secondary)] text-sm">
                  لا توجد رسائل
                </div>
              )}
            </div>
          )}
        </div>

        {/* عرض الرصيد */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <FaWallet className="text-primary text-sm" />
          {loadingBalance ? (
            <div className="loader-spinner w-4 h-4 border-2"></div>
          ) : (
            <span className="text-sm font-bold text-primary">
              {formatCurrency(balance)}
            </span>
          )}
        </div>

        {/* دروب داون البروفايل */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--bg-input)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium leading-tight">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-[var(--text-muted)]">مدير النظام</div>
            </div>
            <FaChevronDown className={`text-xs text-[var(--text-secondary)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden z-50">
              {/* معلومات المستخدم */}
              <div className="p-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.[0] || 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{user?.name || 'Admin'}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{user?.email || 'admin@ctgpro.com'}</div>
                  </div>
                </div>
              </div>

              {/* روابط القائمة */}
              <div className="py-1">
                <Link
                  to="/admin/profile"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-input)] transition-colors text-sm text-[var(--text-secondary)] hover:text-primary"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="text-xs" />
                  <span>البروفايل</span>
                </Link>

                <Link
                  to="/admin/reports"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-input)] transition-colors text-sm text-[var(--text-secondary)] hover:text-primary"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaChartLine className="text-xs" />
                  <span>التقارير</span>
                </Link>

                <Link
                  to="/admin/payment"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-input)] transition-colors text-sm text-[var(--text-secondary)] hover:text-primary"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaWallet className="text-xs" />
                  <span>المحفظة</span>
                  <span className="mr-auto text-xs text-primary font-bold">
                    {formatCurrency(balance)}
                  </span>
                </Link>

                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-input)] transition-colors text-sm text-[var(--text-secondary)] hover:text-primary"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaCog className="text-xs" />
                  <span>الإعدادات</span>
                </Link>
              </div>

              <div className="border-t border-[var(--border-color)] py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 transition-colors text-sm text-red-500 w-full text-right"
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;