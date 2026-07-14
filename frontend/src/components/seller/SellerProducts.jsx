import React, { useState, useEffect } from 'react';
import { Img } from 'react-image';
import productPlaceholder from '../../assets/images/product-placeholder.svg';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter,
  FaBox, FaGift, FaKey, FaGamepad, FaCheck, FaTimes
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SellerProducts = () => {
  const { user } = useAuth();
  const { t, formatCurrency, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/seller/${user?.sellerId}`);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('حدث خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    (product?.name?.[language] || product?.name?.ar || product?.name?.en || product?.name || '')
      .toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-transition max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaBox className="text-primary" /> منتجاتي
        </h1>
        <Link
          to="/seller/products/new"
          className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
        >
          <FaPlus /> إضافة منتج
        </Link>
      </div>

      {/* ===== البحث ===== */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pr-9 text-sm"
              />
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2">
            <FaFilter /> فلتر
          </button>
        </div>
      </div>

      {/* ===== المنتجات ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-primary/30 transition-all">
            <div className="relative">
              <Img
                src={product.image || productPlaceholder}
                alt={product?.name?.[language] || product.name?.ar || 'منتج'}
                className="w-full h-40 object-cover"
                loader={<div className="w-full h-40 bg-[var(--bg-input)] animate-pulse" />}
                unloader={<img src={productPlaceholder} alt="placeholder" className="w-full h-40 object-cover" />}
              />
              {product.badge && (
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                  product.badge === 'hot' ? 'bg-red-500' :
                  product.badge === 'sale' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  {product.badge}
                </span>
              )}
              <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                product.isActive ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'
              }`}>
                {product.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm line-clamp-1">{product?.name?.[language] || product.name?.ar || product.name}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-input)]">
                  {product.category}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-xs text-[var(--text-muted)] line-through">
                    {formatCurrency(product.oldPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} متوفر` : 'نفد'}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <Link
                  to={`/seller/products/${product._id}/edit`}
                  className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <FaEdit className="text-[10px]" /> تعديل
                </Link>
                <button
                  className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <FaTrash className="text-[10px]" /> حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <FaBox className="text-3xl mx-auto mb-2 opacity-30" />
          <p>لا توجد منتجات</p>
          <Link
            to="/seller/products/new"
            className="mt-4 inline-block px-6 py-2 rounded-xl btn-primary text-white text-sm"
          >
            <FaPlus className="inline ml-1" /> إضافة منتج
          </Link>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;