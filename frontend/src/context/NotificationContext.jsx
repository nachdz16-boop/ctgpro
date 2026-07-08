import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { getSocket } from '../services/socket';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, registerRestoreHandler } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const userId = user?._id || user?.id;

  const getIconByType = useCallback((type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'order': return '📦';
      case 'payment': return '💰';
      default: return '📢';
    }
  }, []);

  const formatNotification = useCallback((notification) => {
    if (!notification) return null;
    const title = typeof notification.title === 'string'
      ? notification.title
      : notification.title?.ar || notification.title?.en || notification.title?.fr || 'إشعار جديد';
    const message = typeof notification.message === 'string'
      ? notification.message
      : notification.message?.ar || notification.message?.en || notification.message?.fr || '';

    return {
      id: notification._id || notification.id || Date.now(),
      title,
      message,
      type: notification.type || 'info',
      link: notification.link || null,
      read: notification.isRead || false,
      date: notification.createdAt || notification.date || new Date().toISOString(),
      icon: notification.icon || getIconByType(notification.type),
    };
  }, [getIconByType]);

  const loadNotifications = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const res = await api.get('/notifications');
      const data = res.data.notifications || [];
      const formatted = data.map(formatNotification);
      setNotifications(formatted);
      setUnreadCount(formatted.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, formatNotification]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, userId, loadNotifications]);

  useEffect(() => {
    if (!registerRestoreHandler) return;
    const unregister = registerRestoreHandler(loadNotifications);
    return () => unregister();
  }, [loadNotifications, registerRestoreHandler]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isAuthenticated) return;

    const handleNotificationCreated = (notification) => {
      const formatted = formatNotification(notification);
      setNotifications((prev) => [formatted, ...prev]);
      setUnreadCount((prev) => prev + (!formatted.read ? 1 : 0));
      showToastNotification(formatted.title, formatted.message, formatted.type);
    };

    const handleSocketConnect = () => {
      loadNotifications();
      toast.success('🔔 تم استعادة الاتصال بالإشعارات');
    };

    const handleSocketReconnect = () => {
      loadNotifications();
      toast.success('🔔 تم إعادة الاتصال بالإشعارات');
    };

    socket.on('notification_created', handleNotificationCreated);
    socket.on('connect', handleSocketConnect);
    socket.on('reconnect', handleSocketReconnect);

    return () => {
      socket.off('notification_created', handleNotificationCreated);
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect', handleSocketReconnect);
    };
  }, [isAuthenticated, userId, formatNotification, loadNotifications]);

  const addNotification = async (title, message, type = 'info', link = null, icon = null) => {
    const notif = {
      id: Date.now(),
      title,
      message,
      type,
      link,
      read: false,
      date: new Date().toISOString(),
      icon: icon || getIconByType(type),
    };
    
    const updated = [notif, ...notifications];
    setNotifications(updated);
    setUnreadCount(prev => prev + 1);

    showToastNotification(title, message, type);

    return notif;
  };

  const showToastNotification = (title, message, type) => {
    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      order: '📦',
      payment: '💰',
    };
    const icon = iconMap[type] || '📢';
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[var(--bg-secondary)] shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-[var(--border-color)] ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-xl">{icon}</span>
            </div>
            <div className="mr-3 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-[var(--border-color)]">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const markAsRead = async (id) => {
    try {
      const updated = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);

      if (isAuthenticated) {
        await api.put(`/notifications/${id}/read`);
      }
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);

      if (isAuthenticated) {
        await api.put('/notifications/read-all');
      }
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);

      if (isAuthenticated) {
        await api.delete(`/notifications/${id}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getUnreadCount = () => unreadCount;

  const value = {
    notifications,
    unreadCount,
    showPanel,
    setShowPanel,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadCount,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};