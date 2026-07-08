import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FaUsers, FaShoppingCart, FaStore, FaTrophy, FaRocket, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">{t('nav.about')}</h1>
        <p className="text-[var(--text-secondary)]">تعرف على CTGPRO - منصة الشحن الرقمي الأولى في الشرق الأوسط</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center hover:border-primary transition-all hover:-translate-y-1">
          <FaUsers className="text-3xl text-primary mx-auto mb-3" />
          <div className="text-3xl font-bold text-primary">500K+</div>
          <div className="text-sm text-[var(--text-secondary)]">عميل سعيد</div>
        </div>
        <div className="card text-center hover:border-primary transition-all hover:-translate-y-1">
          <FaShoppingCart className="text-3xl text-primary mx-auto mb-3" />
          <div className="text-3xl font-bold text-primary">5M+</div>
          <div className="text-sm text-[var(--text-secondary)]">عملية شحن</div>
        </div>
        <div className="card text-center hover:border-primary transition-all hover:-translate-y-1">
          <FaStore className="text-3xl text-primary mx-auto mb-3" />
          <div className="text-3xl font-bold text-primary">50+</div>
          <div className="text-sm text-[var(--text-secondary)]">بائع معتمد</div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><FaRocket className="text-primary" /> قصتنا</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">تأسست CTGPRO في عام 2020 بهدف تسهيل عملية الشحن الرقمي للألعاب والبطاقات في الشرق الأوسط.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card hover:border-primary transition-all">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><FaTrophy className="text-amber-500" /> رسالتنا</h3>
          <p className="text-[var(--text-secondary)] text-sm">توفير تجربة شحن رقمية سلسة وآمنة للجميع</p>
        </div>
        <div className="card hover:border-primary transition-all">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><FaShieldAlt className="text-primary" /> رؤيتنا</h3>
          <p className="text-[var(--text-secondary)] text-sm">أن نكون المنصة الرقمية الأولى في المنطقة</p>
        </div>
      </div>
    </div>
  );
};

export default About;