import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Refund = () => {
  const { t } = useLanguage();

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">{t('footer.refund')}</h1>
        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
          <p>نحن نضمن رضاك التام عن منتجاتنا.</p>
          <h3 className="text-lg font-semibold text-primary mt-4">حالات الاسترداد</h3>
          <p>• المنتج لا يعمل أو تالف</p>
          <p>• لم يتم تسليم المنتج خلال 24 ساعة</p>
          <h3 className="text-lg font-semibold text-primary mt-4">كيفية تقديم طلب</h3>
          <p>• تواصل مع فريق الدعم عبر البريد الإلكتروني: support@ctgpro.com</p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">آخر تحديث: 1 يناير 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Refund;