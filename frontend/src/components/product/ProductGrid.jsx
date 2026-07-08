import React from 'react';
import ProductCard from './ProductCard';
import { useSettings } from '../../context/SettingsContext';

const ProductGrid = ({ products, wishlist = [], onWishlistToggle, loading = false, columns = 4, emptyMessage = 'لا توجد منتجات' }) => {
  const colClasses = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4', 5: 'grid-cols-2 md:grid-cols-5', 6: 'grid-cols-2 md:grid-cols-6' };
  const getDefaultColumns = () => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--product-grid-columns');
      const n = parseInt(v);
      if (!isNaN(n) && n > 0) return n;
    } catch (err) {
      // ignore
    }
    return 4;
  };
  const { settings } = useSettings();
  const storeCardStyle = settings?.appearance?.cardStyle || 'standard';
  const cols = columns || getDefaultColumns();

  if (loading) {
    return (
      <div className={`grid ${colClasses[columns] || colClasses[4]} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-[var(--bg-input)]"></div>
            <div className="p-4 space-y-3"><div className="h-4 bg-[var(--bg-input)] rounded w-3/4"></div><div className="h-4 bg-[var(--bg-input)] rounded w-1/2"></div><div className="flex gap-2"><div className="h-8 bg-[var(--bg-input)] rounded flex-1"></div><div className="h-8 bg-[var(--bg-input)] rounded w-12"></div></div></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <div className="text-center py-12"><div className="text-4xl text-[var(--text-muted)] mb-3">📦</div><p className="text-[var(--text-secondary)]">{emptyMessage}</p></div>;
  }

  return (
    <div className={`grid ${colClasses[cols] || colClasses[4]} gap-4`}>
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} isInWishlist={wishlist.includes(product._id || product.id)} onWishlistToggle={onWishlistToggle} cardStyle={storeCardStyle} />
      ))}
    </div>
  );
};

export default ProductGrid;