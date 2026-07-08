import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { FaGamepad, FaMobileAlt, FaBolt, FaShieldAlt, FaClock, FaTrophy, FaChevronLeft } from 'react-icons/fa';

const Recharge = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('games');

  const games = [
    { id: 'pubg', name: 'PUBG Mobile', icon: <FaGamepad />, color: 'from-orange-500 to-orange-600', search: 'pubg' },
    { id: 'freefire', name: 'Free Fire', icon: <FaBolt />, color: 'from-red-500 to-red-600', search: 'free fire' },
    { id: 'mlbb', name: 'Mobile Legends', icon: <FaGamepad />, color: 'from-blue-500 to-blue-600', search: 'mobile legends' },
  ];

  const mobileTopups = [
    { id: 'inwi', name: 'Inwi', note: 'تعبئة فورية' },
    { id: 'orange', name: 'Orange', note: 'رصيد مباشر' },
    { id: 'iam', name: 'Maroc Telecom', note: 'شحن سريع' },
  ];

  const goToTopupShop = (search) => {
    const params = new URLSearchParams({ category: 'topup' });
    if (search) params.set('search', search);
    navigate(`/shop?${params.toString()}`);
  };

  return (
    <div className="page-transition max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FaBolt className="text-primary" />
          {t('recharge.title')}
        </h1>
        <p className="text-[var(--text-secondary)]">{t('recharge.desc')}</p>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        <button onClick={() => setActiveTab('games')} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'games' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/50'}`}>
          <FaGamepad /> شحن ألعاب
        </button>
        <button onClick={() => setActiveTab('mobile')} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'mobile' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/50'}`}>
          <FaMobileAlt /> شحن رصيد
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6">
        {activeTab === 'games' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className={`bg-gradient-to-br ${game.color} p-6 rounded-2xl text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}
                onClick={() => goToTopupShop(game.search)}
              >
                <div className="text-4xl mb-3">{game.icon}</div>
                <h3 className="font-bold text-lg">{game.name}</h3>
                <p className="text-sm opacity-80">شحن فوري</p>
                <button
                  className="mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all inline-flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToTopupShop(game.search);
                  }}
                >
                  شحن الآن
                  <FaChevronLeft className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'mobile' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <FaMobileAlt className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">شحن رصيد الهاتف</h3>
              <p className="text-[var(--text-secondary)]">اختر شركة الاتصال ثم أكمل الشحن من صفحة المنتجات</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mobileTopups.map((carrier) => (
                <button
                  key={carrier.id}
                  onClick={() => goToTopupShop(carrier.name)}
                  className="text-right bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/50 transition-all"
                >
                  <h4 className="font-bold mb-1">{carrier.name}</h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{carrier.note}</p>
                  <span className="text-primary text-sm font-semibold inline-flex items-center gap-2">
                    عرض المنتجات
                    <FaChevronLeft className="text-xs" />
                  </span>
                </button>
              ))}
            </div>
            <div className="text-center pt-1">
              <button
                onClick={() => goToTopupShop('')}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-all inline-flex items-center gap-2"
              >
                عرض كل منتجات الشحن
                <FaChevronLeft className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="card text-center">
          <FaBolt className="text-2xl text-primary mx-auto mb-2" />
          <h4 className="font-bold text-sm">شحن فوري</h4>
          <p className="text-xs text-[var(--text-secondary)]">خلال دقائق</p>
        </div>
        <div className="card text-center">
          <FaShieldAlt className="text-2xl text-emerald-500 mx-auto mb-2" />
          <h4 className="font-bold text-sm">آمن 100%</h4>
          <p className="text-xs text-[var(--text-secondary)]">مدفوعات مشفرة</p>
        </div>
        <div className="card text-center">
          <FaClock className="text-2xl text-amber-500 mx-auto mb-2" />
          <h4 className="font-bold text-sm">خدمة 24/7</h4>
          <p className="text-xs text-[var(--text-secondary)]">دعم مستمر</p>
        </div>
        <div className="card text-center">
          <FaTrophy className="text-2xl text-amber-500 mx-auto mb-2" />
          <h4 className="font-bold text-sm">أفضل الأسعار</h4>
          <p className="text-xs text-[var(--text-secondary)]">أسعار تنافسية</p>
        </div>
      </div>
    </div>
  );
};

export default Recharge;