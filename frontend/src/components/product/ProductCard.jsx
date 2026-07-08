import React from 'react';
import { Link } from 'react-router-dom';
import { Img } from 'react-image';
import productPlaceholder from '../../assets/images/product-placeholder.svg';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FaStar, FaStarHalfAlt, FaRegStar, FaCartPlus, FaHeart, 
  FaRegHeart, FaEye, FaBolt, FaServer, FaGift, FaClock,
  FaShoppingCart, FaCommentDots, FaUser
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ 
  product, 
  isInWishlist = false, 
  onWishlistToggle,
  showSeller = true,
  showActions = true,
  cardStyle = 'standard'
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useLanguage();
  
  if (!product) return null;

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const inStock = product.stock > 0;
  const badgeClass = product.badge === 'hot' ? 'badge-hot' : product.badge === 'sale' ? 'badge-sale' : 'badge-new';

  // تحديد نوع الشحن
  const isGameTopup = product.productType === 'game_topup' || product.game;
  const isMobileRecharge = product.productType === 'mobile_recharge' || product.operator;
  const isDigital = product.productType === 'digital' || product.category === 'giftcards' || product.category === 'cdkeys';

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<FaStar key={i} className="text-amber-400 text-xs" />);
      } else if (i === Math.floor(rating) + 1 && rating % 1 >= 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="text-amber-400 text-xs" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-slate-500 text-xs" />);
      }
    }
    return stars;
  };

  // ===== معالج الشراء المباشر =====
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول للشراء');
      return;
    }
    addToCart(product._id || product.id, 1);
    toast.success(`✅ تم شراء ${product.name?.ar || product.name}`);
    // توجيه إلى صفحة الدفع
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 500);
  };

  // ===== معالج إضافة للسلة =====
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول لإضافة المنتج إلى السلة');
      return;
    }
    addToCart(product._id || product.id);
  };

  const rootClass = `product-card group ${cardStyle === 'compact' ? 'product-card-compact' : cardStyle === 'large' ? 'product-card-large' : ''}`;

  return (
    <div className={rootClass}>
      {/* ===== صورة المنتج ===== */}
      <div className="img-wrap">
        <Img
          src={product.image || productPlaceholder}
          alt={product.name?.ar || 'منتج'}
          className={`w-full h-full object-cover transition-transform duration-700 ${cardStyle === 'compact' ? '' : 'group-hover:scale-110'}`}
          loader={<div className="w-full h-full bg-[var(--bg-input)] animate-pulse" />}
          unloader={<img src={productPlaceholder} alt="placeholder" className="w-full h-full object-cover" />}
        />
        
        {/* ===== شارة النوع ===== */}
        {isGameTopup && (
          <div className="type-badge game">
            <FaServer className="text-[8px]" /> شحن مباشر
          </div>
        )}
        {isMobileRecharge && (
          <div className="type-badge instant">
            <FaBolt className="text-[8px]" /> شحن فوري
          </div>
        )}
        {isDigital && (
          <div className="type-badge digital">
            <FaGift className="text-[8px]" /> كود رقمي
          </div>
        )}
        
        {/* ===== شارة الخصم ===== */}
        {product.badge && (
          <div className={`badge ${badgeClass}`}>
            {product.tag?.ar || product.badge}
          </div>
        )}
        {!inStock && (
          <div className="badge badge-sale" style={{ background: 'var(--danger)' }}>
            {t('common.out_of_stock') || 'نفد'}
          </div>
        )}
        
        {/* ===== أزرار التفاعل ===== */}
        <button
          onClick={() => onWishlistToggle?.(product._id || product.id)}
          className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
        >
          {isInWishlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
        </button>
        
        <Link to={`/product/${product._id || product.id}`} className="quick-view">
          <FaEye className="inline ml-1" /> {t('common.quick_view') || 'معاينة سريعة'}
        </Link>
      </div>

      {/* ===== معلومات البائع ===== */}
      {cardStyle !== 'compact' && showSeller && product.sellerId && (
        <div className="seller-info">
          <div className="avatar">
            {product.sellerId?.name?.[0] || 'S'}
          </div>
          <span>{product.sellerId?.name || 'بائع'}</span>
          <span className="rating">
            <FaStar className="text-amber-400" /> {product.sellerId?.rating || 0}
          </span>
          <span className="text-text-muted" style={{ fontSize: '10px' }}>
            ({product.sellerId?.totalSales || 0} مبيعات)
          </span>
        </div>
      )}

      {/* ===== محتوى البطاقة ===== */}
      <div className="info">
        <Link to={`/product/${product._id || product.id}`} className="title hover:text-primary transition-colors">
          {product.name?.ar || product.name}
        </Link>
        
        {/* ===== التقييم ===== */}
        <div className="stars">
          {renderStars(product.rating || 0)}
          <span className="count">({product.reviewsCount || 0})</span>
        </div>
        
        {/* ===== السعر ===== */}
        <div className="price-row">
          <span className="current">
            {formatCurrency ? formatCurrency(product.price) : `$${product.price}`}
          </span>
          {product.oldPrice && (
            <>
              <span className="old">
                {formatCurrency ? formatCurrency(product.oldPrice) : `$${product.oldPrice}`}
              </span>
              <span className="discount">-{discount}%</span>
            </>
          )}
        </div>
        
        {/* ===== ميتا ===== */}
        {cardStyle !== 'compact' && (
          <div className="meta">
            <span className="flex items-center gap-1">
              <FaClock className="text-[10px]" />
              {product.deliveryTime || 'فوري'}
            </span>
            {!inStock && <span className="stock-out">{t('common.out_of_stock') || 'نفد'}</span>}
            {inStock && product.stock < 20 && (
              <span className="stock">{t('common.only_left') || 'متبقي'} {product.stock}</span>
            )}
          </div>
        )}
        
        {/* ===== الأزرار ===== */}
        {showActions && (
          <div className="actions">
            {/* زر الشراء المباشر */}
            <button
              className="btn-buy-now focus:outline-none focus:ring-4 focus:ring-primary/20"
              onClick={handleBuyNow}
              disabled={!inStock || !isAuthenticated}
            >
              <FaBolt className="inline ml-1" />
              {inStock ? (t('common.buy_now') || 'شراء مباشر') : (t('common.out_of_stock') || 'نفد')}
            </button>
            
            {/* زر إضافة للسلة */}
            <button
              className="btn-cart focus:outline-none focus:ring-4 focus:ring-primary/20"
              onClick={handleAddToCart}
              disabled={!inStock || !isAuthenticated}
            >
              <FaCartPlus className="inline" />
            </button>
            
            {/* زر الدردشة */}
            <button className="btn-chat focus:outline-none focus:ring-4 focus:ring-primary/20">
              <FaCommentDots className="inline" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;