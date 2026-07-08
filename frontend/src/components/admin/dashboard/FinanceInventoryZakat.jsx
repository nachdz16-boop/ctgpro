import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import {
  FaFileInvoiceDollar,
  FaBoxOpen,
  FaWarehouse,
  FaCoins,
  FaChartLine,
  FaExclamationTriangle,
  FaShoppingCart,
  FaBoxes,
  FaWallet,
  FaBalanceScale,
  FaCog,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const FinanceInventoryZakat = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [ordersRes, statsRes, walletRes] = await Promise.all([
          api.get('/admin/orders').catch(() => ({ data: { orders: [] } })),
          api.get('/admin/stats').catch(() => ({ data: { stats: {} } })),
          api.get('/wallet').catch(() => ({ data: {} })),
        ]);

        const nextOrders = ordersRes.data?.orders || [];
        const nextStats = statsRes.data?.stats || {};
        const nextWallet = walletRes.data?.wallet || {};

        setOrders(nextOrders);
        setStats(nextStats);
        setWallet(nextWallet);
      } catch (error) {
        console.error('Error loading finance inventory data', error);
        toast.error('تعذر تحميل بيانات الفواتير والمخزون');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const financeSummary = useMemo(() => {
    const completedOrders = orders.filter((order) => order.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const avgOrderValue = completedOrders.length ? totalRevenue / completedOrders.length : 0;
    const cashBalance = Number(wallet?.availableBalance || wallet?.balance || 0);
    const inventoryTotal = Number(stats?.inventoryTotal || 0);
    const lowStock = Number(stats?.lowStock || 0);
    const outOfStock = Number(stats?.outOfStock || 0);
    const reservedStock = Number(stats?.reservedStock || 0);
    const inventoryValueEstimate = Math.max(inventoryTotal, 0) * Math.max(avgOrderValue, 1);
    const zakatAmount = (cashBalance * 0.025) + (inventoryValueEstimate * 0.025);

    return {
      totalRevenue,
      avgOrderValue,
      cashBalance,
      inventoryTotal,
      lowStock,
      outOfStock,
      reservedStock,
      inventoryValueEstimate,
      zakatAmount,
      completedOrdersCount: completedOrders.length,
    };
  }, [orders, stats, wallet]);

  const recentInvoices = useMemo(() => {
    return orders.slice(0, 6).map((order) => ({
      id: order._id,
      number: order.orderNumber || `#${order._id?.slice(-6)}`,
      customer: order.userId?.name || 'مستخدم',
      total: Number(order.total || 0),
      status: order.status || 'pending',
      date: order.createdAt,
    }));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">إدارة الفواتير والمخزون وحساب الزكاة</h2>
        <p className="text-sm text-[var(--text-secondary)]">نظرة سريعة على الإيرادات، المخزون، والفواتير مع حساب زكاة تقديري</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-right transition hover:border-primary/50 hover:bg-[var(--bg-primary)]"
        >
          <span>
            <p className="font-semibold">إدارة الطلبات</p>
            <p className="text-sm text-[var(--text-secondary)]">متابعة الطلبات والفواتير</p>
          </span>
          <div className="rounded-full bg-amber-500/10 p-3 text-amber-500"><FaShoppingCart /></div>
        </button>

        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-right transition hover:border-primary/50 hover:bg-[var(--bg-primary)]"
        >
          <span>
            <p className="font-semibold">إدارة المخزون</p>
            <p className="text-sm text-[var(--text-secondary)]">التحكم في المنتجات والكميات</p>
          </span>
          <div className="rounded-full bg-primary/10 p-3 text-primary"><FaBoxes /></div>
        </button>

        <button
          onClick={() => navigate('/admin/payment')}
          className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-right transition hover:border-primary/50 hover:bg-[var(--bg-primary)]"
        >
          <span>
            <p className="font-semibold">الدفع والمحفظة</p>
            <p className="text-sm text-[var(--text-secondary)]">إدارة التحويلات والمدفوعات</p>
          </span>
          <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500"><FaWallet /></div>
        </button>

        <button
          onClick={() => navigate('/admin/reports')}
          className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-right transition hover:border-primary/50 hover:bg-[var(--bg-primary)]"
        >
          <span>
            <p className="font-semibold">التقارير</p>
            <p className="text-sm text-[var(--text-secondary)]">عرض الإيرادات والأداء</p>
          </span>
          <div className="rounded-full bg-blue-500/10 p-3 text-blue-500"><FaChartLine /></div>
        </button>

        <button
          onClick={() => navigate('/admin/disputes')}
          className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-right transition hover:border-primary/50 hover:bg-[var(--bg-primary)]"
        >
          <span>
            <p className="font-semibold">النزاعات</p>
            <p className="text-sm text-[var(--text-secondary)]">متابعة شكاوى الطلبات</p>
          </span>
          <div className="rounded-full bg-red-500/10 p-3 text-red-500"><FaBalanceScale /></div>
        </button>

        <button
          onClick={() => navigate('/admin/store')}
          className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-right transition hover:border-primary/50 hover:bg-[var(--bg-primary)]"
        >
          <span>
            <p className="font-semibold">الإعدادات</p>
            <p className="text-sm text-[var(--text-secondary)]">تعديل إعدادات المتجر</p>
          </span>
          <div className="rounded-full bg-slate-500/10 p-3 text-slate-500"><FaCog /></div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold">{formatCurrency(financeSummary.totalRevenue)}</p>
            </div>
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500"><FaFileInvoiceDollar /></div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">الفواتير المكتملة</p>
              <p className="text-2xl font-bold">{financeSummary.completedOrdersCount}</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3 text-blue-500"><FaChartLine /></div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">إجمالي المخزون</p>
              <p className="text-2xl font-bold">{financeSummary.inventoryTotal}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary"><FaWarehouse /></div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">الزكاة المقدرة</p>
              <p className="text-2xl font-bold">{formatCurrency(financeSummary.zakatAmount)}</p>
            </div>
            <div className="rounded-full bg-amber-500/10 p-3 text-amber-500"><FaCoins /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">الفواتير الحديثة</h3>
            <span className="text-sm text-[var(--text-secondary)]">آخر 6 فواتير</span>
          </div>
          <div className="space-y-3">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                <div>
                  <p className="font-semibold">{invoice.number}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{invoice.customer}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">{formatCurrency(invoice.total)}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-4 text-lg font-semibold">تسيير المخزون</h3>
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">متاح</span>
                <span className="font-bold">{financeSummary.inventoryTotal}</span>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">قليل</span>
                <span className="font-bold text-amber-500">{financeSummary.lowStock}</span>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">منتهي</span>
                <span className="font-bold text-red-500">{financeSummary.outOfStock}</span>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">محجوز</span>
                <span className="font-bold text-blue-500">{financeSummary.reservedStock}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-500/10 p-3 text-amber-500"><FaExclamationTriangle /></div>
          <div>
            <h3 className="text-lg font-semibold">حساب الزكاة</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              تم احتساب قيمة زكاة تقديرية بناءً على الرصيد المتاح في المحفظة وقيمة المخزون الحالية باستخدام نسبة 2.5%.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
                <p className="text-sm text-[var(--text-secondary)]">الرصيد المتاح</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(financeSummary.cashBalance)}</p>
              </div>
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
                <p className="text-sm text-[var(--text-secondary)]">تقدير قيمة المخزون</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(financeSummary.inventoryValueEstimate)}</p>
              </div>
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
                <p className="text-sm text-[var(--text-secondary)]">مبلغ الزكاة</p>
                <p className="mt-1 text-xl font-bold text-emerald-500">{formatCurrency(financeSummary.zakatAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceInventoryZakat;
