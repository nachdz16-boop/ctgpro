import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaCheck, FaTimes, FaSyncAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const statusLabels = {
  open: { label: 'مفتوح', color: 'bg-amber-500/20 text-amber-500' },
  in_progress: { label: 'قيد المعالجة', color: 'bg-blue-500/20 text-blue-500' },
  resolved: { label: 'تم الحل', color: 'bg-emerald-500/20 text-emerald-500' },
  closed: { label: 'مغلق', color: 'bg-gray-500/20 text-gray-500' },
};

const priorityLabels = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'مرتفع',
  urgent: 'عاجل',
};

const DisputesManagement = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data.disputes || []);
    } catch (error) {
      toast.error('حدث خطأ في جلب النزاعات');
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const term = searchTerm.toLowerCase();
    return (
      dispute.title?.toLowerCase().includes(term) ||
      dispute.description?.toLowerCase().includes(term) ||
      dispute.orderId?.orderNumber?.toLowerCase().includes(term) ||
      dispute.userId?.name?.toLowerCase().includes(term) ||
      dispute.sellerId?.name?.toLowerCase().includes(term)
    );
  });

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/disputes/${id}`, { status });
      toast.success('تم تحديث حالة النزاع');
      fetchDisputes();
    } catch (error) {
      toast.error('فشل تحديث حالة النزاع');
    }
  };

  const viewDispute = (id) => {
    navigate(`/admin/disputes/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة النزاعات</h2>
          <p className="text-sm text-[var(--text-secondary)]">عرض وإدارة النزاعات المفتوحة والمغلقة</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/admin/finance')}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaFileInvoiceDollar /> إدارة الفواتير والمخزون
          </button>
          <button
            onClick={fetchDisputes}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaSyncAlt /> تحديث
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="relative max-w-md">
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="ابحث عن نزاع أو رقم طلب أو مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full pr-9 text-sm"
          />
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">العنوان</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الطلب</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">المستخدم</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">البائع</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الأولوية</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDisputes.map((dispute) => (
                <tr key={dispute._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                  <td className="py-3 px-4 font-medium text-right">{dispute.title}</td>
                  <td className="py-3 px-4 text-right">{dispute.orderId?.orderNumber || '—'}</td>
                  <td className="py-3 px-4 text-right">{dispute.userId?.name || '—'}</td>
                  <td className="py-3 px-4 text-right">{dispute.sellerId?.name || '—'}</td>
                  <td className="py-3 px-4 text-right"><span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">{priorityLabels[dispute.priority] || dispute.priority}</span></td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusLabels[dispute.status]?.color || 'bg-gray-500/20 text-gray-500'}`}>
                      {statusLabels[dispute.status]?.label || dispute.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 inline-flex">
                    <button
                      onClick={() => viewDispute(dispute._id)}
                      className="px-3 py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs"
                    >
                      <FaEye /> عرض
                    </button>
                    {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                      <button
                        onClick={() => handleStatusUpdate(dispute._id, 'resolved')}
                        className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs"
                      >
                        <FaCheck /> حل
                      </button>
                    )}
                    {dispute.status !== 'closed' && (
                      <button
                        onClick={() => handleStatusUpdate(dispute._id, 'closed')}
                        className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs"
                      >
                        <FaTimes /> إغلاق
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisputesManagement;
