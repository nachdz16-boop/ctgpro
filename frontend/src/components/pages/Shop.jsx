import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ProductGrid from '../product/ProductGrid';
import { 
  FaSearch, FaBox, FaGift, FaKey, FaGamepad, FaMobileAlt,
  FaArrowLeft, FaArrowRight, FaTimes, FaChevronRight
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Shop = () => {
  const PRODUCTS_PER_PAGE = 8;
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchParams]);

  // ===== قائمة التصنيفات =====
  const categories = [
    { value: 'topup', label: 'شحن ألعاب', icon: <FaMobileAlt className="text-emerald-500" /> },
    { value: 'giftcards', label: 'بطاقات هدايا', icon: <FaGift className="text-pink-500" /> },
    { value: 'cdkeys', label: 'مفاتيح CD', icon: <FaKey className="text-amber-500" /> },
    { value: 'gamecards', label: 'اشتراكات', icon: <FaGamepad className="text-sky-500" /> },
  ];

  const currentCategory = categories.find(c => c.value === filters.category);
  const categoryTitle = currentCategory?.label || 'جميع المنتجات';
  const categoryIcon = currentCategory?.icon || <FaBox className="text-primary" />;

  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) fetchWishlist();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      
      // إضافة الفلاتر فقط إذا كانت موجودة
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;
      
      params.page = pagination.page;
      params.limit = PRODUCTS_PER_PAGE;
      
      console.log('🔍 Fetching products with params:', params);
      
      const res = await api.get('/products', { params });
      
      console.log('✅ Response status:', res.status);
      console.log('✅ Products count:', res.data.products?.length || 0);
      
      setProducts(res.data.products || []);
      setPagination({
        total: res.data.pagination?.total || 0,
        page: res.data.pagination?.page || 1,
        pages: res.data.pagination?.pages || 1,
      });
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      // عرض رسالة خطأ مفصلة
      let errorMessage = 'حدث خطأ في جلب المنتجات';
      if (error.response) {
        console.error('❌ Response data:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        console.error('❌ No response received');
        errorMessage = 'الخادم لا يستجيب، تأكد من تشغيل Backend';
      }
      
      setError(errorMessage);
      setProducts([]);
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

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
    setPagination({ ...pagination, page: 1 });
  };

  // عرض خطأ الاتصال بالخادم
  if (error) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="text-5xl mb-4">🔌</div>
        <h3 className="text-xl font-bold mb-2">فشل الاتصال بالخادم</h3>
        <p className="text-[var(--text-secondary)] text-sm mb-4">{error}</p>
        <div className="flex flex-col gap-3 items-center">
          <button 
            onClick={fetchProducts} 
            className="px-6 py-2.5 rounded-xl btn-primary text-white text-sm"
          >
            إعادة المحاولة
          </button>
          <p className="text-xs text-[var(--text-muted)]">
            تأكد من تشغيل Backend: <code className="bg-[var(--bg-input)] px-2 py-0.5 rounded">npm run dev</code> في مجلد backend
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* ===== رأس الصفحة ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[var(--text-secondary)] hover:text-primary transition-colors p-2 rounded-lg hover:bg-[var(--bg-input)]">
            <FaArrowLeft className="text-sm" />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {categoryIcon}
            {categoryTitle}
          </h1>
        </div>
        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
          <span>{pagination.total} منتج</span>
          {filters.category && (
            <button
              onClick={() => handleFilterChange('category', '')}
              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              {currentCategory?.label}
              <FaTimes className="text-[8px]" />
            </button>
          )}
        </div>
      </div>

      {/* ===== التصنيفات السريعة ===== */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        <Link
          to="/shop"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
            !filters.category ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/50 text-[var(--text-secondary)]'
          }`}
        >
          <FaBox className="text-xs" /> الكل
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.value}
            to={`/shop?category=${cat.value}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filters.category === cat.value ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/50 text-[var(--text-secondary)]'
            }`}
          >
            {cat.icon}
            {cat.label}
          </Link>
        ))}
      </div>

      {/* ===== الفلاتر ===== */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">
              بحث
            </label>
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="form-input w-full pr-9 text-sm"
                placeholder="ابحث عن منتج..."
              />
            </div>
          </div>

          <div className="min-w-[100px]">
            <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">
              السعر من
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="form-input w-full text-sm"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="min-w-[100px]">
            <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">
              السعر إلى
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="form-input w-full text-sm"
              placeholder="100"
              min="0"
            />
          </div>

          <div className="min-w-[120px]">
            <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">
              ترتيب حسب
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="form-input w-full text-sm"
            >
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
              <option value="rating">التقييم</option>
              <option value="popular">الأكثر مبيعاً</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl btn-primary text-white font-semibold text-sm flex items-center gap-1.5"
          >
            <FaSearch className="text-xs" /> بحث
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-red-500 hover:text-red-500 transition-colors text-sm"
          >
            مسح
          </button>
        </form>
      </div>

      {/* ===== النتائج ===== */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="loader-spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
          <p className="text-[var(--text-secondary)]">
            {filters.category ? `لا توجد منتجات في تصنيف "${currentCategory?.label || filters.category}"` : 'لا توجد منتجات متاحة حالياً'}
          </p>
          {filters.category && (
            <button
              onClick={() => handleFilterChange('category', '')}
              className="mt-4 px-6 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-1.5 mx-auto"
            >
              عرض جميع المنتجات <FaChevronRight className="text-xs" />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-sm text-[var(--text-secondary)] mb-4 flex justify-between items-center flex-wrap gap-2">
            <span>عرض {products.length} من {pagination.total} منتج</span>
          </div>

          <ProductGrid
            products={products}
            wishlist={wishlist}
            onWishlistToggle={toggleWishlist}
            columns={4}
          />

          {/* ===== الترقيم ===== */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <FaArrowLeft className="text-xs" /> السابق
              </button>
              <span className="px-4 py-2 text-sm text-[var(--text-secondary)]">
                صفحة {pagination.page} من {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                التالي <FaArrowRight className="text-xs" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;