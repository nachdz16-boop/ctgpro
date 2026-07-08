import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, registerRestoreHandler } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const loadCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const res = await api.get('/cart');
        setCart(res.data.cart);
        setTotalItems(res.data.cart?.items?.reduce((sum, item) => sum + item.qty, 0) || 0);
      } else {
        const localCart = JSON.parse(localStorage.getItem('ctgpro_cart') || '[]');
        setCart({ items: localCart });
        setTotalItems(localCart.reduce((sum, item) => sum + item.qty, 0));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart(null);
      setTotalItems(0);
      setLoading(false);
    }
  }, [isAuthenticated, loadCart]);

  useEffect(() => {
    if (!registerRestoreHandler) return;
    const unregister = registerRestoreHandler(loadCart);
    return () => unregister();
  }, [loadCart, registerRestoreHandler]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isAuthenticated) return;

    const handleCartUpdated = (payload) => {
      if (!payload?.cart) return;
      setCart(payload.cart);
      setTotalItems(payload.cart?.items?.reduce((sum, item) => sum + item.qty, 0) || 0);
      toast.success('🛒 تم تحديث السلة تلقائياً');
    };

    const handleSocketConnect = () => {
      loadCart();
      toast.success('🔄 تم استعادة الاتصال بالسلة');
    };

    const handleSocketReconnect = () => {
      loadCart();
      toast.success('🔄 تم إعادة الاتصال بالسلة');
    };

    socket.on('cart_updated', handleCartUpdated);
    socket.on('connect', handleSocketConnect);
    socket.on('reconnect', handleSocketReconnect);

    return () => {
      socket.off('cart_updated', handleCartUpdated);
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect', handleSocketReconnect);
    };
  }, [isAuthenticated]);

  const addToCart = async (productId, qty = 1) => {
    try {
      const token = localStorage.getItem('ctgpro_token');
      if (token) {
        const res = await api.post('/cart', { productId, qty });
        setCart(res.data.cart);
        setTotalItems(res.data.cart?.items?.reduce((sum, item) => sum + item.qty, 0) || 0);
        toast.success('✅ تمت إضافة المنتج إلى السلة');
        return { success: true };
      } else {
        toast.error('يرجى تسجيل الدخول لإضافة المنتج إلى السلة');
        return { success: false };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('ctgpro_token');
      if (token) {
        await api.delete(`/cart/${productId}`);
        await loadCart();
        toast.success('🗑️ تمت إزالة المنتج');
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const getTotal = useCallback(() => {
    if (!cart?.items?.length) return 0;

    return cart.items.reduce((sum, item) => {
      const qty = Number(item?.qty) || 0;
      const price = Number(item?.price ?? item?.productId?.price) || 0;
      return sum + qty * price;
    }, 0);
  }, [cart]);

  const value = {
    cart,
    loading,
    totalItems,
    getTotal,
    addToCart,
    removeFromCart,
    refreshCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};