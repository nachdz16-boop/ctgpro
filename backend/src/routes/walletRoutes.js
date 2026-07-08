const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getWallet,
  getTransactions,
  deposit,
  withdraw,
} = require('../controllers/walletController');

const router = express.Router();

router.use(protect);
router.get('/', getWallet);
router.get('/transactions', getTransactions);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);

module.exports = router;
