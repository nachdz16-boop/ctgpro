export const CATEGORIES = {
  TOPUP: 'topup',
  GIFTCARDS: 'giftcards',
  CDKEYS: 'cdkeys',
  GAMECARDS: 'gamecards',
  RECHARGE: 'recharge',
};

export const CATEGORY_LABELS = {
  [CATEGORIES.TOPUP]: 'شحن ألعاب',
  [CATEGORIES.GIFTCARDS]: 'بطاقات هدايا',
  [CATEGORIES.CDKEYS]: 'مفاتيح CD',
  [CATEGORIES.GAMECARDS]: 'اشتراكات',
  [CATEGORIES.RECHARGE]: 'شحن رصيد',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'قيد المعالجة',
  [ORDER_STATUS.PROCESSING]: 'جاري التجهيز',
  [ORDER_STATUS.SHIPPED]: 'تم الشحن',
  [ORDER_STATUS.COMPLETED]: 'مكتمل',
  [ORDER_STATUS.FAILED]: 'فشل',
  [ORDER_STATUS.REFUNDED]: 'مسترجع',
  [ORDER_STATUS.CANCELLED]: 'ملغي',
};

export const USER_ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.USER]: 'مستخدم',
  [USER_ROLES.SELLER]: 'بائع',
  [USER_ROLES.ADMIN]: 'مدير',
};

export const DZ_OPERATORS = [
  { id: 'djezzy', name: 'Djezzy', code: '07', color: '#006233', icon: 'fa-solid fa-tower-cell' },
  { id: 'ooredoo', name: 'Ooredoo', code: '06', color: '#d21034', icon: 'fa-solid fa-signal' },
  { id: 'mobilis', name: 'Mobilis', code: '05', color: '#0072ce', icon: 'fa-solid fa-satellite' },
];

export const DZD_TO_USD = 0.0074;