import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const statusLabels = {
  open: { label: 'مفتوح', className: 'bg-amber-500/20 text-amber-500' },
  in_progress: { label: 'قيد المعالجة', className: 'bg-blue-500/20 text-blue-500' },
  resolved: { label: 'تم الحل', className: 'bg-emerald-500/20 text-emerald-500' },
  closed: { label: 'مغلق', className: 'bg-gray-500/20 text-gray-500' },
};

const DisputeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [id]);

  const fetchDispute = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/disputes/${id}`);
      setDispute(res.data.dispute);
    } catch (error) {
      toast.error('فشل جلب بيانات النزاع');
      navigate('/admin/disputes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!dispute) return;
    setUpdating(true);
    try {
      await api.put(`/admin/disputes/${id}`, { status: newStatus });
      toast.success('تم تحديث حالة النزاع بنجاح');
      fetchDispute();
    } catch (error) {
      toast.error('فشل تحديث حالة النزاع');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (!dispute) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/disputes')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm"
          >
            <FaArrowLeft /> العودة إلى النزاعات
          </button>
          <h2 className="text-2xl font-bold mt-4">تفاصيل النزاع</h2>
          <p className="text-sm text-[var(--text-secondary)]">عرض تفاصيل النزاع وإدارة حالته.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
            <button
              onClick={() => updateStatus('resolved')}
              disabled={updating}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm"
            >
              <FaCheck /> تم الحل
            </button>
          )}
          {dispute.status !== 'closed' && (
            <button
              onClick={() => updateStatus('closed')}
              disabled={updating}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm"
            >
              <FaTimes /> إغلاق
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FaExclamationCircle />
            </div>
            <div>
              <h3 className="text-lg font-semibold">عنوان النزاع</h3>
              <p className="text-sm text-[var(--text-secondary)]">{dispute.title}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-secondary)]">الحالة</h4>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusLabels[dispute.status]?.className || 'bg-gray-500/20 text-gray-500'}`}>
                {statusLabels[dispute.status]?.label || dispute.status}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-secondary)]">الأولوية</h4>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {dispute.priority}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-secondary)]">الوصف</h4>
              <p className="text-sm leading-6">{dispute.description}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--bg-input)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">رقم الطلب</p>
              <p className="mt-2 font-semibold">{dispute.orderId?.orderNumber || '-'}</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-input)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">المبلغ</p>
              <p className="mt-2 font-semibold">{dispute.orderId?.total ? `${dispute.orderId.total} د.ج` : '-'}</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-input)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">المستخدم</p>
              <p className="mt-2 font-semibold">{dispute.userId?.name || '-'}</p>
              <p className="text-xs text-[var(--text-secondary)]">{dispute.userId?.email || ''}</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-input)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">البائع</p>
              <p className="mt-2 font-semibold">{dispute.sellerId?.name || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">سجل الرسائل</h3>
            <p className="text-sm text-[var(--text-secondary)]">عرض المحادثات المرسلة ضمن النزاع.</p>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {dispute.messages.length === 0 ? (
              <div className="rounded-2xl bg-[var(--bg-input)] p-4 text-sm text-[var(--text-secondary)]">
                لا توجد رسائل حتى الآن.
              </div>
            ) : (
              dispute.messages.map((message) => (
                <div key={message._id || message.createdAt} className="rounded-2xl bg-[var(--bg-input)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{message.senderName || 'غير معروف'}</p>
                    <span className="text-xs text-[var(--text-secondary)]">{new Date(message.createdAt).toLocaleString('ar-DZ')}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{message.message}</p>
                  {message.attachments?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <a key={index} href={attachment} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                          عرض المرفق {index + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetails;
