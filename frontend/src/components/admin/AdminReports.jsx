// src/components/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import AdminMetricCard from './common/AdminMetricCard';
import { 
  FaChartLine, FaChartBar, FaChartPie, FaDownload,
  FaCalendar, FaWallet, FaUsers, FaBox, FaShoppingCart,
  FaMoneyBillWave, FaArrowUp, FaArrowDown,
  FaFileExcel, FaFilePdf, FaPrint, FaSync,
  FaFilter, FaSearch, FaTimes, FaClock,
  FaUserCheck, FaUserPlus, FaPercent
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminReports = () => {
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [chartView, setChartView] = useState('bar');

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ reportType, dateRange });
      if (dateRange === 'custom') {
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
      }

      const res = await api.get(`/admin/reports?${params.toString()}`);
      setReportData(res.data?.data || null);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('حدث خطأ في جلب بيانات التقارير');
    } finally {
      setLoading(false);
    }
  };

  const escapeCsvValue = (value) => {
    const stringValue = value === null || value === undefined ? '' : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const downloadTextFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const buildOverviewCsv = () => {
    const overview = reportData?.overview || {};
    const rows = [
      ['البند', 'القيمة'],
      ['الإيرادات', overview.revenue || 0],
      ['الطلبات', overview.orders || 0],
      ['المستخدمين', overview.users || 0],
      ['المنتجات', overview.products || 0],
      ['الإيرادات اليومية', overview.dailyData?.reduce((sum, item) => sum + Number(item.revenue || 0), 0) || 0],
    ];

    if (overview.topProducts?.length) {
      rows.push([]);
      rows.push(['أفضل المنتجات', 'المبيعات', 'الإيرادات']);
      overview.topProducts.forEach((product) => {
        rows.push([product.name, product.sales || 0, product.revenue || 0]);
      });
    }

    if (overview.topCategories?.length) {
      rows.push([]);
      rows.push(['أفضل التصنيفات', 'الإيرادات']);
      overview.topCategories.forEach((category) => {
        rows.push([category.name, category.revenue || 0]);
      });
    }

    return rows
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');
  };

  const buildPrintableReportHtml = () => {
    const overview = reportData?.overview || {};
    const reportTitleMap = {
      overview: 'نظرة عامة',
      sales: 'المبيعات',
      users: 'المستخدمين',
      products: 'المنتجات',
    };

    const metricRows = [
      ['الإيرادات', formatCurrency(overview.revenue || 0)],
      ['الطلبات', overview.orders || 0],
      ['المستخدمين', overview.users || 0],
      ['المنتجات', overview.products || 0],
      ['الإيرادات اليومية', formatCurrency(overview.dailyData?.reduce((sum, item) => sum + Number(item.revenue || 0), 0) || 0)],
    ]
      .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
      .join('');

    const topProductsRows = (overview.topProducts || [])
      .map((product, index) => `<tr><td>${index + 1}</td><td>${product.name}</td><td>${product.sales || 0}</td><td>${formatCurrency(product.revenue || 0)}</td></tr>`)
      .join('');

    const topCategoriesRows = (overview.topCategories || [])
      .map((category, index) => `<tr><td>${index + 1}</td><td>${category.name}</td><td>${formatCurrency(category.revenue || 0)}</td></tr>`)
      .join('');

    return `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>تقرير ${reportTitleMap[reportType] || 'التقرير'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
            h1, h2 { margin: 0 0 12px; }
            .meta { color: #6b7280; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: right; }
            th { background: #f3f4f6; }
            .section { margin-bottom: 28px; }
          </style>
        </head>
        <body>
          <h1>تقرير ${reportTitleMap[reportType] || 'التقرير'}</h1>
          <div class="meta">الفترة: ${dateRange}${dateRange === 'custom' ? ` من ${startDate || '-'} إلى ${endDate || '-'}` : ''}</div>
          <div class="section">
            <h2>الملخص</h2>
            <table>
              <thead><tr><th>البند</th><th>القيمة</th></tr></thead>
              <tbody>${metricRows}</tbody>
            </table>
          </div>
          <div class="section">
            <h2>أفضل المنتجات</h2>
            <table>
              <thead><tr><th>#</th><th>المنتج</th><th>المبيعات</th><th>الإيرادات</th></tr></thead>
              <tbody>${topProductsRows || '<tr><td colspan="4">لا توجد بيانات</td></tr>'}</tbody>
            </table>
          </div>
          <div class="section">
            <h2>أفضل التصنيفات</h2>
            <table>
              <thead><tr><th>#</th><th>التصنيف</th><th>الإيرادات</th></tr></thead>
              <tbody>${topCategoriesRows || '<tr><td colspan="3">لا توجد بيانات</td></tr>'}</tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      if (format === 'excel') {
        const csv = buildOverviewCsv();
        const fileName = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
        downloadTextFile(csv, fileName, 'text/csv;charset=utf-8;');
        toast.success('تم تصدير التقرير بصيغة Excel/CSV بنجاح');
      } else if (format === 'pdf') {
        const printWindow = window.open('', '_blank', 'width=1024,height=768');
        if (!printWindow) {
          toast.error('تعذر فتح نافذة الطباعة');
          return;
        }
        printWindow.document.open();
        printWindow.document.write(buildPrintableReportHtml());
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success('تم تجهيز التقرير للطباعة كملف PDF');
      } else if (format === 'print') {
        const printWindow = window.open('', '_blank', 'width=1024,height=768');
        if (!printWindow) {
          toast.error('تعذر فتح نافذة الطباعة');
          return;
        }
        printWindow.document.open();
        printWindow.document.write(buildPrintableReportHtml());
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success('تم إرسال التقرير للطباعة');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('حدث خطأ في تصدير التقرير');
    } finally {
      setExporting(false);
    }
  };

  const applyFilters = () => {
    if (dateRange === 'custom' && (!startDate || !endDate)) {
      toast.error('الرجاء تحديد تاريخ البداية والنهاية');
      return;
    }
    fetchReportData();
    toast.success('تم تطبيق الفلاتر بنجاح');
  };

  const resetFilters = () => {
    setDateRange('this_month');
    setStartDate('');
    setEndDate('');
    setReportType('overview');
    toast.success('تم إعادة ضبط الفلاتر');
    fetchReportData();
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaChartLine className="text-primary" />
            التقارير والإحصائيات
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">عرض وتحليل أداء المتجر والإيرادات</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReportData}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button
            onClick={() => handleExport('print')}
            className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors text-sm flex items-center gap-2"
          >
            <FaPrint /> طباعة
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <FaFileExcel /> {exporting ? 'جاري التصدير...' : 'Excel'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <FaFilePdf /> {exporting ? 'جاري التصدير...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
          >
            <option value="overview">نظرة عامة</option>
            <option value="sales">المبيعات</option>
            <option value="users">المستخدمين</option>
            <option value="products">المنتجات</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
          >
            <option value="today">اليوم</option>
            <option value="yesterday">أمس</option>
            <option value="this_week">هذا الأسبوع</option>
            <option value="this_month">هذا الشهر</option>
            <option value="this_year">هذه السنة</option>
            <option value="custom">مخصص</option>
          </select>

          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
              />
              <span className="text-[var(--text-secondary)] text-sm">إلى</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-primary"
              />
            </>
          )}

          <button
            onClick={applyFilters}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm flex items-center gap-2"
          >
            <FaCalendar /> تطبيق
          </button>

          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaTimes /> إعادة ضبط
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminMetricCard
          label="الإيرادات"
          value={formatCurrency(reportData?.overview?.revenue || 0)}
          icon={<FaMoneyBillWave className="text-xl text-primary" />}
          valueClassName="text-primary"
          delta={reportData?.overview?.revenueChange > 0 ? <><FaArrowUp /> {Math.abs(reportData?.overview?.revenueChange || 0)}% عن الفترة السابقة</> : <><FaArrowDown /> {Math.abs(reportData?.overview?.revenueChange || 0)}% عن الفترة السابقة</>}
          deltaClassName={reportData?.overview?.revenueChange > 0 ? 'text-emerald-500' : 'text-red-500'}
        />

        <AdminMetricCard
          label="الطلبات"
          value={reportData?.overview?.orders || 0}
          icon={<FaShoppingCart className="text-xl text-amber-500" />}
          delta={reportData?.overview?.ordersChange > 0 ? <><FaArrowUp /> {Math.abs(reportData?.overview?.ordersChange || 0)}% عن الفترة السابقة</> : <><FaArrowDown /> {Math.abs(reportData?.overview?.ordersChange || 0)}% عن الفترة السابقة</>}
          deltaClassName={reportData?.overview?.ordersChange > 0 ? 'text-emerald-500' : 'text-red-500'}
        />

        <AdminMetricCard
          label="المستخدمين"
          value={reportData?.overview?.users || 0}
          icon={<FaUsers className="text-xl text-blue-500" />}
          delta={reportData?.overview?.usersChange > 0 ? <><FaArrowUp /> {Math.abs(reportData?.overview?.usersChange || 0)}% عن الفترة السابقة</> : <><FaArrowDown /> {Math.abs(reportData?.overview?.usersChange || 0)}% عن الفترة السابقة</>}
          deltaClassName={reportData?.overview?.usersChange > 0 ? 'text-emerald-500' : 'text-red-500'}
        />

        <AdminMetricCard
          label="المنتجات"
          value={reportData?.overview?.products || 0}
          icon={<FaBox className="text-xl text-emerald-500" />}
          delta={reportData?.overview?.productsChange > 0 ? <><FaArrowUp /> {Math.abs(reportData?.overview?.productsChange || 0)}% عن الفترة السابقة</> : <><FaArrowDown /> {Math.abs(reportData?.overview?.productsChange || 0)}% عن الفترة السابقة</>}
          deltaClassName={reportData?.overview?.productsChange > 0 ? 'text-emerald-500' : 'text-red-500'}
        />
      </div>

      {/* سلوك الطلبات */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <FaShoppingCart className="text-primary" />
            تحليل سلوك الطلبات
          </h3>
          <span className="text-xs text-[var(--text-secondary)]">
            {reportData?.overview?.orderStatusDistribution?.reduce((sum, item) => sum + item.count, 0) || 0} طلب ضمن النطاق
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {(reportData?.overview?.orderStatusDistribution || []).map((item) => (
            <div key={item.status} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span>{item.label}</span>
                <span className="font-bold text-primary">{item.count}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[var(--bg-input)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-[var(--text-secondary)] flex items-center justify-between">
                <span>{item.percentage}%</span>
                {item.status === 'completed' && <span className="text-emerald-500">أعلى مؤشر نجاح</span>}
                {item.status === 'pending' && <span className="text-amber-500">يحتاج متابعة</span>}
              </div>
            </div>
          ))}
        </div>

        {(reportData?.overview?.orderStatusDistribution || []).length === 0 && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 p-4 text-sm text-[var(--text-secondary)]">
            لا توجد طلبات كافية لتحليل السلوك ضمن هذا النطاق.
          </div>
        )}
      </div>

      {/* مخطط الإيرادات اليومية */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <FaChartBar className="text-primary" />
            الإيرادات اليومية
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartView('bar')}
              className={`px-2 py-1 rounded-lg text-sm ${chartView === 'bar' ? 'bg-primary/10 text-primary' : 'text-[var(--text-secondary)]'}`}
            >
              <FaChartBar />
            </button>
            <button
              onClick={() => setChartView('line')}
              className={`px-2 py-1 rounded-lg text-sm ${chartView === 'line' ? 'bg-primary/10 text-primary' : 'text-[var(--text-secondary)]'}`}
            >
              <FaChartLine />
            </button>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {reportData?.overview?.dailyData?.map((day, index) => {
            const maxRevenue = Math.max(...reportData.overview.dailyData.map(d => d.revenue));
            const height = (day.revenue / maxRevenue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  ${day.revenue}
                </div>
                <div className="w-full relative">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/40 rounded-t-lg transition-all hover:scale-y-105 origin-bottom"
                    style={{ height: `${Math.max(height, 5)}%`, minHeight: '10px' }}
                  />
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{day.date.slice(5)}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{day.orders} طلب</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* أفضل المنتجات مبيعاً */}
      <div className="card">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FaChartPie className="text-primary" />
          أفضل المنتجات مبيعاً
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-right py-2 px-3 font-medium text-[var(--text-muted)]">#</th>
                <th className="text-right py-2 px-3 font-medium text-[var(--text-muted)]">المنتج</th>
                <th className="text-right py-2 px-3 font-medium text-[var(--text-muted)]">المبيعات</th>
                <th className="text-right py-2 px-3 font-medium text-[var(--text-muted)]">الإيرادات</th>
                <th className="text-right py-2 px-3 font-medium text-[var(--text-muted)]">النسبة</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.overview?.topProducts?.map((product, index) => {
                const totalRevenue = reportData?.overview?.topProducts?.reduce((sum, p) => sum + p.revenue, 0) || 1;
                const percentage = (product.revenue / totalRevenue) * 100;
                return (
                  <tr key={index} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-input)] transition-colors">
                    <td className="py-2 px-3 font-medium">{index + 1}</td>
                    <td className="py-2 px-3">{product.name}</td>
                    <td className="py-2 px-3">{product.sales}</td>
                    <td className="py-2 px-3 font-bold text-primary">{formatCurrency(product.revenue)}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* تصنيفات المنتجات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FaPercent className="text-primary" />
            توزيع الإيرادات حسب التصنيف
          </h3>
          <div className="space-y-3">
            {reportData?.overview?.topCategories?.map((category, index) => {
              const total = reportData?.overview?.topCategories?.reduce((sum, c) => sum + c.revenue, 0) || 1;
              const percentage = (category.revenue / total) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="font-bold text-primary">{formatCurrency(category.revenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        background: `hsl(${index * 45 + 200}, 70%, 50%)`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FaClock className="text-primary" />
            الاتجاه الشهري
          </h3>
          <div className="space-y-3">
            {reportData?.overview?.monthlyTrend?.map((month, index) => {
              const max = Math.max(...reportData?.overview?.monthlyTrend?.map(m => m.revenue) || [1]);
              const height = (month.revenue / max) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{month.month}</span>
                    <span className="font-bold text-primary">{formatCurrency(month.revenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                      style={{ width: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;