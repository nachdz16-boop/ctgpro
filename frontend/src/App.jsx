// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import { WalletProvider } from './context/WalletContext';

// Common Components
import Loader from './components/common/Loader';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import WhatsAppButton from './components/common/WhatsAppButton';
import ScrollToTop from './components/common/ScrollToTop';
import StoreBot from './components/common/StoreBot';
import './index.css';

// ===== Admin Components (منفصل تماماً عن المتجر) =====
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminOverview = lazy(() => import('./components/admin/dashboard/AdminOverview'));
const UsersManagement = lazy(() => import('./components/admin/dashboard/UsersManagement'));
const ProductsManagement = lazy(() => import('./components/admin/dashboard/ProductsManagement'));
const CodesManagement = lazy(() => import('./components/admin/dashboard/CodesManagement'));
const OrdersManagement = lazy(() => import('./components/admin/dashboard/OrdersManagement'));
const PaymentManagement = lazy(() => import('./components/admin/dashboard/PaymentManagement'));
const SocialManagement = lazy(() => import('./components/admin/dashboard/SocialManagement'));
const StoreManagement = lazy(() => import('./components/admin/dashboard/StoreManagement'));
const ErrorMonitor = lazy(() => import('./components/admin/dashboard/ErrorMonitor'));
const SellersManagement = lazy(() => import('./components/admin/dashboard/SellersManagement'));
const AdsBotManagement = lazy(() => import('./components/admin/dashboard/AdsBotManagement'));
const AiBotManagement = lazy(() => import('./components/admin/dashboard/AiBotManagement'));
const ApisManagement = lazy(() => import('./components/admin/dashboard/ApisManagement'));
const ChatBotManagement = lazy(() => import('./components/admin/dashboard/ChatBotManagement'));
const NotificationsManagement = lazy(() => import('./components/admin/dashboard/NotificationsManagement'));
const DisputesManagement = lazy(() => import('./components/admin/dashboard/DisputesManagement'));
const FinanceInventoryZakat = lazy(() => import('./components/admin/dashboard/FinanceInventoryZakat'));
const AdminProfile = lazy(() => import('./components/admin/AdminProfile'));
const AdminReports = lazy(() => import('./components/admin/AdminReports'));
const DisputeDetails = lazy(() => import('./components/admin/dashboard/DisputeDetails'));

// ===== User Components =====
const UserDashboard = lazy(() => import('./components/user/UserDashboard'));

// ===== Seller Components =====
const SellerDashboard = lazy(() => import('./components/seller/SellerDashboard'));
const SellerProducts = lazy(() => import('./components/seller/SellerProducts'));

// ===== Lazy load pages (المتجر) =====
const Home = lazy(() => import('./components/pages/Home'));
const Shop = lazy(() => import('./components/pages/Shop'));
const About = lazy(() => import('./components/pages/About'));
const Contact = lazy(() => import('./components/pages/Contact'));
const FAQ = lazy(() => import('./components/pages/FAQ'));
const Support = lazy(() => import('./components/pages/Support'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const ProductDetails = lazy(() => import('./components/pages/ProductDetails'));
const Wishlist = lazy(() => import('./components/user/Wishlist'));
const Orders = lazy(() => import('./components/user/Orders'));
const Profile = lazy(() => import('./components/user/Profile'));
const Wallet = lazy(() => import('./components/pages/Wallet'));
const Checkout = lazy(() => import('./components/cart/Checkout'));
const Recharge = lazy(() => import('./components/pages/Recharge'));
const Terms = lazy(() => import('./components/pages/Terms'));
const Privacy = lazy(() => import('./components/pages/Privacy'));
const Refund = lazy(() => import('./components/pages/Refund'));

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CartProvider>
                <WalletProvider>
                  <NotificationProvider>
                    <Toaster 
                    position="top-center"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                      },
                    }}
                  />
                  <div 
                    className="min-h-screen flex flex-col" 
                    style={{ 
                      background: 'var(--bg-primary)', 
                      color: 'var(--text-primary)' 
                    }}
                  >
                    {!isAdminRoute && <Navbar />}
                    <main className="flex-1">
                      <div className={isAdminRoute ? 'w-full' : 'container-fluid py-4'}>
                        <Suspense fallback={<Loader />}>
                          <Routes>
                            {/* ===== صفحات المتجر ===== */}
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/product/:id" element={<ProductDetails />} />
                            <Route path="/recharge" element={<Recharge />} />
                            <Route path="/wallet" element={
                              <ProtectedRoute>
                                <Wallet />
                              </ProtectedRoute>
                            } />
                            
                            {/* ===== صفحات المعلومات ===== */}
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/refund" element={<Refund />} />
                            
                            {/* ===== المصادقة ===== */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            
                            {/* ===== صفحات المستخدم المحمية ===== */}
                            <Route path="/wishlist" element={
                              <ProtectedRoute>
                                <Wishlist />
                              </ProtectedRoute>
                            } />
                            <Route path="/orders" element={
                              <ProtectedRoute>
                                <Orders />
                              </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            } />
                            <Route path="/dashboard" element={
                              <ProtectedRoute>
                                <UserDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/checkout" element={
                              <ProtectedRoute>
                                <Checkout />
                              </ProtectedRoute>
                            } />
                            
                            {/* ===== لوحة البائع (داخل المتجر) ===== */}
                            <Route path="/seller" element={
                              <ProtectedRoute roles={['seller', 'admin']}>
                                <SellerDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/seller/products" element={
                              <ProtectedRoute roles={['seller', 'admin']}>
                                <SellerProducts />
                              </ProtectedRoute>
                            } />
                            
                            {/* ===== لوحة التحكم (Admin) - منفصلة تماماً ===== */}
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route path="/admin" element={
                              <ProtectedRoute roles={['admin', 'super_admin']}>
                                <AdminLayout />
                              </ProtectedRoute>
                            }>
                              <Route index element={<AdminOverview />} />
                              <Route path="profile" element={<AdminProfile />} />
                              <Route path="reports" element={<AdminReports />} />
                              <Route path="users" element={<UsersManagement />} />
                              <Route path="sellers" element={<SellersManagement />} />
                              <Route path="products" element={<ProductsManagement />} />
                              <Route path="orders" element={<OrdersManagement />} />
                              <Route path="codes" element={<CodesManagement />} />
                              <Route path="payment" element={<PaymentManagement />} />
                              <Route path="finance" element={<FinanceInventoryZakat />} />
                              <Route path="social" element={<SocialManagement />} />
                              <Route path="store" element={<StoreManagement />} />
                              <Route path="settings" element={<StoreManagement />} />
                              <Route path="errors" element={<ErrorMonitor />} />
                              <Route path="ads" element={<AdsBotManagement />} />
                              <Route path="ai-bots" element={<AiBotManagement />} />
                              <Route path="chatbots" element={<ChatBotManagement />} />
                              <Route path="apis" element={<ApisManagement />} />
                              <Route path="notifications" element={<NotificationsManagement />} />
                              <Route path="disputes" element={<DisputesManagement />} />
                              <Route path="disputes/:id" element={<DisputeDetails />} />
                            </Route>
                            
                            {/* ===== 404 ===== */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Suspense>
                      </div>
                    </main>
                    {!isAdminRoute && <Footer />}
                    {!isAdminRoute && <StoreBot />}
                    {!isAdminRoute && <WhatsAppButton />}
                    {!isAdminRoute && <ScrollToTop />}
                  </div>
                </NotificationProvider>
              </WalletProvider>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </SettingsProvider>
  </QueryClientProvider>
  );
}

export default App;