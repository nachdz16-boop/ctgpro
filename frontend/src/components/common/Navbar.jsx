import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { 
  FaGamepad, FaSearch, FaShoppingCart, FaHeart, FaUser, 
  FaSignOutAlt, FaMoon, FaSun, FaBars, FaTimes, FaBolt,
  FaChevronDown, FaWallet, FaGlobe, FaMobileAlt, FaGift, FaKey
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { 
    t, 
    language, 
    setLanguage, 
    currency, 
    setCurrency,
    getLanguageFlag,
    getLanguageName,
    getCurrencyFlag,
    getCurrencySymbol,
    getCurrencyCode
  } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const langRef = useRef(null);
  const currencyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { 
    logout(); 
    navigate('/'); 
    setMobileMenuOpen(false); 
  };

  const handleSearch = (e) => { 
    e.preventDefault(); 
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const categories = [
    { id: 'home', label: t('nav.home'), icon: 'fa-house', path: '/' },
    { id: 'topup', label: t('nav.topup'), icon: 'fa-mobile-screen', path: '/shop?category=topup' },
    { id: 'giftcards', label: t('nav.giftcards'), icon: 'fa-gift', path: '/shop?category=giftcards' },
    { id: 'cdkeys', label: t('nav.cdkeys'), icon: 'fa-key', path: '/shop?category=cdkeys' },
    { id: 'gamecards', label: t('nav.gamecards'), icon: 'fa-gamepad', path: '/shop?category=gamecards' },
    { id: 'recharge', label: t('nav.recharge'), icon: 'fa-bolt', path: '/recharge' },
    { id: 'about', label: t('nav.about'), icon: 'fa-building', path: '/about' },
    { id: 'contact', label: t('nav.contact'), icon: 'fa-envelope', path: '/contact' },
  ];

  const languages = SUPPORTED_LANGUAGES;

  const isCategoryLinkActive = (path) => {
    const [pathname, query = ''] = path.split('?');
    if (location.pathname !== pathname) return false;
    if (!query) return location.pathname === pathname && !location.search;
    return location.search === `?${query}`;
  };

  return (
    <>
      {/* Top Bar */}
      <div className="topbar hidden md:block bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[11px] py-1.5">
        <div className="container-fluid">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-4 text-[var(--text-secondary)] flex-wrap">
              <span><i className="fa-regular fa-clock text-emerald-500"></i> توصيل فوري 24/7</span>
              <span><i className="fa-solid fa-shield-halved text-sky-500"></i> حماية 100%</span>
              <span><i className="fa-solid fa-headset text-primary"></i> دعم مباشر 24/7</span>
              <span><i className="fa-solid fa-truck-fast text-amber-500"></i> شحن مجاني للطلبات فوق $50</span>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              {/* Language Dropdown */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-primary transition px-2 py-1 rounded-lg border border-transparent hover:border-[var(--border-color)]"
                >
                  <span>{getLanguageFlag()}</span>
                  <span>{getLanguageName()}</span>
                  <FaChevronDown className="text-[8px] opacity-60" />
                </button>
                {langDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
                    {Object.values(languages).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setLangDropdownOpen(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-primary/10 transition-colors text-right ${
                          language === lang.code ? 'text-primary font-semibold' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {language === lang.code && <span className="mr-auto">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Currency Dropdown */}
              <div className="relative" ref={currencyRef}>
                <button
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-primary transition px-2 py-1 rounded-lg border border-transparent hover:border-[var(--border-color)]"
                >
                  <span>{getCurrencyFlag()}</span>
                  <span>{getCurrencySymbol()} {getCurrencyCode()}</span>
                  <FaChevronDown className="text-[8px] opacity-60" />
                </button>
                {currencyDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-50 min-w-[160px]">
                    {Object.entries(SUPPORTED_CURRENCIES).map(([code, curr]) => (
                      <button
                        key={code}
                        onClick={() => { setCurrency(code); setCurrencyDropdownOpen(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-primary/10 transition-colors text-right ${
                          currency === code ? 'text-primary font-semibold' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        <span>{curr.flag}</span>
                        <span>{curr.symbol} {curr.code}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{curr.name}</span>
                        {currency === code && <span className="mr-auto">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button onClick={toggleTheme} className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-primary transition px-2 py-1 rounded-lg border border-transparent hover:border-[var(--border-color)]">
                {theme === 'dark' ? <FaMoon className="text-xs" /> : <FaSun className="text-xs" />}
                <span>{theme === 'dark' ? 'وضع ليلي' : 'وضع نهار'}</span>
              </button>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Recharge Link */}
              <Link to="/recharge" className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-primary transition px-2 py-1 rounded-lg border border-transparent hover:border-[var(--border-color)]">
                <FaBolt className="text-amber-500 text-xs" /> {t('nav.recharge')}
              </Link>

              {/* Wallet Link */}
              <Link to="/wallet" className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-primary transition px-2 py-1 rounded-lg border border-transparent hover:border-[var(--border-color)]">
                <FaWallet className="text-xs" style={{ color: 'var(--primary-color)' }} /> المحفظة
              </Link>

              {/* Support Link */}
              <Link to="/support" className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-primary transition px-2 py-1 rounded-lg border border-transparent hover:border-[var(--border-color)]">
                <i className="fa-regular fa-circle-question"></i> الدعم
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`nav-glass sticky top-0 z-50 transition-all ${scrolled ? 'shadow-lg' : ''}`} style={{ 
        background: scrolled ? 'color-mix(in srgb, var(--bg-secondary) 94%, transparent)' : 'color-mix(in srgb, var(--bg-secondary) 82%, transparent)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid var(--border-color)' 
      }}>
        <div className="container-fluid">
          <div className="flex items-center justify-between gap-3 py-2 min-h-[60px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 no-underline text-[var(--text-primary)] hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                <FaGamepad className="text-white text-base md:text-lg" />
              </div>
              <div>
                <div className="text-base md:text-xl font-black tracking-tight">CTG<span style={{ color: 'var(--primary-color)' }}>PRO</span></div>
                <span className="text-[7px] md:text-[8px] uppercase text-[var(--text-muted)] tracking-widest block -mt-1 hidden sm:block">{t('nav.home')}</span>
              </div>
            </Link>

            {/* Desktop Page Links */}
            <div className="hidden lg:flex items-center gap-4 ml-6">
              {categories
                .filter((cat) => ['home', 'topup', 'giftcards', 'cdkeys', 'gamecards', 'about', 'contact', 'recharge'].includes(cat.id))
                .map((cat) => (
                  <Link
                    key={cat.id}
                    to={cat.path}
                    className={`text-sm font-medium transition ${isCategoryLinkActive(cat.path) ? 'text-primary' : 'text-[var(--text-secondary)] hover:text-primary'}`}
                  >
                    {cat.label}
                  </Link>
                ))}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <input 
                type="text" 
                placeholder={t('nav.search_placeholder')} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full h-[42px] px-4 pr-12 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" 
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm"></i>
              <button type="submit" className="absolute left-1 top-1/2 -translate-y-1/2 text-white px-3 py-1 rounded-lg text-[10px] font-semibold h-[34px] hover:shadow-lg hover:shadow-primary/20 transition-all" style={{ background: 'var(--primary-color)' }}>
                {t('nav.search')}
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Wishlist */}
              <Link to="/wishlist" className="w-8 h-8 md:w-9 md:h-9 rounded-xl hover:bg-[var(--bg-input)] transition-all flex items-center justify-center text-[var(--text-secondary)] hover:text-pink-500 relative">
                <FaHeart className="text-sm md:text-base text-primary" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-primary/30">0</span>
              </Link>

              {/* Cart */}
              <Link to="/checkout" className="w-8 h-8 md:w-9 md:h-9 rounded-xl hover:bg-[var(--bg-input)] transition-all flex items-center justify-center text-[var(--text-secondary)] hover:text-primary relative">
                <FaShoppingCart className="text-sm md:text-base" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <FaUser className="text-primary text-xs" /> {user?.name}
                  </span>
                  {isAdmin && (
                    <Link to="/admin" className="px-2 py-1 rounded-lg text-primary text-xs hover:bg-primary/10 transition">
                      لوحة التحكم
                    </Link>
                  )}
                  <button onClick={handleLogout} className="px-2.5 py-1 rounded-lg border border-red-500/25 text-red-500 text-xs font-medium hover:bg-red-500/10 transition-all">
                    <FaSignOutAlt className="inline ml-1 text-[10px]" /> {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] text-xs font-medium hover:text-primary hover:bg-[var(--bg-input)] transition-all">
                    <FaUser className="inline ml-1" /> {t('nav.login')}
                  </Link>
                  <Link to="/register" className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all">
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-8 h-8 rounded-xl hover:bg-[var(--bg-input)] transition-all flex items-center justify-center text-[var(--text-secondary)]">
                {mobileMenuOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-5 overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center mb-4">
              <FaTimes className="text-lg" />
            </button>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={cat.path} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-[var(--text-secondary)]" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className={`fa-solid ${cat.icon} w-5`}></i> {cat.label}
                </Link>
              ))}
              <div className="border-t border-[var(--border-color)] pt-3 mt-3 space-y-1">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-[var(--text-secondary)]" onClick={() => setMobileMenuOpen(false)}>
                      <FaUser className="w-5" /> {t('nav.login')}
                    </Link>
                    <Link to="/register" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white transition-all" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fa-solid fa-user-plus w-5"></i> {t('nav.register')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-[var(--text-secondary)]" onClick={() => setMobileMenuOpen(false)}>
                      <FaUser className="w-5" /> حسابي
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-[var(--text-secondary)]" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fa-solid fa-box w-5"></i> طلباتي
                    </Link>
                    <Link to="/recharge" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                      <FaBolt className="w-5" /> {t('nav.recharge')}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-primary" onClick={() => setMobileMenuOpen(false)}>
                        <i className="fa-solid fa-gauge-high w-5"></i> لوحة التحكم
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all text-red-500 w-full text-right">
                      <FaSignOutAlt className="w-5" /> {t('nav.logout')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;