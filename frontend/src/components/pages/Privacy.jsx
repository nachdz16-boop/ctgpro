import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">{t('footer.privacy')}</h1>
        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
          <p>نحن في CTGPRO نولي خصوصية بياناتك أهمية كبيرة.</p>
          <h3 className="text-lg font-semibold text-primary mt-4">المعلومات التي نجمعها</h3>
          <p>• معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف</p>
          <p>• معلومات الطلب: المنتجات المشتراة، طريقة الدفع</p>
          <h3 className="text-lg font-semibold text-primary mt-4">حماية البيانات</h3>
          <p>• نستخدم تشفير SSL لحماية بياناتك</p>
          <p>• لا نشارك بياناتك مع أطراف ثالثة دون موافقتك</p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">آخر تحديث: 1 يناير 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;