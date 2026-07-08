import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTrash } from 'react-icons/fa';

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeStyles = (type) => {
    const styles = {
      success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <FaCheckCircle className="text-emerald-500" /> },
      error: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <FaExclamationCircle className="text-red-500" /> },
      warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <FaExclamationTriangle className="text-amber-500" /> },
      info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <FaInfoCircle className="text-blue-500" /> },
      order: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <FaInfoCircle className="text-emerald-500" /> },
      payment: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <FaInfoCircle className="text-emerald-500" /> },
    };
    return styles[type] || styles.info;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} د`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} س`;
    const days = Math.floor(hours / 24);
    return `${days} ي`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl hover:bg-[var(--bg-input)] transition-all flex items-center justify-center text-[var(--text-secondary)] hover:text-primary"
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50">
          <div className="sticky top-0 bg-[var(--bg-secondary)] p-3 border-b border-[var(--border-color)] flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FaBell className="text-primary" />
              {t('notifications.title')}
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-[var(--text-muted)] hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-[var(--bg-input)]"
                  >
                    {t('notifications.mark_all_read')}
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-[10px] text-red-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-[var(--text-secondary)] text-sm">{t('notifications.no_notifications')}</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notif) => {
                const styles = getTypeStyles(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border ${styles.border} ${styles.bg} transition-all hover:scale-[1.02] cursor-pointer ${notif.read ? 'opacity-60' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="text-lg">{notif.icon || '📢'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium ${notif.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {getTimeAgo(notif.date)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{notif.message}</p>
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                        )}
                        {notif.link && (
                          <button className="mt-1 text-[10px] text-primary hover:underline">
                            عرض التفاصيل
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;