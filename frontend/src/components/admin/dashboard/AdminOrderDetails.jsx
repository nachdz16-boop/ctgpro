import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowRight, FaBoxOpen, FaCreditCard, FaGamepad, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/orders/${id}`);
        setOrder(res.data.order || null);
      } catch (error) {
        console.error('Error fetching admin order details:', error);
        toast.error(error.response?.data?.message || 'تعذر تحميل تفاصيل الطلب');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'مكتمل',
      processing: 'قيد المعالجة',
      pending: 'معلق',
      cancelled: 'ملغي',
      shipped: 'تم الشحن',
      failed: 'فشل',
      refunded: 'مسترد',
    };
    return labels[status] || status || 'غير معروف';
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      paid: 'مدفوع',
      pending: 'بانتظار الدفع',
      failed: 'فشل الدفع',
      refunded: 'تم الاسترداد',
    };
    return labels[status] || status || 'غير معروف';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mb-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <FaArrowRight /> العودة إلى الطلبات
          </button>
          <h2 className="text-2xl font-bold">تفاصيل الطلب #{order.orderNumber}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleString('ar-DZ')}</p>
        </div>
        <div className="text-left">
          <div className="text-2xl font-black text-primary">{formatCurrency(order.total || 0)}</div>
          <div className="text-sm text-[var(--text-secondary)]">{getStatusLabel(order.status)} / {getPaymentStatusLabel(order.paymentStatus)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FaBoxOpen className="text-primary" /> عناصر الطلب</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={`${item.productId || index}-${index}`} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{item.name?.ar || item.name?.en || 'منتج'}</div>
                    <div className="text-sm text-[var(--text-secondary)]">الكمية: {item.qty}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-primary">{formatCurrency(item.total || item.price * item.qty || 0)}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{formatCurrency(item.price || 0)} للوحدة</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {order.rechargeMeta && (
            <section className="bg-[var(--bg-card)] border border-primary/20 rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-primary"><FaGamepad /> بيانات الشحن الرقمي</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">الخدمة</div>
                  <div className="font-semibold">{order.rechargeMeta.service || '-'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">نوع الخدمة</div>
                  <div className="font-semibold">{order.rechargeMeta.serviceType || '-'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">Player ID</div>
                  <div className="font-semibold">{order.rechargeMeta.playerId || '-'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">Server ID</div>
                  <div className="font-semibold">{order.rechargeMeta.serverId || '-'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">البريد الإلكتروني</div>
                  <div className="font-semibold">{order.rechargeMeta.email || order.email || '-'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">الهاتف</div>
                  <div className="font-semibold">{order.rechargeMeta.phone || order.phone || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[var(--text-secondary)] mb-1">وقت التحقق</div>
                  <div className="font-semibold">{order.rechargeMeta.validatedAt ? new Date(order.rechargeMeta.validatedAt).toLocaleString('ar-DZ') : '-'}</div>
                </div>
                {order.rechargeMeta.note ? (
                  <div className="md:col-span-2">
                    <div className="text-[var(--text-secondary)] mb-1">ملاحظات الشحن</div>
                    <div className="font-semibold">{order.rechargeMeta.note}</div>
                  </div>
                ) : null}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FaUser className="text-primary" /> بيانات العميل</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[var(--text-secondary)] mb-1">الاسم</div>
                <div className="font-semibold">{order.userId?.name || 'غير متوفر'}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">البريد الإلكتروني</div>
                <div className="font-semibold">{order.email || order.userId?.email || 'غير متوفر'}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">الهاتف</div>
                <div className="font-semibold">{order.phone || order.userId?.phone || 'غير متوفر'}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">العنوان</div>
                <div className="font-semibold">
                  {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.country]
                    .filter(Boolean)
                    .join(' - ') || 'لا يوجد عنوان مسجل'}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FaCreditCard className="text-primary" /> الدفع والحالة</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[var(--text-secondary)] mb-1">طريقة الدفع</div>
                <div className="font-semibold">{order.paymentMethod || '-'}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">بوابة الدفع</div>
                <div className="font-semibold">{order.paymentGateway || '-'}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">حالة الدفع</div>
                <div className="font-semibold">{getPaymentStatusLabel(order.paymentStatus)}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">ملاحظات الطلب</div>
                <div className="font-semibold">{order.notes || 'لا توجد ملاحظات'}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
