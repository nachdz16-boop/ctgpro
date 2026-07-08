import React, { useEffect, useState } from 'react';
import PageLayout from '../layout/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaUser, FaBox, FaShoppingCart, FaWallet } from 'react-icons/fa';
import api from '../../services/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, products: 0, balance: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get('/users/me/stats');
        setStats(res.data || {});
      } catch (err) {
        // silent fallback if endpoint not present
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <PageLayout title="لوحة المستخدم" subtitle={user?.name || 'المستخدم'} loading={loading}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <FaUser className="text-2xl mx-auto mb-2 text-blue-500" />
          <div className="text-xl font-bold">{user?.name || '-'}</div>
          <div className="text-xs text-[var(--text-secondary)]">الحساب</div>
        </div>
        <div className="card text-center">
          <FaShoppingCart className="text-2xl mx-auto mb-2 text-emerald-500" />
          <div className="text-xl font-bold">{stats.orders || 0}</div>
          <div className="text-xs text-[var(--text-secondary)]">الطلبات</div>
        </div>
        <div className="card text-center">
          <FaBox className="text-2xl mx-auto mb-2 text-primary" />
          <div className="text-xl font-bold">{stats.products || 0}</div>
          <div className="text-xs text-[var(--text-secondary)]">المشتريات</div>
        </div>
        <div className="card text-center">
          <FaWallet className="text-2xl mx-auto mb-2 text-yellow-500" />
          <div className="text-xl font-bold">{formatCurrency(stats.balance || 0)}</div>
          <div className="text-xs text-[var(--text-secondary)]">الرصيد</div>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserDashboard;
