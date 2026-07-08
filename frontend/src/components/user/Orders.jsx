import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getSocket } from '../../services/socket';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [disputeTitle, setDisputeTitle] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputePriority, setDisputePriority] = useState('medium');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
    else setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOrderEvent = (payload) => {
      if (payload?.userId !== undefined && !isAuthenticated) return;
      fetchOrders();
      toast.success('📦 تم تحديث حالة الطلبات تلقائياً');
    };

    const handleSocketConnect = () => {
      if (isAuthenticated) {
        fetchOrders();
        toast.success('🔄 تم استعادة الاتصال بالطلبات');
      }
    };

    const handleSocketReconnect = () => {
      if (isAuthenticated) {
        fetchOrders();
        toast.success('🔄 تم إعادة الاتصال بالطلبات');
      }
    };

    socket.on('order_created', handleOrderEvent);
    socket.on('order_updated', handleOrderEvent);
    socket.on('connect', handleSocketConnect);
    socket.on('reconnect', handleSocketReconnect);

    return () => {
      socket.off('order_created', handleOrderEvent);
      socket.off('order_updated', handleOrderEvent);
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect', handleSocketReconnect);
    };
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally { setLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-secondary)]">يرجى تسجيل الدخول لعرض طلباتك</p>
        <Link to="/login" className="mt-4 inline-block px-6 py-2 rounded-xl btn-primary text-white">تسجيل الدخول</Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-12"><div className="loader-spinner"></div></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl text-[var(--text-muted)] mb-3">📦</div>
        <h3 className="text-xl font-bold mb-2">{t('orders.no_orders')}</h3>
        <Link to="/shop" className="mt-4 inline-block px-6 py-2 rounded-xl btn-primary text-white">تسوق الآن</Link>
      </div>
    );
  }

  const handleSubmitDispute = async () => {
    if (!selectedOrder || !disputeTitle || !disputeDescription) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setSubmittingDispute(true);
    try {
      await api.post('/disputes', {
        orderId: selectedOrder._id,
        title: disputeTitle,
        description: disputeDescription,
        priority: disputePriority,
      });
      toast.success('تم فتح النزاع بنجاح');
      setShowDisputeModal(false);
      setSelectedOrder(null);
      setDisputeTitle('');
      setDisputeDescription('');
      setDisputePriority('medium');
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل فتح النزاع');
    } finally {
      setSubmittingDispute(false);
    }
  };

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('orders.title')}</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="card hover:border-primary transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">#{order.orderNumber}</div>
                <div className="text-xs text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                  order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {order.status === 'completed' ? 'مكتمل' : order.status === 'pending' ? 'قيد المعالجة' : 'جاري التجهيز'}
                </span>
                <span className="text-sm font-bold text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1 border-b border-[var(--border-color)] last:border-0">
                  <span>{item.name.ar}</span>
                  <span>{item.qty} × ${item.price} = ${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {order.rechargeMeta && (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm space-y-1">
                <div className="font-semibold text-primary">بيانات الشحن الرقمي</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[var(--text-secondary)]">
                  <span>الخدمة: <span className="text-[var(--text-primary)] font-medium">{order.rechargeMeta.service || '-'}</span></span>
                  <span>Player ID: <span className="text-[var(--text-primary)] font-medium">{order.rechargeMeta.playerId || '-'}</span></span>
                  {order.rechargeMeta.serverId ? (
                    <span>Server ID: <span className="text-[var(--text-primary)] font-medium">{order.rechargeMeta.serverId}</span></span>
                  ) : null}
                  {order.rechargeMeta.validatedAt ? (
                    <span>تم التحقق: <span className="text-[var(--text-primary)] font-medium">{new Date(order.rechargeMeta.validatedAt).toLocaleString('ar-DZ')}</span></span>
                  ) : null}
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setDisputeTitle(`إشكالية في الطلب ${order.orderNumber}`);
                  setShowDisputeModal(true);
                }}
                className="px-4 py-2 rounded-xl border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors text-sm"
              >
                فتح نزاع
              </button>
            </div>
          </div>
        ))}
      </div>
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--bg-primary) 68%, transparent)' }}>
          <div className="w-full max-w-2xl rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">فتح نزاع</h2>
                <p className="text-sm text-[var(--text-secondary)]">أرسل طلب نزاع للطلب {selectedOrder?.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-[var(--text-secondary)] hover:text-primary"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان النزاع</label>
                <input
                  type="text"
                  value={disputeTitle}
                  onChange={(e) => setDisputeTitle(e.target.value)}
                  className="form-input w-full"
                  placeholder="أدخل عنوان النزاع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">تفاصيل النزاع</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="form-input w-full min-h-[140px]"
                  placeholder="صف المشكلة التي تواجهها"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الأولوية</label>
                <select
                  value={disputePriority}
                  onChange={(e) => setDisputePriority(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">مرتفع</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmitDispute}
                  disabled={submittingDispute}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm disabled:opacity-60"
                >
                  {submittingDispute ? 'جارٍ الإرسال...' : 'إرسال النزاع'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;