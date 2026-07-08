import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaUserCheck, FaUserTimes,
  FaFilter, FaDownload, FaEye, FaUserCog, FaBan, FaCheck, FaTimes,
  FaPrint
} from 'react-icons/fa';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { getSocket } from '../../../services/socket';

const UsersManagement = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('حدث خطأ في جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && user.isActive) ||
                          (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`✅ تم ${currentStatus ? 'تعطيل' : 'تفعيل'} المستخدم بنجاح`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const exportUsers = () => {
    const csvHeader = ['الاسم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'تاريخ التسجيل'];
    const csvRows = filteredUsers.map((user) => [
      `"${user.name || ''}"`,
      `"${user.email || ''}"`,
      `"${user.role === 'admin' ? 'مدير' : user.role === 'seller' ? 'بائع' : 'مستخدم'}"`,
      `"${user.isActive ? 'نشط' : 'غير نشط'}"`,
      `"${new Date(user.createdAt).toLocaleDateString('ar-DZ')}"`,
    ]);
    const csvContent = [csvHeader.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-export-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل ملف المستخدمين بنجاح');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        name: newName,
        email: newEmail,
        phone: newPhone,
        password: newPassword,
        role: newRole,
      });
      toast.success('✅ تم إنشاء المستخدم بنجاح');
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewRole('user');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const refreshUsers = () => fetchUsers();
    const handleSocketConnect = () => {
      fetchUsers();
      toast.success('🔄 تم استعادة الاتصال بنظام المستخدمين');
    };
    const handleSocketReconnect = () => {
      fetchUsers();
      toast.success('🔄 تم إعادة الاتصال بنظام المستخدمين');
    };

    socket.on('user_created', refreshUsers);
    socket.on('user_updated', refreshUsers);
    socket.on('connect', handleSocketConnect);
    socket.on('reconnect', handleSocketReconnect);

    return () => {
      socket.off('user_created', refreshUsers);
      socket.off('user_updated', refreshUsers);
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect', handleSocketReconnect);
    };
  }, []);

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
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-sm text-[var(--text-secondary)]">إدارة جميع المستخدمين المسجلين في المنصة</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
          >
            <FaPlus /> إضافة مستخدم
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl btn-outline text-sm flex items-center gap-2"
          >
            <FaPrint /> طباعة
          </button>
          <button
            onClick={() => exportUsers()}
            className="px-4 py-2 rounded-xl btn-outline text-sm flex items-center gap-2"
          >
            <FaDownload /> تصدير
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="بحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pr-9 text-sm"
              />
            </div>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="form-input w-32 text-sm"
          >
            <option value="all">جميع الأدوار</option>
            <option value="user">مستخدم</option>
            <option value="seller">بائع</option>
            <option value="admin">مدير</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input w-32 text-sm"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>

          <button className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2">
            <FaFilter /> فلتر
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">المستخدم</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">البريد الإلكتروني</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الدور</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">تاريخ التسجيل</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {user.name?.[0] || 'U'}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-emerald-500/20 text-emerald-500' :
                      user.role === 'seller' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.role === 'admin' ? 'مدير' : user.role === 'seller' ? 'بائع' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">
                    {new Date(user.createdAt).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-blue-500">
                        <FaEye className="text-xs" />
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-primary">
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center ${
                          user.isActive ? 'text-red-500' : 'text-emerald-500'
                        }`}
                      >
                        {user.isActive ? <FaUserTimes className="text-xs" /> : <FaUserCheck className="text-xs" />}
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <FaSearch className="text-3xl mx-auto mb-2 opacity-30" />
            <p>لا توجد مستخدمين مطابقين للبحث</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 left-5 p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
            >
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold mb-4">إضافة مستخدم جديد</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">الاسم</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">الهاتف</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">الدور</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="form-input"
                  >
                    <option value="user">مستخدم</option>
                    <option value="seller">بائع</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">كلمة المرور</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl btn-outline text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;