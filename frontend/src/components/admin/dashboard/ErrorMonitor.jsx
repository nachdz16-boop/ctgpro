import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ErrorMonitor = () => {
  const [errors, setErrors] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchErrors = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/errors', { params: { page, limit: meta.limit } });
      if (res.data.success) {
        setErrors(res.data.errors);
        setMeta(res.data.meta || { page, limit: meta.limit, total: 0 });
      }
    } catch (error) {
      console.error(error);
      toast.error('فشل جلب سجلات الأخطاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchErrors(1); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">مراقب الأخطاء</h2>
        <div className="text-sm text-[var(--text-secondary)]">إجمالي: {meta.total}</div>
      </div>

      {loading ? (
        <div className="loader-spinner" />
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {errors.length === 0 && <div className="text-sm text-[var(--text-secondary)]">لا توجد سجلات</div>}
            {errors.map((e) => (
              <div key={e._id} className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{e.message}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{e.route} — {e.method} — {new Date(e.createdAt).toLocaleString()}</div>
                    <pre className="text-[11px] text-[var(--text-secondary)] mt-2 whitespace-pre-wrap max-h-40 overflow-y-auto">{e.stack}</pre>
                  </div>
                  <div className="text-xs text-right min-w-[110px]">
                    <div>حالة: {e.status}</div>
                    <div>IP: {e.ipAddress}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ErrorMonitor;
