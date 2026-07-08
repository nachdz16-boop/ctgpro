// src/components/admin/SellersManagement.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaStore, FaUserTie, FaCheck, FaTimes, FaEye, FaEdit,
  FaTrash, FaSearch, FaFilter, FaPlus, FaDownload,
  FaStar, FaEnvelope, FaPhone, FaUserCheck, FaUserTimes,
  FaShieldAlt, FaAward, FaChartLine, FaMapMarker,
  FaClock, FaCalendar, FaWallet, FaBox, FaPrint
} from 'react-icons/fa';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const SellersManagement = () => {
  const { t, formatCurrency } = useLanguage();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0
  });
  const [newSeller, setNewSeller] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
    address: '',
    bio: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/sellers');
      const fetchedSellers = response.data?.sellers || [];
      setSellers(fetchedSellers);

      const stats = {
        total: fetchedSellers.length,
        active: fetchedSellers.filter((seller) => seller.status === 'active').length,
        pending: fetchedSellers.filter((seller) => seller.status === 'pending').length,
        suspended: fetchedSellers.filter((seller) => seller.status === 'suspended').length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('حدث خطأ في جلب البائعين');
    } finally {
      setLoading(false);
    }
  };

  const updateSellerStatus = async (sellerId, status) => {
    try {
      const response = await api.put(`/admin/sellers/${sellerId}/status`, { status });
      const updatedSeller = response.data?.seller;
      setSellers((currentSellers) => currentSellers.map((seller) => (
        seller._id === sellerId ? (updatedSeller || { ...seller, status }) : seller
      )));
      toast.success(`✅ تم تحديث حالة البائع بنجاح`);
    } catch (error) {
      console.error('Error updating seller status:', error);
      toast.error('حدث خطأ في تحديث حالة البائع');
    }
  };

  const deleteSeller = async (sellerId) => {
    try {
      await api.delete(`/admin/sellers/${sellerId}`);
      setSellers((currentSellers) => currentSellers.filter((seller) => seller._id !== sellerId));
      toast.success('✅ تم حذف البائع بنجاح');
      setIsDeleteModalOpen(false);
      setSellerToDelete(null);
    } catch (error) {
      console.error('Error deleting seller:', error);
      toast.error('حدث خطأ في حذف البائع');
    }
  };

  const viewSellerDetails = (seller) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const sendEmailToSeller = async (seller) => {
    try {
      toast.success(`✅ تم إرسال بريد إلكتروني إلى ${seller.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('حدث خطأ في إرسال البريد الإلكتروني');
    }
  };

  const addSeller = async () => {
    if (!newSeller.name || !newSeller.email || !newSeller.storeName) {
      toast.error('الرجاء تعبئة الحقول الأساسية');
      return;
    }

    try {
      const response = await api.post('/admin/sellers', {
        name: newSeller.name,
        email: newSeller.email,
        phone: newSeller.phone,
        storeName: newSeller.storeName,
        address: newSeller.address,
        bio: newSeller.bio,
        status: newSeller.status,
      });
      const createdSeller = response.data?.seller;
      setSellers((prev) => [createdSeller, ...prev]);
      setNewSeller({ name: '', email: '', phone: '', storeName: '', address: '', bio: '', status: 'pending' });
      setIsAddModalOpen(false);
      toast.success('✅ تم إضافة البائع بنجاح');
    } catch (error) {
      console.error('Error adding seller:', error);
      toast.error('حدث خطأ في إضافة البائع');
    }
  };

  const exportSellers = async () => {
    try {
      const filtered = filteredSellers;
      const csv = [
        ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'اسم المتجر', 'الحالة', 'التقييم', 'المبيعات', 'الإيرادات', 'تاريخ التسجيل'],
        ...filtered.map(s => [s.name, s.email, s.phone || '', s.storeName || '', s.status, s.rating || 0, s.totalSales || 0, s.revenue || 0, new Date(s.joinDate).toLocaleDateString('ar-DZ')])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sellers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تصدير البائعين بنجاح');
    } catch (error) {
      console.error('Error exporting sellers:', error);
      toast.error('حدث خطأ في تصدير البائعين');
    }
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          seller.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'نشط', className: 'bg-emerald-500/20 text-emerald-500' },
      pending: { label: 'قيد المراجعة', className: 'bg-amber-500/20 text-amber-500' },
      suspended: { label: 'معلق', className: 'bg-red-500/20 text-red-500' },
      inactive: { label: 'غير نشط', className: 'bg-gray-500/20 text-gray-400' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' };
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
          <h2 className="text-2xl font-bold">إدارة الباعة</h2>
          <p className="text-sm text-[var(--text-secondary)]">إدارة الباعة والمتاجر في المنصة</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
          >
            <FaPlus /> إضافة بائع
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaPrint /> طباعة
          </button>
          <button 
            onClick={exportSellers}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaDownload /> تصدير
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl text-primary mb-1"><FaStore /></div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-[var(--text-secondary)]">إجمالي البائعين</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl text-emerald-500 mb-1"><FaUserCheck /></div>
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-[var(--text-secondary)]">نشط</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl text-amber-500 mb-1"><FaClock /></div>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <div className="text-xs text-[var(--text-secondary)]">قيد المراجعة</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl text-red-500 mb-1"><FaUserTimes /></div>
          <div className="text-2xl font-bold">{stats.suspended}</div>
          <div className="text-xs text-[var(--text-secondary)]">معلق</div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="بحث عن بائع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pr-9 text-sm"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input w-32 text-sm"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="active">نشط</option>
            <option value="suspended">معلق</option>
            <option value="inactive">غير نشط</option>
          </select>

          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              toast.success('تم إعادة ضبط الفلاتر');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaTimes /> إعادة ضبط
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSellers.map((seller) => {
          const status = getStatusBadge(seller.status);
          return (
            <div key={seller._id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xl font-bold text-white">
                    {seller.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold">{seller.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-amber-500" /> {seller.rating || 0}
                      </span>
                      <span>•</span>
                      <span>{seller.totalSales || 0} مبيعات</span>
                    </div>
                    {seller.storeName && (
                      <div className="text-xs text-[var(--text-secondary)]">{seller.storeName}</div>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-xs" />
                  <span>{seller.email}</span>
                </div>
                {seller.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-xs" />
                    <span>{seller.phone}</span>
                  </div>
                )}
                {seller.address && (
                  <div className="flex items-center gap-2">
                    <FaMapMarker className="text-xs" />
                    <span>{seller.address}</span>
                  </div>
                )}
                {seller.bio && (
                  <p className="text-xs mt-2 line-clamp-2">{seller.bio}</p>
                )}
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
                <button 
                  onClick={() => viewSellerDetails(seller)}
                  className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <FaEye className="text-[10px]" /> عرض
                </button>
                
                {seller.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateSellerStatus(seller._id, 'active')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <FaCheck className="text-[10px]" /> قبول
                    </button>
                    <button
                      onClick={() => updateSellerStatus(seller._id, 'inactive')}
                      className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <FaTimes className="text-[10px]" /> رفض
                    </button>
                  </>
                )}
                
                {seller.status === 'active' && (
                  <button
                    onClick={() => updateSellerStatus(seller._id, 'suspended')}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-semibold hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <FaUserTimes className="text-[10px]" /> تعليق
                  </button>
                )}
                
                {seller.status === 'suspended' && (
                  <button
                    onClick={() => updateSellerStatus(seller._id, 'active')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <FaUserCheck className="text-[10px]" /> إعادة تفعيل
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setSellerToDelete(seller);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <FaTrash className="text-[10px]" /> حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSellers.length === 0 && (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <FaStore className="text-3xl mx-auto mb-2 opacity-30" />
          <p>لا توجد بائعين مطابقين للبحث</p>
        </div>
      )}

      {/* Modal عرض تفاصيل البائع */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaUserTie className="text-primary" />
                تفاصيل البائع
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl font-bold text-white">
                  {selectedSeller.name?.[0] || 'S'}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{selectedSeller.name}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedSeller.email}</p>
                  {selectedSeller.storeName && (
                    <p className="text-sm text-primary">{selectedSeller.storeName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-sm text-[var(--text-secondary)]">التقييم</div>
                  <div className="text-xl font-bold text-amber-500">{selectedSeller.rating || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-sm text-[var(--text-secondary)]">المبيعات</div>
                  <div className="text-xl font-bold text-primary">{selectedSeller.totalSales || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center col-span-2">
                  <div className="text-sm text-[var(--text-secondary)]">الإيرادات</div>
                  <div className="text-xl font-bold text-emerald-500">{formatCurrency(selectedSeller.revenue || 0)}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 py-2 border-b border-[var(--border-color)]">
                  <FaPhone className="text-[var(--text-muted)]" />
                  <span>{selectedSeller.phone || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2 py-2 border-b border-[var(--border-color)]">
                  <FaMapMarker className="text-[var(--text-muted)]" />
                  <span>{selectedSeller.address || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2 py-2 border-b border-[var(--border-color)]">
                  <FaCalendar className="text-[var(--text-muted)]" />
                  <span>تاريخ الانضمام: {new Date(selectedSeller.joinDate).toLocaleString('ar-DZ')}</span>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <FaShieldAlt className="text-[var(--text-muted)]" />
                  <span>الحالة: {getStatusBadge(selectedSeller.status).label}</span>
                </div>
              </div>

              {selectedSeller.bio && (
                <div className="p-3 rounded-xl bg-[var(--bg-input)]">
                  <p className="text-sm">{selectedSeller.bio}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => sendEmailToSeller(selectedSeller)}
                  className="flex-1 py-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FaEnvelope /> إرسال بريد
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    toast.info(`فتح نموذج تعديل البائع ${selectedSeller.name}`);
                  }}
                  className="flex-1 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FaEdit /> تعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal إضافة بائع */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaPlus className="text-primary" />
                إضافة بائع جديد
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="space-y-2 text-sm">
                  <span>الاسم الكامل</span>
                  <input
                    value={newSeller.name}
                    onChange={(e) => setNewSeller(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input w-full"
                    placeholder="اسم البائع"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>البريد الإلكتروني</span>
                  <input
                    type="email"
                    value={newSeller.email}
                    onChange={(e) => setNewSeller(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input w-full"
                    placeholder="example@mail.com"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>اسم المتجر</span>
                  <input
                    value={newSeller.storeName}
                    onChange={(e) => setNewSeller(prev => ({ ...prev, storeName: e.target.value }))}
                    className="form-input w-full"
                    placeholder="اسم المتجر"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>رقم الهاتف</span>
                  <input
                    value={newSeller.phone}
                    onChange={(e) => setNewSeller(prev => ({ ...prev, phone: e.target.value }))}
                    className="form-input w-full"
                    placeholder="+213 5 xx xx xx xx"
                  />
                </label>
                <label className="space-y-2 text-sm col-span-1 lg:col-span-2">
                  <span>العنوان</span>
                  <input
                    value={newSeller.address}
                    onChange={(e) => setNewSeller(prev => ({ ...prev, address: e.target.value }))}
                    className="form-input w-full"
                    placeholder="المدينة، المنطقة"
                  />
                </label>
                <label className="space-y-2 text-sm col-span-1 lg:col-span-2">
                  <span>نبذة عن البائع</span>
                  <textarea
                    value={newSeller.bio}
                    onChange={(e) => setNewSeller(prev => ({ ...prev, bio: e.target.value }))}
                    className="form-input w-full min-h-[120px] resize-none"
                    placeholder="وصف قصير عن البائع ومتجره"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/80 transition-colors text-sm font-semibold"
                >
                  إلغاء
                </button>
                <button
                  onClick={addSeller}
                  className="px-4 py-2 rounded-xl btn-primary text-white text-sm font-semibold"
                >
                  حفظ البائع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal تأكيد الحذف */}
      {isDeleteModalOpen && sellerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-3xl">
                  <FaTrash />
                </div>
                <h3 className="text-xl font-bold mt-4">تأكيد الحذف</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  هل أنت متأكد من حذف البائع <span className="font-bold text-primary">{sellerToDelete.name}</span>؟
                  <br />
                  <span className="text-xs text-red-500">هذا الإجراء لا يمكن التراجع عنه.</span>
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => deleteSeller(sellerToDelete._id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  حذف
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersManagement;