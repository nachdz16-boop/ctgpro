import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ProductGrid from '../product/ProductGrid';
import { FaHeart } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
    else setLoading(false);
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setProducts(res.data.wishlist?.products || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally { setLoading(false); }
  };

  const toggleWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
      toast.success('💔 تمت الإزالة من المفضلة');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <FaHeart className="text-4xl text-[var(--text-muted)] mx-auto mb-3" />
        <p className="text-[var(--text-secondary)]">يرجى تسجيل الدخول لعرض المفضلة</p>
        <Link to="/login" className="mt-4 inline-block px-6 py-2 rounded-xl btn-primary text-white">تسجيل الدخول</Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-12"><div className="loader-spinner"></div></div>;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <FaHeart className="text-4xl text-[var(--text-muted)] mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">{t('wishlist.empty')}</h3>
        <Link to="/shop" className="mt-4 inline-block px-6 py-2 rounded-xl btn-primary text-white">تسوق الآن</Link>
      </div>
    );
  }

  return (
    <div className="page-transition max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaHeart className="text-pink-500" /> {t('wishlist.title')}
        <span className="text-sm text-[var(--text-secondary)] font-normal">({products.length})</span>
      </h1>
      <ProductGrid products={products} wishlist={products.map(p => p._id)} onWishlistToggle={toggleWishlist} columns={4} />
    </div>
  );
};

export default Wishlist;