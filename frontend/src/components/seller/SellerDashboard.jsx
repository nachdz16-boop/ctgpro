import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FaChartLine, FaBox, FaShoppingCart, FaStar, FaPlus,
  FaEdit, FaTrash, FaEye, FaStore, FaUserTie, FaEnvelope,
  FaPhone, FaCheck, FaTimes, FaSearch, FaFilter
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sellers/dashboard');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching seller stats:', error);
      toast.error('حدث خطأ في جلب الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-transition max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaStore className="text-primary" /> لوحة البائع
        </h1>
        <div className="flex gap-2">
          <Link
            to="/seller/products/new"
            className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
          >
            <FaPlus /> إضافة منتج
          </Link>
        </div>
      </div>

      {/* ===== الإحصائيات ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center hover:border-primary/30 transition-all">
          <FaBox className="text-2xl text-primary mx-auto mb-2" />
          <div className="text-xl font-bold">{stats?.totalProducts || 0}</div>
          <div className="text-xs text-[var(--text-secondary)]">المنتجات</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center hover:border-primary/30 transition-all">
          <FaShoppingCart className="text-2xl text-primary mx-auto mb-2" />
          <div className="text-xl font-bold">{stats?.totalOrders || 0}</div>
          <div className="text-xs text-[var(--text-secondary)]">الطلبات</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center hover:border-primary/30 transition-all">
          <FaStar className="text-2xl text-amber-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{stats?.rating || 0}</div>
          <div className="text-xs text-[var(--text-secondary)]">التقييم</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center hover:border-primary/30 transition-all">
          <FaChartLine className="text-2xl text-emerald-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
          <div className="text-xs text-[var(--text-secondary)]">الإيرادات</div>
        </div>
      </div>

      {/* ===== معلومات البائع ===== */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
        <h3 className="font-bold text-sm mb-3">معلومات البائع</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="font-bold text-lg">{user?.name}</div>
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1"><FaEnvelope className="text-xs" /> {user?.email}</span>
              {user?.phone && <span className="flex items-center gap-1"><FaPhone className="text-xs" /> {user?.phone}</span>}
            </div>
          </div>
          <Link
            to="/profile"
            className="mr-auto px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm"
          >
            تعديل الملف
          </Link>
        </div>
      </div>

      {/* ===== روابط سريعة ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/seller/products"
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/30 transition-all flex items-center gap-3"
        >
          <FaBox className="text-2xl text-primary" />
          <div>
            <div className="font-medium">إدارة المنتجات</div>
            <div className="text-xs text-[var(--text-secondary)]">إضافة وتعديل المنتجات</div>
          </div>
        </Link>

        <Link
          to="/orders"
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/30 transition-all flex items-center gap-3"
        >
          <FaShoppingCart className="text-2xl text-primary" />
          <div>
            <div className="font-medium">الطلبات</div>
            <div className="text-xs text-[var(--text-secondary)]">عرض وإدارة الطلبات</div>
          </div>
        </Link>

        <Link
          to="/support"
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/30 transition-all flex items-center gap-3"
        >
          <FaUserTie className="text-2xl text-primary" />
          <div>
            <div className="font-medium">الدعم</div>
            <div className="text-xs text-[var(--text-secondary)]">تواصل مع فريق الدعم</div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SellerDashboard;