const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDisputes,
  getDispute,
  updateDispute,
  addDisputeMessage,
  deleteDispute,
  createDispute,
  getMyDisputes,
  getMyDispute,
} = require('../controllers/disputeController');

const router = express.Router();

router.use(protect);

// User dispute endpoints
router.post('/', createDispute);
router.get('/me', getMyDisputes);
router.get('/me/:id', getMyDispute);

// Admin dispute endpoints
router.get('/', authorize('admin'), getDisputes);
router.get('/:id', authorize('admin'), getDispute);
router.put('/:id', authorize('admin'), updateDispute);
router.post('/:id/messages', authorize('admin'), addDisputeMessage);
router.delete('/:id', authorize('admin'), deleteDispute);

module.exports = router;
