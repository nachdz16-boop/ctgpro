import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductGrid from '../product/ProductGrid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { 
  FaBolt, FaShieldAlt, FaHeadset, FaTruck, 
  FaGamepad, FaMobileAlt, FaGift, FaKey, FaStar, 
  FaArrowLeft, FaCartPlus, FaHeart, FaRegHeart, FaEye,
  FaStarHalfAlt, FaRegStar, FaFire, FaTrophy,
  FaUsers, FaStore, FaSteam, FaPlaystation, FaXbox,
  FaAndroid, FaApple, FaGlobe, FaCrosshairs, FaSearch,
  FaShoppingCart, FaChevronRight, FaClock, FaDollarSign,
  FaPercent, FaTag, FaGem, FaRocket, FaCheck,  // ✅ إضافة FaCheck
  FaUser, FaComments, FaShoppingBag
} from 'react-icons/fa';
import { SiEpicgames, SiRiotgames, SiNintendoswitch } from 'react-icons/si';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // ===== بيانات السلايدر =====
  const sliderItems = [
    { 
      id: 1, 
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200', 
      title: 'PUBG Mobile',
      subtitle: 'شحن فوري',
      desc: 'أفضل الأسعار لجميع الخوادم',
      price: 6.99, 
      oldPrice: 9.99, 
      discount: 30, 
      badgeText: 'عرض حصري',
      color: 'from-orange-500 to-red-500'
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200', 
      title: 'Free Fire',
      subtitle: 'خصم يصل إلى 50%',
      desc: 'أفضل عروض الماسات',
      price: 3.99, 
      oldPrice: 5.49, 
      discount: 27, 
      badgeText: 'الأكثر مبيعاً',
      color: 'from-red-500 to-pink-500'
    },
    { 
      id: 3, 
      image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=1200', 
      title: 'Mobile Legends',
      subtitle: 'شحن دايموند',
      desc: 'مكافآت إضافية مع كل شحنة',
      price: 8.99, 
      oldPrice: 13.99, 
      discount: 36, 
      badgeText: 'عرض خاص',
      color: 'from-emerald-500 to-cyan-500'
    },
  ];

  // ===== فئات المنتجات =====
  const categories = [
    { id: 'all', label: 'الكل', icon: <FaGamepad /> },
    { id: 'topup', label: 'شحن ألعاب', icon: <FaMobileAlt /> },
    { id: 'giftcards', label: 'بطاقات هدايا', icon: <FaGift /> },
    { id: 'cdkeys', label: 'مفاتيح CD', icon: <FaKey /> },
    { id: 'gamecards', label: 'اشتراكات', icon: <FaStar /> },
  ];

  // ===== عروض مميزة =====
  const featuredOffers = [
    { id: 1, title: 'PUBG Mobile 1050 UC', price: 6.99, oldPrice: 9.99, discount: 30, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', badge: 'عرض خاص' },
    { id: 2, title: 'Free Fire 1000 ماسة', price: 3.99, oldPrice: 5.49, discount: 27, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300', badge: 'الأكثر مبيعاً' },
    { id: 3, title: 'Steam Wallet $50', price: 47.99, oldPrice: 50, discount: 4, image: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=300', badge: 'وفر 4%' },
    { id: 4, title: 'Mobile Legends 500 💎', price: 8.99, oldPrice: 13.99, discount: 36, image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=300', badge: 'عرض حصري' },
  ];

  // ===== بائعين مميزين =====
  const topSellers = [
    { id: 1, name: 'GamingStore DZ', rating: 4.9, sales: 1250, avatar: 'G', verified: true },
    { id: 2, name: 'CardShop Pro', rating: 4.8, sales: 890, avatar: 'C', verified: true },
    { id: 3, name: 'GameKeys DZ', rating: 4.7, sales: 560, avatar: 'K', verified: true },
    { id: 4, name: 'Digital Store', rating: 4.6, sales: 340, avatar: 'D', verified: false },
  ];

  // ===== الألعاب الشائعة =====
  const popularGames = [
    { id: 'pubg', name: 'PUBG', icon: <FaGamepad />, color: '#f5a623', bg: 'from-orange-500/20 to-orange-600/20', count: '1.2K+' },
    { id: 'freefire', name: 'Free Fire', icon: <FaFire />, color: '#ff5722', bg: 'from-red-500/20 to-red-600/20', count: '2.5K+' },
    { id: 'mlbb', name: 'MLBB', icon: <FaGamepad />, color: '#4285f4', bg: 'from-blue-500/20 to-blue-600/20', count: '890+' },
    { id: 'cod', name: 'COD', icon: <FaGamepad />, color: '#1a1a2e', bg: 'from-gray-800/20 to-gray-900/20', count: '450+' },
    { id: 'genshin', name: 'Genshin', icon: <FaStar />, color: '#4a7c59', bg: 'from-emerald-500/20 to-emerald-600/20', count: '670+' },
    { id: 'fortnite', name: 'Fortnite', icon: <FaTrophy />, color: '#00dc82', bg: 'from-emerald-500/20 to-cyan-500/20', count: '320+' },
  ];

  // ===== المنصات =====
  const platforms = [
    { id: 'steam', name: 'Steam', icon: <FaSteam />, color: '#171a21' },
    { id: 'playstation', name: 'PlayStation', icon: <FaPlaystation />, color: '#006fcd' },
    { id: 'xbox', name: 'Xbox', icon: <FaXbox />, color: '#107c10' },
    { id: 'nintendo', name: 'Nintendo', icon: <SiNintendoswitch />, color: '#e60012' },
    { id: 'epic', name: 'Epic', icon: <SiEpicgames />, color: '#313131' },
    { id: 'riot', name: 'Riot', icon: <SiRiotgames />, color: '#d13639' },
    { id: 'apple', name: 'Apple', icon: <FaApple />, color: '#555555' },
    { id: 'android', name: 'Android', icon: <FaAndroid />, color: '#3ddc84' },
  ];

  // ===== الميزات =====
  const features = [
    { icon: <FaBolt />, title: 'توصيل فوري', desc: 'خلال 2-5 دقائق', color: 'from-blue-500 to-blue-600' },
    { icon: <FaShieldAlt />, title: 'حماية 100%', desc: 'مدفوعات آمنة', color: 'from-emerald-500 to-emerald-600' },
    { icon: <FaHeadset />, title: 'دعم 24/7', desc: 'فريق متخصص', color: 'from-emerald-500 to-cyan-500' },
    { icon: <FaTruck />, title: 'شحن مجاني', desc: 'للطلبات فوق $50', color: 'from-amber-500 to-amber-600' },
  ];

  // ===== دوال البيانات =====
  useEffect(() => {
    fetchData();
    if (isAuthenticated) fetchWishlist();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=8&sort=popular');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist?.products || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول');
      return;
    }
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/wishlist/${productId}`);
        setWishlist(wishlist.filter(id => id !== productId));
        toast.success('💔 تمت الإزالة من المفضلة');
      } else {
        await api.post(`/wishlist/${productId}`);
        setWishlist([...wishlist, productId]);
        toast.success('❤️ تمت الإضافة إلى المفضلة');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  return (
    <div className="page-transition">
      {/* ===== Hero Slider ===== */}
      <div className="hero-slider mb-8">
        <Swiper 
          modules={[Navigation, Pagination, Autoplay, EffectFade]} 
          loop 
          autoplay={{ delay: 5000, disableOnInteraction: false }} 
          pagination={{ clickable: true }} 
          navigation 
          effect="fade" 
          speed={700} 
          className="rounded-2xl overflow-hidden"
        >
          {sliderItems.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="relative min-h-[320px] md:min-h-[420px]">
                <img src={item.image} alt={item.title} className="w-full h-[320px] md:h-[420px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex items-center p-6 md:p-12">
                  <div className="max-w-xl">
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-xs font-semibold mb-3`}>
                      {item.badgeText}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{item.title}</h1>
                    <p className="text-xl md:text-2xl text-primary-light font-semibold mb-1">{item.subtitle}</p>
                    <p className="text-white/70 text-sm md:text-base mb-4">{item.desc}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl md:text-3xl font-bold text-primary-light">${item.price}</span>
                      <span className="text-white/50 line-through">${item.oldPrice}</span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">-{item.discount}%</span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
                        <FaBolt className="text-sm" /> شراء الآن
                      </button>
                      <button className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                        <FaCartPlus className="text-sm" /> أضف للسلة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ===== الميزات السريعة ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center hover:border-primary/30 transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-xl mb-2`}>
              {feature.icon}
            </div>
            <h4 className="font-bold text-sm">{feature.title}</h4>
            <p className="text-xs text-[var(--text-secondary)]">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* ===== فئات المنتجات ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/50 text-[var(--text-secondary)]'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== عروض مميزة ===== */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaFire className="text-red-500" /> عروض مميزة
          </h2>
          <Link to="/shop" className="text-primary text-sm font-medium hover:text-primary-light transition-colors flex items-center gap-1">
            عرض الكل <FaChevronRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredOffers.map((offer) => (
            <div key={offer.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-1 group">
              <div className="relative">
                <img src={offer.image} alt={offer.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  -{offer.discount}%
                </div>
                {offer.badge && (
                  <div className="absolute bottom-2 left-2 bg-[var(--bg-secondary)]/75 backdrop-blur-sm text-[var(--text-primary)] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                    {offer.badge}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm line-clamp-1">{offer.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-primary">${offer.price}</span>
                  <span className="text-xs text-[var(--text-muted)] line-through">${offer.oldPrice}</span>
                </div>
                <button className="w-full mt-2 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
                  <FaCartPlus className="text-[10px]" /> شراء الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== أفضل البائعين ===== */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaStar className="text-amber-500" /> أفضل البائعين
          </h2>
          <Link to="/marketplace" className="text-primary text-sm font-medium hover:text-primary-light transition-colors flex items-center gap-1">
            عرض الكل <FaChevronRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topSellers.map((seller) => (
            <div key={seller.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-primary/30 transition-all hover:-translate-y-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl font-bold text-white mb-2 relative">
                {seller.avatar}
                {seller.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <FaCheck className="text-white text-[8px]" />
                  </div>
                )}
              </div>
              <h4 className="font-bold text-sm">{seller.name}</h4>
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="text-amber-400">⭐ {seller.rating}</span>
                <span>•</span>
                <span>{seller.sales} مبيعات</span>
              </div>
              <button className="mt-2 px-4 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                زيارة المتجر
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===== الألعاب الشائعة ===== */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaGamepad className="text-primary" /> الألعاب الشائعة
          </h2>
          <Link to="/shop" className="text-primary text-sm font-medium hover:text-primary-light transition-colors flex items-center gap-1">
            عرض الكل <FaChevronRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {popularGames.map((game) => (
            <Link
              key={game.id}
              to={`/shop?game=${game.id}`}
              className={`bg-gradient-to-br ${game.bg} p-4 rounded-xl border border-[var(--border-color)] hover:border-primary/50 transition-all hover:-translate-y-1 text-center group`}
            >
              <div 
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                style={{ background: `${game.color}20`, color: game.color }}
              >
                {game.icon}
              </div>
              <div className="text-xs font-medium mt-2">{game.name}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{game.count} عملية</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== المنصات ===== */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaGlobe className="text-primary" /> المنصات المدعومة
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border border-[var(--border-color)] hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              style={{ background: `${platform.color}15`, color: platform.color }}
            >
              {platform.icon}
            </div>
          ))}
        </div>
      </div>

      {/* ===== المنتجات المميزة ===== */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaStar className="text-amber-500" /> الأكثر مبيعاً
          </h2>
          <Link to="/shop" className="text-primary text-sm font-medium hover:text-primary-light transition-colors flex items-center gap-1">
            عرض الكل <FaChevronRight className="text-xs" />
          </Link>
        </div>
        <ProductGrid 
          products={products} 
          wishlist={wishlist} 
          onWishlistToggle={toggleWishlist} 
          loading={loading} 
          columns={4} 
        />
      </div>

      {/* ===== قسم الثقة ===== */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-bold text-sm">مدفوعات آمنة</h4>
            <p className="text-xs text-[var(--text-secondary)]">تشفير SSL 256-bit</p>
          </div>
          <div>
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-bold text-sm">توصيل فوري</h4>
            <p className="text-xs text-[var(--text-secondary)]">خلال 2-5 دقائق</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🛡️</div>
            <h4 className="font-bold text-sm">ضمان استرداد</h4>
            <p className="text-xs text-[var(--text-secondary)]">7 أيام كاملة</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🎧</div>
            <h4 className="font-bold text-sm">دعم 24/7</h4>
            <p className="text-xs text-[var(--text-secondary)]">فريق متخصص</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;