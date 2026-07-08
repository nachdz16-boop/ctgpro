import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const defaultWalletState = {
  balance: 0,
  cryptoBalances: { BTC: 0, ETH: 0, USDT: 0 },
  totalDeposits: 0,
  totalWithdrawals: 0,
};

export const WalletProvider = ({ children }) => {
  const { isAuthenticated, registerRestoreHandler } = useAuth();
  const [wallet, setWallet] = useState(defaultWalletState);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWalletData = useCallback(async () => {
    setLoading(true);
    try {
      if (!isAuthenticated) {
        setWallet(defaultWalletState);
        setTransactions([]);
        return;
      }

      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
      ]);

      setWallet(walletRes.data.wallet || defaultWalletState);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setWallet(defaultWalletState);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWalletData();
    } else {
      setWallet(defaultWalletState);
      setTransactions([]);
      setLoading(false);
    }
  }, [isAuthenticated, loadWalletData]);

  useEffect(() => {
    if (!registerRestoreHandler) return;
    const unregister = registerRestoreHandler(loadWalletData);
    return () => unregister();
  }, [loadWalletData, registerRestoreHandler]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleWalletUpdated = (payload) => {
      if (!payload?.wallet) return;
      setWallet(payload.wallet);
      toast.success('💰 تم تحديث بيانات المحفظة تلقائياً');
    };

    const handleSocketConnect = () => {
      loadWalletData();
      toast.success('🔄 تم استعادة الاتصال بالمحفظة');
    };

    const handleSocketReconnect = () => {
      loadWalletData();
      toast.success('🔄 تم إعادة الاتصال بالمحفظة');
    };

    socket.on('wallet_updated', handleWalletUpdated);
    socket.on('connect', handleSocketConnect);
    socket.on('reconnect', handleSocketReconnect);

    return () => {
      socket.off('wallet_updated', handleWalletUpdated);
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect', handleSocketReconnect);
    };
  }, [isAuthenticated, loadWalletData]);

  const value = {
    wallet,
    transactions,
    loading,
    refreshWallet: loadWalletData,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export default WalletContext;
