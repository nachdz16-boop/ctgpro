const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter = null;

if (config.email.user && config.email.pass) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: { user: config.email.user, pass: config.email.pass },
  });
}

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log('Email service not configured. Skipping email send.');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"CTGPRO" <${config.email.user}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
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
  return sendEmail(email, 'مرحباً بك في CTGPRO', html);
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
  return sendEmail(email, `تأكيد الطلب #${order.orderNumber}`, html);
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
  return sendEmail(email, 'استعادة كلمة المرور', html);
};