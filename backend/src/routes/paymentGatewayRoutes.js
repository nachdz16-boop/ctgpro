const express = require('express');
const { getActivePaymentGateways } = require('../controllers/adminController');

const router = express.Router();

router.get('/', getActivePaymentGateways);

module.exports = router;
