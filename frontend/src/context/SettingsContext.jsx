import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const resolveTheme = (theme) => {
  if (theme === 'light' || theme === 'dark') return theme;
  if (theme === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }
  return 'dark';
};

const addScript = ({ id, src, innerHTML, async = true }) => {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = async;
  if (src) script.src = src;
  if (innerHTML) script.innerHTML = innerHTML;
  document.head.appendChild(script);
};

const injectFacebookPixel = (pixelId) => {
  if (!pixelId || document.getElementById('fb-pixel-init')) return;

  addScript({
    id: 'fb-pixel-init',
    innerHTML: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${pixelId}');fbq('track', 'PageView');`
  });
};

const injectTikTokPixel = (pixelId) => {
  if (!pixelId || document.getElementById('tiktok-pixel-init')) return;

  addScript({
    id: 'tiktok-pixel-init',
    innerHTML: `!function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { var e = ttq._i[t] || []; return e }; ttq.load = function (e, n) { var i = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {}; var o = document.createElement('script'); o.type = 'text/javascript'; o.async = true; o.src = i + '?sdkid=' + e + '&lib=' + t; var a = document.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a); };
  ttq.load('${pixelId}'); ttq.page(); }(window, document, 'ttq');`
  });
};

const injectGoogleAnalytics = (analyticsId) => {
  if (!analyticsId || document.getElementById('ga-script')) return;

  addScript({
    id: 'ga-script',
    src: `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`,
  });
  addScript({
    id: 'ga-init',
    innerHTML: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${analyticsId}');`,
  });
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/store');
        setSettings(response.data.settings || response.data.store || {});
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;

    // Inject analytics when available
    if (settings.social) {
      injectFacebookPixel(settings.social.facebookPixelId);
      injectTikTokPixel(settings.social.tiktokPixelId);
      injectGoogleAnalytics(settings.social.googleAnalyticsId);
    }

    // Apply appearance settings to document as CSS variables / attributes
    const appearance = settings.appearance || {};
    try {
      if (appearance.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', appearance.primaryColor);
      }
      if (appearance.productGridColumns) {
        document.documentElement.style.setProperty('--product-grid-columns', appearance.productGridColumns);
      }
      if (appearance.pageLayout) {
        document.documentElement.setAttribute('data-page-layout', appearance.pageLayout);
      }

      const userTheme = localStorage.getItem('ctgpro_theme');
      const resolvedTheme = resolveTheme(userTheme || appearance.theme || 'dark');
      if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.style.colorScheme = resolvedTheme;
      }
    } catch (err) {
      console.error('Error applying appearance settings:', err);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
