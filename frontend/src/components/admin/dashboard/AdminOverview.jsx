// src/components/admin/AdminOverview.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import AdminMetricCard from '../common/AdminMetricCard';
import { 
  FaUsers, FaStore, FaBox, FaShoppingCart, FaMoneyBillWave,
  FaBalanceScale, FaChartLine, FaArrowUp, FaArrowDown,
  FaEye, FaShoppingBag, FaUserPlus, FaGift, FaKey,
  FaWallet, FaBell, FaCog, FaUserCircle, FaBoxes, FaChartPie, FaClock,
  FaExclamationTriangle,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const AdminOverview = () => {
  const { t, formatCurrency } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalStock: 1280,
    lowStock: 92,
    outOfStock: 14,
    reservedStock: 82
  });

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    fetchRecentUsers();
    fetchInventoryStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      const nextStats = res.data?.stats || {};
      setStats(nextStats);
      setInventoryStats({
        totalStock: nextStats.inventoryTotal || 0,
        lowStock: nextStats.lowStock || 0,
        outOfStock: nextStats.outOfStock || 0,
        reservedStock: nextStats.reservedStock || 0,
      });
      toast.success('تم تحديث الإحصائيات من قاعدة البيانات');
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('حدث خطأ في جلب الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await api.get('/admin/orders/recent');
      const orders = (res.data?.orders || []).map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber || `#${order._id?.slice(-6)}`,
        customer: order.userId?.name || 'مستخدم',
        amount: order.total || 0,
        status: order.status || 'pending',
        createdAt: order.createdAt,
        rechargeService: order.rechargeMeta?.service || '',
        rechargePlayerId: order.rechargeMeta?.playerId || '',
      }));
      setRecentOrders(orders);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setRecentOrders([]);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const res = await api.get('/admin/users/recent');
      const users = (res.data?.users || []).map((user) => ({
        id: user._id,
        name: user.name || 'مستخدم',
        email: user.email || '',
        role: user.role || 'user',
        createdAt: user.createdAt,
      }));
      setRecentUsers(users);
    } catch (error) {
      console.error('Error fetching recent users:', error);
      setRecentUsers([]);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      const nextStats = res.data?.stats || {};
      setInventoryStats({
        totalStock: nextStats.inventoryTotal || 0,
        lowStock: nextStats.lowStock || 0,
        outOfStock: nextStats.outOfStock || 0,
        reservedStock: nextStats.reservedStock || 0,
      });
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    }
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  const handleRefresh = () => {
    fetchStats();
    fetchRecentOrders();
    fetchRecentUsers();
    fetchInventoryStats();
    toast.success('تم تحديث جميع البيانات');
  };

  const quickStats = [
    { icon: <FaMoneyBillWave />, value: formatCurrency(stats?.todaysRevenue || 0), label: 'الإيرادات اليوم', color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/admin/reports' },
    { icon: <FaShoppingCart />, value: stats?.newOrders || 0, label: 'الطلبات الجديدة', color: 'text-amber-500', bg: 'bg-amber-500/10', path: '/admin/orders' },
    { icon: <FaClock />, value: stats?.pendingOrders || 0, label: 'الطلبات المعلقة', color: 'text-blue-500', bg: 'bg-blue-500/10', path: '/admin/orders' },
    { icon: <FaBalanceScale />, value: stats?.disputes || 0, label: 'النزاعات المفتوحة', color: 'text-red-500', bg: 'bg-red-500/10', path: '/admin/disputes' },
    { icon: <FaBox />, value: stats?.lowStock || 0, label: 'المنتجات منخفضة المخزون', color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/admin/finance' },
    { icon: <FaStore />, value: stats?.activeSellers || 0, label: 'البائعون النشطون', color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/admin/sellers' },
  ];

  const quickLinks = [
    { icon: <FaWallet />, label: 'المحفظة', path: '/admin/payment', color: 'text-emerald-500' },
    { icon: <FaShoppingCart />, label: 'الطلبات', path: '/admin/orders', color: 'text-amber-500' },
    { icon: <FaBalanceScale />, label: 'النزاعات', path: '/admin/disputes', color: 'text-red-500' },
    { icon: <FaChartLine />, label: 'التقارير', path: '/admin/reports', color: 'text-blue-500' },
    { icon: <FaFileInvoiceDollar />, label: 'الفواتير والمخزون', path: '/admin/finance', color: 'text-emerald-500' },
    { icon: <FaBell />, label: 'الإشعارات', path: '/admin/notifications', color: 'text-amber-500' },
    { icon: <FaCog />, label: 'الإعدادات', path: '/admin/settings', color: 'text-blue-500' },
    { icon: <FaUserCircle />, label: 'البروفايل', path: '/admin/profile', color: 'text-emerald-500' },
  ];

  const inventoryChartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'حركة المخزون',
        data: [Math.max(inventoryStats.totalStock - 80, 0), Math.max(inventoryStats.totalStock - 60, 0), Math.max(inventoryStats.totalStock - 40, 0), Math.max(inventoryStats.totalStock - 20, 0), inventoryStats.totalStock - 10, inventoryStats.totalStock],
        borderColor: '#00dc82',
        backgroundColor: 'rgba(0,220,130,0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const inventoryDoughnutData = {
    labels: ['متاح', 'قليل', 'منتهي'],
    datasets: [
      {
        data: [
          inventoryStats.totalStock - inventoryStats.lowStock - inventoryStats.outOfStock,
          inventoryStats.lowStock,
          inventoryStats.outOfStock
        ],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const inventoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.15)' },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'مكتمل', className: 'bg-emerald-500/20 text-emerald-500' },
      processing: { label: 'قيد المعالجة', className: 'bg-amber-500/20 text-amber-500' },
      pending: { label: 'معلق', className: 'bg-blue-500/20 text-blue-500' },
      cancelled: { label: 'ملغي', className: 'bg-red-500/20 text-red-500' },
      shipped: { label: 'تم الشحن', className: 'bg-primary/20 text-primary' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' };
  };

  const pendingOldOrders = recentOrders.filter((order) => {
    if (order.status !== 'pending' || !order.createdAt) {
      return false;
    }

    const createdAt = new Date(order.createdAt).getTime();
    if (Number.isNaN(createdAt)) {
      return false;
    }

    return Date.now() - createdAt > 24 * 60 * 60 * 1000;
  }).length;

  const operationalAlerts = [
    inventoryStats.lowStock > 0 && {
      key: 'low-stock',
      title: 'مخزون منخفض',
      description: `${inventoryStats.lowStock} منتج يحتاج إعادة تعبئة`,
      tone: 'warning',
      action: '/admin/finance',
      actionLabel: 'مراجعة المخزون',
    },
    inventoryStats.outOfStock > 0 && {
      key: 'out-of-stock',
      title: 'منتجات منتهية',
      description: `${inventoryStats.outOfStock} منتج خارج المخزون`,
      tone: 'danger',
      action: '/admin/products',
      actionLabel: 'تحديث المنتجات',
    },
    stats?.disputes > 0 && {
      key: 'open-disputes',
      title: 'نزاعات مفتوحة',
      description: `${stats.disputes} نزاع يحتاج تدخلًا إداريًا`,
      tone: 'info',
      action: '/admin/disputes',
      actionLabel: 'عرض النزاعات',
    },
    pendingOldOrders > 0 && {
      key: 'pending-orders',
      title: 'طلبات معلقة قديمة',
      description: `${pendingOldOrders} طلب معلق منذ أكثر من 24 ساعة`,
      tone: 'warning',
      action: '/admin/orders',
      actionLabel: 'مراجعة الطلبات',
    },
    recentOrders.some((order) => order.status === 'failed') && {
      key: 'failed-payment',
      title: 'فشل في الدفع',
      description: 'تم رصد طلبات فشل دفعها مؤخرًا',
      tone: 'danger',
      action: '/admin/orders',
      actionLabel: 'فحص الطلبات',
    },
  ].filter(Boolean);

  const alertToneClasses = {
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    danger: 'border-red-500/20 bg-red-500/10 text-red-400',
    info: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
  };

  const automatedDecisions = useMemo(() => {
    const decisions = [];

    if (inventoryStats.lowStock > 0) {
      decisions.push({
        id: 'restock-low-stock',
        title: 'إعادة تعبئة المخزون منخفض الكمية',
        reason: `${inventoryStats.lowStock} منتج يحتاج إعادة طلب`,
        impact: 'تقليل خطر نفاد المخزون',
        tone: 'warning',
        actionLabel: 'فتح الفواتير والمخزون',
        action: () => navigateTo('/admin/finance'),
      });
    }

    if (pendingOldOrders > 0) {
      decisions.push({
        id: 'escalate-old-orders',
        title: 'تصعيد الطلبات المعلقة القديمة',
        reason: `${pendingOldOrders} طلب تجاوز 24 ساعة`,
        impact: 'خفض زمن المعالجة وتحسين الرضا',
        tone: 'danger',
        actionLabel: 'مراجعة الطلبات',
        action: () => navigateTo('/admin/orders'),
      });
    }

    if (stats?.disputes > 0) {
      decisions.push({
        id: 'review-disputes',
        title: 'فتح مراجعة تلقائية للنزاعات',
        reason: `${stats.disputes} نزاع مفتوح`,
        impact: 'تسريع الإغلاق ومعالجة الشكاوى',
        tone: 'info',
        actionLabel: 'عرض النزاعات',
        action: () => navigateTo('/admin/disputes'),
      });
    }

    if (inventoryStats.outOfStock > 0) {
      decisions.push({
        id: 'hide-out-of-stock',
        title: 'تعطيل الترويج للمنتجات المنتهية',
        reason: `${inventoryStats.outOfStock} منتج منتهي المخزون`,
        impact: 'منع طلب منتجات غير متوفرة',
        tone: 'warning',
        actionLabel: 'مراجعة المنتجات',
        action: () => navigateTo('/admin/products'),
      });
    }

    if (recentOrders.some((order) => order.status === 'failed')) {
      decisions.push({
        id: 'review-failed-payments',
        title: 'مراجعة فشل عمليات الدفع',
        reason: 'تم رصد طلبات فشل دفعها',
        impact: 'تقليل فقدان الإيرادات',
        tone: 'danger',
        actionLabel: 'فحص الطلبات',
        action: () => navigateTo('/admin/orders'),
      });
    }

    return decisions.slice(0, 5);
  }, [inventoryStats.lowStock, inventoryStats.outOfStock, pendingOldOrders, stats?.disputes, recentOrders]);

  // دالة لعرض تفاصيل الطلب
  const viewOrderDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // دالة لعرض تفاصيل المستخدم
  const viewUserDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">نظرة عامة</h2>
          <p className="text-sm text-[var(--text-secondary)]">مرحباً بك في لوحة التحكم</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaChartLine className="text-primary" /> تحديث
          </button>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="flex flex-wrap gap-2">
        {quickLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => navigateTo(link.path)}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <span className={link.color}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickStats.map((stat, index) => (
          <AdminMetricCard
            key={index}
            onClick={() => navigateTo(stat.path)}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            iconClassName={stat.color}
          />
        ))}
      </div>

      {/* التنبيهات التشغيلية */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500" /> تنبيهات تشغيلية
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">تنبيهات فورية مبنية على بيانات المخزون والطلبات الحالية</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
            {operationalAlerts.length} تنبيه
          </span>
        </div>

        {operationalAlerts.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            لا توجد تنبيهات حرجة حاليًا.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {operationalAlerts.map((alert) => (
              <div key={alert.key} className={`rounded-xl border p-4 ${alertToneClasses[alert.tone]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{alert.title}</div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">{alert.description}</div>
                  </div>
                  <FaBell className="shrink-0 text-lg" />
                </div>
                <button
                  onClick={() => navigateTo(alert.action)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--bg-primary)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)]"
                >
                  {alert.actionLabel}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FaCog className="text-primary" /> قرارات إدارية مؤتمتة
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">قرارات مقترحة تلقائيًا بناءً على الحالة التشغيلية الحالية</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
            {automatedDecisions.length} قرار
          </span>
        </div>

        {automatedDecisions.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            لا توجد قرارات عاجلة حاليًا. الوضع مستقر.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {automatedDecisions.map((decision) => (
              <div key={decision.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{decision.title}</div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">{decision.reason}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${decision.tone === 'warning' ? 'bg-amber-500/20 text-amber-500' : decision.tone === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-sky-500/20 text-sky-500'}`}>
                    آلي
                  </span>
                </div>
                <div className="mt-3 text-xs text-[var(--text-secondary)]">
                  الأثر المتوقع: {decision.impact}
                </div>
                <button
                  onClick={decision.action}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)]"
                >
                  {decision.actionLabel}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* آخر الطلبات */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FaShoppingBag className="text-primary" /> آخر الطلبات
            </h3>
            <button 
              onClick={() => navigateTo('/admin/orders')}
              className="text-xs text-primary hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recentOrders.map((order) => {
              const status = getStatusBadge(order.status);
              return (
                <div 
                  key={order.id} 
                  className="p-3 bg-[var(--bg-primary)] rounded-lg flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                  onClick={() => viewOrderDetails(order.id)}
                >
                  <div>
                    <div className="font-medium text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{order.customer}</div>
                    {order.rechargeService ? (
                      <div className="mt-1 text-[10px] inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        <FaShoppingCart className="text-[9px]" />
                        {order.rechargeService}
                        {order.rechargePlayerId ? ` • ${order.rechargePlayerId}` : ''}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{formatCurrency(order.amount)}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* آخر المستخدمين */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FaUserPlus className="text-primary" /> آخر المستخدمين
            </h3>
            <button 
              onClick={() => navigateTo('/admin/users')}
              className="text-xs text-primary hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recentUsers.map((user) => (
              <div 
                key={user.id} 
                className="p-3 bg-[var(--bg-primary)] rounded-lg flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                onClick={() => viewUserDetails(user.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  user.role === 'admin' ? 'bg-emerald-500/20 text-emerald-500' :
                  user.role === 'seller' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {user.role === 'admin' ? 'مدير' : user.role === 'seller' ? 'بائع' : 'مستخدم'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* مخزون وشارتات */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">تحركات المخزون</h3>
              <p className="text-xs text-[var(--text-secondary)]">عرض شهري لحالة المخزون</p>
            </div>
            <div className="text-sm text-[var(--text-secondary)]">آخر 6 أشهر</div>
          </div>
          <div className="h-[280px]">
            <Line data={inventoryChartData} options={inventoryOptions} />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">
              <FaBoxes />
            </div>
            <div>
              <h3 className="text-lg font-bold">ملخص الجرد</h3>
              <p className="text-xs text-[var(--text-secondary)]">نظرة سريعة على حالة المخزون</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-[var(--text-secondary)]">إجمالي الكمية</div>
                <span className="text-sm text-emerald-500">+12%</span>
              </div>
              <div className="text-3xl font-bold">{inventoryStats.totalStock}</div>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-[var(--text-secondary)]">أقل من الحد</div>
                <span className="text-sm text-amber-500">{inventoryStats.lowStock}</span>
              </div>
              <div className="h-48">
                <Doughnut data={inventoryDoughnutData} options={{
                  plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94a3b8' } } },
                  maintainAspectRatio: false,
                }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                <div className="text-xs text-[var(--text-secondary)] mb-2">منتهي المخزون</div>
                <div className="text-2xl font-bold text-red-500">{inventoryStats.outOfStock}</div>
              </div>
              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 text-center">
                <div className="text-xs text-[var(--text-secondary)] mb-2">محجوز</div>
                <div className="text-2xl font-bold text-blue-500">{inventoryStats.reservedStock}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار الإجراءات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => navigateTo('/admin/products')}
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/30 transition-all text-center group"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl group-hover:scale-110 transition-transform">
            <FaBox />
          </div>
          <div className="text-sm font-medium mt-2">إدارة المنتجات</div>
          <div className="text-xs text-[var(--text-secondary)]">إضافة وتعديل المنتجات</div>
        </button>

        <button
          onClick={() => navigateTo('/admin/codes')}
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/30 transition-all text-center group"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl group-hover:scale-110 transition-transform">
            <FaKey />
          </div>
          <div className="text-sm font-medium mt-2">الأكواد والبطاقات</div>
          <div className="text-xs text-[var(--text-secondary)]">توليد وإدارة الأكواد</div>
        </button>

        <button
          onClick={() => navigateTo('/admin/payment')}
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/30 transition-all text-center group"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl group-hover:scale-110 transition-transform">
            <FaWallet />
          </div>
          <div className="text-sm font-medium mt-2">بوابات الدفع</div>
          <div className="text-xs text-[var(--text-secondary)]">إدارة طرق الدفع</div>
        </button>

        <button
          onClick={() => navigateTo('/admin/reports')}
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/30 transition-all text-center group"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl group-hover:scale-110 transition-transform">
            <FaChartLine />
          </div>
          <div className="text-sm font-medium mt-2">التقارير</div>
          <div className="text-xs text-[var(--text-secondary)]">عرض الإحصائيات</div>
        </button>

        <button
          onClick={() => navigateTo('/admin/finance')}
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/30 transition-all text-center group"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl group-hover:scale-110 transition-transform">
            <FaFileInvoiceDollar />
          </div>
          <div className="text-sm font-medium mt-2">الفواتير والمخزون</div>
          <div className="text-xs text-[var(--text-secondary)]">التحصيل والزكاة</div>
        </button>
      </div>
    </div>
  );
};

export default AdminOverview;