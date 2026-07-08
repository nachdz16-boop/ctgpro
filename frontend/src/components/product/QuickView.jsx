import React, { useState } from 'react';
import { Img } from 'react-image';
import productPlaceholder from '../../assets/images/product-placeholder-2.svg';
import { FaTimes, FaStar, FaStarHalfAlt, FaRegStar, FaCartPlus, FaHeart, FaRegHeart, FaBolt } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { calculateDiscount } from '../../utils/helpers';
import toast from 'react-hot-toast';

const QuickView = ({ product, isOpen, onClose, isInWishlist, onWishlistToggle }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [qty, setQty] = useState(1);

  if (!isOpen || !product) return null;

  const discount = calculateDiscount(product.oldPrice, product.price);
  const inStock = product.stock > 0;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<FaStar key={i} className="text-amber-400" />);
      else if (i === Math.floor(rating) + 1 && rating % 1 >= 0.5) stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
      else stars.push(<FaRegStar key={i} className="text-slate-500" />);
    }
    return stars;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول');
      return;
    }
    addToCart(product._id, qty);
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Img
              src={product.image || productPlaceholder}
              alt={product.name?.ar || 'منتج'}
              className="w-full rounded-lg"
              loader={<div className="w-full h-72 rounded-lg bg-[var(--bg-input)] animate-pulse" />}
              unloader={<img src={productPlaceholder} alt="placeholder" className="w-full h-72 rounded-lg object-cover" />}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">{product.name?.ar || product.name}</h2>

            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-1">
                {renderStars(product.rating || 0)}
                <span className="text-sm text-[var(--text-muted)]">({product.reviewsCount || 0})</span>
              </div>
              {product.badge && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                  ${product.badge === 'hot' ? 'bg-red-500/20 text-red-500' :
                    product.badge === 'sale' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-emerald-500/20 text-emerald-500'}`}
                >
                  {product.tag?.ar || product.badge}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency ? formatCurrency(product.price) : `$${product.price}`}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-[var(--text-muted)] line-through">
                    {formatCurrency ? formatCurrency(product.oldPrice) : `$${product.oldPrice}`}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">المنصة</span>
                <span className="font-medium">{product.platform || 'عام'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">التوصيل</span>
                <span className="font-medium text-emerald-500">{product.deliveryTime || 'فوري'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">المخزون</span>
                <span className={`font-medium ${inStock ? 'text-emerald-500' : 'text-red-500'}`}>
                  {inStock ? `${product.stock} متوفر` : 'نفد'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-[var(--text-secondary)]">الكمية:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-lg border border-[var(--border-color)] hover:border-primary transition-colors"
                  disabled={!inStock}
                >
                  -
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-8 h-8 rounded-lg border border-[var(--border-color)] hover:border-primary transition-colors"
                  disabled={!inStock || qty >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || !isAuthenticated}
                className="flex-1 min-w-[120px] py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCartPlus className="inline ml-2" />
                {inStock ? (t('common.add_to_cart') || 'أضف للسلة') : (t('common.out_of_stock') || 'نفد')}
              </button>
              <button
                disabled={!inStock || !isAuthenticated}
                className="px-4 py-3 rounded-xl bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaBolt className="inline ml-1" /> {t('common.buy_now') || 'شراء الآن'}
              </button>
              <button
                onClick={() => onWishlistToggle?.(product._id)}
                className={`px-4 py-3 rounded-xl border transition-all
                  ${isInWishlist ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border-color)] hover:border-primary'}`}
              >
                {isInWishlist ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;