import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaGamepad, FaMobileAlt, FaBolt, FaShieldAlt, FaClock, FaTrophy } from 'react-icons/fa';

const Recharge = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('games');

  const games = [
    { id: 'pubg', name: 'PUBG Mobile', icon: <FaGamepad />, color: 'from-orange-500 to-orange-600' },
    { id: 'freefire', name: 'Free Fire', icon: <FaBolt />, color: 'from-red-500 to-red-600' },
    { id: 'mlbb', name: 'Mobile Legends', icon: <FaGamepad />, color: 'from-blue-500 to-blue-600' },
  ];

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
              <div key={game.id} className={`bg-gradient-to-br ${game.color} p-6 rounded-2xl text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}>
                <div className="text-4xl mb-3">{game.icon}</div>
                <h3 className="font-bold text-lg">{game.name}</h3>
                <p className="text-sm opacity-80">شحن فوري</p>
                <button className="mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all">شحن الآن</button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'mobile' && (
          <div className="text-center py-8">
            <FaMobileAlt className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">شحن رصيد الهاتف</h3>
            <p className="text-[var(--text-secondary)]">قريباً ...</p>
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