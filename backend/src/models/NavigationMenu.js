const mongoose = require('mongoose');

const NavigationMenuSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
  },
  location: {
    type: String,
    enum: ['header', 'footer', 'sidebar', 'mobile'],
    required: true,
  },
  items: [{
    label: {
      ar: String,
      en: String,
      fr: String,
    },
    url: String,
    icon: String,
    target: {
      type: String,
      enum: ['_self', '_blank'],
      default: '_self',
    },
    children: [this],
    order: Number,
    active: Boolean,
  }],
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('NavigationMenu', NavigationMenuSchema);