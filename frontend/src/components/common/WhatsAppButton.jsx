import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = ({ phone = '213501234567' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <button
        onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-all duration-300 flex items-center justify-center relative border border-white/10"
      >
        <FaWhatsapp className="text-2xl text-white" />
        <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/30"></span>
        <span className={`absolute -top-10 right-0 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs whitespace-nowrap transition-all duration-300 shadow-lg ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> دردش معنا</span>
        </span>
      </button>
    </div>
  );
};

export default WhatsAppButton;