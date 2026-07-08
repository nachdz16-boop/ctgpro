import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

// ===== العملات المدعومة =====
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'دولار أمريكي', rate: 1, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'يورو', rate: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'جنيه إسترليني', rate: 0.79, flag: '🇬🇧' },
  DZD: { code: 'DZD', symbol: 'دج', name: 'دينار جزائري', rate: 135.0, flag: '🇩🇿' },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rate: 3.75, flag: '🇸🇦' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', rate: 3.67, flag: '🇦🇪' },
  BTC: { code: 'BTC', symbol: '₿', name: 'بيتكوين', rate: 0.000015, flag: '₿' },
  ETH: { code: 'ETH', symbol: 'Ξ', name: 'إيثريوم', rate: 0.00023, flag: 'Ξ' },
  USDT: { code: 'USDT', symbol: '₮', name: 'Tether', rate: 1, flag: '₮' },
};

// ===== اللغات المدعومة مع الأعلام =====
export const SUPPORTED_LANGUAGES = {
  ar: {
    code: 'ar',
    name: 'العربية (الجزائر)',
    flag: '🇩🇿',
    dir: 'rtl',
  },
  en: {
    code: 'en',
    name: 'English (UK)',
    flag: '🇬🇧',
    dir: 'ltr',
  },
  fr: {
    code: 'fr',
    name: 'Français (France)',
    flag: '🇫🇷',
    dir: 'ltr',
  },
};

// ===== الترجمات الكاملة =====
const translations = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.shop': 'المتجر',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.support': 'الدعم',
    'nav.faq': 'الأسئلة الشائعة',
    'nav.topup': 'شحن ألعاب',
    'nav.giftcards': 'بطاقات هدايا',
    'nav.cdkeys': 'مفاتيح CD',
    'nav.gamecards': 'اشتراكات',
    'nav.recharge': 'شحن سريع',
    'nav.wishlist': 'المفضلة',
    'nav.cart': 'السلة',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'حساب جديد',
    'nav.logout': 'خروج',
    'nav.search': 'بحث',
    'nav.search_placeholder': 'ابحث عن شحن، بطاقات، مفاتيح ألعاب...',
    'nav.dashboard': 'لوحتي',
    'nav.seller_dashboard': 'لوحة البائع',
    'nav.currency': 'العملة',
    'nav.language': 'اللغة',
    
    // Common
    'common.add_to_cart': 'أضف للسلة',
    'common.buy_now': 'شراء الآن',
    'common.out_of_stock': 'نفد',
    'common.in_stock': 'متوفر',
    'common.only_left': 'متبقي',
    'common.quick_view': 'معاينة سريعة',
    'common.view_all': 'عرض الكل',
    'common.total': 'الإجمالي',
    'common.checkout': 'إتمام الشراء',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
    'common.continue': 'متابعة',
    'common.loading': 'جاري التحميل...',
    'common.no_results': 'لا توجد نتائج',
    'common.search_results': 'نتائج البحث',
    'common.secure_payment': 'مدفوعات آمنة 100%',
    'common.copied': 'تم النسخ',
    'common.share': 'مشاركة',
    
    // Product
    'product.price': 'السعر',
    'product.platform': 'المنصة',
    'product.delivery': 'التوصيل',
    'product.stock': 'المخزون',
    'product.rating': 'التقييم',
    'product.reviews': 'مراجعات',
    'product.description': 'وصف المنتج',
    'product.seller': 'البائع',
    'product.quantity': 'الكمية',
    'product.discount': 'خصم',
    
    // Auth
    'auth.login_title': 'تسجيل الدخول',
    'auth.login_desc': 'مرحباً بعودتك! قم بتسجيل الدخول إلى حسابك',
    'auth.register_title': 'إنشاء حساب',
    'auth.register_desc': 'انضم إلى CTGPRO واستمتع بتجربة شحن فريدة',
    'auth.email_or_phone': 'البريد الإلكتروني أو رقم الهاتف',
    'auth.password': 'كلمة المرور',
    'auth.confirm_password': 'تأكيد كلمة المرور',
    'auth.remember_me': 'تذكرني',
    'auth.forgot_password': 'نسيت كلمة المرور؟',
    'auth.no_account': 'ليس لديك حساب؟',
    'auth.have_account': 'لديك حساب بالفعل؟',
    'auth.full_name': 'الاسم الكامل',
    'auth.phone': 'رقم الهاتف',
    'auth.reset_password': 'إعادة تعيين كلمة المرور',
    'auth.reset_password_desc': 'أدخل كلمة المرور الجديدة',
    
    // Profile
    'profile.title': 'الملف الشخصي',
    'profile.personal_info': 'المعلومات الشخصية',
    'profile.full_name': 'الاسم الكامل',
    'profile.phone': 'رقم الهاتف',
    'profile.email': 'البريد الإلكتروني',
    'profile.address': 'العنوان',
    'profile.street': 'الشارع',
    'profile.city': 'المدينة',
    'profile.state': 'الولاية',
    'profile.zip_code': 'الرمز البريدي',
    'profile.country': 'الدولة',
    'profile.account_preferences': 'تفضيلات الحساب',
    'profile.language': 'اللغة',
    'profile.currency': 'العملة',
    'profile.theme': 'الوضع',
    'profile.notifications': 'إشعارات الحساب',
    'profile.save_changes': 'حفظ التغييرات',
    'profile.saving': 'جاري الحفظ...',
    'profile.updated_success': '✅ تم تحديث الملف الشخصي بنجاح',
    'profile.save_error': 'حدث خطأ أثناء حفظ التغييرات',
    
    // Cart
    'cart.empty': 'السلة فارغة',
    'cart.title': 'سلة التسوق',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.discount': 'الخصم',
    'cart.coupon': 'كود الخصم',
    'cart.apply_coupon': 'تطبيق',
    'cart.remove_coupon': 'إلغاء',
    'cart.checkout': 'إتمام الشراء',
    
    // Orders
    'orders.title': 'طلباتي',
    'orders.no_orders': 'لا توجد طلبات',
    'orders.order': 'طلب',
    'orders.order_number': 'رقم الطلب',
    'orders.date': 'التاريخ',
    'orders.status': 'الحالة',
    'orders.pending': 'قيد المعالجة',
    'orders.processing': 'جاري التجهيز',
    'orders.shipped': 'تم الشحن',
    'orders.completed': 'مكتمل',
    'orders.cancelled': 'ملغي',
    'orders.refunded': 'مسترجع',
    
    // Payment
    'payment.title': 'طرق الدفع',
    'payment.wallet': 'المحفظة الرقمية',
    'payment.crypto': 'العملات الرقمية',
    'payment.balance': 'الرصيد',
    'payment.deposit': 'إيداع',
    'payment.withdraw': 'سحب',
    'payment.transfer': 'تحويل',
    'payment.history': 'سجل المعاملات',
    'payment.bitcoin': 'بيتكوين',
    'payment.ethereum': 'إيثريوم',
    'payment.usdt': 'Tether (USDT)',
    'payment.paypal': 'PayPal',
    'payment.card': 'بطاقة ائتمان',
    
    // Wallet
    'wallet.title': 'محفظتي',
    'wallet.balance': 'الرصيد الحالي',
    'wallet.crypto_balance': 'رصيد العملات الرقمية',
    'wallet.deposit': 'إيداع',
    'wallet.withdraw': 'سحب',
    'wallet.transactions': 'المعاملات',
    'wallet.address': 'عنوان المحفظة',
    'wallet.copy_address': 'نسخ العنوان',
    
    // Notifications
    'notifications.title': 'الإشعارات',
    'notifications.mark_all_read': 'تحديد الكل كمقروء',
    'notifications.no_notifications': 'لا توجد إشعارات',
    'notifications.order_created': 'تم إنشاء طلب جديد',
    'notifications.order_updated': 'تم تحديث الطلب',
    'notifications.payment_received': 'تم استلام الدفع',
    'notifications.payment_failed': 'فشل الدفع',
    'notifications.wallet_credited': 'تم إيداع الرصيد',
    'notifications.wallet_debited': 'تم خصم الرصيد',
    'notifications.new_message': 'رسالة جديدة',
    'notifications.offer_available': 'عرض جديد متاح',
    
    // Footer
    'footer.quick_links': 'روابط سريعة',
    'footer.support': 'الدعم',
    'footer.terms': 'الشروط والأحكام',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.refund': 'سياسة الاسترجاع',
    'footer.copyright': 'جميع الحقوق محفوظة',
    
    // Contact
    'contact.title': 'اتصل بنا',
    'contact.desc': 'نحن هنا لمساعدتك',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.whatsapp': 'واتساب',
    'contact.send_message': 'أرسل رسالة',
    'contact.message': 'رسالتك',
    'contact.subject': 'الموضوع',
    'contact.send': 'إرسال',
    'contact.sent': 'تم الإرسال',
    'contact.thanks': 'شكراً لتواصلك معنا',
    
    // Support
    'support.title': 'مركز الدعم',
    'support.live_chat': 'دردشة مباشرة',
    'support.chat_desc': 'تحدث مع فريق الدعم',
    'support.start_chat': 'ابدأ المحادثة',
    
    // Recharge
    'recharge.title': 'شحن سريع',
    'recharge.desc': 'شحن فوري للألعاب والرصيد',
    'recharge.select_operator': 'اختر المشغل',
    'recharge.select_amount': 'اختر المبلغ',
    'recharge.phone_number': 'رقم الهاتف',
    'recharge.order_summary': 'ملخص الطلب',
    'recharge.operator': 'المشغل',
    'recharge.amount': 'المبلغ',
    'recharge.price': 'السعر',
    'recharge.confirm': 'تأكيد',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.users': 'المستخدمين',
    'admin.products': 'المنتجات',
    'admin.orders': 'الطلبات',
    'admin.payments': 'المدفوعات',
    'admin.wallets': 'المحافظ',
    'admin.settings': 'الإعدادات',
    'admin.notifications': 'الإشعارات',
    'admin.codes': 'الأكواد',
    'admin.giftcards': 'بطاقات الهدايا',
    'admin.offers': 'العروض',
    'admin.social': 'وسائل التواصل',
    'admin.chatbot': 'الشاربوت',
    'admin.sections': 'أقسام الموقع',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.about': 'About Us',
    'nav.contact': 'Contact Us',
    'nav.support': 'Support',
    'nav.faq': 'FAQ',
    'nav.topup': 'Game Top-up',
    'nav.giftcards': 'Gift Cards',
    'nav.cdkeys': 'CD Keys',
    'nav.gamecards': 'Subscriptions',
    'nav.recharge': 'Quick Recharge',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Cart',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.search': 'Search',
    'nav.search_placeholder': 'Search for top-up, gift cards, game keys...',
    'nav.dashboard': 'Dashboard',
    'nav.seller_dashboard': 'Seller Dashboard',
    'nav.currency': 'Currency',
    'nav.language': 'Language',
    
    // Common
    'common.add_to_cart': 'Add to Cart',
    'common.buy_now': 'Buy Now',
    'common.out_of_stock': 'Out of Stock',
    'common.in_stock': 'In Stock',
    'common.only_left': 'left',
    'common.quick_view': 'Quick View',
    'common.view_all': 'View All',
    'common.total': 'Total',
    'common.checkout': 'Checkout',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.continue': 'Continue',
    'common.loading': 'Loading...',
    'common.no_results': 'No results found',
    'common.search_results': 'Search Results',
    'common.secure_payment': '100% Secure Payments',
    'common.copied': 'Copied',
    'common.share': 'Share',
    
    // Product
    'product.price': 'Price',
    'product.platform': 'Platform',
    'product.delivery': 'Delivery',
    'product.stock': 'Stock',
    'product.rating': 'Rating',
    'product.reviews': 'Reviews',
    'product.description': 'Description',
    'product.seller': 'Seller',
    'product.quantity': 'Quantity',
    'product.discount': 'Discount',
    
    // Auth
    'auth.login_title': 'Sign In',
    'auth.login_desc': 'Welcome back! Sign in to your account',
    'auth.register_title': 'Create Account',
    'auth.register_desc': 'Join CTGPRO and enjoy a unique top-up experience',
    'auth.email_or_phone': 'Email or Phone Number',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.remember_me': 'Remember me',
    'auth.forgot_password': 'Forgot Password?',
    'auth.no_account': "Don't have an account?",
    'auth.have_account': 'Already have an account?',
    'auth.full_name': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.reset_password': 'Reset Password',
    'auth.reset_password_desc': 'Enter your new password',
    
    // Profile
    'profile.title': 'Profile',
    'profile.personal_info': 'Personal Information',
    'profile.full_name': 'Full Name',
    'profile.phone': 'Phone Number',
    'profile.email': 'Email Address',
    'profile.address': 'Address',
    'profile.street': 'Street',
    'profile.city': 'City',
    'profile.state': 'State',
    'profile.zip_code': 'Postal Code',
    'profile.country': 'Country',
    'profile.account_preferences': 'Account Preferences',
    'profile.language': 'Language',
    'profile.currency': 'Currency',
    'profile.theme': 'Theme',
    'profile.notifications': 'Account Notifications',
    'profile.save_changes': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.updated_success': '✅ Profile updated successfully',
    'profile.save_error': 'An error occurred while saving changes',
    'profile.role': 'Role',
    'profile.role_admin': 'Admin',
    'profile.role_seller': 'Seller',
    'profile.role_user': 'User',
    
    // Cart
    'cart.empty': 'Cart is empty',
    'cart.title': 'Shopping Cart',
    'cart.subtotal': 'Subtotal',
    'cart.discount': 'Discount',
    'cart.coupon': 'Coupon Code',
    'cart.apply_coupon': 'Apply',
    'cart.remove_coupon': 'Remove',
    'cart.checkout': 'Checkout',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.no_orders': 'No orders found',
    'orders.order': 'Order',
    'orders.order_number': 'Order Number',
    'orders.date': 'Date',
    'orders.status': 'Status',
    'orders.pending': 'Pending',
    'orders.processing': 'Processing',
    'orders.shipped': 'Shipped',
    'orders.completed': 'Completed',
    'orders.cancelled': 'Cancelled',
    'orders.refunded': 'Refunded',
    
    // Payment
    'payment.title': 'Payment Methods',
    'payment.wallet': 'Digital Wallet',
    'payment.crypto': 'Cryptocurrency',
    'payment.balance': 'Balance',
    'payment.deposit': 'Deposit',
    'payment.withdraw': 'Withdraw',
    'payment.transfer': 'Transfer',
    'payment.history': 'Transaction History',
    'payment.bitcoin': 'Bitcoin',
    'payment.ethereum': 'Ethereum',
    'payment.usdt': 'Tether (USDT)',
    'payment.paypal': 'PayPal',
    'payment.card': 'Credit Card',
    
    // Wallet
    'wallet.title': 'My Wallet',
    'wallet.balance': 'Current Balance',
    'wallet.crypto_balance': 'Crypto Balance',
    'wallet.deposit': 'Deposit',
    'wallet.withdraw': 'Withdraw',
    'wallet.transactions': 'Transactions',
    'wallet.address': 'Wallet Address',
    'wallet.copy_address': 'Copy Address',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Mark all as read',
    'notifications.no_notifications': 'No notifications',
    'notifications.order_created': 'New order created',
    'notifications.order_updated': 'Order updated',
    'notifications.payment_received': 'Payment received',
    'notifications.payment_failed': 'Payment failed',
    'notifications.wallet_credited': 'Wallet credited',
    'notifications.wallet_debited': 'Wallet debited',
    'notifications.new_message': 'New message',
    'notifications.offer_available': 'New offer available',
    
    // Footer
    'footer.quick_links': 'Quick Links',
    'footer.support': 'Support',
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',
    'footer.refund': 'Refund Policy',
    'footer.copyright': 'All rights reserved',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.desc': "We're here to help",
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.whatsapp': 'WhatsApp',
    'contact.send_message': 'Send a message',
    'contact.message': 'Your Message',
    'contact.subject': 'Subject',
    'contact.send': 'Send',
    'contact.sent': 'Sent',
    'contact.thanks': 'Thank you for contacting us',
    
    // Support
    'support.title': 'Support Center',
    'support.live_chat': 'Live Chat',
    'support.chat_desc': 'Talk to support team',
    'support.start_chat': 'Start Chat',
    
    // Recharge
    'recharge.title': 'Quick Recharge',
    'recharge.desc': 'Instant game and mobile recharge',
    'recharge.select_operator': 'Select Operator',
    'recharge.select_amount': 'Select Amount',
    'recharge.phone_number': 'Phone Number',
    'recharge.order_summary': 'Order Summary',
    'recharge.operator': 'Operator',
    'recharge.amount': 'Amount',
    'recharge.price': 'Price',
    'recharge.confirm': 'Confirm',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Users',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.payments': 'Payments',
    'admin.wallets': 'Wallets',
    'admin.settings': 'Settings',
    'admin.notifications': 'Notifications',
    'admin.codes': 'Codes',
    'admin.giftcards': 'Gift Cards',
    'admin.offers': 'Offers',
    'admin.social': 'Social Media',
    'admin.chatbot': 'Chatbot',
    'admin.sections': 'Sections',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.shop': 'Boutique',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.support': 'Support',
    'nav.faq': 'FAQ',
    'nav.topup': 'Recharge de jeux',
    'nav.giftcards': 'Cartes cadeaux',
    'nav.cdkeys': 'Clés CD',
    'nav.gamecards': 'Abonnements',
    'nav.recharge': 'Recharge rapide',
    'nav.wishlist': 'Favoris',
    'nav.cart': 'Panier',
    'nav.login': 'Connexion',
    'nav.register': 'S\'inscrire',
    'nav.logout': 'Déconnexion',
    'nav.search': 'Rechercher',
    'nav.search_placeholder': 'Rechercher recharge, cartes cadeaux...',
    'nav.dashboard': 'Tableau',
    'nav.seller_dashboard': 'Tableau vendeur',
    'nav.currency': 'Devise',
    'nav.language': 'Langue',
    
    // Common
    'common.add_to_cart': 'Ajouter au panier',
    'common.buy_now': 'Acheter maintenant',
    'common.out_of_stock': 'Rupture de stock',
    'common.in_stock': 'En stock',
    'common.only_left': 'restant',
    'common.quick_view': 'Aperçu rapide',
    'common.view_all': 'Voir tout',
    'common.total': 'Total',
    'common.checkout': 'Paiement',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.continue': 'Continuer',
    'common.loading': 'Chargement...',
    'common.no_results': 'Aucun résultat',
    'common.search_results': 'Résultats de recherche',
    'common.secure_payment': 'Paiements sécurisés 100%',
    'common.copied': 'Copié',
    'common.share': 'Partager',
    
    // Product
    'product.price': 'Prix',
    'product.platform': 'Plateforme',
    'product.delivery': 'Livraison',
    'product.stock': 'Stock',
    'product.rating': 'Évaluation',
    'product.reviews': 'Avis',
    'product.description': 'Description',
    'product.seller': 'Vendeur',
    'product.quantity': 'Quantité',
    'product.discount': 'Réduction',
    
    // Auth
    'auth.login_title': 'Connexion',
    'auth.login_desc': 'Bon retour! Connectez-vous',
    'auth.register_title': 'Créer un compte',
    'auth.register_desc': 'Rejoignez CTGPRO',
    'auth.email_or_phone': 'Email ou téléphone',
    'auth.password': 'Mot de passe',
    'auth.confirm_password': 'Confirmer',
    'auth.remember_me': 'Se souvenir',
    'auth.forgot_password': 'Mot de passe oublié?',
    'auth.no_account': 'Pas de compte?',
    'auth.have_account': 'Déjà un compte?',
    'auth.full_name': 'Nom complet',
    'auth.phone': 'Téléphone',
    'auth.reset_password': 'Réinitialiser le mot de passe',
    'auth.reset_password_desc': 'Entrez votre nouveau mot de passe',
    
    // Profile
    'profile.title': 'Profil',
    'profile.personal_info': 'Informations personnelles',
    'profile.full_name': 'Nom complet',
    'profile.phone': 'Numéro de téléphone',
    'profile.email': 'Adresse e-mail',
    'profile.address': 'Adresse',
    'profile.street': 'Rue',
    'profile.city': 'Ville',
    'profile.state': 'Région',
    'profile.zip_code': 'Code postal',
    'profile.country': 'Pays',
    'profile.account_preferences': 'Préférences du compte',
    'profile.language': 'Langue',
    'profile.currency': 'Devise',
    'profile.theme': 'Thème',
    'profile.notifications': 'Notifications du compte',
    'profile.save_changes': 'Enregistrer les modifications',
    'profile.saving': 'Enregistrement...',
    'profile.updated_success': '✅ Profil mis à jour avec succès',
    'profile.save_error': 'Une erreur est survenue lors de l’enregistrement',
    'profile.role': 'Rôle',
    'profile.role_admin': 'Administrateur',
    'profile.role_seller': 'Vendeur',
    'profile.role_user': 'Utilisateur',
    
    // Cart
    'cart.empty': 'Panier vide',
    'cart.title': 'Panier',
    'cart.subtotal': 'Sous-total',
    'cart.discount': 'Réduction',
    'cart.coupon': 'Code promo',
    'cart.apply_coupon': 'Appliquer',
    'cart.remove_coupon': 'Supprimer',
    'cart.checkout': 'Paiement',
    
    // Orders
    'orders.title': 'Mes commandes',
    'orders.no_orders': 'Aucune commande',
    'orders.order': 'Commande',
    'orders.order_number': 'Numéro',
    'orders.date': 'Date',
    'orders.status': 'Statut',
    'orders.pending': 'En attente',
    'orders.processing': 'En traitement',
    'orders.shipped': 'Expédié',
    'orders.completed': 'Terminé',
    'orders.cancelled': 'Annulé',
    'orders.refunded': 'Remboursé',
    
    // Payment
    'payment.title': 'Méthodes de paiement',
    'payment.wallet': 'Portefeuille numérique',
    'payment.crypto': 'Cryptomonnaie',
    'payment.balance': 'Solde',
    'payment.deposit': 'Dépôt',
    'payment.withdraw': 'Retrait',
    'payment.transfer': 'Transfert',
    'payment.history': 'Historique',
    'payment.bitcoin': 'Bitcoin',
    'payment.ethereum': 'Ethereum',
    'payment.usdt': 'Tether (USDT)',
    'payment.paypal': 'PayPal',
    'payment.card': 'Carte de crédit',
    
    // Wallet
    'wallet.title': 'Mon portefeuille',
    'wallet.balance': 'Solde actuel',
    'wallet.crypto_balance': 'Solde crypto',
    'wallet.deposit': 'Dépôt',
    'wallet.withdraw': 'Retrait',
    'wallet.transactions': 'Transactions',
    'wallet.address': 'Adresse',
    'wallet.copy_address': 'Copier',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Tout marquer comme lu',
    'notifications.no_notifications': 'Aucune notification',
    'notifications.order_created': 'Nouvelle commande',
    'notifications.order_updated': 'Commande mise à jour',
    'notifications.payment_received': 'Paiement reçu',
    'notifications.payment_failed': 'Paiement échoué',
    'notifications.wallet_credited': 'Portefeuille crédité',
    'notifications.wallet_debited': 'Portefeuille débité',
    'notifications.new_message': 'Nouveau message',
    'notifications.offer_available': 'Nouvelle offre',
    
    // Footer
    'footer.quick_links': 'Liens rapides',
    'footer.support': 'Support',
    'footer.terms': 'Conditions',
    'footer.privacy': 'Confidentialité',
    'footer.refund': 'Remboursement',
    'footer.copyright': 'Tous droits réservés',
    
    // Contact
    'contact.title': 'Contactez-nous',
    'contact.desc': 'Nous sommes là pour vous aider',
    'contact.phone': 'Téléphone',
    'contact.email': 'Email',
    'contact.whatsapp': 'WhatsApp',
    'contact.send_message': 'Envoyer un message',
    'contact.message': 'Votre message',
    'contact.subject': 'Sujet',
    'contact.send': 'Envoyer',
    'contact.sent': 'Envoyé',
    'contact.thanks': 'Merci de nous contacter',
    
    // Support
    'support.title': 'Centre d\'aide',
    'support.live_chat': 'Chat en direct',
    'support.chat_desc': 'Parlez à l\'équipe',
    'support.start_chat': 'Démarrer le chat',
    
    // Recharge
    'recharge.title': 'Recharge rapide',
    'recharge.desc': 'Recharge instantanée',
    'recharge.select_operator': 'Choisir l\'opérateur',
    'recharge.select_amount': 'Choisir le montant',
    'recharge.phone_number': 'Numéro de téléphone',
    'recharge.order_summary': 'Résumé',
    'recharge.operator': 'Opérateur',
    'recharge.amount': 'Montant',
    'recharge.price': 'Prix',
    'recharge.confirm': 'Confirmer',
    
    // Admin
    'admin.dashboard': 'Tableau de bord',
    'admin.users': 'Utilisateurs',
    'admin.products': 'Produits',
    'admin.orders': 'Commandes',
    'admin.payments': 'Paiements',
    'admin.wallets': 'Portefeuilles',
    'admin.settings': 'Paramètres',
    'admin.notifications': 'Notifications',
    'admin.codes': 'Codes',
    'admin.giftcards': 'Cartes cadeaux',
    'admin.offers': 'Offres',
    'admin.social': 'Réseaux sociaux',
    'admin.chatbot': 'Chatbot',
    'admin.sections': 'Sections',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ctgpro_language') || 'ar';
  });

  const { registerRestoreHandler, user } = useAuth();
  const userRef = useRef(user);

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('ctgpro_currency') || 'USD';
  });

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ctgpro_language', language);
    const currentLanguage = SUPPORTED_LANGUAGES[language];
    document.documentElement.dir = currentLanguage?.dir || 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ctgpro_currency', currency);
  }, [currency]);

  useEffect(() => {
    if (!registerRestoreHandler) return;

    const handler = () => {
      const preferences = userRef.current?.preferences;
      if (preferences?.language && SUPPORTED_LANGUAGES[preferences.language]) {
        setLanguage(preferences.language);
      }
      if (preferences?.currency && SUPPORTED_CURRENCIES[preferences.currency]) {
        setCurrency(preferences.currency);
      }
    };

    const unregister = registerRestoreHandler(handler);
    return unregister;
  }, [registerRestoreHandler]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const formatCurrency = (amount) => {
    const rates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      DZD: 135.0,
      SAR: 3.75,
      AED: 3.67,
      BTC: 0.000015,
      ETH: 0.00023,
      USDT: 1,
    };
    
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      DZD: 'دج',
      SAR: 'ر.س',
      AED: 'د.إ',
      BTC: '₿',
      ETH: 'Ξ',
      USDT: '₮',
    };

    const rate = rates[currency] || 1;
    const symbol = symbols[currency] || '$';
    const converted = amount * rate;

    if (currency === 'BTC' || currency === 'ETH') {
      return `${symbol}${converted.toFixed(6)}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  const getCurrencySymbol = () => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      DZD: 'دج',
      SAR: 'ر.س',
      AED: 'د.إ',
      BTC: '₿',
      ETH: 'Ξ',
      USDT: '₮',
    };
    return symbols[currency] || '$';
  };

  const getCurrencyCode = () => currency;
  const getLanguageCode = () => language;
  
  const getLanguageName = () => {
    return SUPPORTED_LANGUAGES[language]?.name || 'العربية';
  };
  
  const getLanguageFlag = () => {
    return SUPPORTED_LANGUAGES[language]?.flag || '🌐';
  };
  
  const getCurrencyFlag = () => {
    const flags = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      DZD: '🇩🇿',
      SAR: '🇸🇦',
      AED: '🇦🇪',
      BTC: '₿',
      ETH: 'Ξ',
      USDT: '₮',
    };
    return flags[currency] || '💵';
  };

  const value = {
    language,
    setLanguage,
    currency,
    setCurrency,
    t,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyCode,
    getLanguageCode,
    getLanguageName,
    getLanguageFlag,
    getCurrencyFlag,
    SUPPORTED_CURRENCIES,
    SUPPORTED_LANGUAGES,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};