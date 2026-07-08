const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter = null;
const isEmailConfigured =
  config.email.enabled &&
  Boolean(config.email.host) &&
  Boolean(config.email.port) &&
  Boolean(config.email.user) &&
  Boolean(config.email.pass);

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: { user: config.email.user, pass: config.email.pass },
  });
}

const buildEmailError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const sendEmail = async (to, subject, html, options = {}) => {
  const { required = false, context = 'email' } = options;

  if (!transporter) {
    const reason = !config.email.enabled
      ? 'Email service disabled by EMAIL_ENABLED=false.'
      : 'Email service not configured. Missing SMTP credentials.';

    if (required) {
      throw buildEmailError('EMAIL_NOT_CONFIGURED', `${reason} Unable to send ${context}.`);
    }

    console.warn(reason);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    const isAuthError = error.code === 'EAUTH' || error.responseCode === 535;
    if (isAuthError) {
      console.error('SMTP authentication failed. Check EMAIL_USER and EMAIL_PASS (App Password for Gmail).');
      throw buildEmailError(
        'SMTP_AUTH_FAILED',
        'SMTP authentication failed. Verify EMAIL_USER and EMAIL_PASS (use App Password with Gmail).'
      );
    }

    console.error('Email send error:', error.message);
    throw buildEmailError('EMAIL_SEND_FAILED', error.message || 'Failed to send email');
  }
};

exports.sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0c15; color: #f1f5f9; border-radius: 12px;">
      <h1 style="color: #a855f7;">مرحباً بك في CTGPRO!</h1>
      <p>مرحباً ${name}،</p>
      <p>شكراً لتسجيلك في CTGPRO - منصة الشحن الرقمي الأولى في الشرق الأوسط.</p>
      <p>نتمنى لك تجربة تسوق ممتعة!</p>
      <p style="margin-top: 30px; color: #8b9ab0; font-size: 12px;">© 2024 CTGPRO - جميع الحقوق محفوظة</p>
    </div>
  `;
  return sendEmail(email, 'مرحباً بك في CTGPRO', html, { required: false, context: 'welcome email' });
};

exports.sendOrderConfirmation = async (email, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #2a2a3a;">${item.name.ar}</td>
      <td style="padding: 8px; border-bottom: 1px solid #2a2a3a; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #2a2a3a; text-align: left;">$${item.price}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0c15; color: #f1f5f9; border-radius: 12px;">
      <h1 style="color: #a855f7;">✅ تأكيد الطلب</h1>
      <p>رقم الطلب: <strong>#${order.orderNumber}</strong></p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <thead>
          <tr style="background: #1a2236;">
            <th style="padding: 10px; text-align: right;">المنتج</th>
            <th style="padding: 10px; text-align: center;">الكمية</th>
            <th style="padding: 10px; text-align: left;">السعر</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: left; font-weight: bold;">المجموع</td>
            <td style="padding: 10px; text-align: left; font-weight: bold; color: #a855f7;">$${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top: 30px; color: #8b9ab0; font-size: 12px;">© 2024 CTGPRO - جميع الحقوق محفوظة</p>
    </div>
  `;
  return sendEmail(email, `تأكيد الطلب #${order.orderNumber}`, html, { required: false, context: 'order confirmation' });
};

exports.sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0c15; color: #f1f5f9; border-radius: 12px;">
      <h1 style="color: #a855f7;">🔐 استعادة كلمة المرور</h1>
      <p>لقد طلبت استعادة كلمة المرور الخاصة بك.</p>
      <div style="margin: 20px 0; text-align: center;">
        <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #a855f7, #7c3aed); color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
          إعادة تعيين كلمة المرور
        </a>
      </div>
      <p style="color: #8b9ab0; font-size: 12px;">هذا الرابط صالح لمدة ساعة واحدة.</p>
      <p style="margin-top: 30px; color: #8b9ab0; font-size: 12px;">© 2024 CTGPRO - جميع الحقوق محفوظة</p>
    </div>
  `;
  return sendEmail(email, 'استعادة كلمة المرور', html, { required: true, context: 'password reset email' });
};