const mongoose = require('mongoose');

const SocialSettingsSchema = new mongoose.Schema({
  facebookPixelId: String,
  tiktokPixelId: String,
  googleAnalyticsId: String,
  
  facebookUrl: String,
  twitterUrl: String,
  instagramUrl: String,
  youtubeUrl: String,
  discordUrl: String,
  tiktokUrl: String,
  telegramUrl: String,
  linkedinUrl: String,
  
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  
  contactEmail: String,
  contactPhone: String,
  contactAddress: String,
  
  googleMapsEmbed: String,
}, { timestamps: true });

module.exports = mongoose.model('SocialSettings', SocialSettingsSchema);