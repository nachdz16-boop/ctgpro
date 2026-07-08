import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaShoppingCart,
  FaClock,
  FaBalanceScale,
  FaChartLine,
  FaPrint,
} from 'react-icons/fa';

const OrdersManagement = () => {
  const { t, formatCurrency } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      toast.error('حدث خطأ في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const lowerSearch = searchTerm.toLowerCase();
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const searchMatch = [
      order.orderNumber,
      order.userId?.name,
      order.userId?.email,
      order.sellerId?.name,
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(lowerSearch));
    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'مكتمل', className: 'bg-emerald-500/20 text-emerald-500' },
      processing: { label: 'قيد المعالجة', className: 'bg-amber-500/20 text-amber-500' },
      pending: { label: 'معلق', className: 'bg-blue-500/20 text-blue-500' },
      cancelled: { label: 'ملغي', className: 'bg-red-500/20 text-red-500' },
      shipped: { label: 'تم الشحن', className: 'bg-primary/20 text-primary' },
    };
    return statusMap[status] || { label: status || 'غير معروف', className: 'bg-gray-500/20 text-gray-500' };
  };

  const viewOrder = (id) => {
    navigate(`/admin/orders/${id}`);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
          <p className="text-sm text-[var(--text-secondary)]">عرض الطلبات الحديثة وحالتها في لوحة التحكم</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => navigate('/admin/disputes')}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaBalanceScale /> إدارة النزاعات
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaChartLine /> التقارير والإيرادات
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaClock /> تحديث
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaPrint /> طباعة
          </button>
          <button
            onClick={() => {
              const csv = [
                ['رقم الطلب', 'العميل', 'البائع', 'المجموع', 'الحالة', 'التاريخ'],
                ...filteredOrders.map((order) => [
                  order.orderNumber,
                  order.userId?.name || 'مستخدم',
                  order.sellerId?.name || 'بدون بائع',
                  order.total,
                  order.status,
                  new Date(order.createdAt).toLocaleString('ar-DZ'),
                ]),
              ]
                .map((row) => row.join(','))
                .join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `orders-${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast.success('تم تصدير الطلبات بنجاح');
            }}
            className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
          >
            <FaDownload /> تصدير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="text-xs text-[var(--text-secondary)]">إجمالي الطلبات</div>
          <div className="text-3xl font-bold mt-2">{orders.length}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="text-xs text-[var(--text-secondary)]">قيد المعالجة</div>
          <div className="text-3xl font-bold mt-2">{orders.filter((order) => order.status === 'processing').length}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="text-xs text-[var(--text-secondary)]">مكتملة</div>
          <div className="text-3xl font-bold mt-2">{orders.filter((order) => order.status === 'completed').length}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="text-xs text-[var(--text-secondary)]">ملغاة</div>
          <div className="text-3xl font-bold mt-2">{orders.filter((order) => order.status === 'cancelled').length}</div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex-1 min-w-[220px] relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="بحث عن طلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full pr-9 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input w-40 text-sm"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="processing">قيد المعالجة</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
            <option value="shipped">تم الشحن</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)]">
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">البائع</th>
                <th className="py-3 px-4">المجموع</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status = getStatusBadge(order.status);
                return (
                  <tr key={order._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-input)] transition-colors">
                    <td className="py-3 px-4">{order.orderNumber || `#${order._id?.slice(-6)}`}</td>
                    <td className="py-3 px-4">{order.userId?.name || 'مستخدم'}</td>
                    <td className="py-3 px-4">{order.sellerId?.name || 'بدون بائع'}</td>
                    <td className="py-3 px-4">{formatCurrency(order.total || 0)}</td>
                    <td className={`py-3 px-4 ${status.className}`}>{status.label}</td>
                    <td className="py-3 px-4">{new Date(order.createdAt).toLocaleString('ar-DZ')}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => viewOrder(order._id)}
                        className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs hover:bg-primary/20 transition"
                      >
                        <FaEye className="inline ml-1" /> عرض
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-[var(--text-secondary)]">لا توجد طلبات مطابقة للبحث أو الفلتر</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
