import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'كيف أحصل على الشفرة بعد الشراء؟', a: 'يتم إرسال الشفرة مباشرة إلى بريدك الإلكتروني خلال دقائق من إتمام الدفع.' },
    { q: 'هل يمكنني استرداد المبلغ؟', a: 'نعم، نقدم ضمان استرداد لمدة 7 أيام في حال وجود مشكلة في الشفرة.' },
    { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل جميع البطاقات البنكية، PayPal، والعملات الرقمية.' },
    { q: 'كم تستغرق عملية الشحن؟', a: 'جميع عمليات الشحن تتم بشكل فوري خلال 2-5 دقائق.' },
  ];

  return (
    <div className="page-transition max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">{t('nav.faq')}</h1>
        <p className="text-[var(--text-secondary)]">{t('faq.title')}</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="card hover:border-primary/30 transition-all overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full text-right flex justify-between items-center hover:bg-[var(--bg-primary)] transition-colors p-4">
              <span className="font-medium text-sm">{faq.q}</span>
              {openIndex === index ? <FaChevronUp className="text-primary flex-shrink-0" /> : <FaChevronDown className="text-[var(--text-muted)] flex-shrink-0" />}
            </button>
            {openIndex === index && <div className="p-4 pt-0 text-[var(--text-secondary)] text-sm border-t border-[var(--border-color)] leading-relaxed">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;