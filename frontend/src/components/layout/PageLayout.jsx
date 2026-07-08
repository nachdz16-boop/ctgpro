import React from 'react';
import BackButton from '../common/BackButton';

const PageLayout = ({ 
  title, 
  subtitle, 
  children, 
  showBack = true,
  backTo = null,
  actions = null,
  className = '',
  fullWidth = false,
  loading = false,
  error = null,
  onRetry = null
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl text-red-500 mb-3">⚠️</div>
        <h3 className="text-xl font-bold mb-2">حدث خطأ</h3>
        <p className="text-[var(--text-secondary)]">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-4 px-6 py-2 rounded-xl btn-primary text-white"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`page-transition ${fullWidth ? 'max-w-full' : 'max-w-6xl mx-auto'} ${className}`}>
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {showBack && <BackButton to={backTo} />}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-[var(--text-secondary)] text-sm">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>

      {/* المحتوى */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;