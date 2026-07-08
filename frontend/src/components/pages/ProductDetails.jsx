import React, { useState, useEffect } from 'react';
import { Img } from 'react-image';
import productPlaceholder from '../../assets/images/product-placeholder-2.svg';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaStar, FaStarHalfAlt, FaRegStar, FaCartPlus, FaHeart, FaRegHeart, FaShare, FaWhatsapp, FaFacebook, FaBolt, FaUser } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [qty, setQty] = useState(1);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'support', text: 'مرحباً! كيف يمكنني مساعدتك بخصوص هذا المنتج؟', time: new Date().toLocaleTimeString() },
  ]);

  useEffect(() => {
    fetchProduct();
    if (isAuthenticated) checkWishlist();
  }, [id, isAuthenticated]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('المنتج غير موجود');
    } finally { setLoading(false); }
  };

  const checkWishlist = async () => {
    try {
      const res = await api.get(`/wishlist/check/${id}`);
      setIsInWishlist(res.data.isInWishlist);
    } catch (error) { console.error('Error checking wishlist:', error); }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { toast.error('يرجى تسجيل الدخول'); return; }
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${id}`);
        setIsInWishlist(false);
        toast.success('💔 تمت الإزالة من المفضلة');
      } else {
        await api.post(`/wishlist/${id}`);
        setIsInWishlist(true);
        toast.success('❤️ تمت الإضافة إلى المفضلة');
      }
    } catch (error) { toast.error(error.response?.data?.message || 'حدث خطأ'); }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<FaStar key={i} className="text-amber-400" />);
      else if (i === Math.floor(rating) + 1 && rating % 1 >= 0.5) stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
      else stars.push(<FaRegStar key={i} className="text-slate-500" />);
    }
    return stars;
  };

  const userDisplayName = isAuthenticated ? (user?.name || 'أنت') : 'زائر';
  const userAvatar = isAuthenticated ? user?.avatar : null;

  const handleSendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const newMessage = { sender: 'user', text: trimmed, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, newMessage]);
    setChatInput('');

    setTimeout(() => {
      const replies = [
        'هذا المنتج يحظى بشعبية كبيرة، يمكنك إكمال الشراء الآن.',
        'السعر الحالي شامل جميع الرسوم، والتوصيل سريع.',
        'يمكنك إضافة هذا المنتج إلى السلة ثم اختيار وسيلة الدفع المناسبة.',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [...prev, { sender: 'support', text: reply, time: new Date().toLocaleTimeString() }]);
    }, 1000);
  };

  const addExpression = (emoji) => {
    setChatInput((prev) => `${prev} ${emoji}`.trim());
  };

  if (loading) return <div className="flex justify-center py-12"><div className="loader-spinner"></div></div>;
  if (!product) return <div className="text-center py-12"><p className="text-[var(--text-secondary)]">المنتج غير موجود</p><Link to="/shop" className="mt-4 inline-block px-6 py-2 rounded-xl btn-primary text-white">العودة إلى المتجر</Link></div>;

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const inStock = product.stock > 0;

  return (
    <div className="page-transition max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-primary)] rounded-2xl overflow-hidden">
          <Img src={product.image || productPlaceholder} alt={product.name?.ar || 'منتج'} className="w-full h-[400px] object-contain" loader={<div className="w-full h-[400px] bg-[var(--bg-input)] animate-pulse" />} unloader={<img src={productPlaceholder} alt="placeholder" className="w-full h-[400px] object-contain" />} />
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name?.ar || product.name}</h1>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1">{renderStars(product.rating || 0)}<span className="text-sm text-[var(--text-muted)]">({product.reviewsCount || 0})</span></div>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">${product.price}</span>
            {product.oldPrice && <><span className="text-[var(--text-muted)] line-through">${product.oldPrice}</span><span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-{discount}%</span></>}
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between py-2 border-b border-[var(--border-color)]"><span className="text-[var(--text-secondary)]">{t('product.platform')}</span><span className="font-medium">{product.platform || 'عام'}</span></div>
            <div className="flex justify-between py-2 border-b border-[var(--border-color)]"><span className="text-[var(--text-secondary)]">{t('product.delivery')}</span><span className="font-medium text-emerald-500">{product.deliveryTime || 'فوري'}</span></div>
            <div className="flex justify-between py-2 border-b border-[var(--border-color)]"><span className="text-[var(--text-secondary)]">{t('product.stock')}</span><span className={`font-medium ${inStock ? 'text-emerald-500' : 'text-red-500'}`}>{inStock ? `${product.stock} ${t('common.in_stock')}` : t('common.out_of_stock')}</span></div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-[var(--text-secondary)]">{t('product.quantity')}</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg border border-[var(--border-color)] hover:border-primary transition-colors">-</button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-8 rounded-lg border border-[var(--border-color)] hover:border-primary transition-colors" disabled={!inStock || qty >= product.stock}>+</button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={() => addToCart(product._id, qty)} disabled={!inStock || !isAuthenticated} className="flex-1 min-w-[120px] py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"><FaCartPlus className="inline ml-2" /> {inStock ? t('common.add_to_cart') : t('common.out_of_stock')}</button>
            <button onClick={toggleWishlist} className={`px-4 py-3 rounded-xl border transition-all ${isInWishlist ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border-color)] hover:border-primary'}`}>{isInWishlist ? <FaHeart /> : <FaRegHeart />}</button>
            <button className="px-4 py-3 rounded-xl border border-[var(--border-color)] hover:border-primary transition-all"><FaShare /></button>
          </div>

          <div className="mt-4 flex gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`CTGPRO - ${product.name?.ar || 'منتج'}: ${window.location.href}`)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-green-500/20 text-green-500 text-sm hover:bg-green-500/30 transition-colors flex items-center gap-1"><FaWhatsapp /> واتساب</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-500 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-1"><FaFacebook /> فيسبوك</a>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-3">{t('product.description')}</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">{product.description?.ar || product.name?.ar || 'لا يوجد وصف'}</p>
      </div>

      {product.sellerId && (
        <div className="mt-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">{t('product.seller')}</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold flex-shrink-0">{product.sellerId.name?.[0] || 'S'}</div>
            <div><div className="font-medium">{product.sellerId.name}</div><div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><span>⭐ {product.sellerId.rating || 0}</span><span>•</span><span>{product.sellerId.totalSales || 0} مبيعات</span></div></div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold flex items-center justify-center overflow-hidden">
              {userAvatar ? <img src={userAvatar} alt={userDisplayName} className="w-full h-full object-cover" /> : <FaUser />}
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">دردشة المستخدم</p>
              <h3 className="font-semibold">{userDisplayName}</h3>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-4">اختر تعابير سريعة لتسريع المحادثة</p>
          <div className="flex flex-wrap gap-2">
            {['😊', '🤔', '❤️', '🔥', '🚀'].map((emoji) => (
              <button key={emoji} type="button" onClick={() => addExpression(emoji)} className="px-3 py-2 rounded-2xl border border-[var(--border-color)] hover:border-primary transition-colors text-lg">
                {emoji}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-secondary)] mb-2">نموذج سريع</p>
            <ul className="space-y-2 text-sm text-[var(--text-primary)]">
              <li>• هل يوجد ضمان لهذا المنتج؟</li>
              <li>• كم مدة التوصيل؟</li>
              <li>• هل يمكنني الحصول على دعم فوري بعد الشراء؟</li>
            </ul>
          </div>
        </aside>

        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">محادثة المنتج</h3>
              <p className="text-sm text-[var(--text-secondary)]">اكتب وسنجيبك فوراً بنصائح حول المنتج</p>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">{messages.length} رسائل</span>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender === 'user' ? 'sent' : 'received'}`}>
                  <div>{msg.text}</div>
                  <span className="time">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="form-input"
                placeholder="اكتب رسالة أو استفسار..."
              />
              <button onClick={handleSendMessage} className="px-4 py-3 rounded-xl btn-primary text-white">
                إرسال
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;