const Ad = require('../models/Ad');

exports.getAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    res.json({ success: true, ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const ad = await Ad.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    res.json({ success: true, ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    res.json({ success: true, message: 'تم حذف الإعلان بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAdStatus = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    ad.isActive = !ad.isActive;
    await ad.save();
    res.json({ success: true, ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdCampaigns = async (req, res) => {
  try {
    const campaigns = [];
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdStats = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    const { action } = req.body;
    if (action === 'view') ad.views += 1;
    if (action === 'click') ad.clicks += 1;
    await ad.save();
    res.json({ success: true, ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
