const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
  getAdCampaigns,
  updateAdStats,
} = require('../controllers/adminAdController');

const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/ads', getAds);
router.get('/ads/campaigns', getAdCampaigns);
router.get('/ads/:id', getAd);
router.post('/ads', createAd);
router.put('/ads/:id', updateAd);
router.delete('/ads/:id', deleteAd);
router.patch('/ads/:id/toggle', toggleAdStatus);
router.post('/ads/:id/stats', updateAdStats);

module.exports = router;
