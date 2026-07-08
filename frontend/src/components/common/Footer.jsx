import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FaGamepad, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaWhatsapp, 
  FaShieldAlt, 
  FaTruck, 
  FaHeadset,
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock
} from 'react-icons/fa';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] mt-8">
      <div className="container-fluid py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                <FaGamepad className="text-white text-lg" />
              </div>
              <div className="font-black text-xl">CTG<span className="text-primary">PRO</span></div>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">أكبر منصة رقمية للشحن الفوري والبطاقات في الشرق الأوسط. نقدم خدماتنا بجودة عالية وسرعة فائقة.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer noopener" className="w-9 h-9 rounded-lg bg-[var(--bg-input)] hover:bg-primary/20 text-[var(--text-secondary)] hover:text-primary transition-all flex items-center justify-center"><FaFacebook /></a>
              <a href="https://x.com" target="_blank" rel="noreferrer noopener" className="w-9 h-9 rounded-lg bg-[var(--bg-input)] hover:bg-primary/20 text-[var(--text-secondary)] hover:text-primary transition-all flex items-center justify-center"><FaTwitter /></a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer noopener" className="w-9 h-9 rounded-lg bg-[var(--bg-input)] hover:bg-primary/20 text-[var(--text-secondary)] hover:text-primary transition-all flex items-center justify-center"><FaInstagram /></a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer noopener" className="w-9 h-9 rounded-lg bg-[var(--bg-input)] hover:bg-primary/20 text-[var(--text-secondary)] hover:text-primary transition-all flex items-center justify-center"><FaYoutube /></a>
              <a href="https://www.whatsapp.com" target="_blank" rel="noreferrer noopener" className="w-9 h-9 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-all flex items-center justify-center"><FaWhatsapp /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3">{t('footer.quick_links')}</h4>
            <ul className="space-y-2 text-[var(--text-secondary)] text-sm">
              <li><Link to="/" className="hover:text-primary transition">{t('nav.home')}</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition">{t('nav.shop')}</Link></li>
              <li><Link to="/recharge" className="hover:text-primary transition">{t('nav.recharge')}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition">{t('nav.about')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3">{t('footer.support')}</h4>
            <ul className="space-y-2 text-[var(--text-secondary)] text-sm">
              <li><Link to="/faq" className="hover:text-primary transition">{t('nav.faq')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition">{t('nav.contact')}</Link></li>
              <li><Link to="/support" className="hover:text-primary transition">{t('nav.support')}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] mt-6 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--text-muted)] text-xs">
          <p>© {currentYear} CTGPRO - {t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <span><FaShieldAlt className="inline ml-1 text-emerald-500" /> SSL Secured</span>
            <span><FaTruck className="inline ml-1 text-primary" /> شحن فوري</span>
            <span><FaHeadset className="inline ml-1 text-primary" /> دعم 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;