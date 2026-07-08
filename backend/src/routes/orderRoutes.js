const express = require('express');
const {
	createOrder,
	getUserOrders,
	getOrder,
	cancelOrder,
	validateRechargeAccount,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/validate-recharge', validateRechargeAccount);
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;