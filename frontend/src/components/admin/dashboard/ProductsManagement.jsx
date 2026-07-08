// src/components/admin/ProductsManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaFilter,
  FaDownload, FaBox, FaGift, FaKey, FaGamepad,
  FaCheck, FaTimes, FaClock, FaStar, FaTag,
  FaSort, FaSortUp, FaSortDown, FaUpload, FaImage,
  FaLink, FaWallet, FaShoppingCart, FaPrint
} from 'react-icons/fa';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ProductsManagement = () => {
  const { t, formatCurrency } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [newProduct, setNewProduct] = useState({
    name: { ar: '', en: '' },
    category: 'topup',
    price: '',
    oldPrice: '',
    stock: '',
    image: '',
    badge: '',
    isFeatured: false,
    isActive: true,
  });
  const [aiProductOpen, setAiProductOpen] = useState(false);
  const [aiProductForm, setAiProductForm] = useState({
    name: '',
    description: '',
    price: '1000',
    stock: '20',
    category: 'topup',
    imageQuery: '',
  });
  const [aiProductLoading, setAiProductLoading] = useState(false);
  const [aiProductResult, setAiProductResult] = useState('');
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [uploadingAiImage, setUploadingAiImage] = useState(false);

  const categories = [
    { value: 'all', label: 'جميع التصنيفات', icon: <FaBox /> },
    { value: 'topup', label: 'شحن ألعاب', icon: <FaGamepad /> },
    { value: 'giftcards', label: 'بطاقات هدايا', icon: <FaGift /> },
    { value: 'cdkeys', label: 'مفاتيح CD', icon: <FaKey /> },
    { value: 'gamecards', label: 'اشتراكات', icon: <FaBox /> },
  ];

  const normalizeText = (value) => (value || '').toString().toLowerCase().trim();

  const isProductSelected = (productId) => selectedProductIds.includes(productId);

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const selectVisibleProducts = () => {
    setSelectedProductIds(paginatedProducts.map((product) => product._id));
  };

  const clearSelectedProducts = () => {
    setSelectedProductIds([]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterStock, filterFeatured, priceMin, priceMax, sortField, sortDirection]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('حدث خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((currentProducts) => currentProducts.filter(product => product._id !== productId));
      setSelectedProductIds((current) => current.filter((id) => id !== productId));
      toast.success('✅ تم حذف المنتج بنجاح');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('حدث خطأ في حذف المنتج');
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const targetProduct = products.find((product) => product._id === productId);
      if (!targetProduct) return;
      const response = await api.put(`/admin/products/${productId}`, { isActive: !currentStatus });
      const updatedProduct = response.data?.product;
      setProducts((currentProducts) => currentProducts.map((product) =>
        product._id === productId ? (updatedProduct || { ...product, isActive: !currentStatus }) : product
      ));
      toast.success(`✅ تم ${currentStatus ? 'تعطيل' : 'تفعيل'} المنتج بنجاح`);
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('حدث خطأ في تغيير حالة المنتج');
    }
  };

  const toggleFeatured = async (productId, currentFeatured) => {
    try {
      const response = await api.put(`/admin/products/${productId}`, { isFeatured: !currentFeatured });
      const updatedProduct = response.data?.product;
      setProducts((currentProducts) => currentProducts.map((product) =>
        product._id === productId ? (updatedProduct || { ...product, isFeatured: !currentFeatured }) : product
      ));
      toast.success(`✅ تم ${!currentFeatured ? 'تفعيل' : 'إزالة'} المميز من المنتج`);
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('حدث خطأ في تغيير حالة المميز');
    }
  };

  const bulkUpdateProducts = async (updater, successMessage) => {
    if (selectedProductIds.length === 0) {
      toast.error('اختر منتجًا واحدًا على الأقل');
      return;
    }

    try {
      const updates = selectedProductIds.map((productId) => {
        const product = products.find((item) => item._id === productId);
        return product ? api.put(`/admin/products/${productId}`, updater(product)) : Promise.resolve(null);
      });

      const results = await Promise.all(updates);
      const updatedById = new Map(
        results
          .filter(Boolean)
          .map((response) => [response.data?.product?._id, response.data?.product])
      );

      setProducts((currentProducts) => currentProducts.map((product) => updatedById.get(product._id) || product));
      toast.success(successMessage);
      clearSelectedProducts();
    } catch (error) {
      console.error('Error performing bulk update:', error);
      toast.error('حدث خطأ أثناء تنفيذ العملية الجماعية');
    }
  };

  const bulkToggleStatus = (nextStatus) => {
    bulkUpdateProducts(
      (product) => ({ ...product, isActive: nextStatus }),
      `✅ تم ${nextStatus ? 'تفعيل' : 'تعطيل'} المنتجات المحددة`
    );
  };

  const bulkToggleFeatured = (nextFeatured) => {
    bulkUpdateProducts(
      (product) => ({ ...product, isFeatured: nextFeatured }),
      `✅ تم ${nextFeatured ? 'تفعيل' : 'إزالة'} التمييز عن المنتجات المحددة`
    );
  };

  const bulkDeleteProducts = () => {
    if (selectedProductIds.length === 0) {
      toast.error('اختر منتجًا واحدًا على الأقل');
      return;
    }

    if (!window.confirm(`هل تريد حذف ${selectedProductIds.length} منتجًا محددًا؟`)) {
      return;
    }

    Promise.all(selectedProductIds.map((productId) => api.delete(`/admin/products/${productId}`)))
      .then(() => {
        setProducts((currentProducts) => currentProducts.filter((product) => !selectedProductIds.includes(product._id)));
        setSelectedProductIds([]);
        toast.success('✅ تم حذف المنتجات المحددة');
      })
      .catch((error) => {
        console.error('Error deleting selected products:', error);
        toast.error('حدث خطأ أثناء حذف المنتجات المحددة');
      });
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAiCreateProduct = async (e) => {
    e.preventDefault();
    if (!aiProductForm.name.trim()) {
      toast.error('أدخل اسم المنتج أولاً');
      return;
    }

    setAiProductLoading(true);
    setAiProductResult('');
    try {
      const res = await api.post('/admin/ai-bots/active/product', {
        ...aiProductForm,
        price: Number(aiProductForm.price) || 1000,
        stock: Number(aiProductForm.stock) || 20,
      });
      setAiProductResult(res.data?.message || 'تمت إضافة المنتج بنجاح');
      toast.success('تمت إضافة المنتج بنجاح');
      setAiProductForm({ name: '', description: '', price: '1000', stock: '20', category: 'topup', imageQuery: '' });
      setAiProductOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating AI product', error);
      setAiProductResult(error.response?.data?.message || 'تعذر إضافة المنتج');
      toast.error(error.response?.data?.message || 'تعذر إضافة المنتج');
    } finally {
      setAiProductLoading(false);
    }
  };

  const generateProductImage = async (e) => {
    e.preventDefault();
    if (!aiImagePrompt.trim()) {
      toast.error('اكتب وصف الصورة أولاً');
      return;
    }

    setAiImageLoading(true);
    setGeneratedImageUrl('');
    try {
      const response = await api.post('/admin/ai-bots/image/generate', { prompt: aiImagePrompt });
      setGeneratedImageUrl(response.data.imageUrl || '');
      setNewProduct((prev) => ({ ...prev, image: prev.image || response.data.imageUrl || '' }));
      toast.success('تم توليد الصورة بنجاح');
    } catch (error) {
      console.error('Error generating product image', error);
      toast.error(error.response?.data?.message || 'تعذر توليد الصورة');
    } finally {
      setAiImageLoading(false);
    }
  };

  const uploadProductImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAiImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/admin/ai-bots/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = response.data.imageUrl || '';
      setGeneratedImageUrl(uploadedUrl);
      setNewProduct((prev) => ({ ...prev, image: uploadedUrl }));
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading product image', error);
      toast.error(error.response?.data?.message || 'تعذر رفع الصورة');
    } finally {
      setUploadingAiImage(false);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name.ar || !newProduct.name.en || !newProduct.price || !newProduct.stock) {
      toast.error('الرجاء تعبئة الحقول الأساسية للمنتج');
      return;
    }

    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
        stock: parseInt(newProduct.stock, 10),
      };

      const response = await api.post('/admin/products', payload);
      const createdProduct = response.data?.product;
      setProducts((prev) => [createdProduct, ...prev]);
      setNewProduct({
        name: { ar: '', en: '' },
        category: 'topup',
        price: '',
        oldPrice: '',
        stock: '',
        image: '',
        badge: '',
        isFeatured: false,
        isActive: true,
      });
      setGeneratedImageUrl('');
      setAiImagePrompt('');
      setIsAddModalOpen(false);
      toast.success('✅ تم إضافة المنتج بنجاح');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('حدث خطأ في إضافة المنتج');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-[var(--text-muted)]" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-primary" /> : <FaSortDown className="text-primary" />;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchValue = normalizeText(searchTerm);
      const categoryLabel = categories.find((cat) => cat.value === product.category)?.label || product.category || '';
      const badgeLabel = product.badge === 'hot' ? 'حار hot' : product.badge === 'sale' ? 'تخفيض sale' : product.badge === 'new' ? 'جديد new' : product.badge || '';
      const matchesSearch = !searchValue || [
        product.name?.ar,
        product.name?.en,
        categoryLabel,
        badgeLabel,
        product.price,
        product.stock,
      ].some((field) => normalizeText(field).includes(searchValue));
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'active' && product.isActive) ||
                            (filterStatus === 'inactive' && !product.isActive);
      const matchesStock = filterStock === 'all' || 
        (filterStock === 'in_stock' && product.stock > 0) ||
        (filterStock === 'low_stock' && product.stock > 0 && product.stock <= 20) ||
        (filterStock === 'out_of_stock' && product.stock <= 0);
      const matchesFeatured = filterFeatured === 'all' ||
        (filterFeatured === 'featured' && product.isFeatured) ||
        (filterFeatured === 'not_featured' && !product.isFeatured);
      const priceValue = Number(product.price || 0);
      const minPriceValue = priceMin ? Number(priceMin) : null;
      const maxPriceValue = priceMax ? Number(priceMax) : null;
      const matchesPrice = (minPriceValue === null || priceValue >= minPriceValue) && (maxPriceValue === null || priceValue <= maxPriceValue);
      return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesFeatured && matchesPrice;
    });
  }, [products, searchTerm, filterCategory, filterStatus, filterStock, filterFeatured, priceMin, priceMax]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortField, sortDirection]);

  const productRecommendations = useMemo(() => {
    const suggestions = [];

    const lowStockProducts = products
      .filter((product) => product.stock > 0 && product.stock <= 20)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 2);

    lowStockProducts.forEach((product) => {
      suggestions.push({
        id: `low-stock-${product._id}`,
        title: product.name?.ar || product.name?.en || 'منتج غير معروف',
        reason: `المخزون منخفض جدًا (${product.stock} متبقٍ)`,
        tone: 'warning',
        actionLabel: 'مراجعة المخزون',
        action: () => viewProductDetails(product),
      });
    });

    const highViewsLowSales = products
      .filter((product) => (product.views || 0) >= 800 && (product.sales || 0) <= 20)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 2);

    highViewsLowSales.forEach((product) => {
      suggestions.push({
        id: `conversion-${product._id}`,
        title: product.name?.ar || product.name?.en || 'منتج غير معروف',
        reason: `مشاهدات مرتفعة (${product.views || 0}) لكن المبيعات منخفضة (${product.sales || 0})`,
        tone: 'info',
        actionLabel: 'تحسين العرض',
        action: () => viewProductDetails(product),
      });
    });

    const inactiveProducts = products
      .filter((product) => !product.isActive && (product.views || 0) >= 400)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 2);

    inactiveProducts.forEach((product) => {
      suggestions.push({
        id: `inactive-${product._id}`,
        title: product.name?.ar || product.name?.en || 'منتج غير معروف',
        reason: `المنتج غير نشط رغم وجود اهتمام به (${product.views || 0} مشاهدة)`,
        tone: 'danger',
        actionLabel: 'تفعيل المنتج',
        action: () => toggleProductStatus(product._id, product.isActive),
      });
    });

    const notFeaturedBestSellers = products
      .filter((product) => !product.isFeatured && (product.sales || 0) >= 25)
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 2);

    notFeaturedBestSellers.forEach((product) => {
      suggestions.push({
        id: `featured-${product._id}`,
        title: product.name?.ar || product.name?.en || 'منتج غير معروف',
        reason: `منتج قوي في المبيعات (${product.sales || 0}) ويستحق التمييز`,
        tone: 'success',
        actionLabel: 'تمييز المنتج',
        action: () => toggleFeatured(product._id, product.isFeatured),
      });
    });

    return suggestions.slice(0, 6);
  }, [products]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const paginationNumbers = useMemo(() => {
    const pageNumbers = [];
    const visibleRange = 2;
    const startPage = Math.max(1, currentPage - visibleRange);
    const endPage = Math.min(totalPages, currentPage + visibleRange);

    for (let page = startPage; page <= endPage; page += 1) {
      pageNumbers.push(page);
    }

    return pageNumbers;
  }, [currentPage, totalPages]);

  const exportProducts = async () => {
    try {
      const filtered = filteredProducts;
      const csv = [
        ['الاسم', 'التصنيف', 'السعر', 'السعر القديم', 'المخزون', 'الحالة', 'المميز', 'المبيعات', 'المشاهدات'],
        ...filtered.map(p => [p.name.ar, categories.find(c => c.value === p.category)?.label || p.category, p.price, p.oldPrice || '', p.stock, p.isActive ? 'نشط' : 'غير نشط', p.isFeatured ? 'نعم' : 'لا', p.sales || 0, p.views || 0])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تصدير المنتجات بنجاح');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('حدث خطأ في تصدير المنتجات');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
          <p className="text-sm text-[var(--text-secondary)]">إدارة جميع المنتجات في المتجر</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl btn-primary text-white text-sm flex items-center gap-2"
          >
            <FaPlus /> إضافة منتج
          </button>
          <button 
            onClick={() => setAiProductOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm flex items-center gap-2"
          >
            <FaPlus /> إنشاء بالذكاء الاصطناعي
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaPrint /> طباعة
          </button>
          <button 
            onClick={exportProducts}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
            <FaDownload /> تصدير
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
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

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input w-40 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input w-32 text-sm"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="form-input w-40 text-sm"
          >
            <option value="all">كل المخزون</option>
            <option value="in_stock">متوفر</option>
            <option value="low_stock">منخفض المخزون</option>
            <option value="out_of_stock">منتهي المخزون</option>
          </select>

          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value)}
            className="form-input w-40 text-sm"
          >
            <option value="all">كل المنتجات</option>
            <option value="featured">مميز</option>
            <option value="not_featured">غير مميز</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="أدنى سعر"
            className="form-input w-32 text-sm"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="أعلى سعر"
            className="form-input w-32 text-sm"
          />

          <div className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm flex items-center gap-2 text-[var(--text-secondary)]">
            <FaFilter /> فلترة فورية ومتقدمة
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
              setFilterStock('all');
              setFilterFeatured('all');
              setPriceMin('');
              setPriceMax('');
              toast.success('تم إعادة ضبط الفلاتر');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors text-sm flex items-center gap-2"
          >
              <FaTimes /> إعادة ضبط
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
        <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">
          النتائج: {sortedProducts.length}
        </span>
        <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">
          الصفحة: {currentPage} / {totalPages}
        </span>
        {searchTerm && <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">بحث: {searchTerm}</span>}
        {filterCategory !== 'all' && <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">تصنيف: {categories.find((c) => c.value === filterCategory)?.label || filterCategory}</span>}
        {filterStatus !== 'all' && <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">حالة: {filterStatus === 'active' ? 'نشط' : 'غير نشط'}</span>}
        {filterStock !== 'all' && <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">مخزون: {filterStock === 'in_stock' ? 'متوفر' : filterStock === 'low_stock' ? 'منخفض' : 'منتهي'}</span>}
        {filterFeatured !== 'all' && <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">مميز: {filterFeatured === 'featured' ? 'نعم' : 'لا'}</span>}
      </div>

      {selectedProductIds.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            تم تحديد {selectedProductIds.length} منتجًا
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => bulkToggleStatus(true)}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
            >
              تفعيل جماعي
            </button>
            <button
              onClick={() => bulkToggleStatus(false)}
              className="px-3 py-2 rounded-xl bg-red-500/15 text-red-500 text-sm font-semibold hover:bg-red-500/25 transition-colors"
            >
              تعطيل جماعي
            </button>
            <button
              onClick={() => bulkToggleFeatured(true)}
              className="px-3 py-2 rounded-xl bg-amber-500/15 text-amber-500 text-sm font-semibold hover:bg-amber-500/25 transition-colors"
            >
              تمييز جماعي
            </button>
            <button
              onClick={() => bulkToggleFeatured(false)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold hover:border-primary transition-colors"
            >
              إزالة التمييز
            </button>
            <button
              onClick={bulkDeleteProducts}
              className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <FaTrash /> حذف المحدد
            </button>
            <button
              onClick={selectVisibleProducts}
              className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold hover:border-primary transition-colors"
            >
              تحديد المعروض
            </button>
            <button
              onClick={clearSelectedProducts}
              className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold hover:border-primary transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FaStar className="text-amber-500" /> اقتراحات المنتجات الذكية
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">تُبنى الاقتراحات من المخزون، المشاهدات، المبيعات، وحالة النشاط</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
            {productRecommendations.length} اقتراح
          </span>
        </div>

        {productRecommendations.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            لا توجد اقتراحات حرجة حاليًا. الوضع التشغيلي جيد.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {productRecommendations.map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">{item.reason}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${item.tone === 'warning' ? 'bg-amber-500/20 text-amber-500' : item.tone === 'info' ? 'bg-sky-500/20 text-sky-500' : item.tone === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {item.tone === 'warning' ? 'مخزون' : item.tone === 'info' ? 'تحسين' : item.tone === 'danger' ? 'نشاط' : 'فرصة'}
                  </span>
                </div>
                <button
                  onClick={item.action}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)]"
                >
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {aiProductOpen && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">إنشاء منتج بالذكاء الاصطناعي</h3>
              <p className="text-sm text-[var(--text-secondary)]">أدخل بيانات المنتج وسيتولى البوت إضافته مع صورة وخطة تسويق</p>
            </div>
            <button onClick={() => setAiProductOpen(false)} className="rounded-lg p-2 hover:bg-[var(--bg-input)]">
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleAiCreateProduct} className="space-y-3">
            <input
              value={aiProductForm.name}
              onChange={(e) => setAiProductForm({ ...aiProductForm, name: e.target.value })}
              className="form-input w-full"
              placeholder="اسم المنتج"
            />
            <textarea
              value={aiProductForm.description}
              onChange={(e) => setAiProductForm({ ...aiProductForm, description: e.target.value })}
              rows="3"
              className="form-input w-full"
              placeholder="وصف المنتج"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="number"
                value={aiProductForm.price}
                onChange={(e) => setAiProductForm({ ...aiProductForm, price: e.target.value })}
                className="form-input w-full"
                placeholder="السعر"
              />
              <input
                type="number"
                value={aiProductForm.stock}
                onChange={(e) => setAiProductForm({ ...aiProductForm, stock: e.target.value })}
                className="form-input w-full"
                placeholder="المخزون"
              />
            </div>
            <select
              value={aiProductForm.category}
              onChange={(e) => setAiProductForm({ ...aiProductForm, category: e.target.value })}
              className="form-input w-full"
            >
              <option value="topup">Topup</option>
              <option value="giftcards">Gift Cards</option>
              <option value="cdkeys">CD Keys</option>
              <option value="gamecards">Game Cards</option>
              <option value="recharge">Recharge</option>
            </select>
            <input
              value={aiProductForm.imageQuery}
              onChange={(e) => setAiProductForm({ ...aiProductForm, imageQuery: e.target.value })}
              className="form-input w-full"
              placeholder="مثال: صورة منتج شحن أو كرت هدايا"
            />
            <button
              type="submit"
              disabled={aiProductLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {aiProductLoading ? 'جاري الإضافة...' : 'إنشاء المنتج بالذكاء الاصطناعي'}
            </button>
          </form>

          {aiProductResult && (
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-[var(--text-primary)] whitespace-pre-wrap">
              {aiProductResult}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm">
        <div className="text-[var(--text-secondary)]">
          يعرض {paginatedProducts.length} من {sortedProducts.length} منتج
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            السابق
          </button>

          {paginationNumbers[0] > 1 && (
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors"
            >
              1
            </button>
          )}

          {paginationNumbers[0] > 2 && <span className="px-2 text-[var(--text-secondary)]">...</span>}

          {paginationNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-xl border transition-colors ${page === currentPage ? 'bg-primary text-white border-primary' : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-primary'}`}
            >
              {page}
            </button>
          ))}

          {paginationNumbers[paginationNumbers.length - 1] < totalPages - 1 && <span className="px-2 text-[var(--text-secondary)]">...</span>}

          {paginationNumbers[paginationNumbers.length - 1] < totalPages && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProducts.map((product) => (
          <div key={product._id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-primary/30 transition-all group">
            <div className="relative">
              <label className="absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isProductSelected(product._id)}
                  onChange={() => toggleProductSelection(product._id)}
                  className="sr-only"
                />
                <span className={`flex h-5 w-5 items-center justify-center rounded border ${isProductSelected(product._id) ? 'border-primary bg-primary text-white' : 'border-white/70 bg-white/10'}`}>
                  {isProductSelected(product._id) && <FaCheck className="text-[10px]" />}
                </span>
              </label>
              <img
                src={product.image || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80'}
                alt={product.name?.ar || 'منتج'}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.badge && (
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                  product.badge === 'hot' ? 'bg-red-500' :
                  product.badge === 'sale' ? 'bg-amber-500' : 
                  product.badge === 'new' ? 'bg-emerald-500' :
                  'bg-primary'
                }`}>
                  {product.badge === 'hot' ? '🔥 حار' :
                   product.badge === 'sale' ? '🛒 تخفيض' :
                   product.badge === 'new' ? '✨ جديد' :
                   product.badge}
                </span>
              )}
              {product.isFeatured && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/80 text-white text-[10px] font-semibold">
                  <FaStar className="inline ml-1 text-[8px]" /> مميز
                </span>
              )}
              <button
                onClick={() => toggleProductStatus(product._id, product.isActive)}
                className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold ${
                  product.isActive ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'
                }`}
              >
                {product.isActive ? 'نشط' : 'غير نشط'}
              </button>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm line-clamp-1">{product.name?.ar || product.name}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-input)] flex items-center gap-1">
                  {categories.find(c => c.value === product.category)?.icon}
                  {categories.find(c => c.value === product.category)?.label || product.category}
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
                <span className="text-[var(--text-secondary)] flex items-center gap-1">
                  <FaShoppingCart className="text-[10px]" /> {product.sales || 0}
                </span>
                <span className="text-[var(--text-secondary)] flex items-center gap-1">
                  <FaEye className="text-[10px]" /> {product.views || 0}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => viewProductDetails(product)}
                  className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <FaEye className="text-[10px]" /> عرض
                </button>
                <button 
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <FaEdit className="text-[10px]" /> تعديل
                </button>
                <button
                  onClick={() => {
                    setProductToDelete(product);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <FaTrash className="text-[10px]" /> حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <FaBox className="text-3xl mx-auto mb-2 opacity-30" />
          <p>لا توجد منتجات مطابقة للبحث</p>
        </div>
      )}

      {sortedProducts.length > itemsPerPage && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm">
          <div className="text-[var(--text-secondary)]">
            تنقل سريع بين الصفحات لتخفيف الضغط على العرض عند ازدياد عدد المنتجات.
          </div>
          <button
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-primary transition-colors"
          >
            العودة للأول
          </button>
        </div>
      )}

      {/* Modal عرض تفاصيل المنتج */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaBox className="text-primary" />
                تفاصيل المنتج
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <img
                src={selectedProduct.image || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80'}
                alt={selectedProduct.name?.ar || 'منتج'}
                className="w-full h-48 object-cover rounded-xl"
              />
              
              <div>
                <h4 className="text-lg font-bold">{selectedProduct.name?.ar}</h4>
                {selectedProduct.name?.en && (
                  <p className="text-sm text-[var(--text-secondary)]">{selectedProduct.name.en}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-sm text-[var(--text-secondary)]">السعر</div>
                  <div className="text-xl font-bold text-primary">{formatCurrency(selectedProduct.price)}</div>
                  {selectedProduct.oldPrice && (
                    <div className="text-xs text-[var(--text-muted)] line-through">{formatCurrency(selectedProduct.oldPrice)}</div>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-sm text-[var(--text-secondary)]">المخزون</div>
                  <div className="text-xl font-bold">{selectedProduct.stock}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-sm text-[var(--text-secondary)]">المبيعات</div>
                  <div className="text-xl font-bold text-amber-500">{selectedProduct.sales || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] text-center">
                  <div className="text-sm text-[var(--text-secondary)]">المشاهدات</div>
                  <div className="text-xl font-bold text-blue-500">{selectedProduct.views || 0}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 py-2 border-b border-[var(--border-color)]">
                  <FaTag className="text-[var(--text-muted)]" />
                  <span>التصنيف: {categories.find(c => c.value === selectedProduct.category)?.label || selectedProduct.category}</span>
                </div>
                <div className="flex items-center gap-2 py-2 border-b border-[var(--border-color)]">
                  <FaClock className="text-[var(--text-muted)]" />
                  <span>تاريخ الإضافة: {new Date(selectedProduct.createdAt).toLocaleString('ar-DZ')}</span>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <FaCheck className="text-[var(--text-muted)]" />
                  <span>الحالة: {selectedProduct.isActive ? 'نشط' : 'غير نشط'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => toggleFeatured(selectedProduct._id, selectedProduct.isFeatured)}
                  className={`flex-1 py-2 rounded-lg ${
                    selectedProduct.isFeatured ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]/70'
                  } transition-colors text-sm font-semibold flex items-center justify-center gap-2`}
                >
                  <FaStar /> {selectedProduct.isFeatured ? 'إزالة المميز' : 'جعله مميز'}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    toast.info(`فتح نموذج تعديل المنتج ${selectedProduct.name.ar}`);
                  }}
                  className="flex-1 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FaEdit /> تعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal إضافة منتج */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaPlus className="text-primary" />
                إضافة منتج جديد
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] transition-colors flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 p-4 space-y-3">
                <div className="text-sm font-semibold text-primary">مولد/رفع الصورة</div>
                <form onSubmit={generateProductImage} className="space-y-2">
                  <textarea
                    value={aiImagePrompt}
                    onChange={(e) => setAiImagePrompt(e.target.value)}
                    className="form-input w-full min-h-[90px]"
                    placeholder="مثال: صورة منتج شحن جوال عصري بالألوان الزرقاء"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={aiImageLoading}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {aiImageLoading ? 'جاري التوليد...' : 'توليد صورة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiImagePrompt('');
                        setGeneratedImageUrl('');
                      }}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm"
                    >
                      مسح
                    </button>
                  </div>
                </form>
                <div className="space-y-2">
                  <label className="text-sm">أو ارفع صورة من جهازك</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadProductImageFile}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {uploadingAiImage && <div className="text-sm text-[var(--text-secondary)]">جاري رفع الصورة...</div>}
                </div>
                {generatedImageUrl && (
                  <div className="space-y-2">
                    <div className="text-sm text-[var(--text-secondary)]">معاينة الصورة</div>
                    <img src={generatedImageUrl} alt="Generated preview" className="h-36 w-full rounded-xl object-cover border border-[var(--border-color)]" />
                    <div className="text-xs text-[var(--text-secondary)]">سيتم استخدام هذه الصورة تلقائيًا في حقل الصورة أدناه</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="space-y-2 text-sm">
                  <span>اسم المنتج (عربي)</span>
                  <input
                    value={newProduct.name.ar}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: { ...prev.name, ar: e.target.value } }))}
                    className="form-input w-full"
                    placeholder="اسم المنتج بالعربية"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>اسم المنتج (English)</span>
                  <input
                    value={newProduct.name.en}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: { ...prev.name, en: e.target.value } }))}
                    className="form-input w-full"
                    placeholder="Product name in English"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>السعر</span>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="form-input w-full"
                    placeholder="0.00"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>السعر القديم</span>
                  <input
                    type="number"
                    value={newProduct.oldPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, oldPrice: e.target.value }))}
                    className="form-input w-full"
                    placeholder="0.00"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>المخزون</span>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                    className="form-input w-full"
                    placeholder="عدد الوحدات"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>الرابط أو صورة المنتج</span>
                  <input
                    value={newProduct.image}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                    className="form-input w-full"
                    placeholder="https://..."
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>التصنيف</span>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="form-input w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span>البانر</span>
                  <select
                    value={newProduct.badge}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, badge: e.target.value }))}
                    className="form-input w-full"
                  >
                    <option value="">لا شيء</option>
                    <option value="hot">🔥 حار</option>
                    <option value="sale">🛒 تخفيض</option>
                    <option value="new">✨ جديد</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm flex items-center gap-2 col-span-1 lg:col-span-2">
                  <input
                    type="checkbox"
                    checked={newProduct.isFeatured}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="form-checkbox"
                  />
                  <span>تعريف المنتج كمميز</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/80 transition-colors text-sm font-semibold"
                >
                  إلغاء
                </button>
                <button
                  onClick={addProduct}
                  className="px-4 py-2 rounded-xl btn-primary text-white text-sm font-semibold"
                >
                  حفظ المنتج
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal تأكيد الحذف */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-3xl">
                  <FaTrash />
                </div>
                <h3 className="text-xl font-bold mt-4">تأكيد الحذف</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  هل أنت متأكد من حذف المنتج <span className="font-bold text-primary">{productToDelete.name?.ar}</span>؟
                  <br />
                  <span className="text-xs text-red-500">هذا الإجراء لا يمكن التراجع عنه.</span>
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => deleteProduct(productToDelete._id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  حذف
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/70 transition-colors font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;