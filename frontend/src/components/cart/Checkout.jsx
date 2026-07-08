import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaLock, FaCreditCard } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, getTotal, refreshCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'الجزائر',
    },
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    paypalEmail: '',
    cryptoWallet: '',
  });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (!cart || cart.items?.length === 0) navigate('/shop');
  }, [isAuthenticated, cart]);

  useEffect(() => {
    const loadPaymentGateways = async () => {
      try {
        const res = await api.get('/payment-gateways');
        const gateways = res.data?.gateways || [];
        setPaymentGateways(gateways);
        if (gateways.length > 0) {
          setSelectedGateway(gateways[0].slug || gateways[0].name || '');
        }
      } catch (error) {
        console.error('load payment gateways error', error);
      }
    };

    loadPaymentGateways();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({ ...formData, [parent]: { ...formData[parent], [child]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'card' && (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv)) {
      toast.error('الرجاء إدخال بيانات البطاقة التجريبية');
      return;
    }
    if (paymentMethod === 'paypal' && !paymentDetails.paypalEmail) {
      toast.error('الرجاء إدخال بريد PayPal التجريبي');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        ...formData,
        email: formData.email,
        phone: formData.phone || user?.phone,
        paymentMethod,
        paymentGateway: selectedGateway,
        paymentDetails,
      };
      const res = await api.post('/orders', orderData);
      toast.success(paymentMethod === 'cod' || paymentMethod === 'bank_transfer'
        ? '✅ تم إنشاء الطلب بنجاح. الدفع في الوضع التجريبي قيد الانتظار.'
        : '✅ تم الدفع التجريبي بنجاح');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  const total = getTotal();

  return (
    <div className="page-transition max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaCreditCard className="text-primary" /> إتمام الشراء</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="text-lg font-semibold">معلومات الطلب</h2>

            <div>
              <label className="form-label">البريد الإلكتروني</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full" required />
            </div>

            <div>
              <label className="form-label">رقم الهاتف</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input w-full" placeholder="05XXXXXXXX" />
            </div>

            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">عنوان الشحن</h3>

            <div>
              <label className="form-label">الشارع</label>
              <input type="text" name="shippingAddress.street" value={formData.shippingAddress.street} onChange={handleChange} className="form-input w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="form-label">المدينة</label><input type="text" name="shippingAddress.city" value={formData.shippingAddress.city} onChange={handleChange} className="form-input w-full" /></div>
              <div><label className="form-label">الولاية</label><input type="text" name="shippingAddress.state" value={formData.shippingAddress.state} onChange={handleChange} className="form-input w-full" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="form-label">الرمز البريدي</label><input type="text" name="shippingAddress.zipCode" value={formData.shippingAddress.zipCode} onChange={handleChange} className="form-input w-full" /></div>
              <div><label className="form-label">الدولة</label><input type="text" name="shippingAddress.country" value={formData.shippingAddress.country} onChange={handleChange} className="form-input w-full" required /></div>
            </div>

            <div>
              <label className="form-label">ملاحظات (اختياري)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="form-input w-full resize-none" placeholder="أي ملاحظات إضافية حول الطلب" />
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-4">
              <h3 className="text-lg font-semibold mb-3">طريقة الدفع التجريبية</h3>

              <div className="space-y-3">
                <div>
                  <label className="form-label">اختر الطريقة</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="card">بطاقة ائتمان</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">العملات الرقمية</option>
                    <option value="ctgpeo_credit">CTGPEO Credit</option>
                    <option value="bank_transfer">حوالة بنكية</option>
                    <option value="cod">الدفع عند الاستلام</option>
                  </select>
                </div>

                {paymentGateways.length > 0 && (
                  <div>
                    <label className="form-label">البوابة المفعلة</label>
                    <select
                      value={selectedGateway}
                      onChange={(e) => setSelectedGateway(e.target.value)}
                      className="form-input w-full"
                    >
                      {paymentGateways.map((gateway) => (
                        <option key={gateway._id} value={gateway.slug || gateway.name}>
                          {gateway.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentMethod === 'ctgpeo_credit' && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-[var(--text-secondary)]">
                    سيتم استخدام بوابة CTGPEO Credit الخاصة باللوحة عند إنشاء الطلب.
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="form-label">رقم البطاقة</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentDetailChange}
                        className="form-input w-full"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div>
                      <label className="form-label">تاريخ الانتهاء</label>
                      <input
                        type="text"
                        name="expiry"
                        value={paymentDetails.expiry}
                        onChange={handlePaymentDetailChange}
                        className="form-input w-full"
                        placeholder="12/34"
                      />
                    </div>
                    <div>
                      <label className="form-label">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={handlePaymentDetailChange}
                        className="form-input w-full"
                        placeholder="123"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div>
                    <label className="form-label">بريد PayPal التجريبي</label>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={paymentDetails.paypalEmail}
                      onChange={handlePaymentDetailChange}
                      className="form-input w-full"
                      placeholder="sandbox@example.com"
                    />
                  </div>
                )}

                {paymentMethod === 'crypto' && (
                  <div>
                    <label className="form-label">محفظة العملات الرقمية التجريبية</label>
                    <input
                      type="text"
                      name="cryptoWallet"
                      value={paymentDetails.cryptoWallet}
                      onChange={handlePaymentDetailChange}
                      className="form-input w-full"
                      placeholder="0x1234..."
                    />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50">
              {loading ? 'جاري إتمام الطلب...' : 'إتمام الشراء'}
            </button>
          </form>
        </div>

        <div>
          <div className="card sticky top-20">
            <h2 className="text-lg font-semibold mb-4">ملخص الطلب</h2>

            <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
              {cart?.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-2 border-b border-[var(--border-color)] last:border-0">
                  <span className="line-clamp-1">{item.productId?.name?.ar || item.name}</span>
                  <span>{item.qty} × ${item.price} = ${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border-color)]">
              <span>الإجمالي</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>

            <div className="mt-4 text-xs text-[var(--text-muted)] flex items-center gap-2 justify-center">
              <FaLock className="text-primary" /> مدفوعات آمنة 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;