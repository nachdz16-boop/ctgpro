// src/components/admin/AdminProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaEdit, 
  FaSave, FaTimes, FaCamera, FaKey, FaLock,
  FaCheckCircle, FaExclamationCircle, FaTrash, FaEye,
  FaUpload, FaImage, FaFileAlt, FaHistory, FaClock, FaPrint, FaStickyNote, FaPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [adminNotes, setAdminNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [notePinned, setNotePinned] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      fetchActivityLogs();
      fetchAdminNotes();
    }
  }, [user]);

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/admin/activity-logs');
      const logs = (response.data?.logs || []).map((log) => ({
        id: log._id,
        action: `${log.action} ${log.resource || ''}`.trim(),
        timestamp: log.createdAt,
        ip: log.ipAddress || 'غير متوفر',
        user: log.userId?.name || 'مجهول',
        details: log.details || {},
      }));
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setActivityLogs([]);
    }
  };

  const fetchAdminNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await api.get('/admin/notes');
      const notes = (response.data?.notes || []).map((note) => ({
        id: note._id,
        content: note.content,
        pinned: note.pinned,
        timestamp: note.createdAt,
        author: note.authorId?.name || 'مجهول',
        role: note.authorId?.role || '',
      }));
      setAdminNotes(notes);
    } catch (error) {
      console.error('Error fetching admin notes:', error);
      setAdminNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const addAdminNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      toast.error('اكتب الملاحظة أولاً');
      return;
    }

    setNotesLoading(true);
    try {
      const response = await api.post('/admin/notes', {
        content: noteContent,
        pinned: notePinned,
      });

      const note = response.data?.note;
      if (note) {
        setAdminNotes((current) => [
          {
            id: note._id,
            content: note.content,
            pinned: note.pinned,
            timestamp: note.createdAt,
            author: note.authorId?.name || user?.name || 'مجهول',
            role: note.authorId?.role || user?.role || '',
          },
          ...current,
        ]);
      }

      setNoteContent('');
      setNotePinned(false);
      toast.success('تمت إضافة الملاحظة بنجاح');
    } catch (error) {
      console.error('Error creating admin note:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في إضافة الملاحظة');
    } finally {
      setNotesLoading(false);
    }
  };

  const deleteAdminNote = async (noteId) => {
    if (!window.confirm('هل تريد حذف هذه الملاحظة؟')) return;

    try {
      await api.delete(`/admin/notes/${noteId}`);
      setAdminNotes((current) => current.filter((note) => note.id !== noteId));
      toast.success('تم حذف الملاحظة');
    } catch (error) {
      console.error('Error deleting admin note:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في حذف الملاحظة');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setLoading(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append('avatar', avatarFile);
      const response = await api.post('/admin/profile/avatar', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(response.data.user);
      toast.success('تم تحديث الصورة بنجاح');
      setAvatarFile(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('حدث خطأ في رفع الصورة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/admin/profile', formData);
      updateUser(response.data.user);
      toast.success('تم تحديث البروفايل بنجاح');
      setIsEditing(false);
      
      // رفع الصورة إذا تم اختيارها
      if (avatarFile) {
        await uploadAvatar();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في تحديث البروفايل');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير مطابقة لتأكيدها');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await api.put('/admin/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    if (!window.confirm('تأكيد الحذف: أدخل كلمة "حذف" في المربع التالي.')) return;
    try {
      await api.delete('/admin/profile');
      toast.success('تم حذف الحساب بنجاح');
      // تسجيل الخروج
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('حدث خطأ في حذف الحساب');
    }
  };

  const exportProfileData = async () => {
    try {
      const response = await api.get('/admin/profile/export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `profile-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تصدير بيانات البروفايل بنجاح');
    } catch (error) {
      console.error('Error exporting profile:', error);
      toast.error('حدث خطأ في تصدير البيانات');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaUser className="text-primary" />
            البروفايل
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
            >
              <FaEdit /> تعديل البروفايل
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaPrint /> طباعة
          </button>
          <button
            onClick={exportProfileData}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaFileAlt /> تصدير البيانات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* بطاقة المعلومات الشخصية */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">المعلومات الشخصية</h3>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <FaSave className="text-xs" /> حفظ
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        bio: user?.bio || '',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] text-sm flex items-center gap-1"
                  >
                    <FaTimes className="text-xs" /> إلغاء
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">الاسم الكامل *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`form-input w-full ${!isEditing && 'bg-[var(--bg-input)] cursor-not-allowed'}`}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`form-input w-full ${!isEditing && 'bg-[var(--bg-input)] cursor-not-allowed'}`}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`form-input w-full ${!isEditing && 'bg-[var(--bg-input)] cursor-not-allowed'}`}
                    placeholder="+213 5 XX XX XX XX"
                  />
                </div>
                <div>
                  <label className="form-label">الدور</label>
                  <input
                    type="text"
                    value={user?.role === 'admin' ? 'مدير النظام' : user?.role || 'مستخدم'}
                    disabled
                    className="form-input w-full bg-[var(--bg-input)] cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">السيرة الذاتية</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  className={`form-input w-full ${!isEditing && 'bg-[var(--bg-input)] cursor-not-allowed'}`}
                  placeholder="اكتب نبذة عن نفسك..."
                />
              </div>
            </form>
          </div>
        </div>

        {/* العمود الأيمن */}
        <div className="space-y-6">
          {/* بطاقة الصورة */}
          <div className="card text-center">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-3xl text-white font-bold overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0] || 'A'
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer">
                  <FaCamera className="text-xs" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h4 className="mt-3 font-bold">{user?.name}</h4>
            <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
            <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold inline-block">
              مدير النظام
            </div>
          </div>

          {/* بطاقة الأمان */}
          <div className="card">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-primary" />
              الأمان
            </h3>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors text-sm flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <FaKey className="text-primary" /> تغيير كلمة المرور
              </span>
              <span className="text-[var(--text-muted)]">{showPasswordForm ? '▲' : '▼'}</span>
            </button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-3">
                <div>
                  <label className="form-label text-sm">كلمة المرور الحالية</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-input w-full"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-sm">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="form-input w-full"
                    placeholder="•••••••• (8 أحرف على الأقل)"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-sm">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-input w-full"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
                </button>
              </form>
            )}

            <button
              onClick={handleDeleteAccount}
              className="w-full mt-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FaTrash /> حذف الحساب
            </button>
          </div>

          {/* بطاقة الإحصائيات */}
          <div className="card">
            <h3 className="font-bold mb-3">إحصائيات الحساب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">تاريخ التسجيل</span>
                <span className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-DZ') : 'غير محدد'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">آخر تسجيل دخول</span>
                <span className="font-medium">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-DZ') : 'اليوم'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[var(--text-secondary)]">حالة الحساب</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <FaCheckCircle /> نشط
                </span>
              </div>
            </div>
          </div>

          {/* سجل النشاطات */}
          <button
            onClick={() => setShowActivityLogs(!showActivityLogs)}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors text-sm flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <FaHistory className="text-primary" /> سجل النشاطات
            </span>
            <span className="text-[var(--text-muted)]">{showActivityLogs ? '▲' : '▼'}</span>
          </button>

          {showActivityLogs && (
            <div className="card space-y-2 max-h-48 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="py-2 border-b border-[var(--border-color)] text-sm last:border-b-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--text-secondary)]">{log.action}</span>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {new Date(log.timestamp).toLocaleString('ar-DZ')}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-muted)] flex items-center justify-between gap-3">
                    <span>IP: {log.ip}</span>
                    <span>{log.user}</span>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="text-sm text-[var(--text-muted)] py-2">لا توجد نشاطات مسجلة حتى الآن</div>
              )}
            </div>
          )}

          {/* ملاحظات داخلية */}
          <div className="card mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <FaStickyNote className="text-primary" /> ملاحظات الإدارة
              </h3>
              <span className="text-xs text-[var(--text-muted)]">{adminNotes.length} ملاحظة</span>
            </div>

            <form onSubmit={addAdminNote} className="space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows="3"
                className="form-input w-full"
                placeholder="اكتب ملاحظة داخلية أو تعليقًا للفريق..."
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={notePinned}
                    onChange={(e) => setNotePinned(e.target.checked)}
                    className="rounded border-[var(--border-color)]"
                  />
                  تثبيت الملاحظة بالأعلى
                </label>
                <button
                  type="submit"
                  disabled={notesLoading}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <FaPlus /> {notesLoading ? 'جاري الحفظ...' : 'إضافة ملاحظة'}
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {adminNotes.map((note) => (
                <div key={note.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>{note.author}</span>
                        {note.pinned && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px]">مثبتة</span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-[var(--text-primary)] whitespace-pre-wrap">{note.content}</div>
                      <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                        <FaClock className="text-[10px]" />
                        {new Date(note.timestamp).toLocaleString('ar-DZ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAdminNote(note.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}

              {adminNotes.length === 0 && (
                <div className="text-sm text-[var(--text-muted)] py-2">لا توجد ملاحظات بعد</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;