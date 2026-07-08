import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-50">
      <div className="loader-spinner"></div>
      <p className="mt-3 text-[var(--text-secondary)] text-sm">جاري تحميل <span className="text-primary font-bold">CTGPRO</span>...</p>
    </div>
  );
};

export default Loader;