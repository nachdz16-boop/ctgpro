import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Terms = () => {
  const { t } = useLanguage();

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">{t('footer.terms')}</h1>
        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
          <p>باستخدام موقع CTGPRO، فإنك توافق على الالتزام بالشروط والأحكام التالية.</p>
          <h3 className="text-lg font-semibold text-primary mt-4">1. الحساب</h3>
          <p>• أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور</p>
          <p>• يجب أن تكون جميع المعلومات المقدمة صحيحة وكاملة</p>
          <h3 className="text-lg font-semibold text-primary mt-4">2. المنتجات والخدمات</h3>
          <p>• جميع المنتجات رقمية ويتم تسليمها فوراً</p>
          <p>• الأسعار قابلة للتغيير دون إشعار مسبق</p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">آخر تحديث: 1 يناير 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;