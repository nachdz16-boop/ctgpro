export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' سنة';
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' شهر';
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' يوم';
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' ساعة';
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' دقيقة';
  return 'الآن';
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateAlgerianPhone = (phone) => {
  return /^(0[567])\d{8}$/.test(phone);
};

export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const safeJsonParse = (json, defaultValue = null) => {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
};