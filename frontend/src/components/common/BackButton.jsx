import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const BackButton = ({ to = null }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] hover:border-primary hover:text-primary transition-colors text-sm">
        <FaArrowLeft /> {t('common.back')}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] hover:border-primary hover:text-primary transition-colors text-sm"
    >
      <FaArrowLeft /> العودة
    </button>
  );
};

export default BackButton;
