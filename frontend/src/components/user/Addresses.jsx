import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import PageLayout from '../layout/PageLayout';
import toast from 'react-hot-toast';

const Addresses = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'الجزائر',
    isDefault: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newAddresses = [...addresses];
    
    if (editingIndex !== null) {
      newAddresses[editingIndex] = formData;
      toast.success('✅ تم تحديث العنوان');
    } else {
      newAddresses.push(formData);
      toast.success('✅ تم إضافة العنوان');
    }
    
    setAddresses(newAddresses);
    updateUser({ addresses: newAddresses });
    setShowForm(false);
    setEditingIndex(null);
    setFormData({ street: '', city: '', state: '', zipCode: '', country: 'الجزائر', isDefault: false });
  };

  const handleDelete = (index) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      const newAddresses = addresses.filter((_, i) => i !== index);
      setAddresses(newAddresses);
      updateUser({ addresses: newAddresses });
      toast.success('🗑️ تم حذف العنوان');
    }
  };

  const handleEdit = (index) => {
    setFormData(addresses[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleSetDefault = (index) => {
    const newAddresses = addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));
    setAddresses(newAddresses);
    updateUser({ addresses: newAddresses });
    toast.success('✅ تم تعيين العنوان كافتراضي');
  };

  return (
    <PageLayout title="العناوين" subtitle="إدارة عناوين الشحن الخاصة بك">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[var(--text-secondary)]">
          {addresses.length} عنوان مسجل
        </p>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingIndex(null);
            setFormData({ street: '', city: '', state: '', zipCode: '', country: 'الجزائر', isDefault: false });
          }}
          className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
        >
          <FaPlus /> إضافة عنوان
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <FaMapMarkerAlt className="text-4xl text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)]">لا توجد عناوين مسجلة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address, index) => (
            <div
              key={index}
              className={`card hover:border-primary transition-all ${address.isDefault ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" />
                    <span className="font-semibold">
                      {address.street}, {address.city}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">افتراضي</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {address.street}, {address.city}, {address.state} {address.zipCode}
                    <br />
                    {address.country}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(index)}
                      className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
                    >
                      تعيين افتراضي
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(index)}
                    className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center text-primary"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--bg-primary) 72%, transparent)' }}>
          <div
            className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full p-6 border border-[var(--border-color)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingIndex !== null ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="form-label">الشارع</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="form-input w-full"
                  placeholder="أدخل اسم الشارع"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">المدينة</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input w-full"
                    placeholder="المدينة"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">الولاية</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="form-input w-full"
                    placeholder="الولاية"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">الرمز البريدي</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="form-input w-full"
                    placeholder="الرمز البريدي"
                  />
                </div>
                <div>
                  <label className="form-label">الدولة</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="form-input w-full"
                    placeholder="الدولة"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary"
                />
                <label className="text-sm">تعيين كعنوان افتراضي</label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl btn-primary text-white font-semibold"
                >
                  {editingIndex !== null ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Addresses;