const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getReports,
  getActivityLogs,
  getAdminNotes,
  createAdminNote,
  deleteAdminNote,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getSystemStatus,
  getUsers,
  getRecentUsers,
  updateUserStatus,
  getSellers,
  createSeller,
  updateSellerStatus,
  deleteSeller,
  getOrders,
  getRecentOrders,
  getPages,
  createPage,
  updatePage,
  deletePage,
  getGiftCards,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getAdminProductCodes,
  createAdminProductCode,
  updateAdminProductCode,
  deleteAdminProductCode,
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getNotifications,
  createNotification,
  updateNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getCarouselItems,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getNavigationMenus,
  createNavigationMenu,
  updateNavigationMenu,
  deleteNavigationMenu,
  getHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  getSocialSettings,
  updateSocialSettings,
  getApis,
  getApiKeys,
  getApiLogs,
  createApi,
  updateApi,
  deleteApi,
  toggleApiStatus,
  regenerateApiKey,
  getStoreData,
  updateStoreData,
  getStoreFiles,
  uploadStoreFile,
  deleteStoreFile,
  getStoreLogs,
  getStoreBackups,
  createStoreBackup,
  restoreStoreBackup,
  deleteStoreBackup,
  downloadStoreBackup,
  updateStore2FA,
  getErrorLogs,
  getPaymentGateways,
  createPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
} = require('../controllers/adminController');
const { uploadAvatar, updateProfile, changePassword, exportProfile, deleteProfile } = require('../controllers/authController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Stats
router.get('/stats', getStats);
router.get('/reports', getReports);
router.get('/activity-logs', getActivityLogs);
router.get('/notes', getAdminNotes);
router.post('/notes', createAdminNote);
router.delete('/notes/:id', deleteAdminNote);
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.get('/system-status', getSystemStatus);

// Users
router.get('/users', getUsers);
router.get('/users/recent', getRecentUsers);
router.put('/users/:id/status', updateUserStatus);

// Sellers
router.get('/sellers', getSellers);
router.post('/sellers', createSeller);
router.put('/sellers/:id/status', updateSellerStatus);
router.delete('/sellers/:id', deleteSeller);

// Orders
router.get('/orders', getOrders);
router.get('/orders/recent', getRecentOrders);

// Pages
router.get('/pages', getPages);
router.post('/pages', createPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

// Gift Cards
router.get('/gift-cards', getGiftCards);
router.post('/gift-cards', createGiftCard);
router.put('/gift-cards/:id', updateGiftCard);
router.delete('/gift-cards/:id', deleteGiftCard);

// Promo Codes
router.get('/promo-codes', getPromoCodes);
router.post('/promo-codes', createPromoCode);
router.put('/promo-codes/:id', updatePromoCode);
router.delete('/promo-codes/:id', deletePromoCode);
router.get('/product-codes', getAdminProductCodes);
router.post('/product-codes', createAdminProductCode);
router.put('/product-codes/:id', updateAdminProductCode);
router.delete('/product-codes/:id', deleteAdminProductCode);

// Blog Posts
router.get('/blog-posts', getBlogPosts);
router.post('/blog-posts', createBlogPost);
router.put('/blog-posts/:id', updateBlogPost);
router.delete('/blog-posts/:id', deleteBlogPost);

// Notifications
router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.put('/notifications/:id', updateNotification);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);
router.delete('/notifications/:id', deleteNotification);

// Carousel Items
router.get('/carousel-items', getCarouselItems);
router.post('/carousel-items', createCarouselItem);
router.put('/carousel-items/:id', updateCarouselItem);
router.delete('/carousel-items/:id', deleteCarouselItem);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Navigation Menus
router.get('/navigation-menus', getNavigationMenus);
router.post('/navigation-menus', createNavigationMenu);
router.put('/navigation-menus/:id', updateNavigationMenu);
router.delete('/navigation-menus/:id', deleteNavigationMenu);

// Homepage Sections
router.get('/homepage-sections', getHomepageSections);
router.post('/homepage-sections', createHomepageSection);
router.put('/homepage-sections/:id', updateHomepageSection);
router.delete('/homepage-sections/:id', deleteHomepageSection);

// Social Settings
router.get('/social-settings', getSocialSettings);
router.put('/social-settings', updateSocialSettings);

// Admin Profile
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);
router.get('/profile/export', exportProfile);
router.delete('/profile', deleteProfile);

// APIs Management
router.get('/apis', getApis);
router.get('/apis/keys', getApiKeys);
router.get('/apis/:id/logs', getApiLogs);
router.post('/apis', createApi);
router.put('/apis/:id', updateApi);
router.delete('/apis/:id', deleteApi);
router.patch('/apis/:id/toggle', toggleApiStatus);
router.post('/apis/:id/regenerate-key', regenerateApiKey);

// Payment gateways
router.get('/payment-gateways', getPaymentGateways);
router.post('/payment-gateways', createPaymentGateway);
router.put('/payment-gateways/:id', updatePaymentGateway);
router.delete('/payment-gateways/:id', deletePaymentGateway);

// Store Management
router.get('/store', getStoreData);
router.put('/store', updateStoreData);
router.get('/store/files', getStoreFiles);
router.post('/store/files/upload', upload.single('file'), uploadStoreFile);
router.delete('/store/files/:id', deleteStoreFile);
router.get('/store/logs', getStoreLogs);
router.get('/store/backups', getStoreBackups);
router.post('/store/backups', createStoreBackup);
router.post('/store/backups/:id/restore', restoreStoreBackup);
router.delete('/store/backups/:id', deleteStoreBackup);
router.get('/store/backups/:id/download', downloadStoreBackup);
router.put('/store/2fa', updateStore2FA);

// Error logs
router.get('/errors', getErrorLogs);

module.exports = router;